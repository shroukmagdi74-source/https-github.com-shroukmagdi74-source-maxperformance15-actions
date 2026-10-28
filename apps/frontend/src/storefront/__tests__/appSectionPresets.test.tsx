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

describe("APPS-2: App Section Presets Registry & Catalog Modal (60 apps)", () => {
  afterEach(() => {
    cleanup();
  });

  // 1. App count = exactly 60 (20 from APPS-1 + 40 from catalog for APPS-2)
  it("registers exactly 60 industrial business applications", () => {
    expect(APP_SECTION_PRESETS).toHaveLength(60);

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
      // APPS-2: 40 apps taken from apps/backend/catalog/marketplace/apps.json
      "app-orders-analytics",
      "app-profit-analytics",
      "app-whatsapp-business",
      "app-instagram-business",
      "app-telegram-business",
      "app-tiktok-integrations",
      "app-bot-automation",
      "app-facebook-ads-pro",
      "app-ugc-reviews-pro",
      "app-affiliate-pro",
      "app-blog-pro",
      "app-campaign-attribution",
      "app-ai-chat-basic",
      "app-store",
      "app-conversion-suite",
      "app-quantity-offers-pro",
      "app-pos-pro",
      "app-crm-lite",
      "app-procurement-pro",
      "app-order-confirmation-distribution",
      "app-cafe-restaurant-pro",
      "app-order-automation",
      "app-returns-settings",
      "app-unified-inbox",
      "app-notification-automation",
      "app-academy-app",
      "app-medical-system",
      "app-lab-app",
      "app-radiology-app",
      "app-inventory-pro",
      "app-multi-warehouse-pro",
      "app-order-shipping-turbo",
      "app-internal-courier-fleet",
      "app-order-invoicing",
      "app-accounting",
      "app-wholesale-pro",
      "app-treasury-expenses-pro",
      "app-hr-core",
      "app-hr-attendance-pro",
      "app-executable-mindmap",
    ];

    const actualAppIds = APP_SECTION_PRESETS.map((app) => app.appId);
    expect(actualAppIds).toEqual(expectedAppIds);
    expect(new Set(actualAppIds).size).toBe(60);

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
    const sectionIds = new Set<string>();

    APP_SECTION_PRESETS.forEach((app) => {
      expect(app.sections.length).toBeGreaterThanOrEqual(3);
      totalSections += app.sections.length;

      app.sections.forEach((section) => {
        expect(section.id).toBeTruthy();
        expect(section.type).toBeTruthy();
        expect(section.label).toBeTruthy();
        expect(section.description).toBeTruthy();
        expect(section.badge).toBe(`متاح مع تطبيق ${app.appName}`);
        expect(section.settings).toBeDefined();
        expect(typeof section.settings).toBe("object");

        // Section ids must be unique across the whole registry
        expect(sectionIds.has(section.id)).toBe(false);
        sectionIds.add(section.id);
      });
    });

    expect(totalSections).toBe(180);
    expect(sectionIds.size).toBe(180);
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
  it("renders Tab 'التطبيقات' in StudioSectionCatalogModal with app badges and 60 apps filter", () => {
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
    expect(appsTabBtn.textContent).toContain("60 تطبيق");

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

  // 9. APPS-2: three newly added apps are findable by Arabic search
  it("finds APPS-2 applications by Arabic search queries", () => {
    const attendance = searchAppSectionPresets("الحضور والانصراف");
    expect(attendance.length).toBeGreaterThanOrEqual(3);
    expect(attendance.every((r) => r.appId === "app-hr-attendance-pro")).toBe(true);

    const treasury = searchAppSectionPresets("الخزينة والنفقات");
    expect(treasury.length).toBeGreaterThanOrEqual(3);
    expect(treasury.every((r) => r.appId === "app-treasury-expenses-pro")).toBe(true);

    const mindmap = searchAppSectionPresets("الخرائط الذهنية");
    expect(mindmap.length).toBeGreaterThanOrEqual(3);
    expect(mindmap.every((r) => r.appId === "app-executable-mindmap")).toBe(true);
  });
});
