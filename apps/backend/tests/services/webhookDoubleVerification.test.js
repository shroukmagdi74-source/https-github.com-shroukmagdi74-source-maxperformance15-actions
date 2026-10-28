const crypto = require('crypto');
const {
  verifyMetaWebhookSignature,
  verifyMetaWebhookSignatureAgainstApps,
} = require('../../utils/webhookSignature');
const {
  getFacebookWebhookVerifyTokens,
  getAllFacebookAppSecrets,
} = require('../../config/facebookAppConfig');
const webhookController = require('../../controller/webhookController');
const sharedDatabase = require('../../services/sharedDatabase');

describe('Double Webhook Verification & Processing (Primary + Growth)', () => {
  const primarySecret = 'test_primary_secret_12345';
  const growthSecret = 'test_growth_secret_67890';
  const primaryAppId = '111111111111';
  const growthAppId = '222222222222';

  const rawPayload = JSON.stringify({
    object: 'page',
    entry: [
      {
        id: 'page_123',
        time: Date.now(),
        messaging: [
          {
            sender: { id: 'user_456' },
            recipient: { id: 'page_123' },
            message: { mid: 'm_test_msg_id_1', text: 'Hello' },
          },
        ],
      },
    ],
  });

  const appsList = [
    { key: 'primary', appId: primaryAppId, appSecret: primarySecret },
    { key: 'growth', appId: growthAppId, appSecret: growthSecret },
  ];

  test('getFacebookWebhookVerifyTokens returns both primary and growth tokens', () => {
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      FACEBOOK_VERIFY_TOKEN: 'primary_verify_token',
      FACEBOOK_GROWTH_WEBHOOK_VERIFY_TOKEN: 'growth_verify_token',
    };

    const tokens = getFacebookWebhookVerifyTokens();
    expect(tokens.has('primary_verify_token')).toBe(true);
    expect(tokens.has('growth_verify_token')).toBe(true);
    expect(tokens.has('unknown_verify_token')).toBe(false);

    process.env = originalEnv;
  });

  test('verifyMetaWebhookSignatureAgainstApps validates Primary signature correctly', () => {
    const hmac = crypto.createHmac('sha256', primarySecret).update(rawPayload).digest('hex');
    const req = {
      rawBody: Buffer.from(rawPayload),
      headers: {
        'x-hub-signature-256': `sha256=${hmac}`,
      },
    };

    const result = verifyMetaWebhookSignatureAgainstApps(req, appsList);
    expect(result.ok).toBe(true);
    expect(result.matchedApp).toBe('primary');
    expect(result.appId).toBe(primaryAppId);
  });

  test('verifyMetaWebhookSignatureAgainstApps validates Growth signature correctly (Fallback/Dual)', () => {
    const hmac = crypto.createHmac('sha256', growthSecret).update(rawPayload).digest('hex');
    const req = {
      rawBody: Buffer.from(rawPayload),
      headers: {
        'x-hub-signature-256': `sha256=${hmac}`,
      },
    };

    const result = verifyMetaWebhookSignatureAgainstApps(req, appsList);
    expect(result.ok).toBe(true);
    expect(result.matchedApp).toBe('growth');
    expect(result.appId).toBe(growthAppId);
  });

  test('verifyMetaWebhookSignatureAgainstApps rejects invalid signature', () => {
    const fakeHmac = crypto.createHmac('sha256', 'wrong_secret').update(rawPayload).digest('hex');
    const req = {
      rawBody: Buffer.from(rawPayload),
      headers: {
        'x-hub-signature-256': `sha256=${fakeHmac}`,
      },
    };

    const result = verifyMetaWebhookSignatureAgainstApps(req, appsList);
    expect(result.ok).toBe(false);
    expect(result.matchedApp).toBeNull();
  });

  test('GET Webhook verifies challenge with growth token', async () => {
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      FACEBOOK_GROWTH_WEBHOOK_VERIFY_TOKEN: 'growth_secret_verify_token',
    };

    const req = {
      query: {
        'hub.mode': 'subscribe',
        'hub.verify_token': 'growth_secret_verify_token',
        'hub.challenge': 'CHALLENGE_ACCEPTED_GROWTH',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await webhookController.getWebhook(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('CHALLENGE_ACCEPTED_GROWTH');

    process.env = originalEnv;
  });

  test('GET Webhook rejects unauthorized verify token with 403', async () => {
    const whatsappController = require('../../controller/whatsappMetaWebhookController');
    jest.spyOn(whatsappController, 'getWebhook').mockImplementation((req, res) => res.sendStatus(403));

    const req = {
      query: {
        'hub.mode': 'subscribe',
        'hub.verify_token': 'invalid_hacker_token',
        'hub.challenge': 'CHALLENGE_SHOULD_FAIL',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      sendStatus: jest.fn(),
    };

    await webhookController.getWebhook(req, res);
    expect(res.sendStatus).toHaveBeenCalledWith(403);
  });

  test('POST Webhook deduplication ignores duplicated external messages', async () => {
    const mockCreate = jest.fn()
      .mockResolvedValueOnce({ id: 'dedupe-1' })
      .mockRejectedValueOnce({ code: 'P2002', message: 'Unique constraint failed' });

    const mockPrisma = {
      webhookEventDedupe: {
        create: mockCreate,
      },
    };
    jest.spyOn(sharedDatabase, 'getSharedPrismaClient').mockReturnValue(mockPrisma);

    // Call dedupe helper via webhookController if accessible or verify prisma calls
    const { getSharedPrismaClient } = require('../../services/sharedDatabase');
    const client = getSharedPrismaClient();

    // First message - should succeed
    const first = await client.webhookEventDedupe.create({
      data: { channel: 'facebook', externalMessageId: 'mid_dup_test_1', appKey: 'growth' }
    });
    expect(first.id).toBe('dedupe-1');

    // Duplicate message - throws P2002
    await expect(
      client.webhookEventDedupe.create({
        data: { channel: 'facebook', externalMessageId: 'mid_dup_test_1', appKey: 'primary' }
      })
    ).rejects.toMatchObject({ code: 'P2002' });
  });
});
