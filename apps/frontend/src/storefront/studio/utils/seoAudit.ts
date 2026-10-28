/**
 * seoAudit.ts
 * Pure SEO auditor for MaxP Storefront Studio pages.
 * Evaluates:
 * 1. Title length (recommended 30-60 characters)
 * 2. Meta description length (recommended 70-160 characters)
 * 3. Duplicate section headings
 * 4. Missing H1 heading
 * 5. Missing Open Graph (OG) image
 * 6. Zero images without alt text
 */

export interface SeoIssue {
  id: string;
  type: "title" | "description" | "duplicate-heading" | "missing-h1" | "missing-og" | "missing-alt";
  severity: "pass" | "warn" | "fail";
  message: string;
  sectionKey?: string;
  sectionLabel?: string;
  details?: Record<string, unknown>;
}

export interface SeoAuditResult {
  passed: boolean;
  issues: SeoIssue[];
  summary: {
    titleLength: number;
    descriptionLength: number;
    hasH1: boolean;
    hasOgImage: boolean;
    duplicateHeadingsCount: number;
    missingAltCount: number;
    errorsCount: number;
    warningsCount: number;
  };
}

export interface AuditSeoParams {
  pageTitle?: string;
  seo?: {
    title?: string;
    description?: string;
    ogImage?: string;
    keywords?: string;
    canonical?: string;
    noindex?: boolean;
    [key: string]: any;
  } | any;
  sections?: any[];
}

/**
 * Runs a pure SEO audit on page title, metadata, and sections.
 */
