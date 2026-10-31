import React from 'react';
import { clearCatalogFilters } from '../../utils/catalogFilters';
import type { ProductGridController } from './useProductGridController';

export interface ProductGridEmptyStateProps {
  controller: ProductGridController;
}

export const ProductGridEmptyState: React.FC<ProductGridEmptyStateProps> = ({ controller }) => {
  const {
    emptyStateClassName,
    emptyStateIcon,
    emptyStateTitle,
    emptyStateDescription,
    setSearchParams,
    emptyStateButtonClassName,
    clearButtonText,
  } = controller;

  return (
    <div className={emptyStateClassName}>
      <div className="mb-6 text-5xl opacity-30">{emptyStateIcon}</div>
      <h3 className="mb-2 text-xl font-bold text-foreground">{emptyStateTitle}</h3>
      <p className="mx-auto mb-8 max-w-xs text-muted-foreground">{emptyStateDescription}</p>
      <button
        type="button"
        onClick={() => setSearchParams((prev) => clearCatalogFilters(prev))}
        className={emptyStateButtonClassName}
      >
        {clearButtonText}
      </button>
    </div>
  );
};

export default ProductGridEmptyState;
