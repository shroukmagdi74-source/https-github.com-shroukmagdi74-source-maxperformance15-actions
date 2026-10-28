import React, { useState } from "react";
import {
  XMarkIcon,
  EyeIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  SwatchIcon,
} from "@heroicons/react/24/outline";
import StudioThemeBuilderPanel from "./StudioThemeBuilderPanel";
import type { ThemeBuilderTemplate } from "./utils/themeBuilder";
import {
  INDUSTRY_PRESETS,
  type IndustryPreset,
  type IndustryPresetId,
} from "../presets/industryPresets";

export interface StudioTemplateGalleryPanelProps {
  activePageKey: string;
  onApplyPreset: (preset: IndustryPreset) => void;
  onClose: () => void;
  templates?: ThemeBuilderTemplate[];
  onSaveTemplate?: (template: ThemeBuilderTemplate) => void;
  onDeleteTemplate?: (templateId: string) => void;
  currentSections?: any[];
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
};

export const StudioTemplateGalleryPanel: React.FC<StudioTemplateGalleryPanelProps> = ({
  activePageKey,
  onApplyPreset,
  onClose,
  templates = [],
  onSaveTemplate = () => {},
  onDeleteTemplate = () => {},
  currentSections = [],
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"presets" | "theme-builder">("presets");
  const [previewPresetId, setPreviewPresetId] = useState<IndustryPresetId | null>(null);
  const [confirmPreset, setConfirmPreset] = useState<IndustryPreset | null>(null);

  const handleConfirmApply = () => {
    if (!confirmPreset) return;
    onApplyPreset(confirmPreset);
    setConfirmPreset(null);
  };

  return (
    <div
      data-testid="studio-template-gallery"
      className="relative w-80 md:w-92 max-w-[85vw] h-full flex flex-col bg-[#1c1d22] text-[#e8eaee] border-e border-[#0c0d0f] select-none"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#282a30] shrink-0 bg-[#17181c]">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2b6cf6]/15 text-[#2b6cf6]">
            <SwatchIcon className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold tracking-tight text-[#f3f4f6]">مكتبة القوالب القطاعية</h2>
            <p className="text-[10px] text-[#9ba0a8]">
              تطبيق على: <span className="font-semibold text-white">{activePageKey}</span>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          data-testid="template-gallery-close"
          className="flex h-7 w-7 items-center justify-center rounded-md text-[#9ba0a8] hover:bg-[#252830] hover:text-[#f3f4f6] transition-colors"
          title="إغلاق اللوحة"
          aria-label="إغلاق"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex border-b border-[#282a30] bg-[#17181c] px-4 pt-1 gap-2 shrink-0">
        <button
          type="button"
          data-testid="tab-industry-presets"
          onClick={() => setActiveSubTab("presets")}
          className={`pb-2 px-2 text-[11px] font-bold border-b-2 transition-all ${activeSubTab === "presets" ? "border-[#2b6cf6] text-white" : "border-transparent text-[#9ba0a8] hover:text-white"}`}
        >
          قوالب قطاعية
        </button>
        <button
          type="button"
          data-testid="tab-theme-builder"
          onClick={() => setActiveSubTab("theme-builder")}
          className={`pb-2 px-2 text-[11px] font-bold border-b-2 transition-all ${activeSubTab === "theme-builder" ? "border-[#2b6cf6] text-white" : "border-transparent text-[#9ba0a8] hover:text-white"}`}
        >
          Theme Builder
        </button>
      </div>

      {activeSubTab === "theme-builder" ? (
        <div className="flex-1 overflow-hidden">
          <StudioThemeBuilderPanel
            templates={templates}
            onSaveTemplate={onSaveTemplate}
            onDeleteTemplate={onDeleteTemplate}
            currentSections={currentSections}
            activePageKey={activePageKey}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3 space-y-3.5 scrollbar-thin">
        {INDUSTRY_PRESETS.map((preset) => {
          const isPreviewing = previewPresetId === preset.id;
          return (
            <div
              key={preset.id}
              data-testid={`template-card-${preset.id}`}
              className={`rounded-xl border transition-all p-3.5 bg-[#202227] ${
                isPreviewing
                  ? "border-[#2b6cf6] shadow-[0_4px_20px_rgba(43,108,246,0.15)] ring-1 ring-[#2b6cf6]/40"
                  : "border-[#2b2d35] hover:border-[#3a3d47]"
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    {preset.label}
                  </h3>
                  <span className="inline-block mt-0.5 text-[10px] text-[#9ba0a8] font-medium">
                    قطاع {preset.industry}
                  </span>
                </div>

                {/* Accent Swatch & Count */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div
                    data-testid={`template-accent-${preset.id}`}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-full border border-white/10 bg-black/30"
                    title={`لون الأكسنت: ${preset.style.accent}`}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: preset.style.accent }}
                    />
                    <span className="text-[9px] font-mono font-medium text-[#d1d5db]">
                      {preset.style.accent}
                    </span>
                  </div>
                  <span
                    data-testid={`template-sections-count-${preset.id}`}
                    className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#2a2d36] text-[#b0b5be] font-medium"
                  >
                    {preset.sections.length} أقسام
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-[11px] text-[#9ba0a8] leading-relaxed mb-3">
                {preset.description}
              </p>

              {/* Ordered Sections List */}
              <div className="mb-3 rounded-lg bg-[#16171b] p-2 border border-[#262830]">
                <div className="flex items-center justify-between text-[10px] font-medium text-[#7e8492] mb-1.5 px-0.5">
                  <span>الأقسام المتضمنة:</span>
                  <span className="text-[9px]">بالترتيب</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {preset.sections.map((section, idx) => {
                    const label = SECTION_TYPE_LABELS[section.type] || section.type;
                    const variant = section.variant ? ` (${section.variant})` : "";
                    return (
                      <span
                        key={`${section.type}-${idx}`}
                        className="inline-flex items-center gap-1 text-[9.5px] px-2 py-0.5 rounded bg-[#23252c] text-[#d1d5db] border border-[#2e313b]"
                        title={`${idx + 1}. ${section.type}${variant}`}
                      >
                        <span className="text-[8.5px] font-mono text-[#7e8492]">{idx + 1}</span>
                        <span className="truncate max-w-[120px]">{label}{variant}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Mini Preview Drawer */}
              {isPreviewing && (
                <div className="mb-3 p-2.5 rounded-lg bg-[#131418] border border-[#2b6cf6]/30 text-[11px] space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-[#9ba0a8]">
                    <span>الهوية البصرية للقالب:</span>
                    <span className="flex items-center gap-1">
                      <span className="text-[9.5px]">الكثافة:</span>
                      <span className="font-semibold text-white">{preset.style.density}</span>
                      <span className="mx-1">·</span>
                      <span className="text-[9.5px]">الاستدارة:</span>
                      <span className="font-semibold text-white">{preset.style.radius}px</span>
                    </span>
                  </div>
                  <div
                    className="h-1.5 w-full rounded-full"
                    style={{ backgroundColor: preset.style.accent }}
                  />
                  <ol className="space-y-1 text-[10px] text-[#c5c8d0] list-decimal list-inside pr-1">
                    {preset.sections.map((s, idx) => (
                      <li key={idx} className="truncate">
                        <span className="font-medium text-white">
                          {SECTION_TYPE_LABELS[s.type] || s.type}
                        </span>
                        {s.variant && (
                          <span className="text-[9px] text-[#9ba0a8] mr-1">({s.variant})</span>
                        )}
                        {s.settings?.title && typeof s.settings.title === "string" && (
                          <span className="text-[#888e9b] text-[9px] mr-1 truncate">
                            — «{s.settings.title}»
                          </span>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  data-testid={`template-preview-btn-${preset.id}`}
                  onClick={() =>
                    setPreviewPresetId(previewPresetId === preset.id ? null : preset.id)
                  }
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-[11px] font-medium border transition-colors ${
                    isPreviewing
                      ? "bg-[#252830] border-[#3b404d] text-white"
                      : "bg-[#26282e] border-[#32353d] text-[#c5c8d0] hover:bg-[#2e313a] hover:text-white"
                  }`}
                >
                  <EyeIcon className="h-3.5 w-3.5" />
                  <span>{isPreviewing ? "إخفاء التفاصيل" : "معاينة"}</span>
                </button>

                <button
                  type="button"
                  data-testid={`template-apply-btn-${preset.id}`}
                  onClick={() => setConfirmPreset(preset)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-[11px] font-bold bg-[#2b6cf6] text-white hover:bg-[#2563eb] active:scale-[0.98] transition-all shadow-xs"
                >
                  <CheckIcon className="h-3.5 w-3.5" />
                  <span>استخدم القالب</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      )}

      {/* Confirmation Modal Overlay */}
      {confirmPreset && (
        <div
          data-testid="template-confirm-modal"
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4"
        >
          <div className="w-full max-w-xs rounded-xl bg-[#202227] border border-[#373a46] p-4 shadow-2xl text-start animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <ExclamationTriangleIcon className="h-5 w-5 shrink-0" />
              <h4 className="text-xs font-bold text-white">تأكيد تطبيق القالب</h4>
            </div>

            <p className="text-[11px] text-[#d1d5db] leading-relaxed mb-3">
              هيتم استبدال محتوى الصفحة الحالية — التغييرات الحالية محفوظة كإصدار في السجل
            </p>

            <div className="rounded-lg bg-[#17181c] p-2.5 border border-[#2a2d36] mb-3 text-[10px] space-y-1">
              <div className="flex justify-between">
                <span className="text-[#9ba0a8]">الصفحة المستهدفة:</span>
                <span className="font-bold text-white">{activePageKey}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9ba0a8]">القالب المختار:</span>
                <span className="font-bold text-white">{confirmPreset.label}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#9ba0a8]">أكسنت الهوية:</span>
                <div className="flex items-center gap-1 font-mono">
                  <span
                    className="h-2.5 w-2.5 rounded-full inline-block"
                    style={{ backgroundColor: confirmPreset.style.accent }}
                  />
                  <span>{confirmPreset.style.accent}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9ba0a8]">عدد الأقسام:</span>
                <span className="font-semibold text-white">{confirmPreset.sections.length} أقسام</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                data-testid={`template-confirm-apply-${confirmPreset.id}`}
                onClick={handleConfirmApply}
                className="flex-1 py-1.5 px-3 rounded-lg text-[11px] font-bold bg-[#2b6cf6] text-white hover:bg-[#2563eb] active:scale-[0.98] transition-all"
              >
                تأكيد واستبدال
              </button>
              <button
                type="button"
                data-testid="template-cancel-apply"
                onClick={() => setConfirmPreset(null)}
                className="py-1.5 px-3 rounded-lg text-[11px] font-medium bg-[#2a2d36] text-[#c5c8d0] hover:bg-[#323640] transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
