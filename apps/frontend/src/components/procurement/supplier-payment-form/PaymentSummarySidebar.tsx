import React from "react";
import { Banknote, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { formatCurrency } from "../../../utils/currency";
import { PurchaseInvoiceSummary } from "./types";

interface PaymentSummarySidebarProps {
  supplierBalance: number;
  currentPaymentAmount: number;
  balanceAfterPayment: number;
  selectedInvoice?: PurchaseInvoiceSummary;
  saving: boolean;
  isEditing: boolean;
  onCancel: () => void;
}

export const PaymentSummarySidebar: React.FC<PaymentSummarySidebarProps> = ({
  supplierBalance,
  currentPaymentAmount,
  balanceAfterPayment,
  selectedInvoice,
  saving,
  isEditing,
  onCancel,
}) => {
  return (
    <>
      {/* Sticky Financial Receipt (4 cols on desktop) */}
      <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-4">
        <Card className="border border-border/70 shadow-2xs bg-card" size="sm">
          <CardContent className="p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
                <Banknote className="size-4 text-primary" />
                الأثر المالي للسند
              </h3>
              <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                سند صرف
              </span>
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">رصيد المورد الحالي:</span>
                <span className="font-semibold font-mono tabular-nums">
                  {formatCurrency(supplierBalance)}
                </span>
              </div>

              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                <span>قيمة الدفعة الحالية:</span>
                <span className="font-bold font-mono tabular-nums">
                  -{formatCurrency(currentPaymentAmount)}
                </span>
              </div>

              <Separator className="my-2" />

              <div className="flex justify-between items-baseline pt-1">
                <span className="font-bold text-sm">الرصيد بعد السداد:</span>
                <div className="text-end">
                  <span
                    className={`text-2xl font-black font-mono tabular-nums ${
                      balanceAfterPayment < 0
                        ? "text-blue-600 dark:text-blue-400"
                        : balanceAfterPayment === 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-primary"
                    }`}
                  >
                    {formatCurrency(balanceAfterPayment)}
                  </span>
                  {balanceAfterPayment < 0 && (
                    <div className="text-[10px] text-blue-500 font-medium mt-0.5">
                      رصيد دائن لصالحنا (دفعة مقدمة)
                    </div>
                  )}
                </div>
              </div>

              {selectedInvoice && (
                <div className="text-xs bg-muted/40 p-2.5 rounded-xl space-y-1 pt-2 border border-border/40">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">متبقي الفاتورة الآن:</span>
                    <span className="font-mono font-semibold tabular-nums">
                      {formatCurrency(selectedInvoice.remainingAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-primary font-bold">
                    <span>متبقي الفاتورة بعد السند:</span>
                    <span className="font-mono tabular-nums">
                      {formatCurrency(
                        Math.max(
                          0,
                          selectedInvoice.remainingAmount - currentPaymentAmount,
                        ),
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Primary CTA Button */}
            <div className="pt-2 space-y-2 hidden md:block">
              <Button
                type="submit"
                disabled={saving}
                className="w-full h-12 text-base rounded-xl font-bold active:scale-[0.98] transition-transform duration-100 shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {saving ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Save className="size-4 me-1.5" />
                )}
                {isEditing ? "حفظ التعديلات على السند" : "تأكيد وصرف السند"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="w-full rounded-xl text-xs"
              >
                إلغاء والعودة
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sticky Action Bar for Mobile (< 768px) */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-md border-t border-border/80 p-3 flex items-center justify-between shadow-2xl md:hidden">
        <div className="flex flex-col">
          <span className="text-[11px] text-muted-foreground">المبلغ المنصرف:</span>
          <span className="text-lg font-black font-mono text-emerald-600 tabular-nums">
            {formatCurrency(currentPaymentAmount)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="rounded-xl"
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="rounded-xl px-5 font-bold shadow-md text-white bg-emerald-600 hover:bg-emerald-700"
          >
            {saving ? <LoadingSpinner size="sm" /> : <Save className="size-4 me-1" />}
            {isEditing ? "حفظ التعديلات" : "صرف السند"}
          </Button>
        </div>
      </div>
    </>
  );
};
