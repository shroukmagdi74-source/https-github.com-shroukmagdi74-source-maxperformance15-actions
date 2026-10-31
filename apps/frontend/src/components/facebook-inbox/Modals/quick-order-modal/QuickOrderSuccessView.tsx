import React from "react";
import { CheckCircleIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { CreatedOrderDetails } from "./types";
import { headingStyle, mutedStyle } from "./styles";

interface QuickOrderSuccessViewProps {
  createdOrder: CreatedOrderDetails;
  customerName: string;
  phone: string;
  grandTotal: number;
  isScheduledOrder: boolean;
  scheduledDeliveryDate: string;
  scheduledDeliveryTime: string;
  onClose: () => void;
  onReset: () => void;
}

export const QuickOrderSuccessView: React.FC<QuickOrderSuccessViewProps> = ({
  createdOrder,
  customerName,
  phone,
  grandTotal,
  isScheduledOrder,
  scheduledDeliveryDate,
  scheduledDeliveryTime,
  onClose,
  onReset,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center">
      <div
        className="max-w-md w-full text-center space-y-6 business-page-panel p-6 sm:p-8 shadow-xl rounded-2xl border"
        style={{
          background: "var(--business-surface-panel)",
          borderColor: "var(--business-card-border)",
        }}
      >
        <div
          className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center border"
          style={{
            background: "rgba(16, 185, 129, 0.12)",
            borderColor: "rgba(16, 185, 129, 0.28)",
            color: "var(--business-success)",
          }}
        >
          <CheckCircleIcon className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-500" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-xl sm:text-2xl font-bold" style={headingStyle}>
            تم إنشاء الطلب بنجاح!
          </h3>
          <p className="text-sm" style={mutedStyle}>
            رقم الطلب:{" "}
            <span className="font-mono font-bold" style={headingStyle}>
              #{createdOrder.orderNumber || createdOrder.id}
            </span>
          </p>
        </div>

        <div
          className="p-4 rounded-xl text-xs sm:text-sm text-right space-y-2 border"
          style={{
            background: "var(--business-surface-subtle)",
            borderColor: "var(--business-card-border)",
          }}
        >
          <div className="flex justify-between">
            <span style={mutedStyle}>العميل:</span>
            <span className="font-medium" style={headingStyle}>
              {customerName}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={mutedStyle}>الهاتف:</span>
            <span className="font-mono font-medium" style={headingStyle}>
              {phone}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={mutedStyle}>إجمالي الطلب:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
              {grandTotal.toLocaleString()} ج.م
            </span>
          </div>
          {isScheduledOrder && scheduledDeliveryDate && (
            <div className="flex justify-between">
              <span style={mutedStyle}>موعد التوصيل:</span>
              <span className="font-medium" style={headingStyle}>
                {scheduledDeliveryDate}{" "}
                {scheduledDeliveryTime ? `(${scheduledDeliveryTime})` : ""}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              window.open(
                `/orders/${encodeURIComponent(createdOrder.id)}?print=true`,
                "_blank",
              );
            }}
            className="business-chip-button w-full py-3 flex items-center justify-center gap-2 font-bold text-sm"
            data-active="true"
            style={{
              background:
                "linear-gradient(135deg, var(--business-success) 0%, color-mix(in srgb, var(--color-secondary) 82%, white) 100%)",
              borderColor: "transparent",
              color: "white",
            }}
          >
            <PrinterIcon className="w-5 h-5" />
            طباعة الفاتورة / البوليصة
          </button>

          <button
            type="button"
            onClick={() => {
              window.open(
                `/orders/${encodeURIComponent(createdOrder.id)}`,
                "_blank",
              );
            }}
            className="business-chip-button w-full py-2.5 flex items-center justify-center gap-2 text-sm border"
            style={{
              borderColor: "var(--business-card-border)",
              color: "var(--business-text-primary)",
            }}
          >
            عرض تفاصيل الطلب
          </button>

          <button
            type="button"
            onClick={() => {
              onReset();
              onClose();
            }}
            className="text-xs pt-2 underline transition-colors"
            style={mutedStyle}
          >
            إنهاء والعودة للمحادثة
          </button>
        </div>
      </div>
    </div>
  );
};
