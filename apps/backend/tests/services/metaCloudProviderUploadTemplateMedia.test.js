/**
 * اختبار رفع وسائط الهيدر لقوالب ميتا (Resumable Upload API).
 *
 * السبب: النداء القديم كان بيستخدم `/{wabaId}/uploads` في خطوة واحدة،
 * فميتا بترجع "Object with ID ... does not support this operation" (500).
 * المسار الصحيح خطوتين:
 *   1) POST /{APP_ID}/uploads?file_name&file_length&file_type  → { id: "upload:..." }
 *   2) POST /{upload:...}  (Authorization: OAuth, file_offset: 0, binary) → { h: "handle" }
 */

const mockFindUnique = jest.fn();
const mockAxiosPost = jest.fn();
const mockAxiosGet = jest.fn();

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
  get: (...args) => mockAxiosGet(...args),
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
  mockAxiosGet.mockReset();
});

describe('MetaCloudProvider.uploadTemplateMedia', () => {
  test('يستخدم APP ID (مش WABA ID) ويكمّل الرفع في خطوتين ويرجّع handle', async () => {
    // (1) GET /app → الـ app المالك للتوكن
    mockAxiosGet.mockResolvedValueOnce({ data: { id: '999999999999999', name: 'MaxP' } });
    // (2) إنشاء upload session
    mockAxiosPost.mockResolvedValueOnce({ data: { id: 'upload:ABC123' } });
    // (3) رفع البايتات
    mockAxiosPost.mockResolvedValueOnce({ data: { h: 'handle-xyz' } });

    const buffer = Buffer.from('fake-image-bytes');
    const handle = await MetaCloudProvider.uploadTemplateMedia(
      'session-1',
      buffer,
      'image/jpeg',
      'model.jpg'
    );

    expect(handle).toBe('handle-xyz');

    const [createUrl, createBody, createConfig] = mockAxiosPost.mock.calls[0];
    expect(createUrl).toBe('https://graph.facebook.com/v23.0/999999999999999/uploads');
    expect(createUrl).not.toContain(session.metaWabaId);
    expect(createBody).toBeNull();
    expect(createConfig.params).toMatchObject({
      file_name: 'model.jpg',
      file_length: String(buffer.length),
      file_type: 'image/jpeg',
      access_token: 'test-access-token',
    });

    const [uploadUrl, uploadBody, uploadConfig] = mockAxiosPost.mock.calls[1];
    expect(uploadUrl).toBe('https://graph.facebook.com/v23.0/upload:ABC123');
    expect(uploadBody).toBe(buffer);
    expect(uploadConfig.headers.Authorization).toBe('OAuth test-access-token');
    expect(uploadConfig.headers.file_offset).toBe('0');
  });

  test('لو /app مش متاح يقع على APP ID من الإعدادات', async () => {
    mockAxiosGet.mockRejectedValueOnce(new Error('(#100) no permission'));
    mockAxiosPost.mockResolvedValueOnce({ data: { id: 'upload:FALLBACK' } });
    mockAxiosPost.mockResolvedValueOnce({ data: { h: 'handle-2' } });

    const handle = await MetaCloudProvider.uploadTemplateMedia(
      'session-1',
      Buffer.from('abc'),
      'image/jpeg',
      'x.jpg'
    );

    expect(handle).toBe('handle-2');
    expect(mockAxiosPost.mock.calls[0][0]).toBe(
      'https://graph.facebook.com/v23.0/111111111111111/uploads'
    );
  });

  test('لو الـ app الأول فشل يجرّب المرشّح التالي', async () => {
    mockAxiosGet.mockResolvedValueOnce({ data: { id: '999999999999999' } });
    mockAxiosPost.mockRejectedValueOnce(new Error('does not exist'));
    mockAxiosPost.mockResolvedValueOnce({ data: { id: 'upload:RETRY' } });
    mockAxiosPost.mockResolvedValueOnce({ data: { h: 'handle-3' } });

    const handle = await MetaCloudProvider.uploadTemplateMedia(
      'session-1',
      Buffer.from('abc'),
      'image/jpeg',
      'y.jpg'
    );

    expect(handle).toBe('handle-3');
    expect(mockAxiosPost.mock.calls[1][0]).toBe(
      'https://graph.facebook.com/v23.0/upload:RETRY'
    );
  });
});
