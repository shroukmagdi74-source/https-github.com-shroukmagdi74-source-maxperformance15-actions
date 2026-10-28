// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, renderHook, act } from "@testing-library/react";
import {
  exportPage,
  exportPageAsJSON,
  importPage,
  validatePageJSON,
  computePageDiff,
  downloadJSON,
  STUDIO_PAGE_EXPORT_VERSION,
  type StudioExportedPageData,
} from "../studio/utils/studioPageExportImport";
import {
  themeBuilder,
  archiveTemplate,
  singleTemplate,
  resolveThemeBuilderTemplate,
  type ThemeBuilderTemplate,
} from "../studio/utils/themeBuilder";
import { useStorefrontStudioState } from "../studio/hooks/useStorefrontStudioState";
import { StudioTopBar } from "../studio/StudioTopBar";
import { StudioExportImportModal } from "../studio/StudioExportImportModal";
import type { PageStyleScope } from "../studio/StudioTypes";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock useCartStore to prevent jsdom localStorage uninitialized setItem warnings
vi.mock("../store/useCartStore", async (importOriginal) => {
  const actual = await importOriginal<any>();
  const mockCartState = { items: [], isOpen: false };
  const fn: any = vi.fn((selector) =>
    selector ? selector(mockCartState) : mockCartState
  );
  fn.getState = vi.fn(() => mockCartState);
  fn.setState = vi.fn();
  return {
    ...actual,
    useCartStore: fn,
    DEFAULT_STOREFRONT_CART_STORAGE_NAME: "test-cart",
  };
});

