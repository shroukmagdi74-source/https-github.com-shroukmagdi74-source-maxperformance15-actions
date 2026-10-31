import React from 'react';
import { CatalogSortValue } from '../../utils/catalogFilters';
import { ShopCommandBarController } from './useShopCommandBarController';

export const SimpleToolbarVariant: React.FC<{ ctrl: ShopCommandBarController }> = ({ ctrl }) => {
  const {
    theme,
    isLoading,
    pagination,
    prefersArabicCopy,
    hasActiveControls,
    handleClearFilters,
    clearButtonText,
    sortSelectId,
    selectedSort,
    handleSortChange,
    sortOptions,
  } = ctrl;

  return (
    <section className="mb-6 hidden border-b border-[#e8ddd2] pb-4 lg:block" dir={theme.direction}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold text-[#6f5e52] tabular-nums font-mono">
            {isLoading ? '...' : pagination.total} {prefersArabicCopy ? 'حذاء متوفر' : 'items'}
          </span>
          {hasActiveControls ? (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs font-semibold text-[#b84838] underline underline-offset-4 hover:opacity-80 transition-opacity"
            >
              {clearButtonText || (prefersArabicCopy ? 'مسح الفلاتر' : 'Clear')}
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <select
            id={sortSelectId}
            name="catalogSort"
            value={selectedSort}
            onChange={(event) => handleSortChange(event.target.value as CatalogSortValue)}
            className="h-10 rounded-full border border-[#ddd3c9] bg-white px-4 text-xs font-semibold text-[#241d18] outline-none transition-colors focus:border-[#201915]"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
};
