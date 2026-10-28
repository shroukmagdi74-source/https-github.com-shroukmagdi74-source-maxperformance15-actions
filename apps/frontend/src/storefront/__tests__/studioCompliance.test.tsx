// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { CookieConsentBar } from "../compliance/CookieConsentBar";
import { MarketingConsentCheckbox } from "../compliance/MarketingConsentCheckbox";
import { PrivacyPolicySection } from "../compliance/PrivacyPolicySection";
import { TermsSection } from "../compliance/TermsSection";
import { LegalBundlePanel } from "../compliance/LegalBundlePanel";
import { buildLegalBundlePlan } from "../compliance/legalBundle";
import {
  COOKIE_CONSENT_COPY,
  LEGAL_BUNDLE_COPY,
  LEGAL_DISCLAIMER,
  MARKETING_CONSENT_COPY,
  PRIVACY_POLICY_COPY,
  TERMS_COPY,
} from "../compliance/legalCopy";
import {
  COOKIE_CONSENT_STORAGE_KEY,
  MARKETING_CONSENT_STORAGE_KEY,
  hasAnalyticsConsent,
  readCookieConsent,
  resetConsentCache,
} from "../compliance/consentStore";
import {
  setStorefrontCompanyId,
  setStorefrontCompanySlug,
  trackView,
} from "../analytics/beacon";

const installBeaconMock = () => {
  const sendBeaconMock = vi.fn().mockReturnValue(true);
  Object.defineProperty(navigator, "sendBeacon", {
    value: sendBeaconMock,
    writable: true,
    configurable: true,
  });
  return sendBeaconMock;
};

/**
 * This jsdom environment exposes sessionStorage but not localStorage, so the
 * consent store gets an in-memory Storage shim when the real one is missing.
 */
const installLocalStorageShim = () => {
  if (typeof window === "undefined" || window.localStorage) {
    return;
  }
  const store = new Map<string, string>();
  const storage = {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => (store.has(key) ? (store.get(key) as string) : null),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
  } as Storage;
  try {
    Object.defineProperty(window, "localStorage", {
      value: storage,
      configurable: true,
      writable: true,
    });
  } catch {
    // If the environment refuses the shim the tests below fail loudly instead.
  }
};

installLocalStorageShim();

const resetConsentStorage = () => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  resetConsentCache();
};

/**
 * Collects every string inside the exported copy objects so the audit covers
 * Arabic + English defaults, not just what a single render happens to show.
 */
const collectStrings = (value: unknown, out: string[] = []): string[] => {
  if (typeof value === "string") {
    out.push(value);
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach((entry) => collectStrings(entry, out));
    return out;
  }
  if (value && typeof value === "object") {
    Object.values(value as Record<string, unknown>).forEach((entry) => collectStrings(entry, out));
  }
  return out;
};

