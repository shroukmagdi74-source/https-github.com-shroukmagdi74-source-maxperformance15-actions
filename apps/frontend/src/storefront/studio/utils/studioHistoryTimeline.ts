/**
 * UNDO-1 — Studio undo timeline (core, framework-free).
 *
 * Turns the raw undo/redo stack into a human timeline:
 *  - `describeStudioHistoryStep` derives an Arabic, merchant-friendly label from the
 *    diff between two storefront design-token snapshots ("إضافة قسم بانر رئيسي",
 *    "تعديل نص", "تغيير لون", …) so every history step means something.
 *  - `formatRelativeTimeAr` renders «من 2 دقيقة» style timestamps for the panel.
 *  - `STUDIO_HISTORY_MAX_STEPS` is the hard cap enforced by `useStudioHistory`.
 */

import { getStorefrontSectionLabel } from "../../sections/manifest";

/** Hard cap for the undo timeline (oldest steps are dropped once exceeded). */
export const STUDIO_HISTORY_MAX_STEPS = 50;

export const STUDIO_HISTORY_INITIAL_LABEL = "الحالة الأولية";
export const STUDIO_HISTORY_FALLBACK_LABEL = "تعديل المتجر";

/** Read-only shape consumed by `StudioHistoryPanel` (no snapshots leak to the UI). */
export interface StudioHistoryStepView {
  id: number;
  index: number;
  label: string;
  at: number;
  isCurrent: boolean;
  isFuture: boolean;
}

type Dict = Record<string, unknown>;

const isDict = (value: unknown): value is Dict =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const safeJson = (value: unknown): string => {
  try {
    const encoded = JSON.stringify(value);
    return typeof encoded === "string" ? encoded : "";
  } catch {
    return "";
  }
};

const changedKeys = (prev: Dict, next: Dict): string[] => {
  const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
  return [...keys].filter((key) => safeJson(prev[key]) !== safeJson(next[key]));
};

const truncate = (text: string, max = 30): string =>
  text.length > max ? `${text.slice(0, max - 1)}…` : text;

const TEXT_FIELD_RE =
  /(title|heading|subtitle|text|label|description|body|content|caption|cta|name|note|alt|question|answer|badge)/i;
const COLOR_FIELD_RE = /(color|colour|background|gradient|tint|brand|accent|overlay)/i;
const MEDIA_FIELD_RE = /(image|photo|video|media|thumbnail|logo|icon|src|url)/i;

/**
 * Arabic display name for a section: manifest label first, then the merchant's own
 * title, then the raw type — never an empty string.
 */
export const resolveSectionDisplayName = (section: unknown): string => {
  if (!isDict(section)) return "قسم";
  const type = typeof section.type === "string" ? section.type : "";
  const settings = isDict(section.settings) ? section.settings : {};
  const manifestLabel = type ? getStorefrontSectionLabel(type) : "";
  if (manifestLabel && manifestLabel !== type) return manifestLabel;

  const titleCandidate = settings.title ?? settings.heading ?? section.title ?? settings.label;
  if (typeof titleCandidate === "string" && titleCandidate.trim()) {
    return truncate(titleCandidate.trim());
  }
  return type || "قسم";
};

const flattenSection = (section: Dict): Dict => {
  const flat: Dict = {};
  for (const [key, value] of Object.entries(section)) {
    if (key === "settings" && isDict(value)) {
      for (const [innerKey, innerValue] of Object.entries(value)) {
        flat[innerKey] = innerValue;
      }
    } else {
      flat[key] = value;
    }
  }
  return flat;
};

const describeSectionEdit = (prevSection: unknown, nextSection: unknown): string => {
  const name = resolveSectionDisplayName(nextSection);
  if (!isDict(prevSection) || !isDict(nextSection)) return `تعديل قسم ${name}`;

  const keys = changedKeys(flattenSection(prevSection), flattenSection(nextSection)).filter(
    (key) => key !== "id" && key !== "key"
  );
  if (keys.length === 0) return `تعديل قسم ${name}`;
  if (keys.some((key) => COLOR_FIELD_RE.test(key))) return "تغيير لون";
  if (keys.some((key) => MEDIA_FIELD_RE.test(key))) return "تغيير صورة";
  if (keys.some((key) => TEXT_FIELD_RE.test(key))) return "تعديل نص";
  return `تعديل قسم ${name}`;
};

const describeSectionsChange = (prevSections: unknown[], nextSections: unknown[]): string | null => {
  if (safeJson(prevSections) === safeJson(nextSections)) return null;

  const prevJson = new Set(prevSections.map((section) => safeJson(section)));
  const nextJson = new Set(nextSections.map((section) => safeJson(section)));

  if (nextSections.length > prevSections.length) {
    const added = nextSections.filter((section) => !prevJson.has(safeJson(section)));
    if (added.length === 1) return `إضافة قسم ${resolveSectionDisplayName(added[0])}`;
    const count = added.length || nextSections.length - prevSections.length;
    return count === 1 ? `إضافة قسم ${resolveSectionDisplayName(added[0])}` : `إضافة ${count} أقسام`;
  }

  if (nextSections.length < prevSections.length) {
    const removed = prevSections.filter((section) => !nextJson.has(safeJson(section)));
    if (removed.length === 1) return `حذف قسم ${resolveSectionDisplayName(removed[0])}`;
    const count = removed.length || prevSections.length - nextSections.length;
    return count === 1 ? `حذف قسم ${resolveSectionDisplayName(removed[0])}` : `حذف ${count} أقسام`;
  }

  const prevSorted = prevSections.map((section) => safeJson(section)).sort();
  const nextSorted = nextSections.map((section) => safeJson(section)).sort();
  if (prevSorted.join("|") === nextSorted.join("|")) return "ترتيب الأقسام";

  for (let index = 0; index < nextSections.length; index += 1) {
    if (safeJson(prevSections[index]) !== safeJson(nextSections[index])) {
      return describeSectionEdit(prevSections[index], nextSections[index]);
    }
  }
  return "تعديل الأقسام";
};

