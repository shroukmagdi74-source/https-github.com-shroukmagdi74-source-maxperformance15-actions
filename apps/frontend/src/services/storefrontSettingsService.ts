import { apiClient } from "./apiClient";
import { getCompanyId, storefrontFetch } from "../utils/storefrontApi";

export interface StorefrontSettings {
  id: string;
  companyId: string;
  companySlug?: string | null;
  customDomain?: string | null;
  themeId?: string;
  designTokens?: Record<string, any> | null;
  supportedLanguages?: string;
  defaultLayout?: string;
  storeName?: string;
  description?: string;
  currency?: string;
  quickViewEnabled?: boolean;
  comparisonEnabled?: boolean;
  wishlistEnabled?: boolean;
  recentlyViewedEnabled?: boolean;
  advancedFiltersEnabled?: boolean;
  productCardStyle?: string;
  gridAddToCartIcon?: string;
  gridDiscountBanner?: boolean;
  gtmEnabled?: boolean;
  gtmContainerId?: string;
  gtmDataLayerEnabled?: boolean;
  gtmTrackPageView?: boolean;
  gtmSuppressPixels?: boolean;
  googleAnalyticsEnabled?: boolean;
  googleAnalyticsMeasurementId?: string;
  googleAnalyticsTrackPageView?: boolean;
  googleAnalyticsTrackViewContent?: boolean;
  googleAnalyticsTrackAddToCart?: boolean;
  googleAnalyticsTrackInitiateCheckout?: boolean;
  googleAnalyticsTrackPurchase?: boolean;
  googleAnalyticsTrackSearch?: boolean;
  googleAdsEnabled?: boolean;
  googleAdsConversionId?: string;
  facebookPixelEnabled?: boolean;
  facebookPixelId?: string;
  pixelTrackPageView?: boolean;
  pixelTrackViewContent?: boolean;
  pixelTrackAddToCart?: boolean;
  pixelTrackInitiateCheckout?: boolean;
  pixelTrackPurchase?: boolean;
  pixelTrackSearch?: boolean;
  pixelTrackAddToWishlist?: boolean;
  facebookPixelConfigs?: Array<{
    id?: string;
    pixelId: string;
    pixelName?: string;
    isPrimary?: boolean;
    trackPageView?: boolean;
    trackViewContent?: boolean;
    trackAddToCart?: boolean;
    trackInitiateCheckout?: boolean;
    trackPurchase?: boolean;
    trackSearch?: boolean;
    trackAddToWishlist?: boolean;
  }>;
  facebookConvApiEnabled?: boolean;
  facebookConvApiToken?: string;
  facebookConvApiTestCode?: string;
  capiTrackPageView?: boolean;
  capiTrackViewContent?: boolean;
  capiTrackAddToCart?: boolean;
  capiTrackInitiateCheckout?: boolean;
  capiTrackPurchase?: boolean;
  capiTrackSearch?: boolean;
  eventDeduplicationEnabled?: boolean;
  eventMatchQualityTarget?: number;
  gdprCompliant?: boolean;
  hashUserData?: boolean;
  clarityProjectId?: string;
  clarityApiToken?: string;
  tiktokPixelEnabled?: boolean;
  tiktokPixelId?: string;
  tiktokTrackPageView?: boolean;
  tiktokTrackViewContent?: boolean;
  tiktokTrackAddToCart?: boolean;
  tiktokTrackInitiateCheckout?: boolean;
  tiktokTrackPurchase?: boolean;
  tiktokTrackSearch?: boolean;
  tiktokTrackAddToWishlist?: boolean;
  productPageShowCheckoutForm?: boolean;
  galleryLayout?: string;
  mainImageAspectRatio?: string;
  imageBorderRadius?: number;
  imageShadow?: boolean;
  thumbnailSize?: string;
  thumbnailSpacing?: number;
  thumbnailBorderRadius?: number;
  productVideosEnabled?: boolean;
  imageZoomEnabled?: boolean;
  imageZoomType?: string;
  sliderEnabled?: boolean;
  sliderShowArrows?: boolean;
  sliderShowDots?: boolean;
  createdAt?: string;
  updatedAt?: string;
  enabledPaymentMethods?: string;
  paymentGatewayConfig?: {
    merchantId?: string;
    apiKey?: string;
    secretKey?: string;
    mode?: string;
  };
  walletPaymentSettings?: {
    enabled?: boolean;
    walletNumber?: string;
    recipientName?: string;
    instructions?: string;
    discountEnabled?: boolean;
    discountPercent?: number;
    showDiscountBadge?: boolean;
  };
  checkoutAddressSettings?: {
    mode?: "hybrid" | "ai_parse" | "dropdown";
    aiEnabled?: boolean;
    model?: string;
    confidenceThreshold?: number;
    showConfirmationToCustomer?: boolean;
    cacheResults?: boolean;
    logRawAddress?: boolean;
    merchantCombobox?: boolean;
  };
  [key: string]: any;
}

