process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://fake:fake@localhost:5432/fake';

const cron = require('node-cron');

const ARABIC_STOP_REASON = 'توقف غير مكتمل — أعد الإرسال من سجل الحملات';
const ARABIC_NO_SNAPSHOT_REASON = 'قائمة الحملة غير محفوظة — أعد اختيار القائمة';

const createResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

const mockPrisma = {
  broadcastCampaign: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  broadcastCampaignRun: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  broadcastCampaignSnapshot: {
    count: jest.fn(),
    findMany: jest.fn(),
    createMany: jest.fn(),
  },
  broadcastRecipient: {
    findMany: jest.fn(),
    count: jest.fn(),
    createMany: jest.fn(),
    updateMany: jest.fn(),
  },
  conversation: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  customer: {
    findMany: jest.fn(),
  },
  customerList: {
    findFirst: jest.fn(),
  },
  whatsAppSession: {
    findFirst: jest.fn(),
  },
  broadcastSettings: {
    findUnique: jest.fn(),
  },
};

jest.mock('../../services/sharedDatabase', () => ({
  getSharedPrismaClient: () => mockPrisma,
  getSharedPrismaClientAsync: async () => mockPrisma,
  safeQuery: async (fn) => fn(mockPrisma),
  executeWithRetry: async (fn) => fn(mockPrisma),
  isInConnectionLimitCooldown: () => false,
  getCooldownInfo: () => ({ remainingMinutes: 0 }),
}));

jest.mock('../../services/socketService', () => ({
  getIO: () => null,
}));

jest.mock('../../utils/statsRecorder', () => ({
  recordSentMessageStat: jest.fn(),
}));

jest.mock('../../utils/allFunctions', () => ({
  sendFacebookMessage: jest.fn(),
}));

jest.mock('../../services/whatsapp', () => ({
  WhatsAppMessageHandler: {
    sendTemplateMessage: jest.fn(),
  },
}));

jest.mock('../../services/whatsapp/providers/MetaCloudProvider', () => ({
  listTemplates: jest.fn().mockResolvedValue([]),
}));

const broadcastScheduler = require('../../services/broadcastSchedulerService');
const broadcastController = require('../../controller/broadcastController');

