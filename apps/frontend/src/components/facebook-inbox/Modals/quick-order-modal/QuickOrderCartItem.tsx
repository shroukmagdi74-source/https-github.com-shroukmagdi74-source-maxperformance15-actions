import React from "react";
import {
  ArchiveBoxIcon,
  TrashIcon,
  MinusIcon,
  PlusIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { CartItem } from "./types";
import { headingStyle, mutedStyle } from "./styles";

interface QuickOrderCartItemProps {
  item: CartItem;
  updateQuantity: (
    productId: string,
    variantId: string | undefined,
    delta: number,
  ) => void;
  updateItemPrice: (
    productId: string,
    variantId: string | undefined,
    newPrice: number,
  ) => void;
  restoreItemPrice: (
    productId: string,
    variantId: string | undefined,
  ) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
}

export const QuickOrderCartItem: React.FC<QuickOrderCartItemProps> = ({
  item,
  updateQuantity,
  updateItemPrice,
  restoreItemPrice,
  removeFromCart,
}) => {
  const isCustomPrice = item.price !== item.originalPrice;
  const isOverStock = item.stock > 0 && item.quantity > item.stock;

  return (
    <div
      key={`${item.productId}-${item.variantId || ""}`}
      className={`business-cart-card p-2 sm:p-2.5 rounded-xl border transition-colors ${
        isOverStock
          ? "border-red-300 dark:border-red-700 bg-red-50/40 dark:bg-red-900/15"
          : ""
      }`}
      style={{
        background: isOverStock ? undefined : "var(--business-surface-panel)",
        borderColor: isOverStock ? undefined : "var(--business-card-border)",
      }}
    >
      <div className="flex gap-2.5">
        <div className="business-product-card-media h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={mutedStyle}
            >
              <ArchiveBoxIcon className="h-6 w-6" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex justify-between items-start gap-1">
            <h4
              className="line-clamp-1 text-xs font-semibold"
              style={headingStyle}
              title={item.name}
            >
              {item.name}
            </h4>
            <button
              type="button"
              onClick={() => removeFromCart(item.productId, item.variantId)}
              className="text-gray-400 hover:text-red-500 p-0.5 rounded transition-colors flex-shrink-0"
              title="حذف من السلة"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>

          {(item.color || item.size || item.variantName) && (
            <div className="flex flex-wrap gap-1 mt-1">
              {item.color && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium">
                  {item.color}
                </span>
              )}
              {item.size && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 font-medium">
                  {item.size}
                </span>
              )}
              {!item.color && !item.size && item.variantName && (
                <span className="text-[10px] text-blue-500 font-medium truncate">
                  {item.variantName}
                </span>
              )}
            </div>
          )}

          {isOverStock && (
            <div className="flex items-center gap-1 text-[10px] text-red-500 font-medium mt-1">
              <ExclamationTriangleIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>الكمية أكبر من المخزون ({item.stock})</span>
            </div>
          )}

          <div className="mt-2 flex items-center justify-between gap-1 flex-wrap">
            {/* Quantity controls */}
            <div className="flex items-center gap-1 bg-muted/40 rounded-lg p-0.5 border border-border/40">
              <button
                type="button"
                onClick={() => {
                  if (item.quantity > 1) {
                    updateQuantity(item.productId, item.variantId, -1);
                  } else {
                    removeFromCart(item.productId, item.variantId);
                  }
                }}
                className="business-qty-button"
                aria-label="تقليل الكمية"
              >
                <MinusIcon className="h-3 w-3" />
              </button>
              <span
                className="w-7 text-center text-xs font-bold font-mono tabular-nums"
                style={headingStyle}
              >
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => updateQuantity(item.productId, item.variantId, 1)}
                className="business-qty-button"
                aria-label="زيادة الكمية"
              >
                <PlusIcon className="h-3 w-3" />
              </button>
            </div>

            {/* Editable unit price */}
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    updateItemPrice(item.productId, item.variantId, val);
                  }}
                  className={`w-16 text-xs text-center font-bold font-mono tabular-nums py-0.5 px-1 rounded border ${
                    isCustomPrice
                      ? "border-amber-400 bg-amber-50 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200"
                      : "border-border/60 bg-background text-foreground"
                  }`}
                  title="سعر القطعة (قابل للتعديل)"
                  min="0"
                />
                <span className="text-[10px] text-muted-foreground">ج.م</span>
              </div>
              {isCustomPrice && (
                <div className="flex items-center gap-1 text-[9px] text-muted-foreground mt-0.5">
                  <span className="line-through font-mono tabular-nums">
                    {item.originalPrice}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      restoreItemPrice(item.productId, item.variantId)
                    }
                    className="text-blue-500 hover:underline font-semibold"
                    title="استعادة السعر الأصلي"
                  >
                    استعادة
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-1.5 flex justify-between items-center text-xs border-t border-border/30 pt-1">
            <span className="text-[10px] text-muted-foreground">المجموع:</span>
            <span className="font-bold text-xs font-mono tabular-nums" style={headingStyle}>
              {(item.price * item.quantity).toLocaleString()} ج.م
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
