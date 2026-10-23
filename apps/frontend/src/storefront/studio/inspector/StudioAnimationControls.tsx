import React, { useState, useEffect } from "react";
import {
  PlayIcon,
  SparklesIcon,
  ArrowUpIcon,
  EyeIcon,
  ArrowsPointingOutIcon,
  ArrowRightIcon,
  CursorArrowRaysIcon,
} from "@heroicons/react/24/outline";
import type {
  AnimationEntranceType,
  AnimationHoverType,
  SectionAnimationSettings,
} from "../../layout/StorefrontSectionFrame";

export interface StudioAnimationControlsProps {
  settings: Record<string, any>;
  onUpdateField: (field: string, value: any) => void;
  onBatchUpdateFields?: (updates: Record<string, any>) => void;
  onSave?: () => void;
}

export const StudioAnimationControls: React.FC<StudioAnimationControlsProps> = ({
  settings,
  onUpdateField,
  onSave,
}) => {
  const animation: SectionAnimationSettings = settings?.animation || {};
  const entrance = animation.entrance || {};
  const entranceType: AnimationEntranceType = entrance.type || "none";
  const entranceDuration: number = entrance.duration ?? 600;
  const entranceDelay: number = entrance.delay ?? 0;
  const hoverType: AnimationHoverType = animation.hover || "none";
  const parallax: boolean = Boolean(animation.parallax);

  // Live mini preview trigger
  const [isPreviewRunning, setIsPreviewRunning] = useState<boolean>(true);

  const handleTriggerPreview = () => {
    setIsPreviewRunning(false);
    setTimeout(() => {
      setIsPreviewRunning(true);
    }, 60);
  };

  useEffect(() => {
    // Automatically re-run preview when animation parameters change
    handleTriggerPreview();
  }, [entranceType, entranceDuration, entranceDelay, hoverType]);

  const updateAnimation = (updates: Partial<SectionAnimationSettings>) => {
    const nextAnim: SectionAnimationSettings = {
      ...animation,
      ...updates,
    };
    onUpdateField("animation", nextAnim);
    onSave?.();
  };

  const updateEntrance = (
    entranceUpdates: Partial<NonNullable<SectionAnimationSettings["entrance"]>>
  ) => {
    const nextEntrance = {
      type: entranceType,
      duration: entranceDuration,
      delay: entranceDelay,
      ...entranceUpdates,
    };
    updateAnimation({ entrance: nextEntrance });
  };

  const entranceOptions: Array<{
    id: AnimationEntranceType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: "none", label: "بدون", icon: SparklesIcon },
    { id: "fade", label: "ظهور ناعم", icon: EyeIcon },
    { id: "slide-up", label: "صعود لأعلى", icon: ArrowUpIcon },
    { id: "slide-right", label: "انزلاق لليمين", icon: ArrowRightIcon },
    { id: "zoom", label: "تكبير تدريجي", icon: ArrowsPointingOutIcon },
  ];

  const hoverOptions: Array<{
    id: AnimationHoverType;
    label: string;
    desc: string;
  }> = [
    { id: "none", label: "بدون", desc: "لا يتغير عند التمرير" },
    { id: "lift", label: "رفع (Lift)", desc: "ارتفاع خفيف -4px مع ظل ناعم" },
    { id: "scale", label: "تكبير (Scale)", desc: "تكبير ناعم بنسبة 102%" },
    { id: "glow", label: "توهج (Glow)", desc: "إضاءة بظل لون الهوية" },
  ];

  return (
    <div className="space-y-4 text-start text-[#17181c]" data-testid="studio-animation-controls">
      {/* ─────────────────────────────────────────────────────────────
       * 1. Interactive Mini Preview Card & "جرّب" button
       * ───────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-[#ececee] bg-[#f8fafc] p-3 shadow-xs">
        <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#ececee]">
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#2b6cf6]/10 text-[#2b6cf6]">
              <SparklesIcon className="h-3.5 w-3.5" />
            </span>
            <span className="text-[11px] font-bold text-[#1e293b]">معاينة الحركة</span>
          </div>
          <button
            type="button"
            data-testid="animation-preview-trigger"
            onClick={handleTriggerPreview}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#2b6cf6] hover:bg-[#2057d5] active:scale-97 text-white text-[10.5px] font-bold transition-all shadow-xs cursor-pointer"
            title="إعادة تشغيل الحركة لمعاينتها"
          >
            <PlayIcon className="h-3 w-3" />
            <span>جرّب</span>
          </button>
        </div>

        {/* Animated preview container */}
        <div className="py-3 flex items-center justify-center min-h-[96px] overflow-hidden bg-white/70 rounded-lg border border-dashed border-[#e2e8f0]">
          <div
            data-anim-in={entranceType}
            data-anim-hover={hoverType}
            data-testid="animation-preview-box"
            className={`w-[170px] rounded-lg border border-[#e2e8f0] bg-white p-2.5 shadow-xs cursor-pointer select-none transition-all ${
              isPreviewRunning && entranceType !== "none" ? "is-visible" : ""
            } ${hoverType !== "none" ? `sf-anim-hover-${hoverType}` : ""}`}
            style={{
              transitionDuration: `${entranceDuration}ms`,
              transitionDelay: `${entranceDelay}ms`,
              ...(isPreviewRunning || entranceType === "none"
                ? { opacity: 1, transform: "none" }
                : entranceType === "slide-up"
                ? { opacity: 0, transform: "translateY(24px)" }
                : entranceType === "slide-right"
                ? { opacity: 0, transform: "translateX(-24px)" }
                : entranceType === "zoom"
                ? { opacity: 0, transform: "scale(0.92)" }
                : entranceType === "fade"
                ? { opacity: 0 }
                : {}),
            }}
          >
            <div className="h-2 w-10 rounded-full bg-[#2b6cf6]/20 mx-auto mb-1.5" />
            <div className="h-3 w-24 rounded bg-[#0f172a] mx-auto mb-1" />
            <div className="h-2 w-16 rounded bg-[#cbd5e1] mx-auto" />
          </div>
        </div>

        <p className="mt-2 text-center text-[9.5px] text-[#64748b]">
          {hoverType !== "none"
            ? "مرّر الماوس فوق البطاقة لتجربة الهوفر، أو اضغط «جرّب» لمشاهدة الدخول."
            : "اضغط «جرّب» لاختبار حركة الدخول بالمدة والتأخير المحددين."}
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────────────
       * 2. Entrance Animation Controls (حركة الدخول عند السكرول)
       * ───────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-[#ececee] bg-white p-3 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-[#1e293b]">
            حركة الدخول (Scroll Entrance)
          </label>
          <span className="text-[9.5px] font-medium text-[#64748b]">
            تظهر عند وصول الزائر
          </span>
        </div>

        {/* Entrance Type Grid */}
        <div className="grid grid-cols-2 gap-1.5" data-testid="animation-entrance-type">
          {entranceOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = entranceType === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                data-selected={isSelected ? "true" : undefined}
                data-entrance-type={opt.id}
                onClick={() => updateEntrance({ type: opt.id })}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10.5px] font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#2b6cf6] bg-[#2b6cf6]/10 text-[#2b6cf6] shadow-xs"
                    : "border-[#ececee] bg-[#f8fafc] text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Duration & Delay (Visible only if entrance != 'none') */}
        {entranceType !== "none" && (
          <div className="space-y-3 pt-2 border-t border-[#f1f5f9]">
            {/* Duration Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-[#64748b]">
                  مدة الحركة (Duration)
                </label>
                <span className="text-[10px] font-bold text-[#0f172a] tabular-nums font-mono">
                  {entranceDuration} ms
                </span>
              </div>
              <input
                type="range"
                min="200"
                max="1200"
                step="50"
                data-testid="animation-duration-slider"
                value={entranceDuration}
                onChange={(e) => updateEntrance({ duration: Number(e.target.value) })}
                className="w-full accent-[#2b6cf6] cursor-pointer"
              />
              <div className="flex items-center justify-between text-[9px] text-[#94a3b8]">
                <span>200ms (سريع)</span>
                <span>600ms (متوازن)</span>
                <span>1200ms (ناعم)</span>
              </div>
            </div>

            {/* Delay Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-[#64748b]">
                  تأخير الظهور (Delay)
                </label>
                <span className="text-[10px] font-bold text-[#0f172a] tabular-nums font-mono">
                  {entranceDelay} ms
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="800"
                step="50"
                data-testid="animation-delay-slider"
                value={entranceDelay}
                onChange={(e) => updateEntrance({ delay: Number(e.target.value) })}
                className="w-full accent-[#2b6cf6] cursor-pointer"
              />
              <div className="flex items-center justify-between text-[9px] text-[#94a3b8]">
                <span>0ms (فوري)</span>
                <span>200ms</span>
                <span>800ms</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
       * 3. Hover Interaction Controls (تأثير التمرير)
       * ───────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-[#ececee] bg-white p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CursorArrowRaysIcon className="h-4 w-4 text-[#2b6cf6]" />
            <label className="text-[11px] font-bold text-[#1e293b]">
              تأثير التمرير (Hover Effect)
            </label>
          </div>
        </div>

        <div className="space-y-1.5" data-testid="animation-hover-type">
          {hoverOptions.map((opt) => {
            const isSelected = hoverType === opt.id;
            return (
              <label
                key={opt.id}
                data-hover-type={opt.id}
                data-selected={isSelected ? "true" : undefined}
                className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? "border-[#2b6cf6] bg-[#2b6cf6]/5 shadow-xs"
                    : "border-[#ececee] bg-[#f8fafc] hover:bg-[#f1f5f9]"
                }`}
              >
                <input
                  type="radio"
                  name="animationHoverType"
                  value={opt.id}
                  checked={isSelected}
                  onChange={() => updateAnimation({ hover: opt.id })}
                  className="mt-0.5 accent-[#2b6cf6] cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[10.5px] font-bold text-[#0f172a]">
                    {opt.label}
                  </div>
                  <div className="text-[9.5px] text-[#64748b] leading-tight">
                    {opt.desc}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
       * 4. Parallax Scroll Toggle (تأثير البارالاكس)
       * ───────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-[#ececee] bg-white p-3">
        <label
          data-testid="animation-parallax-toggle"
          className="flex items-center justify-between gap-3 cursor-pointer select-none"
        >
          <div>
            <div className="text-[11px] font-bold text-[#1e293b]">
              سكرول بارالاكس (Parallax Scroll)
            </div>
            <p className="mt-0.5 text-[9.5px] text-[#64748b] leading-relaxed">
              تحريك هادئ للقسم (8–20px) أثناء التمرير لإضفاء عمق بصري احترافي.
            </p>
          </div>
          <input
            type="checkbox"
            checked={parallax}
            onChange={(e) => updateAnimation({ parallax: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 accent-[#2b6cf6] cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
};

export default StudioAnimationControls;
