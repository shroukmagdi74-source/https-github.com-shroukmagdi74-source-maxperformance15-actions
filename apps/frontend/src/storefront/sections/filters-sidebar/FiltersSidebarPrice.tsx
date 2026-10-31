import React from 'react';
import type { SidebarPriceRangeOption, SidebarPriceRangeValue } from './types';

interface FiltersSidebarPriceProps {
  showPriceFilter: boolean;
  shellClassName: string;
  priceLabel: string;
  fieldPrefix: string;
  prefersArabicCopy: boolean;
  selectedPriceRange: SidebarPriceRangeValue | null;
  priceRangeOptions: SidebarPriceRangeOption[];
  isPcHub: boolean;
  isRoseBoutique: boolean;
  isDistrictMarket: boolean;
  isZenOrganic: boolean;
  onPriceRangeSelect: (value: SidebarPriceRangeValue) => void;
}

export const FiltersSidebarPrice: React.FC<FiltersSidebarPriceProps> = ({
  showPriceFilter,
  shellClassName,
  priceLabel,
  fieldPrefix,
  prefersArabicCopy,
  selectedPriceRange,
  priceRangeOptions,
  isPcHub,
  isRoseBoutique,
  isDistrictMarket,
  isZenOrganic,
  onPriceRangeSelect,
}) => {
  if (!showPriceFilter) {
    return null;
  }

  const headingClass = isPcHub
    ? 'mb-4 text-[11px] font-black tracking-[0.22em] text-[#6d717c]'
    : isRoseBoutique
      ? 'mb-4 text-[11px] font-black tracking-[0.22em] text-[#a26c73]'
      : isDistrictMarket
        ? 'mb-4 text-[11px] font-black tracking-[0.22em] text-[#8c6956]'
        : 'mb-6 text-sm font-semibold text-[#1a3328] tracking-wide';

  return (
    <div className={shellClassName} data-testid="filters-sidebar-price">
      <h3 className={`font-heading uppercase ${headingClass}`}>{priceLabel}</h3>
      {isZenOrganic ? (
        <div className="space-y-6 px-1">
          <div className="relative h-1 bg-[#e9ebe5] rounded-full">
            <div
              className="absolute h-full bg-[#88a876] rounded-full"
              style={{ left: '0%', right: '40%' }}
            />
            <input
              type="range"
              min="0"
              max="1000"
              className="absolute w-full h-1 bg-transparent appearance-none cursor-pointer accent-[#88a876] pointer-events-auto"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="px-6 py-2 bg-[#1a3328] text-white text-xs font-bold rounded-full uppercase tracking-widest hover:bg-[#1a3328]/90 transition-all"
            >
              {prefersArabicCopy ? 'فلترة' : 'Filter'}
            </button>
            <span className="text-sm font-semibold text-[#1a3328]/70 tracking-tight tabular-nums">
              {prefersArabicCopy ? 'السعر: 40$ — 600$' : 'Price: $40 — $600'}
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {priceRangeOptions.map((range) => (
            <label
              key={range.value}
              htmlFor={`${fieldPrefix}-${range.value}`}
              className={`flex items-center gap-3 cursor-pointer group ${
                isPcHub
                  ? 'rounded-[1rem] border border-transparent px-3 py-2.5 hover:border-[#f4e2a3] hover:bg-[#fffdf5]'
                  : isRoseBoutique
                    ? 'rounded-[1rem] border border-transparent px-3 py-2.5 hover:border-[#f0ddd5] hover:bg-[#fff8f5]'
                    : isDistrictMarket
                      ? 'rounded-[1rem] px-2 py-2 hover:bg-[#f7eee6]'
                      : ''
              }`}
            >
              <input
                id={`${fieldPrefix}-${range.value}`}
                type="radio"
                name="price-range"
                checked={selectedPriceRange === range.value}
                onChange={() => onPriceRangeSelect(range.value)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-ring accent-primary"
              />
              <span
                dir="ltr"
                className={`text-sm transition-colors tabular-nums ${
                  isPcHub
                    ? 'font-medium text-[#1f242c] group-hover:text-[#7a5d00]'
                    : isRoseBoutique
                      ? 'font-medium text-[#3d2a2f] group-hover:text-[#8f4d41]'
                      : 'text-foreground group-hover:text-primary'
                }`}
              >
                {range.label}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default FiltersSidebarPrice;
