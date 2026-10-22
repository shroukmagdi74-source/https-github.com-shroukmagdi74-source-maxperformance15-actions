/**
 * اختبار شكل components المرسلة لميتا عند إنشاء قالب برأس صورة.
 *
 * السبب: الفرونت إند يبعت الحقل الداخلي `headerHandle`، والباك إند كان
 * بيضيف `example.header_handle` لكنه بيترك `headerHandle` في الجسم،
 * فميتا ترد:
 *   (#100) Unexpected key "headerHandle" on param "components[0]".
 */

const mockFindUnique = jest.fn();
const mockAxiosPost = jest.fn();

jest.mock('../../services/sharedDatabase', () => ({
  getSharedPrismaClient: () => ({
    whatsAppSession: { findUnique: mockFindUnique },
  }),
}));

jest.mock('../../utils/fieldEncryption', () => ({
  decryptField: () => 'test-access-token',
}));

jest.mock('../../config/facebookAppConfig', () => ({
  getFacebookOAuthConfig: () => ({ appId: '111111111111111', whatsappAppId: '' }),
}));

jest.mock('axios', () => ({
  post: (...args) => mockAxiosPost(...args),
  get: jest.fn(),
}));

const MetaCloudProvider = require('../../services/whatsapp/providers/MetaCloudProvider');

const session = {
  id: 'session-1',
  metaWabaId: '3066762786852874',
  metaPhoneNumberId: '1234567890',
  metaAccessToken: 'encrypted',
  metaApiVersion: 'v23.0',
};

beforeEach(() => {
  mockFindUnique.mockReset().mockResolvedValue(session);
  mockAxiosPost.mockReset();
});

describe('MetaCloudProvider.createTemplate — media header', () => {
  it('يحوّل headerHandle إلى example.header_handle ويحذف المفتاح الداخلي', async () => {
    mockAxiosPost.mockResolvedValueOnce({
      data: { id: 'tpl-1', status: 'PENDING', category: 'UTILITY' },
    });

    await MetaCloudProvider.createTemplate('session-1', {
      name: 'model_photo_follow_up',
      language: 'ar',
      category: 'UTILITY',
      components: [
        { type: 'HEADER', format: 'IMAGE', headerHandle: 'HANDLE-123' },
        {
          type: 'BODY',
          text: 'أهلاً {{1}}، دي صورة الموديل اللي طلبتها.',
          example: { body_text: [['منى']] },
        },
        { type: 'FOOTER', text: 'فريق Swan' },
      ],
    });

    expect(mockAxiosPost).toHaveBeenCalledTimes(1);
    const payload = mockAxiosPost.mock.calls[0][1];

    expect(payload.components[0]).toEqual({
      type: 'HEADER',
      format: 'IMAGE',
      example: { header_handle: ['HANDLE-123'] },
    });
    expect(payload.components[0]).not.toHaveProperty('headerHandle');
    expect(payload.components[0]).not.toHaveProperty('mediaHandle');
    expect(payload.category).toBe('UTILITY');
    expect(payload.language).toBe('ar');
  });

  it('يحذف headerHandle حتى لو مفيش handle (مايتبعتش مفتاح غير معروف)', async () => {
    mockAxiosPost.mockResolvedValueOnce({ data: { id: 'tpl-2' } });

    await MetaCloudProvider.createTemplate('session-1', {
      name: 'no_handle_header',
      language: 'ar',
      category: 'UTILITY',
      components: [
        { type: 'HEADER', format: 'IMAGE', headerHandle: '' },
        { type: 'BODY', text: 'رسالة بدون متغيرات' },
      ],
    });

    const payload = mockAxiosPost.mock.calls[0][1];
    expect(payload.components[0]).not.toHaveProperty('headerHandle');
    expect(payload.components[0]).not.toHaveProperty('example');
  });
});