const pageDisplayName = (pageKey: string, nextPage: Dict, prevPage: Dict): string => {
  if (pageKey === "home") return "الرئيسية";
  const candidate = nextPage.title ?? nextPage.label ?? prevPage.title ?? prevPage.label;
  if (typeof candidate === "string" && candidate.trim()) return truncate(candidate.trim());
  return pageKey;
};

const describePageChange = (pageKey: string, prevPage: unknown, nextPage: unknown): string => {
  if (prevPage === undefined || prevPage === null) {
    return `إضافة صفحة ${pageDisplayName(pageKey, isDict(nextPage) ? nextPage : {}, {})}`;
  }
  if (nextPage === undefined || nextPage === null) {
    return `حذف صفحة ${pageDisplayName(pageKey, {}, isDict(prevPage) ? prevPage : {})}`;
  }

  const prevDict = isDict(prevPage) ? prevPage : {};
  const nextDict = isDict(nextPage) ? nextPage : {};
  const pageName = pageDisplayName(pageKey, nextDict, prevDict);

  const prevSections = Array.isArray(prevDict.sections) ? prevDict.sections : [];
  const nextSections = Array.isArray(nextDict.sections) ? nextDict.sections : [];
  const sectionsLabel = describeSectionsChange(prevSections, nextSections);
  if (sectionsLabel) return sectionsLabel;

  if (safeJson(prevDict.title) !== safeJson(nextDict.title)) return `تعديل عنوان صفحة ${pageName}`;
  if (safeJson(prevDict.label) !== safeJson(nextDict.label)) return `تعديل عنوان صفحة ${pageName}`;
  if (safeJson(prevDict.seo) !== safeJson(nextDict.seo)) return `تعديل SEO صفحة ${pageName}`;
  if (safeJson(prevDict.status) !== safeJson(nextDict.status)) return `تغيير حالة صفحة ${pageName}`;
  return `تعديل صفحة ${pageName}`;
};

const describeGlobalChange = (prevGlobal: unknown, nextGlobal: unknown): string => {
  const prev = isDict(prevGlobal) ? prevGlobal : {};
  const next = isDict(nextGlobal) ? nextGlobal : {};
  if (safeJson(prev.header) !== safeJson(next.header)) return "تعديل الهيدر";
  if (safeJson(prev.footer) !== safeJson(next.footer)) return "تعديل الفوتر";
  if (safeJson(prev.menu) !== safeJson(next.menu)) return "تعديل المنيو";
  return "تعديل الإعدادات العامة";
};

/**
 * Build the Arabic label of the step that moved `prev` → `next`.
 * Never throws and never returns an empty label.
 */
export function describeStudioHistoryStep(prev: unknown, next: unknown): string {
  if (!isDict(prev) || !isDict(next)) return STUDIO_HISTORY_FALLBACK_LABEL;

  if (safeJson(prev.pages) !== safeJson(next.pages) && (prev.pages !== undefined || next.pages !== undefined)) {
    const prevPages = isDict(prev.pages) ? prev.pages : {};
    const nextPages = isDict(next.pages) ? next.pages : {};
    const pageKeys = changedKeys(prevPages, nextPages);
    if (pageKeys.length > 1) return `تعديل ${pageKeys.length} صفحات`;
    if (pageKeys.length === 1) {
      return describePageChange(pageKeys[0], prevPages[pageKeys[0]], nextPages[pageKeys[0]]);
    }
  }

  if (safeJson(prev.global) !== safeJson(next.global) && (prev.global !== undefined || next.global !== undefined)) {
    return describeGlobalChange(prev.global, next.global);
  }
  if (safeJson(prev.variables) !== safeJson(next.variables)) return "تعديل المتغيرات";
  if (safeJson(prev.themeId) !== safeJson(next.themeId)) return "تغيير الستايل";
  if (safeJson(prev.styles) !== safeJson(next.styles) && (prev.styles !== undefined || next.styles !== undefined)) {
    return "تعديل الستايل";
  }
  return STUDIO_HISTORY_FALLBACK_LABEL;
}

/** «الآن» / «من دقيقة» / «من 2 دقيقة» / «من 3 ساعة» / «من 2 يوم». */
export function formatRelativeTimeAr(at: number, now: number = Date.now()): string {
  if (!Number.isFinite(at)) return "";
  const seconds = Math.floor(Math.max(0, now - at) / 1000);
  if (seconds < 45) return "الآن";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes <= 1 ? "من دقيقة" : `من ${minutes} دقيقة`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours <= 1 ? "من ساعة" : `من ${hours} ساعة`;

  const days = Math.floor(hours / 24);
  return days <= 1 ? "من يوم" : `من ${days} يوم`;
}