export function auditSeo(params: AuditSeoParams): SeoAuditResult {
  const { pageTitle, seo = {}, sections = [] } = params;
  const issues: SeoIssue[] = [];

  const rawTitle = seo?.title?.trim() || pageTitle?.trim() || "";
  const titleLength = rawTitle.length;

  // 1. Title Length Audit (30 - 60 chars)
  if (!rawTitle) {
    issues.push({
      id: "seo-title-missing",
      type: "title",
      severity: "fail",
      message: "عنوان الصفحة ومحركات البحث مفقود بالكامل — يجب إضافة عنوان للصفحة.",
      details: { length: 0 },
    });
  } else if (titleLength < 30) {
    issues.push({
      id: "seo-title-short",
      type: "title",
      severity: "warn",
      message: `عنوان الصفحة أقصر من 30 حرفاً (${titleLength}/60) — يُنصح بأن يتراوح بين 30 و60 حرفاً للظهور الأمثل في نتائج البحث.`,
      details: { length: titleLength, minRecommended: 30, maxRecommended: 60 },
    });
  } else if (titleLength > 60) {
    issues.push({
      id: "seo-title-long",
      type: "title",
      severity: "warn",
      message: `عنوان الصفحة أطول من 60 حرفاً (${titleLength}/60) — قد يتم اقتطاع العنوان في نتائج بحث جوجل.`,
      details: { length: titleLength, maxRecommended: 60 },
    });
  } else {
    issues.push({
      id: "seo-title-ok",
      type: "title",
      severity: "pass",
      message: `طول عنوان الصفحة مثالي ومطابق لمعايير محركات البحث (${titleLength}/60 حرف).`,
      details: { length: titleLength },
    });
  }

  // 2. Meta Description Length Audit (70 - 160 chars)
  const rawDesc = seo?.description?.trim() || "";
  const descLength = rawDesc.length;

  if (!rawDesc) {
    issues.push({
      id: "seo-desc-missing",
      type: "description",
      severity: "warn",
      message: "وصف محركات البحث (Meta Description) مفقود — يُنصح بإضافته لتحسين نسبة النقر في نتائج البحث.",
      details: { length: 0 },
    });
  } else if (descLength < 70) {
    issues.push({
      id: "seo-desc-short",
      type: "description",
      severity: "warn",
      message: `وصف الصفحة أقصر من 70 حرفاً (${descLength}/160) — يُنصح بأن يكون بين 70 و160 حرفاً لجذب الزوار.`,
      details: { length: descLength, minRecommended: 70, maxRecommended: 160 },
    });
  } else if (descLength > 160) {
    issues.push({
      id: "seo-desc-long",
      type: "description",
      severity: "warn",
      message: `وصف الصفحة أطول من 160 حرفاً (${descLength}/160) — سيتم اقتطاع الأجزاء الزائدة في محركات البحث.`,
      details: { length: descLength, maxRecommended: 160 },
    });
  } else {
    issues.push({
      id: "seo-desc-ok",
      type: "description",
      severity: "pass",
      message: `طول وصف الصفحة مثالي ومطابق لمحركات البحث (${descLength}/160 حرف).`,
      details: { length: descLength },
    });
  }

  // 3. Open Graph (OG) Image Check
  const hasOgImage = Boolean(seo?.ogImage?.trim());
  if (!hasOgImage) {
    issues.push({
      id: "seo-og-missing",
      type: "missing-og",
      severity: "warn",
      message: "صورة المشاركة على شبكات التواصل (OG Image) مفقودة — يُنصح بإضافتها لظهور احترافي على فيسبوك وواتساب.",
    });
  } else {
    issues.push({
      id: "seo-og-ok",
      type: "missing-og",
      severity: "pass",
      message: "صورة المشاركة (OG Image) محددة بنجاح.",
    });
  }

  // 4. Headings Analysis (Duplicate Headings + Missing H1)
  const seenHeadings = new Map<string, { count: number; sectionKeys: string[]; labels: string[] }>();
  let hasH1 = false;
  let missingAltCount = 0;
  const missingAltDetails: Array<{ sectionKey: string; label: string; desc: string }> = [];

  sections.forEach((sec, idx) => {
    const sectionKey = sec?.key || sec?.id || `section-${idx}`;
    const type = typeof sec === "string" ? sec : sec?.type || `قسم ${idx + 1}`;
    const settings = typeof sec === "object" && sec !== null ? sec.settings || sec : {};
    const label = sec?.label || type;

    // Check heading
    const headingText = (settings.title || settings.heading || settings.headline || "").trim();
    const rawLevel = settings.headingLevel || settings.level || settings.tag;

    if (rawLevel === "h1" || rawLevel === "H1" || rawLevel === 1) {
      hasH1 = true;
    } else if (!rawLevel && (type === "hero" || type === "banner" || idx === 0) && headingText) {
      hasH1 = true;
    }

    if (headingText) {
      const normalized = headingText.toLowerCase();
      const existing = seenHeadings.get(normalized);
      if (existing) {
        existing.count++;
        existing.sectionKeys.push(sectionKey);
        existing.labels.push(label);
      } else {
        seenHeadings.set(normalized, {
          count: 1,
          sectionKeys: [sectionKey],
          labels: [label],
        });
      }
    }

    // 5. Image Alt check for SEO
    const directImage = settings.image || settings.imageUrl || settings.backgroundImage || settings.bannerUrl || settings.heroImage;
    if (directImage && typeof directImage === "string" && directImage.trim()) {
      const alt = settings.alt || settings.imageAlt || settings.altText;
      if (!alt || !String(alt).trim()) {
        missingAltCount++;
        missingAltDetails.push({ sectionKey, label, desc: `صورة في "${label}"` });
      }
    }

    if (Array.isArray(settings.items)) {
      settings.items.forEach((item: any, itemIdx: number) => {
        if (item && (item.image || item.imageUrl || item.src)) {
          const itemAlt = item.alt || item.imageAlt || item.altText;
          if (!itemAlt || !String(itemAlt).trim()) {
            missingAltCount++;
            missingAltDetails.push({ sectionKey, label, desc: `صورة ${itemIdx + 1} في "${label}"` });
          }
        }
      });
    }
  });

  // Report Missing H1
  if (!hasH1 && sections.length > 0) {
    issues.push({
      id: "seo-missing-h1",
      type: "missing-h1",
      severity: "fail",
      message: "الصفحة تفتقر إلى عنوان رئيسي H1 — محركات البحث تشترط وجود عنوان H1 لتحديد موضوع ومحتوى الصفحة.",
    });
  } else if (hasH1) {
    issues.push({
      id: "seo-h1-ok",
      type: "missing-h1",
      severity: "pass",
      message: "يوجد عنوان رئيسي H1 محدد للصفحة.",
    });
  }

  // Report Duplicate Headings
  let duplicateHeadingsCount = 0;
  seenHeadings.forEach((data, text) => {
    if (data.count > 1) {
      duplicateHeadingsCount++;
      issues.push({
        id: `seo-duplicate-heading-${text.slice(0, 15)}`,
        type: "duplicate-heading",
        severity: "warn",
        sectionKey: data.sectionKeys[1],
        sectionLabel: data.labels[1],
        message: `تم رصد عنوان مكرر في الصفحة: "${text}" مكرر في الأقسام (${data.labels.join("، ")}). يُنصح بتنويع العناوين لأرشفة أدق.`,
        details: { heading: text, count: data.count, sections: data.labels },
      });
    }
  });

  // Report Images Without Alt
  if (missingAltCount > 0) {
    issues.push({
      id: "seo-images-missing-alt",
      type: "missing-alt",
      severity: "fail",
      sectionKey: missingAltDetails[0]?.sectionKey,
      sectionLabel: missingAltDetails[0]?.label,
      message: `تم رصد ${missingAltCount} صورة بدون نص بديل (alt text): ${missingAltDetails.map((m) => m.desc).join("، ")} — النصوص البديلة أساسية لأرشفة الصور في محركات البحث.`,
      details: { missingAltCount, items: missingAltDetails },
    });
  } else {
    issues.push({
      id: "seo-images-alt-ok",
      type: "missing-alt",
      severity: "pass",
      message: "جميع صور الصفحة تحتوي على نصوص بديلة ملائمة للـ SEO.",
    });
  }

  const errorsCount = issues.filter((i) => i.severity === "fail").length;
  const warningsCount = issues.filter((i) => i.severity === "warn").length;

  return {
    passed: errorsCount === 0,
    issues,
    summary: {
      titleLength,
      descriptionLength: descLength,
      hasH1,
      hasOgImage,
      duplicateHeadingsCount,
      missingAltCount,
      errorsCount,
      warningsCount,
    },
  };
}
