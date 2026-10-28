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

/**
 * Marketplace catalog mirror — the 86 active apps in
 * apps/backend/catalog/marketplace/apps.json (verified count at APPS-3).
 * Kept inline so the storefront test stays self-contained.
 */
const CATALOG_APP_SLUGS: readonly string[] = [
  "orders-analytics",
  "instagram-business",
  "telegram-business",
  "tiktok-integrations",
  "facebook-ads-pro",
  "facebook-pages-connect",
  "facebook-pixel-capi",
  "facebook-catalog-shop",
  "whatsapp-business",
  "bot-automation",
  "analytics-basic",
  "ai-chat-basic",
  "store",
  "crm-lite",
  "conversion-suite",
  "quantity-offers-pro",
  "ugc-reviews-pro",
  "commerce-advanced",
  "procurement-pro",
  "affiliate-pro",
  "amazon-affiliate-pro",
  "blog-pro",
  "order-source-tracking",
  "campaign-attribution",
  "order-confirmation-distribution",
  "unified-inbox",
  "notification-automation",
  "booking-app",
  "medical-system",
  "lab-app",
  "radiology-app",
  "dental-lab-app",
  "dental-materials-pro",
  "academy-app",
  "inventory-pro",
  "order-shipping-turbo",
  "internal-courier-fleet",
  "order-invoicing",
  "wholesale-pro",
  "product-presentations",
  "cod-deposit",
  "agent-workspace",
  "order-preparation-hold",
  "pos-pro",
  "coupons-pro",
  "woocommerce-pro",
  "multi-warehouse-pro",
  "order-accounting-sources",
  "manual-orders-pro",
  "order-automation",
  "bulk-search",
  "customer-blocks",
  "bulk-orders",
  "quick-status",
  "status-summary",
  "returns-settings",
  "order-workflow",
  "facebook-post",
  "google-tag-manager",
  "broadcast-pro",
  "break-even",
  "product-break-even",
  "pricing-strategy",
  "profitability-engine",
  "campaign-calculator",
  "ad-budget-planner",
  "discount-impact",
  "shipping-optimizer",
  "monthly-pnl",
  "clv-calculator",
  "upsell-planner",
  "refund-rate",
  "executable-mindmap",
  "hr-core",
  "hr-attendance-pro",
  "hr-payroll",
  "hr-recruitment",
  "hr-assets",
  "marketing-agency-pro",
  "treasury-expenses-pro",
  "cafe-restaurant-pro",
  "accounting",
  "manufacturing",
  "returns-reasons-analytics",
  "profit-analytics",
  "campaign-attribution-analytics",
];

/** Slugs whose preset id does not follow the plain `app-<slug>` pattern. */
const CATALOG_ID_ALIASES: Record<string, string> = {
  "booking-app": "app-booking",
  "dental-lab-app": "app-dental-lab",
};

const presetIdForCatalogSlug = (slug: string): string =>
  CATALOG_ID_ALIASES[slug] ?? `app-${slug}`;

