import React, { useState, useMemo, useEffect } from "react";
import {
  XMarkIcon,
  EyeIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  SwatchIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
  STOREFRONT_THEME_PRESETS,
  getStorefrontThemePresetIds,
} from "../themes/index";
import {
  buildStorefrontThemePresetCatalog,
  type StorefrontThemeCatalogItem,
} from "../themes/catalog";
import { getApiUrl } from "../../config/environment";
import { tokenManager } from "../../utils/tokenManager";

export interface StudioThemeGalleryPanelProps {
  currentThemeId: string;
  designTokens: Record<string, unknown>;
  onApplyTheme: (themeId: string, nextTokens: Record<string, unknown>) => void;
  onClose: () => void;
}

const SECTION_TYPE_LABELS: Record<string, string> = {
  "hero-banner": "بنر الواجهة الرئيسي",
  "hero-sidebar": "واجهة عريضة مع شريط جانبي",
  "category-strip": "شريط التصنيفات السريعة",
  "featured-products": "المنتجات الأكثر طلباً",
  "product-grid": "شبكة المنتجات",
  "featured-collections": "مجموعات وتصنيفات مميزة",
  "lookbook-showcase": "دليل تنسيق الإطلالات",
  "story-parallax": "قصة البراند والخامات",
  "promo-strip": "شريط المزايا والشحن",
  "features-bar": "شريط الضمانات والمميزات",
  "review-circle": "آراء وتجارب العملاء",
  "social-gallery": "معرض صور المجتمع",
  "offer-bento": "باقات وعروض التوفير",
  "menu-highlights": "أبرز أطباق القائمة",
  "before-after": "مقارنة الأداء والنتائج",
  "faq-accordion": "الأسئلة الشائعة",
  "image-hotspot": "الهرم العطري والنوتات",
  "info-content": "نبذة وتفاصيل المتجر",
  newsletter: "النشرة البريدية",
  header: "الهيدر والترويسة",
  footer: "الفوتر والتذييل",
  "cart-drawer": "سلة المشتريات المنزلقة",
};

interface ThemeDetails {
  colors: {
    primary: string;
    accent: string;
    background: string;
    card: string;
    foreground: string;
  };
  font: string;
  pagesCount: number;
  homeSections: string[];
}

const getThemeDetails = (themeId: string): ThemeDetails => {
  const preset = STOREFRONT_THEME_PRESETS[themeId];
  const colors = {
    primary: preset?.tokens?.colors?.primary || "#111827",
    accent: preset?.tokens?.colors?.accent || "#2b6cf6",
    background: preset?.tokens?.colors?.background || "#ffffff",
    card: preset?.tokens?.colors?.card || "#f9fafb",
    foreground: preset?.tokens?.colors?.foreground || "#111827",
  };
  const font =
    preset?.tokens?.typography?.headingFont ||
    preset?.tokens?.typography?.fontFamily ||
    preset?.tokens?.typography?.bodyFont ||
    "Cairo";
  const pagesCount = preset?.pages ? Object.keys(preset.pages).length : 5;
  const rawSections = (preset?.pages?.home?.sections || []) as Array<
    string | { type: string }
  >;
  const homeSections = rawSections.map((s) =>
    typeof s === "string" ? s : s?.type || "unknown"
  );

  return { colors, font, pagesCount, homeSections };
};

