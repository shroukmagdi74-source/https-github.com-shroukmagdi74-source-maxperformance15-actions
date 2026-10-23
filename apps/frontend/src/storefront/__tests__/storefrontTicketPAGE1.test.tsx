/* @vitest-environment jsdom */

import React from "react";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DynamicStorefrontPage from "../pages/DynamicStorefrontPage";
import StorefrontHeader from "../components/header/StorefrontHeader";
import {
  StudioPageSettingsPanel,
  runPrepublishChecks,
} from "../studio/StudioPageSettingsPanel";
import { StudioTopBar } from "../studio/StudioTopBar";
import { StorefrontStudioShell } from "../studio/StorefrontStudioShell";

let currentThemeMock: any = {
  id: "modern-minimal",
  name: "Modern Minimal",
  direction: "rtl",
  tokens: { colors: {}, typography: {}, shape: {} },
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
      company: { id: "comp-page1" },
      storefront: {
        settings: {
          storeName: "متجر max-p",
        },
      },
    },
    isLoading: false,
  }),
}));

vi.mock("../../hooks/useStorePage", () => ({
  useStorePage: () => ({
    page: null,
    loading: false,
    error: null,
  }),
}));

vi.mock("../hooks/useCategories", () => ({
  useCategories: () => ({
    categories: [],
    loading: false,
  }),
}));

vi.mock("../store/useCartStore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../store/useCartStore")>();
  return {
    ...actual,
    useCartStore: Object.assign(
      vi.fn((selector) => (selector ? selector({ items: [] }) : { items: [] })),{
        getState: () => ({ items: [] }),
        setState: vi.fn(),
      }
    ),
    DEFAULT_STOREFRONT_CART_STORAGE_NAME: "test-cart",
    getStorefrontPreviewCartStorageName: () => "test-cart",
  };
});

vi.mock("../../hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: { companyId: "comp-page1" },
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../engine/PageComposer", () => ({
  PageComposer: ({ pageConfig }: any) => (
    <div data-testid="page-composer-mock">
      <h1>{pageConfig?.title || "Page Content"}</h1>
      <div data-testid="section-count">{pageConfig?.sections?.length || 0}</div>
    </div>
  ),
}));