/** Industry presets from APPS-1 that are not marketplace catalog entries. */
const INDUSTRY_ONLY_PRESET_IDS: readonly string[] = [
  "app-courses",
  "app-restaurants",
  "app-clinics",
  "app-pharmacies",
  "app-real-estate",
  "app-contracting",
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

describe("APPS-3: App Section Presets Registry & Catalog Modal (103 apps, full catalog coverage)", () => {
  afterEach(() => {
    cleanup();
  });

  // 1. App count = exactly 103 (20 from APPS-1 + 40 from APPS-2 + 43 from APPS-3)
  it("registers exactly 103 industrial business applications", () => {
    expect(APP_SECTION_PRESETS).toHaveLength(103);

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
      // APPS-3: the 43 remaining apps from apps/backend/catalog/marketplace/apps.json
      "app-facebook-pages-connect",
      "app-facebook-pixel-capi",
      "app-facebook-catalog-shop",
      "app-facebook-post",
      "app-google-tag-manager",
      "app-woocommerce-pro",
      "app-analytics-basic",
      "app-status-summary",
      "app-returns-reasons-analytics",
      "app-campaign-attribution-analytics",
      "app-order-source-tracking",
      "app-commerce-advanced",
      "app-product-presentations",
      "app-coupons-pro",
      "app-amazon-affiliate-pro",
      "app-broadcast-pro",
      "app-break-even",
      "app-product-break-even",
      "app-pricing-strategy",
      "app-profitability-engine",
      "app-campaign-calculator",
      "app-ad-budget-planner",
      "app-discount-impact",
      "app-shipping-optimizer",
      "app-monthly-pnl",
      "app-clv-calculator",
      "app-upsell-planner",
      "app-refund-rate",
      "app-marketing-agency-pro",
      "app-cod-deposit",
      "app-agent-workspace",
      "app-order-preparation-hold",
      "app-order-accounting-sources",
      "app-manual-orders-pro",
      "app-bulk-search",
      "app-customer-blocks",
      "app-bulk-orders",
      "app-quick-status",
      "app-order-workflow",
      "app-dental-materials-pro",
      "app-hr-payroll",
      "app-hr-recruitment",
      "app-hr-assets",
    ];

    const actualAppIds = APP_SECTION_PRESETS.map((app) => app.appId);
    expect(actualAppIds).toEqual(expectedAppIds);
    expect(new Set(actualAppIds).size).toBe(103);

    // Each app has essential metadata
    APP_SECTION_PRESETS.forEach((app) => {
      expect(app.appName).toBeTruthy();
      expect(app.category).toBeTruthy();
      expect(app.description).toBeTruthy();
      expect(app.keywords.length).toBeGreaterThan(0);
    });
  });

  // 2. Every catalog app is covered exactly once — 86/86 at APPS-3 close
  it("covers every marketplace catalog app (86) with exactly one preset", () => {
    expect(CATALOG_APP_SLUGS).toHaveLength(86);
    expect(new Set(CATALOG_APP_SLUGS).size).toBe(86);

    const registryIds = new Set(APP_SECTION_PRESETS.map((app) => app.appId));
    const missing = CATALOG_APP_SLUGS.filter(
      (slug) => !registryIds.has(presetIdForCatalogSlug(slug))
    );
    expect(missing).toEqual([]);

    // The preset ids that map to catalog apps are distinct (no two slugs share a preset)
    const mappedIds = CATALOG_APP_SLUGS.map(presetIdForCatalogSlug);
    expect(new Set(mappedIds).size).toBe(86);

    // 103 registry entries = 86 catalog apps + 17 APPS-1 industry apps
    const industryOnly = APP_SECTION_PRESETS.map((app) => app.appId).filter(
      (id) => !mappedIds.includes(id)
    );
    expect(industryOnly.sort()).toEqual([...INDUSTRY_ONLY_PRESET_IDS].sort());
    expect(86 + INDUSTRY_ONLY_PRESET_IDS.length).toBe(103);
  });

  // 3. Each app has >= 3 sections
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

    expect(totalSections).toBe(309);
    expect(sectionIds.size).toBe(309);
  });

  // 4. Zero new components — all section types exist in STOREFRONT_SECTION_MANIFEST
  it("verifies zero new components: all preset sections use known storefront section types", () => {
    const allSections = getAllAppPresetSections();
    expect(allSections.length).toBe(309);

    allSections.forEach((section) => {
      const isKnown = isStorefrontSectionKnown(section.type);
      expect(isKnown).toBe(true);

      const manifest = getStorefrontSectionManifest(section.type);
      expect(manifest).toBeDefined();
    });
  });

  // 5. Negative test: Zero forbidden marketing text / promises
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

  // 6. StudioSectionCatalogModal: Tab "التطبيقات" and badge "متاح مع تطبيق X"
  it("renders Tab 'التطبيقات' in StudioSectionCatalogModal with app badges and 103 apps filter", () => {
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
    expect(appsTabBtn.textContent).toContain("103 تطبيق");

    // Click Tab "التطبيقات"
    fireEvent.click(appsTabBtn);

    // Sidebar should display "جميع التطبيقات" and apps
    expect(screen.getByTestId("app-filter-all")).toBeTruthy();
    expect(screen.getByTestId("app-filter-app-booking")).toBeTruthy();
    expect(screen.getByTestId("app-filter-app-clinics")).toBeTruthy();
    expect(screen.getByTestId("app-filter-app-courses")).toBeTruthy();
    // APPS-3 additions are reachable through the same filter list
    expect(screen.getByTestId("app-filter-app-hr-payroll")).toBeTruthy();
    expect(screen.getByTestId("app-filter-app-pricing-strategy")).toBeTruthy();

    // Badges must exist
    const badges = screen.getAllByTestId("app-preset-badge");
    expect(badges.length).toBeGreaterThan(0);
    expect(badges[0].textContent).toContain("متاح مع تطبيق");
  });

  // 7. Search «عيادة» returns clinics app sections
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

  // 8. Inserting an app section preset calls onAddSection with type and settings
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

  // 9. Helper lookup functions work accurately
  it("verifies getAppSectionPreset and searchAppSectionPresets helpers", () => {
    const clinicApp = getAppSectionPreset("app-clinics");
    expect(clinicApp).toBeDefined();
    expect(clinicApp?.appName).toBe("عيادات ومراكز طبية");
    expect(clinicApp?.sections.length).toBeGreaterThanOrEqual(3);

    const searchResults = searchAppSectionPresets("عقارات");
    expect(searchResults.length).toBeGreaterThanOrEqual(3);
    expect(searchResults.every((r) => r.appId === "app-real-estate" || r.appName.includes("عقارات"))).toBe(true);
  });

  // 10. APPS-2: three newly added apps are findable by Arabic search
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

  // 11. APPS-3: newly added apps are findable by Arabic search
  it("finds APPS-3 applications by Arabic search queries", () => {
    const payroll = searchAppSectionPresets("مسير الرواتب");
    expect(payroll.length).toBeGreaterThanOrEqual(3);
    expect(payroll.every((r) => r.appId === "app-hr-payroll")).toBe(true);

    const pricing = searchAppSectionPresets("استراتيجية التسعير");
    expect(pricing.length).toBeGreaterThanOrEqual(3);
    expect(pricing.every((r) => r.appId === "app-pricing-strategy")).toBe(true);

    const woocommerce = searchAppSectionPresets("وكومرس");
    expect(woocommerce.length).toBeGreaterThanOrEqual(3);
    expect(woocommerce.every((r) => r.appId === "app-woocommerce-pro")).toBe(true);
  });
});
