/**
 * COMPLY-1 — Cookie / marketing consent store (client-only, zero backend).
 *
 * Rules encoded here:
 * - Default state is "no decision" — nothing is granted implicitly.
 * - Visitor analytics may only run when the visitor chose "granted".
 * - The decision is remembered on the device so the bar does not nag on every visit.
 */

export type ConsentDecision = "granted" | "denied";

export const COOKIE_CONSENT_STORAGE_KEY = "sf_cookie_consent_v1";
export const MARKETING_CONSENT_STORAGE_KEY = "sf_marketing_consent_v1";

type ConsentListener = (decision: ConsentDecision | null) => void;

const listeners = new Set<ConsentListener>();

/** `undefined` means "not read yet", `null` means "no decision stored". */
let cachedCookieConsent: ConsentDecision | null | undefined;

const getLocalStorage = (): Storage | null => {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
};

const normalizeDecision = (raw: unknown): ConsentDecision | null =>
  raw === "granted" || raw === "denied" ? raw : null;

const notify = (decision: ConsentDecision | null): void => {
  listeners.forEach((listener) => {
    try {
      listener(decision);
    } catch {
      // A broken subscriber must never block the consent write itself.
    }
  });
};

/**
 * Reads the stored cookie decision (granted / denied / null when undecided).
 */
export const readCookieConsent = (): ConsentDecision | null => {
  if (cachedCookieConsent !== undefined) {
    return cachedCookieConsent;
  }
  const storage = getLocalStorage();
  if (!storage) {
    cachedCookieConsent = null;
    return cachedCookieConsent;
  }
  try {
    cachedCookieConsent = normalizeDecision(storage.getItem(COOKIE_CONSENT_STORAGE_KEY));
  } catch {
    cachedCookieConsent = null;
  }
  return cachedCookieConsent;
};

/**
 * Persists a cookie decision and notifies subscribers.
 */
export const writeCookieConsent = (decision: ConsentDecision): void => {
  cachedCookieConsent = decision;
  const storage = getLocalStorage();
  if (storage) {
    try {
      storage.setItem(COOKIE_CONSENT_STORAGE_KEY, decision);
    } catch {
      // Storage may be blocked (private mode / quota); keep the in-memory value.
    }
  }
  notify(decision);
};

/**
 * Single source of truth used by the analytics beacon.
 * Anything other than an explicit "granted" keeps tracking off.
 */
export const hasAnalyticsConsent = (): boolean => readCookieConsent() === "granted";

/**
 * Reads the separate marketing-consent checkbox value (defaults to false).
 */
export const readMarketingConsent = (): boolean => {
  const storage = getLocalStorage();
  if (!storage) {
    return false;
  }
  try {
    return storage.getItem(MARKETING_CONSENT_STORAGE_KEY) === "granted";
  } catch {
    return false;
  }
};

/**
 * Persists the marketing-consent checkbox value.
 */
export const writeMarketingConsent = (granted: boolean): void => {
  const storage = getLocalStorage();
  if (!storage) {
    return;
  }
  try {
    storage.setItem(MARKETING_CONSENT_STORAGE_KEY, granted ? "granted" : "denied");
  } catch {
    // Ignore blocked storage.
  }
};

/**
 * Subscribes to consent changes. Returns an unsubscribe function.
 */
export const subscribeToConsent = (listener: ConsentListener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/**
 * Drops the in-memory cache so the next read goes back to storage.
 * Used by tests and by "reset preferences" entry points.
 */
export const resetConsentCache = (): void => {
  cachedCookieConsent = undefined;
};
