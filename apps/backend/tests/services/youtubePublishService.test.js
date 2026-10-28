/**
 * youtubePublishService.test.js
 * Unit and integration tests for YouTube OAuth, Transport, Publish, and Cron scheduler.
 */

const fs = require('fs');
const path = require('path');

process.env.YOUTUBE_MOCK = '1';

const youtubeTransport = require('../../services/youtube/youtubeTransport');
const youtubeOAuthService = require('../../services/youtube/youtubeOAuthService');
const youtubePublishService = require('../../services/youtube/youtubePublishService');
const { runScheduledYouTubePublish } = require('../../cron/youtubePublishCron');
const { getSharedPrismaClient } = require('../../services/sharedDatabase');

describe('YouTube Integration Module Tests', () => {
  const prisma = getSharedPrismaClient();
  const testCompanyId = 'qr5vitkkllbbksib3tu9walg'; // qa-lab
  let testAccountId;
  let sampleVideoPath;

  beforeAll(async () => {
    // Ensure test sample video exists
    const uploadsDir = path.resolve(__dirname, '../../uploads/media');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    sampleVideoPath = path.join(uploadsDir, 'qa-sample.mp4');
    if (!fs.existsSync(sampleVideoPath)) {
      fs.writeFileSync(sampleVideoPath, 'fake-mp4-test-binary-data');
    }

    // Clean up any old test records
    await prisma.youTubeVideo.deleteMany({ where: { companyId: testCompanyId } });
    await prisma.youTubeAccount.deleteMany({ where: { companyId: testCompanyId } });

    // Seed test YouTube account
    const account = await youtubeOAuthService.saveToken(
      testCompanyId,
      {
        access_token: 'mock_access_token_123',
        refresh_token: 'mock_refresh_token_123',
        expires_in: 3600,
        scope: 'https://www.googleapis.com/auth/youtube.upload',
      },
      {
        channelId: 'UC_MOCK_CHANNEL_123',
        channelTitle: 'QA Automated Testing Channel',
        avatarUrl: 'https://example.com/avatar.png',
      }
    );
    testAccountId = account.id;
  });

  afterAll(async () => {
    // Clean up test records
    await prisma.youTubeVideo.deleteMany({ where: { companyId: testCompanyId } });
    await prisma.youTubeAccount.deleteMany({ where: { companyId: testCompanyId } });
  });

  describe('1. Transport & Mock Behavior', () => {
    test('isMock returns true when process.env.YOUTUBE_MOCK is 1', () => {
      expect(youtubeTransport.isMock()).toBe(true);
      expect(youtubeTransport.MOCK).toBe(true);
    });

    test('mockCall returns token response for token endpoint', async () => {
      const res = await youtubeTransport.call({
        url: 'https://oauth2.googleapis.com/token',
        method: 'POST',
      });
      expect(res.status).toBe(200);
      expect(res.data.access_token).toBeDefined();
      expect(res.data.access_token).toMatch(/^mock_at_/);
    });

    test('mockCall returns resumable upload location header', async () => {
      const res = await youtubeTransport.call({
        url: 'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable',
        method: 'POST',
      });
      expect(res.status).toBe(200);
      expect(res.headers.location).toMatch(/^mock:\/\/youtube\/upload\//);
    });

    test('mockCall returns video id on binary upload to mock location', async () => {
      const res = await youtubeTransport.call({
        url: 'mock://youtube/upload/uuid-1234',
        method: 'PUT',
        data: Buffer.from('test data'),
      });
      expect(res.status).toBe(200);
      expect(res.data.id).toMatch(/^mockVid_/);
      expect(res.data.status.uploadStatus).toBe('uploaded');
    });

    test('mockCall throws 500 when YOUTUBE_MOCK_FAIL is 1', async () => {
      process.env.YOUTUBE_MOCK_FAIL = '1';
      await expect(
        youtubeTransport.call({ url: 'https://oauth2.googleapis.com/token' })
      ).rejects.toThrow('mock failure');
      delete process.env.YOUTUBE_MOCK_FAIL;
    });
  });

  describe('2. OAuth Service', () => {
    test('buildAuthUrl contains required parameters access_type=offline and prompt=consent', () => {
      // In non-mock mode test
      delete process.env.YOUTUBE_MOCK;
      const url = youtubeOAuthService.buildAuthUrl('client_id_1', 'http://127.0.0.1/cb', 'test_state');
      expect(url).toContain('access_type=offline');
      expect(url).toContain('prompt=consent');
      expect(url).toContain('client_id=client_id_1');
      expect(url).toContain('state=test_state');
      process.env.YOUTUBE_MOCK = '1';
    });

    test('getValidAccessToken returns existing token if not expired', async () => {
      const account = await youtubeOAuthService.getAccount(testCompanyId);
      const token = await youtubeOAuthService.getValidAccessToken(account, testCompanyId);
      expect(token).toBe('mock_access_token_123');
    });

    test('getValidAccessToken refreshes token if expired', async () => {
      const account = await youtubeOAuthService.getAccount(testCompanyId);
      // Set expired timestamp
      await prisma.youTubeAccount.update({
        where: { id: account.id },
        data: { tokenExpiresAt: new Date(Date.now() - 10000) },
      });
      const refreshedAcc = await youtubeOAuthService.getAccount(testCompanyId);
      const token = await youtubeOAuthService.getValidAccessToken(refreshedAcc, testCompanyId);
      expect(token).toMatch(/^mock_at_/);
    });
  });

  describe('3. Publish Service & Video Lifecycle', () => {
    let createdVideoId;

    test('resolveLocalFilePath correctly locates /uploads/media/qa-sample.mp4', () => {
      const resolved = youtubePublishService.resolveLocalFilePath('/uploads/media/qa-sample.mp4');
      expect(resolved).not.toBeNull();
      expect(fs.existsSync(resolved)).toBe(true);
    });

    test('resolveLocalFilePath returns null for non-existent file', () => {
      const resolved = youtubePublishService.resolveLocalFilePath('/uploads/media/does-not-exist.mp4');
      expect(resolved).toBeNull();
    });

    test('create, upload, and poll status of a video', async () => {
      const account = await youtubeOAuthService.getAccount(testCompanyId);

      // Create video record in SCHEDULED status
      const video = await prisma.youTubeVideo.create({
        data: {
          companyId: testCompanyId,
          accountId: account.id,
          title: 'Jest QA Test Video',
          description: 'Testing publishing pipeline',
          tags: 'qa, jest, demo',
          privacyStatus: 'private',
          mediaUrl: '/uploads/media/qa-sample.mp4',
          status: 'SCHEDULED',
          scheduledAt: new Date(),
        },
      });
      createdVideoId = video.id;

      // Execute initUpload
      const uploaded = await youtubePublishService.initUpload({
        companyId: testCompanyId,
        account,
        video,
      });

      expect(uploaded.youtubeVideoId).toMatch(/^mockVid_/);
      expect(['PROCESSING', 'PUBLISHED']).toContain(uploaded.status);

      // Poll status should reach PUBLISHED in mock mode
      const finalVideo = await youtubePublishService.pollStatus(prisma, uploaded);
      expect(finalVideo.status).toBe('PUBLISHED');
      expect(finalVideo.publishedAt).toBeDefined();
    });

    test('cancel video is rejected if already PUBLISHED', async () => {
      await expect(
        youtubePublishService.cancel({ companyId: testCompanyId, id: createdVideoId })
      ).rejects.toThrow('يمكن إلغاء الفيديوهات المجدولة فقط');
    });

    test('cancel video succeeds if status is SCHEDULED', async () => {
      const v = await prisma.youTubeVideo.create({
        data: {
          companyId: testCompanyId,
          accountId: testAccountId,
          title: 'Video To Cancel',
          mediaUrl: '/uploads/media/qa-sample.mp4',
          status: 'SCHEDULED',
          scheduledAt: new Date(Date.now() + 60000),
        },
      });

      const cancelled = await youtubePublishService.cancel({ companyId: testCompanyId, id: v.id });
      expect(cancelled.status).toBe('CANCELLED');
    });

    test('retry video succeeds if status is FAILED and attempts < 5', async () => {
      const v = await prisma.youTubeVideo.create({
        data: {
          companyId: testCompanyId,
          accountId: testAccountId,
          title: 'Failed Video',
          mediaUrl: '/uploads/media/qa-sample.mp4',
          status: 'FAILED',
          errorMessage: 'Upload error test',
          attempts: 1,
        },
      });

      const retried = await youtubePublishService.retry({ companyId: testCompanyId, id: v.id });
      expect(retried.status).toBe('SCHEDULED');
      expect(retried.errorMessage).toBeNull();
    });

    test('retry video is rejected if attempts >= 5', async () => {
      const v = await prisma.youTubeVideo.create({
        data: {
          companyId: testCompanyId,
          accountId: testAccountId,
          title: 'Exhausted Video',
          mediaUrl: '/uploads/media/qa-sample.mp4',
          status: 'FAILED',
          errorMessage: 'Fatal error',
          attempts: 5,
        },
      });

      await expect(
        youtubePublishService.retry({ companyId: testCompanyId, id: v.id })
      ).rejects.toThrow('تم استنفاد الحد الأقصى للمحاولات');
    });
  });

  describe('4. Cron & Concurrency (Atomic Claim)', () => {
    test('runScheduledYouTubePublish processes due video and does not duplicate', async () => {
      // Create a due video
      const v = await prisma.youTubeVideo.create({
        data: {
          companyId: testCompanyId,
          accountId: testAccountId,
          title: 'Cron Due Video',
          mediaUrl: '/uploads/media/qa-sample.mp4',
          status: 'SCHEDULED',
          scheduledAt: new Date(Date.now() - 10000), // In the past -> due!
          attempts: 0,
        },
      });

      // Run cron job
      await runScheduledYouTubePublish();

      const afterFirstRun = await prisma.youTubeVideo.findUnique({ where: { id: v.id } });
      expect(['PROCESSING', 'PUBLISHED']).toContain(afterFirstRun.status);
      expect(afterFirstRun.attempts).toBe(1);

      // Run cron job a second time -> attempts must NOT increase (zero-duplicate guarantee)
      await runScheduledYouTubePublish();

      const afterSecondRun = await prisma.youTubeVideo.findUnique({ where: { id: v.id } });
      expect(afterSecondRun.attempts).toBe(1);
    });
  });
});
