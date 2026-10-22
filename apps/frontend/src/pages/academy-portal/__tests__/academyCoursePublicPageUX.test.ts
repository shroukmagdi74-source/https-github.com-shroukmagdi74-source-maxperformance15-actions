import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";
import { formatArabicModules, formatArabicLessons } from "../utils/arabicPlural";
import { buildFaqItems } from "../components/CourseFaqSection";
import { parseLessonScript } from "../components/AcademyScriptViewer";

describe("Ticket UX Course Page — Antigravity Verification", () => {
  describe("1. Arabic Plural Grammar Helper", () => {
    it("should correctly pluralize modules", () => {
      expect(formatArabicModules(0)).toBe("لا توجد وحدات");
      expect(formatArabicModules(1)).toBe("وحدة واحدة");
      expect(formatArabicModules(2)).toBe("وحدتان");
      expect(formatArabicModules(4)).toBe("4 وحدات");
      expect(formatArabicModules(10)).toBe("10 وحدات");
      expect(formatArabicModules(12)).toBe("12 وحدة");
    });

    it("should correctly pluralize lessons (fixing '1 وحدات · 7 درس')", () => {
      expect(formatArabicLessons(0)).toBe("لا توجد دروس");
      expect(formatArabicLessons(1)).toBe("درس واحد");
      expect(formatArabicLessons(2)).toBe("درسان");
      expect(formatArabicLessons(7)).toBe("7 دروس");
      expect(formatArabicLessons(10)).toBe("10 دروس");
      expect(formatArabicLessons(25)).toBe("25 درس");

      const combinedPhrase = `${formatArabicModules(1)} · ${formatArabicLessons(7)}`;
      expect(combinedPhrase).toBe("وحدة واحدة · 7 دروس");
      expect(combinedPhrase).not.toContain("1 وحدات");
      expect(combinedPhrase).not.toContain("7 درس");
    });
  });

  describe("2. Course FAQ Generator & Free Course Protection", () => {
    it("should generate 3 truthful questions for a free course with ZERO mention of price, 0 ج.م, or اشتراك", () => {
      const freeFaq = buildFaqItems(0, true);
      expect(freeFaq).toHaveLength(3);

      const allText = freeFaq.map((f) => `${f.q} ${f.a}`).join(" ");

      expect(allText).not.toContain("0 ج.م");
      expect(allText).not.toContain("0ج.م");
      expect(allText).not.toContain("سعر");
      expect(allText).not.toContain("السعر");
      expect(allText).not.toContain("اشترك");
      expect(allText).not.toContain("اشتراك");
      expect(allText).not.toContain("غالي");
      expect(allText).not.toContain("معنديش وقت لـ7 درس");
      expect(allText).not.toContain("محتاج أفكر.");

      // Check specific questions are present and complete
      expect(freeFaq[0].q).toBe("هل الكورس متاح للبدء فوراً؟");
      expect(freeFaq[1].q).toBe("هل أحتاج لتفريغ وقت طويل لمتابعة الدروس؟");
      expect(freeFaq[2].q).toBe("كيف أستفيد من الكوتش الذكي والتمارين العملية؟");
    });

    it("should generate 3 polished questions for paid courses without broken or truncated phrasing", () => {
      const paidFaq = buildFaqItems(500, false);
      expect(paidFaq).toHaveLength(3);

      const allText = paidFaq.map((f) => `${f.q} ${f.a}`).join(" ");
      expect(allText).not.toContain("غالي —");
      expect(allText).not.toContain("معنديش وقت لـ");
      expect(allText).not.toContain("محتاج أفكر.");

      expect(paidFaq[0].q).toBe("هل الاستثمار في الكورس مناسب لمشروعي؟");
      expect(paidFaq[1].q).toBe("هل أحتاج لتفريغ وقت طويل لمتابعة الدروس؟");
      expect(paidFaq[2].q).toBe("كيف أتأكد أن أسلوب الشرح مناسب لي قبل القرار؟");
    });
  });

  describe("3. Academy Lesson Script Cleaner (parseLessonScript)", () => {
    it("should remove internal production notes, 'قيد الاعتماد', and 'بلا ظهور لأي حد'", () => {
      const rawScript = `
0:00 – 1:30 الهوك مشهد AI — بتسليم وبوابة قابلة للتنفيذ
على الشاشة: شاشة المنصة الرئيسية
[مشهد AI] الكاميرا تزوّم على الشاشة
ملاحظة المنصة: يجب تحديث السيرفر قبل العرض
حالة الإنتاج: قيد الاعتماد لفريق الإخراج
بلا ظهور لأي حد — كروت وشاشات فقط
المعلّق — 0:15: أهلاً بكم في أول خطوة من مسار التسويق العملي.
- واحد — تحديد العرض الرئيسي للعميل
- اتنين — تسعير المنتجات بشكل يحقق ربحية
      `;

      const sections = parseLessonScript(rawScript);
      expect(sections.length).toBeGreaterThan(0);

      const parsedAllText = JSON.stringify(sections);
      expect(parsedAllText).not.toContain("قيد الاعتماد");
      expect(parsedAllText).not.toContain("بلا ظهور لأي حد");
      expect(parsedAllText).not.toContain("ملاحظة المنصة");
      expect(parsedAllText).not.toContain("حالة الإنتاج");
      expect(parsedAllText).not.toContain("الهوك");
      expect(parsedAllText).not.toContain("الكاميرا تزوّم");

      // Verify educational content is preserved
      expect(parsedAllText).toContain("تحديد العرض الرئيسي للعميل");
      expect(parsedAllText).toContain("تسعير المنتجات بشكل يحقق ربحية");
    });
  });

  describe("4. Codebase Static Cleanliness Invariants", () => {
    const portalDir = path.resolve(__dirname, "..");
    const filesToCheck = [
      "AcademyCoursePublicPage.tsx",
      "StudentLessonPlayerPage.tsx",
      "components/VisitorCourseLanding.tsx",
      "components/EnrolledCourseCockpit.tsx",
      "components/CourseFaqSection.tsx",
      "components/CourseCurriculumAccordion.tsx",
      "components/LessonCoachChat.tsx",
    ];

    it("should ensure banned slop, internal production statuses, and broken phrasing are purged", () => {
      for (const relFile of filesToCheck) {
        const fullPath = path.join(portalDir, relFile);
        if (!fs.existsSync(fullPath)) continue;

        const content = fs.readFileSync(fullPath, "utf8");

        // Banned production states
        expect(content, `${relFile} contains "قيد الاعتماد"`).not.toContain("قيد الاعتماد");
        expect(content, `${relFile} contains "بلا ظهور لأي حد"`).not.toContain("بلا ظهور لأي حد");

        // Banned technical jargon
        expect(content, `${relFile} contains "مقيّد بالسكريبت"`).not.toContain("مقيّد بالسكريبت");

        // Banned grammatical flaw
        expect(content, `${relFile} contains "1 وحدات"`).not.toContain("1 وحدات");

        // Banned old broken FAQ questions
        expect(content, `${relFile} contains "غالي — "` ).not.toContain("غالي — ");
        expect(content, `${relFile} contains "معنديش وقت لـ"`).not.toContain("معنديش وقت لـ");
      }
    });

    it("should ensure EnrolledCourseCockpit does NOT contain sales/checkout blocks", () => {
      const cockpitPath = path.join(portalDir, "components/EnrolledCourseCockpit.tsx");
      const content = fs.readFileSync(cockpitPath, "utf8");

      expect(content).not.toContain("السعر الرسمي");
      expect(content).not.toContain("اشترك الآن بـ");
      expect(content).not.toContain("المشكلة الواقعية");
      expect(content).not.toContain("بتفتح مدير الإعلانات");
      expect(content).not.toContain("CourseFaqSection");
      expect(content).not.toContain("AcademyCourseCheckoutModal");
    });
  });
});
