import React from 'react';

interface FiltersMobileDrawerProps {
  mobileOpen: boolean;
  isPcHub: boolean;
  isRoseBoutique: boolean;
  sidebarBadge: string;
  mobilePanelTitle: string;
  mobilePanelSubtitle: string;
  hideMobileLabel: string;
  showMobileLabel: string;
  mobileSummaryItems: Array<{ label: string; value: string; active: boolean }>;
  prefersArabicCopy: boolean;
  children: React.ReactNode;
  mobileResetText: string;
  mobileApplyText: string;
  onClearFilters: () => void;
  onClose: () => void;
}

export const FiltersMobileDrawer: React.FC<FiltersMobileDrawerProps> = ({
  mobileOpen,
  isPcHub,
  isRoseBoutique,
  sidebarBadge,
  mobilePanelTitle,
  mobilePanelSubtitle,
  hideMobileLabel,
  showMobileLabel,
  mobileSummaryItems,
  prefersArabicCopy,
  children,
  mobileResetText,
  mobileApplyText,
  onClearFilters,
  onClose,
}) => {
  if (!mobileOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] lg:hidden" data-testid="filters-mobile-drawer">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        className={`absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t shadow-2xl animate-in slide-in-from-bottom duration-300 ${
          isPcHub
            ? 'border-[#dfe4ea] bg-[linear-gradient(180deg,#fffef9,#fff7e4_42%,#f5ecda)]'
            : isRoseBoutique
              ? 'border-[#ead8cf] bg-[linear-gradient(180deg,#fffefd,#fff5f1_42%,#f8eeea)]'
              : 'bg-background border-border'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* Handle + Header */}
        <div
          className={`sticky top-0 z-10 backdrop-blur-sm border-b ${
            isPcHub
              ? 'border-[#dfe4ea] bg-[rgba(255,253,248,0.94)]'
              : isRoseBoutique
                ? 'border-[#ead8cf] bg-[rgba(255,251,248,0.94)]'
                : 'bg-background/95 border-border'
          }`}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
          </div>
          <div className="px-5 pb-4">
            {isPcHub ? (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="inline-flex rounded-full border border-[#1f242c]/10 bg-[#1f242c] px-3 py-1 text-[11px] font-black tracking-[0.22em] text-[#fff4d1]">
                      {sidebarBadge}
                    </span>
                    <h3 className="mt-3 text-xl font-black tracking-tight text-[#1f242c]">
                      {mobilePanelTitle}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-[#646b77]">
                      {mobilePanelSubtitle}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full border border-[#d9dee5] bg-white px-4 py-2 text-xs font-bold text-[#1f242c]"
                  >
                    {hideMobileLabel}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {mobileSummaryItems.map((item) => (
                    <span
                      key={`${item.label}-${item.value}`}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs ${
                        item.active
                          ? 'border-[#e7c764] bg-[#fff8df] text-[#4c3d00]'
                          : 'border-[#d9dee5] bg-white text-[#6d717c]'
                      }`}
                    >
                      <span className="font-black">{item.label}</span>
                      <span className="font-semibold">{item.value}</span>
                    </span>
                  ))}
                </div>
              </div>
            ) : isRoseBoutique ? (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="inline-flex rounded-full border border-[#f0e2db] bg-white px-3 py-1 text-[11px] font-black tracking-[0.22em] text-[#8f4d41]">
                      {sidebarBadge}
                    </span>
                    <h3 className="mt-3 text-xl font-black tracking-tight text-[#3d2a2f]">
                      {mobilePanelTitle}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-[#7a6268]">
                      {mobilePanelSubtitle}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full border border-[#ead8cf] bg-white px-4 py-2 text-xs font-bold text-[#5b4950]"
                  >
                    {hideMobileLabel}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {mobileSummaryItems.map((item) => (
                    <span
                      key={`${item.label}-${item.value}`}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs ${
                        item.active
                          ? 'border-[#f0ddd5] bg-[#fff8f5] text-[#8f4d41]'
                          : 'border-[#ead8cf] bg-white text-[#8d747a]'
                      }`}
                    >
                      <span className="font-black">{item.label}</span>
                      <span className="font-semibold">{item.value}</span>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">{showMobileLabel}</h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
                >
                  {prefersArabicCopy ? 'تطبيق' : 'Apply'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={`px-5 py-6 ${isPcHub || isRoseBoutique ? 'pb-28' : ''}`}>
          {children}
        </div>

        {isPcHub ? (
          <div className="sticky bottom-0 z-10 border-t border-[#dfe4ea] bg-[rgba(255,252,244,0.96)] px-5 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] pt-4 backdrop-blur">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onClearFilters}
                className="rounded-[999px] border border-[#d9dee5] bg-white px-4 py-3 text-sm font-bold text-[#1f242c]"
              >
                {mobileResetText}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-[999px] bg-[#1f242c] px-4 py-3 text-sm font-black text-[#fff4d1] shadow-[0_20px_40px_-30px_rgba(31,36,44,0.58)]"
              >
                {mobileApplyText}
              </button>
            </div>
          </div>
        ) : isRoseBoutique ? (
          <div className="sticky bottom-0 z-10 border-t border-[#ead8cf] bg-[rgba(255,250,247,0.96)] px-5 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] pt-4 backdrop-blur">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onClearFilters}
                className="rounded-[999px] border border-[#ead8cf] bg-white px-4 py-3 text-sm font-bold text-[#5b4950]"
              >
                {mobileResetText}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-[999px] bg-[linear-gradient(135deg,#3d2a2f,#8f4d41)] px-4 py-3 text-sm font-black text-white shadow-[0_20px_40px_-30px_rgba(76,42,44,0.44)]"
              >
                {mobileApplyText}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default FiltersMobileDrawer;
