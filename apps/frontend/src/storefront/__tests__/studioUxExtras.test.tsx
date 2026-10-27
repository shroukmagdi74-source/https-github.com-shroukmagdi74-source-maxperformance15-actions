/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, cleanup, act, renderHook } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { STUDIO_KEYMAP } from "../studio/utils/studioKeymap";
import {
  searchSections,
  replaceSectionMatch,
  replaceAllSectionMatches,
} from "../studio/utils/studioSearchReplace";
import { StudioShortcutsModal } from "../studio/StudioShortcutsModal";
import { StudioSearchReplacePanel } from "../studio/StudioSearchReplacePanel";
import { StudioMultiSelectActionBar } from "../studio/StudioMultiSelectActionBar";
import { useStudioHistory } from "../studio/hooks/useStudioHistory";
import { buildStorefrontShareablePreviewUrl, buildStorefrontPreviewPath } from "../utils/paths";
import { StorefrontHead } from "../engine/StorefrontHead";
import { StorefrontThemeProvider } from "../engine/ThemeProvider";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

describe("UX-1: Search/Replace, Multi-Select, Shortcuts Palette & Shareable Preview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.title = "";
    const metaRobots = document.querySelector('meta[name="robots"]');
    if (metaRobots) metaRobots.remove();
  });

  afterEach(() => {
    cleanup();
    const metaRobots = document.querySelector('meta[name="robots"]');
    if (metaRobots) metaRobots.remove();
  });

  // ─────────────────────────────────────────────────────────────
  // 1. Acceptance Criterion 2: Search "عروض" in page with 3 matches & Replace All
  // ─────────────────────────────────────────────────────────────
  it("1. Acceptance Criterion 2: search «عروض» in 3 matches -> counter = 3, replace all -> 0 matches + 3 changes", () => {
    const sampleSections = [
      {
        key: "hero-1",
        type: "hero",
        title: "أقوى عروض الصيف",
        settings: {
          subtitle: "عروض مميزة للجميع",
        },
      },
      {
        key: "grid-1",
        type: "product-grid",
        buttonText: "تصفح عروض اليوم",
        settings: {
          heading: "منتجات حصرية",
        },
      },
    ];

    // Direct helper search
    const matches = searchSections(sampleSections, "عروض");
    expect(matches.length).toBe(3);

    // Replace all occurrences of "عروض" with "تخفيضات"
    const { updatedSections, count } = replaceAllSectionMatches(
      sampleSections,
      "عروض",
      "تخفيضات"
    );

    expect(count).toBe(3);
    expect(updatedSections[0].title).toBe("أقوى تخفيضات الصيف");
    expect(updatedSections[0].settings.subtitle).toBe("تخفيضات مميزة للجميع");
    expect(updatedSections[1].buttonText).toBe("تصفح تخفيضات اليوم");

    // After replace all: 0 matches for "عروض"
    const remainingMatches = searchSections(updatedSections, "عروض");
    expect(remainingMatches.length).toBe(0);

    // Also verify via StudioSearchReplacePanel UI component
    const handleUpdate = vi.fn();
    const handleNavigate = vi.fn();

    render(
      <StudioSearchReplacePanel
        isOpen={true}
        onClose={vi.fn()}
        sections={sampleSections}
        onUpdateSections={handleUpdate}
        onNavigateToSection={handleNavigate}
      />
    );

    const searchInput = screen.getByTestId("studio-search-input");
    fireEvent.change(searchInput, { target: { value: "عروض" } });

    // Counter displays match count "1/3"
    const countBadge = screen.getByTestId("search-match-count");
    expect(countBadge.textContent).toContain("3");

    // Fill replacement and click "استبدال الكل"
    const replaceInput = screen.getByTestId("studio-replace-input");
    fireEvent.change(replaceInput, { target: { value: "تخفيضات" } });

    const replaceAllBtn = screen.getByTestId("search-replace-all-btn");
    fireEvent.click(replaceAllBtn);

    expect(handleUpdate).toHaveBeenCalledTimes(1);
    const updatedPayload = handleUpdate.mock.calls[0][0];
    expect(searchSections(updatedPayload, "عروض").length).toBe(0);
  });

  // ─────────────────────────────────────────────────────────────
  // 2. Search Navigation & Single Replace
  // ─────────────────────────────────────────────────────────────
  it("2. Search panel navigates through matches and allows replacing single occurrence", () => {
    const sampleSections = [
      {
        key: "sec-1",
        type: "banner",
        title: "عروض الشتاء الأولى",
      },
      {
        key: "sec-2",
        type: "banner",
        title: "عروض الربيع الثانية",
      },
    ];

    const handleUpdate = vi.fn();
    const handleNavigate = vi.fn();

    render(
      <StudioSearchReplacePanel
        isOpen={true}
        onClose={vi.fn()}
        sections={sampleSections}
        onUpdateSections={handleUpdate}
        onNavigateToSection={handleNavigate}
      />
    );

    const searchInput = screen.getByTestId("studio-search-input");
    fireEvent.change(searchInput, { target: { value: "عروض" } });

    // Navigate to next match
    const nextBtn = screen.getByTestId("search-next-btn");
    fireEvent.click(nextBtn);
    expect(handleNavigate).toHaveBeenCalledWith("sec-2");

    // Navigate back to prev match
    const prevBtn = screen.getByTestId("search-prev-btn");
    fireEvent.click(prevBtn);
    expect(handleNavigate).toHaveBeenCalledWith("sec-1");

    // Replace single match
    const replaceInput = screen.getByTestId("studio-replace-input");
    fireEvent.change(replaceInput, { target: { value: "حملة" } });

    const replaceBtn = screen.getByTestId("search-replace-btn");
    fireEvent.click(replaceBtn);

    expect(handleUpdate).toHaveBeenCalledTimes(1);
    const singleReplaced = handleUpdate.mock.calls[0][0];
    expect(singleReplaced[0].title).toBe("حملة الشتاء الأولى");
    expect(singleReplaced[1].title).toBe("عروض الربيع الثانية");
  });

  // ─────────────────────────────────────────────────────────────
  // 3. Acceptance Criterion 3: Multi-select 2 sections + delete in a single undo step
  // ─────────────────────────────────────────────────────────────
  it("3. Acceptance Criterion 3: multi-select 2 sections + delete -> deletes both in ONE undo step (1 undo brings both back)", () => {
    const initialPages = {
      pages: {
        home: {
          sections: [
            { key: "hero-1", type: "hero", title: "البانر الرئيسي" },
            { key: "featured-1", type: "featured", title: "منتجات مميزة" },
            { key: "footer-1", type: "footer", title: "التذييل" },
          ],
        },
      },
    };

    const { result } = renderHook(() =>
      useStudioHistory<typeof initialPages>(initialPages, { coalesceMs: 0 })
    );

    // Initial state: 3 sections
    expect(result.current.state.pages.home.sections.length).toBe(3);

    // Bulk delete 2 sections (hero-1 and featured-1) in ONE history set step
    const keysToDelete = new Set(["hero-1", "featured-1"]);
    const nextSections = result.current.state.pages.home.sections.filter(
      (s: any) => !keysToDelete.has(s.key)
    );

    act(() => {
      result.current.set({
        pages: {
          home: {
            sections: nextSections,
          },
        },
      });
    });

    // Both sections deleted
    expect(result.current.state.pages.home.sections.length).toBe(1);
    expect(result.current.state.pages.home.sections[0].key).toBe("footer-1");
    expect(result.current.canUndo).toBe(true);

    // Call undo ONCE -> both sections are restored together!
    act(() => {
      result.current.undo();
    });

    expect(result.current.state.pages.home.sections.length).toBe(3);
    expect(result.current.state.pages.home.sections[0].key).toBe("hero-1");
    expect(result.current.state.pages.home.sections[1].key).toBe("featured-1");
    expect(result.current.state.pages.home.sections[2].key).toBe("footer-1");
  });

  // ─────────────────────────────────────────────────────────────
  // 4. Acceptance Criterion 4: Shortcuts palette row count = keymap count (assert equivalence)
  // ─────────────────────────────────────────────────────────────
  it("4. Acceptance Criterion 4: shortcuts modal rows count equals STUDIO_KEYMAP length (assert equivalence)", () => {
    const handleClose = vi.fn();

    render(<StudioShortcutsModal isOpen={true} onClose={handleClose} />);

    // Assert modal is in the document
    expect(screen.getByTestId("studio-shortcuts-modal")).toBeDefined();

    // Assert row count equals keymap length
    const rows = screen.getAllByTestId("shortcut-row");
    expect(rows.length).toBe(STUDIO_KEYMAP.length);

    // Assert essential shortcuts are represented in the keymap
    const shortcutKeys = STUDIO_KEYMAP.map((s) => s.displayKey);
    expect(shortcutKeys).toContain("Ctrl + S");
    expect(shortcutKeys).toContain("Ctrl + Z");
    expect(shortcutKeys).toContain("Ctrl + F");
    expect(shortcutKeys).toContain("?");
    expect(shortcutKeys).toContain("Shift / Ctrl + Click");
  });

  // ─────────────────────────────────────────────────────────────
  // 5. Acceptance Criterion 5: Preview link contains 'preview' + page has noindex meta
  // ─────────────────────────────────────────────────────────────
  it("5. Acceptance Criterion 5: preview link contains 'preview' and StorefrontHead renders 'noindex' on meta[name='robots']", () => {
    // 1. Assert shareable preview URL contains 'preview'
    const previewUrl = buildStorefrontShareablePreviewUrl("/", {
      companySlug: "swan-boutique",
      previewTheme: "modern-minimal",
    });

    expect(previewUrl).toContain("preview");
    expect(previewUrl).toContain("preview=1");

    // Also with customDomain
    const customDomainPreview = buildStorefrontPreviewPath("/", {
      customDomain: "shop.example.com",
      preview: "1",
    });
    expect(customDomainPreview).toContain("preview=1");

    // 2. Assert StorefrontHead with ?preview=1 sets meta[name="robots"] to noindex
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/store?preview=1"]}>
          <StorefrontThemeProvider>
            <StorefrontHead defaultTitle="متجري التجريبي" />
          </StorefrontThemeProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );

    const robotsMeta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    expect(robotsMeta).not.toBeNull();
    const robotsContent = robotsMeta?.getAttribute("content") || "";
    expect(robotsContent).toContain("noindex");
    expect(robotsContent).toContain("follow");
  });

  // ─────────────────────────────────────────────────────────────
  // 6. Multi-Select Action Bar Visibility & Bulk Actions
  // ─────────────────────────────────────────────────────────────
  it("6. MultiSelectActionBar is visible when count > 1 and triggers bulk actions", () => {
    const handleHide = vi.fn();
    const handleLock = vi.fn();
    const handleDuplicate = vi.fn();
    const handleDelete = vi.fn();
    const handleAlign = vi.fn();
    const handleClear = vi.fn();

    const { rerender } = render(
      <StudioMultiSelectActionBar
        selectedCount={1}
        onHide={handleHide}
        onLock={handleLock}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        onAlign={handleAlign}
        onClear={handleClear}
      />
    );

    // When selectedCount <= 1, bar is hidden (returns null)
    expect(screen.queryByTestId("studio-multi-select-bar")).toBeNull();

    // When selectedCount = 3, bar is rendered
    rerender(
      <StudioMultiSelectActionBar
        selectedCount={3}
        onHide={handleHide}
        onLock={handleLock}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        onAlign={handleAlign}
        onClear={handleClear}
      />
    );

    expect(screen.getByTestId("studio-multi-select-bar")).toBeDefined();
    expect(screen.getByTestId("multi-select-count").textContent).toContain("3");

    // Bulk hide trigger
    fireEvent.click(screen.getByTestId("bulk-hide-btn"));
    expect(handleHide).toHaveBeenCalledTimes(1);

    // Bulk lock trigger
    fireEvent.click(screen.getByTestId("bulk-lock-btn"));
    expect(handleLock).toHaveBeenCalledTimes(1);

    // Bulk duplicate trigger
    fireEvent.click(screen.getByTestId("bulk-duplicate-btn"));
    expect(handleDuplicate).toHaveBeenCalledTimes(1);

    // Bulk align triggers
    fireEvent.click(screen.getByTestId("bulk-align-center-btn"));
    expect(handleAlign).toHaveBeenCalledWith("center");

    // Bulk delete trigger
    fireEvent.click(screen.getByTestId("bulk-delete-btn"));
    expect(handleDelete).toHaveBeenCalledTimes(1);

    // Clear selection trigger
    fireEvent.click(screen.getByTestId("bulk-clear-btn"));
    expect(handleClear).toHaveBeenCalledTimes(1);
  });

  // ─────────────────────────────────────────────────────────────
  // 7. Shortcuts Modal Esc / Close interaction
  // ─────────────────────────────────────────────────────────────
  it("7. StudioShortcutsModal closes via close button and Escape key", () => {
    const handleClose = vi.fn();

    render(<StudioShortcutsModal isOpen={true} onClose={handleClose} />);

    // Click close button
    const closeBtn = screen.getByTestId("close-shortcuts-modal");
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Press Escape
    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  // ─────────────────────────────────────────────────────────────
  // 8. Search Panel closes via Escape key
  // ─────────────────────────────────────────────────────────────
  it("8. StudioSearchReplacePanel closes via close button and Escape key", () => {
    const handleClose = vi.fn();

    render(
      <StudioSearchReplacePanel
        isOpen={true}
        onClose={handleClose}
        sections={[]}
        onUpdateSections={vi.fn()}
        onNavigateToSection={vi.fn()}
      />
    );

    // Click close button
    fireEvent.click(screen.getByTestId("search-close-btn"));
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Press Escape inside panel
    const searchPanel = screen.getByTestId("studio-search-replace-panel");
    fireEvent.keyDown(searchPanel, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
