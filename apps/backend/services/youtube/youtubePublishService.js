/**
 * youtubePublishService.js
 * YouTube video upload, scheduling, status polling, and management service.
 * Interacts with YouTube Data & Upload API v3 via youtubeTransport.js.
 */

const fs = require('fs');
const path = require('path');
const { getSharedPrismaClient } = require('../sharedDatabase');
const { getAccount, getValidAccessToken } = require('./youtubeOAuthService');
const youtubeTransport = require('./youtubeTransport');

const prisma = () => getSharedPrismaClient();

const STATUS_MAP = {
  uploaded: 'PROCESSING',
  processed: 'PUBLISHED',
  failed: 'FAILED',
  rejected: 'FAILED',
  deleted: 'FAILED',
};

const RESUMABLE_UPLOAD_BASE = 'https://www.googleapis.com/upload/youtube/v3/videos';
const YOUTUBE_VIDEOS_API = 'https://www.googleapis.com/youtube/v3/videos';

function resolveLocalFilePath(mediaUrl) {
  if (!mediaUrl || typeof mediaUrl !== 'string') return null;

  // Block directory traversal attempts
  const normalized = mediaUrl.replace(/\\/g, '/').trim();
  if (normalized.includes('..')) {
    return null;
  }

  const backendRoot = path.resolve(__dirname, '../..');
  const uploadsDir = path.resolve(backendRoot, 'uploads');

  // 1) First check if it refers to uploads folder (e.g. /uploads/media/xxx or uploads/media/xxx)
  const relativeFromUploads = normalized.replace(/^\/?(uploads\/)?/, '');
  const candidateInUploads = path.resolve(uploadsDir, relativeFromUploads);
  if (candidateInUploads.startsWith(uploadsDir) && fs.existsSync(candidateInUploads)) {
    return candidateInUploads;
  }

  // 2) If it's a full Windows drive-letter absolute path (e.g. C:/Users/.../uploads/media/xxx)
  if (/^[a-zA-Z]:[\\/]/.test(normalized)) {
    const resolvedAbs = path.resolve(normalized);
    const isInsideAllowed = resolvedAbs.startsWith(uploadsDir) || resolvedAbs.startsWith(backendRoot);
    if (isInsideAllowed && fs.existsSync(resolvedAbs)) {
      return resolvedAbs;
    }
    return null;
  }

  // 3) Check relative to backendRoot
  const candidateInBackend = path.resolve(backendRoot, normalized.replace(/^\//, ''));
  if (candidateInBackend.startsWith(backendRoot) && fs.existsSync(candidateInBackend)) {
    return candidateInBackend;
  }

  return null;
}

async function getAccountAccessToken(companyId, account = null) {
  const acc = account || (await getAccount(companyId));
  if (!acc) {
    const error = new Error('اربط قناة YouTube أولاً');
    error.code = 'NO_ACCOUNT';
    throw error;
  }
  const accessToken = await getValidAccessToken(acc, companyId);
  if (!accessToken) {
    const error = new Error('توكن قناة YouTube غير صالح، أعد ربط القناة');
    error.code = 'NO_ACCESS_TOKEN';
    throw error;
  }
  return { account: acc, accessToken };
}

async function initUpload({ companyId, account, video }) {
  const db = prisma();
  const filePath = resolveLocalFilePath(video.mediaUrl);
  if (!filePath) {
    const err = new Error('ملف الفيديو غير موجود على السيرفر');
    err.code = 'FILE_NOT_FOUND';
    throw err;
  }

  const { account: resolvedAccount, accessToken } = await getAccountAccessToken(companyId, account);
  const stats = fs.statSync(filePath);
  const fileSize = stats.size;

  // 1) Initiate resumable upload session
  const tagsList = video.tags
    ? String(video.tags).split(',').map(t => t.trim()).filter(Boolean)
    : [];

  const metadata = {
    snippet: {
      title: video.title,
      description: video.description || '',
      tags: tagsList,
      categoryId: video.categoryId || '22',
    },
    status: {
      privacyStatus: video.privacyStatus || 'private',
      selfDeclaredMadeForKids: Boolean(video.madeForKids),
    },
  };

  const initRes = await youtubeTransport.call({
    method: 'POST',
    url: `${RESUMABLE_UPLOAD_BASE}?uploadType=resumable&part=snippet,status`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Type': 'video/*',
      'X-Upload-Content-Length': String(fileSize),
    },
    data: metadata,
  });

  const uploadLocation = initRes.headers?.location || initRes.headers?.Location;
  if (!uploadLocation) {
    const err = new Error('فشل الحصول على رابط جلسة الرفع من YouTube');
    err.code = 'UPLOAD_SESSION_FAILED';
    throw err;
  }

  // 2) Upload the video stream / binary
  let fileStream;
  if (youtubeTransport.isMock()) {
    // In mock mode, don't keep an open file stream handle
    fileStream = Buffer.from('mock video binary content');
  } else {
    fileStream = fs.createReadStream(filePath);
  }

  const uploadRes = await youtubeTransport.call({
    method: 'PUT',
    url: uploadLocation,
    headers: {
      'Content-Type': 'video/*',
      'Content-Length': String(fileSize),
    },
    data: fileStream,
  });

  const youtubeVideoId = uploadRes.data?.id;
  if (!youtubeVideoId) {
    const err = new Error('لم يتم إرجاع معرف الفيديو من YouTube بعد الرفع');
    err.code = 'UPLOAD_FAILED';
    throw err;
  }

  // 3) Update video row in database
  const uploadStatus = uploadRes.data?.status?.uploadStatus;
  const isDirectlyProcessed = uploadStatus === 'processed';

  const updated = await db.youTubeVideo.update({
    where: { id: video.id },
    data: {
      status: isDirectlyProcessed ? 'PUBLISHED' : 'PROCESSING',
      youtubeVideoId,
      uploadSessionUri: uploadLocation,
      startedAt: new Date(),
      publishedAt: isDirectlyProcessed ? new Date() : null,
      errorMessage: null,
    },
  });

  // If still processing, trigger initial status poll
  if (!isDirectlyProcessed) {
    return pollStatus(db, updated);
  }

  return updated;
}

async function pollStatus(dbClient, video) {
  if (!video || !video.youtubeVideoId) return video;
  if (video.status === 'PUBLISHED' || video.status === 'CANCELLED') {
    return video;
  }

  const db = dbClient || prisma();
  const { accessToken } = await getAccountAccessToken(video.companyId);

  let ytRes;
  try {
    ytRes = await youtubeTransport.call({
      method: 'GET',
      url: `${YOUTUBE_VIDEOS_API}?part=status,snippet&id=${encodeURIComponent(video.youtubeVideoId)}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (error) {
    console.error('❌ [YouTube Publish] Status polling error:', error.response?.data || error.message);
    const failureMsg = error.response?.data?.error?.message || error.message || 'فشل الاتصال بـ YouTube أثناء الاستعلام عن الحالة';
    return db.youTubeVideo.update({
      where: { id: video.id },
      data: {
        status: 'FAILED',
        errorMessage: failureMsg,
      },
    });
  }

  const item = ytRes.data?.items?.[0];
  if (!item) {
    return video;
  }

  const uploadStatus = item.status?.uploadStatus;
  const failureReason = item.status?.failureReason;
  const mappedStatus = STATUS_MAP[uploadStatus] || 'PROCESSING';

  const updateData = {};
  if (mappedStatus === 'PUBLISHED') {
    updateData.status = 'PUBLISHED';
    updateData.publishedAt = video.publishedAt || new Date();
    updateData.errorMessage = null;
  } else if (mappedStatus === 'FAILED') {
    updateData.status = 'FAILED';
    updateData.errorMessage = failureReason || 'فشل معالجة الفيديو على YouTube';
  } else if (mappedStatus === 'PROCESSING') {
    updateData.status = 'PROCESSING';
  }

  if (Object.keys(updateData).length > 0) {
    return db.youTubeVideo.update({
      where: { id: video.id },
      data: updateData,
    });
  }

  return video;
}

async function listPosts({ companyId, page, limit, status }) {
  const db = prisma();
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  const where = { companyId };
  if (status) {
    where.status = status;
  }

  const [total, videos] = await Promise.all([
    db.youTubeVideo.count({ where }),
    db.youTubeVideo.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
  ]);

  const accountIds = [...new Set(videos.map(v => v.accountId).filter(Boolean))];
  const accounts = accountIds.length > 0
    ? await db.youTubeAccount.findMany({
        where: { id: { in: accountIds } },
        select: { id: true, channelId: true, channelTitle: true, avatarUrl: true },
      })
    : [];

  const accountMap = new Map(accounts.map(a => [a.id, a]));
  const data = videos.map(v => ({
    ...v,
    account: accountMap.get(v.accountId) || null,
  }));

  return {
    data,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.max(1, Math.ceil(total / limitNum)),
    },
  };
}

async function cancel({ companyId, id }) {
  const db = prisma();
  const video = await db.youTubeVideo.findFirst({
    where: { id, companyId },
  });

  if (!video) {
    const err = new Error('الفيديو غير موجود');
    err.code = 'NOT_FOUND';
    throw err;
  }

  if (video.status !== 'SCHEDULED') {
    const err = new Error('يمكن إلغاء الفيديوهات المجدولة فقط قبل بدء النشر');
    err.code = 'INVALID_STATUS';
    throw err;
  }

  return db.youTubeVideo.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });
}

async function retry({ companyId, id }) {
  const db = prisma();
  const video = await db.youTubeVideo.findFirst({
    where: { id, companyId },
  });

  if (!video) {
    const err = new Error('الفيديو غير موجود');
    err.code = 'NOT_FOUND';
    throw err;
  }

  if (video.status !== 'FAILED') {
    const err = new Error('يمكن إعادة المحاولة فقط للفيديوهات الفاشلة');
    err.code = 'INVALID_STATUS';
    throw err;
  }

  if (video.attempts >= 5) {
    const err = new Error('تم استنفاد الحد الأقصى للمحاولات (5 محاولات)');
    err.code = 'MAX_ATTEMPTS_EXCEEDED';
    throw err;
  }

  return db.youTubeVideo.update({
    where: { id },
    data: {
      status: 'SCHEDULED',
      scheduledAt: new Date(),
      errorMessage: null,
    },
  });
}

async function updateScheduledVideo({ companyId, id, title, description, tags, privacyStatus, scheduledAt }) {
  const db = prisma();
  const video = await db.youTubeVideo.findFirst({
    where: { id, companyId },
  });

  if (!video) {
    const err = new Error('الفيديو غير موجود');
    err.code = 'NOT_FOUND';
    throw err;
  }

  if (video.status !== 'SCHEDULED') {
    const err = new Error('لا يمكن تعديل الفيديو بعد بدء رفعه أو نشره');
    err.code = 'INVALID_STATUS';
    throw err;
  }

  const data = {};
  if (title !== undefined) {
    if (!title || typeof title !== 'string' || title.trim().length === 0 || title.trim().length > 100) {
      const err = new Error('عنوان الفيديو مطلوب ويجب ألا يتجاوز 100 حرف');
      err.code = 'INVALID_TITLE';
      throw err;
    }
    data.title = title.trim();
  }
  if (description !== undefined) {
    data.description = description ? String(description).slice(0, 5000) : null;
  }
  if (tags !== undefined) {
    data.tags = tags ? String(tags) : null;
  }
  if (privacyStatus !== undefined) {
    data.privacyStatus = ['private', 'unlisted', 'public'].includes(privacyStatus) ? privacyStatus : 'private';
  }
  if (scheduledAt !== undefined) {
    const parsedDate = new Date(scheduledAt);
    if (Number.isNaN(parsedDate.getTime())) {
      const err = new Error('تاريخ الجدولة غير صالح');
      err.code = 'INVALID_SCHEDULE_DATE';
      throw err;
    }
    data.scheduledAt = parsedDate;
  }

  return db.youTubeVideo.update({
    where: { id },
    data,
  });
}

module.exports = {
  STATUS_MAP,
  resolveLocalFilePath,
  initUpload,
  pollStatus,
  listPosts,
  cancel,
  retry,
  updateScheduledVideo,
};
