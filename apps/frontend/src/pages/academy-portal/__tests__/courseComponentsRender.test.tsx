import { describe, expect, it, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { VisitorCourseLanding } from "../components/VisitorCourseLanding";
import { EnrolledCourseCockpit } from "../components/EnrolledCourseCockpit";
import { ModuleItem } from "../components/CourseCurriculumAccordion";

const mockModules: ModuleItem[] = [
  {
    id: "mod-1",
    title: "الوحدة الأولى: البداية والتأسيس",
    description: "مقدمة شاملة",
    sortOrder: 1,
    lessons: [
      {
        id: "les-1",
        title: "الدرس 1: فهم عميلك الحقيقي",
        durationMin: 7,
        isFreePreview: true,
        isUnlocked: true,
        progress: { status: "DONE" },
      },
      {
        id: "les-2",
        title: "الدرس 2: صياغة العرض والسعر",
        durationMin: 9,
        isFreePreview: true,
        isUnlocked: true,
        progress: { status: "IN_PROGRESS" },
      },
      {
        id: "les-3",
        title: "الدرس 3: إطلاق أول إعلان",
        durationMin: 11,
        isFreePreview: false,
        isUnlocked: false,
        progress: { status: "NOT_STARTED" },
      },
    ],
  },
];

describe("Course Components DOM Rendering Tests", () => {
  describe("VisitorCourseLanding — Free Course", () => {
    it("should render clean Free Course UI with ZERO price/اشترك mentions and exactly 1 primary CTA", () => {
      const { container } = render(
        <BrowserRouter>
          <VisitorCourseLanding
            course={{
              id: "free-course-1",
              title: "كورس خبير التسويق الرقمي",
              description: "كورس عملي من الصفر",
              price: 0,
              freePreviewLessons: 3,
            }}
            modules={mockModules}
            totalLessons={3}
            freeLessons={3}
            firstLesson={mockModules[0].lessons[0]}
            isLoggedIn={false}
            studentName={null}
            studentPhone={null}
            copiedShare={false}
            onShare={vi.fn()}
            onCheckout={vi.fn()}
          />
        </BrowserRouter>
      );

      const html = container.innerHTML;

      // 1. Grammatically correct chips
      expect(html).toContain("وحدة واحدة · 3 دروس");
      expect(html).not.toContain("1 وحدات");

      // 2. Strict Free Course DOM Rules: ZERO price, 0 ج.م, or اشترك
      expect(html).not.toContain("0 ج.م");
      expect(html).not.toContain("0ج.م");
      expect(html).not.toContain("السعر الرسمي");
      expect(html).not.toContain("اشترك الآن");
      expect(html).not.toContain("اشترك");

      // 3. Exactly one primary action: "ابدأ مجانًا"
      const startFreeBtn = screen.getByRole("link", { name: /ابدأ مجانًا/i });
      expect(startFreeBtn).toBeDefined();

      // 4. Zero internal production tags
      expect(html).not.toContain("قيد الاعتماد");
      expect(html).not.toContain("بلا ظهور لأي حد");
      expect(html).not.toContain("مقيّد بالسكريبت");
    });
  });

  describe("VisitorCourseLanding — Paid Course", () => {
    it("should render Paid Course with single checkout CTA and preview option", () => {
      const { container } = render(
        <BrowserRouter>
          <VisitorCourseLanding
            course={{
              id: "paid-course-1",
              title: "كورس ماكس بي للمحترفين",
              description: "مسار مدفوع متقدم",
              price: 500,
              freePreviewLessons: 2,
            }}
            modules={mockModules}
            totalLessons={3}
            freeLessons={2}
            firstLesson={mockModules[0].lessons[0]}
            isLoggedIn={false}
            studentName={null}
            studentPhone={null}
            copiedShare={false}
            onShare={vi.fn()}
            onCheckout={vi.fn()}
          />
        </BrowserRouter>
      );

      const html = container.innerHTML;

      expect(html).toContain("500 ج.م");
      expect(html).toContain("معاينة أول درس");
      expect(html).toContain("وحدة واحدة · 3 دروس");

      // Zero internal production tags
      expect(html).not.toContain("قيد الاعتماد");
      expect(html).not.toContain("بلا ظهور لأي حد");
      expect(html).not.toContain("مقيّد بالسكريبت");
    });
  });

  describe("EnrolledCourseCockpit — Active Student", () => {
    it("should render clean learning cockpit and HIDE all sales/pricing/FAQ sections", () => {
      const { container } = render(
        <BrowserRouter>
          <EnrolledCourseCockpit
            course={{
              id: "enrolled-course-1",
              title: "كورس ماكس بي الشامل",
              description: "مسار التعلم",
              price: 500,
              freePreviewLessons: 2,
            }}
            modules={mockModules}
            totalLessons={3}
            certificate={null}
            enrollmentId="enr-123"
            copiedShare={false}
            onShare={vi.fn()}
          />
        </BrowserRouter>
      );

      const html = container.innerHTML;

      // 1. Learning Cockpit Header & Progress
      expect(html).toContain("مشترك نشط");
      expect(html).toContain("أنجزت 1 من 3 دروس");
      expect(html).toContain("33%");

      // 2. Resume Single Primary Action
      expect(html).toContain("أكمل التعلم: الدرس 2: صياغة العرض والسعر");

      // 3. AI Coach Guidance Card
      expect(html).toContain("الكوتش الذكي يرافقك في كل خطوة");

      // 4. Strict Elimination of All Sales Blocks
      expect(html).not.toContain("السعر الرسمي");
      expect(html).not.toContain("اشترك الآن");
      expect(html).not.toContain("المشكلة الواقعية");
      expect(html).not.toContain("بتفتح مدير الإعلانات");
      expect(html).not.toContain("الأسئلة الشائعة");
    });
  });
});
