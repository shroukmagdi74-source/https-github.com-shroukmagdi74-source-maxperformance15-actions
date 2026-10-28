// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import {
  APP_SECTION_PRESETS,
  getAllAppPresetSections,
  getAppSectionPreset,
  searchAppSectionPresets,
} from "../presets/appSectionPresets";
import { StudioSectionCatalogModal } from "../studio/StudioSectionCatalogModal";
import { isStorefrontSectionKnown, getStorefrontSectionManifest } from "../sections/manifest";

describe("APPS-1: App Section Presets Registry & Catalog Modal", () => {
  afterEach(() => {
    cleanup();
  });

  // 1. App count = exactly 20
  it("registers exactly 20 industrial business applications", () => {
    expect(APP_SECTION_PRESETS).toHaveLength(20);

    const expectedAppIds = [
      "app-booking",
      "app-courses",
      "app-restaurants",
      "app-clinics",
      "app-pharmacies",
      "app-real-estate",
      "app-contracting",
      "app-manufacturing",
      "app-dental-lab",
      "app-interior-finishing",
      "app-gym",
      "app-salon",
      "app-education",
      "app-fashion-store",
      "app-electronics",
      "app-supermarket",
      "app-auto-repair",
      "app-travel",
      "app-charity",
      "app-home-services",
    ];

    const actualAppIds = APP_SECTION_PRESETS.map((app) => app.appId);
    expect(actualAppIds).toEqual(expectedAppIds);

    // Each app has essential metadata
    APP_SECTION_PRESETS.forEach((app) => {
      expect(app.appName).toBeTruthy();
      expect(app.category).toBeTruthy();
      expect(app.description).toBeTruthy();
      expect(app.keywords.length).toBeGreaterThan(0);
    });
  });

  // 2. Each app has >= 3 sections
  it("ensures every application has at least 3 sections built from valid presets", () => {
    let totalSections = 0;

    APP_SECTION_PRESETS.forEach((app) => {
      expect(app.sections.length).toBeGreaterThanOrEqual(3);
      totalSections += app.sections.length;

      app.sections.forEach((section) => {
        expect(section.id).toBeTruthy();
        expect(section.type).toBeTruthy();
        expect(section.label).toBeTruthy();
        expect(section.description).toBeTruthy();
        expect(section.badge).toContain("متاح مع تطبيق");
        expect(section.settings).toBeDefined();
        expect(typeof section.settings).toBe("object");
      });
    });

    expect(totalSections).toBeGreaterThanOrEqual(60);
  });

  // 3. Zero new components — all section types exist in STOREFRONT_SECTION_MANIFEST
  it("verifies zero new components: all preset sections use known storefront section types", () => {
    const allSections = getAllAppPresetSections();
    expect(allSections.length).toBeGreaterThanOrEqual(60);

    allSections.forEach((section) => {
      const isKnown = isStorefrontSectionKnown(section.type);
      expect(isKnown).toBe(true);

      const manifest = getStorefrontSectionManifest(section.type);
      expect(manifest).toBeDefined();
    });
  });

  // 4. Negative test: Zero forbidden marketing text / promises
  it("enforces negative text guard: zero occurrences of /%|توفير|عميل سعيد|آلاف/ in default texts", () => {
    const forbiddenPattern = /%|٪|توفير|عميل سعيد|آلاف/;
    const violations: string[] = [];

    const inspectText = (val: unknown, path: string) => {
      if (typeof val === "string") {
        if (forbiddenPattern.test(val)) {
          violations.push(`Violation at ${path}: "${val}"`);
        }
      } else if (Array.isArray(val)) {
        val.forEach((item, index) => inspectText(item, `${path}[${index}]`));
      } else if (val && typeof val === "object") {
        Object.entries(val).forEach(([key, subVal]) => {
          inspectText(subVal, `${path}.${key}`);
        });
      }
    };

    inspectText(APP_SECTION_PRESETS, "APP_SECTION_PRESETS");
    expect(violations).toEqual([]);
  });

  // 5. StudioSectionCatalogModal: Tab "التطبيقات" and badge "متاح مع تطبيق X"
  it("renders Tab 'التطبيقات' in StudioSectionCatalogModal with app badges and 20 apps filter", () => {
    const handleAddSection = vi.fn();
    const handleClose = vi.fn();

    render(
      <StudioSectionCatalogModal
        isOpen={true}
        onClose={handleClose}
        onAddSection={handleAddSection}
      />
    );

    // Tab button "التطبيقات"
    const appsTabBtn = screen.getByTestId("tab-app-presets");
    expect(appsTabBtn).toBeTruthy();
    expect(appsTabBtn.textContent).toContain("التطبيقات");
    expect(appsTabBtn.textContent).toContain("20 تطبيق");

    // Click Tab "التطبيقات"
    fireEvent.click(appsTabBtn);

    // Sidebar should display "جميع التطبيقات" and apps
    expect(screen.getByTestId("app-filter-all")).toBeTruthy();
    expect(screen.getByTestId("app-filter-app-booking")).toBeTruthy();
    expect(screen.getByTestId("app-filter-app-clinics")).toBeTruthy();
    expect(screen.getByTestId("app-filter-app-courses")).toBeTruthy();

    // Badges must exist
    const badges = screen.getAllByTestId("app-preset-badge");
    expect(badges.length).toBeGreaterThan(0);
    expect(badges[0].textContent).toContain("متاح مع تطبيق");
  });

  // 6. Search «عيادة» returns clinics app sections
  it("returns clinics application presets when searching for «عيادة» in catalog", () => {
    const handleAddSection = vi.fn();
    const handleClose = vi.fn();

    render(
      <StudioSectionCatalogModal
        isOpen={true}
        onClose={handleClose}
        onAddSection={handleAddSection}
      />
    );

    const searchInput = screen.getByTestId("section-catalog-search-input");
    fireEvent.change(searchInput, { target: { value: "عيادة" } });

    // Assert that clinics app preset sections are returned
    const cards = screen.getAllByTestId("section-catalog-card");
    expect(cards.length).toBeGreaterThanOrEqual(1);

    const cardTexts = cards.map((c) => c.textContent).join(" ");
    expect(cardTexts).toMatch(/عيادات ومراكز طبية|العيادات والتخصصات|الرعاية الصحية/);

    const clinicBadges = screen.getAllByTestId("app-preset-badge");
    expect(clinicBadges.some((b) => b.textContent?.includes("عيادات ومراكز طبية"))).toBe(true);
  });

  // 7. Inserting an app section preset calls onAddSection with type and settings
  it("inserts the chosen app section preset into the canvas on click", () => {
    const handleAddSection = vi.fn();
    const handleClose = vi.fn();

    render(
      <StudioSectionCatalogModal
        isOpen={true}
        onClose={handleClose}
        onAddSection={handleAddSection}
      />
    );

    // Switch to apps tab
    const appsTabBtn = screen.getByTestId("tab-app-presets");
    fireEvent.click(appsTabBtn);

    // Filter to dental lab app
    const dentalAppFilter = screen.getByTestId("app-filter-app-dental-lab");
    fireEvent.click(dentalAppFilter);

    // Click insert on the first card
    const insertButtons = screen.getAllByTestId("insert-section-btn");
    expect(insertButtons.length).toBeGreaterThanOrEqual(3);

    fireEvent.click(insertButtons[0]);

    expect(handleAddSection).toHaveBeenCalledTimes(1);
    expect(handleAddSection).toHaveBeenCalledWith("hero-banner", expect.any(Object));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  // 8. Helper lookup functions work accurately
  it("verifies getAppSectionPreset and searchAppSectionPresets helpers", () => {
    const clinicApp = getAppSectionPreset("app-clinics");
    expect(clinicApp).toBeDefined();
    expect(clinicApp?.appName).toBe("عيادات ومراكز طبية");
    expect(clinicApp?.sections.length).toBeGreaterThanOrEqual(3);

    const searchResults = searchAppSectionPresets("عقارات");
    expect(searchResults.length).toBeGreaterThanOrEqual(3);
    expect(searchResults.every((r) => r.appId === "app-real-estate" || r.appName.includes("عقارات"))).toBe(true);
  });
});
