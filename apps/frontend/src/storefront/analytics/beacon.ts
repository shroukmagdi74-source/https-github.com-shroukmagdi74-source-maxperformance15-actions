/**
 * 📊 Storefront Analytics Beacon (AN-1)
 *
 * Privacy-first storefront tracking beacon:
 * - Uses navigator.sendBeacon with fetch keepalive fallback
 * - Random sessionId persisted in sessionStorage (zero personal info / zero IP)
 * - IntersectionObserver tracks section views once per section per session
 */

import { getApiUrl } from '../../config/environment';

export type StorefrontEventType =
  | 'view'
  | 'click'
  | 'studio_open'
  | 'studio_publish'
  | 'studio_template_apply'
  | 'studio_ai_open'
  | 'studio_error';

export interface AnalyticsEventPayload {
  companySlug?: string;
  companyId?: string;
  pageKey: string;
  sectionType?: string | null;
  eventType: StorefrontEventType;
  sessionId?: string;
  path?: string;
  errorMessage?: string;
  sectionKey?: string;
  meta?: Record<string, unknown>;
}

let cachedCompanySlug: string | null = null;
let cachedCompanyId: string | null = null;
const sessionViewedSections = new Set<string>();

/**
 * Persists or updates the active storefront company ID in memory and storage (PERF-1).
 */
export const setStorefrontCompanyId = (id: string | null | undefined): void => {
  if (!id) return;
  const clean = id.trim();
  cachedCompanyId = clean;
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      window.sessionStorage.setItem('sf_company_id', clean);
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }
};

/**
 * Resolves companyId from parameter, memory, sessionStorage, or URL query.
 */
export const resolveStorefrontCompanyId = (explicitId?: string): string => {
  if (explicitId && explicitId.trim()) {
    return explicitId.trim();
  }

  if (cachedCompanyId) {
    return cachedCompanyId;
  }

  if (typeof window === 'undefined') {
    return '';
  }

  try {
    const fromSession = window.sessionStorage?.getItem('sf_company_id');
    if (fromSession) {
      cachedCompanyId = fromSession;
      return fromSession;
    }

    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get('companyId');
    if (fromQuery) {
      const clean = fromQuery.trim();
      setStorefrontCompanyId(clean);
      return clean;
    }
  } catch {
    // Ignore errors
  }

  return '';
};

/**
 * Persists or updates the active storefront company slug in memory and storage.
 */
export const setStorefrontCompanySlug = (slug: string | null | undefined): void => {
  if (!slug) return;
  const clean = slug.trim().toLowerCase();
  cachedCompanySlug = clean;
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      window.sessionStorage.setItem('sf_company_slug', clean);
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }
};

/**
 * Resolves companySlug from parameter, memory, sessionStorage, or URL.
 */
export const resolveStorefrontCompanySlug = (explicitSlug?: string): string => {
  if (explicitSlug && explicitSlug.trim()) {
    return explicitSlug.trim().toLowerCase();
  }

  if (cachedCompanySlug) {
    return cachedCompanySlug;
  }

  if (typeof window === 'undefined') {
    return '';
  }

  try {
    const fromSession = window.sessionStorage?.getItem('sf_company_slug');
    if (fromSession) {
      cachedCompanySlug = fromSession;
      return fromSession;
    }

    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get('companySlug') || params.get('company');
    if (fromQuery) {
      const clean = fromQuery.trim().toLowerCase();
      setStorefrontCompanySlug(clean);
      return clean;
    }

    const hostname = window.location.hostname.toLowerCase();
    if (hostname.includes('.maxp.online')) {
      const parts = hostname.split('.');
      const sub = parts[0];
      if (sub && !['app', 'admin', 'api', 'dashboard', 'www'].includes(sub)) {
        setStorefrontCompanySlug(sub);
        return sub;
      }
    }
  } catch {
    // Ignore URL/storage access errors
  }

  return '';
};

