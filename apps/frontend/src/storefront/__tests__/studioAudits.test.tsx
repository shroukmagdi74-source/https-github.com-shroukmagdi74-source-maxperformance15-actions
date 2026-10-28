// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import {
  calculateContrastRatio,
  getRelativeLuminance,
  parseColor,
  auditA11y,
} from "../studio/utils/a11yAudit";
import { auditSeo } from "../studio/utils/seoAudit";
import { auditLinks, validateLink } from "../studio/utils/linkAudit";
import {
  runPrepublishChecks,
  StudioPageSettingsPanel,
} from "../studio/StudioPageSettingsPanel";

describe("QA-1: Studio Audits (A11y, SEO, Links & Prepublish Integration)", () => {
  afterEach(() => {
    cleanup();
  });
  // ==========================================
  // 1. Accessibility (A11y) Contrast Ratio
  // ==========================================
  it("computes contrast ratio correctly: #777 on #fff fails (< 4.5), #000 on #fff succeeds (= 21)", () => {
    // #777 on #fff
    const ratio777 = calculateContrastRatio("#777", "#fff");
    expect(ratio777).toBeLessThan(4.5);
    expect(ratio777).toBeCloseTo(4.48, 1);

    // #000 on #fff
    const ratio000 = calculateContrastRatio("#000", "#fff");
    expect(ratio000).toBe(21);
  });

  it("audits section text contrast and reports failure for #777 on #fff with clear message", () => {
    const sections = [
      {
        key: "sec-hero",
        type: "hero",
        label: "القسم الرئيسي",
        settings: {
          title: "عنوان ترحيبي",
          textColor: "#777777",
          backgroundColor: "#ffffff",
          isLargeText: false,
        },
      },
    ];

    const result = auditA11y({ sections });
    expect(result.passed).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);

    const contrastIssue = result.issues.find((i) => i.type === "contrast");
    expect(contrastIssue).toBeDefined();
    expect(contrastIssue?.severity).toBe("fail");
    expect(contrastIssue?.ratio).toBeLessThan(4.5);
    expect(contrastIssue?.message).toContain("فشل التباين");
    expect(contrastIssue?.message).toContain("WCAG AA");
  });

  it("permits lower 3:1 contrast ratio for large text headings", () => {
    // A color with contrast ratio ~3.5:1
    const sections = [
      {
        key: "sec-heading-large",
        type: "hero",
        label: "بانر عريض",
        settings: {
          title: "عنوان كبير",
          textColor: "#666666",
          backgroundColor: "#ffffff",
          fontSize: 32,
          isLargeText: true,
        },
      },
    ];

    const ratio = calculateContrastRatio("#666666", "#ffffff");
    expect(ratio).toBeGreaterThanOrEqual(3.0);

    const result = auditA11y({ sections });
    const contrastIssue = result.issues.find((i) => i.sectionKey === "sec-heading-large");
    expect(contrastIssue).toBeUndefined();
  });

  // ==========================================
  // 2. Accessibility: Images Without Alt
  // ==========================================
  it("flags missing alt on direct section images and nested items", () => {
    const sections = [
      {
        key: "sec-img",
        label: "معرض الصور",
        settings: {
          image: "https://example.com/banner.jpg",
          alt: "   ", // whitespace only
          items: [
            { image: "https://example.com/item1.jpg", alt: "" },
            { image: "https://example.com/item2.jpg", alt: "صورة مقبولة" },
          ],
        },
      },
    ];

    const result = auditA11y({ sections });
    const altIssues = result.issues.filter((i) => i.type === "alt");
    expect(altIssues.length).toBe(2);
    expect(altIssues[0]?.severity).toBe("fail");
    expect(altIssues[0]?.message).toContain("بدون نص بديل");
  });

  // ==========================================
  // 3. Accessibility: Heading Hierarchy & Skipped Levels
  // ==========================================
  it("flags skipped heading levels when page has h1 then h3 directly (تجاوز مستوى)", () => {
    const sections = [
      {
        key: "sec-h1",
        label: "الترويسة",
        settings: {
          title: "العنوان الرئيسي الأول",
          headingLevel: "h1",
        },
      },
      {
        key: "sec-h3",
        label: "الميزات",
        settings: {
          title: "تفاصيل الميزة الفرعية",
          headingLevel: "h3",
        },
      },
    ];

    const result = auditA11y({ sections });
    const skipIssue = result.issues.find(
      (i) => i.type === "heading-order" && i.message.includes("تجاوز مستوى")
    );
    expect(skipIssue).toBeDefined();
    expect(skipIssue?.severity).toBe("warn");
    expect(skipIssue?.message).toContain("تجاوز مستوى");
    expect(skipIssue?.sectionKey).toBe("sec-h3");
  });

  it("warns when page has multiple H1 headings or no H1 heading", () => {
    const multiH1Sections = [
      { key: "h1-a", settings: { title: "Title 1", headingLevel: "h1" } },
      { key: "h1-b", settings: { title: "Title 2", headingLevel: "h1" } },
    ];
    const multiRes = auditA11y({ sections: multiH1Sections });
    expect(multiRes.issues.some((i) => i.message.includes("تكرار عنوان H1"))).toBe(true);

    const noH1Sections = [
      { key: "h2-a", settings: { title: "Title 1", headingLevel: "h2" } },
    ];
    const noRes = auditA11y({ sections: noH1Sections });
    expect(noRes.issues.some((i) => i.message.includes("لا يوجد عنوان رئيسي H1"))).toBe(true);
  });

  // ==========================================
  // 4. Accessibility: Buttons & Touch Targets
  // ==========================================
  it("detects unlabeled buttons and small touch targets (< 40px)", () => {
    const sections = [
      {
        key: "sec-cta",
        label: "قسم الشراء",
        settings: {
          buttonLink: "/shop",
          buttonText: "   ", // empty label
          buttonHeight: 32, // < 40px
        },
      },
    ];

    const result = auditA11y({ sections });
    const btnLabelIssue = result.issues.find((i) => i.type === "button-label");
    expect(btnLabelIssue).toBeDefined();
    expect(btnLabelIssue?.severity).toBe("fail");

    const touchIssue = result.issues.find((i) => i.type === "touch-target");
    expect(touchIssue).toBeDefined();
    expect(touchIssue?.severity).toBe("warn");
    expect(touchIssue?.message).toContain("40px");
  });

  // ==========================================
  // 5. SEO: Title Length & Description Length
  // ==========================================
  it("warns when SEO title has 20 characters with message 'أقصر من 30'", () => {
    const shortTitle = "12345678901234567890"; // exactly 20 chars
    expect(shortTitle.length).toBe(20);

    const result = auditSeo({
      pageTitle: shortTitle,
      seo: { title: shortTitle },
      sections: [],
    });

    const titleIssue = result.issues.find((i) => i.type === "title");
    expect(titleIssue).toBeDefined();
    expect(titleIssue?.severity).toBe("warn");
    expect(titleIssue?.message).toContain("أقصر من 30");
  });

  it("validates SEO description length: warns if < 70 or > 160, passes between 70-160", () => {
    // Short desc
    const shortRes = auditSeo({
      pageTitle: "عنوان متجر مميز للأزياء الرجالية الفاخرة",
      seo: { description: "وصف قصير جدا" },
    });
    const shortDescIssue = shortRes.issues.find((i) => i.type === "description");
    expect(shortDescIssue?.severity).toBe("warn");
    expect(shortDescIssue?.message).toContain("أقصر من 70");

    // Ideal desc (e.g. 80 chars)
    const idealText = "متجر متكامل يقدم أرقى الأزياء العصرية بجودة استثنائية وأسعار تنافسية مع شحن سريع";
    const idealRes = auditSeo({
      pageTitle: "عنوان متجر مميز للأزياء الرجالية الفاخرة",
      seo: { description: idealText },
    });
    const idealDescIssue = idealRes.issues.find((i) => i.type === "description");
    expect(idealDescIssue?.severity).toBe("pass");
  });

  // ==========================================
  // 6. SEO: Duplicate Headings & Missing OG Image
  // ==========================================
  it("detects duplicate section headings on the same page", () => {
    const sections = [
      { key: "sec-1", label: "قسم 1", settings: { title: "أحدث المنتجات والعروض" } },
      { key: "sec-2", label: "قسم 2", settings: { title: "أحدث المنتجات والعروض" } },
    ];

    const result = auditSeo({
      pageTitle: "عنوان الصفحة المميز الذي يفي بمتطلبات محركات البحث",
      sections,
    });

    const dupIssue = result.issues.find((i) => i.type === "duplicate-heading");
    expect(dupIssue).toBeDefined();
    expect(dupIssue?.severity).toBe("warn");
    expect(dupIssue?.message).toContain("عنوان مكرر");
  });

  it("flags missing Open Graph (OG) image", () => {
    const result = auditSeo({
      pageTitle: "عنوان الصفحة المناسب لمحركات البحث والزوّار",
      seo: { ogImage: "" },
    });
    const ogIssue = result.issues.find((i) => i.type === "missing-og");
    expect(ogIssue).toBeDefined();
    expect(ogIssue?.severity).toBe("warn");
    expect(ogIssue?.message).toContain("OG Image");
  });

  // ==========================================
  // 7. Link Audit: Internal & Broken Routes
  // ==========================================
  it("validates links: /not-a-page reports error, /shop reports nothing", () => {
    // /not-a-page -> fail
    const errorIssue = validateLink("/not-a-page", {
      sectionKey: "sec-cta",
      sectionLabel: "زر الشراء",
      availablePages: ["about", "terms"],
    });
    expect(errorIssue).not.toBeNull();
    expect(errorIssue?.severity).toBe("fail");
    expect(errorIssue?.type).toBe("unknown-route");
    expect(errorIssue?.cleanPath).toBe("not-a-page");

    // /shop -> passes (null)
    const validIssue = validateLink("/shop", {
      sectionKey: "sec-cta",
      sectionLabel: "زر الشراء",
      availablePages: ["about", "terms"],
    });
    expect(validIssue).toBeNull();
  });

  it("flags empty links and '#' placeholder links without network requests", () => {
    const sections = [
      {
        key: "sec-links",
        label: "الروابط السريعة",
        settings: {
          items: [
            { link: "" },
            { link: "#" },
            { link: "https://external-domain.com" }, // external link should pass
            { link: "mailto:support@maxp.online" }, // mailto should pass
          ],
        },
      },
    ];

    const result = auditLinks({ sections, availablePages: [] });
    expect(result.brokenLinksCount).toBe(2);
    expect(result.issues.some((i) => i.type === "empty-link")).toBe(true);
    expect(result.issues.some((i) => i.type === "placeholder-hash")).toBe(true);
  });

  // ==========================================
  // 8. Prepublish Check Integration & PAGE-1.2 Compatibility
  // ==========================================
  it("runPrepublishChecks preserves existing PAGE-1.2 checks and appends deep audits", () => {
    const results = runPrepublishChecks({
      pageKey: "home",
      pageTitle: "عنوان قصير", // < 30 chars
      seo: { title: "عنوان قصير" },
      sections: [
        {
          key: "sec-test",
          label: "قسم تجريبي",
          settings: {
            title: "عنوان",
            headingLevel: "h1",
            textColor: "#777",
            backgroundColor: "#fff",
            link: "/not-a-page",
          },
        },
      ],
      availablePages: ["shop"],
    });

    // Check basic PAGE-1.2 checks still exist
    expect(results.some((r) => r.id === "title")).toBe(true);
    expect(results.some((r) => r.id === "description")).toBe(true);
    expect(results.some((r) => r.id === "sections")).toBe(true);

    // Check deep A11y contrast failure is attached
    expect(results.some((r) => r.id.startsWith("a11y-contrast"))).toBe(true);

    // Check deep link failure for /not-a-page is attached
    expect(results.some((r) => r.id.includes("not-a-page"))).toBe(true);

    // Check deep SEO short title warning is attached
    expect(results.some((r) => r.id === "seo-seo-title-short")).toBe(true);
  });

  // ==========================================
  // 9. Prepublish Panel UI & 'انتقل للمشكلة' Interaction
  // ==========================================
  it("renders prepublish results in StudioPageSettingsPanel and triggers 'انتقل للمشكلة' with section key", () => {
    const onSelectSection = vi.fn();

    render(
      <StudioPageSettingsPanel
        isOpen={true}
        onClose={vi.fn()}
        pageKey="home"
        pageTitle="متجر MaxP"
        sections={[
          {
            key: "sec-problematic",
            label: "قسم البنر الرئيسي",
            settings: {
              title: "عنوان البنر",
              textColor: "#777",
              backgroundColor: "#fff",
              buttonLink: "/unknown-target",
            },
          },
        ]}
        availablePages={["shop"]}
        onUpdateSeo={vi.fn()}
        onUpdateStatus={vi.fn()}
        onSelectSection={onSelectSection}
      />
    );

    // Open Prepublish tab
    const prepublishTabBtn = screen.getAllByText("فحص قبل النشر")[0]!;
    fireEvent.click(prepublishTabBtn);

    // Look for jump to problem button
    const jumpButtons = screen.getAllByText("انتقل للمشكلة");
    expect(jumpButtons.length).toBeGreaterThan(0);

    // Click the jump button
    fireEvent.click(jumpButtons[0]!);
    expect(onSelectSection).toHaveBeenCalledWith("sec-problematic");
  });

  it("filters prepublish results by severity tabs (الكل, أخطاء, تحذيرات, ناجحة)", () => {
    render(
      <StudioPageSettingsPanel
        isOpen={true}
        onClose={vi.fn()}
        pageKey="landing"
        pageTitle="صفحة الهبوط"
        sections={[
          {
            key: "sec-valid",
            label: "قسم سليم",
            settings: {
              title: "عنوان واضح",
              headingLevel: "h1",
              textColor: "#000000",
              backgroundColor: "#ffffff",
              link: "/shop",
            },
          },
        ]}
        availablePages={["shop"]}
        onUpdateSeo={vi.fn()}
        onUpdateStatus={vi.fn()}
      />
    );

    // Switch to Prepublish tab
    const prepublishTabBtn = screen.getAllByText("فحص قبل النشر")[0]!;
    fireEvent.click(prepublishTabBtn);

    // Check filter pills exist
    expect(screen.getByText(/الكل/)).toBeDefined();
    expect(screen.getByText(/أخطاء/)).toBeDefined();
    expect(screen.getByText(/تحذيرات/)).toBeDefined();
    expect(screen.getByText(/ناجحة/)).toBeDefined();

    // Click 'ناجحة' filter
    const passBtn = screen.getByText(/ناجحة/);
    fireEvent.click(passBtn);
  });
});
