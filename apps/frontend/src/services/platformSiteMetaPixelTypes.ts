export interface PlatformSiteMetaPixelSettings {
  siteKey: string;
  isEnabled: boolean;
  pixelId: string;
  trackPageView: boolean;
  trackLead: boolean;
  trackCompleteRegistration: boolean;
  trackLogin: boolean;
  trackInitiateCheckout?: boolean;
  trackPurchase?: boolean;
  loginEventName: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface PlatformSiteMetaPixelPublicSettings {
  enabled: boolean;
  pixelId: string;
  trackPageView: boolean;
  trackLead: boolean;
  trackCompleteRegistration: boolean;
  trackLogin: boolean;
  trackInitiateCheckout?: boolean;
  trackPurchase?: boolean;
  loginEventName: string;
  updatedAt?: string | null;
}

export const DEFAULT_PLATFORM_SITE_META_PIXEL_SETTINGS: PlatformSiteMetaPixelSettings =
  {
    siteKey: "maxp.online",
    isEnabled: false,
    pixelId: "",
    trackPageView: true,
    trackLead: true,
    trackCompleteRegistration: true,
    trackLogin: false,
    trackInitiateCheckout: true,
    trackPurchase: true,
    loginEventName: "PlatformLogin",
    createdAt: null,
    updatedAt: null,
  };

export const DEFAULT_PLATFORM_SITE_META_PIXEL_PUBLIC_SETTINGS: PlatformSiteMetaPixelPublicSettings =
  {
    enabled: false,
    pixelId: "",
    trackPageView: false,
    trackLead: false,
    trackCompleteRegistration: false,
    trackLogin: false,
    trackInitiateCheckout: true,
    trackPurchase: true,
    loginEventName: "PlatformLogin",
    updatedAt: null,
  };
