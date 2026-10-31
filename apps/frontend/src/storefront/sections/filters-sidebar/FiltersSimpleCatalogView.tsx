import React from 'react';
import type { Category } from '../../hooks/useCategories';
import type { CatalogSortValue } from '../../utils/catalogFilters';
import type { SidebarPriceRangeOption, SidebarPriceRangeValue } from './types';

interface FiltersSimpleCatalogViewProps {
  showCategories: boolean;
  categoryLabel: string;
  simplePanels: { categories: boolean; price: boolean };
  onTogglePanel: (panel: 'categories' | 'price') => void;
  selectedCategoryId: string;
  allProductsLabel: string;
  categories: Category[];
  onCategorySelect: (id: string) => void;
  showPriceFilter: boolean;
  priceLabel: string;
  priceRangeOptions: SidebarPriceRangeOption[];
  fieldPrefix: string;
  selectedPriceRange: SidebarPriceRangeValue | null;
  onPriceRangeSelect: (value: SidebarPriceRangeValue) => void;
  clearButtonText: string;
  onClearFilters: () => void;
  prefersArabicCopy: boolean;
  selectedSort: CatalogSortValue;
  sortOptions: Array<{ value: CatalogSortValue; label: string }>;
  onSortChange: (value: CatalogSortValue) => void;
  themeDirection: 'rtl' | 'ltr';
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  showMobileLabel: string;
  hideMobileLabel: string;
  activeFilterCount: number;
}

export const FiltersSimpleCatalogView: React.FC<FiltersSimpleCatalogViewProps> = ({
  showCategories,
  categoryLabel,
  simplePanels,
  onTogglePanel,
  selectedCategoryId,
  allProductsLabel,
  categories,
  onCategorySelect,
  showPriceFilter,
  priceLabel,
  priceRangeOptions,
  fieldPrefix,
  selectedPriceRange,
  onPriceRangeSelect,
  clearButtonText,
  onClearFilters,
  prefersArabicCopy,
  selectedSort,
  sortOptions,
  onSortChange,
  themeDirection,
  mobileOpen,
  setMobileOpen,
  showMobileLabel,
  hideMobileLabel,
  activeFilterCount,
}) => {
  const simpleSectionClassName = 'border border-[#ece5dd] bg-[#faf8f5] px-5 py-4';
  const simpleTriggerClassName =
    'flex w-full items-center justify-between gap-3 text-start text-[1.05rem] font-semibold text-[#241d18]';
  const simpleItemClassName =
    'block w-full py-2 text-start text-sm text-[#5f5348] transition-colors hover:text-[#241d18]';

  const simpleFilterContent = (
    <div className="space-y-6">
      {showCategories ? (
        <div className={simpleSectionClassName}>
          <button
            type="button"
            onClick={() => onTogglePanel('categories')}
            className={simpleTriggerClassName}
          >
            <span>{categoryLabel}</span>
            <span>{simplePanels.categories ? '−' : '+'}</span>
          </button>
          {simplePanels.categories ? (
            <div className="mt-4 space-y-1">
              <button
                type="button"
                onClick={() => onCategorySelect('all')}
                className={`${simpleItemClassName} ${
                  selectedCategoryId === 'all' ? 'font-semibold text-[#241d18]' : ''
                }`}
              >
                {allProductsLabel}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onCategorySelect(cat.id)}
                  className={`${simpleItemClassName} ${
                    selectedCategoryId === cat.id ? 'font-semibold text-[#241d18]' : ''
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {showPriceFilter ? (
        <div className={simpleSectionClassName}>
          <button
            type="button"
            onClick={() => onTogglePanel('price')}
            className={simpleTriggerClassName}
          >
            <span>{priceLabel}</span>
            <span>{simplePanels.price ? '−' : '+'}</span>
          </button>
          {simplePanels.price ? (
            <div className="mt-4 space-y-3">
              {priceRangeOptions.map((range) => (
                <label
                  key={range.value}
                  htmlFor={`${fieldPrefix}-simple-${range.value}`}
                  className="flex cursor-pointer items-center gap-3 text-sm text-[#5f5348]"
                >
                  <input
                    id={`${fieldPrefix}-simple-${range.value}`}
                    type="radio"
                    name="simple-price-range"
                    checked={selectedPriceRange === range.value}
                    onChange={() => onPriceRangeSelect(range.value)}
                    className="h-4 w-4 accent-[#241d18]"
                  />
                  <span dir="ltr" className="tabular-nums">{range.label}</span>
                </label>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        onClick={onClearFilters}
        className="text-sm font-medium text-[#6e6257] underline underline-offset-4 transition-colors hover:text-[#241d18]"
      >
        {clearButtonText}
      </button>
    </div>
  );

  return (
    <section className="w-full" data-testid="filters-simple-catalog">
      <div className="lg:hidden">
        <div dir="ltr" className="mb-2 grid grid-cols-2 gap-2">
          <label htmlFor={`${fieldPrefix}-simple-sort`} className="sr-only">
            {prefersArabicCopy ? 'ترتيب المنتجات' : 'Sort products'}
          </label>
          <select
            id={`${fieldPrefix}-simple-sort`}
            name="simple-sort-by"
            value={selectedSort}
            onChange={(event) => onSortChange(event.target.value as CatalogSortValue)}
            className="h-9 rounded-full border border-[#ddd3c9] bg-white px-3 text-xs font-semibold text-[#241d18] outline-none transition-colors focus:border-[#201915]"
            dir={themeDirection}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 items-center justify-between rounded-full border border-[#ddd3c9] bg-white px-3.5 text-xs font-semibold text-[#241d18] active:scale-95 transition-transform"
          >
            <span>{mobileOpen ? hideMobileLabel : showMobileLabel}</span>
            <span className="text-[11px] text-[#8a7d70] tabular-nums">
              {mobileOpen ? '−' : activeFilterCount > 0 ? activeFilterCount : '+'}
            </span>
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div
            className="absolute inset-0 bg-black/45"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-2xl bg-white px-5 py-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-[#ece5dd] pb-4">
              <h3 className="text-lg font-semibold text-[#241d18]">{showMobileLabel}</h3>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-[#6e6257]"
              >
                {hideMobileLabel}
              </button>
            </div>
            {simpleFilterContent}
          </div>
        </div>
      ) : null}

      <div className="hidden lg:block lg:sticky lg:top-24">{simpleFilterContent}</div>
    </section>
  );
};

export default FiltersSimpleCatalogView;
