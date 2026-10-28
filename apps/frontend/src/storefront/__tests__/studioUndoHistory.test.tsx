// @vitest-environment jsdom
/**
 * UNDO-1 — Studio undo history panel (steps, labels, jump, cap, relative time).
 *
 * Covers the acceptance numbers of the ticket:
 *  1. vitest pass (≥7 cases).
 *  2. 3 operations (add section · edit text · delete section) → 3 distinct human labels.
 *  3. Jumping to an old step → state deep-equals the state right after that step.
 *  4. 60 operations → at most 50 steps kept.
 *  5. Undo/redo intact + HIST-1 versions tab untouched.
 */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  renderHook,
  act,
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import { useStudioHistory } from "../studio/hooks/useStudioHistory";
import { StudioHistoryPanel } from "../studio/StudioHistoryPanel";
import { storefrontSettingsService } from "../../services/storefrontSettingsService";
import {
  describeStudioHistoryStep,
  formatRelativeTimeAr,
  STUDIO_HISTORY_MAX_STEPS,
  type StudioHistoryStepView,
} from "../studio/utils/studioHistoryTimeline";

vi.mock("../../services/storefrontSettingsService", () => ({
  storefrontSettingsService: {
    getRevisions: vi.fn(),
    getRevisionById: vi.fn(),
    restoreRevision: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

interface TestSection {
  key: string;
  type: string;
  settings?: Record<string, unknown>;
}

const heroSection = (): TestSection => ({
  key: "hero-1",
  type: "hero-banner",
  settings: { title: "بانر رئيسي", heading: "بانر رئيسي" },
});

const featuredSection = (): TestSection => ({
  key: "featured-1",
  type: "featured-products",
  settings: { title: "منتجات مميزة" },
});

const newsletterSection = (): TestSection => ({
  key: "newsletter-1",
  type: "newsletter",
  settings: { title: "نشرة بريدية" },
});

const tokensWith = (sections: TestSection[]): Record<string, unknown> => ({
  pages: {
    home: { title: "الرئيسية", sections },
  },
});

const sectionTitleOf = (tokens: unknown): string => {
  const sections = (tokens as { pages: { home: { sections: Array<{ settings?: { title?: string } }> } } })
    .pages.home.sections;
  return sections[0]?.settings?.title ?? "";
};

const makeStepViews = (
  count: number,
  currentIndex: number,
  at: number = Date.now()
): StudioHistoryStepView[] =>
  Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    index,
    label: `خطوة ${index + 1}`,
    at: at - (count - index) * 1000,
    isCurrent: index === currentIndex,
    isFuture: index > currentIndex,
  }));

describe("UNDO-1 — Studio undo history panel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(storefrontSettingsService.getRevisions).mockResolvedValue({
      success: true,
      data: [],
    });
  });

  afterEach(() => {
    cleanup();
  });

  // ─────────────────────────────────────────────────────────────
  // 1. Acceptance #2 — three operations produce three distinct human labels
  // ─────────────────────────────────────────────────────────────
  it("1. labels add-section / edit-text / delete-section with three distinct Arabic labels", () => {
    const initial = tokensWith([heroSection()]);
    const { result } = renderHook(() =>
      useStudioHistory<Record<string, unknown>>(initial, { coalesceMs: 0 })
    );

    act(() => {
      result.current.set(tokensWith([heroSection(), featuredSection()]));
    });
    act(() => {
      result.current.set(
        tokensWith([heroSection(), { ...featuredSection(), settings: { title: "منتجات جديدة" } }])
      );
    });
    act(() => {
      result.current.set(tokensWith([heroSection()]));
    });

    const labels = result.current.steps.map((step) => step.label);
    expect(labels).toHaveLength(3);
    expect(new Set(labels).size).toBe(3);

    expect(labels[0]).toContain("إضافة قسم");
    expect(labels[1]).toBe("تعديل نص");
    expect(labels[2]).toContain("حذف قسم");

    for (const label of labels) {
      expect(label).not.toBe("تعديل المتجر");
      expect(label).toMatch(/[\u0600-\u06FF]/);
    }

    // Only the newest step is the current one.
    expect(result.current.steps.filter((step) => step.isCurrent)).toHaveLength(1);
    expect(result.current.steps[2].isCurrent).toBe(true);
    expect(result.current.currentStepIndex).toBe(2);
  });

  // ─────────────────────────────────────────────────────────────
  // 2. Acceptance #3 — jumping to an old step restores its exact state
  // ─────────────────────────────────────────────────────────────
  it("2. jumping to an old step deep-equals the exact state after that step", () => {
    const onChange = vi.fn();
    const first = tokensWith([heroSection()]);
    const second = tokensWith([heroSection(), featuredSection()]);
    const third = tokensWith([heroSection(), { ...featuredSection(), settings: { title: "منتجات جديدة" } }]);
    const fourth = tokensWith([
      heroSection(),
      { ...featuredSection(), settings: { title: "منتجات جديدة" } },
      newsletterSection(),
    ]);

    const { result } = renderHook(() =>
      useStudioHistory<Record<string, unknown>>(first, { coalesceMs: 0, onChange })
    );

    act(() => {
      result.current.set(second);
    });
    act(() => {
      result.current.set(third);
    });
    act(() => {
      result.current.set(fourth);
    });

    const stepIds = result.current.steps.map((step) => step.id);
    expect(stepIds).toHaveLength(3);

    act(() => {
      result.current.jumpToStep(stepIds[0]);
    });

    expect(result.current.state).toEqual(second);
    expect(result.current.state).not.toEqual(fourth);
    expect(onChange).toHaveBeenLastCalledWith(second);
    expect(result.current.steps[0].isCurrent).toBe(true);
    expect(result.current.steps[1].isFuture).toBe(true);
    expect(result.current.steps[2].isFuture).toBe(true);
    expect(result.current.canRedo).toBe(true);
    expect(result.current.canUndo).toBe(true);

    // Jumping forward again lands exactly on the newest snapshot.
    act(() => {
      result.current.jumpToStep(stepIds[2]);
    });
    expect(result.current.state).toEqual(fourth);
    expect(result.current.canRedo).toBe(false);
  });

  // ─────────────────────────────────────────────────────────────
  // 3. Acceptance #4 — 60 operations keep at most 50 steps
  // ─────────────────────────────────────────────────────────────
  it("3. 60 operations keep exactly 50 steps (oldest dropped first)", () => {
    const initial = tokensWith([{ key: "s-0", type: "text", settings: { title: "نص 0" } }]);
    const { result } = renderHook(() =>
      useStudioHistory<Record<string, unknown>>(initial, { coalesceMs: 0 })
    );

    expect(result.current.maxSteps).toBe(STUDIO_HISTORY_MAX_STEPS);
    expect(result.current.maxSteps).toBe(50);

    act(() => {
      for (let index = 0; index < 60; index += 1) {
        result.current.set(
          tokensWith([{ key: `s-${index}`, type: "text", settings: { title: `نص ${index}` } }])
        );
      }
    });

    expect(result.current.steps).toHaveLength(50);
    expect(result.current.stepCount).toBe(50);
    expect(result.current.steps[49].isCurrent).toBe(true);
    expect(sectionTitleOf(result.current.state)).toBe("نص 59");

    // Walking back hits the oldest retained predecessor, then stops.
    act(() => {
      for (let index = 0; index < 50; index += 1) {
        result.current.undo();
      }
    });

    expect(result.current.canUndo).toBe(false);
    expect(sectionTitleOf(result.current.state)).toBe("نص 9");
  });

  // ─────────────────────────────────────────────────────────────
  // 4. Undo/redo still behave (no regression for the existing stack)
  // ─────────────────────────────────────────────────────────────
  it("4. undo/redo keep the steps list intact and truncate redo on a new edit", () => {
    const first = tokensWith([heroSection()]);
    const second = tokensWith([heroSection(), featuredSection()]);
    const third = tokensWith([heroSection(), featuredSection(), newsletterSection()]);

    const { result } = renderHook(() =>
      useStudioHistory<Record<string, unknown>>(first, { coalesceMs: 0 })
    );

    act(() => {
      result.current.set(second);
    });
    act(() => {
      result.current.set(third);
    });

    act(() => {
      result.current.undo();
    });

    expect(result.current.state).toEqual(second);
    expect(result.current.steps).toHaveLength(2);
    expect(result.current.steps[1].isFuture).toBe(true);
    expect(result.current.canRedo).toBe(true);

    act(() => {
      result.current.redo();
    });
    expect(result.current.state).toEqual(third);
    expect(result.current.canRedo).toBe(false);

    act(() => {
      result.current.undo();
    });
    act(() => {
      result.current.undo();
    });
    expect(result.current.state).toEqual(first);
    expect(result.current.canUndo).toBe(false);

    // A brand new edit after undo drops the redo branch (one step remains).
    const branch = tokensWith([heroSection(), { ...featuredSection(), settings: { title: "فرع جديد" } }]);
    act(() => {
      result.current.set(branch);
    });

    expect(result.current.steps).toHaveLength(1);
    expect(result.current.steps[0].isCurrent).toBe(true);
    expect(result.current.canRedo).toBe(false);
    expect(result.current.state).toEqual(branch);
  });

  // ─────────────────────────────────────────────────────────────
  // 5. Rapid typing coalesces into ONE labeled step
  // ─────────────────────────────────────────────────────────────
  it("5. rapid edits inside the coalesce window stay one step with a text label", () => {
    const typing = (title: string) =>
      tokensWith([{ ...heroSection(), settings: { title } }]);
    const initial = tokensWith([heroSection()]);

    const { result } = renderHook(() =>
      useStudioHistory<Record<string, unknown>>(initial, { coalesceMs: 500 })
    );

    act(() => {
      result.current.set(typing("أ"));
      result.current.set(typing("أب"));
      result.current.set(typing("أبج"));
    });

    expect(result.current.steps).toHaveLength(1);
    expect(result.current.steps[0].label).toBe("تعديل نص");
    expect(sectionTitleOf(result.current.state)).toBe("أبج");
  });

  // ─────────────────────────────────────────────────────────────
  // 6. Relative time formatting («من 2 دقيقة»)
  // ─────────────────────────────────────────────────────────────
  it("6. formatRelativeTimeAr renders the Arabic «من N» wording", () => {
    const now = Date.parse("2026-10-28T12:00:00.000Z");

    expect(formatRelativeTimeAr(now - 5_000, now)).toBe("الآن");
    expect(formatRelativeTimeAr(now - 2 * 60_000, now)).toBe("من 2 دقيقة");
    expect(formatRelativeTimeAr(now - 60 * 60_000, now)).toBe("من ساعة");
    expect(formatRelativeTimeAr(now - 3 * 24 * 60 * 60_000, now)).toBe("من 3 يوم");
  });

  // ─────────────────────────────────────────────────────────────
  // 7. Label inference for high-level token edits
  // ─────────────────────────────────────────────────────────────
  it("7. describeStudioHistoryStep labels header, variables, theme and color edits", () => {
    expect(
      describeStudioHistoryStep(
        { global: { header: { menu: [] } } },
        { global: { header: { menu: [{ label: "المنتجات" }] } } }
      )
    ).toBe("تعديل الهيدر");

    expect(
      describeStudioHistoryStep({ variables: { brand: "#2b6cf6" } }, { variables: { brand: "#000000" } })
    ).toBe("تعديل المتغيرات");

    expect(describeStudioHistoryStep({ themeId: "modern-minimal" }, { themeId: "khemet" })).toBe(
      "تغيير الستايل"
    );

    expect(
      describeStudioHistoryStep(
        tokensWith([{ key: "hero-1", type: "hero-banner", settings: { backgroundColor: "#ffffff" } }]),
        tokensWith([{ key: "hero-1", type: "hero-banner", settings: { backgroundColor: "#000000" } }])
      )
    ).toBe("تغيير لون");
  });

  // ─────────────────────────────────────────────────────────────
  // 8. Panel — steps tab rows, current highlight, jump, reverse order
  // ─────────────────────────────────────────────────────────────
  it("8. panel lists steps newest-first, highlights the current one and jumps on click", async () => {
    const onJumpToStep = vi.fn();
    const steps = makeStepViews(3, 2, Date.now() - 2 * 60_000);

    render(
      <StudioHistoryPanel
        isOpen={true}
        onClose={vi.fn()}
        steps={steps}
        currentStepIndex={2}
        onJumpToStep={onJumpToStep}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("studio-history-tab-steps")).toBeInTheDocument();
    });

    expect(screen.getByTestId("studio-history-tab-steps")).toHaveAttribute("data-active", "true");
    expect(screen.getByTestId("studio-history-tab-versions")).toHaveAttribute("data-active", "false");

    const rows = screen.getAllByTestId("undo-step-row");
    expect(rows).toHaveLength(3);
    // Newest first by default.
    expect(rows[0]).toHaveAttribute("data-step-id", String(steps[2].id));
    expect(rows[0]).toHaveAttribute("data-current", "true");
    expect(rows[2]).toHaveAttribute("data-step-id", String(steps[0].id));

    expect(screen.getByTestId("undo-step-current-badge")).toBeInTheDocument();
    expect(screen.getAllByTestId("undo-step-time")).toHaveLength(3);
    expect(screen.getAllByText("من 2 دقيقة").length).toBeGreaterThan(0);

    // Jump to the oldest step.
    fireEvent.click(screen.getByTestId(`undo-jump-${steps[0].id}`));
    expect(onJumpToStep).toHaveBeenCalledTimes(1);
    expect(onJumpToStep).toHaveBeenCalledWith(steps[0].id);

    // The current step cannot be "jumped to" (already there).
    expect(screen.getByTestId(`undo-jump-${steps[2].id}`)).toBeDisabled();

    // Reverse the order → oldest first.
    fireEvent.click(screen.getByTestId("studio-history-steps-order"));
    expect(screen.getByTestId("studio-history-steps-order")).toHaveAttribute("data-order", "oldest");
    const reordered = screen.getAllByTestId("undo-step-row");
    expect(reordered[0]).toHaveAttribute("data-step-id", String(steps[0].id));
    expect(reordered[2]).toHaveAttribute("data-step-id", String(steps[2].id));
  });

  // ─────────────────────────────────────────────────────────────
  // 9. Panel — empty steps state + HIST-1 versions tab regression
  // ─────────────────────────────────────────────────────────────
  it("9. panel shows the empty steps state and keeps the HIST-1 versions tab working", async () => {
    const { unmount } = render(
      <StudioHistoryPanel isOpen={true} onClose={vi.fn()} steps={[]} currentStepIndex={-1} />
    );

    expect(screen.getByTestId("studio-history-steps-empty")).toBeInTheDocument();
    unmount();

    vi.mocked(storefrontSettingsService.getRevisions).mockResolvedValue({
      success: true,
      data: [
        {
          id: "rev-12",
          revisionNumber: 12,
          createdAt: "2026-10-22T14:32:00.000Z",
          createdByName: "محمد",
          createdByEmail: "mohamed@example.com",
          note: "تعديل المنيو",
        },
      ] as never,
    });

    render(
      <StudioHistoryPanel
        isOpen={true}
        onClose={vi.fn()}
        steps={makeStepViews(2, 1)}
        currentStepIndex={1}
        onJumpToStep={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId("studio-history-tab-versions"));

    await waitFor(() => {
      expect(screen.getByText("#12")).toBeInTheDocument();
    });
    expect(screen.getByText("· محمد")).toBeInTheDocument();
    expect(screen.queryByTestId("undo-step-row")).not.toBeInTheDocument();
  });

  // ─────────────────────────────────────────────────────────────
  // 10. Panel without steps prop keeps the legacy (versions-only) behaviour
  // ─────────────────────────────────────────────────────────────
  it("10. panel without the steps prop opens on versions (HIST-1 unchanged)", async () => {
    render(<StudioHistoryPanel isOpen={true} onClose={vi.fn()} companyId="company-test" />);

    await waitFor(() => {
      expect(screen.getByTestId("studio-history-empty")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("studio-history-tab-steps")).not.toBeInTheDocument();
    expect(screen.getByTestId("studio-history-tab-versions")).toHaveAttribute("data-active", "true");
  });
});
