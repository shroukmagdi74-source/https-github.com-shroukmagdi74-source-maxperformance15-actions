/**
 * Integration Tests for Student OTP Authentication
 * - sendStudentLoginCode (MetaCloudProvider mock, 200 success, 502 error JSON, rate limiter 429)
 * - studentLogin (token issuance, single use OTP, error states)
 */

jest.mock('../../services/whatsapp/WhatsAppManager', () => ({
  getCompanySessions: jest.fn(() => []),
  getSession: jest.fn(() => null),
  getSocketReadyState: jest.fn(() => 0),
}));

jest.mock('../../services/sharedDatabase', () => ({
  getSharedPrismaClient: jest.fn(),
}));

jest.mock('../../services/whatsapp/providers/MetaCloudProvider', () => ({
  listTemplates: jest.fn(),
  getTemplateById: jest.fn(),
  sendTemplate: jest.fn(),
}));

jest.mock('../../services/notificationService', () => ({
  createNotification: jest.fn(async () => ({})),
}));

jest.mock('../../utils/jwtSecret', () => ({
  getJwtSecret: jest.fn(() => 'test-jwt-secret-key'),
}));

const { getSharedPrismaClient } = require('../../services/sharedDatabase');
const MetaCloudProvider = require('../../services/whatsapp/providers/MetaCloudProvider');
const academyService = require('../../services/academyService');
const academyController = require('../../controller/academyController');

