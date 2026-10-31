// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup, renderHook, act } from "@testing-library/react";

import {
  STUDIO_PAGE_PRESETS,
} from "../studio/StudioPagePresets";
import {
  createTemplateSections,
} from "../studio/utils/studioPageTemplates";
import { StudioPageSelector } from "../studio/StudioPageSelector";
import { StudioPagesPanel } from "../studio/StudioPagesPanel";
import { StudioCreatePageModal } from "../studio/StudioCreatePageModal";
import { STUDIO_PAGES } from "../studio/StudioTypes";
import { useStorefrontStudioState } from "../studio/hooks/useStorefrontStudioState";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock("../hooks/useStorefrontSettings", () => ({
  useStorefrontSettings: () => ({
    settings: {
      company: { id: "comp-1" },
      storefront: { settings: { storeName: "متجر التجربة" } },
    },
    isLoading: false,
  }),
}));

describe("Ticket MANAGE-PAGES: Store Pages Management & Template Confirmation", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const customPages = [
    { id: "our-story", label: "قصتنا ورؤيتنا", icon: "📄", description: "/our-story" },
    { id: "customer-care", label: "العناية بالعملاء", icon: "📄", description: "/customer-care" },
  ];

  // ─────────────────────────────────────────────────────────────
  // 1. Custom Page Deletion with Name Confirmation
  // ─────────────────────────────────────────────────────────────
  describe("1. Page Deletion and Confirmation Flow", () => {
    it("renders delete button on custom pages and shows confirmation prompt with page name", () => {
      render(
        <StudioPageSelector
          activePageKey="home"
          onPageChange={vi.fn()}
          customPages={customPages}
          onDeletePage={vi.fn()}
        />
      );

      // Open dropdown
      fireEvent.click(screen.getByRole("button", { name: /تعديل الصفحة/ }));

      // Find delete button for our-story
      const deleteBtn = screen.getByTestId("delete-page-our-story");
      expect(deleteBtn).toBeDefined();

      // Click delete button -> confirmation prompt must appear with page name
      fireEvent.click(deleteBtn);
      expect(screen.getByText(/هل أنت متأكد من حذف صفحة «قصتنا ورؤيتنا»؟/)).toBeDefined();
      expect(screen.getByTestId("confirm-delete-our-story")).toBeDefined();
      expect(screen.getByTestId("cancel-delete-our-story")).toBeDefined();
    });

    it("cancels deletion when clicking cancel button", () => {
      const onDelete = vi.fn();
      render(
        <StudioPageSelector
          activePageKey="home"
          onPageChange={vi.fn()}
          customPages={customPages}
          onDeletePage={onDelete}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: /تعديل الصفحة/ }));
      fireEvent.click(screen.getByTestId("delete-page-our-story"));

      // Click cancel
      fireEvent.click(screen.getByTestId("cancel-delete-our-story"));
      expect(onDelete).not.toHaveBeenCalled();
      expect(screen.queryByText(/هل أنت متأكد من حذف صفحة/)).toBeNull();
    });

    it("executes onDeletePage when deletion is confirmed", () => {
      const onDelete = vi.fn();
      render(
        <StudioPageSelector
          activePageKey="home"
          onPageChange={vi.fn()}
          customPages={customPages}
          onDeletePage={onDelete}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: /تعديل الصفحة/ }));
      fireEvent.click(screen.getByTestId("delete-page-our-story"));
      fireEvent.click(screen.getByTestId("confirm-delete-our-story"));

      expect(onDelete).toHaveBeenCalledWith("our-story");
    });

    it("strictly prevents deleting standard theme pages and never renders delete button for them", () => {
      render(
        <StudioPageSelector
          activePageKey="home"
          onPageChange={vi.fn()}
          customPages={customPages}
          onDeletePage={vi.fn()}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: /تعديل الصفحة/ }));

      // Standard pages must have duplicate button, but ZERO delete buttons
      STUDIO_PAGES.forEach((std) => {
        expect(screen.queryByTestId(`delete-page-${std.id}`)).toBeNull();
        expect(screen.getByTestId(`duplicate-page-${std.id}`)).toBeDefined();
      });
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. Renaming Title & Modifying Slug with Uniqueness Guard
  // ─────────────────────────────────────────────────────────────
  describe("2. Page Renaming & Slug Editing", () => {
    it("opens rename form with title and slug prefilled and saves new title", () => {
      const onRename = vi.fn();
      render(
        <StudioPageSelector
          activePageKey="home"
          onPageChange={vi.fn()}
          customPages={customPages}
          onRenamePage={onRename}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: /تعديل الصفحة/ }));
      fireEvent.click(screen.getByTestId("rename-page-our-story"));

      const titleInput = screen.getByTestId("rename-title-input-our-story");
      const slugInput = screen.getByTestId("rename-slug-input-our-story");

      expect((titleInput as HTMLInputElement).value).toBe("قصتنا ورؤيتنا");
      expect((slugInput as HTMLInputElement).value).toBe("our-story");

      // Change title only
      fireEvent.change(titleInput, { target: { value: "من نحن بالتفصيل" } });
      fireEvent.click(screen.getByTestId("rename-save-our-story"));

      expect(onRename).toHaveBeenCalledWith("our-story", "من نحن بالتفصيل", "our-story");
    });

    it("modifies slug with Latin normalization when saved", () => {
      const onRename = vi.fn();
      render(
        <StudioPageSelector
          activePageKey="home"
          onPageChange={vi.fn()}
          customPages={customPages}
          onRenamePage={onRename}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: /تعديل الصفحة/ }));
      fireEvent.click(screen.getByTestId("rename-page-our-story"));

      const slugInput = screen.getByTestId("rename-slug-input-our-story");
      fireEvent.change(slugInput, { target: { value: "brand-story-2026" } });
      fireEvent.click(screen.getByTestId("rename-save-our-story"));

      expect(onRename).toHaveBeenCalledWith("our-story", "قصتنا ورؤيتنا", "brand-story-2026");
    });

    it("rejects duplicate slug when colliding with standard page or other custom page", async () => {
      const onRename = vi.fn();
      render(
        <StudioPageSelector
          activePageKey="home"
          onPageChange={vi.fn()}
          customPages={customPages}
          onRenamePage={onRename}
          existingSlugs={["home", "shop", "our-story", "customer-care"]}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: /تعديل الصفحة/ }));
      fireEvent.click(screen.getByTestId("rename-page-our-story"));

      const slugInput = screen.getByTestId("rename-slug-input-our-story");
      const saveBtn = screen.getByTestId("rename-save-our-story");

      // Collide with standard page "home"
      fireEvent.change(slugInput, { target: { value: "home" } });
      expect(screen.getByText(/مستخدم بالفعل/)).toBeDefined();
      expect(saveBtn).toHaveProperty("disabled", true);

      // Collide with another custom page "customer-care"
      fireEvent.change(slugInput, { target: { value: "customer-care" } });
      expect(screen.getByText(/مستخدم بالفعل/)).toBeDefined();
      expect(saveBtn).toHaveProperty("disabled", true);

      // Keep same slug "our-story" -> valid!
      fireEvent.change(slugInput, { target: { value: "our-story" } });
      expect(screen.queryByText(/مستخدم بالفعل/)).toBeNull();
      expect(saveBtn).toHaveProperty("disabled", false);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. Duplication Button & Slug Generation
  // ─────────────────────────────────────────────────────────────
  describe("3. Page Duplication", () => {
    it("triggers onDuplicatePage when duplicate button is clicked for standard and custom pages", () => {
      const onDuplicate = vi.fn();
      render(
        <StudioPageSelector
          activePageKey="home"
          onPageChange={vi.fn()}
          customPages={customPages}
          onDuplicatePage={onDuplicate}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: /تعديل الصفحة/ }));

      // Duplicate standard page
      fireEvent.click(screen.getByTestId("duplicate-page-home"));
      expect(onDuplicate).toHaveBeenCalledWith("home");

      // Duplicate custom page
      fireEvent.click(screen.getByTestId("duplicate-page-our-story"));
      expect(onDuplicate).toHaveBeenCalledWith("our-story");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 4. StudioPagesPanel Integration
  // ─────────────────────────────────────────────────────────────
  describe("4. StudioPagesPanel Actions & Renaming with Slug", () => {
    it("supports renaming title and slug in StudioPagesPanel", () => {
      const onRename = vi.fn();
      render(
        <StudioPagesPanel
          activePageKey="home"
          onSelectPage={vi.fn()}
          onClose={vi.fn()}
          customPages={customPages}
          onRenamePage={onRename}
          existingSlugs={["home", "shop", "our-story", "customer-care"]}
        />
      );

      fireEvent.click(screen.getByTestId("rename-page-our-story"));

      const titleInput = screen.getByTestId("rename-title-input-our-story");
      const slugInput = screen.getByTestId("rename-slug-input-our-story");

      fireEvent.change(titleInput, { target: { value: "رؤيتنا المحدثة" } });
      fireEvent.change(slugInput, { target: { value: "updated-vision" } });

      fireEvent.click(screen.getByTestId("rename-save-our-story"));
      expect(onRename).toHaveBeenCalledWith("our-story", "رؤيتنا المحدثة", "updated-vision");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 5. Navigation Menu Cleanup & Studio State Handlers
  // ─────────────────────────────────────────────────────────────
  describe("5. Navigation Menu Removal on Page Deletion & Hook State", () => {
    it("removes deleted page from designTokens.navigation.menu and rejects standard page deletion", () => {
      const initialTokens = {
        pages: {
          "special-offer": { id: "special-offer", title: "عرض خاص", sections: [] },
        },
        pageOverrides: {
          "special-offer": { id: "special-offer", title: "عرض خاص", sections: [] },
        },
        navigation: {
          menu: [
            { label: "الرئيسية", url: "/" },
            { label: "عرض خاص", url: "/special-offer" },
            { label: "المتجر", url: "/shop" },
          ],
        },
      };

      const onTokensChange = vi.fn();
      const { result } = renderHook(() =>
        useStorefrontStudioState({
          themeId: "modern-minimal",
          externalDesignTokens: initialTokens,
          onChange: onTokensChange,
          onSave: vi.fn(),
        })
      );

      // Attempting to delete a standard page like 'home' must return false
      act(() => {
        const canDeleteStandard = result.current.handleDeletePage("home");
        expect(canDeleteStandard).toBe(false);
      });

      // Deleting custom page 'special-offer'
      act(() => {
        const success = result.current.handleDeletePage("special-offer");
        expect(success).toBe(true);
      });

      // Verify onTokensChange was called with menu without /special-offer
      expect(onTokensChange).toHaveBeenCalled();
      const lastCallTokens = onTokensChange.mock.calls[onTokensChange.mock.calls.length - 1][0];

      expect(lastCallTokens.pages["special-offer"]).toBeUndefined();
      expect(lastCallTokens.pageOverrides["special-offer"]).toBeUndefined();

      const remainingUrls = lastCallTokens.navigation?.menu?.map((m: any) => m.url);
      expect(remainingUrls).toEqual(["/", "/shop"]);
    });

    it("migrates slug, updates pageStyles, and updates navigation menu when renaming page slug", () => {
      const initialTokens = {
        pages: {
          "old-slug": { id: "old-slug", title: "العنوان القديم", sections: [] },
        },
        pageStyles: {
          "old-slug": { background: "#fff" },
        },
        navigation: {
          menu: [
            { label: "القديم", url: "/old-slug" },
          ],
        },
      };

      const onTokensChange = vi.fn();
      const { result } = renderHook(() =>
        useStorefrontStudioState({
          themeId: "modern-minimal",
          externalDesignTokens: initialTokens,
          onChange: onTokensChange,
          onSave: vi.fn(),
        })
      );

      act(() => {
        const res = result.current.handleRenamePage("old-slug", "العنوان الجديد", "new-slug");
        expect(res).toBe(true);
      });

      expect(onTokensChange).toHaveBeenCalled();
      const nextTokens = onTokensChange.mock.calls[onTokensChange.mock.calls.length - 1][0];

      expect(nextTokens.pages["old-slug"]).toBeUndefined();
      expect(nextTokens.pages["new-slug"]).toBeDefined();
      expect(nextTokens.pages["new-slug"].title).toBe("العنوان الجديد");
      expect(nextTokens.pageStyles["new-slug"]).toEqual({ background: "#fff" });
      expect(nextTokens.navigation.menu[0]).toEqual({ label: "العنوان الجديد", url: "/new-slug" });
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 6. Template Selection Confirmation & Minimum Sections Guard
  // ─────────────────────────────────────────────────────────────
  describe("6. Template Selection Validation & Minimum Sections (>= 4)", () => {
    it("disables create button when no preset template is selected and enables when selected", () => {
      const onCreate = vi.fn();
      render(
        <StudioCreatePageModal
          isOpen={true}
          onClose={vi.fn()}
          existingSlugs={["home", "shop"]}
          onCreatePage={onCreate}
        />
      );

      const submitBtn = screen.getByRole("button", { name: /إنشاء الصفحة وتجهيزها/ });
      // Initially "about" is selected and title/slug are valid
      expect(submitBtn).toHaveProperty("disabled", false);

      // Deselect "about" by clicking it
      const aboutCard = screen.getByTestId("preset-card-about");
      fireEvent.click(aboutCard);

      // Submit button must become disabled
      expect(submitBtn).toHaveProperty("disabled", true);
      expect(screen.getByText(/يرجى تحديد قالب من القائمة أعلاه/)).toBeDefined();

      // Click another preset e.g. "flash-sale"
      const flashSaleCard = screen.getByTestId("preset-card-flash-sale");
      fireEvent.click(flashSaleCard);

      // Submit button must be re-enabled
      expect(submitBtn).toHaveProperty("disabled", false);
    });

    it("guarantees every single one of the 10 presets produces sections.length >= 4", () => {
      expect(STUDIO_PAGE_PRESETS.length).toBe(10);

      STUDIO_PAGE_PRESETS.forEach((preset) => {
        const sections = createTemplateSections(preset.id, preset.label);
        expect(
          sections.length,
          `Preset "${preset.id}" (${preset.label}) produced fewer than 4 sections!`
        ).toBeGreaterThanOrEqual(4);
      });
    });
  });
});