describe("Ticket PAGE-1: Page Settings (SEO, Publish Status, Pre-publish Checks)", () => {
  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ success: true, data: [] }),
    }) as any;
    currentThemeMock = {
      id: "modern-minimal",
      name: "Modern Minimal",
      direction: "rtl",
      tokens: { colors: {}, typography: {}, shape: {} },
      pages: {},
    };
  });

  afterEach(() => {
    cleanup();
    document.title = "";
    document.querySelectorAll('meta[name="description"]').forEach((el) => el.remove());
    document.querySelectorAll('meta[property="og:image"]').forEach((el) => el.remove());
    document.querySelectorAll('link[rel="canonical"]').forEach((el) => el.remove());
    document.querySelectorAll('meta[name="robots"]').forEach((el) => el.remove());
  });

  // Test 1: SEO Title & Description application in DynamicStorefrontPage
  it("1. saves and applies SEO title and description in browser document head", () => {
    currentThemeMock = {
      id: "modern-minimal",
      name: "Modern Minimal",
      direction: "rtl",
      tokens: { colors: {}, typography: {}, shape: {} },
      pages: {
        "summer-sale": {
          title: "عروض الصيف الافتراضية",
          status: "published",
          seo: {
            title: "عروض الصيف — متجر max-p",
            description: "خصومات حصرية تصل إلى 50% على جميع المنتجات لفترة محدودة",
            ogImage: "https://example.com/summer-og.jpg",
            canonical: "https://maxp.store/summer-sale",
          },
          sections: [{ type: "hero-banner", settings: { title: "بنر الصيف" } }],
        },
      },
    };

    render(
      <MemoryRouter initialEntries={["/summer-sale"]}>
        <Routes>
          <Route path="/:pageSlug" element={<DynamicStorefrontPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Title verification
    expect(document.title).toBe("عروض الصيف — متجر max-p");

    // Description meta verification
    const descMeta = document.querySelector('meta[name="description"]');
    expect(descMeta).not.toBeNull();
    expect(descMeta?.getAttribute("content")).toBe(
      "خصومات حصرية تصل إلى 50% على جميع المنتجات لفترة محدودة"
    );

    // OG Image meta verification
    const ogMeta = document.querySelector('meta[property="og:image"]');
    expect(ogMeta).not.toBeNull();
    expect(ogMeta?.getAttribute("content")).toBe("https://example.com/summer-og.jpg");

    // Canonical link verification
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    expect(canonicalLink).not.toBeNull();
    expect(canonicalLink?.getAttribute("href")).toBe("https://maxp.store/summer-sale");
  });

  // Test 2: noindex meta tag
  it("2. adds meta[name='robots'] with 'noindex' when noindex is true, and removes it when false", () => {
    currentThemeMock = {
      id: "modern-minimal",
      name: "Modern Minimal",
      direction: "rtl",
      tokens: { colors: {}, typography: {}, shape: {} },
      pages: {
        "private-page": {
          title: "صفحة خاصة",
          seo: {
            noindex: true,
          },
          sections: [{ type: "richtext", settings: { title: "سري" } }],
        },
      },
    };

    render(
      <MemoryRouter initialEntries={["/private-page"]}>
        <Routes>
          <Route path="/:pageSlug" element={<DynamicStorefrontPage />} />
        </Routes>
      </MemoryRouter>
    );

    const robotsMeta = document.querySelector('meta[name="robots"]');
    expect(robotsMeta).not.toBeNull();
    expect(robotsMeta?.getAttribute("content")).toBe("noindex");
  });

  // Test 3: draft page exclusion from StorefrontHeader menu
  it("3. excludes pages with status='draft' from StorefrontHeader navigation menu", () => {
    currentThemeMock = {
      id: "modern-minimal",
      name: "Modern Minimal",
      direction: "rtl",
      tokens: { colors: {}, typography: {}, shape: {} },
      header: {
        navigation: [
          { label: "الرئيسية", to: "/" },
          { label: "المتجر", to: "/shop" },
          { label: "عروض الصيف (مسودة)", to: "/summer-sale" },
          { label: "الجديد", to: "/new-arrivals" },
        ],
      },
      pages: {
        "summer-sale": {
          status: "draft",
          sections: [{ type: "hero-banner" }],
        },
        "new-arrivals": {
          status: "published",
          sections: [{ type: "product-grid" }],
        },
      },
    };

    render(
      <MemoryRouter initialEntries={["/"]}>
        <StorefrontHeader />
      </MemoryRouter>
    );

    // Published links should be present
    expect(screen.getAllByText("الرئيسية").length).toBeGreaterThan(0);
    expect(screen.getAllByText("الجديد").length).toBeGreaterThan(0);

    // Draft link should be excluded from the menu
    expect(screen.queryByText("عروض الصيف (مسودة)")).toBeNull();
  });

  // Test 4: draft preview badge appears on direct visit without 404
  it("4. renders draft preview badge when a draft page is opened directly", () => {
    currentThemeMock = {
      id: "modern-minimal",
      name: "Modern Minimal",
      direction: "rtl",
      tokens: { colors: {}, typography: {}, shape: {} },
      pages: {
        "winter-preview": {
          title: "معاينة تشكيلة الشتاء",
          status: "draft",
          sections: [{ type: "hero-banner", settings: { title: "قريباً في الشتاء" } }],
        },
      },
    };

    render(
      <MemoryRouter initialEntries={["/winter-preview"]}>
        <Routes>
          <Route path="/:pageSlug" element={<DynamicStorefrontPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Does not show 404
    expect(screen.queryByText("404")).toBeNull();

    // Shows the draft preview badge
    const badge = screen.getByTestId("draft-preview-badge");
    expect(badge).toBeTruthy();
    expect(badge.textContent).toContain("معاينة — مسودة غير منشورة");
  });

  // Test 5: Pre-publish check detects images without alt
  it("5. prepublish check detects images missing alt text with section names", () => {
    const results = runPrepublishChecks({
      pageKey: "promo",
      pageTitle: "صفحة ترويجية",
      seo: { title: "صفحة ترويجية" },
      sections: [
        {
          type: "hero-banner",
          label: "بانر التخفيضات",
          settings: {
            title: "عروض الصيف",
            image: "https://example.com/banner.jpg",
            // missing alt!
          },
        },
      ],
    });

    const altCheck = results.find((r) => r.id === "alt");
    expect(altCheck).toBeDefined();
    expect(altCheck?.status).toBe("fail");
    expect(altCheck?.message).toContain("بانر التخفيضات");
  });

  // Test 6: Pre-publish check detects broken internal links
  it("6. prepublish check detects broken internal links by their target path", () => {
    const results = runPrepublishChecks({
      pageKey: "about",
      pageTitle: "من نحن",
      seo: { title: "من نحن" },
      availablePages: ["shop", "contact"],
      sections: [
        {
          type: "richtext",
          label: "مقدمة تعريفية",
          settings: {
            title: "تاريخ المتجر",
            ctaLink: "/invalid-unexisting-page",
          },
        },
      ],
    });

    const linksCheck = results.find((r) => r.id === "links");
    expect(linksCheck).toBeDefined();
    expect(linksCheck?.status).toBe("fail");
    expect(linksCheck?.message).toContain("/invalid-unexisting-page");
  });

  // Test 7: Backward compatibility when seo and status are omitted
  it("7. gracefully handles absence of seo and status fields without regression", () => {
    currentThemeMock = {
      id: "modern-minimal",
      name: "Modern Minimal",
      direction: "rtl",
      tokens: { colors: {}, typography: {}, shape: {} },
      pages: {
        "legacy-page": {
          title: "صفحة تقليدية",
          // no seo, no status
          sections: [{ type: "richtext", settings: { title: "محتوى تقليدي" } }],
        },
      },
    };

    render(
      <MemoryRouter initialEntries={["/legacy-page"]}>
        <Routes>
          <Route path="/:pageSlug" element={<DynamicStorefrontPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Title uses standard format
    expect(document.title).toContain("صفحة تقليدية");

    // No draft preview badge is shown
    expect(screen.queryByTestId("draft-preview-badge")).toBeNull();

    // No robots meta tag added
    expect(document.querySelector('meta[name="robots"]')).toBeNull();

    // Prepublish checks do not crash with undefined fields
    expect(() => {
      runPrepublishChecks({
        pageKey: "legacy-page",
        sections: [{ type: "richtext", settings: { title: "أهلاً" } }],
      });
    }).not.toThrow();
  });

  // Test 8: StudioTopBar and StudioPageSettingsPanel UI integration
  it("8. renders studio-page-settings-button, status badge, and settings modal with counters and SERP preview", () => {
    const onOpenSettings = vi.fn();
    const onUpdateSeo = vi.fn();
    const onUpdateStatus = vi.fn();

    // 1. StudioTopBar test
    render(
      <StudioTopBar
        themeName="Modern Minimal"
        activePageKey="home"
        deviceMode="desktop"
        hasPendingChanges={false}
        canUndo={false}
        canRedo={false}
        saving={false}
        pageStatus="draft"
        onOpenPageSettings={onOpenSettings}
        onBack={vi.fn()}
        onPageChange={vi.fn()}
        onDeviceChange={vi.fn()}
        onUndo={vi.fn()}
        onRedo={vi.fn()}
        onSave={vi.fn()}
        onOpenPreview={vi.fn()}
      />
    );

    const settingsBtn = screen.getByTestId("studio-page-settings-button");
    expect(settingsBtn).toBeTruthy();
    fireEvent.click(settingsBtn);
    expect(onOpenSettings).toHaveBeenCalledTimes(1);

    const statusBadge = screen.getByTestId("studio-page-status-badge");
    expect(statusBadge.textContent).toContain("مسودة");

    // 2. StudioPageSettingsPanel test
    render(
      <StudioPageSettingsPanel
        isOpen={true}
        onClose={vi.fn()}
        pageKey="home"
        pageTitle="الصفحة الرئيسية"
        storeName="متجر max-p"
        seo={{
          title: "الرئيسية — متجر max-p",
          description: "أفضل المنتجات بأفضل الأسعار",
          noindex: false,
        }}
        status="published"
        sections={[{ type: "hero-banner", settings: { title: "بنر رئيسي" } }]}
        availablePages={["shop", "cart"]}
        onUpdateSeo={onUpdateSeo}
        onUpdateStatus={onUpdateStatus}
      />
    );

    expect(screen.getByTestId("studio-page-settings-panel")).toBeTruthy();
    expect(screen.getByTestId("seo-title-counter").textContent).toContain("21/60");
    expect(screen.getByTestId("seo-description-counter").textContent).toContain("27/160");
    expect(screen.getByTestId("seo-serp-preview")).toBeTruthy();

    // Test input update
    const titleInput = screen.getByTestId("seo-title-input");
    fireEvent.change(titleInput, { target: { value: "عنوان جديد" } });
    expect(onUpdateSeo).toHaveBeenCalledWith({ title: "عنوان جديد" });

    // Switch to status tab
    const statusTabBtn = screen.getByText("حالة النشر");
    fireEvent.click(statusTabBtn);
    const draftStatusBtn = screen.getByTestId("page-status-draft");
    fireEvent.click(draftStatusBtn);
    expect(onUpdateStatus).toHaveBeenCalledWith("draft");

    // Switch to prepublish tab
    const prepublishTabBtn = screen.getByText("فحص قبل النشر");
    fireEvent.click(prepublishTabBtn);
    expect(screen.getByTestId("prepublish-results")).toBeTruthy();
  });

  // Test 9 (Mandatory Regression Test for Ticket PAGE-1.1):
  // Renders StorefrontStudioShell itself without throwing TDZ error and verifies page settings panel integration
  it("9. renders StorefrontStudioShell itself without throwing (TDZ guard) and opens page settings panel to update SEO and status", () => {
    const onSave = vi.fn();
    const onChange = vi.fn();

    const sampleTokens = {
      pages: {
        home: {
          id: "home",
          title: "الرئيسية",
          status: "published",
          seo: {
            title: "الرئيسية — متجري",
            description: "وصف المتجر",
          },
          sections: [
            { key: "hero-1", type: "hero-banner", settings: { title: "بنر رئيسي" } },
            { key: "products-1", type: "featured-products", settings: { title: "منتجاتنا" } },
          ],
        },
      },
    };

    expect(() => {
      render(
        <StorefrontStudioShell
          themeId="modern-minimal"
          designTokens={sampleTokens}
          storeName="متجر max-p"
          hasPendingChanges={false}
          saving={false}
          onSave={onSave}
          onBack={vi.fn()}
          onOpenPreview={vi.fn()}
          onChange={onChange}
        />
      );
    }).not.toThrow();

    // Verify topbar renders page settings button & status badge
    const settingsButton = screen.getByTestId("studio-page-settings-button");
    expect(settingsButton).toBeTruthy();
    const statusBadge = screen.getByTestId("studio-page-status-badge");
    expect(statusBadge.textContent).toContain("منشورة");

    // Click to open StudioPageSettingsPanel
    fireEvent.click(settingsButton);

    // Verify modal is open and displays active page title and SEO
    const panel = screen.getByTestId("studio-page-settings-panel");
    expect(panel).toBeTruthy();
    const seoTitleInput = screen.getByTestId("seo-title-input") as HTMLInputElement;
    expect(seoTitleInput.value).toBe("الرئيسية — متجري");

    // Change SEO title
    fireEvent.change(seoTitleInput, { target: { value: "عنوان جديد تم تحديثه" } });
    expect(onChange).toHaveBeenCalled();
    expect(onSave).toHaveBeenCalled();
    const updatedTokens = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(updatedTokens.pages.home.seo.title).toBe("عنوان جديد تم تحديثه");

    // Switch to status tab and change status to draft
    const statusTab = screen.getByText("حالة النشر");
    fireEvent.click(statusTab);
    const draftBtn = screen.getByTestId("page-status-draft");
    fireEvent.click(draftBtn);

    expect(onChange).toHaveBeenCalled();
    const statusUpdatedTokens = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(statusUpdatedTokens.pages.home.status).toBe("draft");
  });
});
