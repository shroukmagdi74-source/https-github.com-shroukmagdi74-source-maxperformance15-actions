import React from "react";
import { ShoppingCart, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { formatCurrency } from "../../../utils/currency";
import { PurchaseOrderFormData, PurchaseOrderTotals } from "./types";

interface OrderSummarySidebarProps {
  itemsCount: number;
  totals: PurchaseOrderTotals;
  formData: PurchaseOrderFormData;
  setFormData: React.Dispatch<React.SetStateAction<PurchaseOrderFormData>>;
  saving: boolean;
  isEdit: boolean;
  onCancel: () => void;
}

export const OrderSummarySidebar: React.FC<OrderSummarySidebarProps> = ({
  itemsCount,
  totals,
  formData,
  setFormData,
  saving,
  isEdit,
  onCancel,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Sticky Financial Sidebar (4 cols on desktop) */}
      <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-4">
        <Card className="border border-border/70 shadow-2xs bg-card" size="sm">
          <CardContent className="p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
                <ShoppingCart className="size-4 text-primary" />
                {t("procurement.purchaseOrderForm.summaryTitle", "ملخص المبالغ")}
              </h3>
              <span className="text-xs font-mono font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md tabular-nums">
                {itemsCount} بنود
              </span>
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("procurement.purchaseOrderForm.subtotalLabel", "المجموع قبل الخصم:")}
                </span>
                <span className="font-semibold font-mono tabular-nums">
                  {formatCurrency(totals.subtotal)}
                </span>
              </div>

              {totals.itemDiscounts > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>
                    {t("procurement.purchaseOrderForm.itemDiscountsLabel", "خصم البنود:")}
                  </span>
                  <span className="font-semibold font-mono tabular-nums">
                    -{formatCurrency(totals.itemDiscounts)}
                  </span>
                </div>
              )}

              {totals.totalTax > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>{t("procurement.purchaseOrderForm.totalTaxLabel", "الضرائب:")}</span>
                  <span className="font-semibold font-mono tabular-nums">
                    +{formatCurrency(totals.totalTax)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="text-xs text-muted-foreground shrink-0">
                  {t("procurement.purchaseOrderForm.shippingLabel", "مصاريف الشحن:")}
                </span>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  className="h-8 w-28 text-right font-mono text-xs rounded-lg tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={formData.shippingCost}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, shippingCost: e.target.value }))
                  }
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground shrink-0">
                  {t("procurement.purchaseOrderForm.additionalDiscountLabel", "خصم إضافي:")}
                </span>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  className="h-8 w-28 text-right font-mono text-xs rounded-lg tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={formData.discountAmount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      discountAmount: e.target.value,
                    }))
                  }
                />
              </div>

              <Separator className="my-2" />

              <div className="flex justify-between items-baseline pt-1">
                <span className="font-bold text-sm">
                  {t("procurement.purchaseOrderForm.grandTotalLabel", "الإجمالي التقديري:")}
                </span>
                <span className="text-2xl font-black font-mono text-primary tabular-nums">
                  {formatCurrency(totals.grandTotal)}
                </span>
              </div>
            </div>

            {/* Primary CTA Buttons (Desktop) */}
            <div className="pt-2 space-y-2 hidden md:block">
              <Button
                type="submit"
                disabled={saving}
                className="w-full h-12 text-base rounded-xl font-bold active:scale-[0.98] transition-transform duration-100 shadow-md bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {saving ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Save className="size-4 me-1.5" />
                )}
                {isEdit
                  ? t("procurement.purchaseOrderForm.updateBtn", "تحديث أمر الشراء")
                  : t("procurement.purchaseOrderForm.createBtn", "تأكيد وحفظ الأمر")}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="w-full rounded-xl text-xs"
              >
                {t("procurement.purchaseOrderForm.cancel", "إلغاء والعودة")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sticky Action Bar for Mobile (< 768px) */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-md border-t border-border/80 p-3 flex items-center justify-between shadow-2xl md:hidden print:hidden">
        <div className="flex flex-col">
          <span className="text-[11px] text-muted-foreground">الإجمالي التقديري:</span>
          <span className="text-lg font-black font-mono text-primary tabular-nums">
            {formatCurrency(totals.grandTotal)}
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
            className="rounded-xl px-5 font-bold shadow-md bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {saving ? <LoadingSpinner size="sm" /> : <Save className="size-4 me-1" />}
            حفظ
          </Button>
        </div>
      </div>
    </>
  );
};
