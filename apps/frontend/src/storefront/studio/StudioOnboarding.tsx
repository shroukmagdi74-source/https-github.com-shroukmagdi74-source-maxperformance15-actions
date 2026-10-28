import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Squares2X2Icon,
  PlusCircleIcon,
  PencilSquareIcon,
  ArrowUpTrayIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

export const STUDIO_ONBOARDING_STORAGE_KEY = "sf_studio_onboarded_v1";

export interface OnboardingStep {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  targetHintAr: string;
  targetHintEn: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "discover-elements",
    titleAr: "الكشف عن العناصر",
    titleEn: "Discover Elements",
    descAr: "تصفح مكتبة العناصر والأقسام الجاهزة من القائمة الجانبية، حيث يمكنك استعراض كافة المكونات المتاحة لبناء متجرك.",
    descEn: "Explore the library of ready-made sections and elements in the side panel to discover all building blocks.",
    targetHintAr: "القائمة الجانبية اليسرى",
    targetHintEn: "Left Sidebar Rail",
    icon: Squares2X2Icon,
  },
  {
    id: "add-section",
    titleAr: "إضافة قسم",
    titleEn: "Add Section",
    descAr: "اختر القسم المناسب من القائمة وأضفه بضغطة زر واحدة أو بالسحب والإفلات مباشرة إلى مساحة العمل في الكانفس.",
    descEn: "Choose any section and add it with a single click or drag-and-drop directly onto your canvas stage.",
    targetHintAr: "مساحة عمل الكانفس",
    targetHintEn: "Canvas Stage",
    icon: PlusCircleIcon,
  },
  {
    id: "edit-text",
    titleAr: "تحرير نص",
    titleEn: "Edit Content",
    descAr: "انقر على أي عنصر أو نص في الكانفس لتعديل المحتوى والخطوط والصور والألوان فورا من لوحة الخصائص المخصصة.",
    descEn: "Click on any element or text in the canvas to adjust content, typography, images, and colors in the inspector.",
    targetHintAr: "لوحة الخصائص والتفتيش",
    targetHintEn: "Property Inspector",
    icon: PencilSquareIcon,
  },
  {
    id: "publish-store",
    titleAr: "نشر",
    titleEn: "Publish Store",
    descAr: "بعد إتمام مراجعة متجرك وتعديلاته، اضغط على زر النشر في الشريط العلوي لتصبح جميع التغييرات مباشرة لعملائك.",
    descEn: "After reviewing your store layout, click Publish in the top bar to make all your updates live immediately.",
    targetHintAr: "الشريط العلوي",
    targetHintEn: "Top Navigation Bar",
    icon: ArrowUpTrayIcon,
  },
];

const safeGetStorageItem = (key: string): string | null => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // fallback to globalThis
  }
  try {
    if (typeof globalThis !== "undefined" && (globalThis as any).localStorage) {
      return (globalThis as any).localStorage.getItem(key);
    }
  } catch {
    // ignore
  }
  return null;
};

const safeSetStorageItem = (key: string, value: string): void => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
  } catch {
    // fallback
  }
  try {
    if (typeof globalThis !== "undefined" && (globalThis as any).localStorage) {
      (globalThis as any).localStorage.setItem(key, value);
    }
  } catch {
    // ignore
  }
};

const safeRemoveStorageItem = (key: string): void => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(key);
      return;
    }
  } catch {
    // fallback
  }
  try {
    if (typeof globalThis !== "undefined" && (globalThis as any).localStorage) {
      (globalThis as any).localStorage.removeItem(key);
    }
  } catch {
    // ignore
  }
};

/**
 * Checks whether the onboarding tour was completed, either via localStorage
 * or through server-provided state flags.
 */
export const isOnboardingCompleted = (
  storageKey: string = STUDIO_ONBOARDING_STORAGE_KEY,
  serverOnboarded?: boolean
): boolean => {
  if (serverOnboarded) {
    return true;
  }
  return safeGetStorageItem(storageKey) === "true";
};

/**
 * Marks onboarding as completed in localStorage.
 */
export const markOnboardingCompleted = (
  storageKey: string = STUDIO_ONBOARDING_STORAGE_KEY
): void => {
  safeSetStorageItem(storageKey, "true");
};

