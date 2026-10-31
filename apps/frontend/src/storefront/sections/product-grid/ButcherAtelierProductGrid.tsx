import React from 'react';
import ProductCard from '../../components/ProductCard';
import { clearCatalogFilters } from '../../utils/catalogFilters';
import type { ProductGridController } from './useProductGridController';

export interface ButcherAtelierProductGridProps {
  controller: ProductGridController;
}

export const ButcherAtelierProductGrid: React.FC<ButcherAtelierProductGridProps> = ({ controller }) => {
  const {
    settings,
    isShopPage,
    activeCategoryLabel,
    activeSearchTerm,
    activeFilterCount,
    hideHeader,
    heading,
    resultsCount,
    productsFoundLabel,
    filteredProducts,
    gridClass,
    resolvedCardVariant,
    shopProductCardStyleOverrides,
    resolveGridCardImageLoading,
    resolveGridCardImageFetchPriority,
    emptyStateTitle,
    emptyStateDescription,
    setSearchParams,
    clearButtonText,
  } = controller;

  const butcherSubtitle =
    typeof settings?.['subtitle'] === 'string' && settings['subtitle'].trim()
      ? settings['subtitle'].trim()
      : isShopPage
        ? 'كتالوج تقطيعات premium مصمم كلوحة قرار: صورة كبيرة، وزن واضح، وتجهيز قبل التأكيد.'
        : 'اختيارات سوداء الهوية تبرز القطعية والجودة بدل شبكة كروت متجر عادية.';

  const atelierStats = [
    activeCategoryLabel,
    activeSearchTerm ? `بحث: ${activeSearchTerm}` : '',
    activeFilterCount > 0 ? `${activeFilterCount} فلاتر` : 'Black label cuts',
  ].filter(Boolean);

  return (
    <section className="relative overflow-hidden bg-[#080706] py-12 text-[#f4ead8] md:py-16">
      <div className="pointer-events-none absolute inset-0 opacity-[0.24] [background-image:linear-gradient(90deg,rgba(255,255,255,0.06)_0_1px,transparent_1px_92px),linear-gradient(180deg,rgba(255,255,255,0.04)_0_1px,transparent_1px_72px)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(103,20,29,0.22),transparent)]" />
      <div className="container relative z-10 px-4 md:px-6">
        {!hideHeader ? (
          <div className="mb-8 border-y border-[#37312c] py-5 md:mb-10">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:items-end">
              <div className="space-y-3">
                <span className="inline-flex border border-[#8b6b3e] bg-[#15110f] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.28em] text-[#d7b674]">
                  {isShopPage ? 'CUT INDEX' : 'BLACK LABEL'}
                </span>
                <h2 className="font-heading text-[2.25rem] font-black leading-[1.02] text-[#fff7e8] md:text-[3.4rem]">
                  {heading}
                </h2>
              </div>
              <div className="space-y-4 lg:border-s lg:border-[#37312c] lg:ps-6">
                <p className="max-w-2xl text-sm leading-7 text-[#b7ab9c] md:text-base">
                  {butcherSubtitle}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="border border-[#8f1d2b] bg-[#5f1118] px-4 py-2 text-sm font-black text-[#fff4dc]">
                    {resultsCount} {productsFoundLabel}
                  </span>
                  {atelierStats.map((item) => (
                    <span
                      key={item}
                      className="border border-[#37312c] bg-[#15110f] px-4 py-2 text-sm font-bold text-[#d6cbbb]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {filteredProducts.length > 0 ? (
          <div className={gridClass}>
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                variant={resolvedCardVariant}
                styleOverrides={shopProductCardStyleOverrides}
                quickViewLabel={settings?.['quickViewLabel'] as string}
                addToWishlistLabel={settings?.['addToWishlistLabel'] as string}
                imageLoading={resolveGridCardImageLoading(index)}
                imageFetchPriority={resolveGridCardImageFetchPriority(index)}
              />
            ))}
          </div>
        ) : (
          <div className="border border-[#37312c] bg-[#0b0908] px-6 py-20 text-center">
            <div className="mx-auto mb-5 h-px max-w-xs bg-[linear-gradient(90deg,transparent,#8b6b3e,transparent)]" />
            <h3 className="mb-3 font-heading text-2xl font-black text-[#fff7e8]">
              {emptyStateTitle}
            </h3>
            <p className="mx-auto mb-8 max-w-sm text-sm leading-7 text-[#b7ab9c]">
              {emptyStateDescription}
            </p>
            <button
              onClick={() => setSearchParams((prev) => clearCatalogFilters(prev))}
              className="border border-[#8f1d2b] bg-[#5f1118] px-6 py-3 text-sm font-black text-[#fff4dc] transition-colors hover:bg-[#7a131d]"
            >
              {clearButtonText}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ButcherAtelierProductGrid;
