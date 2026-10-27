const mockPrisma = {
  user: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  company: {
    create: jest.fn(),
    update: jest.fn(),
  },
  userCompany: {
    create: jest.fn(),
  },
  systemSettings: {
    findUnique: jest.fn(),
  },
  employee: {
    count: jest.fn().mockResolvedValue(0),
  },
  activityLog: {
    create: jest.fn().mockResolvedValue({ id: 'log-1' }),
    findMany: jest.fn().mockResolvedValue([]),
  },
};

jest.mock('../../services/sharedDatabase', () => ({
  getSharedPrismaClient: jest.fn(() => mockPrisma),
  initializeSharedDatabase: jest.fn().mockResolvedValue(undefined),
  executeWithRetry: jest.fn(async (operation) => operation()),
  safeQuery: jest.fn(async (fn) => fn()),
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
}));

jest.mock('sharp', () => () => ({
  resize: jest.fn().mockReturnThis(),
  toBuffer: jest.fn().mockResolvedValue(Buffer.from('')),
}), { virtual: true });

jest.mock('../../services/imageCompressionService', () => ({}), { virtual: true });
jest.mock('../../utils/imageProcessor', () => ({
  processImage: jest.fn(),
  isProcessableImage: jest.fn(),
}), { virtual: true });

process.env.JWT_SECRET = 'test-jwt-secret-12345678901234567890';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-12345678901234567890';

const { register, trackRegisterAttemptMiddleware, validateRegisterMiddleware } = require('../../controller/authController');
const { getSignupFunnelReport } = require('../../controller/superAdminController');

const createResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Signup Funnel Tracking & Audit (P0, P1, P2)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('P0: ActivityLog logging in register', () => {
    it('logs REGISTER_ATTEMPT and REGISTER_FAILED when required fields are missing', async () => {
      const req = {
        body: {
          email: 'test.user@example.com',
          // password missing
          firstName: 'Test',
          lastName: 'User',
          phone: '01012345678',
        },
        headers: { 'x-forwarded-for': '127.0.0.1' },
      };
      const res = createResponse();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          errorCode: 'MISSING_FIELDS',
        })
      );

      // Verify REGISTER_ATTEMPT was created
      expect(mockPrisma.activityLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            category: 'AUTH',
            action: 'REGISTER_ATTEMPT',
            targetName: 't***@example.com',
          }),
        })
      );

      // Verify REGISTER_FAILED was created
      expect(mockPrisma.activityLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            category: 'AUTH',
            action: 'REGISTER_FAILED',
            targetName: 't***@example.com',
          }),
        })
      );

      // Check metadata does NOT contain password and masks phone
      const failedCall = mockPrisma.activityLog.create.mock.calls.find(
        (call) => call[0]?.data?.action === 'REGISTER_FAILED'
      );
      const meta = JSON.parse(failedCall[0].data.metadata);
      expect(meta.errorCode).toBe('MISSING_FIELDS');
      expect(meta.phoneTail).toBe('5678');
      expect(meta.emailMasked).toBe('t***@example.com');
      expect(meta.password).toBeUndefined();
    });

    it('logs REGISTER_FAILED with INVALID_PHONE when phone format is invalid', async () => {
      const req = {
        body: {
          email: 'valid@example.com',
          password: 'SecretPassword123!',
          firstName: 'Ali',
          lastName: 'Hassan',
          phone: 'not-a-valid-phone',
        },
        headers: {},
      };
      const res = createResponse();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          errorCode: 'INVALID_PHONE',
        })
      );

      const failedCall = mockPrisma.activityLog.create.mock.calls.find(
        (call) => call[0]?.data?.action === 'REGISTER_FAILED'
      );
      const meta = JSON.parse(failedCall[0].data.metadata);
      expect(meta.errorCode).toBe('INVALID_PHONE');
      expect(meta.emailMasked).toBe('v***@example.com');
    });

    it('logs REGISTER_FAILED with EMAIL_ALREADY_EXISTS when duplicate user exists', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce({
        id: 'existing-user-1',
        email: 'duplicate@example.com',
      });

      const req = {
        body: {
          email: 'duplicate@example.com',
          password: 'SecretPassword123!',
          firstName: 'Sara',
          lastName: 'Ahmed',
          phone: '01123456789',
          landingBundle: 'store-complete-bundle',
        },
        headers: {},
      };
      const res = createResponse();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          errorCode: 'EMAIL_ALREADY_EXISTS',
        })
      );

      const failedCall = mockPrisma.activityLog.create.mock.calls.find(
        (call) => call[0]?.data?.action === 'REGISTER_FAILED'
      );
      const meta = JSON.parse(failedCall[0].data.metadata);
      expect(meta.errorCode).toBe('EMAIL_ALREADY_EXISTS');
      expect(meta.phoneTail).toBe('6789');
      expect(meta.emailMasked).toBe('d***@example.com');
      expect(meta.landingBundle).toBe('store-complete-bundle');
    });
  });

  describe('P2: getSignupFunnelReport endpoint', () => {
    it('aggregates attempts, success, failed, byErrorCode, and bySource', async () => {
      const mockLogs = [
        {
          id: '1',
          action: 'REGISTER_ATTEMPT',
          metadata: JSON.stringify({ source: 'fb_ad', landingBundle: 'store-complete-bundle' }),
          isSuccess: true,
          createdAt: new Date(),
        },
        {
          id: '2',
          action: 'REGISTER_ATTEMPT',
          metadata: JSON.stringify({ source: 'fb_ad' }),
          isSuccess: true,
          createdAt: new Date(),
        },
        {
          id: '3',
          action: 'REGISTER_FAILED',
          metadata: JSON.stringify({ source: 'fb_ad', errorCode: 'EMAIL_ALREADY_EXISTS' }),
          errorMessage: 'فشل إنشاء الحساب',
          isSuccess: false,
          createdAt: new Date(),
        },
        {
          id: '4',
          action: 'REGISTER',
          metadata: JSON.stringify({ source: 'fb_ad', landingBundle: 'store-complete-bundle' }),
          isSuccess: true,
          createdAt: new Date(),
        },
      ];

      mockPrisma.activityLog.findMany.mockResolvedValueOnce(mockLogs);

      const req = { query: { days: '7' } };
      const res = createResponse();

      await getSignupFunnelReport(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          attempts: 2,
          success: 1,
          failed: 1,
          byErrorCode: [{ code: 'EMAIL_ALREADY_EXISTS', count: 1 }],
          bySource: [{ source: 'fb_ad', count: 4 }],
        })
      );
    });

    it('guarantees attempts >= success + failed even with legacy logs', async () => {
      const mockLogs = [
        {
          id: '1',
          action: 'REGISTER',
          metadata: JSON.stringify({ source: 'direct' }),
          isSuccess: true,
          createdAt: new Date(),
        },
        {
          id: '2',
          action: 'REGISTER_FAILED',
          metadata: JSON.stringify({ errorCode: 'INVALID_PHONE' }),
          isSuccess: false,
          createdAt: new Date(),
        },
      ];

      mockPrisma.activityLog.findMany.mockResolvedValueOnce(mockLogs);

      const req = { query: {} };
      const res = createResponse();

      await getSignupFunnelReport(req, res);

      const response = res.json.mock.calls[0][0];
      expect(response.attempts).toBeGreaterThanOrEqual(response.success + response.failed);
      expect(response.attempts).toBe(2);
      expect(response.success).toBe(1);
      expect(response.failed).toBe(1);
    });
  });

  describe('P2: Registration validation middleware tracking', () => {
    it('trackRegisterAttemptMiddleware logs REGISTER_ATTEMPT and sets _registerAttemptLogged', async () => {
      const req = {
        body: {
          email: 'valid.user@example.com',
          phone: '01099998888',
          source: 'meta-ad',
        },
        headers: { 'x-forwarded-for': '127.0.0.1' },
      };
      const res = createResponse();
      const next = jest.fn();

      await trackRegisterAttemptMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req._registerAttemptLogged).toBe(true);
      expect(mockPrisma.activityLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            category: 'AUTH',
            action: 'REGISTER_ATTEMPT',
          }),
        })
      );
    });

    it('validateRegisterMiddleware logs REGISTER_FAILED with VALIDATION_ERROR on validation failure', async () => {
      const { body } = require('express-validator');
      const req = {
        body: {
          firstName: 'A', // shorter than 2 chars
          email: 'shortname@example.com',
          phone: '01011112222',
        },
        headers: { 'x-forwarded-for': '127.0.0.1' },
      };

      await body('firstName')
        .isLength({ min: 2, max: 50 })
        .withMessage('الاسم الأول يجب أن يكون بين 2 و 50 حرف')
        .run(req);

      const res = createResponse();
      const next = jest.fn();

      await validateRegisterMiddleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          errorCode: 'VALIDATION_ERROR',
        })
      );

      // Verify REGISTER_FAILED was logged
      expect(mockPrisma.activityLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            category: 'AUTH',
            action: 'REGISTER_FAILED',
            description: expect.stringContaining('VALIDATION_ERROR'),
          }),
        })
      );
    });
  });
});