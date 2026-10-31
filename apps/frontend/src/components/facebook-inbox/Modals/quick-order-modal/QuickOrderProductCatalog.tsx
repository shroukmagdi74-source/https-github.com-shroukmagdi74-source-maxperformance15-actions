import React from "react";
import {
  MagnifyingGlassIcon,
  ClockIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";
import { Product } from "./types";
import { mutedStyle } from "./styles";
import {
  CustomerLookupResult,
  PreviousOrder,
} from "../../../../hooks/useCustomerByPhone";
import { QuickOrderProductCard } from "./QuickOrderProductCard";

interface QuickOrderProductCatalogProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  previousOrders: PreviousOrder[];
  customerProfile: CustomerLookupResult | null;
  phone: string;
  showHistoryDrawer: boolean;
  setShowHistoryDrawer: React.Dispatch<React.SetStateAction<boolean>>;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  productListRef: React.RefObject<HTMLDivElement | null>;
  handleProductListScroll: () => void;
  loadingProducts: boolean;
  products: Product[];
  handleProductClick: (product: Product) => void;
  loadingMoreProducts: boolean;
  hasMoreProducts: boolean;
  loadMoreProducts: () => void;
}

export const QuickOrderProductCatalog: React.FC<
  QuickOrderProductCatalogProps
> = ({
  searchQuery,
  setSearchQuery,
  previousOrders,
  customerProfile,
  phone,
  showHistoryDrawer,
  setShowHistoryDrawer,
  viewMode,
  setViewMode,
  productListRef,
  handleProductListScroll,
  loadingProducts,
  products,
  handleProductClick,
  loadingMoreProducts,
  hasMoreProducts,
  loadMoreProducts,
}) => {
  return (
    <div className="flex flex-1 flex-col overflow-hidden min-w-0">
      {/* Search & Toolbar */}
      <div
        className="p-3 sm:p-4 flex items-center gap-2"
        style={{
          borderBottom: "1px solid var(--business-muted-line)",
        }}
      >
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="بحث عن منتج..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="business-chat-input w-full pl-4 pr-10 py-2 text-sm"
          />
          <MagnifyingGlassIcon
            className="absolute right-3 top-2.5 h-5 w-5"
            style={mutedStyle}
          />
        </div>

        {/* Customer Previous Orders Quick Button */}
        {(previousOrders.length > 0 || customerProfile || phone.length >= 9) && (
          <button
            type="button"
            onClick={() => setShowHistoryDrawer((prev) => !prev)}
            className={`business-chip-button flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold shrink-0 transition-all ${
              showHistoryDrawer
                ? "bg-primary text-white border-primary"
                : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800"
            }`}
            title="سجل طلبات وبيانات العميل السابقة"
          >
            <ClockIcon className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">طلبات العميل</span>
            {previousOrders.length > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono tabular-nums font-bold ${
                  showHistoryDrawer
                    ? "bg-white text-primary"
                    : "bg-primary text-white"
                }`}
              >
                {previousOrders.length}
              </span>
            )}
          </button>
        )}

        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/50 flex-shrink-0">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === "grid"
                ? "bg-primary text-primary-foreground shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="عرض الشبكة"
            aria-label="عرض الشبكة"
          >
            <Squares2X2Icon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === "list"
                ? "bg-primary text-primary-foreground shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="عرض القائمة"
            aria-label="عرض القائمة"
          >
            <ListBulletIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Products List */}
      <div
        ref={productListRef}
        onScroll={handleProductListScroll}
        className="flex-1 overflow-y-auto p-2.5 sm:p-4"
      >
        {loadingProducts ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-2 lg:grid-cols-3"
                : "space-y-2.5"
            }
          >
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={
                  viewMode === "grid"
                    ? "h-44 sm:h-48 animate-pulse rounded-2xl"
                    : "h-20 animate-pulse rounded-2xl"
                }
                style={{
                  background:
                    "color-mix(in srgb, var(--color-border) 18%, var(--color-background))",
                }}
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="business-inbox-empty py-12 text-center">
            <ArchiveBoxIcon
              className="mx-auto h-12 w-12 opacity-50"
              style={mutedStyle}
            />
            <p className="mt-2 text-sm" style={mutedStyle}>
              لا توجد منتجات
            </p>
          </div>
        ) : (
          <>
            <div
              className={
                viewMode === "list"
                  ? "space-y-2.5"
                  : "grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-2 lg:grid-cols-3"
              }
            >
              {products.map((product) => (
                <QuickOrderProductCard
                  key={product.id}
                  product={product}
                  viewMode={viewMode}
                  handleProductClick={handleProductClick}
                />
              ))}
            </div>

            {loadingMoreProducts && (
              <div className="flex justify-center py-6">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-transparent border-t-current opacity-60" />
              </div>
            )}
            {!loadingMoreProducts && hasMoreProducts && (
              <button
                type="button"
                onClick={loadMoreProducts}
                className="mt-4 w-full rounded-2xl border-2 border-dashed border-gray-200 py-3 text-sm font-semibold text-gray-500 transition-colors hover:border-blue-400 hover:text-blue-500 dark:border-gray-700 dark:text-gray-400"
              >
                عرض المزيد من المنتجات
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
