/**
 * youtubePublishCron.js
 * Background cron job for scheduled YouTube video publishing and status reconciliation.
 * Uses atomic DB updates (updateMany) to guarantee exactly-once processing across instances.
 */

const cron = require('node-cron');
const { getSharedPrismaClient } = require('../services/sharedDatabase');
const youtubePublishService = require('../services/youtube/youtubePublishService');
const youtubeOAuthService = require('../services/youtube/youtubeOAuthService');

const prisma = () => getSharedPrismaClient();

let isRunning = false;

async function runScheduledYouTubePublish() {
  if (isRunning) {
    return;
  }
  isRunning = true;

  try {
    const db = prisma();

    // 0) Recover zombie uploads (stuck in UPLOADING for > 30 minutes without youtubeVideoId)
    const timeout30m = new Date(Date.now() - 30 * 60 * 1000);
    await db.youTubeVideo.updateMany({
      where: {
        status: 'UPLOADING',
        youtubeVideoId: null,
        startedAt: { lt: timeout30m },
      },
      data: {
        status: 'FAILED',
        errorMessage: 'انتهت مهلة جلسة الرفع على السيرفر قبل استلام المعرف من YouTube',
      },
    });

    // 1) Query due scheduled videos
    const dueVideos = await db.youTubeVideo.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: { lte: new Date() },
        attempts: { lt: 5 },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 10,
    });

    for (const v of dueVideos) {
      // 🔒 Atomic claim to ensure zero-duplicate upload execution
      const claimed = await db.youTubeVideo.updateMany({
        where: { id: v.id, status: 'SCHEDULED' },
        data: {
          status: 'UPLOADING',
          startedAt: new Date(),
          attempts: { increment: 1 },
        },
      });

      if (claimed.count !== 1) {
        // Another instance or thread claimed this item
        continue;
      }

      try {
        const account = await youtubeOAuthService.getAccount(v.companyId);
        await youtubePublishService.initUpload({
          companyId: v.companyId,
          account,
          video: v,
        });
      } catch (err) {
        console.error(`❌ [YouTube Cron] Failed to upload video ${v.id}:`, err.message);
        await db.youTubeVideo.update({
          where: { id: v.id },
          data: {
            status: 'FAILED',
            errorMessage: err.message || 'فشل رفع الفيديو على YouTube',
          },
        });
      }
    }

    // 2) Poll status for ongoing uploads / processing videos (last 24 hours)
    const cutoff24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const inProgress = await db.youTubeVideo.findMany({
      where: {
        status: { in: ['UPLOADING', 'PROCESSING'] },
        startedAt: { gte: cutoff24h },
        youtubeVideoId: { not: null },
      },
      take: 10,
    });

    for (const item of inProgress) {
      try {
        await youtubePublishService.pollStatus(db, item);
      } catch (pollErr) {
        console.error(`⚠️ [YouTube Cron] Status poll failed for video ${item.id}:`, pollErr.message);
      }
    }
  } catch (error) {
    console.error('❌ [YouTube Cron] Job execution error:', error.message);
  } finally {
    isRunning = false;
  }
}

function startYouTubePublishCron() {
  cron.schedule('* * * * *', runScheduledYouTubePublish);

  // Initial trigger after 5 seconds
  setTimeout(() => {
    runScheduledYouTubePublish().catch((err) => {
      console.error('❌ [YouTube Cron] Initial run error:', err.message);
    });
  }, 5000);
}

module.exports = {
  runScheduledYouTubePublish,
  startYouTubePublishCron,
};