/**
 * Resets onboarding completion state (useful for test resets).
 */
export const resetOnboarding = (
  storageKey: string = STUDIO_ONBOARDING_STORAGE_KEY
): void => {
  safeRemoveStorageItem(storageKey);
};

export interface StudioOnboardingProps {
  isOpen?: boolean;
  onClose?: () => void;
  onStartFromTemplate?: () => void;
  storageKey?: string;
  serverOnboarded?: boolean;
  lang?: "ar" | "en";
}

export const StudioOnboarding: React.FC<StudioOnboardingProps> = ({
  isOpen: propIsOpen,
  onClose,
  onStartFromTemplate,
  storageKey = STUDIO_ONBOARDING_STORAGE_KEY,
  serverOnboarded = false,
  lang: propLang,
}) => {
  let i18nLang = "";
  try {
    const { i18n } = useTranslation();
    i18nLang = i18n?.language || "";
  } catch {
    // In standalone test environments where i18next context is not provided
  }

  // Determine active language
  const activeLang: "ar" | "en" =
    propLang ||
    (i18nLang && i18nLang.toLowerCase().startsWith("en") ? "en" : "ar");
  const isAr = activeLang === "ar";

  // Internal state when component is used uncontrolled
  const [internalOpen, setInternalOpen] = useState<boolean>(() => {
    return !isOnboardingCompleted(storageKey, serverOnboarded);
  });

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Sync internal state if propIsOpen is provided
  const isVisible = propIsOpen !== undefined ? propIsOpen : internalOpen;

  const handleDismiss = useCallback(() => {
    markOnboardingCompleted(storageKey);
    setInternalOpen(false);
    onClose?.();
  }, [storageKey, onClose]);

  const handleStartFromTemplate = useCallback(() => {
    markOnboardingCompleted(storageKey);
    setInternalOpen(false);
    onClose?.();
    onStartFromTemplate?.();
  }, [storageKey, onClose, onStartFromTemplate]);

  const handleNext = () => {
    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleDismiss();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  // Keyboard navigation & accessibility
  useEffect(() => {
    if (!isVisible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss();
      } else if (e.key === "ArrowRight") {
        if (isAr) handlePrev();
        else handleNext();
      } else if (e.key === "ArrowLeft") {
        if (isAr) handleNext();
        else handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, currentStepIndex, isAr, handleDismiss]);

  // CRITICAL: When not visible, return null so canvas is NEVER obstructed or covered!
  if (!isVisible) {
    return null;
  }

  const step = ONBOARDING_STEPS[currentStepIndex];
  const StepIcon = step.icon;
  const isLastStep = currentStepIndex === ONBOARDING_STEPS.length - 1;

  const labels = {
    titlePrefix: isAr ? "دليل بداية الاستوديو" : "Studio Quickstart",
    skip: isAr ? "تخطي" : "Skip",
    startFromTemplate: isAr ? "ابدأ من قالب جاهز" : "Start from a template",
    next: isAr ? "التالي" : "Next",
    prev: isAr ? "السابق" : "Previous",
    finish: isAr ? "إنهاء" : "Finish",
    stepOf: isAr
      ? `الخطوة ${currentStepIndex + 1} من ${ONBOARDING_STEPS.length}`
      : `Step ${currentStepIndex + 1} of ${ONBOARDING_STEPS.length}`,
    stepHintLabel: isAr ? "الموقع المستهدف:" : "Target element:",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={labels.titlePrefix}
      data-testid="studio-onboarding-modal"
      dir={isAr ? "rtl" : "ltr"}
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        // Dismiss if clicking outer backdrop
        if (e.target === e.currentTarget) {
          handleDismiss();
        }
      }}
    >
      <div
        className="relative w-full max-w-[500px] overflow-hidden rounded-2xl border border-[#2a2d33] bg-[#17181c] text-[#e8eaee] shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Progress Track */}
        <div className="h-1 w-full bg-[#202226]">
          <div
            className="h-full bg-[#2b6cf6] transition-all duration-300 ease-out"
            style={{
              width: `${((currentStepIndex + 1) / ONBOARDING_STEPS.length) * 100}%`,
            }}
          />
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#202226] px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2b6cf6]/20 text-[#60a5fa]">
              <SparklesIcon className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white">
                {labels.titlePrefix}
              </h2>
              <span
                data-testid="onboarding-step-indicator"
                className="text-[11px] font-medium text-[#9ba0a8] tabular-nums"
              >
                {labels.stepOf}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="onboarding-skip-btn"
              onClick={handleDismiss}
              className="rounded-lg px-2.5 py-1 text-xs font-semibold text-[#9ba0a8] hover:bg-[#202226] hover:text-white transition-colors"
            >
              {labels.skip}
            </button>
            <button
              type="button"
              data-testid="onboarding-close-btn"
              onClick={handleDismiss}
              aria-label={labels.skip}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#9ba0a8] hover:bg-[#202226] hover:text-white transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Body / Active Step Content */}
        <div className="px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#202226] border border-[#2a2d33] text-[#2b6cf6]">
              <StepIcon className="h-6 w-6" />
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3
                  data-testid="onboarding-step-title"
                  className="text-base font-bold text-white tracking-tight"
                >
                  {isAr ? step.titleAr : step.titleEn}
                </h3>
              </div>
              <p
                data-testid="onboarding-step-desc"
                className="text-xs leading-relaxed text-[#9ba0a8]"
              >
                {isAr ? step.descAr : step.descEn}
              </p>
            </div>
          </div>

          {/* Target location hint badge */}
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#202226]/60 border border-[#26282e] px-3 py-2 text-[11px] text-[#808791]">
            <span className="font-semibold text-[#c3c7cd]">
              {labels.stepHintLabel}
            </span>
            <span className="text-[#60a5fa] font-medium">
              {isAr ? step.targetHintAr : step.targetHintEn}
            </span>
          </div>

          {/* Dots Indicator */}
          <div className="mt-5 flex items-center justify-center gap-1.5">
            {ONBOARDING_STEPS.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                data-testid={`onboarding-dot-${idx}`}
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStepIndex
                    ? "w-6 bg-[#2b6cf6]"
                    : "w-1.5 bg-[#32353b] hover:bg-[#484c55]"
                }`}
                aria-label={`Step ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Modal Footer / Navigation Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 border-t border-[#202226] bg-[#121316] px-5 py-3.5">
          {/* Start from template button */}
          <button
            type="button"
            data-testid="onboarding-start-template-btn"
            onClick={handleStartFromTemplate}
            className="flex h-8 w-full sm:w-auto items-center justify-center gap-1.5 rounded-lg border border-[#32353b] bg-[#202226] px-3 text-xs font-semibold text-[#e8eaee] hover:bg-[#282b30] hover:text-white active:scale-[0.98] transition-all"
          >
            <SparklesIcon className="h-3.5 w-3.5 text-[#60a5fa]" />
            <span>{labels.startFromTemplate}</span>
          </button>

          {/* Stepper buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {currentStepIndex > 0 && (
              <button
                type="button"
                data-testid="onboarding-prev-btn"
                onClick={handlePrev}
                className="flex h-8 items-center gap-1 rounded-lg border border-[#32353b] bg-[#202226] px-3 text-xs font-semibold text-[#e8eaee] hover:bg-[#282b30] hover:text-white active:scale-[0.98] transition-all"
              >
                {isAr ? (
                  <ChevronRightIcon className="h-3.5 w-3.5" />
                ) : (
                  <ChevronLeftIcon className="h-3.5 w-3.5" />
                )}
                <span>{labels.prev}</span>
              </button>
            )}

            <button
              type="button"
              data-testid={isLastStep ? "onboarding-finish-btn" : "onboarding-next-btn"}
              onClick={handleNext}
              className="flex h-8 items-center gap-1 rounded-lg bg-[#2b6cf6] px-4 text-xs font-bold text-white shadow hover:bg-[#1d5ce6] active:scale-[0.98] transition-all"
            >
              <span>{isLastStep ? labels.finish : labels.next}</span>
              {!isLastStep &&
                (isAr ? (
                  <ChevronLeftIcon className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRightIcon className="h-3.5 w-3.5" />
                ))}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
