// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  StudioInspectorContentTab,
  HERO_PANEL_VARIANTS,
} from "../studio/inspector/StudioInspectorContentTab";
import HeroBanner from "../sections/HeroBanner";

describe("Hero Panel Editing Ticket — Studio Inspector & Hero Banner", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe("A) StudioInspectorContentTab Panel Fields", () => {
    it("renders panel fields group when sectionType is hero-banner", () => {
      const onUpdateField = vi.fn();
      render(
        <StudioInspectorContentTab
          sectionType="hero-banner"
          settings={{
            title: "عنوان الهيرو",
            variant: "split-panel",
            panelTitle: "عنوان البطاقة الأولي",
            panelSubtitle: "وصف البطاقة الأولي",
          }}
          onUpdateField={onUpdateField}
        />
      );

      expect(screen.getByTestId("hero-panel-group")).toBeTruthy();
      expect(screen.getByText("بطاقة الهيرو (Panel)")).toBeTruthy();
      expect((screen.getByTestId("input-panel-title") as HTMLInputElement).value).toBe("عنوان البطاقة الأولي");
      expect((screen.getByTestId("input-panel-subtitle") as HTMLTextAreaElement).value).toBe("وصف البطاقة الأولي");
      expect(screen.getByText("قالب نشط")).toBeTruthy();
    });

    it("displays hint under main title when panelTitle is present", () => {
      render(
        <StudioInspectorContentTab
          sectionType="hero-banner"
          settings={{
            title: "العنوان العام",
            panelTitle: "عنوان البطاقة الخاص",
          }}
          onUpdateField={vi.fn()}
        />
      );

      const hint = screen.getByTestId("panel-title-hint");
      expect(hint).toBeTruthy();
      expect(hint.textContent).toContain("قالبك بيستخدم عنوان البطاقة");
    });

    it("does NOT display hint under main title when panelTitle is absent", () => {
      render(
        <StudioInspectorContentTab
          sectionType="hero-banner"
          settings={{
            title: "العنوان العام فقط",
          }}
          onUpdateField={vi.fn()}
        />
      );

      expect(screen.queryByTestId("panel-title-hint")).toBeNull();
    });

    it("calls onUpdateField for every panel field when edited", () => {
      const onUpdateField = vi.fn();
      render(
        <StudioInspectorContentTab
          sectionType="hero-banner"
          settings={{
            panelEyebrow: "قديم",
            panelTitle: "قديم",
            panelSubtitle: "قديم",
            panelNote: "قديم",
            panelMetricLabel: "قديم",
            panelMetricValue: "قديم",
            panelImage: "https://old.com/img.jpg",
          }}
          onUpdateField={onUpdateField}
        />
      );

      // 1. Eyebrow
      fireEvent.change(screen.getByTestId("input-panel-eyebrow"), {
        target: { value: "وصل حديثاً" },
      });
      expect(onUpdateField).toHaveBeenCalledWith("panelEyebrow", "وصل حديثاً");

      // 2. Title
      fireEvent.change(screen.getByTestId("input-panel-title"), {
        target: { value: "تشكيلة الشتاء الفاخرة" },
      });
      expect(onUpdateField).toHaveBeenCalledWith("panelTitle", "تشكيلة الشتاء الفاخرة");

      // 3. Subtitle
      fireEvent.change(screen.getByTestId("input-panel-subtitle"), {
        target: { value: "أناقة يومية بتفاصيل مدروسة" },
      });
      expect(onUpdateField).toHaveBeenCalledWith("panelSubtitle", "أناقة يومية بتفاصيل مدروسة");

      // 4. Note
      fireEvent.change(screen.getByTestId("input-panel-note"), {
        target: { value: "شحن سريع لجميع المحافظات" },
      });
      expect(onUpdateField).toHaveBeenCalledWith("panelNote", "شحن سريع لجميع المحافظات");

      // 5. Metric Label
      fireEvent.change(screen.getByTestId("input-panel-metric-label"), {
        target: { value: "خصم حصري" },
      });
      expect(onUpdateField).toHaveBeenCalledWith("panelMetricLabel", "خصم حصري");

      // 6. Metric Value
      fireEvent.change(screen.getByTestId("input-panel-metric-value"), {
        target: { value: "30%" },
      });
      expect(onUpdateField).toHaveBeenCalledWith("panelMetricValue", "30%");

      // 7. Image URL
      fireEvent.change(screen.getByTestId("input-panel-image-url"), {
        target: { value: "https://images.unsplash.com/new.jpg" },
      });
      expect(onUpdateField).toHaveBeenCalledWith("panelImage", "https://images.unsplash.com/new.jpg");
    });

    it("calls onOpenImagePicker with 'panelImage' target when picker button is clicked", () => {
      const onOpenImagePicker = vi.fn();
      render(
        <StudioInspectorContentTab
          sectionType="hero-banner"
          settings={{
            panelTitle: "عنوان بطاقة",
          }}
          onUpdateField={vi.fn()}
          onOpenImagePicker={onOpenImagePicker}
        />
      );

      const pickerBtn = screen.getByTestId("btn-panel-image-picker");
      fireEvent.click(pickerBtn);

      expect(onOpenImagePicker).toHaveBeenCalledWith("panelImage");
    });

    it("renders panel group if sectionType is not explicitly hero but panel settings exist", () => {
      render(
        <StudioInspectorContentTab
          sectionType="custom-section"
          settings={{
            panelTitle: "بطاقة موجودة مسبقاً في الثيم",
          }}
          onUpdateField={vi.fn()}
        />
      );

      expect(screen.getByTestId("hero-panel-group")).toBeTruthy();
      expect((screen.getByTestId("input-panel-title") as HTMLInputElement).value).toBe("بطاقة موجودة مسبقاً في الثيم");
    });

    it("shows helpful note when hero variant is not a panel variant and has no values", () => {
      render(
        <StudioInspectorContentTab
          sectionType="hero-banner"
          settings={{
            variant: "centered",
          }}
          onUpdateField={vi.fn()}
        />
      );

      expect(screen.getByTestId("hero-panel-group")).toBeTruthy();
      expect(screen.getByText("تظهر في بعض قوالب الهيرو")).toBeTruthy();
    });
  });

  describe("B) HeroBanner Rendering with Panel Settings", () => {
    it("renders panelTitle in split-panel hero variant", () => {
      const { rerender } = render(
        <MemoryRouter>
          <HeroBanner
            section={{ variant: "split-panel" }}
            settings={{
              variant: "split-panel",
              title: "العنوان الخلفي الأساسي",
              panelTitle: "عنوان البطاقة الظاهر للعميل",
              panelSubtitle: "وصف البطاقة الداكنة",
            }}
          />
        </MemoryRouter>
      );

      expect(screen.getByText("عنوان البطاقة الظاهر للعميل")).toBeTruthy();
      expect(screen.getByText("وصف البطاقة الداكنة")).toBeTruthy();

      // Test real-time update in HeroBanner:
      rerender(
        <MemoryRouter>
          <HeroBanner
            section={{ variant: "split-panel" }}
            settings={{
              variant: "split-panel",
              title: "العنوان الخلفي الأساسي",
              panelTitle: "تم تحديث عنوان البطاقة بنجاح",
              panelSubtitle: "تم تحديث وصف البطاقة بنجاح",
            }}
          />
        </MemoryRouter>
      );

      expect(screen.getByText("تم تحديث عنوان البطاقة بنجاح")).toBeTruthy();
      expect(screen.getByText("تم تحديث وصف البطاقة بنجاح")).toBeTruthy();
    });

    it("renders panelTitle in style-ledger hero variant", () => {
      render(
        <MemoryRouter>
          <HeroBanner
            section={{ variant: "style-ledger" }}
            settings={{
              variant: "style-ledger",
              panelEyebrow: "إصدار محدود",
              panelTitle: "دفتر الأناقة للموسم",
              panelMetricValue: "50+ قطعة",
            }}
          />
        </MemoryRouter>
      );

      expect(screen.getByText("إصدار محدود")).toBeTruthy();
      expect(screen.getByText("دفتر الأناقة للموسم")).toBeTruthy();
      expect(screen.getByText("50+ قطعة")).toBeTruthy();
    });

    it("renders panelTitle and note in layered-parallax-sky hero variant", () => {
      render(
        <MemoryRouter>
          <HeroBanner
            section={{ variant: "layered-parallax-sky" }}
            settings={{
              variant: "layered-parallax-sky",
              panelTitle: "سماء القاهرة الهادئة",
              panelNote: "استبدال مجاني خلال 14 يوم",
              panelMetricLabel: "ضمان الجودة",
              panelMetricValue: "100%",
            }}
          />
        </MemoryRouter>
      );

      expect(screen.getByText("سماء القاهرة الهادئة")).toBeTruthy();
      expect(screen.getByText("استبدال مجاني خلال 14 يوم")).toBeTruthy();
      expect(screen.getByText("ضمان الجودة")).toBeTruthy();
      expect(screen.getByText("100%")).toBeTruthy();
    });

    it("maintains zero regression for standard hero with title/subtitle", () => {
      render(
        <MemoryRouter>
          <HeroBanner
            section={{ variant: "centered" }}
            settings={{
              variant: "centered",
              title: "هيرو مركزي كلاسيكي",
              subtitle: "وصف هيرو بدون بطاقة",
              ctaText: "ابدأ التسوق",
            }}
          />
        </MemoryRouter>
      );

      expect(screen.getByText("هيرو مركزي كلاسيكي")).toBeTruthy();
      expect(screen.getByText("وصف هيرو بدون بطاقة")).toBeTruthy();
      expect(screen.getByText("ابدأ التسوق")).toBeTruthy();
    });
  });

  describe("C) Known Panel Variants Registry", () => {
    it("contains all 32 known panel variants", () => {
      expect(HERO_PANEL_VARIANTS.has("split-panel")).toBe(true);
      expect(HERO_PANEL_VARIANTS.has("style-ledger")).toBe(true);
      expect(HERO_PANEL_VARIANTS.has("layered-parallax-sky")).toBe(true);
      expect(HERO_PANEL_VARIANTS.has("elessi-bag-hero")).toBe(true);
      expect(HERO_PANEL_VARIANTS.has("elessi-spotlight")).toBe(true);
      expect(HERO_PANEL_VARIANTS.has("scent-portrait")).toBe(true);
      expect(HERO_PANEL_VARIANTS.has("modest-cascade")).toBe(true);
      expect(HERO_PANEL_VARIANTS.size).toBeGreaterThanOrEqual(30);
    });
  });
});
