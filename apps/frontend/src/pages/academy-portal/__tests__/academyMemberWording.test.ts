import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";

describe("Academy Portal Member Wording Ticket (UX/Content)", () => {
  const portalDir = path.resolve(__dirname, "..");

  it("1. StudentPortalLayout has member-oriented branding, nav, default name, and zero 'طالب'", () => {
    const filePath = path.join(portalDir, "StudentPortalLayout.tsx");
    const content = fs.readFileSync(filePath, "utf-8");

    expect(content).toContain("أكاديمية أصحاب الأعمال");
    expect(content).toContain("دخول الأعضاء");
    expect(content).toContain('"عضو MaxP"');
    expect(content).not.toContain("بوابة الطالب الذكية");
    expect(content).not.toContain("دخول الطالب");
    expect(content).not.toContain('"طالب ماكس بي"');
    expect(content).not.toContain("والطلاب");
    expect(content).not.toMatch(/[\u0600-\u06FF]*طالب[\u0600-\u06FF]*/);
  });

  it("2. StudentLoginPage header says 'تسجيل الدخول' with zero 'طالب'", () => {
    const filePath = path.join(portalDir, "StudentLoginPage.tsx");
    const content = fs.readFileSync(filePath, "utf-8");

    expect(content).toContain('"تسجيل الدخول"');
    expect(content).not.toContain("تسجيل دخول الطالب");
    expect(content).not.toMatch(/[\u0600-\u06FF]*طالب[\u0600-\u06FF]*/);
  });

  it("3. StudentMyCoursesPage badge says 'لوحة التعلّم' with zero 'طالب'", () => {
    const filePath = path.join(portalDir, "StudentMyCoursesPage.tsx");
    const content = fs.readFileSync(filePath, "utf-8");

    expect(content).toContain("لوحة التعلّم");
    expect(content).not.toContain("لوحة تعلم الطالب");
    expect(content).not.toMatch(/[\u0600-\u06FF]*طالب[\u0600-\u06FF]*/);
  });

  it("4. StudentLessonPlayerPage watermark uses 'عضو MaxP' and exercise CTA uses 'للأعضاء المشتركين'", () => {
    const filePath = path.join(portalDir, "StudentLessonPlayerPage.tsx");
    const content = fs.readFileSync(filePath, "utf-8");

    expect(content).toContain('"عضو MaxP"');
    expect(content).toContain("للأعضاء المشتركين");
    expect(content).not.toContain('"طالب ماكس بي"');
    expect(content).not.toContain("للطلاب المشتركين");
    expect(content).not.toMatch(/[\u0600-\u06FF]*طالب[\u0600-\u06FF]*/);
  });

  it("5. VisitorCourseLanding uses 'عضو MaxP' with 'حسابك مسجّل' and zero 'طالب'", () => {
    const filePath = path.join(portalDir, "components", "VisitorCourseLanding.tsx");
    const content = fs.readFileSync(filePath, "utf-8");

    expect(content).toContain('"عضو MaxP"');
    expect(content).toContain("حسابك مسجّل في الأكاديمية");
    expect(content).not.toContain('"طالب ماكس بي"');
    expect(content).not.toMatch(/[\u0600-\u06FF]*طالب[\u0600-\u06FF]*/);
  });

  it("6. Complete sweep across all academy portal files: zero 'طالب' or 'طلاب' or 'طلبة'", () => {
    function getAllFiles(dir: string, fileList: string[] = []): string[] {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          if (file !== "node_modules" && file !== "__tests__") {
            getAllFiles(fullPath, fileList);
          }
        } else if (/\.(tsx|ts)$/.test(file)) {
          fileList.push(fullPath);
        }
      }
      return fileList;
    }

    const files = getAllFiles(portalDir);
    const violations: { file: string; match: string }[] = [];
    const forbiddenRegex = /[\u0600-\u06FF]*(طالب|طلاب|طلبة)[\u0600-\u06FF]*/g;

    for (const f of files) {
      const text = fs.readFileSync(f, "utf-8");
      const matches = text.match(forbiddenRegex);
      if (matches) {
        violations.push({
          file: path.relative(portalDir, f),
          match: matches.join(", "),
        });
      }
    }

    expect(violations).toEqual([]);
  });
});
