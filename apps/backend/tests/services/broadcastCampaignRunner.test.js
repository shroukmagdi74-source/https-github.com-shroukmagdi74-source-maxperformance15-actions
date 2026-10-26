const { runCampaign } = require('../../services/broadcastCampaignRunner');
const audienceResolver = require('../../services/broadcastAudienceResolver');

describe('broadcastCampaignRunner', () => {
  const companyId = 'comp_runner_123';
  const campaignId = 'camp_runner_abc';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('duplicate-run prevention (atomic claim mutex)', () => {
    it('ensures exactly one of two concurrent calls claims and sends, while the other returns not_claimed', async () => {
      const now = new Date('2026-10-26T10:00:00Z');
      let campaignState = {
        id: campaignId,
        companyId,
        audienceMode: 'dynamic',
        status: 'active',
        recurrence: 'daily',
        recurrenceInterval: 1,
        sendHour: 10,
        sendMinute: 0,
        nextRunAt: new Date('2026-10-26T09:00:00Z'), // <= now
        lastRunAt: null,
        maxRecipientsPerRun: 10,
        failureRateThreshold: 5,
      };

      let claimCalls = 0;
      const mockPrisma = {
        broadcastCampaign: {
          findUnique: jest.fn().mockImplementation(() => Promise.resolve({ ...campaignState })),
          updateMany: jest.fn().mockImplementation(({ where, data }) => {
            claimCalls++;
            // Faithful Postgres semantics: the UPDATE only matches rows that satisfy `where`.
            // The mutex must come from the RUNNER's where clause, not from this mock.
            const matches =
              (!where.id || where.id === campaignState.id) &&
              (!where.status || where.status === campaignState.status) &&
              (!where.nextRunAt ||
                where.nextRunAt.lte === undefined ||
                campaignState.nextRunAt <= where.nextRunAt.lte);
            if (!matches) return Promise.resolve({ count: 0 });
            campaignState = {
              ...campaignState,
              nextRunAt: data.nextRunAt,
              lastRunAt: data.lastRunAt,
            };
            return Promise.resolve({ count: 1 });
          }),
          update: jest.fn().mockResolvedValue({}),
        },
        broadcastCampaignRun: {
          create: jest.fn().mockResolvedValue({ id: 'run_1' }),
          update: jest.fn().mockResolvedValue({}),
        },
        broadcastRecipient: {
          create: jest.fn().mockResolvedValue({ id: 'rec_1' }),
          update: jest.fn().mockResolvedValue({}),
          findMany: jest.fn().mockResolvedValue([]),
        },
        broadcastCampaignSnapshot: {
          findMany: jest.fn().mockResolvedValue([]),
        },
        conversation: {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({ id: 'conv_generated' }),
        },
        customer: {
          findMany: jest.fn().mockResolvedValue([
            { id: 'c1', phone: '01011111111', firstName: 'C1' },
            { id: 'c2', phone: '01022222222', firstName: 'C2' },
          ]),
        },
      };

      const sendFn = jest.fn().mockResolvedValue({ messageId: 'msg_123' });

      // Run two concurrent calls
      const [res1, res2] = await Promise.all([
        runCampaign({ campaignId, trigger: 'cron', now, sendFn, prisma: mockPrisma }),
        runCampaign({ campaignId, trigger: 'cron', now, sendFn, prisma: mockPrisma }),
      ]);

      const results = [res1, res2];
      const claimedResult = results.find((r) => r.ran === true);
      const uncliamedResult = results.find((r) => r.ran === false);

      expect(claimedResult).toBeDefined();
      expect(uncliamedResult).toBeDefined();
      expect(uncliamedResult.reason).toBe('not_claimed');

      // Exactly one runner executed the sendFn
      expect(sendFn).toHaveBeenCalledTimes(2); // 2 recipients for the single winner
    });
  });

  describe('failure-rate auto-stop', () => {
    it('aborts the send loop, sets run status stopped and pauses campaign when failure rate exceeds threshold', async () => {
      const now = new Date('2026-10-26T10:00:00Z');
      const campaignState = {
        id: campaignId,
        companyId,
        audienceMode: 'dynamic',
        status: 'active',
        recurrence: 'daily',
        recurrenceInterval: 1,
        sendHour: 10,
        sendMinute: 0,
        nextRunAt: now,
        lastRunAt: null,
        maxRecipientsPerRun: 20,
        failureRateThreshold: 5, // 5%
      };

      // 15 total candidates
      const customers = Array.from({ length: 15 }, (_, i) => ({
        id: `c_${i}`,
        phone: `0100000000${i.toString().padStart(2, '0')}`,
        firstName: `User ${i}`,
      }));

      let runUpdatedData = null;
      let campaignUpdatedData = null;

      const mockPrisma = {
        broadcastCampaign: {
          findUnique: jest.fn().mockResolvedValue(campaignState),
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
          update: jest.fn().mockImplementation(({ data }) => {
            campaignUpdatedData = data;
            return Promise.resolve({});
          }),
        },
        broadcastCampaignRun: {
          create: jest.fn().mockResolvedValue({ id: 'run_autostop' }),
          update: jest.fn().mockImplementation(({ data }) => {
            runUpdatedData = data;
            return Promise.resolve({});
          }),
        },
        broadcastRecipient: {
          create: jest.fn().mockResolvedValue({ id: 'rec_1' }),
          update: jest.fn().mockResolvedValue({}),
          findMany: jest.fn().mockResolvedValue([]),
        },
        customer: {
          findMany: jest.fn().mockResolvedValue(customers),
        },
        conversation: {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({ id: 'conv_generated' }),
        },
      };

      // Sender fails 2 out of the first 10 sends (e.g. 1st and 2nd fail, 3-10 succeed)
      let sendCalls = 0;
      const sendFn = jest.fn().mockImplementation(async () => {
        sendCalls++;
        if (sendCalls <= 2) {
          throw new Error('Meta provider connection failed');
        }
        return { messageId: `msg_${sendCalls}` };
      });

      const res = await runCampaign({
        campaignId,
        trigger: 'cron',
        now,
        sendFn,
        prisma: mockPrisma,
      });

      expect(res.ran).toBe(true);
      expect(res.status).toBe('stopped');
      expect(res.reason).toBe('failure_rate');

      // The loop must have stopped early: 10 calls instead of all 15
      expect(sendCalls).toBe(10);
      expect(sendCalls).toBeLessThan(customers.length);

      // Verify run row
      expect(runUpdatedData.status).toBe('stopped');
      expect(runUpdatedData.stopReason).toBe('failure_rate');
      expect(runUpdatedData.sentCount).toBe(8);
      expect(runUpdatedData.failedCount).toBe(2);
      expect(runUpdatedData.failureRate).toBe(20); // 2 / 10 = 20% > 5%

      // Verify campaign was paused
      expect(campaignUpdatedData.status).toBe('paused');
      expect(campaignUpdatedData.pausedReason).toContain('Failure rate 20.0% exceeded threshold 5%');
    });
  });

  describe('clean recurring run', () => {
    it('completes successfully, logs stats matching sender log, and leaves campaign active with nextRunAt in the future', async () => {
      const now = new Date('2026-10-26T10:00:00Z');
      const campaignState = {
        id: campaignId,
        companyId,
        audienceMode: 'dynamic',
        status: 'active',
        recurrence: 'daily',
        recurrenceInterval: 1,
        sendHour: 10,
        sendMinute: 0,
        nextRunAt: now,
        lastRunAt: null,
        maxRecipientsPerRun: 10,
        failureRateThreshold: 5,
      };

      const customers = [
        { id: 'c1', phone: '01011111111', firstName: 'A' },
        { id: 'c2', phone: '01022222222', firstName: 'B' },
        { id: 'c3', phone: '01033333333', firstName: 'C' },
      ];

      let runUpdatedData = null;
      let campaignUpdatedData = null;
      let claimedNextRunAt = null;

      const mockPrisma = {
        broadcastCampaign: {
          findUnique: jest.fn().mockResolvedValue(campaignState),
          updateMany: jest.fn().mockImplementation(({ data }) => {
            claimedNextRunAt = data.nextRunAt;
            return Promise.resolve({ count: 1 });
          }),
          update: jest.fn().mockImplementation(({ data }) => {
            campaignUpdatedData = data;
            return Promise.resolve({});
          }),
        },
        broadcastCampaignRun: {
          create: jest.fn().mockResolvedValue({ id: 'run_clean' }),
          update: jest.fn().mockImplementation(({ data }) => {
            runUpdatedData = data;
            return Promise.resolve({});
          }),
        },
        broadcastRecipient: {
          create: jest.fn().mockResolvedValue({ id: 'rec_1' }),
          update: jest.fn().mockResolvedValue({}),
          findMany: jest.fn().mockResolvedValue([]),
        },
        customer: {
          findMany: jest.fn().mockResolvedValue(customers),
        },
        conversation: {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({ id: 'conv_generated' }),
        },
      };

      const sendFn = jest.fn().mockResolvedValue({ messageId: 'msg_ok' });

      const res = await runCampaign({
        campaignId,
        trigger: 'cron',
        now,
        sendFn,
        prisma: mockPrisma,
      });

      expect(res.ran).toBe(true);
      expect(res.status).toBe('completed');
      expect(res.stats.audienceCount).toBe(3);
      expect(res.stats.sentCount).toBe(3);
      expect(res.stats.failedCount).toBe(0);
      expect(res.stats.failureRate).toBe(0);

      // Run record matching sender log
      expect(runUpdatedData.sentCount).toBe(3);
      expect(runUpdatedData.failedCount).toBe(0);
      expect(runUpdatedData.status).toBe('completed');

      // Claimed nextRunAt is in the future
      expect(claimedNextRunAt).not.toBeNull();
      expect(new Date(claimedNextRunAt).getTime()).toBeGreaterThan(now.getTime());

      // Campaign remains active (status not overridden to completed or paused)
      expect(campaignUpdatedData.status).toBeUndefined();
    });
  });
});