describe("Ticket TPL-2: Page Export/Import, Pre-Publish Snapshot, and Theme Builder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // ─────────────────────────────────────────────────────────────
  // 1. Export Page
  // ─────────────────────────────────────────────────────────────
  it("1. exportPage generates structured JSON with version, page, sections, and styles", () => {
    const mockSections = [
      { id: "s-1", type: "hero-banner", title: "بانر رئيسي" },
      { id: "s-2", type: "featured-products", count: 8 },
    ];
    const mockStyles: PageStyleScope = {
      preset: "editorial",
      accent: "#8B5E3C",
      density: "airy",
      radius: 6,
    };

    const exported = exportPage("home", {
      sections: mockSections,
      styles: mockStyles,
    });

    expect(exported.version).toBe(STUDIO_PAGE_EXPORT_VERSION);
    expect(exported.page).toBe("home");
    expect(exported.sections).toEqual(mockSections);
    expect(exported.styles).toEqual(mockStyles);
    expect(exported.metadata?.sectionsCount).toBe(2);

    const jsonStr = exportPageAsJSON("home", {
      sections: mockSections,
      styles: mockStyles,
    });
    expect(typeof jsonStr).toBe("string");
    const parsed = JSON.parse(jsonStr);
    expect(parsed.version).toBe("1.0");
    expect(parsed.sections).toHaveLength(2);
  });

  // ─────────────────────────────────────────────────────────────
  // 2. Round-trip: 4 sections -> export -> clear -> import = identical
  // ─────────────────────────────────────────────────────────────
  it("2. Round-trip: page with 4 sections -> export -> clear page -> import = identical 4 sections and style (deep-equal assert)", () => {
    const original4Sections = [
      { id: "sec-1", type: "hero-banner", settings: { title: "مرحباً بكم" } },
      { id: "sec-2", type: "category-strip", settings: { limit: 6 } },
      { id: "sec-3", type: "featured-products", settings: { layout: "grid" } },
      { id: "sec-4", type: "newsletter", settings: { placeholder: "بريدك الإلكتروني" } },
    ];

    const originalStyle: PageStyleScope = {
      preset: "minimal",
      accent: "#2563EB",
      density: "compact",
      radius: 8,
    };

    // Step A: Export
    const exportedData = exportPage("home", {
      sections: original4Sections,
      styles: originalStyle,
    });

    // Step B: Clear page
    let activePageSections = [];
    let activePageStyle: PageStyleScope | undefined = undefined;

    // Verify page is empty
    expect(activePageSections).toHaveLength(0);
    expect(activePageStyle).toBeUndefined();

    // Step C: Import with confirmation
    const importResult = importPage(exportedData, {
      pageKey: "home",
      currentSections: activePageSections,
      currentStyles: activePageStyle,
      confirm: true,
      onApply: (imported) => {
        activePageSections = imported.sections;
        activePageStyle = imported.styles;
      },
    });

    expect(importResult.success).toBe(true);
    expect(importResult.applied).toBe(true);

    // Deep-equal assertion: Exactly identical 4 sections and same style
    expect(activePageSections).toEqual(original4Sections);
    expect(activePageSections).toHaveLength(4);
    expect(activePageStyle).toEqual(originalStyle);
  });

  // ─────────────────────────────────────────────────────────────
  // 3. Negative Test: version "unknown" rejected + page unchanged
  // ─────────────────────────────────────────────────────────────
  it("3. Negative Test: JSON with version: 'unknown' is rejected with clear message + page remains unchanged", () => {
    const initialSections = [
      { id: "orig-1", type: "hero-banner" },
      { id: "orig-2", type: "featured-products" },
    ];
    let pageSections = [...initialSections];

    const invalidVersionPayload = {
      version: "unknown",
      page: "home",
      sections: [{ id: "bad-1", type: "promo-strip" }],
    };

    const res = importPage(invalidVersionPayload, {
      pageKey: "home",
      currentSections: pageSections,
      confirm: true,
      onApply: (data) => {
        pageSections = data.sections;
      },
    });

    // Rejection assertions
    expect(res.success).toBe(false);
    expect(res.applied).toBe(false);
    expect(res.error).toBeDefined();
    expect(res.error).toContain('إصدار القالب غير مدعوم: "unknown"');

    // Page must remain completely unchanged
    expect(pageSections).toEqual(initialSections);
    expect(pageSections).toHaveLength(2);
  });

  // ─────────────────────────────────────────────────────────────
  // 4. Schema Validation (missing sections, malformed string, null)
  // ─────────────────────────────────────────────────────────────
  it("4. Schema Validation: rejects malformed JSON or payloads missing sections array", () => {
    // Missing sections array
    const missingSections = { version: "1.0", page: "home" };
    const val1 = validatePageJSON(missingSections);
    expect(val1.isValid).toBe(false);
    expect(val1.error).toContain("sections");

    // Invalid JSON string
    const val2 = validatePageJSON("{ not valid json");
    expect(val2.isValid).toBe(false);
    expect(val2.error).toContain("صيغة JSON غير صالحة");

    // Null or undefined
    const val3 = validatePageJSON(null);
    expect(val3.isValid).toBe(false);
  });

  // ─────────────────────────────────────────────────────────────
  // 5. Diff preview computation
  // ─────────────────────────────────────────────────────────────
  it("5. computePageDiff accurately calculates differences between current and imported sections", () => {
    const currentSections = [{ id: "c-1" }, { id: "c-2" }];
    const importedData: StudioExportedPageData = {
      version: "1.0",
      page: "home",
      sections: [{ id: "i-1" }, { id: "i-2" }, { id: "i-3" }, { id: "i-4" }],
      styles: { preset: "loud", accent: "#EF4444" },
    };

    const diff = computePageDiff(currentSections, undefined, importedData);
    expect(diff.currentSectionsCount).toBe(2);
    expect(diff.incomingSectionsCount).toBe(4);
    expect(diff.sectionsAdded).toBe(2);
    expect(diff.stylesChanged).toBe(true);
    expect(diff.summaryText).toContain("سيتم استبدال 2 قسم حالي بـ 4 قسم مستورد");
  });

  // ─────────────────────────────────────────────────────────────
  // 6. Pre-publish snapshot & rollback safety net
  // ─────────────────────────────────────────────────────────────
  it("6. Pre-Publish Snapshot: publishing creates 'pre-publish' snapshot BEFORE change + restore reverts state", () => {
    let savedTokens: Record<string, any> = {
      pages: {
        home: {
          sections: [{ id: "v1-sec-1", type: "hero-banner" }],
        },
      },
    };

    const onSaveMock = vi.fn();
    const onChangeMock = vi.fn((next) => {
      savedTokens = next;
    });

    const { result } = renderHook(() =>
      useStorefrontStudioState({
        themeId: "modern-minimal",
        externalDesignTokens: savedTokens,
        onChange: onChangeMock,
        onSave: onSaveMock,
      })
    );

    // Initial state check
    expect(result.current.activeSections).toHaveLength(1);

    // Action: Publish (calls handlePublish)
    act(() => {
      void result.current.handlePublish();
    });

    // Assert: Snapshot named "pre-publish" exists
    const snapshots = savedTokens.snapshots as any[];
    expect(snapshots).toBeDefined();
    expect(snapshots.length).toBeGreaterThanOrEqual(1);
    expect(snapshots[0].name).toBe("pre-publish");
    expect(snapshots[0].snapshot).toBeDefined();

    // Assert: Toast notification emitted with exact text
    expect(toast.success).toHaveBeenCalledWith(
      "تم حفظ نسخة — استرجاع",
      expect.objectContaining({
        action: expect.objectContaining({
          label: "استرجاع",
        }),
      })
    );

    // Now mutate state (simulate changes made after publish)
    act(() => {
      result.current.handleDesignTokensChange({
        ...savedTokens,
        pages: {
          home: {
            sections: [
              { id: "v2-sec-1", type: "hero-banner" },
              { id: "v2-sec-2", type: "product-grid" },
            ],
          },
        },
      });
    });

    expect(savedTokens.pages.home.sections).toHaveLength(2);

    // Action: Restore previous pre-publish snapshot
    act(() => {
      result.current.handleRestorePrePublishSnapshot();
    });

    // Assert: Restored state matches the original pre-publish condition
    expect(savedTokens.pages.home.sections).toHaveLength(1);
    expect(savedTokens.pages.home.sections[0].id).toBe("v1-sec-1");
  });

  // ─────────────────────────────────────────────────────────────
  // 7. Theme Builder: Single template for group X vs outside fallback
  // ─────────────────────────────────────────────────────────────
  it("7. Theme Builder: single template bound to group X -> product from X uses it, product outside falls back to default", () => {
    const defaultPdpSections = [{ type: "product-info-default" }];
    const groupXCustomSections = [{ type: "custom-fashion-showcase" }, { type: "size-guide" }];

    const templates: ThemeBuilderTemplate[] = [
      singleTemplate({
        id: "tpl-group-x",
        name: "قالب أزياء رجالي",
        target: "product",
        conditions: {
          applyTo: "group",
          groupId: "group-x",
        },
        page: {
          sections: groupXCustomSections,
        },
      }),
    ];

    // Product 1: from group X
    const productInGroupX = {
      id: "prod-1",
      name: "قميص كتان",
      groupId: "group-x",
      categoryId: "group-x",
    };

    const resolvedForX = resolveThemeBuilderTemplate({
      templates,
      type: "single",
      target: "product",
      entity: productInGroupX,
    });

    expect(resolvedForX).not.toBeNull();
    expect(resolvedForX?.name).toBe("قالب أزياء رجالي");
    expect(resolvedForX?.page.sections).toEqual(groupXCustomSections);

    // Product 2: outside group X (e.g. electronics group-y)
    const productOutsideX = {
      id: "prod-2",
      name: "سماعة لاسلكية",
      groupId: "group-y",
      categoryId: "group-y",
    };

    const resolvedOutside = resolveThemeBuilderTemplate({
      templates,
      type: "single",
      target: "product",
      entity: productOutsideX,
    });

    // Assert fallback to default (null returned by resolver)
    expect(resolvedOutside).toBeNull();
    const effectiveSections = resolvedOutside?.page?.sections || defaultPdpSections;
    expect(effectiveSections).toEqual(defaultPdpSections);
  });

  // ─────────────────────────────────────────────────────────────
  // 8. Theme Builder: Archive template for catalog / products
  // ─────────────────────────────────────────────────────────────
  it("8. Theme Builder: archive template for all products applies, and falls back to default when empty", () => {
    const customArchiveSections = [{ type: "custom-catalog-hero" }, { type: "bento-grid" }];

    const archiveTpl = archiveTemplate({
      id: "archive-all",
      name: "قالب الكتالوج العام",
      target: "products",
      conditions: { applyTo: "all" },
      page: {
        sections: customArchiveSections,
      },
    });

    const templates: ThemeBuilderTemplate[] = [archiveTpl];

    const resolved = resolveThemeBuilderTemplate({
      templates,
      type: "archive",
      target: "products",
      entity: null,
    });

    expect(resolved).not.toBeNull();
    expect(resolved?.name).toBe("قالب الكتالوج العام");
    expect(resolved?.page.sections).toEqual(customArchiveSections);

    // Fallback test: no matching archive template
    const fallbackRes = resolveThemeBuilderTemplate({
      templates: [],
      type: "archive",
      target: "products",
      entity: null,
    });

    expect(fallbackRes).toBeNull();
  });

  // ─────────────────────────────────────────────────────────────
  // 9. Theme Builder: Single article template matching article post
  // ─────────────────────────────────────────────────────────────
  it("9. Theme Builder: single template for article matches blog post", () => {
    const articleSections = [{ type: "article-header" }, { type: "rich-content" }];

    const articleTpl = singleTemplate({
      id: "tpl-article",
      name: "قالب المقالات التحريرية",
      target: "article",
      conditions: { applyTo: "all" },
      page: {
        sections: articleSections,
      },
    });

    const resolved = resolveThemeBuilderTemplate({
      templates: [articleTpl],
      type: "single",
      target: "article",
      entity: { slug: "summer-styling-tips" },
    });

    expect(resolved).not.toBeNull();
    expect(resolved?.target).toBe("article");
    expect(resolved?.page.sections).toEqual(articleSections);
  });

  // ─────────────────────────────────────────────────────────────
  // 10. downloadJSON helper
  // ─────────────────────────────────────────────────────────────
  it("10. downloadJSON creates download link with correct filename and cleans up", () => {
    const createElementSpy = vi.spyOn(document, "createElement");
    const appendChildSpy = vi.spyOn(document.body, "appendChild");
    const removeChildSpy = vi.spyOn(document.body, "removeChild");
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    // Mock URL.createObjectURL and revokeObjectURL
    const originalCreate = window.URL.createObjectURL;
    const originalRevoke = window.URL.revokeObjectURL;
    window.URL.createObjectURL = vi.fn(() => "blob:mock-url");
    window.URL.revokeObjectURL = vi.fn();

    downloadJSON("test-page", { version: "1.0", page: "home" });

    expect(createElementSpy).toHaveBeenCalledWith("a");
    expect(appendChildSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");

    clickSpy.mockRestore();
    window.URL.createObjectURL = originalCreate;
    window.URL.revokeObjectURL = originalRevoke;
  });

  // ─────────────────────────────────────────────────────────────
  // 11. StudioTopBar Publish Button with pre-publish hook
  // ─────────────────────────────────────────────────────────────
  it("11. StudioTopBar Publish button invokes onPublish handler", () => {
    const onPublishMock = vi.fn();
    const onSaveMock = vi.fn();

    render(
      <StudioTopBar
        activePageKey="home"
        deviceMode="desktop"
        hasPendingChanges={true}
        canUndo={false}
        canRedo={false}
        saving={false}
        onBack={vi.fn()}
        onPageChange={vi.fn()}
        onDeviceChange={vi.fn()}
        onUndo={vi.fn()}
        onRedo={vi.fn()}
        onSave={onSaveMock}
        onPublish={onPublishMock}
        onOpenPreview={vi.fn()}
      />
    );

    const publishBtn = screen.getByTestId("studio-publish-button");
    expect(publishBtn).toBeDefined();

    fireEvent.click(publishBtn);
    expect(onPublishMock).toHaveBeenCalledTimes(1);
    expect(onSaveMock).not.toHaveBeenCalled();
  });

  // ─────────────────────────────────────────────────────────────
  // 12. StudioExportImportModal UI interactions
  // ─────────────────────────────────────────────────────────────
  it("12. StudioExportImportModal renders tabs, shows export code, and rejects unknown version in UI", () => {
    const onApplyMock = vi.fn();
    const onCloseMock = vi.fn();

    render(
      <StudioExportImportModal
        isOpen={true}
        onClose={onCloseMock}
        activePageKey="home"
        currentSections={[{ type: "hero-banner" }]}
        onApplyImport={onApplyMock}
      />
    );

    // Initial tab is export
    expect(screen.getByTestId("exported-json-preview")).toBeDefined();
    expect(screen.getByTestId("download-export-json-btn")).toBeDefined();

    // Switch to import tab
    const importTab = screen.getByTestId("tab-import-page");
    fireEvent.click(importTab);

    // Paste invalid version JSON
    const textarea = screen.getByTestId("import-json-textarea");
    fireEvent.change(textarea, {
      target: { value: JSON.stringify({ version: "unknown", sections: [] }) },
    });

    // Error banner must show
    expect(screen.getByTestId("import-error-banner")).toBeDefined();
    expect(screen.getByText(/إصدار القالب غير مدعوم/)).toBeDefined();

    // Confirm button must be disabled
    const confirmBtn = screen.getByTestId("confirm-import-btn");
    expect(confirmBtn.hasAttribute("disabled")).toBe(true);
    expect(onApplyMock).not.toHaveBeenCalled();
  });
});
