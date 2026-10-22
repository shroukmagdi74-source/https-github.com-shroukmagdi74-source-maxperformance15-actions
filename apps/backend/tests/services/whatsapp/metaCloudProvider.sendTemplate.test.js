/**
 * Unit tests for MetaCloudProvider.sendTemplate and normalizePhone
 */

jest.mock('../../../services/sharedDatabase', () => ({
  getSharedPrismaClient: jest.fn(),
}));

jest.mock('../../../config/metaApi', () => ({
  getMetaGraphApiVersion: jest.fn(() => 'v25.0'),
}));

jest.mock('../../../utils/fieldEncryption', () => ({
  decryptField: jest.fn((v) => v),
}));

const axios = require('axios');
const { getSharedPrismaClient } = require('../../../services/sharedDatabase');
const MetaCloudProvider = require('../../../services/whatsapp/providers/MetaCloudProvider');

describe('MetaCloudProvider.sendTemplate — Unit Tests', () => {
  let prisma;
  let axiosPostSpy;

  beforeEach(() => {
    prisma = {
      whatsAppSession: {
        findUnique: jest.fn(async () => ({
          id: 'session-meta-1',
          provider: 'META_CLOUD',
          metaAccessToken: 'secret-meta-access-token',
          metaPhoneNumberId: 'phone-num-id-99',
          metaApiVersion: 'v25.0',
        })),
      },
    };
    getSharedPrismaClient.mockReturnValue(prisma);

    axiosPostSpy = jest.spyOn(axios, 'post').mockResolvedValue({
      data: {
        messaging_product: 'whatsapp',
        contacts: [{ input: '201000000099', wa_id: '201000000099' }],
        messages: [{ id: 'wamid.HBgLMjAx...' }],
      },
    });

    jest.clearAllMocks();
  });

  afterEach(() => {
    axiosPostSpy.mockRestore();
  });

  test('normalizes Egyptian local number (01000000099 -> 201000000099) and builds valid Graph API payload', async () => {
    const components = [
      {
        type: 'body',
        parameters: [{ type: 'text', text: '654321' }],
      },
      {
        type: 'button',
        sub_type: 'url',
        index: '0',
        parameters: [{ type: 'text', text: '654321' }],
      },
    ];

    const result = await MetaCloudProvider.sendTemplate(
      'session-meta-1',
      '01000000099',
      'student_login_otp',
      'ar',
      components
    );

    expect(result).toHaveProperty('messageId', 'wamid.HBgLMjAx...');
    expect(axiosPostSpy).toHaveBeenCalledTimes(1);

    const [url, payload, config] = axiosPostSpy.mock.calls[0];
    expect(url).toBe('https://graph.facebook.com/v25.0/phone-num-id-99/messages');
    expect(config.headers.Authorization).toBe('Bearer secret-meta-access-token');

    expect(payload).toEqual({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: '201000000099',
      type: 'template',
      template: {
        name: 'student_login_otp',
        language: { code: 'ar' },
        components: [
          {
            type: 'body',
            parameters: [{ type: 'text', text: '654321' }],
          },
          {
            type: 'button',
            sub_type: 'url',
            index: '0',
            parameters: [{ type: 'text', text: '654321' }],
          },
        ],
      },
    });
  });

  test('normalizes international Egyptian number with plus (+201000000099) and Arabic digits', async () => {
    await MetaCloudProvider.sendTemplate(
      'session-meta-1',
      '+201000000099',
      'student_login_otp',
      'ar',
      []
    );
    expect(axiosPostSpy.mock.calls[0][1].to).toBe('201000000099');

    axiosPostSpy.mockClear();

    // Arabic-Indic numerals: ٠١٠٠٠٠٠٠٠٩٩ -> 201000000099
    await MetaCloudProvider.sendTemplate(
      'session-meta-1',
      '٠١٠٠٠٠٠٠٠٩٩',
      'student_login_otp',
      'ar',
      []
    );
    expect(axiosPostSpy.mock.calls[0][1].to).toBe('201000000099');
  });

  test('supports backward-compatible object options as 4th argument { language, components }', async () => {
    const components = [
      {
        type: 'body',
        parameters: [{ type: 'text', text: '112233' }],
      },
    ];

    const result = await MetaCloudProvider.sendTemplate(
      'session-meta-1',
      '01000000099',
      'student_login_otp',
      {
        language: 'ar',
        components,
      }
    );

    expect(result).toHaveProperty('messageId');
    const payload = axiosPostSpy.mock.calls[0][1];
    expect(payload.template.language).toEqual({ code: 'ar' });
    expect(payload.template.components).toEqual(components);
  });

  test('maps Meta Graph API errors properly when Meta rejects payload', async () => {
    axiosPostSpy.mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          error: {
            message: 'Template param count mismatch: expected 1 body params, got 0',
            type: 'OAuthException',
            code: 132000,
            error_subcode: 2494084,
            fbtrace_id: 'test-fb-trace-123',
          },
        },
      },
    });

    await expect(
      MetaCloudProvider.sendTemplate(
        'session-meta-1',
        '01000000099',
        'student_login_otp',
        'ar',
        []
      )
    ).rejects.toThrow();
  });
});
