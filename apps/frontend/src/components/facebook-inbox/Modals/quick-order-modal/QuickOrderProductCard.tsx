import React from "react";
import { ArchiveBoxIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Product } from "./types";
import { headingStyle, mutedStyle, primaryStyle } from "./styles";

interface QuickOrderProductCardProps {
  product: Product;
  viewMode: "grid" | "list";
  handleProductClick: (product: Product) => void;
}

export const QuickOrderProductCard: React.FC<QuickOrderProductCardProps> = ({
  product,
  viewMode,
  handleProductClick,
}) => {
  if (viewMode === "list") {
    return (
      <div
        key={product.id}
        onClick={() => handleProductClick(product)}
        className="business-product-card group cursor-pointer flex items-center gap-3 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-transparent transition-all duration-150 active:scale-[0.99] hover:border-primary/30"
      >
        <div className="business-product-card-media relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-lg sm:rounded-xl">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={mutedStyle}
            >
              <ArchiveBoxIcon className="h-8 w-8 opacity-40" />
            </div>
          )}
          {product.variants.length > 0 && (
            <div className="business-product-card-pill absolute bottom-1 right-1 text-[9px] px-1.5 py-0.5 rounded font-medium shadow-sm">
              خيارات
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
          <div>
            <h3
              className="line-clamp-2 text-xs sm:text-sm font-medium leading-snug"
              style={headingStyle}
              title={product.name}
            >
              {product.name}
            </h3>
            {product.sku && (
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 font-mono truncate">
                {product.sku}
              </p>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span
              className="text-xs sm:text-sm font-bold font-mono tabular-nums"
              style={primaryStyle}
            >
              {product.price} ج.م
            </span>
            {product.variants.length > 0 && (
              <span className="text-[10px] text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded font-medium font-mono tabular-nums">
                {product.variants.length} خيار
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          className="business-chip-button px-3 py-1.5 text-xs sm:text-sm font-semibold flex-shrink-0 flex items-center gap-1 shadow-sm"
          data-active="true"
          onClick={(e) => {
            e.stopPropagation();
            handleProductClick(product);
          }}
          aria-label="إضافة للطلب"
        >
          <PlusIcon className="h-4 w-4" />
          <span className="hidden sm:inline">إضافة</span>
        </button>
      </div>
    );
  }

  return (
    <div
      key={product.id}
      onClick={() => handleProductClick(product)}
      className="business-product-card group cursor-pointer flex flex-col justify-between overflow-hidden rounded-xl border border-transparent transition-all duration-150 active:scale-[0.98] h-full"
    >
      <div className="business-product-card-media relative aspect-square w-full overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={mutedStyle}
          >
            <ArchiveBoxIcon className="h-10 w-10 opacity-40" />
          </div>
        )}
        {product.variants.length > 0 && (
          <div className="business-product-card-pill absolute bottom-2 right-2 text-[10px] px-2 py-0.5 rounded-md font-medium shadow-sm">
            خيارات
          </div>
        )}
      </div>
      <div className="p-2 sm:p-2.5 flex flex-col justify-between flex-1">
        <h3
          className="line-clamp-2 text-xs sm:text-sm font-medium leading-snug"
          style={headingStyle}
          title={product.name}
        >
          {product.name}
        </h3>
        <div className="mt-2 flex items-center justify-between gap-1">
          <span
            className="text-xs sm:text-sm font-bold font-mono tabular-nums truncate"
            style={primaryStyle}
          >
            {product.price} ج.م
          </span>
          <button
            type="button"
            className="business-icon-button business-icon-button--sm h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
            data-tone="primary"
            onClick={(e) => {
              e.stopPropagation();
              handleProductClick(product);
            }}
            aria-label="إضافة للطلب"
          >
            <PlusIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
