import React from 'react';

export const ProductCardSkeleton: React.FC = () => (
  <div className="h-full animate-pulse space-y-4 rounded-[var(--radius)] border border-border bg-card p-4">
    <div className="aspect-square rounded-md bg-muted" />
    <div className="space-y-2">
      <div className="h-4 w-3/4 rounded bg-muted" />
      <div className="h-3 w-1/4 rounded bg-muted" />
      <div className="mt-2 h-9 w-full rounded bg-muted" />
    </div>
  </div>
);

export const ProductGridLoadingSection: React.FC<{
  stableCatalogMinHeightClassName: string;
  isKhemetLuxeSalePage: boolean;
  heading: string;
  resultsCount: number;
  productsFoundLabel: string;
  emptyStateTitle: string;
  emptyStateDescription: string;
  clearButtonText: string;
  emptyStateClassName: string;
  emptyStateButtonClassName: string;
  emptyStateIcon: string;
  hideHeader: boolean;
  isHorizontalRail: boolean;
  carouselCardClass: string;
  gridClass: string;
  loadingSkeletonCount?: number;
}> = ({
  stableCatalogMinHeightClassName,
  isKhemetLuxeSalePage,
  heading,
  resultsCount,
  productsFoundLabel,
  emptyStateTitle,
  emptyStateDescription,
  clearButtonText,
  emptyStateClassName,
  emptyStateButtonClassName,
  emptyStateIcon,
  hideHeader,
  isHorizontalRail,
  carouselCardClass,
  gridClass,
  loadingSkeletonCount = 8,
}) => {
  if (isKhemetLuxeSalePage) {
    return (
      <section className={`w-full bg-background py-8 md:py-12 ${stableCatalogMinHeightClassName}`}>
        <div className="container px-0">
          <div className="mb-8 flex flex-col space-y-2">
            <div
              className="flex flex-col gap-3 opacity-0 sm:flex-row sm:items-end sm:justify-between"
              aria-hidden="true"
            >
              <div>
                <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
                  {heading}
                </h2>
                <p className="font-sans text-sm text-muted-foreground text-start">
                  {resultsCount} {productsFoundLabel}
                </p>
              </div>
            </div>
          </div>
          <div className={emptyStateClassName} aria-busy="true">
            <div className="mb-6 text-5xl opacity-0" aria-hidden="true">
              {emptyStateIcon}
            </div>
            <h3 className="mb-2 text-xl font-bold text-foreground opacity-0" aria-hidden="true">
              {emptyStateTitle}
            </h3>
            <p
              className="mx-auto mb-8 max-w-xs text-muted-foreground opacity-0"
              aria-hidden="true"
            >
              {emptyStateDescription}
            </p>
            <button
              type="button"
              disabled
              className={`${emptyStateButtonClassName} opacity-0`}
              aria-hidden="true"
            >
              {clearButtonText}
            </button>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <div className="mb-6 h-12 w-12 animate-pulse rounded-full bg-muted" />
              <div className="mb-3 h-6 w-56 max-w-[80%] animate-pulse rounded bg-muted" />
              <div className="mb-8 h-4 w-72 max-w-[80%] animate-pulse rounded bg-muted" />
              <div className="h-10 w-36 animate-pulse rounded-[var(--radius)] bg-muted" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`w-full bg-background py-8 md:py-12 ${stableCatalogMinHeightClassName}`}>
      <div className="container px-0">
        {!hideHeader ? (
          <div className="mb-8 h-8 w-48 animate-pulse rounded bg-muted" />
        ) : null}
        {isHorizontalRail ? (
          <div className="flex gap-4 overflow-hidden pb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`shrink-0 ${carouselCardClass}`}>
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        ) : (
          <div className={gridClass}>
            {Array.from({ length: loadingSkeletonCount }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export const ProductGridErrorSection: React.FC<{
  error: Error;
}> = ({ error }) => (
  <section className="w-full bg-background py-16">
    <div className="container px-0">
      <div className="mx-auto max-w-md rounded-[var(--radius)] border-2 border-dashed border-destructive/30 bg-destructive/5 p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <span className="text-2xl font-bold text-destructive">!</span>
        </div>
        <h3 className="mb-2 text-lg font-bold text-foreground">Failed to Load Products</h3>
        <p className="mb-6 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-[var(--radius)] bg-primary px-6 py-2 font-medium text-primary-foreground transition-transform hover:scale-105"
        >
          Try Again
        </button>
      </div>
    </div>
  </section>
);
