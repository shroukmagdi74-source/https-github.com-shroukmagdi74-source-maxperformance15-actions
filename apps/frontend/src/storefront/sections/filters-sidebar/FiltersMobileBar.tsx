import React from 'react';

interface FiltersMobileBarProps {
  mobileOpen: boolean;
  isPcHub: boolean;
  isRoseBoutique: boolean;
  isDistrictMarket: boolean;
  isKhemetLuxe: boolean;
  showMobileLabel: string;
  hideMobileLabel: string;
  activeFilterCount: number;
  selectedCategoryId: string;
  selectedCategoryLabel: string;
  selectedPriceLabel: string;
  selectedSortLabel: string;
  onToggle: () => void;
}

export const FiltersMobileBar: React.FC<FiltersMobileBarProps> = ({
  mobileOpen,
  isPcHub,
  isRoseBoutique,
  isDistrictMarket,
  isKhemetLuxe,
  showMobileLabel,
  hideMobileLabel,
  activeFilterCount,
  selectedCategoryId,
  selectedCategoryLabel,
  selectedPriceLabel,
  selectedSortLabel,
  onToggle,
}) => {
  return (
    <div
      className={`lg:hidden px-4 py-3 border-b ${
        isPcHub
          ? 'border-[#dfe4ea]'
          : isRoseBoutique
            ? 'border-[#ead8cf]'
            : isDistrictMarket
              ? 'border-[#ead8cb]'
              : 'border-border'
      }`}
      data-testid="filters-mobile-bar"
    >
      <button
        type="button"
        onClick={onToggle}
        className={`flex w-full items-center justify-between gap-3 text-sm font-medium transition-colors ${
          isPcHub
            ? 'rounded-[1.25rem] border border-[#e4d8b3] bg-[linear-gradient(180deg,#fffefb,#fff6dc)] px-4 py-3 text-[#1f242c] shadow-[0_20px_44px_-36px_rgba(31,36,44,0.32)] hover:border-[#f3ca53]'
            : isRoseBoutique
              ? 'rounded-[1.25rem] border border-[#ead8cf] bg-[linear-gradient(180deg,#fffdfb,#fff6f2)] px-4 py-3 text-[#3d2a2f] shadow-[0_20px_44px_-36px_rgba(76,42,44,0.2)] hover:border-[#d86b55]'
              : isKhemetLuxe
                ? 'rounded-[1.25rem] border border-[#e4d8cd] bg-[linear-gradient(180deg,#fffdfa,#fbf6ef)] px-4 py-3 text-[#201915] shadow-sm hover:border-[#201915]'
                : 'text-foreground hover:text-primary'
        }`}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              isPcHub
                ? 'bg-[#1f242c] text-[#fff4d1]'
                : isRoseBoutique
                  ? 'bg-[#3d2a2f] text-[#fff6f4]'
                  : isKhemetLuxe
                    ? 'bg-[#201915] text-[#fff6f0]'
                    : ''
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" x2="4" y1="21" y2="14" />
              <line x1="4" x2="4" y1="10" y2="3" />
              <line x1="12" x2="12" y1="21" y2="12" />
              <line x1="12" x2="12" y1="8" y2="3" />
              <line x1="20" x2="20" y1="21" y2="16" />
              <line x1="20" x2="20" y1="12" y2="3" />
              <line x1="1" x2="7" y1="14" y2="14" />
              <line x1="9" x2="15" y1="8" y2="8" />
              <line x1="17" x2="23" y1="16" y2="16" />
            </svg>
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-2">
              <span
                className={`${
                  isPcHub
                    ? 'text-[11px] font-black uppercase tracking-[0.18em] text-[#6d717c]'
                    : isRoseBoutique
                      ? 'text-[11px] font-black uppercase tracking-[0.18em] text-[#a26c73]'
                      : ''
                }`}
              >
                {mobileOpen ? hideMobileLabel : showMobileLabel}
              </span>
              {activeFilterCount > 0 && (
                <span
                  className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums ${
                    isPcHub
                      ? 'bg-[#1f242c] text-[#fff4d1]'
                      : isRoseBoutique
                        ? 'bg-[#3d2a2f] text-[#fff6f4]'
                        : 'bg-primary text-primary-foreground'
                  }`}
                >
                  {activeFilterCount}
                </span>
              )}
            </span>
            {isPcHub ? (
              <span className="mt-1 block truncate text-sm font-semibold text-[#1f242c]">
                {selectedCategoryId === 'all'
                  ? 'كل الأقسام جاهزة للمراجعة'
                  : `القسم الحالي: ${selectedCategoryLabel}`}
              </span>
            ) : isRoseBoutique ? (
              <span className="mt-1 block truncate text-sm font-semibold text-[#3d2a2f]">
                {selectedCategoryId === 'all'
                  ? 'كل القطع جاهزة للمراجعة'
                  : `القسم الحالي: ${selectedCategoryLabel}`}
              </span>
            ) : null}
            {isPcHub ? (
              <span className="mt-1 block truncate text-xs text-[#6d717c] tabular-nums">
                {selectedPriceLabel} • {selectedSortLabel}
              </span>
            ) : isRoseBoutique ? (
              <span className="mt-1 block truncate text-xs text-[#8d747a] tabular-nums">
                {selectedPriceLabel} • {selectedSortLabel}
              </span>
            ) : null}
          </span>
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            mobileOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
};

export default FiltersMobileBar;
