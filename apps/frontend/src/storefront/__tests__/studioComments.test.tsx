// @vitest-environment jsdom
import React, { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { StudioCommentsLayer } from "../studio/StudioCommentsLayer";
import { StudioCommentsPanel } from "../studio/StudioCommentsPanel";
import type { StudioComment } from "../studio/StudioTypes";
import {
  addStudioCommentToSettings,
  deleteStudioCommentFromSettings,
  readStudioComments,
  resolveCommentAuthorName,
  sanitizeCommentAuthorName,
  setStudioCommentResolvedInSettings,
  writeStudioComments,
} from "../studio/utils/studioComments";
import DynamicStorefrontPage from "../pages/DynamicStorefrontPage";

const VISITOR_COMMENT: StudioComment = {
  id: "cmt_visitor",
  pageKey: "home",
  sectionKey: "rt-0",
  text: "تعليق داخلي لا يجب أن يظهر للزائر",
  author: "منى سالم",
  createdAt: "2026-10-28T09:00:00.000Z",
  resolved: false,
};

vi.mock("../hooks/useStorefrontSettings", () => ({
  useStorefrontSettings: () => ({
    settings: {
      company: { id: "comp-1" },
      storefront: { settings: { storeName: "متجر التجربة" } },
      // التعليقات في نفس settings blob — يجب ألا تُرندر في المتجر العام
      designTokens: { comments: [VISITOR_COMMENT] },
    },
    isLoading: false,
  }),
}));

vi.mock("../../hooks/useStorePage", () => ({
  useStorePage: () => ({ page: null, loading: false, error: "Not found" }),
}));

vi.mock("../engine/ThemeProvider", () => {
  const theme = {
    id: "mock-theme",
    name: "متجر التجربة",
    direction: "rtl",
    tokens: { colors: {}, typography: { direction: "rtl" }, shape: {} },
    header: { navigation: [], showSearch: true, showCart: true },
    footer: { socialLinks: {}, navigation: [] },
    pages: {
      home: {
        sections: [
          {
            type: "richtext",
            key: "rt-0",
            settings: { badge: "قصتنا", title: "قسم الزائر" },
          },
        ],
      },
      shop: { sections: [] },
      pdp: { sections: [] },
      cart: { sections: [] },
      checkout: { sections: [] },
      "thank-you": { sections: [] },
    },
  };
  return {
    useStorefrontTheme: () => ({ theme, setTheme: () => {}, activePageKey: "home" }),
    StorefrontThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

const SECTIONS = [
  { key: "hero-0", label: "بانر رئيسي" },
  { key: "richtext-1", label: "نص تحريري" },
];

const buildComment = (overrides: Partial<StudioComment> = {}): StudioComment => ({
  id: "cmt_seed",
  pageKey: "home",
  sectionKey: "richtext-1",
  text: "عدّل العنوان الرئيسي",
  author: "منى سالم",
  createdAt: "2026-10-28T09:00:00.000Z",
  resolved: false,
  ...overrides,
});

interface CanvasHarnessProps {
  initialComments?: StudioComment[];
  visibleSections?: typeof SECTIONS;
  onChange?: (tokens: Record<string, unknown>) => void;
  onNavigate?: (comment: StudioComment) => void;
}

const CanvasHarness: React.FC<CanvasHarnessProps> = ({
  initialComments,
  visibleSections,
  onChange,
  onNavigate,
}) => {
  const [tokens, setTokens] = useState<Record<string, unknown>>(() =>
    initialComments && initialComments.length > 0
      ? { themeId: "modern-minimal", comments: initialComments }
      : { themeId: "modern-minimal" },
  );
  const [isActive, setIsActive] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  const comments = readStudioComments(tokens);
  const visible = visibleSections || SECTIONS;

  const apply = (next: Record<string, unknown>) => {
    setTokens(next);
    onChange?.(next);
  };

  return (
    <div>
      <div style={{ position: "relative" }} data-testid="studio-canvas">
        {visible.map((section) => (
          <section
            key={section.key}
            data-studio-touch-section={section.key}
            style={{ height: 120 }}
          >
            <button type="button" data-testid={`canvas-${section.key}`}>
              {section.label}
            </button>
          </section>
        ))}
        <StudioCommentsLayer
          pageKey="home"
          sections={visible}
          comments={comments}
          isActive={isActive}
          onToggleActive={setIsActive}
          onOpenPanel={() => setPanelOpen(true)}
          onAddComment={(input) => {
            const result = addStudioCommentToSettings(tokens, {
              pageKey: "home",
              sectionKey: input.sectionKey,
              anchor: input.anchor,
              text: input.text,
              author: "منى سالم",
            });
            if (result.comment) apply(result.tokens);
          }}
        />
      </div>

      <StudioCommentsPanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        comments={comments}
        activePageKey="home"
        pageSectionKeys={{ home: visible.map((section) => section.key) }}
        sectionLabels={Object.fromEntries(
          SECTIONS.map((section) => [`home::${section.key}`, section.label]),
        )}
        onResolve={(id) => apply(setStudioCommentResolvedInSettings(tokens, id, true))}
        onReopen={(id) => apply(setStudioCommentResolvedInSettings(tokens, id, false))}
        onDelete={(id) => apply(deleteStudioCommentFromSettings(tokens, id))}
        onNavigate={onNavigate || (() => {})}
      />
    </div>
  );
};

const openCommentMode = () => {
  fireEvent.click(screen.getByTestId("studio-comment-toggle"));
};

const addCommentOnSection = (sectionKey: string, text: string) => {
  fireEvent.click(screen.getByTestId(`canvas-${sectionKey}`));
  fireEvent.change(screen.getByTestId("studio-comment-input"), {
    target: { value: text },
  });
  fireEvent.click(screen.getByTestId("studio-comment-submit"));
};

afterEach(() => {
  cleanup();
});

describe("CMT-1 — تخزين التعليقات داخل settings blob", () => {
  it("يقرأ التعليقات الصحيحة فقط ويستبعد التالف/المكرر ويُنظّف PII", () => {
    const tokens = {
      themeId: "modern-minimal",
      comments: [
        {
          id: "c1",
          pageKey: "home",
          sectionKey: "hero-0",
          anchor: { x: 130, y: -20 },
          text: "  تعليق أول  ",
          author: "ahmed@example.com",
          createdAt: "2026-10-28T09:00:00.000Z",
          resolved: false,
        },
        { id: "c1", pageKey: "home", text: "مكرر" },
        { id: "", pageKey: "home", text: "بدون معرف" },
        { id: "c2", pageKey: "home", sectionKey: null, text: "", author: "x" },
        "نص غير صالح",
      ],
    };

    const comments = readStudioComments(tokens);
    expect(comments).toHaveLength(1);
    expect(comments[0].text).toBe("تعليق أول");
    expect(comments[0].anchor).toEqual({ x: 100, y: 0 });
    expect(comments[0].author).toBe("فريق المتجر");
    expect(comments[0].author.includes("@")).toBe(false);
  });

  it("يكتب التعليقات مع الحفاظ على بقية الـsettings ويحذف المفتاح عند الفراغ", () => {
    const base = { themeId: "modern-minimal", pages: { home: { sections: [] } } };
    const comment = buildComment();
    const withComments = writeStudioComments(base, [comment]);

    expect(withComments.themeId).toBe("modern-minimal");
    expect((withComments.pages as Record<string, unknown>).home).toBeTruthy();
    expect(readStudioComments(withComments)).toHaveLength(1);

    const cleared = writeStudioComments(withComments, []);
    expect("comments" in cleared).toBe(false);
    expect(cleared.themeId).toBe("modern-minimal");
  });

  it("صفر PII: اسم المؤلف من الاسم فقط والبريد/الهاتف يتحول لاسم الفريق", () => {
    expect(resolveCommentAuthorName({ firstName: "منى", lastName: "سالم" })).toBe("منى سالم");
    expect(resolveCommentAuthorName({ name: "منى سالم", email: "mona@maxp.online" })).toBe("منى سالم");
    expect(sanitizeCommentAuthorName("mona@maxp.online")).toBe("فريق المتجر");
    expect(sanitizeCommentAuthorName("+201012345678")).toBe("فريق المتجر");
    expect(resolveCommentAuthorName(null)).toBe("فريق المتجر");
  });
});

describe("CMT-1 — طبقة التعليقات على الكانفس", () => {
  it("زر «تعليق» يفعّل الوضع، وكليك على قسم يفتح مربع تعليق مثبّت على القسم", () => {
    render(<CanvasHarness />);

    expect(screen.queryByTestId("studio-comment-form")).toBeNull();
    openCommentMode();
    expect(screen.getByTestId("studio-comment-mode-hint")).toBeTruthy();

    fireEvent.click(screen.getByTestId("canvas-hero-0"));

    expect(screen.getByTestId("studio-comment-form")).toBeTruthy();
    expect(screen.getByTestId("studio-comment-form-target").textContent).toBe("بانر رئيسي");
  });

  it("إضافة تعليق على قسم → شارة العدد = 1 ويظهر كدبوس ويُحفظ في نفس tokens", () => {
    let latest: Record<string, unknown> | null = null;
    render(<CanvasHarness onChange={(tokens) => (latest = tokens)} />);

    openCommentMode();
    addCommentOnSection("hero-0", "كبّر العنوان");

    const badge = screen.getByTestId("studio-comment-badge");
    expect(badge.textContent).toBe("1");
    expect(badge.getAttribute("data-count")).toBe("1");

    const stored = readStudioComments(latest);
    expect(stored).toHaveLength(1);
    expect(stored[0].sectionKey).toBe("hero-0");
    expect(stored[0].text).toBe("كبّر العنوان");
    expect(stored[0].author).toBe("منى سالم");
    expect(stored[0].resolved).toBe(false);
    expect(stored[0].author.includes("@")).toBe(false);

    expect(screen.getByTestId(`studio-comment-pin-${stored[0].id}`)).toBeTruthy();

    fireEvent.click(screen.getByTestId("studio-comments-open-panel"));
    const openList = screen.getByTestId("studio-comments-open-list");
    expect(openList.contains(screen.getByTestId(`studio-comment-item-${stored[0].id}`))).toBe(true);
    expect(screen.getByTestId("studio-comments-open-count").textContent).toBe("1");
  });

  it("حل التعليق → يخرج من «مفتوح» ويظهر في «محلول»", () => {
    const comment = buildComment();
    render(<CanvasHarness initialComments={[comment]} />);

    fireEvent.click(screen.getByTestId("studio-comments-open-panel"));
    expect(screen.getByTestId(`studio-comment-item-${comment.id}`)).toBeTruthy();
    expect(screen.queryByTestId("studio-comments-empty-open")).toBeNull();

    fireEvent.click(screen.getByTestId(`studio-comment-resolve-${comment.id}`));

    expect(
      screen
        .getByTestId("studio-comments-open-group")
        .querySelector(`[data-comment-id="${comment.id}"]`),
    ).toBeNull();
    expect(screen.getByTestId("studio-comments-empty-open")).toBeTruthy();
    expect(screen.getByTestId("studio-comments-open-count").textContent).toBe("0");
    expect(screen.getByTestId("studio-comments-resolved-count").textContent).toBe("1");
    expect(
      screen
        .getByTestId("studio-comments-resolved-list")
        .contains(screen.getByTestId(`studio-comment-item-${comment.id}`)),
    ).toBe(true);
    expect(screen.getByTestId("studio-comment-badge").textContent).toBe("0");
  });

  it("حذف قسم عليه تعليق → لا يكسر الصفحة ويظهر «معلّق على قسم محذوف»", () => {
    const comment = buildComment({ sectionKey: "richtext-1" });
    render(
      <CanvasHarness
        initialComments={[comment]}
        visibleSections={[{ key: "hero-0", label: "بانر رئيسي" }]}
      />,
    );

    // الصفحة اترندرت عادي رغم اختفاء القسم
    expect(screen.getByTestId("canvas-hero-0")).toBeTruthy();

    fireEvent.click(screen.getByTestId("studio-comments-open-panel"));

    const orphan = screen.getByTestId(`studio-comment-orphan-${comment.id}`);
    expect(orphan.textContent).toBe("معلّق على قسم محذوف");
    expect(screen.queryByTestId(`studio-comment-goto-${comment.id}`)).toBeNull();
    // التعليق نفسه لسه موجود ومش متضاعف
    expect(screen.getByTestId(`studio-comment-item-${comment.id}`)).toBeTruthy();
  });

  it("تعليق على الصفحة كاملة (بدون قسم) يظهر بوسم خاص بدون زر انتقال", () => {
    let latest: Record<string, unknown> | null = null;
    render(<CanvasHarness onChange={(tokens) => (latest = tokens)} />);

    openCommentMode();
    fireEvent.click(screen.getByTestId("studio-comment-page-target"));
    expect(screen.getByTestId("studio-comment-form-target").textContent).toBe("الصفحة كاملة");

    fireEvent.change(screen.getByTestId("studio-comment-input"), {
      target: { value: "ملاحظة عامة على الصفحة" },
    });
    fireEvent.click(screen.getByTestId("studio-comment-submit"));

    const stored = readStudioComments(latest);
    expect(stored).toHaveLength(1);
    expect(stored[0].sectionKey).toBeNull();

    fireEvent.click(screen.getByTestId("studio-comments-open-panel"));
    expect(
      screen.getByTestId(`studio-comment-item-${stored[0].id}`).textContent,
    ).toContain("تعليق على الصفحة");
    expect(screen.queryByTestId(`studio-comment-goto-${stored[0].id}`)).toBeNull();
  });

  it("لا يقبل تعليقاً فارغاً (زر الإضافة معطّل) وحذف التعليق يشيله من البانل", () => {
    const comment = buildComment();
    render(<CanvasHarness initialComments={[comment]} />);

    openCommentMode();
    fireEvent.click(screen.getByTestId("canvas-hero-0"));
    const submit = screen.getByTestId("studio-comment-submit") as HTMLButtonElement;
    expect(submit.disabled).toBe(true);

    fireEvent.click(submit);
    expect(screen.getByTestId("studio-comment-badge").textContent).toBe("1");

    fireEvent.click(screen.getByTestId("studio-comments-open-panel"));
    fireEvent.click(screen.getByTestId(`studio-comment-delete-${comment.id}`));

    expect(screen.queryByTestId(`studio-comment-item-${comment.id}`)).toBeNull();
    expect(screen.getByTestId("studio-comments-empty-open")).toBeTruthy();
    expect(screen.getByTestId("studio-comment-badge").textContent).toBe("0");
  });

  it("«انتقل للقسم» يبعت القسم المطلوب للكانفس", () => {
    const comment = buildComment({ sectionKey: "hero-0" });
    const onNavigate = vi.fn();
    render(<CanvasHarness initialComments={[comment]} onNavigate={onNavigate} />);

    fireEvent.click(screen.getByTestId("studio-comments-open-panel"));
    fireEvent.click(screen.getByTestId(`studio-comment-goto-${comment.id}`));

    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(onNavigate.mock.calls[0][0].sectionKey).toBe("hero-0");
  });
});

describe("CMT-1 — الزائر لا يرى التعليقات", () => {
  it("رندر المتجر العام بصفر عناصر تعليق حتى لو التعليقات في نفس settings blob", async () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/home"]}>
        <Routes>
          <Route path="/:pageSlug" element={<DynamicStorefrontPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("قسم الزائر")).toBeTruthy();
    });

    expect(
      container.querySelectorAll(
        '[data-studio-comment-layer], [data-studio-comment-item], [data-studio-comments-ui], [data-testid="studio-comment-badge"]',
      ).length,
    ).toBe(0);
    // نص التعليق الداخلي لا يتسرب للصفحة العامة
    expect(container.textContent).not.toContain(VISITOR_COMMENT.text);
  });
});
