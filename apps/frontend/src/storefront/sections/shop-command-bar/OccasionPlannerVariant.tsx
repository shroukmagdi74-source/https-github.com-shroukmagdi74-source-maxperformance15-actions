import React from 'react';
import { CatalogSortValue, applyCatalogFilters } from '../../utils/catalogFilters';
import { ShopCommandBarController } from './useShopCommandBarController';

export const OccasionPlannerVariant: React.FC<{ ctrl: ShopCommandBarController }> = ({ ctrl }) => {
  const {
    prefersArabicCopy,
    hideHeader,
    stickyLabel,
    title,
    subtitle,
    isLoading,
    pagination,
    resultsLabel,
    decisionModeLabel,
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
    activeSearch,
    setSearchParams,
    searchParams,
    hideDesktopCategoryChips,
    selectedCategory,
    handleCategorySelect,
    allCategoriesLabel,
    visibleCategories,
  } = ctrl;

  const occasionRoutes = prefersArabicCopy
    ? [
        {
          label: 'خطوبة أو كتب كتاب',
          searchTerm: 'فستان',
          note: 'قطع أنيقة لكن غير ثقيلة من أول مرور.',
        },
        {
          label: 'دعوة عشاء',
          searchTerm: 'سهرة',
          note: 'خامات ولمعان خفيف مناسب للصور والمساء.',
        },
        {
          label: 'نهار رسمي',
          searchTerm: 'طقم',
          note: 'إطلالة متوازنة لو المناسبة تبدأ بدري.',
        },
        {
          label: 'طلب مستعجل',
          searchTerm: 'جاهز',
          note: 'ابدئي بالقطع الأقرب للحسم خلال يوم واحد.',
        },
      ]
    : [
        {
          label: 'Engagement or Wedding',
          searchTerm: 'dress',
          note: 'Elegant pieces that stay light from the first pass.',
        },
        {
          label: 'Dinner Invitation',
          searchTerm: 'evening',
          note: 'Fluid fabrics with a soft sheen made for evenings.',
        },
        {
          label: 'Formal Daytime',
          note: 'A balanced look if the occasion starts early.',
          searchTerm: 'set',
        },
        {
          label: 'Last-Minute Order',
          note: 'Start with the quickest pieces to decide within a day.',
          searchTerm: 'ready',
        },
      ];

  return (
    <section className="mb-6 overflow-hidden rounded-[2rem] border border-[#e9d9d1] bg-[linear-gradient(135deg,#fffdfb_0%,#f7efe8_46%,#fff9f4_100%)] shadow-[0_32px_88px_-64px_rgba(76,42,44,0.26)]">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-5 px-5 py-5 md:px-6 md:py-6">
          {!hideHeader ? (
            <div className="space-y-3">
              <span className="inline-flex w-fit rounded-full border border-[#ead7cf] bg-white/92 px-3 py-1 text-[11px] font-black tracking-[0.22em] text-[#8e5348]">
                {stickyLabel}
              </span>
              <div className="space-y-2">
                <h2 className="font-heading text-[2rem] font-black tracking-tight text-[#2a1f1d] md:text-[2.35rem]">
                  {title}
                </h2>
                <p className="max-w-2xl text-sm leading-7 text-[#6c5958] md:text-base">
                  {subtitle}
                </p>
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-[#2a1f1d] px-3 py-1 text-xs font-black text-white tabular-nums font-mono">
              {isLoading ? '...' : pagination.total} {resultsLabel}
            </span>
            <span className="inline-flex rounded-full border border-[#ead7cf] bg-white px-3 py-1 text-xs font-bold text-[#6c5958]">
              {decisionModeLabel}
            </span>
            <span className="inline-flex rounded-full border border-[#ead7cf] bg-white px-3 py-1 text-xs font-bold text-[#6c5958]">
              {activeCategoryLabel}
            </span>
            {selectedSortLabel ? (
              <span className="inline-flex rounded-full border border-[#ead7cf] bg-white px-3 py-1 text-xs font-bold text-[#8e5348]">
                {selectedSortLabel}
              </span>
            ) : null}
          </div>
        </div>

        <div className="border-t border-[#efdfd7] px-5 py-5 lg:border-s lg:border-t-0 md:px-6 md:py-6">
          {!hideSearch ? (
            <form onSubmit={handleSearchSubmit} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_auto] md:items-center">
              <label htmlFor={searchInputId} className="sr-only">
                {searchPlaceholder}
              </label>
              <input
                id={searchInputId}
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-12 rounded-full border border-[#e5d3cb] bg-white px-4 text-sm font-medium text-[#2a1f1d] outline-none transition focus:border-[#c27d6f]"
              />
              <select
                id={sortSelectId}
                value={selectedSort}
                onChange={(event) => handleSortChange(event.target.value as CatalogSortValue)}
                className="h-12 rounded-full border border-[#e5d3cb] bg-white px-4 text-sm font-bold text-[#2a1f1d] outline-none transition focus:border-[#c27d6f]"
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
                  className="inline-flex h-12 items-center justify-center rounded-full border border-[#ead7cf] bg-white px-5 text-sm font-bold text-[#6c5958] transition-colors hover:border-[#c27d6f] hover:text-[#2a1f1d]"
                >
                  {clearButtonText}
                </button>
              ) : (
                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[#2a1f1d] px-5 text-sm font-black text-white transition-colors hover:bg-[#15100f]"
                >
                  {prefersArabicCopy ? 'ابدئي الفرز' : 'Apply'}
                </button>
              )}
            </form>
          ) : null}

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {occasionRoutes.map((route) => {
              const isActiveRoute = activeSearch === route.searchTerm;

              return (
                <button
                  key={route.label}
                  type="button"
                  onClick={() =>
                    setSearchParams(
                      applyCatalogFilters(searchParams, {
                        searchTerm: route.searchTerm,
                      }),
                    )
                  }
                  className={`rounded-[1.35rem] border px-4 py-4 text-start transition-all ${
                    isActiveRoute
                      ? 'border-[#2a1f1d] bg-[#2a1f1d] text-white shadow-[0_22px_52px_-40px_rgba(42,31,29,0.72)]'
                      : 'border-[#ead7cf] bg-white/90 text-[#2a1f1d] hover:-translate-y-0.5 hover:border-[#c27d6f]'
                  }`}
                >
                  <p className={`text-[11px] font-black tracking-[0.22em] ${isActiveRoute ? 'text-white/76' : 'text-[#a16a60]'}`}>
                    ROUTE
                  </p>
                  <p className="mt-2 text-base font-black">
                    {route.label}
                  </p>
                  <p className={`mt-2 text-sm leading-6 ${isActiveRoute ? 'text-white/82' : 'text-[#6c5958]'}`}>
                    {route.note}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {!hideDesktopCategoryChips ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-[#efdfd7] px-5 py-4 md:px-6">
          <button
            type="button"
            onClick={() => handleCategorySelect(null)}
            className={`inline-flex rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              selectedCategory === 'all'
                ? 'bg-[#2a1f1d] text-white'
                : 'border border-[#ead7cf] bg-white text-[#6c5958] hover:border-[#c27d6f] hover:text-[#2a1f1d]'
            }`}
          >
            {allCategoriesLabel}
          </button>
          {visibleCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategorySelect(category.id)}
              className={`inline-flex rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                selectedCategory === category.id
                  ? 'bg-[#c77463] text-white'
                  : 'border border-[#ead7cf] bg-white text-[#6c5958] hover:border-[#c27d6f] hover:text-[#2a1f1d]'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
};
