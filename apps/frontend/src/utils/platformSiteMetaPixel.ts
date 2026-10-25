import {
  trackCompleteRegistration as trackMetaCompleteRegistration,
  trackCustom,
  trackLead as trackMetaLead,
  trackStandardEvent,
} from "./facebookPixel";
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

let currentPlatformSiteMetaPixelSettings: PlatformSiteMetaPixelPublicSettings = {
  ...DEFAULT_PLATFORM_SITE_META_PIXEL_PUBLIC_SETTINGS,
};

const buildContextPayload = (
  eventSource: string,
  data: Record<string, unknown> = {},
) => ({
  event_source: eventSource,
  page_path: typeof window !== "undefined" ? window.location.pathname : "",
  page_search: typeof window !== "undefined" ? window.location.search : "",
  ...data,
});

export const setPlatformSiteMetaPixelSettings = (
  settings?: Partial<PlatformSiteMetaPixelPublicSettings> | null,
) => {
  currentPlatformSiteMetaPixelSettings = {
    ...DEFAULT_PLATFORM_SITE_META_PIXEL_PUBLIC_SETTINGS,
    ...settings,
    enabled: Boolean(settings?.enabled),
    pixelId:
      typeof settings?.pixelId === "string" ? settings.pixelId.trim() : "",
  };
};

export const resetPlatformSiteMetaPixelSettings = () => {
  currentPlatformSiteMetaPixelSettings = {
    ...DEFAULT_PLATFORM_SITE_META_PIXEL_PUBLIC_SETTINGS,
  };
};

export const getPlatformSiteMetaPixelSettings =
  (): PlatformSiteMetaPixelPublicSettings =>
    currentPlatformSiteMetaPixelSettings;

export const trackPlatformSiteLead = (
  eventSource: string,
  data: Record<string, unknown> = {},
) => {
  if (
    !currentPlatformSiteMetaPixelSettings.enabled ||
    !currentPlatformSiteMetaPixelSettings.trackLead
  ) {
    return;
  }

  return trackMetaLead(buildContextPayload(eventSource, data));
};

export const trackPlatformSiteCompleteRegistration = (
  eventSource: string,
  data: Record<string, unknown> = {},
) => {
  if (
    !currentPlatformSiteMetaPixelSettings.enabled ||
    !currentPlatformSiteMetaPixelSettings.trackCompleteRegistration
  ) {
    return;
  }

  return trackMetaCompleteRegistration(buildContextPayload(eventSource, data));
};

export const trackPlatformSiteLogin = (
  data: Record<string, unknown> = {},
) => {
  if (
    !currentPlatformSiteMetaPixelSettings.enabled ||
    !currentPlatformSiteMetaPixelSettings.trackLogin
  ) {
    return;
  }

  return trackCustom(
    currentPlatformSiteMetaPixelSettings.loginEventName || "PlatformLogin",
    buildContextPayload("platform_login", data),
  );
};


export const trackPlatformSiteInitiateCheckout = (
  eventSource: string,
  data: Record<string, unknown> = {},
) => {
  if (
    !currentPlatformSiteMetaPixelSettings.enabled ||
    currentPlatformSiteMetaPixelSettings.trackInitiateCheckout === false
  ) {
    return;
  }

  const eventId =
    typeof data.eventID === "string"
      ? data.eventID
      : typeof data.eventId === "string"
        ? data.eventId
        : undefined;

  const { eventID, eventId: _unused, ...restData } = data;

  const payload = buildContextPayload(eventSource, {
    currency: "EGP",
    ...restData,
  });

  return trackStandardEvent(
    "InitiateCheckout",
    payload,
    eventId ? { eventID: eventId } : undefined,
  );
};

export const trackPlatformSitePurchase = (
  eventSource: string,
  data: Record<string, unknown> = {},
) => {
  if (
    !currentPlatformSiteMetaPixelSettings.enabled ||
    currentPlatformSiteMetaPixelSettings.trackPurchase === false
  ) {
    return;
  }

  const eventId =
    typeof data.eventID === "string"
      ? data.eventID
      : typeof data.eventId === "string"
        ? data.eventId
        : undefined;

  const { eventID, eventId: _unused, ...restData } = data;

  const payload = buildContextPayload(eventSource, {
    currency: "EGP",
    ...restData,
  });

  return trackStandardEvent(
    "Purchase",
    payload,
    eventId ? { eventID: eventId } : undefined,
  );
};
