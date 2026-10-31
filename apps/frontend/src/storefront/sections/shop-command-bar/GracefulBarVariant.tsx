import React from 'react';
import { CatalogSortValue } from '../../utils/catalogFilters';
import { ShopCommandBarController } from './useShopCommandBarController';

export const GracefulBarVariant: React.FC<{ ctrl: ShopCommandBarController }> = ({ ctrl }) => {
  const {
    isLoading,
    pagination,
    filterPanelOpen,
    setFilterPanelOpen,
    allCategoriesLabel,
    categories,
    selectedCategory,
    handleCategorySelect,
    hasActiveControls,
    handleClearFilters,
    clearButtonText,
    sortSelectId,
    selectedSort,
    handleSortChange,
    sortOptions,
  } = ctrl;

  const totalProducts = isLoading ? '…' : pagination.total;
  const isFilterOpen = filterPanelOpen;

  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-black/[0.06] pb-5">
      {/* Filter dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setFilterPanelOpen(!isFilterOpen)}
          aria-expanded={isFilterOpen}
          className="inline-flex items-center gap-2.5 text-[15px] text-[#2f2f2f] transition-colors hover:text-[#e16244]"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M3 6h18M7 12h10M10 18h4" />
          </svg>
          Filter
        </button>
        {isFilterOpen ? (
          <div className="absolute left-0 top-full z-30 mt-3 w-72 rounded-[14px] border border-black/[0.06] bg-white p-5 shadow-[0_30px_70px_-32px_rgba(0,0,0,0.4)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#9a9a9a]">Categories</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleCategorySelect(null)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-[#171717] text-white'
                    : 'border border-black/10 text-[#2f2f2f] hover:border-[#171717]'
                }`}
              >
                {allCategoriesLabel}
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategorySelect(category.id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-[#171717] text-white'
                      : 'border border-black/10 text-[#2f2f2f] hover:border-[#171717]'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            {hasActiveControls ? (
              <button
                type="button"
                onClick={handleClearFilters}
                className="mt-4 text-xs font-semibold text-[#e16244] underline-offset-4 hover:underline"
              >
                {clearButtonText}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Count */}
      <p className="text-[15px] text-[#2f2f2f] tabular-nums font-mono">
        Total products: <span className="font-semibold">{totalProducts}</span>
      </p>

      {/* Sort */}
      <div className="flex items-center gap-3">
        <span className="text-[15px] text-[#2f2f2f]">Sort by:</span>
        <select
          id={sortSelectId}
          value={selectedSort}
          onChange={(event) => handleSortChange(event.target.value as CatalogSortValue)}
          className="h-11 rounded-[10px] border border-black/[0.08] bg-[#f6f6f6] px-4 text-sm font-medium text-[#2f2f2f] outline-none transition-colors focus:border-[#171717]"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
