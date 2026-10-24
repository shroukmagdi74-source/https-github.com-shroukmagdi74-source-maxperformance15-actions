import { useEffect, useState } from "react";
import { getApiUrl } from "../../../config/environment";
import {
  BUNDLE_PRICE,
  BUNDLE_PRICE_OVERRIDE,
  BUNDLE_SLUG,
  CSB_LINES,
  CsbLine,
} from "./csbData";

export interface ApiBundleApp {
  id?: string;
  slug: string;
  name?: string;
  monthlyPrice?: number | null;
  [key: string]: unknown;
}

export interface ApiBundle {
  id?: string;
  slug: string;
  name?: string;
  monthlyPrice?: number | null;
  trialDays?: number;
  apps?: ApiBundleApp[];
  [key: string]: unknown;
}

export interface MergedPricingResult {
  perApp: Record<string, number>;
  lines: CsbLine[];
  bundlePrice: number;
  individualTotal: number;
  monthlySaving: number;
  annualSaving: number;
  discountPct: number;
  pricePerDay: number;
}

export interface BundlePricingState extends MergedPricingResult {
  loading: boolean;
  source: "api" | "fallback";
  error: Error | null;
}

/**
 * Pure function: دمج أسعار الـAPI مع البنود الافتراضية.
 * - perApp: Record<slug, number> من apps[].monthlyPrice (fallback لسعر CSB_LINES لو الـslug مش موجود).
 * - bundlePrice = BUNDLE_PRICE_OVERRIDE ?? bundle.monthlyPrice (مع fallback لـ BUNDLE_PRICE).
 * - individualTotal = مجموع الأسعار المعروضة (مش 2936 ثابت).
 * - monthlySaving, annualSaving, discountPct بتتحسب من الأرقام الجديدة.
 */
export function mergeBundlePricing(
  bundle?: ApiBundle | null,
  fallbackLines: CsbLine[] = CSB_LINES,
  priceOverride: number | null = BUNDLE_PRICE_OVERRIDE
): MergedPricingResult {
  const perApp: Record<string, number> = {};
  for (const line of fallbackLines) {
    perApp[line.id] = line.price;
  }

  if (bundle && Array.isArray(bundle.apps)) {
    for (const app of bundle.apps) {
      if (app && typeof app.slug === "string") {
        const raw = app.monthlyPrice;
        if (typeof raw === "number" && !isNaN(raw) && raw >= 0) {
          perApp[app.slug] = raw;
        }
      }
    }
  }

  const lines: CsbLine[] = fallbackLines.map((line) => {
    const price = perApp[line.id] !== undefined ? perApp[line.id] : line.price;
    return {
      ...line,
      price,
    };
  });

  const individualTotal = lines.reduce((sum, line) => sum + line.price, 0);

  let resolvedBundlePrice: number;
  if (priceOverride !== null && priceOverride !== undefined) {
    resolvedBundlePrice = priceOverride;
  } else if (
    bundle &&
    typeof bundle.monthlyPrice === "number" &&
    !isNaN(bundle.monthlyPrice) &&
    bundle.monthlyPrice >= 0
  ) {
    resolvedBundlePrice = bundle.monthlyPrice;
  } else {
    resolvedBundlePrice = BUNDLE_PRICE;
  }

  const monthlySaving = Math.max(0, individualTotal - resolvedBundlePrice);
  const annualSaving = monthlySaving * 12;
  const discountPct =
    individualTotal > 0
      ? Math.round((monthlySaving / individualTotal) * 100)
      : 0;
  const pricePerDay = Math.round(resolvedBundlePrice / 30);

  return {
    perApp,
    lines,
    bundlePrice: resolvedBundlePrice,
    individualTotal,
    monthlySaving,
    annualSaving,
    discountPct,
    pricePerDay,
  };
}

/**
 * يستخرج الباقة المطلوبة من استجابة الـAPI سواء كانت مصفوفة أو كائن مفرد.
 */
export function extractBundleFromPayload(
  payload: unknown,
  targetSlug: string = BUNDLE_SLUG
): ApiBundle | null {
  if (!payload || typeof payload !== "object") return null;

  const data = (payload as { data?: unknown }).data !== undefined
    ? (payload as { data?: unknown }).data
    : payload;

  if (Array.isArray(data)) {
    const found = data.find(
      (b): b is ApiBundle =>
        Boolean(b) && typeof b === "object" && (b as ApiBundle).slug === targetSlug
    );
    return found || null;
  }

  if (
    data &&
    typeof data === "object" &&
    (data as ApiBundle).slug === targetSlug
  ) {
    return data as ApiBundle;
  }

  return null;
}

function resolveBundleEndpoint(): string {
  try {
    const base = typeof getApiUrl === "function" ? getApiUrl() : "/api/v1";
    const cleaned = (base || "/api/v1").replace(/\/+$/, "");
    return `${cleaned}/marketplace/bundles/${BUNDLE_SLUG}`;
  } catch {
    return `/api/v1/marketplace/bundles/${BUNDLE_SLUG}`;
  }
}

/**
 * Hook لقراءة أسعار باقة المتجر الكاملة من الـAPI مع fallback فوري ومنع layout shift.
 * Timeout: 5 ثواني.
 */
export function useBundlePricing(
  endpointUrl?: string,
  priceOverride: number | null = BUNDLE_PRICE_OVERRIDE
): BundlePricingState {
  const initial = mergeBundlePricing(null, CSB_LINES, priceOverride);

  const [state, setState] = useState<BundlePricingState>({
    ...initial,
    loading: true,
    source: "fallback",
    error: null,
  });

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 5000);

    const targetUrl = endpointUrl || resolveBundleEndpoint();

    fetch(targetUrl, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Failed to fetch bundle pricing`);
        }
        return res.json();
      })
      .then((json) => {
        if (!isMounted) return;
        const bundle = extractBundleFromPayload(json, BUNDLE_SLUG);
        if (bundle) {
          const merged = mergeBundlePricing(bundle, CSB_LINES, priceOverride);
          setState({
            ...merged,
            loading: false,
            source: "api",
            error: null,
          });
        } else {
          // الباقة مش موجودة في الـdata → fallback
          setState((prev) => ({
            ...prev,
            loading: false,
            source: "fallback",
            error: null,
          }));
        }
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        // عند فشل الشبكة أو timeout (5 ثواني): استخدم قيم csbData الحالية كـfallback — ممنوع الصفحة تبان فاضية أو أصفار.
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setState((prev) => ({
          ...prev,
          loading: false,
          source: "fallback",
          error: errorObj,
        }));
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [endpointUrl, priceOverride]);

  return state;
}
