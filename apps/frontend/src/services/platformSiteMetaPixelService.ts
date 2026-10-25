import { apiClient } from "./apiClient";
import {
  DEFAULT_PLATFORM_SITE_META_PIXEL_PUBLIC_SETTINGS,
  DEFAULT_PLATFORM_SITE_META_PIXEL_SETTINGS,
  PlatformSiteMetaPixelPublicSettings,
  PlatformSiteMetaPixelSettings,
} from "./platformSiteMetaPixelTypes";

export type {
  PlatformSiteMetaPixelSettings,
  PlatformSiteMetaPixelPublicSettings,
};
export {
  DEFAULT_PLATFORM_SITE_META_PIXEL_SETTINGS,
  DEFAULT_PLATFORM_SITE_META_PIXEL_PUBLIC_SETTINGS,
};

const unwrapData = <T>(payload: any, fallback: T): T => {
  if (payload?.data !== undefined) {
    return payload.data as T;
  }

  return (payload ?? fallback) as T;
};

const normalizeText = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value.trim() : fallback;

const normalizeAdminSettings = (
  value?: Partial<PlatformSiteMetaPixelSettings> | null,
): PlatformSiteMetaPixelSettings => ({
  ...DEFAULT_PLATFORM_SITE_META_PIXEL_SETTINGS,
  siteKey:
    normalizeText(value?.siteKey) ||
    DEFAULT_PLATFORM_SITE_META_PIXEL_SETTINGS.siteKey,
  isEnabled: Boolean(value?.isEnabled),
  pixelId: normalizeText(value?.pixelId),
  trackPageView: value?.trackPageView !== false,
  trackLead: value?.trackLead !== false,
  trackCompleteRegistration: value?.trackCompleteRegistration !== false,
  trackLogin: Boolean(value?.trackLogin),
  trackInitiateCheckout: value?.trackInitiateCheckout !== false,
  trackPurchase: value?.trackPurchase !== false,
  loginEventName:
    normalizeText(value?.loginEventName) ||
    DEFAULT_PLATFORM_SITE_META_PIXEL_SETTINGS.loginEventName,
  createdAt: value?.createdAt ?? null,
  updatedAt: value?.updatedAt ?? null,
});

const normalizePublicSettings = (
  value?: Partial<PlatformSiteMetaPixelPublicSettings> | null,
): PlatformSiteMetaPixelPublicSettings => ({
  ...DEFAULT_PLATFORM_SITE_META_PIXEL_PUBLIC_SETTINGS,
  enabled: Boolean(value?.enabled),
  pixelId: normalizeText(value?.pixelId),
  trackPageView: Boolean(value?.trackPageView),
  trackLead: Boolean(value?.trackLead),
  trackCompleteRegistration: Boolean(value?.trackCompleteRegistration),
  trackLogin: Boolean(value?.trackLogin),
  trackInitiateCheckout: value?.trackInitiateCheckout !== false,
  trackPurchase: value?.trackPurchase !== false,
  loginEventName:
    normalizeText(value?.loginEventName) ||
    DEFAULT_PLATFORM_SITE_META_PIXEL_PUBLIC_SETTINGS.loginEventName,
  updatedAt: value?.updatedAt ?? null,
});

export const platformSiteMetaPixelService = {
  async getSettings(): Promise<PlatformSiteMetaPixelSettings> {
    const response = await apiClient.get("/super-admin/platform/site-meta-pixel");
    return normalizeAdminSettings(
      unwrapData<PlatformSiteMetaPixelSettings>(
        response.data,
        DEFAULT_PLATFORM_SITE_META_PIXEL_SETTINGS,
      ),
    );
  },

  async updateSettings(
    payload: Partial<PlatformSiteMetaPixelSettings>,
  ): Promise<PlatformSiteMetaPixelSettings> {
    const response = await apiClient.put(
      "/super-admin/platform/site-meta-pixel",
      payload,
    );

    return normalizeAdminSettings(
      unwrapData<PlatformSiteMetaPixelSettings>(
        response.data,
        DEFAULT_PLATFORM_SITE_META_PIXEL_SETTINGS,
      ),
    );
  },

  async getPublicSettings(): Promise<PlatformSiteMetaPixelPublicSettings> {
    try {
      const response = await apiClient.get("/public/platform/meta-pixel", {
        _skipErrorToast: true,
      });

      return normalizePublicSettings(
        unwrapData<PlatformSiteMetaPixelPublicSettings>(
          response.data,
          DEFAULT_PLATFORM_SITE_META_PIXEL_PUBLIC_SETTINGS,
        ),
      );
    } catch (err: any) {
      // The public meta-pixel endpoint can 400 when there is no
      // company/subdomain context (e.g. on the main domain). Fall back to
      // defaults silently instead of surfacing a console error on every load.
      if (String(err?.response?.status || err?.message || "").includes("400")) {
        return normalizePublicSettings(
          DEFAULT_PLATFORM_SITE_META_PIXEL_PUBLIC_SETTINGS,
        );
      }
      throw err;
    }
  },
};

export default platformSiteMetaPixelService;
