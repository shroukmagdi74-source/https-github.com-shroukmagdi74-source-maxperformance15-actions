import React from 'react';
import { CatalogSortValue } from '../../utils/catalogFilters';
import { ShopCommandBarController } from './useShopCommandBarController';

export const SoftSortBarVariant: React.FC<{ ctrl: ShopCommandBarController }> = ({ ctrl }) => {
  const {
    hideHeader,
    title,
    subtitle,
    isLoading,
    pagination,
    resultsLabel,
    sortSelectId,
    prefersArabicCopy,
    selectedSort,
    handleSortChange,
    sortOptions,
    hasActiveControls,
    handleClearFilters,
    clearButtonText,
    hideDesktopCategoryChips,
    selectedCategory,
    handleCategorySelect,
    allCategoriesLabel,
    visibleCategories,
  } = ctrl;

  return (
    <section className="mb-5 border-b border-[#edd8d0] bg-[#fffaf7] py-4">
      <div className="flex flex-col gap-4">
        {!hideHeader ? (
          <div className="flex flex-col gap-2">
            <h2 className="font-heading text-[1.55rem] font-black tracking-tight text-[#2c2426] md:text-[1.8rem]">
              {title}
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-[#6d5b5f]">
              {subtitle}
            </p>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-[#6d5b5f]">
            <span className="font-black text-[#2c2426] tabular-nums font-mono">{isLoading ? '...' : pagination.total}</span>
            <span>{resultsLabel}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor={sortSelectId} className="text-xs font-black uppercase tracking-[0.2em] text-[#9b7370]">
              {prefersArabicCopy ? 'الترتيب' : 'Sort'}
            </label>
            <select
              id={sortSelectId}
              value={selectedSort}
              onChange={(event) => handleSortChange(event.target.value as CatalogSortValue)}
              className="h-10 min-w-[11rem] rounded-full border border-[#ead8cf] bg-white px-4 text-sm font-bold text-[#2c2426] outline-none transition focus:border-[#d86b55]"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {hasActiveControls ? (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex h-10 items-center justify-center rounded-full border border-[#ead8cf] bg-[#fff7f2] px-4 text-sm font-bold text-[#6d5b5f] transition-colors hover:border-[#d86b55] hover:text-[#2c2426]"
              >
                {clearButtonText}
              </button>
            ) : null}
          </div>
        </div>

        {!hideDesktopCategoryChips ? (
          <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => handleCategorySelect(null)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-[#2c2426] text-white'
                  : 'border border-[#ead8cf] bg-white text-[#6d5b5f] hover:border-[#d86b55] hover:text-[#2c2426]'
              }`}
            >
              {allCategoriesLabel}
            </button>
            {visibleCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategorySelect(category.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-[#ef6d5b] text-white'
                    : 'border border-[#ead8cf] bg-white text-[#6d5b5f] hover:border-[#d86b55] hover:text-[#2c2426]'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
};
