// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

const jest = vi;
import {
  mergeBundlePricing,
  extractBundleFromPayload,
  useBundlePricing,
  ApiBundle,
} from "../useBundlePricing";
import {
  CSB_LINES,
  BUNDLE_PRICE,
  BUNDLE_PRICE_OVERRIDE,
  INDIVIDUAL_TOTAL,
} from "../csbData";

describe("mergeBundlePricing (pure function)", () => {
  const fullMockApps = [
    { slug: "store", monthlyPrice: 699 },
    { slug: "order-workflow", monthlyPrice: 149 },
    { slug: "whatsapp-business", monthlyPrice: 350 },
    { slug: "bot-automation", monthlyPrice: 149 },
    { slug: "bulk-orders", monthlyPrice: 99 },
    { slug: "order-preparation-hold", monthlyPrice: 0 },
    { slug: "order-shipping-turbo", monthlyPrice: 149 },
    { slug: "inventory-pro", monthlyPrice: 199 },
    { slug: "returns-settings", monthlyPrice: 99 },
    { slug: "returns-reasons-analytics", monthlyPrice: 99 },
    { slug: "orders-analytics", monthlyPrice: 99 },
    { slug: "profit-analytics", monthlyPrice: 99 },
    { slug: "campaign-attribution", monthlyPrice: 149 },
    { slug: "campaign-attribution-analytics", monthlyPrice: 0 },
    { slug: "facebook-ads-pro", monthlyPrice: 199 },
    { slug: "facebook-pages-connect", monthlyPrice: 99 },
    { slug: "unified-inbox", monthlyPrice: 299 },
  ];

  it("مطابقة — 17 سطر بأسعار الـAPI والمجموع 2,936 والباقة 999", () => {
    const mockBundle: ApiBundle = {
      slug: "store-complete-bundle",
      name: "باقة المتجر الكاملة",
      monthlyPrice: 5, // فترة التيست في الـDB
      trialDays: 7,
      apps: fullMockApps,
    };

    const res = mergeBundlePricing(mockBundle, CSB_LINES, BUNDLE_PRICE_OVERRIDE);

    expect(res.lines).toHaveLength(17);
    expect(res.perApp["facebook-ads-pro"]).toBe(199);
    expect(res.perApp["store"]).toBe(699);
    expect(res.perApp["unified-inbox"]).toBe(299);
    expect(res.individualTotal).toBe(2936);
    expect(res.bundlePrice).toBe(999);
    expect(res.monthlySaving).toBe(2936 - 999);
    expect(res.annualSaving).toBe((2936 - 999) * 12);
    expect(res.discountPct).toBe(Math.round(((2936 - 999) / 2936) * 100));
    expect(res.pricePerDay).toBe(Math.round(999 / 30));
  });

  it("مطابقة — قراءة سعر الـDB عند إزالة الـOVERRIDE (null)", () => {
    const mockBundle: ApiBundle = {
      slug: "store-complete-bundle",
      name: "باقة المتجر الكاملة",
      monthlyPrice: 5,
      trialDays: 7,
      apps: fullMockApps,
    };

    const res = mergeBundlePricing(mockBundle, CSB_LINES, null);

    expect(res.bundlePrice).toBe(5);
    expect(res.monthlySaving).toBe(2936 - 5);
    expect(res.annualSaving).toBe((2936 - 5) * 12);
  });

  it("fallback — عند غياب بيانات الـAPI (null أو undefined) يستخدم قيم csbData", () => {
    const resNull = mergeBundlePricing(null, CSB_LINES, BUNDLE_PRICE_OVERRIDE);

    expect(resNull.lines).toHaveLength(17);
    expect(resNull.individualTotal).toBe(INDIVIDUAL_TOTAL);
    expect(resNull.bundlePrice).toBe(BUNDLE_PRICE);
    expect(resNull.perApp["facebook-ads-pro"]).toBe(199);
    expect(resNull.perApp["store"]).toBe(699);

    const resUndefined = mergeBundlePricing(undefined, CSB_LINES, BUNDLE_PRICE_OVERRIDE);
    expect(resUndefined.individualTotal).toBe(INDIVIDUAL_TOTAL);
    expect(resUndefined.bundlePrice).toBe(BUNDLE_PRICE);
  });

  it("slug ناقص — لو الـAPI رجّع باقة ناقصة بعض التطبيقات، تأخذ أسعار fallback من CSB_LINES", () => {
    // الباقة رجّعت فقط 2 تطبيقات: المتجر وواتساب، مع تغيير سعر المتجر
    const partialBundle: ApiBundle = {
      slug: "store-complete-bundle",
      monthlyPrice: 999,
      apps: [
        { slug: "store", monthlyPrice: 500 }, // تغير من 699 لـ 500
        { slug: "whatsapp-business", monthlyPrice: 300 }, // تغير من 350 لـ 300
      ],
    };

    const res = mergeBundlePricing(partialBundle, CSB_LINES, BUNDLE_PRICE_OVERRIDE);

    // الـ17 سطر كلهم موجودين
    expect(res.lines).toHaveLength(17);
    // التطبيقات الموجودة أخذت سعر الـAPI
    expect(res.perApp["store"]).toBe(500);
    expect(res.perApp["whatsapp-business"]).toBe(300);
    // التطبيقات الناقصة احتفظت بسعر الـfallback
    expect(res.perApp["facebook-ads-pro"]).toBe(199);
    expect(res.perApp["unified-inbox"]).toBe(299);

    // المجموع = 2936 - (699-500) - (350-300) = 2936 - 199 - 50 = 2687
    expect(res.individualTotal).toBe(2687);
  });
});

