// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getSessionId,
  setStorefrontCompanySlug,
  resolveStorefrontCompanySlug,
  sendAnalyticsEvent,
  trackView,
  trackClick,
  observeSectionView,
} from '../analytics/beacon';
import {
  resetConsentCache,
  writeCookieConsent,
} from '../compliance/consentStore';

describe('Storefront Analytics Beacon (AN-1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    // COMPLY-1: visitor tracking (view/click) only runs after an explicit
    // "granted" decision, so these dispatch tests seed that decision.
    writeCookieConsent('granted');
    setStorefrontCompanySlug('swan-store');
  });

  describe('Session ID & Company Slug resolution', () => {
    it('generates a random sessionId and stores it in sessionStorage', () => {
      const sid = getSessionId();
      expect(sid).toMatch(/^sf_/);
      expect(window.sessionStorage.getItem('sf_analytics_session_id')).toBe(sid);

      // Re-calling returns the exact same session ID
      const secondCall = getSessionId();
      expect(secondCall).toBe(sid);
    });

    it('resolves companySlug from explicit argument or storage', () => {
      expect(resolveStorefrontCompanySlug('merchant-123')).toBe('merchant-123');
      expect(resolveStorefrontCompanySlug()).toBe('swan-store');
    });
  });

  describe('Event Dispatch: sendBeacon & fetch fallback', () => {
    it('uses navigator.sendBeacon when available', () => {
      const sendBeaconMock = vi.fn().mockReturnValue(true);
      Object.defineProperty(navigator, 'sendBeacon', {
        value: sendBeaconMock,
        writable: true,
        configurable: true,
      });

      const sent = sendAnalyticsEvent({
        companySlug: 'swan-store',
        pageKey: 'home',
        sectionType: 'hero-banner',
        eventType: 'view',
      });

      expect(sent).toBe(true);
      expect(sendBeaconMock).toHaveBeenCalledTimes(1);

      const [url, blob] = sendBeaconMock.mock.calls[0];
      expect(url).toContain('/storefront-analytics/event');
      expect(blob).toBeInstanceOf(Blob);
    });

    it('falls back to fetch with keepalive when sendBeacon returns false', async () => {
      const sendBeaconMock = vi.fn().mockReturnValue(false);
      Object.defineProperty(navigator, 'sendBeacon', {
        value: sendBeaconMock,
        writable: true,
        configurable: true,
      });

      const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true })));
      global.fetch = fetchMock;

      const sent = sendAnalyticsEvent({
        companySlug: 'swan-store',
        pageKey: 'product',
        sectionType: 'cta',
        eventType: 'click',
      });

      expect(sent).toBe(true);
      expect(sendBeaconMock).toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/storefront-analytics/event'),
        expect.objectContaining({
          method: 'POST',
          keepalive: true,
        })
      );
    });

    it('trackView and trackClick helpers dispatch correct event types', () => {
      const sendBeaconMock = vi.fn().mockReturnValue(true);
      Object.defineProperty(navigator, 'sendBeacon', {
        value: sendBeaconMock,
        writable: true,
        configurable: true,
      });

      trackView('home', 'hero');
      expect(sendBeaconMock).toHaveBeenCalledTimes(1);

      trackClick('home', 'cta-buy');
      expect(sendBeaconMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('IntersectionObserver section tracking', () => {
    it('observes element and triggers view event once per section per session', () => {
      let observerCallback: (entries: any[]) => void = () => {};
      const unobserveMock = vi.fn();
      const disconnectMock = vi.fn();

      class MockIntersectionObserver {
        constructor(callback: any) {
          observerCallback = callback;
        }
        observe = vi.fn();
        unobserve = unobserveMock;
        disconnect = disconnectMock;
      }

      Object.defineProperty(window, 'IntersectionObserver', {
        value: MockIntersectionObserver,
        writable: true,
        configurable: true,
      });

      const sendBeaconMock = vi.fn().mockReturnValue(true);
      Object.defineProperty(navigator, 'sendBeacon', {
        value: sendBeaconMock,
        writable: true,
        configurable: true,
      });

      const div = document.createElement('div');
      const cleanup = observeSectionView(div, 'home', 'featured-products', 'swan-store');

      // Trigger intersection
      observerCallback([{ isIntersecting: true, target: div }]);

      expect(sendBeaconMock).toHaveBeenCalledTimes(1);
      expect(unobserveMock).toHaveBeenCalledWith(div);

      // Re-triggering or second observation of the same section in the session does not double-fire
      const div2 = document.createElement('div');
      observeSectionView(div2, 'home', 'featured-products', 'swan-store');
      expect(sendBeaconMock).toHaveBeenCalledTimes(1);

      cleanup();
    });
  });
});
