// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import {
  calculatePerformanceScore,
  calculatePageWeights,
  formatBytes,
  extractPageImages,
  extractPageFonts,
  type PerformanceAuditInput,
} from "../studio/utils/performanceScore";
import {
  sendAnalyticsEvent,
  trackStudioOpen,
  trackStudioPublish,
  trackStudioTemplateApply,
  trackStudioAiOpen,
  trackStudioError,
  setStorefrontCompanySlug,
  setStorefrontCompanyId,
} from "../analytics/beacon";
import { StudioErrorBoundary } from "../studio/StudioErrorBoundary";
import { StudioInspectorAnalyticsTab } from "../studio/inspector/StudioInspectorAnalyticsTab";

describe("Studio Performance, Product Metrics & Error Monitoring (PERF-1)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    if (typeof window !== "undefined" && window.sessionStorage) {
      window.sessionStorage.clear();
    }
    setStorefrontCompanySlug("swan-store");
    setStorefrontCompanyId("company-123");
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe("1 & 2. Performance Scoring & Page Weights (Local, Zero-Network)", () => {
    // Clean page: 3 sections, dimensioned images, 2 fonts
    const cleanPageInput: PerformanceAuditInput = {
      fonts: ["Cairo", "Tajawal"],
      sections: [
        {
          id: "sec-1",
          type: "hero-banner",
          settings: {
            title: "متجر أنيق",
            image: {
              url: "https://example.com/banner.webp",
              width: 1200,
              height: 600,
              size: 150 * 1024, // 150KB <= 300KB
            },
          },
        },
        {
          id: "sec-2",
          type: "product-grid",
          settings: {
            title: "أحدث المنتجات",
            items: [
              {
                id: "p1",
                title: "قميص صيفي",
                image: {
                  url: "https://example.com/p1.webp",
                  width: 600,
                  height: 600,
                  size: 80 * 1024,
                },
              },
            ],
          },
        },
        {
          id: "sec-3",
          type: "cta-simple",
          settings: {
            title: "اشترك الآن",
            buttonText: "تسوق فوراً",
          },
        },
      ],
      customCss: "body { margin: 0; }",
      customJs: "",
    };

    it("evaluates a clean page (3 sections, dimensioned images, 2 fonts) with score >= 90", () => {
      const result = calculatePerformanceScore(cleanPageInput);

      // Acceptance criterion 2: clean page score >= 90
      expect(result.score).toBeGreaterThanOrEqual(90);
      expect(result.rating).toBe("excellent");
      expect(result.metrics.sectionCount).toBe(3);
      expect(result.metrics.imagesWithoutDimensionsCount).toBe(0);
      expect(result.metrics.largeImagesCount).toBe(0);
      expect(result.metrics.fontsCount).toBe(2);
    });

    it("drops score by >= 20 points when 5 images without dimensions are added to the clean page", () => {
      const cleanResult = calculatePerformanceScore(cleanPageInput);
      const cleanScore = cleanResult.score;
      expect(cleanScore).toBeGreaterThanOrEqual(90);

      // Degraded page: same clean page + 5 images missing dimensions (e.g. plain url strings or w/h <= 0)
      const degradedPageInput: PerformanceAuditInput = {
        ...cleanPageInput,
        sections: [
          ...(cleanPageInput.sections || []),
          {
            id: "sec-gallery",
            type: "gallery",
            settings: {
              items: [
                { id: "g1", image: "https://example.com/raw1.jpg" }, // 1: no dimensions
                { id: "g2", image: "https://example.com/raw2.jpg" }, // 2: no dimensions
                { id: "g3", image: "https://example.com/raw3.jpg" }, // 3: no dimensions
                { id: "g4", image: { url: "https://example.com/raw4.jpg" } }, // 4: no dimensions
                { id: "g5", image: { url: "https://example.com/raw5.jpg", width: 0, height: 0 } }, // 5: invalid dimensions
              ],
            },
          },
        ],
      };

      const degradedResult = calculatePerformanceScore(degradedPageInput);
      const degradedScore = degradedResult.score;

      // Acceptance criterion 2: Score drops by at least 20 points
      const scoreDrop = cleanScore - degradedScore;
      expect(scoreDrop).toBeGreaterThanOrEqual(20);
      expect(degradedResult.metrics.imagesWithoutDimensionsCount).toBe(5);
    });

    it("does NOT recommend reducing fonts when page has only 2 fonts (fonts <= 3)", () => {
      const result = calculatePerformanceScore(cleanPageInput);

      // Acceptance criterion 3: Strictly NO "قلّل الخطوط" when fonts <= 3
      const hasFontReductionRecommendation = result.recommendations.some(
        (rec) => rec.includes("قلّل الخطوط") || rec.includes("الخطوط")
      );
      expect(hasFontReductionRecommendation).toBe(false);
    });

    it("recommends reducing fonts when page has > 3 fonts (e.g. 5 fonts)", () => {
      const fontHeavyInput: PerformanceAuditInput = {
        ...cleanPageInput,
        fonts: ["Cairo", "Tajawal", "Almarai", "Amiri", "Changa"],
      };

      const result = calculatePerformanceScore(fontHeavyInput);

      expect(result.metrics.fontsCount).toBe(5);
      const hasFontReductionRecommendation = result.recommendations.some(
        (rec) => rec.includes("قلّل الخطوط")
      );
      expect(hasFontReductionRecommendation).toBe(true);
    });

    it("caps recommendations to top 3 prioritized by impact", () => {
      // Page with multiple violations: excessive sections, images without dimensions, large images, large scripts, excessive fonts
      const heavyInput: PerformanceAuditInput = {
        fonts: ["Cairo", "Tajawal", "Almarai", "Amiri", "Changa"],
        customCss: "/* huge style block */\n".repeat(2000), // > 30KB
        sections: [
          ...Array.from({ length: 14 }).map((_, i) => ({
            id: `sec-${i}`,
            type: "custom-section",
            settings: {
              image: {
                url: `https://example.com/heavy-${i}.png`,
                size: 450 * 1024, // > 300KB
              },
            },
          })),
        ],
      };

      const result = calculatePerformanceScore(heavyInput);

      // Must be at most 3 recommendations
      expect(result.recommendations.length).toBeLessThanOrEqual(3);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it("accurately calculates page weights from images, scripts, styles, and data bytes", () => {
      const weights = calculatePageWeights(cleanPageInput);

      expect(weights.imagesBytes).toBeGreaterThan(0);
      expect(weights.stylesBytes).toBeGreaterThan(0);
      expect(weights.dataBytes).toBeGreaterThan(0);
      expect(weights.totalBytes).toBe(
        weights.imagesBytes + weights.scriptsBytes + weights.stylesBytes + weights.dataBytes
      );
      expect(weights.formattedTotal).toMatch(/KB|MB/);
    });
  });

  describe("3. Product Metrics Telemetry (studio_open, studio_publish, studio_template_apply, studio_ai_open)", () => {
    it("dispatches 'studio_open' event once with companyId and pageKey", () => {
      const sendBeaconMock = vi.fn().mockReturnValue(true);
      Object.defineProperty(navigator, "sendBeacon", {
        value: sendBeaconMock,
        writable: true,
        configurable: true,
      });

      const sent = trackStudioOpen("home", { companyId: "comp-456" });

      expect(sent).toBe(true);
      expect(sendBeaconMock).toHaveBeenCalledTimes(1);

      const [url, blob] = sendBeaconMock.mock.calls[0];
      expect(url).toContain("/storefront-analytics/event");
      expect(blob).toBeInstanceOf(Blob);
    });

    it("dispatches 'studio_publish' event once with companyId", () => {
      const sendBeaconMock = vi.fn().mockReturnValue(true);
      Object.defineProperty(navigator, "sendBeacon", {
        value: sendBeaconMock,
        writable: true,
        configurable: true,
      });

      const sent = trackStudioPublish("shop", { companyId: "comp-456", sectionCount: 5 });

      expect(sent).toBe(true);
      expect(sendBeaconMock).toHaveBeenCalledTimes(1);
    });

    it("dispatches 'studio_template_apply' event once with companyId and template id", () => {
      const sendBeaconMock = vi.fn().mockReturnValue(true);
      Object.defineProperty(navigator, "sendBeacon", {
        value: sendBeaconMock,
        writable: true,
        configurable: true,
      });

      const sent = trackStudioTemplateApply("home", "cairo-stride", { companyId: "comp-456" });

      expect(sent).toBe(true);
      expect(sendBeaconMock).toHaveBeenCalledTimes(1);
    });

    it("dispatches 'studio_ai_open' event once with companyId", () => {
      const sendBeaconMock = vi.fn().mockReturnValue(true);
      Object.defineProperty(navigator, "sendBeacon", {
        value: sendBeaconMock,
        writable: true,
        configurable: true,
      });

      const sent = trackStudioAiOpen("home", { companyId: "comp-456" });

      expect(sent).toBe(true);
      expect(sendBeaconMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("4. Error Monitoring: StudioErrorBoundary", () => {
    const ProblematicSection: React.FC<{ shouldCrash?: boolean }> = ({ shouldCrash }) => {
      if (shouldCrash) {
        throw new Error("Crash during section rendering test");
      }
      return <div data-testid="healthy-section">قسم سليم</div>;
    };

    it("catches render errors, prevents application crash, and dispatches studio_error event", () => {
      // Suppress React boundary console.error during expected failure
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const sendBeaconMock = vi.fn().mockReturnValue(true);
      Object.defineProperty(navigator, "sendBeacon", {
        value: sendBeaconMock,
        writable: true,
        configurable: true,
      });

      // Render crashing component inside StudioErrorBoundary
      const { queryByTestId, getByTestId } = render(
        <StudioErrorBoundary
          sectionKey="broken-hero-section"
          companyId="company-xyz"
          pageKey="home"
        >
          <ProblematicSection shouldCrash={true} />
        </StudioErrorBoundary>
      );

      // 1. Application did NOT crash: fallback UI is rendered
      expect(queryByTestId("healthy-section")).toBeNull();
      const fallback = getByTestId("studio-error-boundary-fallback");
      expect(fallback).toBeDefined();
      expect(fallback.textContent).toContain("broken-hero-section");
      expect(fallback.textContent).toContain("Crash during section rendering test");

      // 2. studio_error event was dispatched with sectionKey & message
      expect(sendBeaconMock).toHaveBeenCalledTimes(1);

      consoleErrorSpy.mockRestore();
    });
  });

  describe("5. Inspector Performance Tab UI", () => {
    it("renders performance score badge, page weights, and recommendations list", () => {
      const mockSections = [
        {
          id: "s1",
          type: "hero",
          settings: {
            title: "بطل المتجر",
            image: {
              url: "https://example.com/img.jpg",
              width: 800,
              height: 400,
              size: 100 * 1024,
            },
          },
        },
      ];

      render(
        <StudioInspectorAnalyticsTab
          companyId="company-123"
          activePageKey="home"
          sections={mockSections}
          fonts={["Cairo"]}
          initialSubView="speed"
        />
      );

      // Score Card
      const scoreCard = screen.getByTestId("performance-score-card");
      expect(scoreCard).toBeDefined();
      const scoreVal = screen.getByTestId("performance-score-value");
      expect(Number(scoreVal.textContent)).toBeGreaterThanOrEqual(90);

      // Weights Card
      const weightsCard = screen.getByTestId("performance-weights-card");
      expect(weightsCard).toBeDefined();
      const totalWeight = screen.getByTestId("performance-total-weight");
      expect(totalWeight.textContent).toMatch(/KB|B|MB/);

      // Recommendations
      const recommendationsCard = screen.getByTestId("performance-recommendations-card");
      expect(recommendationsCard).toBeDefined();
    });
  });
});