describe("extractBundleFromPayload", () => {
  it("يستخرج الباقة عندما تكون الاستجابة مصفوفة data", () => {
    const payload = {
      success: true,
      data: [
        { slug: "other-bundle", monthlyPrice: 400 },
        { slug: "store-complete-bundle", monthlyPrice: 5, apps: [] },
      ],
    };
    const bundle = extractBundleFromPayload(payload, "store-complete-bundle");
    expect(bundle?.slug).toBe("store-complete-bundle");
    expect(bundle?.monthlyPrice).toBe(5);
  });

  it("يستخرج الباقة عندما تكون الاستجابة كائن data مباشر", () => {
    const payload = {
      success: true,
      data: { slug: "store-complete-bundle", monthlyPrice: 5, apps: [] },
    };
    const bundle = extractBundleFromPayload(payload, "store-complete-bundle");
    expect(bundle?.slug).toBe("store-complete-bundle");
  });

  it("يرجع null لو الباقة غير موجودة", () => {
    const payload = { success: true, data: [] };
    expect(extractBundleFromPayload(payload, "store-complete-bundle")).toBeNull();
  });
});

describe("useBundlePricing (hook)", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("يبدأ فوراً بالقيم الافتراضية لمنع الـlayout shift", () => {
    // mock fetch مع تأخير
    jest.spyOn(globalThis, "fetch").mockImplementation(
      () => new Promise(() => {}) // never resolves
    );

    const { result } = renderHook(() => useBundlePricing("https://dummy/api"));

    // القيم الأولية موجودة وليست أصفار
    expect(result.current.individualTotal).toBe(2936);
    expect(result.current.bundlePrice).toBe(999);
    expect(result.current.loading).toBe(true);
    expect(result.current.source).toBe("fallback");
    expect(result.current.lines).toHaveLength(17);
  });

  it("يحدث القيم ويجعل source = 'api' عند نجاح الاستجابة", async () => {
    const mockPayload = {
      success: true,
      data: [
        {
          slug: "store-complete-bundle",
          monthlyPrice: 5,
          apps: [
            { slug: "facebook-ads-pro", monthlyPrice: 199 },
            { slug: "store", monthlyPrice: 699 },
          ],
        },
      ],
    };

    jest.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockPayload,
    } as Response);

    const { result } = renderHook(() => useBundlePricing("https://dummy/api"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.source).toBe("api");
    expect(result.current.bundlePrice).toBe(999); // BUNDLE_PRICE_OVERRIDE
    expect(result.current.perApp["facebook-ads-pro"]).toBe(199);
  });

  it("يحتفظ بالقيم الافتراضية ولا يكسر الصفحة عند فشل الـAPI (mock failure)", async () => {
    jest.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Network Error"));

    const { result } = renderHook(() => useBundlePricing("https://dummy/api"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.source).toBe("fallback");
    expect(result.current.individualTotal).toBe(2936);
    expect(result.current.bundlePrice).toBe(999);
    expect(result.current.lines).toHaveLength(17);
    expect(result.current.error).toBeTruthy();
  });
});
