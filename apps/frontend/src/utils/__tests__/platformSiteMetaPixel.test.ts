import {
  setPlatformSiteMetaPixelSettings,
  resetPlatformSiteMetaPixelSettings,
  getPlatformSiteMetaPixelSettings,
  trackPlatformSitePurchase,
  trackPlatformSiteInitiateCheckout,
  trackPlatformSiteLead,
  trackPlatformSiteCompleteRegistration,
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
});
