import type { PageStyleScope } from "../StudioTypes";

export const STUDIO_PAGE_EXPORT_VERSION = "1.0";

export interface StudioExportedPageData {
  version: string;
  page: string;
  sections: any[];
  styles?: PageStyleScope;
  metadata?: {
    title?: string;
    exportedAt?: string;
    sourceThemeId?: string;
    sectionsCount?: number;
  };
}

export interface StudioPageDiff {
  pageKey: string;
  currentSectionsCount: number;
  incomingSectionsCount: number;
  sectionsAdded: number;
  sectionsRemoved: number;
  stylesChanged: boolean;
  incomingSections: any[];
  incomingStyles?: PageStyleScope;
  summaryText: string;
}

export interface StudioImportValidation {
  isValid: boolean;
  error?: string;
  data?: StudioExportedPageData;
}

export interface StudioImportResult {
  success: boolean;
  applied: boolean;
  error?: string;
  diff?: StudioPageDiff;
  data?: StudioExportedPageData;
}

export interface ExportPageOptions {
  sections?: any[];
  styles?: PageStyleScope;
  designTokens?: Record<string, any>;
  theme?: Record<string, any>;
  title?: string;
}

/**
 * Pure deep clone helper to ensure exported data is detached from React state.
 */
function cloneValue<T>(val: T): T {
  if (val === undefined || val === null) return val;
  try {
    return JSON.parse(JSON.stringify(val)) as T;
  } catch {
    return val;
  }
}

/**
 * Exports a specific page's sections and styling into a standardized JSON payload.
 *
 * @param pageKey The target page key (e.g. "home", "shop", "pdp", or custom page slug)
 * @param options Additional context to resolve sections, styles, and metadata
 */
export function exportPage(
  pageKey: string,
  options?: ExportPageOptions
): StudioExportedPageData {
  const safeKey = String(pageKey || "home").trim();

  // 1. Resolve sections
  let resolvedSections: any[] = [];
  if (options && Array.isArray(options.sections)) {
    resolvedSections = options.sections;
  } else if (options && options.designTokens) {
    const tokens = options.designTokens;
    const fromOverrides = tokens["pageOverrides"]?.[safeKey]?.["sections"];
    const fromPages = tokens["pages"]?.[safeKey]?.["sections"];
    const fromTheme = options.theme?.["pages"]?.[safeKey]?.["sections"];
    if (Array.isArray(fromOverrides)) {
      resolvedSections = fromOverrides;
    } else if (Array.isArray(fromPages)) {
      resolvedSections = fromPages;
    } else if (Array.isArray(fromTheme)) {
      resolvedSections = fromTheme;
    }
  }

  // 2. Resolve page style scope
  let resolvedStyles: PageStyleScope | undefined;
  if (options && options.styles) {
    resolvedStyles = options.styles;
  } else if (options?.designTokens && options.designTokens["pageStyles"]) {
    resolvedStyles = options.designTokens["pageStyles"][safeKey];
  }

  // 3. Construct export payload
  const sourceThemeId =
    (options?.theme && options.theme["id"]) ||
    (options?.designTokens && options.designTokens["themeId"]) ||
    "modern-minimal";

  const payload: StudioExportedPageData = {
    version: STUDIO_PAGE_EXPORT_VERSION,
    page: safeKey,
    sections: cloneValue(resolvedSections),
    styles: resolvedStyles ? cloneValue(resolvedStyles) : undefined,
    metadata: {
      title: options?.title || safeKey,
      exportedAt: new Date().toISOString(),
      sourceThemeId: String(sourceThemeId),
      sectionsCount: resolvedSections.length,
    },
  };

  return payload;
}

/**
 * Returns formatted JSON string for the exported page.
 */
export function exportPageAsJSON(
  pageKey: string,
  options?: ExportPageOptions
): string {
  const data = exportPage(pageKey, options);
  return JSON.stringify(data, null, 2);
}

/**
 * Triggers a browser download of JSON data as a file.
 */
