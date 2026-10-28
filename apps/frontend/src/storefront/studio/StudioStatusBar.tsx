import React from "react";

interface StudioStatusBarProps {
  pageLabel: string;
  selectedSectionLabel?: string;
  selectedSectionType?: string;
  deviceMode: string;
  onOpenShortcuts?: () => void;
  onOpenOnboarding?: () => void;
}

export const StudioStatusBar: React.FC<StudioStatusBarProps> = ({
  pageLabel,
  selectedSectionLabel,
  selectedSectionType,
  deviceMode,
  onOpenShortcuts,
  onOpenOnboarding,
}) => {
  return (
    <footer
      role="status"
      aria-label="شريط معلومات الاستوديو"
      className="flex h-[30px] w-full shrink-0 items-center justify-between border-t border-[#0c0d0f] bg-[#17181c] px-3.5 text-[11px] text-[#9ba0a8] select-none z-30"
    >
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 overflow-hidden truncate">
        <span>الهيكل</span>
        <span>←</span>
        <span>{pageLabel}</span>
        {selectedSectionLabel && (
          <>
            <span>←</span>
            <span className="text-[#c3c7cd]">{selectedSectionLabel}</span>
            {selectedSectionType && (
              <>
                <span>←</span>
                <b className="text-white font-semibold">{selectedSectionType}</b>
              </>
            )}
          </>
        )}
      </div>

      {/* Breakpoint status */}
      <div className="hidden sm:flex items-center gap-3">
        <span className="text-[10.5px]">
          قواعد المتجاوب: <b className="text-[#e6e8ec] font-semibold">3 نقاط توقف</b> ({deviceMode === "desktop" ? "1280px" : deviceMode === "tablet" ? "768px" : "375px"})
        </span>
      </div>

      {/* Keyboard Shortcuts & Help helper */}
      <div className="flex items-center gap-2 text-[10.5px]">
        <div className="hidden md:flex items-center gap-2">
          <span>اختصارات:</span>
          <span className="rounded bg-[#2a2d33] px-1 py-0.5 text-[9.5px] text-[#808791]">Ctrl+S حفظ</span>
          <span className="rounded bg-[#2a2d33] px-1 py-0.5 text-[9.5px] text-[#808791]">Ctrl+Z تراجع</span>
          <span className="rounded bg-[#2a2d33] px-1 py-0.5 text-[9.5px] text-[#808791]">Ctrl+F بحث</span>
          {onOpenShortcuts && (
            <button
              type="button"
              data-testid="open-shortcuts-palette"
              onClick={onOpenShortcuts}
              className="rounded bg-[#2b6cf6]/20 px-1.5 py-0.5 text-[9.5px] font-semibold text-[#60a5fa] hover:bg-[#2b6cf6]/30 transition-colors"
              title="عرض جميع الاختصارات (?)"
            >
              ? جميع الاختصارات
            </button>
          )}
        </div>

        {/* Onboarding Help (?) Button */}
        {onOpenOnboarding && (
          <button
            type="button"
            data-testid="studio-onboarding-help-button"
            onClick={onOpenOnboarding}
            className="flex items-center justify-center gap-1 rounded bg-[#202226] border border-[#32353b] px-2 py-0.5 text-[9.5px] font-bold text-[#e8eaee] hover:bg-[#2b6cf6] hover:text-white hover:border-[#2b6cf6] transition-colors"
            title="جولة إرشادية في المحرر (؟)"
            aria-label="؟"
          >
            <span aria-hidden="true" className="font-bold text-[10.5px]">؟</span>
            <span className="sr-only">?</span>
            <span className="hidden sm:inline font-normal">دليل البداية</span>
          </button>
        )}
      </div>
    </footer>
  );
};
