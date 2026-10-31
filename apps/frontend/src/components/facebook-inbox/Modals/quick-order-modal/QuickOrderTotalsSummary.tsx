import React from "react";
import { CartItem } from "./types";
import { headingStyle, mutedStyle, primaryStyle } from "./styles";

interface QuickOrderTotalsSummaryProps {
  cartItems: CartItem[];
  subtotal: number;
  totalDiscount: number;
  shippingCost: number;
  grandTotal: number;
}

export const QuickOrderTotalsSummary: React.FC<QuickOrderTotalsSummaryProps> = ({
  cartItems,
  subtotal,
  totalDiscount,
  shippingCost,
  grandTotal,
}) => {
  return (
    <div className="business-status-banner p-4" data-tone="primary">
      <h3 className="mb-3 font-semibold" style={headingStyle}>
        ملخص الطلب
      </h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span style={mutedStyle}>
            المنتجات ({cartItems.reduce((acc, item) => acc + item.quantity, 0)}{" "}
            قطعة)
          </span>
          <span
            className="font-medium font-mono tabular-nums"
            style={headingStyle}
          >
            {subtotal.toLocaleString()} ج.م
          </span>
        </div>

        {totalDiscount > 0 && (
          <div className="flex justify-between text-green-600 dark:text-green-400 font-medium font-mono tabular-nums">
            <span>إجمالي الخصم</span>
            <span>-{totalDiscount.toLocaleString()} ج.م</span>
          </div>
        )}

        {shippingCost > 0 && (
          <div className="flex justify-between">
            <span style={mutedStyle}>الشحن</span>
            <span
              className="font-medium font-mono tabular-nums"
              style={headingStyle}
            >
              +{shippingCost.toLocaleString()} ج.م
            </span>
          </div>
        )}

        <div
          className="flex justify-between pt-2 text-lg font-bold"
          style={{
            borderTop: "1px solid var(--business-muted-line)",
          }}
        >
          <span style={headingStyle}>الإجمالي النهائي</span>
          <span className="font-mono tabular-nums" style={primaryStyle}>
            {grandTotal.toLocaleString()} ج.م
          </span>
        </div>
      </div>
    </div>
  );
};