describe('Academy Student OTP Flow — sendStudentLoginCode & studentLogin', () => {
  let mockPrisma;
  let mockReq;
  let mockRes;
  let sentStatus;
  let sentJson;
  let sentHeaders;

  beforeEach(() => {
    jest.clearAllMocks();

    sentStatus = null;
    sentJson = null;
    sentHeaders = {};

    mockRes = {
      setHeader: jest.fn((k, v) => {
        sentHeaders[k.toLowerCase()] = v;
      }),
      status: jest.fn((code) => {
        sentStatus = code;
        return mockRes;
      }),
      json: jest.fn((data) => {
        sentJson = data;
        return mockRes;
      }),
    };

    mockPrisma = {
      academyEnrollment: {
        findFirst: jest.fn(async ({ where }) => {
          const phones = where?.studentPhone?.in || [where?.studentPhone];
          const targetPhone = phones.find(Boolean);
          if (targetPhone && !targetPhone.includes('01099999999')) {
            return {
              id: `enrollment-${targetPhone}`,
              studentPhone: targetPhone,
              studentName: 'طالب ماكس بي',
              status: 'ACTIVE',
              companyId: 'cmopgxu3a07i4jujj6f1oh32h',
              courseId: 'course-1',
              course: { id: 'course-1', title: 'كورس ماكس بي التجاري' },
            };
          }
          return null;
        }),
        findMany: jest.fn(async ({ where }) => {
          const phones = where?.studentPhone?.in || [where?.studentPhone];
          const targetPhone = phones.find(Boolean);
          if (targetPhone && !targetPhone.includes('01099999999')) {
            return [
              {
                id: `enrollment-${targetPhone}`,
                studentPhone: targetPhone,
                studentName: 'طالب ماكس بي',
                status: 'ACTIVE',
                companyId: 'cmopgxu3a07i4jujj6f1oh32h',
                courseId: 'course-1',
                course: {
                  id: 'course-1',
                  title: 'كورس ماكس بي التجاري',
                  price: 500,
                  thumbnailUrl: 'https://cdn.maxp.online/thumb.jpg',
                },
              },
            ];
          }
          return [];
        }),
      },
      customer: {
        findFirst: jest.fn(async () => null),
      },
      whatsAppSession: {
        findFirst: jest.fn(async () => ({
          id: 'cmvf96xqk01zfju01oxibizex',
          provider: 'META_CLOUD',
          status: 'CONNECTED',
        })),
        findMany: jest.fn(async () => [
          {
            id: 'cmvf96xqk01zfju01oxibizex',
            provider: 'META_CLOUD',
            status: 'CONNECTED',
          },
        ]),
      },
    };

    getSharedPrismaClient.mockReturnValue(mockPrisma);
    academyService.prisma = mockPrisma;

    MetaCloudProvider.listTemplates.mockResolvedValue([
      {
        name: 'student_login_otp',
        status: 'APPROVED',
        category: 'AUTHENTICATION',
        language: 'ar',
        components: [
          { type: 'BODY', text: '*{{1}}* هو كود التحقق الخاص بك' },
          {
            type: 'BUTTONS',
            buttons: [
              {
                type: 'URL',
                text: 'نسخ الرمز',
                url: 'https://maxp.online/academy/verify?code={{1}}',
              },
            ],
          },
        ],
      },
    ]);

    MetaCloudProvider.sendTemplate.mockResolvedValue({
      messageId: 'wamid.HBgLMjAx...',
    });
  });

  test('1) returns 400 when phone number is missing or empty', async () => {
    mockReq = { body: { phone: '' } };
    await academyController.sendStudentLoginCode(mockReq, mockRes);
    expect(sentStatus).toBe(400);
    expect(sentJson.success).toBe(false);
  });

  test('2) returns 404 when phone has no enrollment or customer record', async () => {
    mockReq = { body: { phone: '01099999999' } };
    await academyController.sendStudentLoginCode(mockReq, mockRes);
    expect(sentStatus).toBe(404);
    expect(sentJson.success).toBe(false);
    expect(sentJson.code).toBe('NO_ENROLLMENT_FOUND');
  });

  test('3) successful OTP dispatch sends normalized 201xxxxxxxxx with correct components and returns 200 JSON', async () => {
    mockReq = { body: { phone: '01055555555' } };
    await academyController.sendStudentLoginCode(mockReq, mockRes);

    expect(sentStatus).toBeNull(); // res.json without status defaults to 200
    expect(sentJson).toMatchObject({
      success: true,
      message: 'تم إرسال كود التحقق بنجاح إلى هاتفك عبر واتساب',
      expiresInSeconds: 600,
    });

    // Check args passed to MetaCloudProvider.sendTemplate:
    // (sessionId, recipientPhone, templateName, languageCode, components)
    expect(MetaCloudProvider.sendTemplate).toHaveBeenCalledTimes(1);
    const [sessionId, recipientPhone, templateName, languageCode, components] =
      MetaCloudProvider.sendTemplate.mock.calls[0];

    expect(sessionId).toBe('cmvf96xqk01zfju01oxibizex');
    expect(recipientPhone).toBe('201055555555'); // Normalized from 01055555555!
    expect(templateName).toBe('student_login_otp');
    expect(languageCode).toBe('ar');

    // Check components structure: body param = code, button copy_code param = coupon_code
    expect(components).toHaveLength(2);
    expect(components[0]).toEqual({
      type: 'body',
      parameters: [{ type: 'text', text: expect.stringMatching(/^\d{6}$/) }],
    });
    expect(components[1]).toEqual({
      type: 'button',
      sub_type: 'copy_code',
      index: '0',
      parameters: [{ type: 'coupon_code', coupon_code: expect.stringMatching(/^\d{6}$/) }],
    });
    // Ensure both code parameters match
    expect(components[0].parameters[0].text).toBe(components[1].parameters[0].coupon_code);
  });

  test('3.1) internal E2E test account 01000000099 returns 200 JSON with predictable code when ALLOW_ACADEMY_TEST_OTP=true', async () => {
    process.env.ALLOW_ACADEMY_TEST_OTP = 'true';
    mockReq = { body: { phone: '01000000099' } };
    await academyController.sendStudentLoginCode(mockReq, mockRes);

    expect(sentStatus).toBeNull();
    expect(sentJson).toMatchObject({
      success: true,
      expiresInSeconds: 600,
      testCode: '123456',
    });
    delete process.env.ALLOW_ACADEMY_TEST_OTP;
  });

  test('3.2) internal E2E test account does NOT leak testCode when ALLOW_ACADEMY_TEST_OTP is false/unset', async () => {
    delete process.env.ALLOW_ACADEMY_TEST_OTP;
    mockReq = { body: { phone: '01000000088' } };
    await academyController.sendStudentLoginCode(mockReq, mockRes);

    expect(sentStatus).toBeNull();
    expect(sentJson.success).toBe(true);
    expect(sentJson.testCode).toBeUndefined();
  });

  test('4) rate limiter enforces 30 seconds wait and returns 429 JSON with retryAfter', async () => {
    mockReq = { body: { phone: '01000000099' } };

    // First call succeeded in previous test, let's trigger again within 30 seconds:
    await academyController.sendStudentLoginCode(mockReq, mockRes);

    expect(sentStatus).toBe(429);
    expect(sentJson).toMatchObject({
      success: false,
      code: 'RATE_LIMITED',
    });
    expect(sentJson.retryAfter).toBeGreaterThan(0);
    expect(sentJson.retryAfter).toBeLessThanOrEqual(30);
  });

  test('5) provider failure returns HTTP 503 with truthful JSON and sets Cloudflare pass-through headers', async () => {
    const metaError = new Error('Template param count mismatch: expected 1 body params, got 0');
    metaError.code = 132000;
    metaError.retryable = false;
    metaError.details = 'Param count mismatch';
    metaError.originalError = {
      response: {
        data: {
          error: {
            message: 'Template param count mismatch: expected 1 body params, got 0',
            code: 132000,
          },
        },
      },
    };

    MetaCloudProvider.sendTemplate.mockRejectedValueOnce(metaError);

    mockReq = { body: { phone: '01000000098' } };
    await academyController.sendStudentLoginCode(mockReq, mockRes);

    expect([502, 503]).toContain(sentStatus);
    expect(sentHeaders['cf-turn-off-custom-errors']).toBe('1');
    expect(sentHeaders['x-cf-turn-off-custom-errors']).toBe('1');
    expect(sentHeaders['content-type']).toContain('application/json');

    expect(sentJson).toMatchObject({
      success: false,
      code: 132000,
      provider: 'META_CLOUD',
      retryable: false,
      metaErrorCode: 132000,
    });
    expect(sentJson.error).toContain('Template param count mismatch');
  });

  test('6) studentLogin verifies OTP code and returns student JWT token with 30-day expiry', async () => {
    mockReq = { body: { phone: '01011112222' } };
    await academyController.sendStudentLoginCode(mockReq, mockRes);
    expect(MetaCloudProvider.sendTemplate).toHaveBeenCalled();

    const dispatchedCode = MetaCloudProvider.sendTemplate.mock.calls[0][4][0].parameters[0].text;

    // Second: studentLogin with wrong code -> returns 400 OTP_INVALID
    mockReq = { body: { phone: '01011112222', code: '000000' } };
    await academyController.studentLogin(mockReq, mockRes);
    expect(sentStatus).toBe(400);
    expect(sentJson.code).toBe('OTP_INVALID');

    // Third: studentLogin with correct code -> returns 200 with JWT token
    mockReq = { body: { phone: '01011112222', code: dispatchedCode } };
    await academyController.studentLogin(mockReq, mockRes);
    expect(sentJson.success).toBe(true);
    expect(sentJson).toHaveProperty('token');
    expect(typeof sentJson.token).toBe('string');
    expect(sentJson.student.phone).toBe('01011112222');

    // Fourth: re-using same code fails (single-use OTP)
    mockReq = { body: { phone: '01011112222', code: dispatchedCode } };
    await academyController.studentLogin(mockReq, mockRes);
    expect(sentStatus).toBe(400);
    expect(sentJson.code).toBe('OTP_EXPIRED');
  });
});