export function downloadJSON(filename: string, data: unknown): void {
  const jsonContent =
    typeof data === "string" ? data : JSON.stringify(data, null, 2);

  if (typeof document === "undefined") {
    return;
  }

  try {
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename.endsWith(".json") ? filename : `${filename}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Failed to trigger JSON download:", err);
  }
}

/**
 * Validates the schema of an imported JSON object or string.
 * Strictly verifies version and presence of sections array.
 */
export function validatePageJSON(jsonInput: unknown): StudioImportValidation {
  if (jsonInput === null || jsonInput === undefined) {
    return {
      isValid: false,
      error: "ملف الاستيراد فارغ أو غير موجود",
    };
  }

  let parsed: any = jsonInput;
  if (typeof jsonInput === "string") {
    try {
      parsed = JSON.parse(jsonInput);
    } catch {
      return {
        isValid: false,
        error: "صيغة JSON غير صالحة. يرجى التأكد من صحة الملف",
      };
    }
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return {
      isValid: false,
      error: "محتوى الملف ليس كائناً صالحاً (Object)",
    };
  }

  // Version check (Strict negative test requirement)
  if (!parsed.version || typeof parsed.version !== "string") {
    return {
      isValid: false,
      error: 'حقل الإصدار (version) مفقود في ملف التصدير',
    };
  }

  if (parsed.version !== STUDIO_PAGE_EXPORT_VERSION) {
    return {
      isValid: false,
      error: `إصدار القالب غير مدعوم: "${parsed.version}". الإصدار المدعوم هو "${STUDIO_PAGE_EXPORT_VERSION}" فقط`,
    };
  }

  // Sections array check
  if (!Array.isArray(parsed.sections)) {
    return {
      isValid: false,
      error: 'ملف القالب لا يحتوي على مصفوفة أقسام صالحة (sections)',
    };
  }

  return {
    isValid: true,
    data: {
      version: parsed.version,
      page: String(parsed.page || "home"),
      sections: parsed.sections,
      styles: parsed.styles,
      metadata: parsed.metadata,
    },
  };
}

/**
 * Computes a readable diff preview between current page state and incoming import data.
 */
export function computePageDiff(
  currentSections: any[] = [],
  currentStyles: PageStyleScope | undefined,
  incoming: StudioExportedPageData
): StudioPageDiff {
  const currentCount = Array.isArray(currentSections) ? currentSections.length : 0;
  const incomingCount = Array.isArray(incoming.sections) ? incoming.sections.length : 0;

  const currentStylesStr = JSON.stringify(currentStyles || {});
  const incomingStylesStr = JSON.stringify(incoming.styles || {});
  const stylesChanged = currentStylesStr !== incomingStylesStr;

  const diffCount = incomingCount - currentCount;
  const sectionsAdded = diffCount > 0 ? diffCount : 0;
  const sectionsRemoved = diffCount < 0 ? Math.abs(diffCount) : 0;

  const summaryParts: string[] = [];
  summaryParts.push(
    `سيتم استبدال ${currentCount} قسم حالي بـ ${incomingCount} قسم مستورد`
  );
  if (stylesChanged) {
    summaryParts.push("وتحديث طابع الصفحة البصري (Page Styles)");
  }

  return {
    pageKey: incoming.page,
    currentSectionsCount: currentCount,
    incomingSectionsCount: incomingCount,
    sectionsAdded,
    sectionsRemoved,
    stylesChanged,
    incomingSections: incoming.sections,
    incomingStyles: incoming.styles,
    summaryText: summaryParts.join(" "),
  };
}

/**
 * Imports page data with strict schema validation, diff inspection,
 * and guarded application only when confirmed.
 */
export function importPage(
  jsonInput: unknown,
  options?: {
    pageKey?: string;
    currentSections?: any[];
    currentStyles?: PageStyleScope;
    confirm?: boolean;
    onApply?: (imported: StudioExportedPageData) => void;
  }
): StudioImportResult {
  // 1. Validate Schema
  const validation = validatePageJSON(jsonInput);
  if (!validation.isValid || !validation.data) {
    return {
      success: false,
      applied: false,
      error: validation.error || "فشل التحقق من صيغة الملف",
    };
  }

  const imported = validation.data;
  const currentSecs = options?.currentSections ?? [];
  const currentSty = options?.currentStyles;

  // 2. Compute diff preview
  const diff = computePageDiff(currentSecs, currentSty, imported);

  // 3. Apply changes only if confirmed
  if (options?.confirm) {
    if (options.onApply) {
      options.onApply(imported);
    }
    return {
      success: true,
      applied: true,
      diff,
      data: imported,
    };
  }

  // Not confirmed yet: return diff for user inspection and confirmation
  return {
    success: true,
    applied: false,
    diff,
    data: imported,
  };
}
