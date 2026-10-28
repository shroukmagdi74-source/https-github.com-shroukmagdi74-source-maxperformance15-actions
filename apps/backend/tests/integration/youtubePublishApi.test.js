/**
 * youtubePublishApi.test.js
 * Integration test covering the full A1 through A15 API test plan from the brief.
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');
const { getSharedPrismaClient } = require('../../services/sharedDatabase');
const { getJwtSecret } = require('../../utils/jwtSecret');
const { runScheduledYouTubePublish } = require('../../cron/youtubePublishCron');

process.env.YOUTUBE_MOCK = '1';

describe('YouTube Publishing API Test Plan (A1 - A15)', () => {
  let app;
  const prisma = getSharedPrismaClient();
  const testCompanyId = 'qr5vitkkllbbksib3tu9walg'; // qa-lab
  const testUserId = 'ch1ylrdf0owpxlgtzy9szo6t'; // qa@maxp.local
  let authToken;
  let createdVideoId;
  let failedVideoId;

  beforeAll(async () => {
    // Generate valid auth token for qa-lab OWNER
    const secret = getJwtSecret();
    authToken = jwt.sign(
      {
        id: testUserId,
        userId: testUserId,
        email: 'qa@maxp.local',
        companyId: testCompanyId,
        role: 'OWNER',
      },
      secret,
      { expiresIn: '1d' }
    );

    // Clean up test data for testCompanyId
    await prisma.youTubeVideo.deleteMany({ where: { companyId: testCompanyId } });
    await prisma.youTubeAccount.deleteMany({ where: { companyId: testCompanyId } });

    // Initialize express app with YouTube routes
    const express = require('express');
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/api/v1/youtube/auth', require('../../routes/youtubeAuthRoutes'));
    app.use('/api/v1/youtube/publish', require('../../routes/youtubePublishRoutes'));
  });

  afterAll(async () => {
    await prisma.youTubeVideo.deleteMany({ where: { companyId: testCompanyId } });
    await prisma.youTubeAccount.deleteMany({ where: { companyId: testCompanyId } });
  });

  // A1: GET /api/v1/youtube/publish/account -> { success: true, data: { connected: false } }
  test('A1: GET /api/v1/youtube/publish/account returns connected: false initially', async () => {
    const res = await request(app)
      .get('/api/v1/youtube/publish/account')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.connected).toBe(false);
  });

  // A2: GET /api/v1/youtube/auth/login -> { success: true, url: "...callback?code=mock&state=..." }
  let loginUrl;
  test('A2: GET /api/v1/youtube/auth/login returns callback url with signed state', async () => {
    const res = await request(app)
      .get(`/api/v1/youtube/auth/login?companyId=${testCompanyId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.url).toBeDefined();
    expect(res.body.url).toContain('/api/v1/youtube/auth/callback');
    expect(res.body.url).toContain('code=');
    expect(res.body.url).toContain('state=');
    loginUrl = res.body.url;
  });

  // A3: GET callback URL -> 302 redirect + row in youtube_accounts with channelId and refreshToken
  test('A3: GET on callback URL creates account record and redirects', async () => {
    const urlObj = new URL(loginUrl);
    const callbackPath = urlObj.pathname + urlObj.search;

    const res = await request(app).get(callbackPath);
    expect([302, 200]).toContain(res.status);

    const account = await prisma.youTubeAccount.findFirst({
      where: { companyId: testCompanyId },
    });
    expect(account).not.toBeNull();
    expect(account.channelId).toBe('mock_channel');
    expect(account.refreshToken).toBeDefined();
    expect(account.status).toBe('connected');
  });

  // A4: GET /api/v1/youtube/publish/account again -> connected: true + channelTitle
  test('A4: GET /api/v1/youtube/publish/account returns connected: true with channel info', async () => {
    const res = await request(app)
      .get('/api/v1/youtube/publish/account')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.connected).toBe(true);
    expect(res.body.data.channelId).toBe('mock_channel');
    expect(res.body.data.channelTitle).toBeDefined();
  });

  // A5: POST /api/v1/youtube/publish -> 201 + status: "SCHEDULED"
  test('A5: POST /api/v1/youtube/publish schedules new video successfully', async () => {
    const scheduledAt = new Date(Date.now() + 2 * 60 * 1000).toISOString();
    const res = await request(app)
      .post('/api/v1/youtube/publish')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'QA Video',
        description: 'test description',
        tags: 'qa,demo',
        privacy: 'private',
        mediaUrl: '/uploads/media/qa-sample.mp4',
        scheduledAt,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('SCHEDULED');
    expect(res.body.data.title).toBe('QA Video');
    createdVideoId = res.body.data.id;
  });

  // A6: GET /api/v1/youtube/publish?limit=20 -> returns list with pagination
  test('A6: GET /api/v1/youtube/publish returns video list with pagination', async () => {
    const res = await request(app)
      .get('/api/v1/youtube/publish?limit=20')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((v) => v.id === createdVideoId)).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.total).toBeGreaterThanOrEqual(1);
  });

  // A7: Cron runs on due video -> status: "PUBLISHED", youtubeVideoId, publishedAt filled
  test('A7: Cron tick publishes the video once due', async () => {
    // Set scheduledAt to the past to simulate due time
    await prisma.youTubeVideo.update({
      where: { id: createdVideoId },
      data: { scheduledAt: new Date(Date.now() - 5000) },
    });

    await runScheduledYouTubePublish();

    const res = await request(app)
      .get(`/api/v1/youtube/publish/${createdVideoId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('PUBLISHED');
    expect(res.body.data.youtubeVideoId).toMatch(/^mockVid_/);
    expect(res.body.data.publishedAt).toBeDefined();
  });

  // A8: Repeat cron run -> attempts must not change (zero duplicate)
  test('A8: Re-running cron does not duplicate upload or increment attempts', async () => {
    const before = await prisma.youTubeVideo.findUnique({ where: { id: createdVideoId } });
    const attemptsBefore = before.attempts;

    await runScheduledYouTubePublish();

    const after = await prisma.youTubeVideo.findUnique({ where: { id: createdVideoId } });
    expect(after.attempts).toBe(attemptsBefore);
    expect(after.status).toBe('PUBLISHED');
  });

  // A9: POST /youtube/publish with scheduledAt in the past -> gets published on tick
  test('A9: Video created with past scheduledAt publishes on next cron tick', async () => {
    const pastDate = new Date(Date.now() - 60000).toISOString();
    const createRes = await request(app)
      .post('/api/v1/youtube/publish')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Past Due Video',
        mediaUrl: '/uploads/media/qa-sample.mp4',
        scheduledAt: pastDate,
      });

    expect(createRes.status).toBe(201);
    const pastId = createRes.body.data.id;

    await runScheduledYouTubePublish();

    const checkRes = await request(app)
      .get(`/api/v1/youtube/publish/${pastId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(checkRes.body.data.status).toBe('PUBLISHED');
  });

  // A10: POST /youtube/publish with non-existent mediaUrl -> 400
  test('A10: POST /youtube/publish with missing file returns 400', async () => {
    const res = await request(app)
      .post('/api/v1/youtube/publish')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Non-existent Media Video',
        mediaUrl: '/uploads/media/missing-video-file-xyz.mp4',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('ملف الفيديو غير موجود على السيرفر');
  });

  // A11: POST /youtube/publish with empty or >100 char title -> 400
  test('A11: POST /youtube/publish with empty or >100 char title returns 400', async () => {
    const emptyRes = await request(app)
      .post('/api/v1/youtube/publish')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: '',
        mediaUrl: '/uploads/media/qa-sample.mp4',
      });
    expect(emptyRes.status).toBe(400);
    expect(emptyRes.body.error).toContain('عنوان الفيديو مطلوب');

    const longTitle = 'A'.repeat(101);
    const longRes = await request(app)
      .post('/api/v1/youtube/publish')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: longTitle,
        mediaUrl: '/uploads/media/qa-sample.mp4',
      });
    expect(longRes.status).toBe(400);
    expect(longRes.body.error).toContain('عنوان الفيديو مطلوب ويجب ألا يتجاوز 100 حرف');
  });

  // A12: Company without the app (temporarily suspend app) -> 403 from checkAppAccess
  test('A12: When youtube-publish is SUSPENDED, requests return 403 from checkAppAccess', async () => {
    // Suspend app temporarily
    await prisma.companyApp.updateMany({
      where: {
        companyId: testCompanyId,
        app: { slug: 'youtube-publish' },
      },
      data: { status: 'SUSPENDED' },
    });

    try {
      const res = await request(app)
        .get('/api/v1/youtube/publish/account')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    } finally {
      // Restore ACTIVE status
      await prisma.companyApp.updateMany({
        where: {
          companyId: testCompanyId,
          app: { slug: 'youtube-publish' },
        },
        data: { status: 'ACTIVE' },
      });
    }
  });

  // A13: DELETE /youtube/publish/:id on SCHEDULED -> 200 CANCELLED; on PUBLISHED -> 400
  test('A13: DELETE cancels SCHEDULED video, rejects PUBLISHED video', async () => {
    // 1) Test on SCHEDULED video
    const schedRes = await request(app)
      .post('/api/v1/youtube/publish')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Video To Be Cancelled',
        mediaUrl: '/uploads/media/qa-sample.mp4',
        scheduledAt: new Date(Date.now() + 3600000).toISOString(),
      });
    const schedId = schedRes.body.data.id;

    const delRes = await request(app)
      .delete(`/api/v1/youtube/publish/${schedId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.data.status).toBe('CANCELLED');

    // 2) Test on PUBLISHED video (from A7)
    const pubDelRes = await request(app)
      .delete(`/api/v1/youtube/publish/${createdVideoId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(pubDelRes.status).toBe(400);
    expect(pubDelRes.body.error).toContain('يمكن إلغاء الفيديوهات المجدولة فقط');
  });

  // A14: YOUTUBE_MOCK_FAIL=1 -> POST + cron -> status: FAILED + errorMessage
  test('A14: When mock fail flag is active, upload fails and sets status to FAILED', async () => {
    const createRes = await request(app)
      .post('/api/v1/youtube/publish')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Failing Video Test',
        mediaUrl: '/uploads/media/qa-sample.mp4',
        scheduledAt: new Date(Date.now() - 5000).toISOString(),
      });

    failedVideoId = createRes.body.data.id;

    process.env.YOUTUBE_MOCK_FAIL = '1';
    await runScheduledYouTubePublish();
    delete process.env.YOUTUBE_MOCK_FAIL;

    const checkRes = await request(app)
      .get(`/api/v1/youtube/publish/${failedVideoId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(checkRes.status).toBe(200);
    expect(checkRes.body.data.status).toBe('FAILED');
    expect(checkRes.body.data.errorMessage).toBeDefined();
    expect(checkRes.body.data.attempts).toBe(1);
  });

  // A15: POST /:id/retry on failed video -> SCHEDULED, then PUBLISHED on next tick with attempts = 2
  test('A15: Retrying failed video resets it to SCHEDULED and publishes with attempts = 2', async () => {
    const retryRes = await request(app)
      .post(`/api/v1/youtube/publish/${failedVideoId}/retry`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(retryRes.status).toBe(200);
    expect(retryRes.body.data.status).toBe('SCHEDULED');

    // Run cron tick
    await runScheduledYouTubePublish();

    const checkRes = await request(app)
      .get(`/api/v1/youtube/publish/${failedVideoId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(checkRes.body.data.status).toBe('PUBLISHED');
    expect(checkRes.body.data.attempts).toBe(2);
  });

  // A16: Verify server.js mounting
  test('A16: server.js mounts YouTube auth, publish routes and scheduler', () => {
    const fs = require('fs');
    const path = require('path');
    const serverSource = fs.readFileSync(path.resolve(__dirname, '../../server.js'), 'utf8');

    expect(serverSource).toContain('app.use("/api/v1/youtube/auth"');
    expect(serverSource).toContain('app.use("/api/v1/youtube/publish"');
    expect(serverSource).toContain('startYouTubePublishCron');
  });
});
