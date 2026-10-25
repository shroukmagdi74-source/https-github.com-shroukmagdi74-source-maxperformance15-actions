'use strict';

/**
 * Transport-level resilience for calls into the Python AI service.
 *
 * Every production deploy restarts the AI service process, so a merchant who
 * happens to hit «سليم» during the restart window used to get a raw
 * `[INTERNAL_ERROR] fetch failed` bubble in the copilot. These helpers keep that
 * transient window invisible: retry only connection-level failures (the request
 * never reached the service, so a retry cannot double-charge a model call) and
 * let the controller answer with a friendly Arabic 503 instead of leaking a
 * Node error message.
 */

const TRANSIENT_CODES = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'ECONNABORTED',
  'ETIMEDOUT',
  'EPIPE',
  'ENOTFOUND',
  'EAI_AGAIN',
  'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_SOCKET',
  'EHOSTUNREACH',
  'ENETUNREACH',
]);

const TRANSIENT_MESSAGE_RE =
  /fetch failed|socket hang up|network error|other side closed|connection (?:refused|reset)|terminated/i;

function isTransientAiTransportError(error) {
  if (!error) return false;
  const code = String(error.code || error.cause?.code || '').toUpperCase();
  if (code && TRANSIENT_CODES.has(code)) return true;
  const message = String(error.message || error.cause?.message || '');
  return TRANSIENT_MESSAGE_RE.test(message);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Runs `fn` and retries it when it fails with a transient transport error.
 * Non-transient errors (4xx from the service, model errors, …) are rethrown
 * immediately so real failures are never masked or double-logged.
 */
async function retryAiTransport(fn, { attempts = 3, baseDelayMs = 400 } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isTransientAiTransportError(error) || attempt === attempts) {
        throw error;
      }
      await sleep(baseDelayMs * attempt);
    }
  }
  throw lastError;
}

const AI_SERVICE_UNREACHABLE_MESSAGE =
  'المساعد بيستعيد نفسه دلوقتي — جرّب تبعت الرسالة تاني بعد لحظات.';

module.exports = {
  isTransientAiTransportError,
  retryAiTransport,
  AI_SERVICE_UNREACHABLE_MESSAGE,
  TRANSIENT_CODES,
};
