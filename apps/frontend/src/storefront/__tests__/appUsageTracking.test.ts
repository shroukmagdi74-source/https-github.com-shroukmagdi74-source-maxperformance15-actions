// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

const mockStorefrontFetch = vi.fn();

vi.mock("../../utils/storefrontApi", () => ({
  storefrontFetch: (...args: unknown[]) => mockStorefrontFetch(...args),
}));

import {
  resetStorefrontAppUsageTrackingForTests,
  trackStorefrontAppUsage,
} from "../utils/appUsageTracking";

describe("trackStorefrontAppUsage", () => {
  beforeEach(() => {
    mockStorefrontFetch.mockReset();
    resetStorefrontAppUsageTrackingForTests();
    window.sessionStorage.clear();
    window.history.replaceState(null, "", "/store");
  });

  it("skips marketplace preview tracking", async () => {
    window.history.replaceState(
      null,
      "",
      "/store?previewTheme=khemet-luxe-eg&previewSource=marketplace",
    );

    const tracked = await trackStorefrontAppUsage({
      slug: "conversion-suite",
      feature: "free_shipping_progress_milestone",
    });

    expect(tracked).toBe(false);
    expect(mockStorefrontFetch).not.toHaveBeenCalled();
  });

  it("tracks usage outside marketplace preview", async () => {
    mockStorefrontFetch.mockResolvedValue({ tracked: true });

    const tracked = await trackStorefrontAppUsage({
      slug: "conversion-suite",
      feature: "free_shipping_progress_milestone",
    });

    expect(tracked).toBe(true);
    expect(mockStorefrontFetch).toHaveBeenCalledWith(
      "/storefront/apps/conversion-suite/track",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("deduplicates concurrent tracking calls sharing the same dedupeKey before network resolves", async () => {
    let resolvePost!: (value: unknown) => void;
    mockStorefrontFetch.mockReturnValue(
      new Promise((resolve) => {
        resolvePost = resolve;
      }),
    );

    const p1 = trackStorefrontAppUsage({
      slug: "conversion-suite",
      feature: "cross_sell_section_view",
      dedupeKey: "cross-sell:prod-1:api",
    });
    const p2 = trackStorefrontAppUsage({
      slug: "conversion-suite",
      feature: "cross_sell_section_view",
      dedupeKey: "cross-sell:prod-1:api",
    });

    resolvePost({ tracked: true });
    const [r1, r2] = await Promise.all([p1, p2]);

    expect(r1).toBe(true);
    expect(r2).toBe(false);
    expect(mockStorefrontFetch).toHaveBeenCalledTimes(1);
  });
});
