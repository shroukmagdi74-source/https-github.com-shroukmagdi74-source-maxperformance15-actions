/**
 * youtubeTransport.js
 * Centralized transport wrapper for all external YouTube & Google OAuth requests.
 * In testing / mock mode (process.env.YOUTUBE_MOCK === '1'), intercepts all HTTP calls
 * to provide deterministic mock responses without hitting external APIs.
 */

const axios = require('axios');
const crypto = require('crypto');

function isMock() {
  return process.env.YOUTUBE_MOCK === '1';
}

async function mockCall(config) {
  if (process.env.YOUTUBE_MOCK_FAIL === '1') {
    const error = new Error('mock failure');
    error.response = {
      status: 500,
      data: { error: { code: 500, message: 'mock failure' } },
    };
    throw error;
  }

  const url = String(config.url || '');
  const method = String(config.method || 'GET').toUpperCase();

  // 1) OAuth Token exchange or refresh
  if (url.includes('oauth2.googleapis.com/token') || url.includes('/token')) {
    const isRefresh = (typeof config.data === 'string' && config.data.includes('grant_type=refresh_token')) ||
      (config.data && config.data.grant_type === 'refresh_token');
    return {
      status: 200,
      data: {
        access_token: 'mock_at_' + crypto.randomBytes(8).toString('hex'),
        refresh_token: isRefresh ? undefined : 'mock_rt_' + crypto.randomBytes(8).toString('hex'),
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly',
      },
    };
  }

  // 2) Channel details: mine=true
  if (url.includes('/youtube/v3/channels')) {
    return {
      status: 200,
      data: {
        items: [
          {
            id: 'mock_channel',
            snippet: {
              title: 'QA Channel',
              description: 'QA Channel Description',
              thumbnails: {
                default: { url: 'https://example.com/mock-avatar.png' },
              },
            },
          },
        ],
      },
    };
  }

  // 3) Resumable video upload initiation
  if (url.includes('/upload/youtube/v3/videos') && (url.includes('uploadType=resumable') || config.params?.uploadType === 'resumable')) {
    const sessionUuid = crypto.randomUUID();
    return {
      status: 200,
      headers: {
        location: `mock://youtube/upload/${sessionUuid}`,
      },
      data: {},
    };
  }

  // 4) Upload video binary to resumable upload URI
  if (url.startsWith('mock://youtube/upload/') || (method === 'PUT' && url.includes('mock://'))) {
    const vidId = 'mockVid_' + crypto.randomBytes(6).toString('hex');
    return {
      status: 200,
      data: {
        id: vidId,
        status: {
          uploadStatus: 'uploaded',
        },
      },
    };
  }

  // 5) Video status and details polling
  if (url.includes('/youtube/v3/videos')) {
    const videoId = config.params?.id || 'mockVid_default';
    return {
      status: 200,
      data: {
        items: [
          {
            id: videoId,
            snippet: {
              title: 'QA Video',
              description: 'Uploaded via QA',
            },
            status: {
              uploadStatus: 'processed',
              privacyStatus: config.params?.privacyStatus || 'private',
              failureReason: null,
            },
          },
        ],
      },
    };
  }

  // Fallback mock response
  return {
    status: 200,
    data: { success: true, mock: true },
  };
}

async function call(config) {
  if (isMock()) {
    return mockCall(config);
  }
  return axios({ timeout: 20000, ...config });
}

module.exports = {
  call,
  isMock,
  get MOCK() {
    return isMock();
  },
};