/**
 * Retrieves or generates a random anonymous session ID.
 * ZERO personal info / IP stored.
 */
export const getSessionId = (): string => {
  if (typeof window === 'undefined') {
    return 'sf_srv_' + Math.random().toString(36).slice(2, 10);
  }

  try {
    const existing = window.sessionStorage?.getItem('sf_analytics_session_id');
    if (existing) {
      return existing;
    }

    const newId =
      'sf_' +
      Math.random().toString(36).slice(2, 10) +
      '_' +
      Date.now().toString(36);
    window.sessionStorage?.setItem('sf_analytics_session_id', newId);
    return newId;
  } catch {
    return 'sf_mem_' + Math.random().toString(36).slice(2, 10);
  }
};

/**
 * Sends an analytics event using navigator.sendBeacon with fetch fallback.
 */
export const sendAnalyticsEvent = (payload: AnalyticsEventPayload): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  const slug = resolveStorefrontCompanySlug(payload.companySlug);
  const companyId = resolveStorefrontCompanyId(payload.companyId);
  if (!slug && !companyId) {
    // Cannot attribute event without companySlug or companyId
    return false;
  }

  const base = getApiUrl().replace(/\/$/, '');
  const url = `${base}/storefront-analytics/event`;

  const fullPayload: Record<string, unknown> = {
    companySlug: slug || undefined,
    companyId: companyId || undefined,
    pageKey: payload.pageKey || 'home',
    sectionType: payload.sectionType || null,
    eventType: payload.eventType,
    sessionId: payload.sessionId || getSessionId(),
    path: payload.path || (typeof window !== 'undefined' ? window.location?.pathname : '/') || '/',
  };

  if (payload.errorMessage) {
    fullPayload.errorMessage = payload.errorMessage;
  }
  if (payload.sectionKey) {
    fullPayload.sectionKey = payload.sectionKey;
  }
  if (payload.meta) {
    fullPayload.meta = payload.meta;
  }

  const bodyString = JSON.stringify(fullPayload);

  // 1. Try navigator.sendBeacon
  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    try {
      const blob = new Blob([bodyString], { type: 'application/json' });
      const queued = navigator.sendBeacon(url, blob);
      if (queued) {
        return true;
      }
    } catch {
      // Fall through to fetch
    }
  }

  // 2. Fallback: fetch with keepalive
  try {
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: bodyString,
      keepalive: true,
    }).catch(() => {
      // Suppress beacon failures silently
    });
    return true;
  } catch {
    return false;
  }
};

/**
 * Tracks studio opening (PERF-1).
 */
export const trackStudioOpen = (
  pageKey: string,
  options?: { companyId?: string; companySlug?: string; path?: string }
): boolean => {
  return sendAnalyticsEvent({
    companyId: options?.companyId,
    companySlug: options?.companySlug,
    pageKey: pageKey || 'home',
    eventType: 'studio_open',
    path: options?.path,
  });
};

/**
 * Tracks studio publishing / saving (PERF-1).
 */
export const trackStudioPublish = (
  pageKey: string,
  options?: { companyId?: string; companySlug?: string; sectionCount?: number; path?: string }
): boolean => {
  return sendAnalyticsEvent({
    companyId: options?.companyId,
    companySlug: options?.companySlug,
    pageKey: pageKey || 'home',
    eventType: 'studio_publish',
    path: options?.path,
    meta: options?.sectionCount !== undefined ? { sectionCount: options.sectionCount } : undefined,
  });
};

/**
 * Tracks applying a studio page template or industry preset (PERF-1).
 */
export const trackStudioTemplateApply = (
  pageKey: string,
  templateId?: string,
  options?: { companyId?: string; companySlug?: string; path?: string }
): boolean => {
  return sendAnalyticsEvent({
    companyId: options?.companyId,
    companySlug: options?.companySlug,
    pageKey: pageKey || 'home',
    sectionType: templateId || 'template',
    eventType: 'studio_template_apply',
    path: options?.path,
  });
};

