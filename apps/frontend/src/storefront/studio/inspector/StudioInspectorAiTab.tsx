import React, { useState } from "react";
import {
  SparklesIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  DeviceTabletIcon,
  TrashIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import type { StudioDeviceMode } from "../StudioTypes";
import {
  hasDeviceOverrides,
  getDeviceOverridesCount,
  resolveEffectiveSectionSettings,
} from "../utils/studioStyleUtils";
import {
  AI_CAPABILITIES,
  COMING_SOON_NOTICE,
  type AICapabilityId,
} from "./aiCapabilities";

export interface StudioInspectorAiTabProps {
  sectionType: string;
  settings: Record<string, any>;
  deviceMode?: StudioDeviceMode;
  rawSettings?: Record<string, any>;
  onResetField?: (field: string) => void;
  onUpdateField: (field: string, value: any) => void;
  onBatchUpdateFields?: (updates: Record<string, any>) => void;
  onResetDeviceOverrides?: (device: "mobile" | "tablet") => void;
  onSwitchDevice: (device: StudioDeviceMode) => void;
  // Honest AI capability action handlers
  onCapabilityAction?: (id: AICapabilityId) => void;
  onSuggestSections?: () => void;
  onApplyCopyTemplate?: (template?: string) => void;
}

const ARABIC_COPY_TEMPLATES = [
  {
    title: "عروض الموسم الحصرية — تسوق الآن",
    subtitle: "شحن مجاني وتوصيل سريع لجميع المحافظات مع ضمان استبدال مجاني",
    ctaText: "تسوق العرض الآن",
  },
  {
    title: "تشكيلة جديدة مميزة بتصاميم عصرية",
    subtitle: "أفضل الخامات المختارة بعناية لتناسب ذوقك واحتياجاتك اليومية",
    ctaText: "استكشف التشكيلة",
  },
  {
    title: "خصومات حصرية لفترة محدودة",
    subtitle: "استفد من أفضل الأسعار والخصومات الإضافية عند إتمام طلبك اليوم",
    ctaText: "احصل على الخصم",
  },
] as const;

export const StudioInspectorAiTab: React.FC<StudioInspectorAiTabProps> = ({
  sectionType,
  settings,
  deviceMode = "desktop",
  onUpdateField,
  onBatchUpdateFields,
  onResetDeviceOverrides,
  onSwitchDevice,
  onCapabilityAction,
  onSuggestSections,
  onApplyCopyTemplate,
}) => {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const responsive =
    settings.responsive ||
    settings.config?.responsive ||
    settings.settings?.responsive ||
    {};

  const mobileOverrides = responsive.mobile || {};
  const tabletOverrides = responsive.tablet || {};

  const hasMobile = hasDeviceOverrides(settings, "mobile");
  const hasTablet = hasDeviceOverrides(settings, "tablet");
  const mobileCount = getDeviceOverridesCount(settings, "mobile");
  const tabletCount = getDeviceOverridesCount(settings, "tablet");

  const effectiveMobile = resolveEffectiveSectionSettings(settings, "mobile");

  const handleApplyCompactMobile = () => {
    if (onBatchUpdateFields) {
      onBatchUpdateFields({
        paddingTop: 16,
        paddingBottom: 16,
        paddingRight: 12,
        paddingLeft: 12,
      });
    } else {
      onUpdateField("paddingTop", 16);
      onUpdateField("paddingBottom", 16);
    }
  };

  const handleApplyStandardMobile = () => {
    if (onBatchUpdateFields) {
      onBatchUpdateFields({
        paddingTop: 24,
        paddingBottom: 24,
        paddingRight: 16,
        paddingLeft: 16,
      });
    } else {
      onUpdateField("paddingTop", 24);
      onUpdateField("paddingBottom", 24);
    }
  };

  const handleApplyCopyTemplate = (tmpl: {
    title: string;
    subtitle: string;
    ctaText?: string;
  }) => {
    if (onBatchUpdateFields) {
      onBatchUpdateFields({
        title: tmpl.title,
        heading: tmpl.title,
        subtitle: tmpl.subtitle,
        description: tmpl.subtitle,
        ...(tmpl.ctaText ? { buttonText: tmpl.ctaText, ctaText: tmpl.ctaText } : {}),
      });
    } else {
      onUpdateField("title", tmpl.title);
      onUpdateField("subtitle", tmpl.subtitle);
    }
    setFeedbackMessage(`تم تطبيق «${tmpl.title}»`);
  };

  const handleExecuteCapability = (id: AICapabilityId) => {
    onCapabilityAction?.(id);

    if (id === "section-suggestions") {
      onSuggestSections?.();
      setActiveFeature((prev) =>
        prev === "section-suggestions" ? null : "section-suggestions"
      );
      setFeedbackMessage("تم فتح دليل الأقسام المقترحة لمتجرك");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("storefront:open-elements-panel"));
      }
    } else if (id === "copy-templates") {
      onApplyCopyTemplate?.("default");
      handleApplyCopyTemplate(ARABIC_COPY_TEMPLATES[0]);
      setActiveFeature((prev) =>
        prev === "copy-templates" ? null : "copy-templates"
      );
    }
  };

  return (
    <div className="space-y-3.5 select-none text-[11.5px] text-[#17181c]">
      {/* 0. Honest AI Capabilities Panel */}
      <div
        data-testid="ai-capabilities-panel"
        className="rounded-xl border border-[#ececee] bg-white p-3 space-y-2.5 text-start"
      >
        <div className="flex items-center justify-between border-b border-[#f0f1f3] pb-2">
          <div className="flex items-center gap-1.5">
            <SparklesIcon className="h-4 w-4 text-[#2b6cf6]" />
            <b className="text-[11.5px] font-bold text-[#17181c]">
              قدرات مساعد المتجر (AI)
            </b>
          </div>
          <span className="rounded bg-[#2b6cf6]/10 px-2 py-0.5 text-[9.5px] font-bold text-[#2b6cf6]">
            2 مفعّلة · 3 قريباً
          </span>
        </div>

        {feedbackMessage && (
          <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200/60 p-2 text-[10px] font-semibold text-emerald-700">
            <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        <div className="space-y-2" data-testid="ai-capabilities-list">
          {AI_CAPABILITIES.map((cap) => {
            const isAvailable = cap.status === "available";
            const isComingSoon = cap.status === "coming_soon";

            return (
              <div
                key={cap.id}
                data-testid={`capability-card-${cap.id}`}
                data-capability-id={cap.id}
                data-status={cap.status}
                className={`rounded-lg border p-2.5 space-y-2 transition-all ${
                  isAvailable
                    ? "border-[#e2e8f0] bg-[#f8fafc]/50 hover:border-[#2b6cf6]/40"
                    : "border-[#f1f5f9] bg-[#fbfcfd]"
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span className="font-bold text-[11px] text-[#1e293b]">
                    {cap.label}
                  </span>
                  {isAvailable ? (
                    <span
                      data-testid={`badge-${cap.id}`}
                      className="rounded bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700"
                    >
                      متاح
                    </span>
                  ) : (
                    <span
                      data-testid={`badge-${cap.id}`}
                      className="rounded bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[9px] font-bold text-slate-500"
                    >
                      قريبًا
                    </span>
                  )}
                </div>

                {isComingSoon && (
                  <p className="text-[10px] text-[#64748b] leading-relaxed">
                    {COMING_SOON_NOTICE}
                  </p>
                )}

                <button
                  type="button"
                  disabled={isComingSoon}
                  aria-disabled={isComingSoon ? "true" : undefined}
                  data-testid={`btn-${cap.id}`}
                  onClick={() => {
                    if (isComingSoon) return;
                    handleExecuteCapability(cap.id);
                  }}
                  className={`w-full flex items-center justify-center gap-1.5 rounded-lg py-1.5 px-2.5 text-[10.5px] font-bold transition-all ${
                    isAvailable
                      ? "border border-[#2b6cf6] bg-[#2b6cf6] text-white hover:bg-[#2057d5] shadow-2xs active:scale-[0.98] cursor-pointer"
                      : "border border-[#e2e8f0] bg-[#f1f5f9] text-[#94a3b8] cursor-not-allowed select-none opacity-80"
                  }`}
                >
                  <span>{cap.label}</span>
                  {isComingSoon && (
                    <span className="text-[9px] font-medium text-[#94a3b8]">
                      (قريبًا)
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Dynamic sub-panel for section suggestions */}
        {activeFeature === "section-suggestions" && (
          <div
            data-testid="panel-section-suggestions"
            className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-2.5 space-y-2 mt-2"
          >
            <span className="block text-[10px] font-bold text-[#64748b]">
              أقسام موصى بها لمتجرك:
            </span>
            <div className="grid grid-cols-1 gap-1.5 text-[10px]">
              <div className="flex items-center justify-between rounded bg-white p-2 border border-[#ececee]">
                <span className="font-semibold text-[#1e293b]">
                  بانر عروض وترويج رئيسي
                </span>
                <span className="text-[9px] text-[#64748b]">hero-banner</span>
              </div>
              <div className="flex items-center justify-between rounded bg-white p-2 border border-[#ececee]">
                <span className="font-semibold text-[#1e293b]">
                  شبكة منتجات مميزة
                </span>
                <span className="text-[9px] text-[#64748b]">product-grid</span>
              </div>
              <div className="flex items-center justify-between rounded bg-white p-2 border border-[#ececee]">
                <span className="font-semibold text-[#1e293b]">
                  آراء وتجارب العملاء
                </span>
                <span className="text-[9px] text-[#64748b]">testimonials</span>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic sub-panel for copy templates */}
        {activeFeature === "copy-templates" && (
          <div
            data-testid="panel-copy-templates"
            className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-2.5 space-y-2 mt-2"
          >
            <span className="block text-[10px] font-bold text-[#64748b]">
              اختر قالب نص عربي للتطبيق:
            </span>
            <div className="space-y-1.5">
              {ARABIC_COPY_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  data-testid={`template-btn-${idx}`}
                  onClick={() => handleApplyCopyTemplate(tmpl)}
                  className="w-full text-start rounded bg-white p-2 border border-[#ececee] hover:border-[#2b6cf6] transition-colors"
                >
                  <p className="font-bold text-[10.5px] text-[#1e293b]">
                    {tmpl.title}
                  </p>
                  <p className="text-[9.5px] text-[#64748b] mt-0.5">
                    {tmpl.subtitle}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 1. Device Switcher Card */}
      <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3 space-y-2 text-start">
        <span className="block text-[10px] font-bold text-[#64748b]">
          الجهاز النشط للتحرير (Active Viewport)
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => onSwitchDevice("desktop")}
            className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-[10.5px] font-bold transition-all ${
              deviceMode === "desktop"
                ? "border-[#2b6cf6] bg-white text-[#2b6cf6] shadow-xs"
                : "border-[#e2e8f0] bg-white/60 text-[#64748b] hover:text-[#1e293b]"
            }`}
          >
            <ComputerDesktopIcon className="h-3.5 w-3.5" />
            <span>كمبيوتر</span>
          </button>

          <button
            type="button"
            onClick={() => onSwitchDevice("tablet")}
            className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-[10.5px] font-bold transition-all relative ${
              deviceMode === "tablet"
                ? "border-[#2b6cf6] bg-white text-[#2b6cf6] shadow-xs"
                : "border-[#e2e8f0] bg-white/60 text-[#64748b] hover:text-[#1e293b]"
            }`}
          >
            <DeviceTabletIcon className="h-3.5 w-3.5" />
            <span>تابلت</span>
            {hasTablet && (
              <span className="absolute top-1 end-1 h-1.5 w-1.5 rounded-full bg-[#2b6cf6]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onSwitchDevice("mobile")}
            className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-[10.5px] font-bold transition-all relative ${
              deviceMode === "mobile"
                ? "border-[#2b6cf6] bg-white text-[#2b6cf6] shadow-xs"
                : "border-[#e2e8f0] bg-white/60 text-[#64748b] hover:text-[#1e293b]"
            }`}
          >
            <DevicePhoneMobileIcon className="h-3.5 w-3.5" />
            <span>جوال</span>
            {hasMobile && (
              <span className="absolute top-1 end-1 h-1.5 w-1.5 rounded-full bg-[#2b6cf6]" />
            )}
          </button>
        </div>
      </div>

      {/* 2. Mobile Responsive Status Card */}
      <div className="rounded-xl border border-[#ececee] bg-white p-3 space-y-2 text-start">
        <div className="flex items-center justify-between border-b border-[#f0f1f3] pb-2">
          <div className="flex items-center gap-1.5">
            <DevicePhoneMobileIcon className="h-4 w-4 text-[#2b6cf6]" />
            <b className="text-[11.5px] font-bold text-[#17181c]">
              شاشة الجوال (&lt; 768px)
            </b>
          </div>
          {hasMobile ? (
            <span className="rounded bg-[#2b6cf6]/10 px-2 py-0.5 text-[9.5px] font-bold text-[#2b6cf6]">
              {mobileCount} تخصيص نشط
            </span>
          ) : (
            <span className="rounded bg-[#f4f5f7] px-2 py-0.5 text-[9.5px] font-medium text-[#8a8f96]">
              يرث من الديسكتوب
            </span>
          )}
        </div>

        {hasMobile ? (
          <div className="space-y-1.5">
            <div className="rounded-lg bg-[#f8fafc] p-2 space-y-1 text-[10.5px]">
              {Object.entries(mobileOverrides).map(([key, val]) => (
                <div
                  key={key}
                  className="flex items-center justify-between font-mono"
                >
                  <span className="text-[#64748b]">{key}:</span>
                  <span className="font-bold text-[#1e293b]">
                    {String(val)}px
                  </span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => onResetDeviceOverrides?.("mobile")}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50/60 py-1.5 text-[10.5px] font-bold text-red-600 hover:bg-red-50 transition-colors"
            >
              <TrashIcon className="h-3 w-3" />
              <span>تصفير قيم الجوال والعودة للوراثة</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[10.5px] text-[#8a8f96] leading-relaxed">
              هذا القسم يرث كافة المسافات والتنسيقات من سطح المكتب تلقائيًا. بدّل
              إلى وضع الجوال لتخصيص قيم مستقلة.
            </p>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  onSwitchDevice("mobile");
                  handleApplyCompactMobile();
                }}
                className="rounded-lg border border-[#ececee] bg-[#f8fafc] p-2 text-center text-[10px] font-semibold text-[#17181c] hover:border-[#2b6cf6] transition-colors"
              >
                <span>مضغوط (16px)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onSwitchDevice("mobile");
                  handleApplyStandardMobile();
                }}
                className="rounded-lg border border-[#ececee] bg-[#f8fafc] p-2 text-center text-[10px] font-semibold text-[#17181c] hover:border-[#2b6cf6] transition-colors"
              >
                <span>قياسي (24px)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Tablet Responsive Status Card */}
      <div className="rounded-xl border border-[#ececee] bg-white p-3 space-y-2 text-start">
        <div className="flex items-center justify-between border-b border-[#f0f1f3] pb-2">
          <div className="flex items-center gap-1.5">
            <DeviceTabletIcon className="h-4 w-4 text-[#64748b]" />
            <b className="text-[11.5px] font-bold text-[#17181c]">
              شاشة التابلت (768–1023px)
            </b>
          </div>
          {hasTablet ? (
            <span className="rounded bg-[#2b6cf6]/10 px-2 py-0.5 text-[9.5px] font-bold text-[#2b6cf6]">
              {tabletCount} تخصيص نشط
            </span>
          ) : (
            <span className="rounded bg-[#f4f5f7] px-2 py-0.5 text-[9.5px] font-medium text-[#8a8f96]">
              يرث من الديسكتوب
            </span>
          )}
        </div>

        {hasTablet ? (
          <div className="space-y-1.5">
            <div className="rounded-lg bg-[#f8fafc] p-2 space-y-1 text-[10.5px]">
              {Object.entries(tabletOverrides).map(([key, val]) => (
                <div
                  key={key}
                  className="flex items-center justify-between font-mono"
                >
                  <span className="text-[#64748b]">{key}:</span>
                  <span className="font-bold text-[#1e293b]">
                    {String(val)}px
                  </span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => onResetDeviceOverrides?.("tablet")}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50/60 py-1.5 text-[10.5px] font-bold text-red-600 hover:bg-red-50 transition-colors"
            >
              <TrashIcon className="h-3 w-3" />
              <span>تصفير قيم التابلت والعودة للوراثة</span>
            </button>
          </div>
        ) : (
          <p className="text-[10.5px] text-[#8a8f96] leading-relaxed">
            يرث تلقائيًا من سطح المكتب دون حاجة لتخصيص إلا عند الرغبة في تعديل
            المسافات للتابلت.
          </p>
        )}
      </div>
    </div>
  );
};
