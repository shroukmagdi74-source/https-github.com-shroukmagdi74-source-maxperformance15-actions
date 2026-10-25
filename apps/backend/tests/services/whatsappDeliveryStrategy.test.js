/**
 * 🧪 whatsappDeliveryStrategy.test.js
 * اختبارات التحقق من استراتيجية تسليم إشعارات الواتساب وعدم استبدال deliveryCompanyId الصريح (WA-SIGNUP-1)
 *
 * Requirements:
 * 1. رابر الترحيب sendNewSignupWelcomeNotification بيوصل deliveryStrategy='platform-only' لـ sendNotification.
 * 2. sendNotification لا يستبدل deliveryCompanyId الصريح القادم من الرابر عندما تكون الاستراتيجية الافتراضية 'company'.
 * 3. sendNotification يحل deliveryCompanyId بناءً على deliveryStrategy فقط عند غياب deliveryCompanyId صريح.
 * 4. scheduleNotification يحتفظ بـ deliveryCompanyId الصريح ولا يستبدله.
 * 5. رابرات الاشتراكات والمزايا تمرر deliveryStrategy بدقة.
 */

let mockPrismaInstance = null;

jest.mock('../../services/sharedDatabase', () => ({
  getSharedPrismaClient: () => mockPrismaInstance,
  safeQuery: (fn) => fn(mockPrismaInstance),
}));

jest.mock('../../utils/companyBranding', () => ({
  getCompanyBranding: jest.fn().mockResolvedValue({
    companyName: 'Test Brand',
    domain: 'test.maxp.online'
  })
}));

const WhatsAppManager = require('../../services/whatsapp/WhatsAppManager');
const WhatsAppNotificationService = require('../../services/whatsapp/WhatsAppNotificationService');

