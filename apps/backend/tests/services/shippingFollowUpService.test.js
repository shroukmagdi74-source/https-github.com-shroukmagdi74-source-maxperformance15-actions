/**
 * @file shippingFollowUpService.test.js
 * @description Unit tests for shippingFollowUpService: delay checks, idempotency ledger, and notification flow.
 */

const shippingFollowUpService = require('../../services/shippingFollowUpService');
const WhatsAppNotificationService = require('../../services/whatsapp/WhatsAppNotificationService');
const sharedDb = require('../../services/sharedDatabase');
const TurboService = require('../../services/turboService');

describe('ShippingFollowUpService - Unit Test Suite', () => {
  let mockSendNotification;
  let mockSafeQuery;
  let mockAddTicket;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSendNotification = jest
      .spyOn(WhatsAppNotificationService, 'sendNotification')
      .mockResolvedValue({ success: true });
    mockAddTicket = jest
      .spyOn(TurboService.prototype, 'addTicket')
      .mockResolvedValue({ success: true, ticketId: 'turbo_t_1' });
  });

  afterEach(() => {
    mockSendNotification.mockRestore();
    mockAddTicket.mockRestore();
    if (mockSafeQuery) {
      mockSafeQuery.mockRestore();
    }
  });

  describe('1. buildPlan logic', () => {
    test('buildPlan returns TICKET when autoTicket is true and daysInStatus >= minDays * 2', () => {
      const order = { daysInStatus: 4 };
      const settings = { autoTicket: true, minDays: 2 };
      expect(shippingFollowUpService.buildPlan(order, settings)).toBe('TICKET');
    });

    test('buildPlan returns ALERT when daysInStatus < minDays * 2', () => {
      const order = { daysInStatus: 3 };
      const settings = { autoTicket: true, minDays: 2 };
      expect(shippingFollowUpService.buildPlan(order, settings)).toBe('ALERT');
    });

    test('buildPlan returns ALERT when autoTicket is false regardless of days', () => {
      const order = { daysInStatus: 10 };
      const settings = { autoTicket: false, minDays: 2 };
      expect(shippingFollowUpService.buildPlan(order, settings)).toBe('ALERT');
    });
  });

  describe('2. claimAlert idempotency gate (T00 §2.3)', () => {
    test('claimAlert twice for the same key => second time returns false on P2002 unique violation', async () => {
      let callCount = 0;
      mockSafeQuery = jest.spyOn(sharedDb, 'safeQuery').mockImplementation(async (cb) => {
        const dummyPrisma = {
          aiRuntimeLedger: {
            create: jest.fn().mockImplementation(() => {
              callCount++;
              if (callCount === 1) {
                return Promise.resolve({ id: 'ledger_1' });
              }
              const p2002 = new Error('Unique constraint failed on idempotencyKey');
              p2002.code = 'P2002';
              return Promise.reject(p2002);
            }),
          },
        };
        return cb(dummyPrisma);
      });

      const key = 'ship:comp_1:ord_123:SHIPPED:2026-10-28';
      const first = await shippingFollowUpService.claimAlert('comp_1', key, { test: 1 });
      expect(first).toBe(true);

      const second = await shippingFollowUpService.claimAlert('comp_1', key, { test: 1 });
      expect(second).toBe(false);
    });
  });

  describe('3. runCompany alert suppression and deduplication', () => {
    test('runCompany returns alerts: 0 if claimAlert fails (already claimed)', async () => {
      mockSafeQuery = jest.spyOn(sharedDb, 'safeQuery').mockImplementation(async (cb) => {
        const dummyPrisma = {
          company: {
            findUnique: jest.fn().mockResolvedValue({
              id: 'comp_1',
              name: 'Test Store',
              phone: '01011112222',
              settings: JSON.stringify({
                shipping_followup: { enabled: true, minDays: 2, dryRun: false },
              }),
            }),
          },
          $queryRawUnsafe: jest.fn().mockResolvedValue([
            {
              id: 'ord_1',
              orderNumber: '1001',
              status: 'SHIPPED',
              daysInStatus: 3,
              customerName: 'أحمد',
              customerPhone: '01012345678',
              lastChangeAt: new Date(),
            },
          ]),
          aiRuntimeLedger: {
            create: jest.fn().mockRejectedValue({ code: 'P2002', message: 'Unique constraint' }),
            update: jest.fn(),
          },
          aiNotification: { create: jest.fn() },
          $executeRawUnsafe: jest.fn().mockResolvedValue(1),
        };
        return cb(dummyPrisma);
      });

      const res = await shippingFollowUpService.runCompany('comp_1', { dryRun: false });
      expect(res.scanned).toBe(1);
      expect(res.alerts).toBe(0);
      expect(mockSendNotification).not.toHaveBeenCalled();
    });

    test('runCompany respects coexistence with T26 (returns skipped: OWNED_BY_T26)', async () => {
      mockSafeQuery = jest.spyOn(sharedDb, 'safeQuery').mockImplementation(async (cb) => {
        const dummyPrisma = {
          company: {
            findUnique: jest.fn().mockResolvedValue({
              id: 'comp_t26',
              settings: JSON.stringify({
                shippingAgent: { enabled: true },
                shipping_followup: { enabled: true },
              }),
            }),
          },
        };
        return cb(dummyPrisma);
      });

      const res = await shippingFollowUpService.runCompany('comp_t26');
      expect(res.skipped).toBe('OWNED_BY_T26');
      expect(res.alerts).toBe(0);
      expect(mockSendNotification).not.toHaveBeenCalled();
    });
  });

  describe('4. WhatsApp Notification Service & DryRun Isolation', () => {
    test('dryRun: true increments alerts and creates AiNotification without calling WhatsAppNotificationService', async () => {
      let createdNotification = null;
      mockSafeQuery = jest.spyOn(sharedDb, 'safeQuery').mockImplementation(async (cb) => {
        const dummyPrisma = {
          company: {
            findUnique: jest.fn().mockResolvedValue({
              id: 'comp_1',
              name: 'Test Store',
              phone: '01011112222',
              settings: JSON.stringify({
                shipping_followup: { enabled: true, minDays: 2, dryRun: true },
              }),
            }),
          },
          $queryRawUnsafe: jest.fn().mockResolvedValue([
            {
              id: 'ord_1',
              orderNumber: '1001',
              status: 'SHIPPED',
              daysInStatus: 3,
              customerName: 'أحمد',
              customerPhone: '01012345678',
              lastChangeAt: new Date(),
            },
          ]),
          aiRuntimeLedger: {
            create: jest.fn().mockResolvedValue({ id: 'led_1' }),
            update: jest.fn().mockResolvedValue({ id: 'led_1' }),
          },
          aiNotification: {
            create: jest.fn().mockImplementation((args) => {
              createdNotification = args.data;
              return Promise.resolve({ id: 'notif_1' });
            }),
          },
          $executeRawUnsafe: jest.fn().mockResolvedValue(1),
        };
        return cb(dummyPrisma);
      });

      const res = await shippingFollowUpService.runCompany('comp_1', { dryRun: true });
      expect(res.scanned).toBe(1);
      expect(res.alerts).toBe(1);
      expect(mockSendNotification).not.toHaveBeenCalled();
      expect(createdNotification).not.toBeNull();
      expect(createdNotification.type).toBe('AGENT_SHIPPING_DELAY');
    });

    test('dryRun: false calls WhatsAppNotificationService.sendNotification with ANNOUNCEMENT and ADMIN', async () => {
      mockSafeQuery = jest.spyOn(sharedDb, 'safeQuery').mockImplementation(async (cb) => {
        const dummyPrisma = {
          company: {
            findUnique: jest.fn().mockResolvedValue({
              id: 'comp_1',
              name: 'Test Store',
              phone: '01011112222',
              settings: JSON.stringify({
                shipping_followup: { enabled: true, minDays: 2, dryRun: false, notifyAdmin: true },
              }),
            }),
          },
          $queryRawUnsafe: jest.fn().mockResolvedValue([
            {
              id: 'ord_1',
              orderNumber: '1001',
              status: 'SHIPPED',
              daysInStatus: 3,
              customerName: 'أحمد',
              customerPhone: '01012345678',
              lastChangeAt: new Date(),
            },
          ]),
          aiRuntimeLedger: {
            create: jest.fn().mockResolvedValue({ id: 'led_1' }),
            update: jest.fn().mockResolvedValue({ id: 'led_1' }),
          },
          aiNotification: {
            create: jest.fn().mockResolvedValue({ id: 'notif_1' }),
          },
          $executeRawUnsafe: jest.fn().mockResolvedValue(1),
        };
        return cb(dummyPrisma);
      });

      const res = await shippingFollowUpService.runCompany('comp_1', { dryRun: false });
      expect(res.alerts).toBe(1);
      expect(mockSendNotification).toHaveBeenCalledTimes(1);
      const callArg = mockSendNotification.mock.calls[0][0];
      expect(callArg.recipientType).toBe('ADMIN');
      expect(callArg.eventType).toBe('ANNOUNCEMENT');
      expect(callArg.contentOverride).toContain('#1001');
    });
  });

  describe('5. Atomic Settings Update with jsonb_set (T00 §2.2)', () => {
    test('updateSettings executes $executeRawUnsafe with jsonb_set', async () => {
      let executedSql = '';
      let executedParams = [];

      mockSafeQuery = jest.spyOn(sharedDb, 'safeQuery').mockImplementation(async (cb) => {
        const dummyPrisma = {
          $executeRawUnsafe: jest.fn().mockImplementation((sql, ...params) => {
            executedSql = sql;
            executedParams = params;
            return Promise.resolve(1);
          }),
          company: {
            findUnique: jest.fn().mockResolvedValue({
              id: 'comp_1',
              settings: JSON.stringify({
                shipping_followup: { enabled: true, minDays: 3 },
              }),
            }),
          },
        };
        return cb(dummyPrisma);
      });

      const updated = await shippingFollowUpService.updateSettings('comp_1', { minDays: 3, enabled: true });
      expect(executedSql).toContain('jsonb_set');
      expect(executedSql).toContain('{shipping_followup}');
      expect(executedParams[1]).toBe('comp_1');
      expect(updated.minDays).toBe(3);
    });
  });

  describe('6. Validation & Boundary Conditions', () => {
    test('listDelayed rejects invalid minDays', async () => {
      await expect(shippingFollowUpService.listDelayed('comp_1', { minDays: 'invalid' })).rejects.toThrow(
        'عدد الأيام غير صالح'
      );
    });

    test('listDelayed rejects empty statuses', async () => {
      await expect(shippingFollowUpService.listDelayed('comp_1', { statuses: [] })).rejects.toThrow(
        'قائمة الحالات لا يمكن أن تكون فارغة'
      );
    });

    test('updateSettings rejects maxPerRun > 100', async () => {
      await expect(shippingFollowUpService.updateSettings('comp_1', { maxPerRun: 150 })).rejects.toThrow(
        'الحد الأقصى لكل تشغيل يجب أن يكون بين 1 و 100'
      );
    });
  });
});