describe('Broadcast Runtime Hardening Tests', () => {
  const companyId = 'comp_test_hardening';
  let setImmediateSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.broadcastSettings.findUnique.mockResolvedValue({ messagesPerMinute: 60 });
    setImmediateSpy = jest.spyOn(global, 'setImmediate').mockImplementation(() => {});
    broadcastScheduler.stop();
  });

  afterEach(() => {
    if (setImmediateSpy) setImmediateSpy.mockRestore();
    broadcastScheduler.stop();
  });

  describe('1. Startup Recovery (resumeInterruptedCampaigns)', () => {
    it('marks a sending campaign at boot as failed with the Arabic reason and sends NOTHING', async () => {
      const stuckCampaign = {
        id: 'camp_stuck_boot',
        name: 'Stuck Campaign At Boot',
        status: 'sending',
        companyId,
      };

      mockPrisma.broadcastCampaign.findMany.mockResolvedValue([stuckCampaign]);
      mockPrisma.broadcastCampaign.update.mockResolvedValue({ ...stuckCampaign, status: 'failed' });
      mockPrisma.broadcastCampaignRun.updateMany.mockResolvedValue({ count: 1 });

      const sendScheduledCampaignSpy = jest.spyOn(broadcastScheduler, 'sendScheduledCampaign').mockResolvedValue();

      await broadcastScheduler.resumeInterruptedCampaigns();

      // Assert campaign marked failed with exact Arabic reason
      expect(mockPrisma.broadcastCampaign.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'camp_stuck_boot' },
          data: expect.objectContaining({
            status: 'failed',
            pausedReason: ARABIC_STOP_REASON,
          }),
        })
      );

      // Assert any running run row was closed as stopped
      expect(mockPrisma.broadcastCampaignRun.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { campaignId: 'camp_stuck_boot', status: 'running' },
          data: expect.objectContaining({
            status: 'stopped',
            stopReason: ARABIC_STOP_REASON,
          }),
        })
      );

      // Assert NOTHING was sent
      expect(sendScheduledCampaignSpy).not.toHaveBeenCalled();

      sendScheduledCampaignSpy.mockRestore();
    });
  });

  describe('2. Periodic Reaper', () => {
    it('picks only campaigns older than 15 minutes and ignores a fresh sending campaign', async () => {
      const now = new Date('2026-10-27T12:00:00Z');
      const twentyMinAgo = new Date(now.getTime() - 20 * 60 * 1000);
      const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);

      const oldCampaign = {
        id: 'camp_old',
        name: 'Old Stuck Campaign',
        status: 'sending',
        updatedAt: twentyMinAgo,
        companyId,
      };

      const freshCampaign = {
        id: 'camp_fresh',
        name: 'Fresh Sending Campaign',
        status: 'sending',
        updatedAt: fiveMinAgo,
        companyId,
      };

      // Faithful mock of Prisma where clause: only matches if updatedAt < fifteenMinutesAgo
      mockPrisma.broadcastCampaign.findMany.mockImplementation(({ where }) => {
        const threshold = where?.updatedAt?.lt;
        const results = [];
        if (oldCampaign.updatedAt < threshold) results.push(oldCampaign);
        if (freshCampaign.updatedAt < threshold) results.push(freshCampaign);
        return Promise.resolve(results);
      });

      mockPrisma.broadcastCampaign.update.mockResolvedValue({ ...oldCampaign, status: 'failed' });
      mockPrisma.broadcastCampaignRun.updateMany.mockResolvedValue({ count: 1 });

      const sendScheduledCampaignSpy = jest.spyOn(broadcastScheduler, 'sendScheduledCampaign').mockResolvedValue();

      expect(typeof broadcastScheduler.reapStuckCampaigns).toBe('function');
      const reapedCount = await broadcastScheduler.reapStuckCampaigns(now);

      expect(reapedCount).toBe(1);
      expect(mockPrisma.broadcastCampaign.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'camp_old' },
          data: expect.objectContaining({
            status: 'failed',
            pausedReason: ARABIC_STOP_REASON,
          }),
        })
      );

      // Never sends from reaper
      expect(sendScheduledCampaignSpy).not.toHaveBeenCalled();

      sendScheduledCampaignSpy.mockRestore();
    });
  });

  describe('3. createCampaign with sendNow', () => {
    it('createCampaign with sendNow does NOT produce status=sending', async () => {
      const req = {
        user: { companyId, id: 'user_1' },
        body: {
          name: 'Instant Campaign',
          message: 'Hello Customer',
          targetAudience: 'all',
          channel: 'whatsapp',
          sendNow: true,
          audienceMode: 'fixed',
        },
      };
      const res = createResponse();

      mockPrisma.broadcastCampaign.create.mockImplementation(({ data }) => Promise.resolve({ ...data, company: { name: 'Test Co' } }));

      await broadcastController.createCampaign(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(mockPrisma.broadcastCampaign.create).toHaveBeenCalled();
      const createdData = mockPrisma.broadcastCampaign.create.mock.calls[0][0].data;

      expect(createdData.status).not.toBe('sending');
      expect(createdData.status).toBe('draft');
    });
  });

  describe('4. /send guards and recipient reuse', () => {
    it('/send on an already sending campaign (within 15 minutes) returns 409', async () => {
      const recentDate = new Date(Date.now() - 3 * 60 * 1000); // 3 minutes ago
      const activeSendingCampaign = {
        id: 'camp_sending_active',
        companyId,
        channel: 'whatsapp',
        status: 'sending',
        updatedAt: recentDate,
        whatsAppSessionId: 'sess_1',
      };

      mockPrisma.broadcastCampaign.findFirst.mockResolvedValue(activeSendingCampaign);

      const req = {
        user: { companyId },
        params: { campaignId: 'camp_sending_active' },
        body: {},
      };
      const res = createResponse();

      await broadcastController.sendCampaign(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'الحملة قيد الإرسال بالفعل',
        })
      );
    });

    it('/send returns 400 when fixed targeting has no snapshot', async () => {
      const campaign = {
        id: 'camp_fixed_no_snapshot',
        companyId,
        channel: 'whatsapp',
        status: 'draft',
        audienceMode: 'fixed',
        targetAudience: 'some_list_id',
        whatsAppSessionId: 'sess_1',
      };

      mockPrisma.broadcastCampaign.findFirst.mockResolvedValue(campaign);
      mockPrisma.broadcastRecipient.findMany.mockResolvedValue([]);
      mockPrisma.broadcastCampaignSnapshot.count.mockResolvedValue(0);

      const req = {
        user: { companyId },
        params: { campaignId: 'camp_fixed_no_snapshot' },
        body: {},
      };
      const res = createResponse();

      await broadcastController.sendCampaign(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: ARABIC_NO_SNAPSHOT_REASON,
        })
      );
    });

    it('/send reuses pending recipients without calling createMany on interrupted/re-sent campaign', async () => {
      const campaign = {
        id: 'camp_interrupted',
        companyId,
        channel: 'whatsapp',
        status: 'failed',
        whatsAppSessionId: 'sess_1',
      };

      const existingRecipients = [
        { id: 'rec_1', campaignId: campaign.id, conversationId: 'conv_1', status: 'sent', customerPhone: '111', customerName: 'User 1' },
        { id: 'rec_2', campaignId: campaign.id, conversationId: 'conv_2', status: 'pending', customerPhone: '222', customerName: 'User 2' },
      ];

      mockPrisma.broadcastCampaign.findFirst.mockResolvedValue(campaign);
      mockPrisma.broadcastRecipient.findMany.mockResolvedValue(existingRecipients);
      mockPrisma.conversation.findMany.mockResolvedValue([
        { id: 'conv_2', customer: { phone: '222', firstName: 'User 2' } }
      ]);
      mockPrisma.broadcastCampaign.update.mockResolvedValue({ ...campaign, status: 'sending' });

      const req = {
        user: { companyId },
        params: { campaignId: 'camp_interrupted' },
        body: {},
      };
      const res = createResponse();

      await broadcastController.sendCampaign(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          recipientCount: 2,
          sentCount: 1,
        })
      );
      // Assert createMany was NOT called because recipients are reused
      expect(mockPrisma.broadcastRecipient.createMany).not.toHaveBeenCalled();
    });
  });

  describe('5. Scheduler start idempotency', () => {
    it('scheduler start is idempotent (calling twice does not register two crons)', () => {
      const cronScheduleSpy = jest.spyOn(cron, 'schedule');

      broadcastScheduler.start();
      broadcastScheduler.start();

      expect(cronScheduleSpy).toHaveBeenCalledTimes(1);

      cronScheduleSpy.mockRestore();
    });
  });
});
