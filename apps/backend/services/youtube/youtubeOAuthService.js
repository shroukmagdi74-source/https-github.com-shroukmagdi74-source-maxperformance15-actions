/**
 * youtubeOAuthService.js
 * YouTube OAuth2 authentication, token lifecycle, and channel information service.
 * All HTTP requests route through youtubeTransport.js for mock injection.
 */

const { getSharedPrismaClient } = require('../sharedDatabase');
const youtubeTransport = require('./youtubeTransport');

const GOOGLE_AUTH_BASE = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const YOUTUBE_CHANNELS_URL = 'https://www.googleapis.com/youtube/v3/channels';
const YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.readonly',
].join(' ');

const prisma = () => getSharedPrismaClient();

function getRedirectUri() {
  const envUri = (process.env.YOUTUBE_REDIRECT_URI || '').trim();
  if (envUri) return envUri;
  const port = process.env.PORT || '3101';
  return `http://127.0.0.1:${port}/api/v1/youtube/auth/callback`;
}

function getAppCredentials(settings) {
  const clientId = settings?.clientId || process.env.YOUTUBE_CLIENT_ID || (youtubeTransport.isMock() ? 'mock_client_id' : '');
  const clientSecret = settings?.clientSecret || process.env.YOUTUBE_CLIENT_SECRET || (youtubeTransport.isMock() ? 'mock_client_secret' : '');
  return {
    clientId: String(clientId).trim(),
    clientSecret: String(clientSecret).trim(),
  };
}

async function getSettings(companyId) {
  return prisma().youTubeSettings.findUnique({ where: { companyId } });
}

async function getAccount(companyId) {
  return prisma().youTubeAccount.findFirst({
    where: { companyId, status: 'connected' },
    orderBy: { updatedAt: 'desc' },
  });
}

async function upsertAccount(companyId, data) {
  const channelId = data.channelId;
  const existing = channelId
    ? await prisma().youTubeAccount.findUnique({
        where: { companyId_channelId: { companyId, channelId } },
      })
    : null;

  if (existing) {
    return prisma().youTubeAccount.update({
      where: { id: existing.id },
      data,
    });
  }
  return prisma().youTubeAccount.create({
    data: { companyId, ...data },
  });
}

async function saveToken(companyId, tokenData, channelInfo = {}) {
  const {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: expiresIn,
    scope,
  } = tokenData;

  const scopes = Array.isArray(scope)
    ? scope.join(' ')
    : (typeof scope === 'string' ? scope : YOUTUBE_SCOPES);

  const tokenExpiresAt = expiresIn
    ? new Date(Date.now() + Number(expiresIn) * 1000)
    : null;

  const channelId = channelInfo.channelId || 'mock_channel';
  const channelTitle = channelInfo.channelTitle || 'QA Channel';
  const avatarUrl = channelInfo.avatarUrl || null;

  return upsertAccount(companyId, {
    channelId,
    channelTitle,
    avatarUrl,
    accessToken,
    refreshToken: refreshToken || null,
    tokenExpiresAt,
    scopes,
    source: 'oauth',
    status: 'connected',
    lastSyncedAt: new Date(),
  });
}

function buildAuthUrl(clientId, redirectUri, state) {
  if (youtubeTransport.isMock()) {
    // In mock testing mode, direct the browser straight to callback with code=mock
    const params = new URLSearchParams({
      code: 'mock_code',
      state,
    });
    return `${redirectUri}?${params.toString()}`;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    scope: YOUTUBE_SCOPES,
    state,
  });
  return `${GOOGLE_AUTH_BASE}?${params.toString()}`;
}

async function exchangeCodeForToken(code, redirectUri, clientId, clientSecret) {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  });

  const res = await youtubeTransport.call({
    method: 'POST',
    url: GOOGLE_TOKEN_URL,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data: body.toString(),
  });
  return res.data;
}

async function refreshAccessToken(refreshToken, clientId, clientSecret) {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  const res = await youtubeTransport.call({
    method: 'POST',
    url: GOOGLE_TOKEN_URL,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data: body.toString(),
  });
  return res.data;
}

async function getValidAccessToken(account, companyId) {
  if (!account) return null;
  const now = new Date();
  const isExpiringSoon = account.tokenExpiresAt &&
    new Date(account.tokenExpiresAt).getTime() - now.getTime() < 5 * 60 * 1000;

  if (!isExpiringSoon && account.accessToken) {
    return account.accessToken;
  }

  if (!account.refreshToken) {
    return account.accessToken || null;
  }

  try {
    const settings = await getSettings(companyId);
    const { clientId, clientSecret } = getAppCredentials(settings);
    const data = await refreshAccessToken(account.refreshToken, clientId, clientSecret);
    const newToken = data?.access_token;
    if (newToken) {
      const expiresIn = data?.expires_in;
      const tokenExpiresAt = expiresIn
        ? new Date(Date.now() + Number(expiresIn) * 1000)
        : null;
      await prisma().youTubeAccount.update({
        where: { id: account.id },
        data: {
          accessToken: newToken,
          refreshToken: data?.refresh_token || account.refreshToken,
          tokenExpiresAt,
        },
      });
      return newToken;
    }
  } catch (err) {
    console.error('❌ [YouTube OAuth] Token refresh failed:', err.response?.data || err.message);
  }
  return account.accessToken || null;
}

async function fetchChannel(accessToken) {
  const res = await youtubeTransport.call({
    method: 'GET',
    url: `${YOUTUBE_CHANNELS_URL}?part=snippet&mine=true`,
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const item = res.data?.items?.[0];
  if (!item) {
    return {
      channelId: 'mock_channel',
      channelTitle: 'YouTube Channel',
      avatarUrl: null,
    };
  }

  return {
    channelId: item.id,
    channelTitle: item.snippet?.title || 'YouTube Channel',
    avatarUrl: item.snippet?.thumbnails?.default?.url || null,
  };
}

module.exports = {
  getRedirectUri,
  getAppCredentials,
  getSettings,
  getAccount,
  upsertAccount,
  saveToken,
  buildAuthUrl,
  exchangeCodeForToken,
  refreshAccessToken,
  getValidAccessToken,
  fetchChannel,
};
