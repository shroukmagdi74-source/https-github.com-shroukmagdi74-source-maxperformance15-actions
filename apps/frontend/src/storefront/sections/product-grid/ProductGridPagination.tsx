import React from 'react';
import { Link } from 'react-router-dom';
import { getVisiblePageNumbers } from './gridHelpers';
import type { ProductGridController } from './useProductGridController';

export interface ProductGridPaginationProps {
  controller: ProductGridController;
}

export const ProductGridPagination: React.FC<ProductGridPaginationProps> = ({ controller }) => {
  const { pagination, theme, buildPageUrl } = controller;

  if (pagination.pages <= 1) {
    return null;
  }

  return (
    <nav
      aria-label={theme.direction === 'rtl' ? 'صفحات المنتجات' : 'Products Pagination'}
      className="mt-10 border-t border-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
    >
      <p className="text-xs text-muted-foreground order-2 sm:order-1">
        {theme.direction === 'rtl'
          ? `عرض ${(pagination.page - 1) * pagination.limit + 1} - ${Math.min(pagination.page * pagination.limit, pagination.total)} من أصل ${pagination.total} منتج`
          : `Showing ${(pagination.page - 1) * pagination.limit + 1} - ${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total} products`}
      </p>
      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        {pagination.page > 1 ? (
          <Link
            to={buildPageUrl(pagination.page - 1)}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            aria-label={theme.direction === 'rtl' ? 'الصفحة السابقة' : 'Previous page'}
          >
            {theme.direction === 'rtl' ? 'السابق' : 'Prev'}
          </Link>
        ) : (
          <span
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-border/40 bg-muted/30 px-3 py-2 text-xs font-semibold text-muted-foreground/50 cursor-not-allowed"
            aria-hidden="true"
          >
            {theme.direction === 'rtl' ? 'السابق' : 'Prev'}
          </span>
        )}

        {getVisiblePageNumbers(pagination.page, pagination.pages).map((p, idx) => {
          if (p === '...') {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="inline-flex min-h-[44px] min-w-[32px] items-center justify-center text-xs text-muted-foreground"
              >
                …
              </span>
            );
          }
          const pageNum = p as number;
          const isCurrent = pageNum === pagination.page;
          return (
            <Link
              key={pageNum}
              to={buildPageUrl(pageNum)}
              aria-current={isCurrent ? 'page' : undefined}
              className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${
                isCurrent
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'border-border bg-background text-foreground hover:bg-muted'
              }`}
            >
              {pageNum}
            </Link>
          );
        })}

        {pagination.page < pagination.pages ? (
          <Link
            to={buildPageUrl(pagination.page + 1)}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            aria-label={theme.direction === 'rtl' ? 'الصفحة التالية' : 'Next page'}
          >
            {theme.direction === 'rtl' ? 'التالي' : 'Next'}
          </Link>
        ) : (
          <span
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-border/40 bg-muted/30 px-3 py-2 text-xs font-semibold text-muted-foreground/50 cursor-not-allowed"
            aria-hidden="true"
          >
            {theme.direction === 'rtl' ? 'التالي' : 'Next'}
          </span>
        )}
      </div>
    </nav>
  );
};

export default ProductGridPagination;
