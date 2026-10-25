'use strict';

const {
  isTransientAiTransportError,
  retryAiTransport,
  AI_SERVICE_UNREACHABLE_MESSAGE,
} = require('../../services/aiServiceRetry');

describe('aiServiceRetry', () => {
  describe('isTransientAiTransportError', () => {
    it('treats a Node fetch connection failure as transient', () => {
      // Exactly what the copilot surfaced live: [INTERNAL_ERROR] fetch failed
      expect(isTransientAiTransportError(new TypeError('fetch failed'))).toBe(true);
    });

    it('recognises connection error codes (direct and nested cause)', () => {
      expect(isTransientAiTransportError(Object.assign(new Error('boom'), { code: 'ECONNREFUSED' }))).toBe(true);
      expect(isTransientAiTransportError(Object.assign(new Error('reset'), { code: 'ECONNRESET' }))).toBe(true);
      expect(
        isTransientAiTransportError(
          Object.assign(new TypeError('fetch failed'), { cause: { code: 'UND_ERR_CONNECT_TIMEOUT' } }),
        ),
      ).toBe(true);
    });

    it('does not retry real service/model failures', () => {
      expect(isTransientAiTransportError(null)).toBe(false);
      expect(isTransientAiTransportError(Object.assign(new Error('الموديل لم يرجع رد صالح'), { code: 'AI_AGENT_EMPTY_REPLY' }))).toBe(false);
      expect(isTransientAiTransportError(new Error('400 Bad Request'))).toBe(false);
    });
  });

  describe('retryAiTransport', () => {
    it('retries a transient failure and returns the eventual result', async () => {
      let calls = 0;
      const result = await retryAiTransport(
        async () => {
          calls += 1;
          if (calls < 3) throw new TypeError('fetch failed');
          return 'ok';
        },
        { attempts: 3, baseDelayMs: 1 },
      );
      expect(result).toBe('ok');
      expect(calls).toBe(3);
    });

    it('rethrows a non-transient error immediately (no extra calls)', async () => {
      let calls = 0;
      await expect(
        retryAiTransport(
          async () => {
            calls += 1;
            throw Object.assign(new Error('bad request'), { code: 'HTTP_400' });
          },
          { attempts: 3, baseDelayMs: 1 },
        ),
      ).rejects.toThrow('bad request');
      expect(calls).toBe(1);
    });

    it('gives up after the configured attempts and rethrows the transport error', async () => {
      let calls = 0;
      await expect(
        retryAiTransport(
          async () => {
            calls += 1;
            throw new TypeError('fetch failed');
          },
          { attempts: 2, baseDelayMs: 1 },
        ),
      ).rejects.toThrow('fetch failed');
      expect(calls).toBe(2);
    });

    it('exposes an Arabic, retry-oriented message for the 503 path', () => {
      expect(AI_SERVICE_UNREACHABLE_MESSAGE).toMatch(/جرّب/);
      expect(AI_SERVICE_UNREACHABLE_MESSAGE).not.toMatch(/fetch failed|INTERNAL_ERROR/);
    });
  });
});
