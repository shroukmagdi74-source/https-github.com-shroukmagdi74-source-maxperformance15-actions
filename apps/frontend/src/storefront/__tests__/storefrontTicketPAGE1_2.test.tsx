/* @vitest-environment jsdom */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { StorefrontHead } from "../engine/StorefrontHead";
import StorefrontShell from "../StorefrontShell";
import DynamicStorefrontPage from "../pages/DynamicStorefrontPage";
import { StudioPageSettingsPanel } from "../studio/StudioPageSettingsPanel";
import { StorefrontStudioShell } from "../studio/StorefrontStudioShell";

let currentThemeMock: any = {
  id: "modern-minimal",
  name: "max-p",
  direction: "rtl",
  tokens: { colors: {}, typography: {}, shape: {} },
  header: { brandName: "max-p", navigation: [] },
  pages: {},
};

vi.mock("../engine/ThemeProvider", () => ({
  useStorefrontTheme: () => ({
    theme: currentThemeMock,
    setTheme: vi.fn(),
  }),
  StorefrontThemeProvider: ({ children }: any) => <>{children}</>,
}));

vi.mock("../hooks/useSearch", () => ({
  useSearch: () => ({
    query: "",
    results: [],
    loading: false,
    handleSearch: vi.fn(),
    setQuery: vi.fn(),
  }),
}));

vi.mock("../hooks/useStorefrontSettings", () => ({
  useStorefrontSettings: () => ({
    settings: {
      company: {
        id: "company-1",
        name: "max-p",
        logo: "https://example.com/logo.png",
      },
      storefront: {
        settings: {
          storeName: "max-p",
          description: "متجر max-p للتجارة الإلكترونية",
        },
      },
    },
    isLoading: false,
  }),
}));

vi.mock("../hooks/useStorefrontProducts", () => ({
  useStorefrontProducts: () => ({ products: [], loading: false }),
}));

vi.mock("../hooks/useStorefrontCategories", () => ({
  useStorefrontCategories: () => ({ categories: [], loading: false }),
}));

vi.mock("../hooks/useCategories", () => ({
  useCategories: () => ({
    categories: [],
    loading: false,
    error: null,
  }),
}));

vi.mock("../../hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: { id: "user-1", email: "test@maxp.online", companyId: "company-1" },
  }),
}));

