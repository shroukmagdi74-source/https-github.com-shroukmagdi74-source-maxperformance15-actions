import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PreparationSlipDocumentSettings } from "./types";

export interface OrderPreparationSlipLivePreviewProps {
  slipDocument: PreparationSlipDocumentSettings;
}

export const OrderPreparationSlipLivePreview: React.FC<OrderPreparationSlipLivePreviewProps> = ({
  slipDocument,
}) => {
  return (
    <Card className="border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/90 xl:sticky xl:top-4 xl:self-start">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
          معاينة
        </CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-400">
          شكل ورقة التجهيز بعد الطباعة
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="overflow-hidden rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs"
          style={{
            backgroundColor: "#ffffff",
            color: "#1e293b",
            minHeight: 300,
          }}
        >
          {/* Header */}
          <div
            className="mb-4 border-b-2 pb-3"
            style={{ borderColor: slipDocument.accentColor }}
          >
            <h3
              className="text-lg font-extrabold tracking-tight"
              style={{ color: slipDocument.accentColor }}
            >
              {slipDocument.documentTitle}
            </h3>
            {slipDocument.showCompanyName && (
              <p className="mt-1 text-xs text-slate-600">
                اسم الشركة: متجر ماكس بيرفورمانس
              </p>
            )}
            <p className="mt-0.5 text-xs text-slate-400">
              {slipDocument.documentSubtitle}
            </p>
          </div>

          {/* Instructions */}
          {slipDocument.preparationInstructions && (
            <div className="mb-4 rounded-lg border border-amber-200/80 bg-amber-50/80 p-2.5 text-xs text-amber-900">
              <span className="font-bold">تعليمات التجهيز: </span>
              <span>{slipDocument.preparationInstructions}</span>
            </div>
          )}

          {/* Table */}
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr
                className="border-b"
                style={{ borderColor: `${slipDocument.accentColor}30` }}
              >
                {slipDocument.showItemSku && (
                  <th className="p-1.5 text-right font-semibold">SKU</th>
                )}
                {slipDocument.showItemDetails && (
                  <th className="p-1.5 text-right font-semibold">المنتج</th>
                )}
                {slipDocument.showItemColor && (
                  <th className="p-1.5 text-right font-semibold">اللون</th>
                )}
                {slipDocument.showItemSize && (
                  <th className="p-1.5 text-right font-semibold">المقاس</th>
                )}
                <th className="p-1.5 text-right font-semibold">الكمية</th>
                {slipDocument.showItemPrice && (
                  <th className="p-1.5 text-right font-semibold">السعر</th>
                )}
                {slipDocument.showItemTotal && (
                  <th className="p-1.5 text-right font-semibold">الإجمالي</th>
                )}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                {slipDocument.showItemSku && (
                  <td className="p-1.5 font-mono text-[11px] text-slate-500">
                    SKU-001
                  </td>
                )}
                {slipDocument.showItemDetails && (
                  <td className="p-1.5 font-medium text-slate-800">
                    حذاء كلاسيكي أنيق
                  </td>
                )}
                {slipDocument.showItemColor && (
                  <td className="p-1.5 text-slate-600">رصاصي</td>
                )}
                {slipDocument.showItemSize && (
                  <td className="p-1.5 font-mono tabular-nums text-slate-600">
                    37
                  </td>
                )}
                <td className="p-1.5 font-mono tabular-nums text-slate-800">
                  1
                </td>
                {slipDocument.showItemPrice && (
                  <td className="p-1.5 font-mono tabular-nums text-slate-700">
                    720 ج.م
                  </td>
                )}
                {slipDocument.showItemTotal && (
                  <td className="p-1.5 font-mono tabular-nums font-bold text-slate-900">
                    720 ج.م
                  </td>
                )}
              </tr>
            </tbody>
          </table>

          {/* Financial Summary */}
          {slipDocument.showFinancialSummary && (
            <div className="mt-3 space-y-0.5 border-t border-slate-100 pt-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>المجموع الفرعي</span>
                <span className="font-mono tabular-nums">720 ج.م</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>الشحن</span>
                <span className="font-mono tabular-nums">110 ج.م</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900">
                <span>الإجمالي</span>
                <span className="font-mono tabular-nums">830 ج.م</span>
              </div>
            </div>
          )}

          {/* Payment Summary */}
          {slipDocument.showPaymentSummary && (
            <div className="mt-2.5 rounded-lg border border-emerald-200/80 bg-emerald-50/70 p-2 text-xs text-emerald-900">
              <span className="font-bold">الدفع: </span>
              <span className="font-mono tabular-nums">830 ج.م</span>
              <span> عند الاستلام</span>
            </div>
          )}

          {/* Footer Note */}
          <div className="mt-4 border-t border-slate-100 pt-2 text-[11px] text-slate-400">
            {slipDocument.footerNote}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