/**
 * Tracks opening AI assistant / studio AI generator (PERF-1).
 */
export const trackStudioAiOpen = (
  pageKey: string,
  options?: { companyId?: string; companySlug?: string; path?: string }
): boolean => {
  return sendAnalyticsEvent({
    companyId: options?.companyId,
    companySlug: options?.companySlug,
    pageKey: pageKey || 'home',
    eventType: 'studio_ai_open',
    path: options?.path,
  });
};

/**
 * Tracks a studio rendering error captured by ErrorBoundary (PERF-1).
 */
export const trackStudioError = (
  pageKey: string,
  error: { message: string; sectionKey?: string },
  options?: { companyId?: string; companySlug?: string; path?: string }
): boolean => {
  const shortMessage = (error.message || 'Render Error').slice(0, 120);
  return sendAnalyticsEvent({
    companyId: options?.companyId,
    companySlug: options?.companySlug,
    pageKey: pageKey || 'home',
    sectionType: error.sectionKey || 'unknown-section',
    eventType: 'studio_error',
    errorMessage: shortMessage,
    sectionKey: error.sectionKey,
    path: options?.path,
  });
};

/**
 * Tracks a view event for a page and section.
 */
export const trackView = (
  pageKey: string,
  sectionType?: string | null,
  options?: { companySlug?: string; path?: string }
): boolean => {
  return sendAnalyticsEvent({
    companySlug: options?.companySlug,
    pageKey: pageKey || 'home',
    sectionType,
    eventType: 'view',
    path: options?.path,
  });
};

/**
 * Tracks a click event on an element / CTA.
 */
export const trackClick = (
  pageKey: string,
  sectionType?: string | null,
  options?: { companySlug?: string; path?: string }
): boolean => {
  return sendAnalyticsEvent({
    companySlug: options?.companySlug,
    pageKey: pageKey || 'home',
    sectionType,
    eventType: 'click',
    path: options?.path,
  });
};

/**
 * Observes a section element with IntersectionObserver and fires trackView
 * exactly once per section per session.
 *
 * @param element HTMLElement to observe
 * @param pageKey Page identifier (e.g. 'home', 'shop')
 * @param sectionType Section identifier (e.g. 'hero-banner', 'cta')
 * @param companySlug Optional company slug
 * @returns Cleanup unobserve function
 */
export const observeSectionView = (
  element: HTMLElement | null,
  pageKey: string,
  sectionType?: string | null,
  companySlug?: string
): (() => void) => {
  if (!element || typeof window === 'undefined') {
    return () => {};
  }

  const pKey = pageKey || 'home';
  const sType = sectionType || 'section';
  const sid = getSessionId();
  const sessionKey = `${sid}::${pKey}::${sType}`;

  // Check in-memory session cache
  if (sessionViewedSections.has(sessionKey)) {
    return () => {};
  }

  // Check sessionStorage
  try {
    if (window.sessionStorage?.getItem(`sf_v_${sessionKey}`)) {
      sessionViewedSections.add(sessionKey);
      return () => {};
    }
  } catch {
    // Ignore storage errors
  }

  if (typeof IntersectionObserver === 'undefined') {
    // Fallback: track immediately if IntersectionObserver unsupported
    sessionViewedSections.add(sessionKey);
    trackView(pKey, sType, { companySlug });
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          if (!sessionViewedSections.has(sessionKey)) {
            sessionViewedSections.add(sessionKey);
            try {
              window.sessionStorage?.setItem(`sf_v_${sessionKey}`, '1');
            } catch {
              // Ignore
            }
            trackView(pKey, sType, { companySlug });
          }
          observer.unobserve(entry.target);
          observer.disconnect();
          break;
        }
      }
    },
    {
      threshold: 0.2, // Trigger when 20% of section enters viewport
    }
  );

  observer.observe(element);

  return () => {
    observer.disconnect();
  };
};
