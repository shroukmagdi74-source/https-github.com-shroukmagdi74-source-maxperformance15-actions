/**
 * youtubeAuthController.js
 * Handles OAuth2 login URL generation, callback handling with HMAC state verification,
 * and YouTube connection status endpoint.
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../utils/jwtSecret');
const youtubeOAuthService = require('../services/youtube/youtubeOAuthService');

function signOAuthState(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = getJwtSecret();
  const signature = crypto
    .createHmac('sha256', secret)
    .update(encoded)
    .digest('hex');
  return `${encoded}.${signature}`;
}

function verifyOAuthState(state) {
  if (typeof state !== 'string' || !state.includes('.')) {
    return { ok: false, reason: 'missing_dot' };
  }

  const dotIndex = state.lastIndexOf('.');
  const encoded = state.slice(0, dotIndex);
  const signature = state.slice(dotIndex + 1);

  let payload;
  try {
    payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (!payload || typeof payload !== 'object') {
      return { ok: false, reason: 'invalid_payload' };
    }
  } catch (e) {
    return { ok: false, reason: 'decode_error' };
  }

  const secret = getJwtSecret();
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(encoded)
    .digest('hex');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSig);

  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return { ok: false, reason: 'bad_signature' };
  }

  // 10 minutes expiry window
  if (!payload.ts || Date.now() - payload.ts > 10 * 60 * 1000) {
    return { ok: false, reason: 'expired' };
  }

  return { ok: true, payload };
}

function extractCompanyId(req) {
  if (req.user?.companyId) {
    return req.user.companyId;
  }

  // Check Bearer token in Authorization header if present
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.slice(7).trim();
      const decoded = jwt.verify(token, getJwtSecret());
      if (decoded?.companyId) return decoded.companyId;
    } catch (e) {
      // ignore
    }
  }

  // Only allow query companyId in non-production / testing mode
  if (process.env.NODE_ENV !== 'production' && req.query?.companyId) {
    return String(req.query.companyId).trim();
  }

  // QA Lab fallback when mock mode is active
  if (process.env.YOUTUBE_MOCK === '1') {
    return 'qr5vitkkllbbksib3tu9walg';
  }

  return null;
}

exports.login = async (req, res) => {
  try {
    const companyId = extractCompanyId(req);
    if (!companyId) {
      return res.status(400).json({ success: false, error: 'companyId مطلوب' });
    }

    const userId = req.user?.id || req.user?.userId || 'admin';
    const state = signOAuthState({
      cid: companyId,
      uid: userId,
      ts: Date.now(),
      type: 'youtube',
    });

    const settings = await youtubeOAuthService.getSettings(companyId);
    const { clientId } = youtubeOAuthService.getAppCredentials(settings);
    const redirectUri = youtubeOAuthService.getRedirectUri();
    const authUrl = youtubeOAuthService.buildAuthUrl(clientId, redirectUri, state);

    if (req.query?.redirect === 'true') {
      return res.redirect(authUrl);
    }

    return res.json({
      success: true,
      url: authUrl,
    });
  } catch (error) {
    console.error('❌ [YouTube Auth] Login URL creation error:', error);
    return res.status(500).json({ success: false, error: 'فشل إنشاء رابط تسجيل الدخول لـ YouTube' });
  }
};

exports.callback = async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      console.warn('⚠️ [YouTube Auth] Callback returned error from provider:', error);
      return res.redirect('/youtube/publish?error=' + encodeURIComponent(String(error)));
    }

    if (!code || !state) {
      return res.status(400).send('كود التفويض أو حالة الطلب غير صالحة');
    }

    const verified = verifyOAuthState(state);
    if (!verified.ok) {
      console.error('❌ [YouTube Auth] OAuth state verification failed:', verified.reason);
      return res.status(400).send('حالة التحقق الأمنية غير صالحة أو منتهية الصلاحية');
    }

    const companyId = verified.payload.cid;
    const settings = await youtubeOAuthService.getSettings(companyId);
    const { clientId, clientSecret } = youtubeOAuthService.getAppCredentials(settings);
    const redirectUri = youtubeOAuthService.getRedirectUri();

    const tokenData = await youtubeOAuthService.exchangeCodeForToken(
      code,
      redirectUri,
      clientId,
      clientSecret
    );

    if (!tokenData?.access_token) {
      return res.redirect('/youtube/publish?error=token_exchange_failed');
    }

    const channelInfo = await youtubeOAuthService.fetchChannel(tokenData.access_token);
    await youtubeOAuthService.saveToken(companyId, tokenData, channelInfo);

    // Redirect to frontend YouTube Publish page with success indicator
    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendBase}/youtube/publish?auth=success`);
  } catch (error) {
    console.error('❌ [YouTube Auth] Callback error:', error);
    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendBase}/youtube/publish?error=server_error`);
  }
};

exports.me = async (req, res) => {
  try {
    const companyId = req.user?.companyId || extractCompanyId(req);
    if (!companyId) {
      return res.status(401).json({ success: false, error: 'غير مصرح' });
    }

    const account = await youtubeOAuthService.getAccount(companyId);
    return res.json({
      success: true,
      data: account || null,
    });
  } catch (error) {
    console.error('❌ [YouTube Auth] me error:', error);
    return res.status(500).json({ success: false, error: 'فشل جلب بيانات الحساب' });
  }
};
