import React from 'react';
import type { CatalogSortValue } from '../../utils/catalogFilters';

interface FiltersSidebarSortProps {
  showSort: boolean;
  shellClassName: string;
  headingClassName: string;
  sortLabel: string;
  fieldPrefix: string;
  prefersArabicCopy: boolean;
  selectedSort: CatalogSortValue;
  sortOptions: Array<{ value: CatalogSortValue; label: string }>;
  isPcHub: boolean;
  isRoseBoutique: boolean;
  isDistrictMarket: boolean;
  onSortChange: (value: CatalogSortValue) => void;
}

export const FiltersSidebarSort: React.FC<FiltersSidebarSortProps> = ({
  showSort,
  shellClassName,
  headingClassName,
  sortLabel,
  fieldPrefix,
  prefersArabicCopy,
  selectedSort,
  sortOptions,
  isPcHub,
  isRoseBoutique,
  isDistrictMarket,
  onSortChange,
}) => {
  if (!showSort) {
    return null;
  }

  return (
    <div className={shellClassName} data-testid="filters-sidebar-sort">
      <h3 className={`font-heading uppercase ${headingClassName}`}>{sortLabel}</h3>
      <label htmlFor={`${fieldPrefix}-sort`} className="sr-only">
        {prefersArabicCopy ? 'ترتيب المنتجات' : 'Sort products'}
      </label>
      <select
        id={`${fieldPrefix}-sort`}
        name="sort-by"
        value={selectedSort}
        onChange={(e) => onSortChange(e.target.value as CatalogSortValue)}
        className={`w-full px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
          isPcHub
            ? 'rounded-[1rem] border border-[#d9dee5] bg-[#fffdf8]'
            : isRoseBoutique
              ? 'rounded-[1rem] border border-[#ead8cf] bg-[#fffaf7]'
              : isDistrictMarket
                ? 'rounded-[1rem] border border-[#ead8cb] bg-[#fffaf5]'
                : 'rounded-[var(--radius)] border border-border bg-background'
        }`}
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FiltersSidebarSort;
