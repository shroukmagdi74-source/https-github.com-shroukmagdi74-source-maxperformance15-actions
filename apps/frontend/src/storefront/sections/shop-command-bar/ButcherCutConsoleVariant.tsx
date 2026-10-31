import React from 'react';
import { CatalogSortValue } from '../../utils/catalogFilters';
import { ShopCommandBarController } from './useShopCommandBarController';

export const ButcherCutConsoleVariant: React.FC<{ ctrl: ShopCommandBarController }> = ({ ctrl }) => {
  const {
    hideHeader,
    stickyLabel,
    title,
    subtitle,
    isLoading,
    pagination,
    resultsLabel,
    activeCategoryLabel,
    selectedSortLabel,
    hideSearch,
    handleSearchSubmit,
    searchInputId,
    searchPlaceholder,
    searchValue,
    setSearchValue,
    sortSelectId,
    selectedSort,
    handleSortChange,
    sortOptions,
    hasActiveControls,
    handleClearFilters,
    clearButtonText,
    prefersArabicCopy,
    hideDesktopCategoryChips,
    selectedCategory,
    handleCategorySelect,
    allCategoriesLabel,
    visibleCategories,
  } = ctrl;

  return (
    <section className="mb-8 overflow-hidden border border-[#37312c] bg-[#0b0908] text-[#f4ead8] shadow-[0_28px_80px_-64px_rgba(0,0,0,0.84)]">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
        {!hideHeader ? (
          <div className="border-b border-[#37312c] px-5 py-6 md:px-6 lg:border-b-0 lg:border-s">
            <span className="inline-flex border border-[#8b6b3e] bg-[#15110f] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.28em] text-[#d7b674]">
              {stickyLabel}
            </span>
            <h2 className="mt-5 font-heading text-[2rem] font-black leading-tight text-[#fff7e8] md:text-[2.85rem]">
              {title}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#b7ab9c]">
              {subtitle}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="border border-[#8f1d2b] bg-[#5f1118] px-3 py-2 text-xs font-black text-[#fff4dc] tabular-nums font-mono">
                {isLoading ? '...' : pagination.total} {resultsLabel}
              </span>
              <span className="border border-[#37312c] bg-[#15110f] px-3 py-2 text-xs font-bold text-[#d6cbbb]">
                {activeCategoryLabel}
              </span>
              {selectedSortLabel ? (
                <span className="border border-[#37312c] bg-[#15110f] px-3 py-2 text-xs font-bold text-[#d7b674]">
                  {selectedSortLabel}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="px-5 py-6 md:px-6">
          {!hideSearch ? (
            <form onSubmit={handleSearchSubmit} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_13rem_auto]">
              <label htmlFor={searchInputId} className="sr-only">
                {searchPlaceholder}
              </label>
              <input
                id={searchInputId}
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-12 border border-[#4a4138] bg-[#15110f] px-4 text-sm font-bold text-[#fff7e8] outline-none transition-colors placeholder:text-[#81756b] focus:border-[#b99154]"
              />
              <select
                id={sortSelectId}
                value={selectedSort}
                onChange={(event) => handleSortChange(event.target.value as CatalogSortValue)}
                className="h-12 border border-[#4a4138] bg-[#15110f] px-4 text-sm font-bold text-[#fff7e8] outline-none transition-colors focus:border-[#b99154]"
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
                  className="inline-flex h-12 items-center justify-center border border-[#4a4138] bg-[#0b0908] px-5 text-sm font-black text-[#d6cbbb] transition-colors hover:border-[#b99154] hover:text-[#fff7e8]"
                >
                  {clearButtonText}
                </button>
              ) : (
                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center border border-[#8f1d2b] bg-[#7a131d] px-5 text-sm font-black text-[#fff4dc] transition-colors hover:bg-[#9a1d2a]"
                >
                  {prefersArabicCopy ? 'طبّق' : 'Apply'}
                </button>
              )}
            </form>
          ) : null}

          {!hideDesktopCategoryChips ? (
            <div className="mt-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={() => handleCategorySelect(null)}
                className={`shrink-0 border px-4 py-2 text-sm font-black transition-colors ${
                  selectedCategory === 'all'
                    ? 'border-[#8f1d2b] bg-[#5f1118] text-[#fff4dc]'
                    : 'border-[#37312c] bg-[#15110f] text-[#b7ab9c] hover:border-[#8b6b3e] hover:text-[#fff7e8]'
                }`}
              >
                {allCategoriesLabel}
              </button>
              {visibleCategories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategorySelect(category.id)}
                  className={`shrink-0 border px-4 py-2 text-sm font-black transition-colors ${
                    selectedCategory === category.id
                      ? 'border-[#b99154] bg-[#d7b674] text-[#120d0b]'
                      : 'border-[#37312c] bg-[#15110f] text-[#b7ab9c] hover:border-[#8b6b3e] hover:text-[#fff7e8]'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};
