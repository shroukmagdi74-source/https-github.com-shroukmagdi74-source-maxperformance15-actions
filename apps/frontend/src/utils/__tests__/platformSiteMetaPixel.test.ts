import {
  setPlatformSiteMetaPixelSettings,
  resetPlatformSiteMetaPixelSettings,
  getPlatformSiteMetaPixelSettings,
  trackPlatformSitePurchase,
  trackPlatformSiteInitiateCheckout,
  trackPlatformSiteLead,
  trackPlatformSiteCompleteRegistration,
  trackPlatformSiteCustomEvent,
  trackPlatformSiteCustomEventWhenReady,
} from "../platformSiteMetaPixel";
import * as fbModule from "../facebookPixel";

jest.mock("../facebookPixel", () => ({
  trackStandardEvent: jest.fn(),
  trackLead: jest.fn(),
  trackCompleteRegistration: jest.fn(),
  trackCustom: jest.fn(),
}));

describe("platformSiteMetaPixel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetPlatformSiteMetaPixelSettings();
  });

  describe("trackPlatformSitePurchase", () => {
    it("returns early when pixel is not enabled", () => {
      setPlatformSiteMetaPixelSettings({ enabled: false, pixelId: "123456789012345" });
      const result = trackPlatformSitePurchase("subscription_success", {
        value: 999,
        content_name: "store-complete-bundle",
      });
      expect(result).toBeUndefined();
      expect(fbModule.trackStandardEvent).not.toHaveBeenCalled();
    });

    it("returns early when trackPurchase is explicitly false", () => {
      setPlatformSiteMetaPixelSettings({
        enabled: true,
        pixelId: "123456789012345",
        trackPurchase: false,
      });
      const result = trackPlatformSitePurchase("subscription_success", {
        value: 999,
        content_name: "store-complete-bundle",
      });
      expect(result).toBeUndefined();
      expect(fbModule.trackStandardEvent).not.toHaveBeenCalled();
    });

    it("sends Purchase event with value, currency: EGP, content_name, and eventID", () => {
      setPlatformSiteMetaPixelSettings({
        enabled: true,
        pixelId: "123456789012345",
        trackPurchase: true,
      });

      trackPlatformSitePurchase("subscription_success", {
        value: 999,
        content_name: "store-complete-bundle",
        eventID: "purchase_bill-123",
      });

      expect(fbModule.trackStandardEvent).toHaveBeenCalledWith(
        "Purchase",
        expect.objectContaining({
          event_source: "subscription_success",
          value: 999,
          currency: "EGP",
          content_name: "store-complete-bundle",
        }),
        { eventID: "purchase_bill-123" },
      );
    });
  });

  describe("trackPlatformSiteInitiateCheckout", () => {
    it("returns early when pixel is not enabled", () => {
      setPlatformSiteMetaPixelSettings({ enabled: false, pixelId: "123456789012345" });
      const result = trackPlatformSiteInitiateCheckout("csb_subscribe_cta", {
        value: 999,
        content_name: "store-complete-bundle",
      });
      expect(result).toBeUndefined();
      expect(fbModule.trackStandardEvent).not.toHaveBeenCalled();
    });

    it("returns early when trackInitiateCheckout is false", () => {
      setPlatformSiteMetaPixelSettings({
        enabled: true,
        pixelId: "123456789012345",
        trackInitiateCheckout: false,
      });
      const result = trackPlatformSiteInitiateCheckout("csb_subscribe_cta", {
        value: 999,
        content_name: "store-complete-bundle",
      });
      expect(result).toBeUndefined();
      expect(fbModule.trackStandardEvent).not.toHaveBeenCalled();
    });

    it("sends InitiateCheckout event with value, currency: EGP, and content_name", () => {
      setPlatformSiteMetaPixelSettings({
        enabled: true,
        pixelId: "123456789012345",
      });

      trackPlatformSiteInitiateCheckout("csb_subscribe_cta", {
        value: 999,
        content_name: "store-complete-bundle",
        num_items: 17,
      });

      expect(fbModule.trackStandardEvent).toHaveBeenCalledWith(
        "InitiateCheckout",
        expect.objectContaining({
          event_source: "csb_subscribe_cta",
          value: 999,
          currency: "EGP",
          content_name: "store-complete-bundle",
          num_items: 17,
        }),
        undefined,
      );
    });
  });
describe("trackPlatformSiteCustomEvent", () => {
    it("returns early when pixel is not enabled", () => {
      setPlatformSiteMetaPixelSettings({ enabled: false, pixelId: "123456789012345" });
      const result = trackPlatformSiteCustomEvent("RegisterView", {
        source: "test",
      });
      expect(result).toBeUndefined();
      expect(fbModule.trackCustom).not.toHaveBeenCalled();
    });

    it("sends custom event with context payload when enabled", () => {
      setPlatformSiteMetaPixelSettings({
        enabled: true,
        pixelId: "123456789012345",
      });

      trackPlatformSiteCustomEvent("RegisterView", {
        source: "campaign_1",
        landingBundle: "store-complete-bundle",
      }, "auth_register_view");

      expect(fbModule.trackCustom).toHaveBeenCalledWith(
        "RegisterView",
        expect.objectContaining({
          event_source: "auth_register_view",
          source: "campaign_1",
          landingBundle: "store-complete-bundle",
        }),
      );
    });
  });
  describe("trackPlatformSiteCustomEventWhenReady", () => {
    it("fires immediately when settings are already enabled", () => {
      setPlatformSiteMetaPixelSettings({
        enabled: true,
        pixelId: "123456789012345",
      });

      trackPlatformSiteCustomEventWhenReady("RegisterSubmit", {
        source: "test-src",
      }, "auth_register_submit");

      expect(fbModule.trackCustom).toHaveBeenCalledWith(
        "RegisterSubmit",
        expect.objectContaining({
          event_source: "auth_register_submit",
          source: "test-src",
        }),
      );
    });

    it("waits for platform-pixel-ready event when initially disabled", () => {
      resetPlatformSiteMetaPixelSettings();

      trackPlatformSiteCustomEventWhenReady("RegisterView", {
        source: "waiting-src",
      }, "auth_register_view");

      expect(fbModule.trackCustom).not.toHaveBeenCalled();

      // Now settings finish loading and dispatch platform-pixel-ready
      setPlatformSiteMetaPixelSettings({
        enabled: true,
        pixelId: "123456789012345",
      });

      expect(fbModule.trackCustom).toHaveBeenCalledWith(
        "RegisterView",
        expect.objectContaining({
          event_source: "auth_register_view",
          source: "waiting-src",
        }),
      );
    });
  });
});