export interface StorefrontSettingsRevisionSummary {
  id: string;
  revisionNumber: number;
  createdAt: string;
  createdByEmail?: string;
  createdByName?: string;
  note?: string | null;
}

export interface StorefrontSettingsRevision extends StorefrontSettingsRevisionSummary {
  companyId: string;
  snapshot: {
    themeId?: string;
    designTokens?: Record<string, unknown>;
    [key: string]: unknown;
  };
  createdBy?: string | null;
}

export type StorefrontSettingsUpdate = Partial<StorefrontSettings>;

const isRecord = (value: unknown): value is Record<string, any> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const buildDefaultSettings = (companyId = ""): StorefrontSettings => ({
  id: companyId ? `storefront-settings-${companyId}` : "storefront-settings-default",
  companyId,
  companySlug: null,
  customDomain: null,
  themeId: "modern-minimal",
  designTokens: null,
  supportedLanguages: "ar,en",
  defaultLayout: "default",
  storeName: "Storefront",
  description: "",
  currency: "EGP",
  quickViewEnabled: true,
  comparisonEnabled: false,
  wishlistEnabled: true,
  recentlyViewedEnabled: true,
  advancedFiltersEnabled: false,
  productCardStyle: "default",
  gridAddToCartIcon: "plus",
  gridDiscountBanner: true,
  gtmEnabled: false,
  gtmContainerId: "",
  gtmDataLayerEnabled: true,
  gtmTrackPageView: true,
  gtmSuppressPixels: false,
  googleAnalyticsEnabled: false,
  googleAnalyticsMeasurementId: "",
  googleAnalyticsTrackPageView: true,
  googleAnalyticsTrackViewContent: true,
  googleAnalyticsTrackAddToCart: true,
  googleAnalyticsTrackInitiateCheckout: true,
  googleAnalyticsTrackPurchase: true,
  googleAnalyticsTrackSearch: true,
  googleAdsEnabled: false,
  googleAdsConversionId: "",
  facebookPixelEnabled: false,
  facebookPixelId: "",
  pixelTrackPageView: true,
  pixelTrackViewContent: true,
  pixelTrackAddToCart: true,
  pixelTrackInitiateCheckout: true,
  pixelTrackPurchase: true,
  pixelTrackSearch: true,
  pixelTrackAddToWishlist: false,
  facebookConvApiEnabled: false,
  facebookConvApiToken: "",
  facebookConvApiTestCode: "",
  capiTrackPageView: true,
  capiTrackViewContent: true,
  capiTrackAddToCart: true,
  capiTrackInitiateCheckout: true,
  capiTrackPurchase: true,
  capiTrackSearch: true,
  eventDeduplicationEnabled: true,
  eventMatchQualityTarget: 70,
  gdprCompliant: true,
  hashUserData: true,
  clarityProjectId: "",
  clarityApiToken: "",
  tiktokPixelEnabled: false,
  tiktokPixelId: "",
  tiktokTrackPageView: true,
  tiktokTrackViewContent: true,
  tiktokTrackAddToCart: true,
  tiktokTrackInitiateCheckout: true,
  tiktokTrackPurchase: true,
  tiktokTrackSearch: true,
  tiktokTrackAddToWishlist: false,
  productPageShowCheckoutForm: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const normalizeSettings = (
  data: Partial<StorefrontSettings> | null | undefined,
  companyId = "",
): StorefrontSettings => {
  const base = buildDefaultSettings(companyId);
  const designTokens = isRecord(data?.designTokens) ? data.designTokens : null;
  const extractedThemeId =
    typeof data?.themeId === "string" && data.themeId.trim()
      ? data.themeId.trim()
      : typeof designTokens?.themeId === "string" && designTokens.themeId.trim()
      ? designTokens.themeId.trim()
      : base.themeId;

  return {
    ...base,
    ...(data || {}),
    companyId: String(data?.companyId || companyId || ""),
    themeId: extractedThemeId,
  };
};

export const normalizePublicSettingsPayload = (
  payload: unknown,
  companyId = "",
): StorefrontSettings => {
  const root = isRecord(payload) && isRecord(payload['data']) ? payload['data'] : payload;

  if (isRecord(root) && isRecord(root['storefrontSettings'])) {
    return normalizeSettings(root['storefrontSettings'] as Partial<StorefrontSettings>, companyId);
  }

  if (isRecord(root) && isRecord(root['storefront'])) {
    const storefront = root['storefront'] as Record<string, any>;
    const storefrontFeatures = isRecord(storefront['storefrontFeatures'])
      ? storefront['storefrontFeatures']
      : {};
    const storefrontPageSettings = isRecord(storefront['settings'])
      ? storefront['settings']
      : {};
    const company = isRecord(root['company']) ? root['company'] : {};
    const companySettings = isRecord(company['settings']) ? company['settings'] : {};

    return normalizeSettings(
      {
        ...storefrontFeatures,
        ...storefrontPageSettings,
        companyId: String(company['id'] || companyId || ""),
        companySlug:
          typeof company['slug'] === "string" && company['slug'].trim()
            ? company['slug'].trim()
            : null,
        customDomain:
          typeof company['customDomain'] === "string" && company['customDomain'].trim()
            ? company['customDomain'].trim()
            : null,
        storeName:
          String(storefrontPageSettings['storeName'] || company['name'] || "").trim() ||
          "Storefront",
        description: String(companySettings['description'] || "").trim(),
        currency:
          String(storefrontPageSettings['currency'] || company['currency'] || "").trim() ||
          "EGP",
        themeId:
          typeof storefront['themeId'] === "string" && storefront['themeId'].trim()
            ? storefront['themeId']
            : "modern-minimal",
        designTokens: isRecord(storefront['designTokens']) ? storefront['designTokens'] : null,
      },
      companyId,
    );
  }

  return normalizeSettings(
    isRecord(root) ? (root as Partial<StorefrontSettings>) : null,
    companyId,
  );
};

const PUBLIC_SETTINGS_CACHE_TTL_MS = 60 * 1000;
const cachedStorefrontSettings: Record<string, StorefrontSettings> = {};
const inflightStorefrontPromises: Record<string, Promise<{ data: StorefrontSettings }>> = {};
const cachedPublicStorefrontSettings = new Map<
  string,
  { value: { success: boolean; data: StorefrontSettings }; expiresAt: number }
>();
const inflightPublicStorefrontPromises = new Map<
  string,
  Promise<{ success: boolean; data: StorefrontSettings }>
>();

const resolvePublicSettingsCacheKey = (companyId?: string): string => {
  const trimmed = typeof companyId === "string" ? companyId.trim() : "";
  if (trimmed) return `company:${trimmed}`;
  const scopedCompanyId = getCompanyId();
  if (scopedCompanyId) return `company:${scopedCompanyId}`;
  if (typeof window !== "undefined" && window.location?.hostname) {
    return `host:${window.location.hostname.toLowerCase()}`;
  }
  return "host:default";
};

export const storefrontSettingsService = {
  getSettings: async (
    companyId?: string,
    options?: { allowFallback?: boolean; force?: boolean },
  ): Promise<{ data: StorefrontSettings }> => {
    const cacheKey = companyId || "current";
    if (cachedStorefrontSettings[cacheKey] && !options?.force) {
      return { data: cachedStorefrontSettings[cacheKey] };
    }

    if (!inflightStorefrontPromises[cacheKey] || options?.force) {
      inflightStorefrontPromises[cacheKey] = (async () => {
        const hasToken =
          typeof window !== "undefined" &&
          Boolean(
            window.localStorage.getItem("accessToken") ||
            window.localStorage.getItem("token")
          );

        // If unauthenticated visitor, use public endpoint directly
        if (!hasToken) {
          try {
            const publicRes = await storefrontSettingsService.getPublicSettings(companyId, options?.force);
            if (publicRes?.success && publicRes.data) {
              cachedStorefrontSettings[cacheKey] = publicRes.data;
              return { data: publicRes.data };
            }
          } catch {
            // fallback below
          }
        }

        try {
          const response = await apiClient.get("/storefront-settings", {
            params: companyId ? { companyId } : undefined,
            _skipErrorToast: true,
          } as any);
          const normalized = normalizeSettings(
            response?.data?.data || response?.data,
            companyId,
          );
          cachedStorefrontSettings[cacheKey] = normalized;
          return { data: normalized };
        } catch (error: any) {
          const status = error?.response?.status || error?.status;
          if (status === 401 || !hasToken) {
            try {
              const publicRes = await storefrontSettingsService.getPublicSettings(companyId, options?.force);
              if (publicRes?.success && publicRes.data) {
                cachedStorefrontSettings[cacheKey] = publicRes.data;
                return { data: publicRes.data };
              }
            } catch {
              // fallback below
            }
          }
          if (options?.allowFallback === false) {
            throw error;
          }
          const fallback = buildDefaultSettings(companyId);
          cachedStorefrontSettings[cacheKey] = fallback;
          return { data: fallback };
        } finally {
          delete inflightStorefrontPromises[cacheKey];
        }
      })();
    }

    return inflightStorefrontPromises[cacheKey];
  },

  updateSettings: async (
    data: StorefrontSettingsUpdate,
    companyId?: string,
  ): Promise<{ data: StorefrontSettings }> => {
    const cacheKey = companyId || "current";
    delete cachedStorefrontSettings[cacheKey];
    delete inflightStorefrontPromises[cacheKey];
    cachedPublicStorefrontSettings.clear();
    inflightPublicStorefrontPromises.clear();
    const response = await apiClient.put(
      "/storefront-settings",
      data,
      companyId ? { params: { companyId } } : undefined,
    );
    const normalized = normalizeSettings(
      response?.data?.data || response?.data,
      companyId,
    );
    cachedStorefrontSettings[cacheKey] = normalized;
    return {
      data: normalized,
    };
  },

  resetSettings: async (
    companyId?: string,
  ): Promise<{ data: StorefrontSettings }> => {
    const cacheKey = companyId || "current";
    delete cachedStorefrontSettings[cacheKey];
    delete inflightStorefrontPromises[cacheKey];
    cachedPublicStorefrontSettings.clear();
    inflightPublicStorefrontPromises.clear();
    const response = await apiClient.post(
      "/storefront-settings/reset",
      {},
      companyId ? { params: { companyId } } : undefined,
    );
    const normalized = normalizeSettings(
      response?.data?.data || response?.data,
      companyId,
    );
    cachedStorefrontSettings[cacheKey] = normalized;
    return {
      data: normalized,
    };
  },

  getPublicSettings: async (
    companyId?: string,
    forceRefresh = false,
  ): Promise<{ success: boolean; data: StorefrontSettings }> => {
    const trimmedCompanyId = typeof companyId === "string" ? companyId.trim() : "";
    const cacheKey = resolvePublicSettingsCacheKey(trimmedCompanyId || undefined);
    const hostKey =
      typeof window !== "undefined" && window.location?.hostname
        ? `host:${window.location.hostname.toLowerCase()}`
        : "";
    const now = Date.now();

    if (!forceRefresh) {
      const cached = cachedPublicStorefrontSettings.get(cacheKey);
      if (cached && cached.expiresAt > now) {
        return cached.value;
      }

      if (trimmedCompanyId && hostKey) {
        const hostCached = cachedPublicStorefrontSettings.get(hostKey);
        if (
          hostCached &&
          hostCached.expiresAt > now &&
          hostCached.value.data?.companyId === trimmedCompanyId
        ) {
          return hostCached.value;
        }
      }

      const existingInflight = inflightPublicStorefrontPromises.get(cacheKey);
      if (existingInflight) {
        return existingInflight;
      }

      if (trimmedCompanyId && hostKey) {
        const hostInflight = inflightPublicStorefrontPromises.get(hostKey);
        if (hostInflight) {
          const hostResult = await hostInflight;
          if (hostResult?.success && hostResult.data?.companyId === trimmedCompanyId) {
            return hostResult;
          }
        }
      }
    }

    const storeResolvedPublicSettings = (result: {
      success: boolean;
      data: StorefrontSettings;
    }) => {
      if (!result.success) return result;
      const expiresAt = Date.now() + PUBLIC_SETTINGS_CACHE_TTL_MS;
      cachedPublicStorefrontSettings.set(cacheKey, { value: result, expiresAt });
      if (result.data?.companyId) {
        cachedPublicStorefrontSettings.set(`company:${result.data.companyId}`, {
          value: result,
          expiresAt,
        });
      }
      if (!trimmedCompanyId && hostKey) {
        cachedPublicStorefrontSettings.set(hostKey, { value: result, expiresAt });
      }
      return result;
    };

    const requestPromise = (async (): Promise<{
      success: boolean;
      data: StorefrontSettings;
    }> => {
      try {
        const response = await apiClient.get("/storefront-settings/public", {
          params: trimmedCompanyId
            ? { companyId: trimmedCompanyId, company: trimmedCompanyId }
            : undefined,
          _skipErrorToast: true,
          _skipAuthRefresh: true,
        } as any);
        const payload = response?.data?.data || response?.data;
        if (payload) {
          const normalized = normalizePublicSettingsPayload(
            payload,
            trimmedCompanyId || "",
          );
          return storeResolvedPublicSettings({
            success: true,
            data: normalized,
          });
        }
      } catch {
        // Fallback to storefrontFetch
      }

      if (trimmedCompanyId) {
        try {
          const response = await storefrontFetch("/storefront/settings", {
            companyId: trimmedCompanyId,
            cache: forceRefresh ? "reload" : "default",
          });
          return storeResolvedPublicSettings({
            success: Boolean(response?.success !== false),
            data: normalizePublicSettingsPayload(response, trimmedCompanyId),
          });
        } catch {
          // Fallback below
        }
      }

      return {
        success: false,
        data: buildDefaultSettings(trimmedCompanyId || ""),
      };
    })();

    inflightPublicStorefrontPromises.set(cacheKey, requestPromise);
    try {
      return await requestPromise;
    } finally {
      if (inflightPublicStorefrontPromises.get(cacheKey) === requestPromise) {
        inflightPublicStorefrontPromises.delete(cacheKey);
      }
    }
  },

  clearCache: (companyId: string) => {
    const trimmed = typeof companyId === "string" ? companyId.trim() : "";
    if (trimmed) {
      delete cachedStorefrontSettings[trimmed];
      delete inflightStorefrontPromises[trimmed];
      cachedPublicStorefrontSettings.delete(`company:${trimmed}`);
      for (const [key, entry] of cachedPublicStorefrontSettings.entries()) {
        if (entry.value.data?.companyId === trimmed) {
          cachedPublicStorefrontSettings.delete(key);
        }
      }
    } else {
      cachedPublicStorefrontSettings.clear();
      inflightPublicStorefrontPromises.clear();
    }
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(`storefront_settings_${companyId}`);
  },

  testFacebookPixel: async (pixelId?: string) => {
    const response = await apiClient.post("/storefront-settings/test-facebook-pixel", {
      ...(pixelId ? { pixelId } : {}),
    });
    return response.data;
  },

  testPixel: async (pixelId?: string) => {
    const response = await apiClient.post("/storefront-settings/test-facebook-pixel", {
      ...(pixelId ? { pixelId } : {}),
    });
    return response.data;
  },

  testFacebookCapi: async (data?: {
    pixelId?: string;
    accessToken?: string;
    testEventCode?: string;
  }) => {
    const response = await apiClient.post(
      "/storefront-settings/test-facebook-capi",
      data || {},
    );
    return response.data;
  },

  testCapi: async (data?: {
    pixelId?: string;
    accessToken?: string;
    testEventCode?: string;
  }) => {
    const response = await apiClient.post(
      "/storefront-settings/test-facebook-capi",
      data || {},
    );
    return response.data;
  },

  sendTestEvent: async (data: {
    eventName: string;
    value?: number;
    currency?: string;
    contentName?: string;
  }) => {
    const response = await apiClient.post("/storefront-settings/send-test-event", data);
    return response.data;
  },

  getPixelDiagnostics: async () => {
    const response = await apiClient.get("/storefront-settings/pixel-diagnostics");
    return response.data;
  },

  checkTokenPermissions: async () => {
    const response = await apiClient.post("/storefront-settings/check-token-permissions", {});
    return response.data;
  },

  getPixels: async () => {
    const response = await apiClient.get("/storefront-settings/pixels");
    return response.data;
  },

  addPixel: async (pixelData: Record<string, any>) => {
    const response = await apiClient.post("/storefront-settings/pixels", pixelData);
    return response.data;
  },

  updatePixel: async (id: string, pixelData: Record<string, any>) => {
    const response = await apiClient.put(`/storefront-settings/pixels/${id}`, pixelData);
    return response.data;
  },

  deletePixel: async (id: string) => {
    const response = await apiClient.delete(`/storefront-settings/pixels/${id}`);
    return response.data;
  },

  testPixelById: async (id: string) => {
    const response = await apiClient.post(`/storefront-settings/pixels/${id}/test`, {});
    return response.data;
  },

  createFacebookPixel: async (pixelName: string, businessId?: string) => {
    const response = await apiClient.post("/storefront-settings/create-pixel", {
      pixelName,
      businessId,
    });
    return response.data;
  },

  getBusinessAccounts: async () => {
    const response = await apiClient.get("/storefront-settings/business-accounts");
    return response.data;
  },

  getRevisions: async (
    limit = 20,
    companyId?: string,
  ): Promise<{ success: boolean; data: StorefrontSettingsRevisionSummary[] }> => {
    const response = await apiClient.get("/storefront-settings/revisions", {
      params: {
        limit,
        ...(companyId ? { companyId } : {}),
      },
    });
    return {
      success: Boolean(response?.data?.success),
      data: response?.data?.data || [],
    };
  },

  getRevisionById: async (
    id: string,
    companyId?: string,
  ): Promise<{ success: boolean; data: StorefrontSettingsRevision }> => {
    const response = await apiClient.get(`/storefront-settings/revisions/${id}`, {
      params: companyId ? { companyId } : undefined,
    });
    return {
      success: Boolean(response?.data?.success),
      data: response?.data?.data,
    };
  },

  restoreRevision: async (
    id: string,
    companyId?: string,
  ): Promise<{ success: boolean; data: StorefrontSettings; message?: string }> => {
    const cacheKey = companyId || "current";
    delete cachedStorefrontSettings[cacheKey];
    delete inflightStorefrontPromises[cacheKey];
    const response = await apiClient.post(
      `/storefront-settings/revisions/${id}/restore`,
      {},
      companyId ? { params: { companyId } } : undefined,
    );
    const normalized = normalizeSettings(
      response?.data?.data || response?.data,
      companyId,
    );
    cachedStorefrontSettings[cacheKey] = normalized;
    return {
      success: Boolean(response?.data?.success),
      data: normalized,
      message: response?.data?.message,
    };
  },
};

export default storefrontSettingsService;