describe("Ticket PAGE-1.2: Home Page SEO, Publish Status & Prepublish Checks", () => {
  let originalTitle: string;

  beforeEach(() => {
    originalTitle = document.title;
    document.title = "max-p";
    // Clear head tags
    document.querySelectorAll('meta[name="robots"], meta[name="description"], link[rel="canonical"], meta[property^="og:"], meta[name^="twitter:"]').forEach((el) => el.remove());
  });

  afterEach(() => {
    cleanup();
    document.title = originalTitle;
    document.querySelectorAll('meta[name="robots"], meta[name="description"], link[rel="canonical"], meta[property^="og:"], meta[name^="twitter:"]').forEach((el) => el.remove());
  });

  // Test 1: Home Page SEO applied (Title, Description, Robots)
  it("1. applies pages.home.seo (title, description, noindex) to document.title and meta tags on Home page", () => {
    currentThemeMock = {
      id: "modern-minimal",
      name: "max-p",
      direction: "rtl",
      tokens: { colors: {}, typography: {}, shape: {} },
      header: { brandName: "max-p", navigation: [] },
      pages: {
        home: {
          id: "home",
          title: "الرئيسية",
          status: "published",
          seo: {
            title: "عروض الصيف — متجر max-p",
            description: "أقوى وأفضل عروض وتخفيضات الصيف الحصرية في متجر max-p",
            noindex: true,
          },
          sections: [
            { key: "hero-1", type: "hero-banner", settings: { title: "أهلاً بكم في متجرنا" } },
          ],
        },
      },
    };

    render(
      <MemoryRouter initialEntries={["/"]}>
        <StorefrontHead />
      </MemoryRouter>
    );

    // 1. Title applied
    expect(document.title).toBe("عروض الصيف — متجر max-p");

    // 2. Meta description applied
    const descEl = document.querySelector('meta[name="description"]');
    expect(descEl).not.toBeNull();
    expect(descEl?.getAttribute("content")).toBe("أقوى وأفضل عروض وتخفيضات الصيف الحصرية في متجر max-p");

    // 3. Meta robots applied as "noindex, nofollow"
    const robotsEl = document.querySelector('meta[name="robots"]');
    expect(robotsEl).not.toBeNull();
    expect(robotsEl?.getAttribute("content")).toBe("noindex, nofollow");
  });

  // Test 2: Robots meta tag when noindex is false
  it("2. sets meta[name='robots'] to index, follow when seo.noindex is false", () => {
    currentThemeMock = {
      id: "modern-minimal",
      name: "max-p",
      direction: "rtl",
      tokens: { colors: {}, typography: {}, shape: {} },
      header: { brandName: "max-p", navigation: [] },
      pages: {
        home: {
          id: "home",
          title: "الرئيسية",
          status: "published",
          seo: {
            title: "الرئيسية | متجر max-p",
            noindex: false,
          },
          sections: [],
        },
      },
    };

    render(
      <MemoryRouter initialEntries={["/"]}>
        <StorefrontHead />
      </MemoryRouter>
    );

    const robotsEl = document.querySelector('meta[name="robots"]');
    expect(robotsEl).not.toBeNull();
    expect(robotsEl?.getAttribute("content")).toBe("index, follow, max-image-preview:large");
  });

  // Test 3: Canonical URL and OpenGraph tags
  it("3. applies canonical link and og:title, og:description, og:image for Home and custom pages", () => {
    currentThemeMock = {
      id: "modern-minimal",
      name: "max-p",
      direction: "rtl",
      tokens: { colors: {}, typography: {}, shape: {} },
      header: { brandName: "max-p", navigation: [] },
      pages: {
        home: {
          id: "home",
          title: "الرئيسية",
          seo: {
            title: "عروض خاصة — max-p",
            description: "وصف خاص للمشاركة",
            canonical: "https://maxp.online/summer-deals",
            ogImage: "https://maxp.online/images/og-summer.jpg",
          },
          sections: [],
        },
      },
    };

    render(
      <MemoryRouter initialEntries={["/"]}>
        <StorefrontHead />
      </MemoryRouter>
    );

    // Canonical link
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    expect(canonicalLink).not.toBeNull();
    expect(canonicalLink?.getAttribute("href")).toBe("https://maxp.online/summer-deals");

    // OG Tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    expect(ogTitle?.getAttribute("content")).toBe("عروض خاصة — max-p");

    const ogDesc = document.querySelector('meta[property="og:description"]');
    expect(ogDesc?.getAttribute("content")).toBe("وصف خاص للمشاركة");

    const ogImage = document.querySelector('meta[property="og:image"]');
    expect(ogImage?.getAttribute("content")).toBe("https://maxp.online/images/og-summer.jpg");

    // Twitter Card
    const twitterCard = document.querySelector('meta[name="twitter:card"]');
    expect(twitterCard?.getAttribute("content")).toBe("summary_large_image");
  });

  // Test 4: StudioPageSettingsPanel controls are always mounted in DOM
  it("4. renders page-status-draft, page-status-published, and run-prepublish-check-btn in DOM without clicking tabs", () => {
    const onUpdateStatus = vi.fn();
    const onUpdateSeo = vi.fn();

    render(
      <StudioPageSettingsPanel
        isOpen={true}
        onClose={vi.fn()}
        pageKey="home"
        pageTitle="الصفحة الرئيسية"
        storeName="max-p"
        seo={{
          title: "عروض الصيف — متجر max-p",
          description: "وصف الصفحة",
          noindex: true,
        }}
        status="published"
        sections={[{ type: "hero-banner", settings: { title: "بنر رئيسي" } }]}
        availablePages={["shop", "cart"]}
        onUpdateSeo={onUpdateSeo}
        onUpdateStatus={onUpdateStatus}
      />
    );

    // All controls MUST exist in DOM directly on initial open
    const draftStatusBtn = screen.getByTestId("page-status-draft");
    expect(draftStatusBtn).toBeTruthy();

    const publishedStatusBtn = screen.getByTestId("page-status-published");
    expect(publishedStatusBtn).toBeTruthy();

    const prepublishBtn = screen.getByTestId("run-prepublish-check-btn");
    expect(prepublishBtn).toBeTruthy();

    const prepublishResults = screen.getByTestId("prepublish-results");
    expect(prepublishResults).toBeTruthy();

    const seoTitleInput = screen.getByTestId("seo-title-input");
    expect(seoTitleInput).toBeTruthy();

    // Clicking draft updates status
    fireEvent.click(draftStatusBtn);
    expect(onUpdateStatus).toHaveBeenCalledWith("draft");
  });

  // Test 5: Draft status hides Home from Header menu AND renders draft-preview-badge on Home page
  it("5. excludes Home from navigation menu and renders draft-preview-badge when Home status is draft", () => {
    currentThemeMock = {
      id: "modern-minimal",
      name: "max-p",
      direction: "rtl",
      tokens: { colors: {}, typography: {}, shape: {} },
      header: {
        brandName: "max-p",
        navigation: [
          { label: "الرئيسية", to: "/" },
          { label: "المتجر", to: "/shop" },
        ],
      },
      pages: {
        home: {
          id: "home",
          title: "الرئيسية",
          status: "draft",
          sections: [
            { key: "sec-1", type: "hero-banner", settings: { title: "محتوى الصفحة الرئيسية" } },
          ],
        },
      },
    };

    render(
      <MemoryRouter initialEntries={["/"]}>
        <StorefrontShell />
      </MemoryRouter>
    );

    // 1. Draft preview badge MUST be visible on home page
    const draftBadge = screen.getByTestId("draft-preview-badge");
    expect(draftBadge).toBeTruthy();
    expect(draftBadge.textContent).toContain("معاينة — مسودة غير منشورة");

    // 2. Home link "/" must be filtered out of the header menu
    const navLinks = screen.queryAllByRole("link");
    const homeNavLink = navLinks.find(
      (link) => link.getAttribute("href") === "/" && link.textContent?.includes("الرئيسية")
    );
    expect(homeNavLink).toBeUndefined();
  });

  // Test 6: Prepublish Checks button and results inspection
  it("6. run-prepublish-check-btn is clickable and prepublish-results displays all quality checks", () => {
    render(
      <StudioPageSettingsPanel
        isOpen={true}
        onClose={vi.fn()}
        pageKey="home"
        pageTitle="الصفحة الرئيسية"
        storeName="max-p"
        seo={{ title: "عروض الصيف", description: "أفضل العروض" }}
        status="published"
        sections={[
          {
            type: "hero-banner",
            label: "بانر رئيسي",
            settings: { title: "عنوان البنر", image: "https://example.com/b.jpg" }, // missing alt
          },
        ]}
        availablePages={["shop"]}
        onUpdateSeo={vi.fn()}
        onUpdateStatus={vi.fn()}
      />
    );

    const recheckBtn = screen.getByTestId("run-prepublish-check-btn");
    expect(recheckBtn).toBeTruthy();
    fireEvent.click(recheckBtn);

    const resultsContainer = screen.getByTestId("prepublish-results");
    expect(resultsContainer).toBeTruthy();
    // Checks for alt text should be flagged
    expect(resultsContainer.textContent).toContain("النصوص البديلة للصور");
  });

  // Test 7: Unmount cleanup restores previous document.title and meta tags
  it("7. restores previous document.title and meta tags on unmount", () => {
    document.title = "المتجر الأصلي قبل التعديل";

    currentThemeMock = {
      id: "modern-minimal",
      name: "max-p",
      direction: "rtl",
      tokens: { colors: {}, typography: {}, shape: {} },
      header: { brandName: "max-p", navigation: [] },
      pages: {
        home: {
          id: "home",
          title: "الرئيسية",
          seo: {
            title: "عنوان مؤقت جديد",
            description: "وصف مؤقت",
            noindex: true,
          },
          sections: [],
        },
      },
    };

    const { unmount } = render(
      <MemoryRouter initialEntries={["/"]}>
        <StorefrontHead />
      </MemoryRouter>
    );

    // In mounted state
    expect(document.title).toBe("عنوان مؤقت جديد | max-p");
    expect(document.querySelector('meta[name="robots"]')?.getAttribute("content")).toBe("noindex, nofollow");

    // Unmount
    unmount();

    // After unmount: document.title MUST be restored
    expect(document.title).toBe("المتجر الأصلي قبل التعديل");
    // Robots tag that was added should be cleaned up
    const currentRobots = document.querySelector('meta[name="robots"]');
    expect(currentRobots?.getAttribute("content")).not.toBe("noindex, nofollow");
  });

  // Test 8: StorefrontStudioShell renders 8 sections without ErrorBoundary (TDZ guard)
  it("8. renders StorefrontStudioShell with 8 sections without ErrorBoundary and opens page settings", () => {
    const onSave = vi.fn();
    const onChange = vi.fn();

    const eightSectionTokens = {
      pages: {
        home: {
          id: "home",
          title: "الرئيسية",
          status: "published",
          seo: {
            title: "عروض الصيف — متجر max-p",
            description: "وصف المتجر",
            noindex: true,
          },
          sections: [
            { key: "sec-1", type: "hero-banner", settings: { title: "بنر 1" } },
            { key: "sec-2", type: "featured-products", settings: { title: "منتجات 2" } },
            { key: "sec-3", type: "category-grid", settings: { title: "تصنيفات 3" } },
            { key: "sec-4", type: "banner-strip", settings: { title: "شريط 4" } },
            { key: "sec-5", type: "testimonials", settings: { title: "آراء 5" } },
            { key: "sec-6", type: "newsletter", settings: { title: "نشرة 6" } },
            { key: "sec-7", type: "trust-badges", settings: { title: "ثقة 7" } },
            { key: "sec-8", type: "footer-promo", settings: { title: "عروض 8" } },
          ],
        },
      },
    };

    expect(() => {
      render(
        <StorefrontStudioShell
          themeId="modern-minimal"
          designTokens={eightSectionTokens}
          storeName="max-p"
          hasPendingChanges={false}
          saving={false}
          onSave={onSave}
          onBack={vi.fn()}
          onOpenPreview={vi.fn()}
          onChange={onChange}
        />
      );
    }).not.toThrow();

    // Verify settings button
    const settingsButton = screen.getByTestId("studio-page-settings-button");
    expect(settingsButton).toBeTruthy();

    // Click settings button to open panel
    fireEvent.click(settingsButton);

    // Verify panel opened and controls are in DOM
    expect(screen.getByTestId("studio-page-settings-panel")).toBeTruthy();
    expect(screen.getByTestId("page-status-draft")).toBeTruthy();
    expect(screen.getByTestId("run-prepublish-check-btn")).toBeTruthy();
    expect(screen.getByTestId("seo-title-input")).toBeTruthy();
  });
});