describe('WhatsApp Delivery Strategy & Wrapper Preservation (WA-SIGNUP-1)', () => {
  const PLATFORM_COMPANY_ID = 'cmvf96xqk01zfju01oxibizex';
  const CLIENT_COMPANY_ID = 'cmvn0xcnt0j17ju9nnrzmhazo';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.WHATSAPP_PLATFORM_SENDER_COMPANY_ID = PLATFORM_COMPANY_ID;

    // Reset internal cache if any
    mockPrismaInstance = {
      company: {
        findFirst: jest.fn().mockImplementation(({ where }) => {
          if (where?.id === PLATFORM_COMPANY_ID || where?.slug?.in) {
            return Promise.resolve({ id: PLATFORM_COMPANY_ID, name: 'MaxP', isActive: true });
          }
          if (where?.id === CLIENT_COMPANY_ID) {
            return Promise.resolve({ id: CLIENT_COMPANY_ID, name: 'New Client Co', phone: '01000000000', isActive: true });
          }
          return Promise.resolve({ id: where?.id || 'any-comp', name: 'Some Co', isActive: true });
        }),
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where?.id === CLIENT_COMPANY_ID) {
            return Promise.resolve({ id: CLIENT_COMPANY_ID, name: 'New Client Co', phone: '01000000000', isActive: true });
          }
          return Promise.resolve({ id: where?.id || 'any-comp', name: 'Some Co', isActive: true });
        }),
      },
      whatsAppNotificationSettings: {
        findUnique: jest.fn().mockResolvedValue({
          companyId: CLIENT_COMPANY_ID,
          isEnabled: true,
          orderNotificationsEnabled: true,
          newSignupWelcomeEnabled: true,
          quietHoursStart: null,
          quietHoursEnd: null
        }),
        upsert: jest.fn().mockResolvedValue({
          isEnabled: true,
          orderNotificationsEnabled: true
        })
      },
      whatsAppNotificationTemplate: {
        findFirst: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([])
      },
      whatsAppSession: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      whatsAppNotificationLog: {
        create: jest.fn().mockResolvedValue({ id: 'log-1' }),
        update: jest.fn().mockResolvedValue({ id: 'log-1' }),
        findFirst: jest.fn().mockResolvedValue(null)
      },
      whatsAppNotificationQueue: {
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'queue-1', ...data }))
      },
      user: {
        findMany: jest.fn().mockResolvedValue([])
      },
      userCompany: {
        findMany: jest.fn().mockResolvedValue([])
      }
    };
  });

  afterEach(() => {
    delete process.env.WHATSAPP_PLATFORM_SENDER_COMPANY_ID;
  });

  describe('1. sendNewSignupWelcomeNotification passes platform-only deliveryStrategy', () => {
    test('Welcome wrapper routes via platformCompanyId and preserves deliveryStrategy="platform-only"', async () => {
      const getSessionsSpy = jest.spyOn(WhatsAppManager, 'getCompanySessions').mockReturnValue([]);

      const result = await WhatsAppNotificationService.sendNewSignupWelcomeNotification({
        companyId: CLIENT_COMPANY_ID,
        recipientPhone: '201123087745',
        recipientName: 'مختار الحناوي',
        companyName: 'شركة اختبار WA-SIGNUP-1',
        deliveryStrategy: 'platform-only'
      });

      // Verification: WhatsAppManager.getCompanySessions MUST be called with PLATFORM_COMPANY_ID
      // (not CLIENT_COMPANY_ID) because the deliveryStrategy is 'platform-only' and deliveryCompanyId
      // was preserved and NOT overwritten inside sendNotification!
      expect(getSessionsSpy).toHaveBeenCalledWith(PLATFORM_COMPANY_ID);
      expect(getSessionsSpy).not.toHaveBeenCalledWith(CLIENT_COMPANY_ID);
    });

    test('Welcome wrapper defaults deliveryStrategy to platform-only when omitted', async () => {
      const getSessionsSpy = jest.spyOn(WhatsAppManager, 'getCompanySessions').mockReturnValue([]);

      await WhatsAppNotificationService.sendNewSignupWelcomeNotification({
        companyId: CLIENT_COMPANY_ID,
        recipientPhone: '201123087745',
        recipientName: 'مختار الحناوي',
        companyName: 'شركة اختبار WA-SIGNUP-1'
      });

      expect(getSessionsSpy).toHaveBeenCalledWith(PLATFORM_COMPANY_ID);
    });
  });

  describe('2. sendNotification explicit deliveryCompanyId preservation', () => {
    test('explicit deliveryCompanyId is NOT overwritten when deliveryStrategy="company"', async () => {
      const getSessionsSpy = jest.spyOn(WhatsAppManager, 'getCompanySessions').mockReturnValue([]);

      await WhatsAppNotificationService.sendNotification({
        companyId: CLIENT_COMPANY_ID,
        deliveryCompanyId: PLATFORM_COMPANY_ID,
        deliveryStrategy: 'company', // default or explicit 'company'
        eventType: 'NEW_SIGNUP_WELCOME',
        recipientPhone: '201123087745'
      });

      // Explicit deliveryCompanyId must be respected and not reset back to CLIENT_COMPANY_ID
      expect(getSessionsSpy).toHaveBeenCalledWith(PLATFORM_COMPANY_ID);
      expect(getSessionsSpy).not.toHaveBeenCalledWith(CLIENT_COMPANY_ID);
    });

    test('omitted deliveryCompanyId falls back to companyId when deliveryStrategy="company"', async () => {
      const getSessionsSpy = jest.spyOn(WhatsAppManager, 'getCompanySessions').mockReturnValue([]);

      await WhatsAppNotificationService.sendNotification({
        companyId: CLIENT_COMPANY_ID,
        deliveryStrategy: 'company',
        eventType: 'NEW_SIGNUP_WELCOME',
        recipientPhone: '201123087745'
      });

      expect(getSessionsSpy).toHaveBeenCalledWith(CLIENT_COMPANY_ID);
    });

    test('omitted deliveryCompanyId resolves to platformCompanyId when deliveryStrategy="platform-only"', async () => {
      const getSessionsSpy = jest.spyOn(WhatsAppManager, 'getCompanySessions').mockReturnValue([]);

      await WhatsAppNotificationService.sendNotification({
        companyId: CLIENT_COMPANY_ID,
        deliveryStrategy: 'platform-only',
        eventType: 'NEW_SIGNUP_WELCOME',
        recipientPhone: '201123087745'
      });

      expect(getSessionsSpy).toHaveBeenCalledWith(PLATFORM_COMPANY_ID);
    });
  });

  describe('3. scheduleNotification explicit deliveryCompanyId preservation', () => {
    test('scheduleNotification preserves explicit deliveryCompanyId', async () => {
      const getSessionsSpy = jest.spyOn(WhatsAppManager, 'getCompanySessions').mockReturnValue([]);

      await WhatsAppNotificationService.scheduleNotification({
        companyId: CLIENT_COMPANY_ID,
        deliveryCompanyId: PLATFORM_COMPANY_ID,
        deliveryStrategy: 'company',
        eventType: 'ORDER_CREATED',
        recipientPhone: '201123087745',
        scheduleAt: new Date(Date.now() + 60000)
      });

      expect(getSessionsSpy).toHaveBeenCalledWith(PLATFORM_COMPANY_ID);
    });

    test('scheduleNotification resolves deliveryCompanyId to platform when strategy is platform-only', async () => {
      const getSessionsSpy = jest.spyOn(WhatsAppManager, 'getCompanySessions').mockReturnValue([]);

      await WhatsAppNotificationService.scheduleNotification({
        companyId: CLIENT_COMPANY_ID,
        deliveryStrategy: 'platform-only',
        eventType: 'ORDER_CREATED',
        recipientPhone: '201123087745',
        scheduleAt: new Date(Date.now() + 60000)
      });

      expect(getSessionsSpy).toHaveBeenCalledWith(PLATFORM_COMPANY_ID);
    });
  });

  describe('4. Lifecycle wrappers pass deliveryStrategy', () => {
    test('sendBenefitGrantedNotification forwards deliveryCompanyId and deliveryStrategy', async () => {
      const getSessionsSpy = jest.spyOn(WhatsAppManager, 'getCompanySessions').mockReturnValue([]);

      await WhatsAppNotificationService.sendBenefitGrantedNotification({
        companyId: CLIENT_COMPANY_ID,
        recipientPhone: '201123087745',
        recipientName: 'مختار',
        benefitTitle: 'مزايا التسجيل',
        deliveryStrategy: 'platform-only'
      });

      expect(getSessionsSpy).toHaveBeenCalledWith(PLATFORM_COMPANY_ID);
    });

    test('sendSubscriptionCreatedNotification defaults to platform-only and queries platform sessions', async () => {
      const getSessionsSpy = jest.spyOn(WhatsAppManager, 'getCompanySessions').mockReturnValue([]);

      await WhatsAppNotificationService.sendSubscriptionCreatedNotification({
        companyId: CLIENT_COMPANY_ID,
        recipientPhone: '201123087745',
        recipientName: 'مختار',
        planName: 'باقة المحترفين'
      });

      expect(getSessionsSpy).toHaveBeenCalledWith(PLATFORM_COMPANY_ID);
    });

    test('sendSubscriptionRenewedNotification defaults to platform-only and queries platform sessions', async () => {
      const getSessionsSpy = jest.spyOn(WhatsAppManager, 'getCompanySessions').mockReturnValue([]);

      await WhatsAppNotificationService.sendSubscriptionRenewedNotification({
        companyId: CLIENT_COMPANY_ID,
        recipientPhone: '201123087745',
        recipientName: 'مختار',
        planName: 'باقة المحترفين'
      });

      expect(getSessionsSpy).toHaveBeenCalledWith(PLATFORM_COMPANY_ID);
    });

    test('sendSubscriptionCancelledNotification defaults to platform-only and queries platform sessions', async () => {
      const getSessionsSpy = jest.spyOn(WhatsAppManager, 'getCompanySessions').mockReturnValue([]);

      await WhatsAppNotificationService.sendSubscriptionCancelledNotification({
        companyId: CLIENT_COMPANY_ID,
        recipientPhone: '201123087745',
        recipientName: 'مختار',
        planName: 'باقة المحترفين'
      });

      expect(getSessionsSpy).toHaveBeenCalledWith(PLATFORM_COMPANY_ID);
    });
  });
});