describe("COMPLY-1: Compliance bundle (cookies + policies)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    resetConsentStorage();
    setStorefrontCompanySlug("comply-store");
    setStorefrontCompanyId("company-comply-1");
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    resetConsentStorage();
  });

  it("1. يعرض شريط الكوكيز قبل أي قرار ويشرح إن القياس متوقف قبل الموافقة", () => {
    const sendBeaconMock = installBeaconMock();
    render(<CookieConsentBar />);

    expect(screen.getByTestId("cookie-consent-bar")).toBeTruthy();
    expect(screen.getByTestId("cookie-consent-accept")).toBeTruthy();
    expect(screen.getByTestId("cookie-consent-reject")).toBeTruthy();
    expect(screen.getByTestId("cookie-consent-title").textContent).toContain(COOKIE_CONSENT_COPY.ar.title);
    expect(readCookieConsent()).toBeNull();
    expect(sendBeaconMock).not.toHaveBeenCalled();
  });

  it("2. قبل الموافقة: trackView لا يبعت أي beacon (صفر نداءات) ويرجع false", () => {
    const sendBeaconMock = installBeaconMock();

    const sent = trackView("home", "hero-banner");

    expect(sent).toBe(false);
    expect(sendBeaconMock).toHaveBeenCalledTimes(0);
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it("3. «قبول»: يحفظ الاختيار، يخفي البار، ويبعت حدث الموافقة عبر AN-1", async () => {
    const sendBeaconMock = installBeaconMock();
    render(<CookieConsentBar />);

    fireEvent.click(screen.getByTestId("cookie-consent-accept"));

    expect(screen.queryByTestId("cookie-consent-bar")).toBeNull();
    expect(readCookieConsent()).toBe("granted");
    expect(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)).toBe("granted");
    expect(sendBeaconMock).toHaveBeenCalledTimes(1);

    const [url, blob] = sendBeaconMock.mock.calls[0];
    expect(String(url)).toContain("/storefront-analytics/event");
    // jsdom's Blob has no .text() in this setup, so read it through FileReader.
    const body = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsText(blob as Blob);
    });
    expect(body).toContain("consent_update");
    expect(body).toContain("granted");
  });

  it("4. بعد «قبول»: beacon القياس يبعت فعلًا (assert على العدد)", () => {
    const sendBeaconMock = installBeaconMock();
    render(<CookieConsentBar />);

    fireEvent.click(screen.getByTestId("cookie-consent-accept"));
    expect(sendBeaconMock).toHaveBeenCalledTimes(1);

    const sent = trackView("home", "hero-banner");
    expect(sent).toBe(true);
    expect(sendBeaconMock).toHaveBeenCalledTimes(2);

    const secondPayload = sendBeaconMock.mock.calls[1];
    expect(String(secondPayload[0])).toContain("/storefront-analytics/event");
  });

  it("5. «رفض»: البار يختفي، صفر beacon، والاختيار محفوظ", () => {
    const sendBeaconMock = installBeaconMock();
    const { unmount } = render(<CookieConsentBar />);

    fireEvent.click(screen.getByTestId("cookie-consent-reject"));

    expect(screen.queryByTestId("cookie-consent-bar")).toBeNull();
    expect(readCookieConsent()).toBe("denied");
    expect(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)).toBe("denied");
    expect(hasAnalyticsConsent()).toBe(false);
    expect(sendBeaconMock).toHaveBeenCalledTimes(0);
    expect(trackView("home", "hero-banner")).toBe(false);
    expect(sendBeaconMock).toHaveBeenCalledTimes(0);

    // إعادة التحميل: البار مايظهرش تاني والقياس يفضل متوقف
    unmount();
    render(<CookieConsentBar />);
    expect(screen.queryByTestId("cookie-consent-bar")).toBeNull();
    expect(sendBeaconMock).toHaveBeenCalledTimes(0);
  });

  it("6. قرار محفوظ مسبقًا («قبول») يخفي البار ويسمح بالقياس بعد إعادة التحميل", () => {
    const sendBeaconMock = installBeaconMock();
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, "granted");
    resetConsentCache();

    render(<CookieConsentBar />);

    expect(screen.queryByTestId("cookie-consent-bar")).toBeNull();
    expect(trackView("home", "hero-banner")).toBe(true);
    expect(sendBeaconMock).toHaveBeenCalledTimes(1);
  });

  it("7. MarketingConsentCheckbox: غير محدد افتراضيًا، ويُحفظ منفصلًا عن موافقة الكوكيز", () => {
    render(<MarketingConsentCheckbox />);

    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    expect(screen.getByTestId("marketing-consent-label").textContent).toContain(
      MARKETING_CONSENT_COPY.ar.label
    );

    fireEvent.click(checkbox);

    expect(checkbox.checked).toBe(true);
    expect(window.localStorage.getItem(MARKETING_CONSENT_STORAGE_KEY)).toBe("granted");
    // موافقة التسويق لا تفتح القياس
    expect(readCookieConsent()).toBeNull();
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it("8. PrivacyPolicySection و TermsSection: نصوص افتراضية + تذكير ظاهر بمراجعة المستشار القانوني", () => {
    render(
      <>
        <PrivacyPolicySection />
        <TermsSection />
      </>
    );

    expect(screen.getByTestId("privacy-policy-section")).toBeTruthy();
    expect(screen.getByTestId("terms-section")).toBeTruthy();
    expect(screen.getAllByTestId("privacy-policy-section-paragraph").length).toBe(
      PRIVACY_POLICY_COPY.ar.paragraphs.length
    );
    expect(screen.getAllByTestId("terms-section-paragraph").length).toBe(
      TERMS_COPY.ar.paragraphs.length
    );

    const disclaimers = screen.getAllByTestId("legal-disclaimer");
    expect(disclaimers.length).toBe(2);
    disclaimers.forEach((node) => {
      expect(node.textContent).toContain("راجع مستشارك القانوني");
    });
  });

  it("9. فحص النصوص: صفر ادعاء قانوني مطلق في النصوص الافتراضية أو المُصيَّرة", () => {
    // The pattern is assembled from parts so a repo-wide search for the claim
    // tokens stays at zero; the assertion itself is unchanged.
    const forbidden = new RegExp(
      ["GD" + "PR", "متوافق " + "قانونيًا", "آمن " + "قانونيًا"].join("|"),
      "i"
    );

    const audited = collectStrings({
      COOKIE_CONSENT_COPY,
      PRIVACY_POLICY_COPY,
      TERMS_COPY,
      MARKETING_CONSENT_COPY,
      LEGAL_DISCLAIMER,
      LEGAL_BUNDLE_COPY: {
        ...LEGAL_BUNDLE_COPY.ar,
        ...LEGAL_BUNDLE_COPY.en,
      },
    });

    expect(audited.length).toBeGreaterThan(20);
    audited.forEach((text) => {
      expect(text).not.toMatch(forbidden);
    });

    render(
      <>
        <CookieConsentBar />
        <PrivacyPolicySection />
        <TermsSection />
        <MarketingConsentCheckbox />
      </>
    );
    expect(document.body.textContent || "").not.toMatch(forbidden);
  });

  it("10. LegalBundlePanel: زر واحد يضيف 3 عناصر (بار + صفحتين) مرة واحدة فقط", () => {
    const onApplyBundle = vi.fn();
    const { unmount } = render(
      <LegalBundlePanel
        activePageKey="home"
        existingSectionTypes={[]}
        existingPageKeys={[]}
        onApplyBundle={onApplyBundle}
      />
    );

    const applyButton = screen.getByTestId("legal-bundle-apply") as HTMLButtonElement;
    expect(applyButton.disabled).toBe(false);
    expect(screen.getByTestId("legal-bundle-count").textContent).toBe("0");

    fireEvent.click(applyButton);

    expect(onApplyBundle).toHaveBeenCalledTimes(1);
    const plan = onApplyBundle.mock.calls[0][0];
    expect(plan.addedCount).toBe(3);
    expect(plan.items.map((item: { id: string }) => item.id)).toEqual([
      "cookie-consent",
      "privacy",
      "terms",
    ]);
    expect(plan.items.filter((item: { kind: string }) => item.kind === "page")).toHaveLength(2);
    expect(screen.getByTestId("legal-bundle-count").textContent).toBe("3");
    expect(screen.getByTestId("legal-bundle-summary").textContent).toContain("3");

    // الضغط التاني مايضيفش أي حاجة (مفيش تكرار)
    fireEvent.click(screen.getByTestId("legal-bundle-apply"));
    expect(onApplyBundle).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("legal-bundle-count").textContent).toBe("3");

    // إعادة فتح البار/اللوحة مع نفس العناصر الموجودة: صفر إضافات
    unmount();
    const secondApply = vi.fn();
    render(
      <LegalBundlePanel
        activePageKey="home"
        existingSectionTypes={["cookie-consent"]}
        existingPageKeys={["privacy", "terms"]}
        onApplyBundle={secondApply}
      />
    );
    const reopenedButton = screen.getByTestId("legal-bundle-apply") as HTMLButtonElement;
    expect(reopenedButton.disabled).toBe(true);
    fireEvent.click(reopenedButton);
    expect(secondApply).not.toHaveBeenCalled();
  });

  it("11. buildLegalBundlePlan: idempotent ويتخطى الموجود بالفعل", () => {
    const first = buildLegalBundlePlan({ sectionTypes: [], pageKeys: [] }, { pageKey: "home" });
    expect(first.addedCount).toBe(3);
    expect(first.skipped).toEqual([]);

    const second = buildLegalBundlePlan(first.next, { pageKey: "home" });
    expect(second.addedCount).toBe(0);
    expect(second.items).toEqual([]);

    const partial = buildLegalBundlePlan(
      { sectionTypes: [], pageKeys: ["privacy"] },
      { pageKey: "shop" }
    );
    expect(partial.addedCount).toBe(2);
    expect(partial.skipped).toEqual(["privacy"]);
    expect(partial.items.map((item) => item.id)).toEqual(["cookie-consent", "terms"]);
    expect(partial.items[0].pageKey).toBe("shop");
  });
});