export const StudioThemeGalleryPanel: React.FC<StudioThemeGalleryPanelProps> = ({
  currentThemeId,
  designTokens,
  onApplyTheme,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [previewThemeItem, setPreviewThemeItem] =
    useState<StorefrontThemeCatalogItem | null>(null);
  const [confirmThemeItem, setConfirmThemeItem] =
    useState<StorefrontThemeCatalogItem | null>(null);
  const [themes, setThemes] = useState<StorefrontThemeCatalogItem[]>(() =>
    buildStorefrontThemePresetCatalog(currentThemeId)
  );

  // Try fetching dynamic catalog from backend API if available, keep fallback
  useEffect(() => {
    let isMounted = true;
    const fetchCatalog = async () => {
      try {
        const apiUrl = getApiUrl();
        if (!apiUrl) return;
        const res = await fetch(`${apiUrl}/storefront-settings/theme-catalog`, {
          method: "GET",
          headers: tokenManager.createAuthHeaders({
            "Content-Type": "application/json",
          }),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.data) && data.data.length > 0) {
          setThemes(data.data);
        }
      } catch {
        // Fallback already loaded from buildStorefrontThemePresetCatalog
      }
    };
    fetchCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredThemes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return themes;
    return themes.filter((t) => {
      const matchName = t.name.toLowerCase().includes(q);
      const matchDesc = (t.description || "").toLowerCase().includes(q);
      const matchId = t.themeId.toLowerCase().includes(q);
      const matchCat =
        t.category?.primary?.label?.toLowerCase().includes(q) ||
        t.category?.secondary?.label?.toLowerCase().includes(q);
      return matchName || matchDesc || matchId || matchCat;
    });
  }, [themes, searchQuery]);

  const previewDetails = useMemo(() => {
    if (!previewThemeItem) return null;
    return getThemeDetails(previewThemeItem.themeId);
  }, [previewThemeItem]);

  const handleConfirmApply = () => {
    if (!confirmThemeItem) return;
    const targetThemeId = confirmThemeItem.themeId;

    // Preserve pages/pageOverrides/pageStyles/global/typography/i18n strictly
    const nextTokens: Record<string, unknown> = {
      ...designTokens,
      themeId: targetThemeId,
      pages: designTokens?.pages ?? {},
      pageOverrides: designTokens?.pageOverrides ?? {},
      pageStyles: designTokens?.pageStyles ?? {},
      global: designTokens?.global ?? {},
      typography: designTokens?.typography ?? {},
      i18n: designTokens?.i18n ?? {},
    };

    onApplyTheme(targetThemeId, nextTokens);
    setConfirmThemeItem(null);
  };

  return (
    <div
      data-testid="studio-theme-gallery"
      className="relative w-80 md:w-92 max-w-[85vw] h-full flex flex-col bg-[#1c1d22] text-[#e8eaee] border-e border-[#0c0d0f] select-none"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#282a30] shrink-0 bg-[#17181c]">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2b6cf6]/15 text-[#2b6cf6]">
            <SwatchIcon className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold tracking-tight text-[#f3f4f6]">
              معرض الثيمات ({themes.length})
            </h2>
            <p className="text-[10px] text-[#9ba0a8]">
              المطبق: <span className="font-semibold text-white">{currentThemeId}</span>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          data-testid="theme-gallery-close"
          className="flex h-7 w-7 items-center justify-center rounded-md text-[#9ba0a8] hover:bg-[#252830] hover:text-[#f3f4f6] transition-colors"
          title="إغلاق اللوحة"
          aria-label="إغلاق"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="p-3 border-b border-[#282a30] bg-[#1a1b20]">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9ba0a8]" />
          <input
            type="text"
            data-testid="theme-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في الثيمات (64 ثيم)..."
            className="w-full h-8 ps-8 pe-7 rounded-lg bg-[#23252b] border border-[#2d3039] text-xs text-[#e8eaee] placeholder-[#737987] focus:outline-none focus:border-[#2b6cf6] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              data-testid="theme-search-clear"
              onClick={() => setSearchQuery("")}
              className="absolute end-2 top-1/2 -translate-y-1/2 text-[#9ba0a8] hover:text-white"
              aria-label="مسح البحث"
            >
              <XMarkIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {searchQuery && (
          <div className="mt-1.5 text-[10px] text-[#9ba0a8]">
            تم العثور على {filteredThemes.length} ثيم
          </div>
        )}
      </div>

      {/* Theme Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
        {filteredThemes.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#9ba0a8]">
            لا توجد ثيمات مطابقة لبحثك
          </div>
        ) : (
          filteredThemes.map((theme) => {
            const isCurrent = theme.themeId === currentThemeId;
            const details = getThemeDetails(theme.themeId);
            return (
              <div
                key={theme.themeId}
                data-testid={`theme-card-${theme.themeId}`}
                className={`rounded-xl border transition-all p-3.5 bg-[#202227] ${
                  isCurrent
                    ? "border-[#2b6cf6] shadow-[0_4px_20px_rgba(43,108,246,0.15)] ring-1 ring-[#2b6cf6]/40"
                    : "border-[#2b2d35] hover:border-[#3a3d47]"
                }`}
              >
                {/* Header: Title & Badges */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-xs font-bold text-white truncate">
                        {theme.name}
                      </h3>
                      {isCurrent && (
                        <span
                          data-testid="active-theme-badge"
                          className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/30"
                        >
                          <CheckIcon className="h-2.5 w-2.5 stroke-[3]" />
                          المطبق حاليًا
                        </span>
                      )}
                    </div>
                    {theme.category?.primary?.label && (
                      <span className="inline-block mt-0.5 text-[10px] text-[#9ba0a8] font-medium">
                        {theme.category.primary.label}
                      </span>
                    )}
                  </div>

                  {/* Swatches */}
                  <div
                    data-testid={`theme-swatches-${theme.themeId}`}
                    className="flex items-center gap-1 shrink-0 p-1 rounded-lg bg-black/30 border border-white/5"
                    title="ألوان الثيم (أكسنت / أساسي / خلفية)"
                  >
                    <span
                      className="h-3 w-3 rounded-full border border-white/20 shadow-xs"
                      style={{ backgroundColor: details.colors.accent }}
                      title={`Accent: ${details.colors.accent}`}
                    />
                    <span
                      className="h-3 w-3 rounded-full border border-white/20 shadow-xs"
                      style={{ backgroundColor: details.colors.primary }}
                      title={`Primary: ${details.colors.primary}`}
                    />
                    <span
                      className="h-3 w-3 rounded-full border border-white/20 shadow-xs"
                      style={{ backgroundColor: details.colors.background }}
                      title={`Background: ${details.colors.background}`}
                    />
                  </div>
                </div>

                {/* Description */}
                <p className="text-[11px] text-[#9ba0a8] line-clamp-2 leading-relaxed mb-3">
                  {theme.description || "ثيم متكامل ومحسن للتحويل السريع."}
                </p>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1 border-t border-[#292c34]">
                  <button
                    type="button"
                    data-testid={`theme-preview-btn-${theme.themeId}`}
                    onClick={() => setPreviewThemeItem(theme)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-medium text-[#c5c9d3] bg-[#292c34] hover:bg-[#343741] hover:text-white transition-colors"
                  >
                    <EyeIcon className="h-3.5 w-3.5" />
                    <span>معاينة</span>
                  </button>

                  <button
                    type="button"
                    data-testid={`theme-apply-btn-${theme.themeId}`}
                    onClick={() => {
                      if (!isCurrent) setConfirmThemeItem(theme);
                    }}
                    disabled={isCurrent}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                      isCurrent
                        ? "bg-[#1f2937] text-[#6b7280] cursor-not-allowed border border-white/5"
                        : "bg-[#2b6cf6] text-white hover:bg-[#2563eb] shadow-sm active:scale-95"
                    }`}
                  >
                    <CheckIcon className="h-3.5 w-3.5" />
                    <span>{isCurrent ? "مطبق" : "تطبيق"}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. Theme Preview Modal (Non-mutating: Zero changes to store)  */}
      {/* ───────────────────────────────────────────────────────────── */}
      {previewThemeItem && previewDetails && (
        <div
          data-testid="theme-preview-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
          onClick={() => setPreviewThemeItem(null)}
        >
          <div
            className="w-full max-w-md bg-[#1c1d22] border border-[#2e313a] rounded-2xl shadow-2xl p-5 text-[#e8eaee] space-y-4 max-h-[90vh] overflow-y-auto scrollbar-thin"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[#282a30] pb-3">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-[#2b6cf6] uppercase">
                  معاينة الثيم (بدون حفظ أو تطبيق)
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {previewThemeItem.name}
                </h3>
                <p className="text-xs text-[#9ba0a8] mt-1 leading-relaxed">
                  {previewThemeItem.description}
                </p>
              </div>
              <button
                type="button"
                data-testid="theme-preview-close"
                onClick={() => setPreviewThemeItem(null)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[#9ba0a8] hover:bg-[#282a30] hover:text-white"
                aria-label="إغلاق المعاينة"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Colors Grid */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold text-[#c5c9d3]">ألوان الثيم</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-[#24262d] border border-white/5">
                  <span
                    className="h-4 w-4 rounded-full border border-white/20 shrink-0"
                    style={{ backgroundColor: previewDetails.colors.accent }}
                  />
                  <div>
                    <span className="block text-[10px] text-[#9ba0a8]">لون التمييز (Accent)</span>
                    <span className="font-mono text-[11px] text-white">
                      {previewDetails.colors.accent}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-[#24262d] border border-white/5">
                  <span
                    className="h-4 w-4 rounded-full border border-white/20 shrink-0"
                    style={{ backgroundColor: previewDetails.colors.primary }}
                  />
                  <div>
                    <span className="block text-[10px] text-[#9ba0a8]">الأساسي (Primary)</span>
                    <span className="font-mono text-[11px] text-white">
                      {previewDetails.colors.primary}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-[#24262d] border border-white/5">
                  <span
                    className="h-4 w-4 rounded-full border border-white/20 shrink-0"
                    style={{ backgroundColor: previewDetails.colors.background }}
                  />
                  <div>
                    <span className="block text-[10px] text-[#9ba0a8]">الخلفية (Background)</span>
                    <span className="font-mono text-[11px] text-white">
                      {previewDetails.colors.background}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-[#24262d] border border-white/5">
                  <span
                    className="h-4 w-4 rounded-full border border-white/20 shrink-0"
                    style={{ backgroundColor: previewDetails.colors.card }}
                  />
                  <div>
                    <span className="block text-[10px] text-[#9ba0a8]">البطاقات (Surface)</span>
                    <span className="font-mono text-[11px] text-white">
                      {previewDetails.colors.card}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Typography & Page Count */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#24262d] border border-white/5">
                <span className="block text-[10px] text-[#9ba0a8]">الخط المعتمد</span>
                <span className="font-bold text-white text-xs mt-0.5 block">
                  {previewDetails.font}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#24262d] border border-white/5">
                <span className="block text-[10px] text-[#9ba0a8]">عدد الصفحات المتاحة</span>
                <span className="font-bold text-white text-xs mt-0.5 block">
                  {previewDetails.pagesCount} صفحات
                </span>
              </div>
            </div>

            {/* Home Page Sections List */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <h4 className="font-semibold text-[#c5c9d3]">أقسام الصفحة الرئيسية</h4>
                <span className="text-[10px] text-[#9ba0a8]">
                  {previewDetails.homeSections.length} أقسام مرتبة
                </span>
              </div>
              <div className="rounded-lg bg-[#16171b] border border-[#282a30] p-2.5 space-y-1 max-h-36 overflow-y-auto scrollbar-thin">
                {previewDetails.homeSections.map((secType, idx) => (
                  <div
                    key={`${secType}-${idx}`}
                    className="flex items-center gap-2 text-xs py-1 px-1.5 rounded hover:bg-[#202227]"
                  >
                    <span className="text-[10px] font-mono text-[#9ba0a8] w-4 text-center">
                      {idx + 1}.
                    </span>
                    <span className="text-[#e8eaee] font-medium">
                      {SECTION_TYPE_LABELS[secType] || secType}
                    </span>
                    <span className="text-[9px] font-mono text-[#737987] ms-auto">
                      {secType}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#282a30]">
              <button
                type="button"
                onClick={() => setPreviewThemeItem(null)}
                className="px-3 py-1.5 rounded-lg text-xs text-[#9ba0a8] hover:text-white hover:bg-[#282a30] transition-colors"
              >
                إغلاق
              </button>
              <button
                type="button"
                data-testid="theme-preview-apply-btn"
                onClick={() => {
                  const target = previewThemeItem;
                  setPreviewThemeItem(null);
                  setConfirmThemeItem(target);
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#2b6cf6] text-white hover:bg-[#2563eb] transition-all"
              >
                تطبيق هذا الثيم
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. Apply Confirmation Dialog (Preserves merchant work)         */}
      {/* ───────────────────────────────────────────────────────────── */}
      {confirmThemeItem && (
        <div
          data-testid="theme-confirm-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4"
          onClick={() => setConfirmThemeItem(null)}
        >
          <div
            className="w-full max-w-sm bg-[#1c1d22] border border-[#2e313a] rounded-2xl shadow-2xl p-5 text-[#e8eaee] space-y-3.5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eab308]/15 text-[#eab308] shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">تأكيد تغيير الثيم</h3>
                <p className="text-[11px] text-[#9ba0a8]">
                  إلى: <span className="font-semibold text-white">{confirmThemeItem.name}</span>
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-[#24262d] border border-[#30333d] p-3 text-xs leading-relaxed text-[#d1d5db] space-y-1.5">
              <p className="font-semibold text-[#fef08a]">
                «هيتم تغيير شكل المتجر — التعديلات الحالية محفوظة كإصدار في السجل»
              </p>
              <p className="text-[11px] text-[#9ba0a8]">
                سيتم الحفاظ على صفحاتك وصفحات التخصيص والأنماط وإعدادات الخطوط والترجمات بالكامل دون أي مسح.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                data-testid="theme-cancel-apply"
                onClick={() => setConfirmThemeItem(null)}
                className="px-3 py-1.5 rounded-lg text-xs text-[#9ba0a8] hover:text-white hover:bg-[#282a30] transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                data-testid="confirm-apply-theme-btn"
                onClick={handleConfirmApply}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#2b6cf6] text-white hover:bg-[#2563eb] transition-all shadow-md active:scale-95"
              >
                تأكيد التطبيق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
