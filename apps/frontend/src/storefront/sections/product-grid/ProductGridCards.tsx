import React from 'react';
import ProductCard from '../../components/ProductCard';
import GracefulSmartCard from '../../components/GracefulSmartCard';
import type { ProductGridController } from './useProductGridController';

export interface ProductGridCardsProps {
  controller: ProductGridController;
}

export const ProductGridCards: React.FC<ProductGridCardsProps> = ({ controller }) => {
  const {
    filteredProducts,
    isHorizontalRail,
    variant,
    carouselCardClass,
    resolvedCardVariant,
    shopProductCardStyleOverrides,
    settings,
    resolveGridCardImageLoading,
    resolveGridCardImageFetchPriority,
    isWomenCuratedRack,
    isWomenFitCatalog,
    isWomenDealEdit,
    isShopPage,
    saleOnly,
    gridFrameClassName,
    activeCategoryLabel,
    activeSearchTerm,
    activeFilterCount,
    resolvedGridClass,
    isGracefulTheme,
  } = controller;

  if (isHorizontalRail) {
    return (
      <div className={`flex snap-x snap-mandatory overflow-x-auto pb-4 [scrollbar-width:thin] ${variant === 'boutique-rail' ? 'gap-5 md:gap-6' : 'gap-4'}`}>
        {filteredProducts.map((product, index) => (
          <div
            key={product.id}
            className={`shrink-0 snap-start ${carouselCardClass}`}
          >
            <ProductCard
              product={product}
              variant={resolvedCardVariant}
              styleOverrides={shopProductCardStyleOverrides}
              quickViewLabel={settings?.['quickViewLabel'] as string}
              addToWishlistLabel={settings?.['addToWishlistLabel'] as string}
              imageLoading={resolveGridCardImageLoading(index)}
              imageFetchPriority={resolveGridCardImageFetchPriority(index)}
            />
          </div>
        ))}
      </div>
    );
  }

  if (isWomenCuratedRack) {
    if (isShopPage || saleOnly) {
      return (
        <div className={`grid gap-3 ${isShopPage ? 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-2 lg:grid-cols-4'}`}>
          {filteredProducts.slice(0, saleOnly ? 4 : 8).map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              variant="compact"
              styleOverrides={shopProductCardStyleOverrides}
              quickViewLabel={settings?.['quickViewLabel'] as string}
              addToWishlistLabel={settings?.['addToWishlistLabel'] as string}
              imageLoading={resolveGridCardImageLoading(index)}
              imageFetchPriority={resolveGridCardImageFetchPriority(index)}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
        {filteredProducts[0] ? (
          <div className="min-h-full">
            <ProductCard
              product={filteredProducts[0]}
              variant="editorial"
              styleOverrides={shopProductCardStyleOverrides}
              quickViewLabel={settings?.['quickViewLabel'] as string}
              addToWishlistLabel={settings?.['addToWishlistLabel'] as string}
            />
          </div>
        ) : null}
        <div className="grid gap-3">
          {filteredProducts.slice(1, 4).map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              variant="compact"
              styleOverrides={shopProductCardStyleOverrides}
              quickViewLabel={settings?.['quickViewLabel'] as string}
              addToWishlistLabel={settings?.['addToWishlistLabel'] as string}
              imageLoading={resolveGridCardImageLoading(index + 1)}
              imageFetchPriority={resolveGridCardImageFetchPriority(index + 1)}
            />
          ))}
        </div>
      </div>
    );
  }

  if (isWomenFitCatalog) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            variant="compact"
            styleOverrides={shopProductCardStyleOverrides}
            quickViewLabel={settings?.['quickViewLabel'] as string}
            addToWishlistLabel={settings?.['addToWishlistLabel'] as string}
            imageLoading={resolveGridCardImageLoading(index)}
            imageFetchPriority={resolveGridCardImageFetchPriority(index)}
          />
        ))}
      </div>
    );
  }

  if (isWomenDealEdit) {
    return (
      <div className="space-y-3">
        <div className="grid gap-3 lg:grid-cols-2">
          {filteredProducts.slice(0, 2).map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              variant="overlay"
              styleOverrides={shopProductCardStyleOverrides}
              quickViewLabel={settings?.['quickViewLabel'] as string}
              addToWishlistLabel={settings?.['addToWishlistLabel'] as string}
              imageLoading={resolveGridCardImageLoading(index)}
              imageFetchPriority={resolveGridCardImageFetchPriority(index)}
            />
          ))}
        </div>
        {filteredProducts.length > 2 ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {filteredProducts.slice(2, 6).map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                variant="compact"
                styleOverrides={shopProductCardStyleOverrides}
                quickViewLabel={settings?.['quickViewLabel'] as string}
                addToWishlistLabel={settings?.['addToWishlistLabel'] as string}
                imageLoading={resolveGridCardImageLoading(index + 2)}
                imageFetchPriority={resolveGridCardImageFetchPriority(index + 2)}
              />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={gridFrameClassName || undefined}>
      {variant === 'spec-rack' ? (
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full border border-[#d9dee5] bg-white px-3 py-1.5 text-xs font-bold text-[#1f242c]">
            {activeCategoryLabel}
          </span>
          <span className="inline-flex items-center rounded-full border border-[#eadfb8] bg-[#fff8e2] px-3 py-1.5 text-xs font-bold text-[#6d5b16]">
            {activeSearchTerm ? `بحث مباشر: ${activeSearchTerm}` : 'جاهز للمقارنة السريعة'}
          </span>
          <span className="inline-flex items-center rounded-full border border-[#d9dee5] bg-white px-3 py-1.5 text-xs font-semibold text-[#6b7280]">
            {activeFilterCount > 0 ? 'فلترة مركزة' : 'الترتيب المقترح'}
          </span>
        </div>
      ) : null}
      <div className={resolvedGridClass}>
        {filteredProducts.map((product, index) => (
          isGracefulTheme ? (
            <GracefulSmartCard
              key={product.id}
              product={product}
              index={index}
              quickViewLabel={settings?.['quickViewLabel'] as string}
              addToWishlistLabel={settings?.['addToWishlistLabel'] as string}
            />
          ) : (
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
          )
        ))}
      </div>
    </div>
  );
};

export default ProductGridCards;
