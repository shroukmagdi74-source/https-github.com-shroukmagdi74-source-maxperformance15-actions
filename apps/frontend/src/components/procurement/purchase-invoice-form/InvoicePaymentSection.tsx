import React from "react";
import {
  Receipt,
  CreditCard,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { formatCurrency } from "../../../utils/currency";
import {
  TreasuryAccount,
  PurchaseInvoiceFormData,
  InvoiceTotals,
} from "./types";

export interface InvoicePaymentSectionProps {
  itemsCount: number;
  totals: InvoiceTotals;
  formData: PurchaseInvoiceFormData;
  setFormData: React.Dispatch<React.SetStateAction<PurchaseInvoiceFormData>>;
  paymentOption: "UNPAID" | "FULL" | "PARTIAL";
  setPaymentOption: (option: "UNPAID" | "FULL" | "PARTIAL") => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  customPaidAmount: number;
  setCustomPaidAmount: (amount: number) => void;
  treasuryAccounts: TreasuryAccount[];
  treasuryAccountId: string;
  setTreasuryAccountId: (id: string) => void;
  saving: boolean;
  isEdit: boolean;
  onCancel: () => void;
  t: (key: string, fallback: string) => string;
}

export const InvoicePaymentSection: React.FC<InvoicePaymentSectionProps> = ({
  itemsCount,
  totals,
  formData,
  setFormData,
  paymentOption,
  setPaymentOption,
  paymentMethod,
  setPaymentMethod,
  customPaidAmount,
  setCustomPaidAmount,
  treasuryAccounts,
  treasuryAccountId,
  setTreasuryAccountId,
  saving,
  isEdit,
  onCancel,
  t,
}) => {
  return (
    <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-4">
      {/* Live Financial Receipt Card */}
      <Card className="border border-border/70 shadow-2xs bg-card" size="sm">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
              <Receipt className="size-4 text-primary" />
              {t("procurement.purchaseInvoiceForm.summaryTitle", "ملخص الحسابات")}
            </h3>
            <span className="text-xs font-mono font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md tabular-nums">
              {itemsCount} بنود
            </span>
          </div>

          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("procurement.purchaseInvoiceForm.subtotalLabel", "المجموع قبل الخصم:")}
              </span>
              <span className="font-semibold font-mono tabular-nums">
                {formatCurrency(totals.subtotal)}
              </span>
            </div>

            {totals.itemDiscounts > 0 && (
              <div className="flex justify-between text-red-500">
                <span>
                  {t("procurement.purchaseInvoiceForm.itemDiscountsLabel", "خصم البنود:")}
                </span>
                <span className="font-semibold font-mono tabular-nums">
                  -{formatCurrency(totals.itemDiscounts)}
                </span>
              </div>
            )}

            {totals.totalTax > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>{t("procurement.purchaseInvoiceForm.totalTaxLabel", "الضرائب:")}</span>
                <span className="font-semibold font-mono tabular-nums">
                  +{formatCurrency(totals.totalTax)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-1">
              <span className="text-xs text-muted-foreground shrink-0">
                {t("procurement.purchaseInvoiceForm.shippingLabel", "مصاريف الشحن:")}
              </span>
              <Input
                type="number"
                min="0"
                step="any"
                className="h-8 w-28 text-right font-mono tabular-nums text-xs rounded-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={formData.shippingCost}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, shippingCost: Number(e.target.value) }))
                }
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground shrink-0">
                {t("procurement.purchaseInvoiceForm.additionalDiscountLabel", "خصم إضافي:")}
              </span>
              <Input
                type="number"
                min="0"
                step="any"
                className="h-8 w-28 text-right font-mono tabular-nums text-xs rounded-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={formData.discountAmount}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    discountAmount: Number(e.target.value),
                  }))
                }
              />
            </div>

            <Separator className="my-2" />

            <div className="flex justify-between items-baseline pt-1">
              <span className="font-bold text-sm">
                {t("procurement.purchaseInvoiceForm.grandTotalLabel", "صافي الفاتورة:")}
              </span>
              <span className="text-2xl font-black font-mono tabular-nums text-primary">
                {formatCurrency(totals.grandTotal)}
              </span>
            </div>
          </div>

          <Separator className="my-2" />

          {/* Immediate Payment Controls */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-foreground flex items-center gap-1">
                <CreditCard className="size-3.5 text-primary" />
                طريقة السداد لهذه الفاتورة:
              </Label>
            </div>

            {/* Payment Options Segmented Radio */}
            <div className="grid grid-cols-3 gap-1 bg-muted/60 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setPaymentOption("UNPAID")}
                className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-all ${
                  paymentOption === "UNPAID"
                    ? "bg-background text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                آجل (لاحقاً)
              </button>
              <button
                type="button"
                onClick={() => setPaymentOption("FULL")}
                className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-all ${
                  paymentOption === "FULL"
                    ? "bg-emerald-600 text-white shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                سداد فوري
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentOption("PARTIAL");
                  if (!customPaidAmount) setCustomPaidAmount(totals.grandTotal / 2);
                }}
                className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-all ${
                  paymentOption === "PARTIAL"
                    ? "bg-amber-600 text-white shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                دفعة مقدمة
              </button>
            </div>

            {/* If Paid or Partial: Show Method and Amount */}
            {paymentOption !== "UNPAID" && (
              <div className="space-y-2.5 p-3 rounded-xl bg-accent/40 border border-border/80 animate-in fade-in-0 duration-150">
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground">
                    طريقة الدفع المسدد بها:
                  </Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="h-9 rounded-lg text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">نقدي (كاش من الخزينة)</SelectItem>
                      <SelectItem value="BANK_TRANSFER">تحويل بنكي</SelectItem>
                      <SelectItem value="INSTAPAY">إنستاباي / محفظة إلكترونية</SelectItem>
                      <SelectItem value="CHECK">شيك مصرفي</SelectItem>
                      <SelectItem value="OTHER">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {treasuryAccounts.length > 0 && (
                  <div className="space-y-1">
                    <Label className="text-[11px] font-medium text-muted-foreground">
                      الخزينة المسحوب منها *:
                    </Label>
                    <Select
                      value={treasuryAccountId}
                      onValueChange={(val: any) => setTreasuryAccountId(val || "")}
                    >
                      <SelectTrigger className="h-9 rounded-lg text-xs">
                        <SelectValue placeholder="اختر الخزينة" />
                      </SelectTrigger>
                      <SelectContent>
                        {treasuryAccounts.map((acc) => (
                          <SelectItem key={acc.id} value={acc.id}>
                            {acc.name} ({formatCurrency(acc.balance || 0)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {paymentOption === "PARTIAL" && (
                  <div className="space-y-1">
                    <Label className="text-[11px] font-medium text-muted-foreground">
                      المبلغ المسدد الآن:
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      max={totals.grandTotal}
                      step="any"
                      value={customPaidAmount}
                      onChange={(e) => setCustomPaidAmount(Number(e.target.value))}
                      className="h-9 font-mono tabular-nums text-xs rounded-lg"
                    />
                  </div>
                )}

                <div className="flex justify-between items-center text-xs pt-1 border-t border-border/40 font-mono">
                  <span className="text-muted-foreground">المتبقي على الحساب:</span>
                  <strong className="text-amber-600 font-bold tabular-nums">
                    {formatCurrency(totals.remainingAmount)}
                  </strong>
                </div>
              </div>
            )}
          </div>

          {/* Primary CTA Buttons (Desktop) */}
          <div className="pt-2 space-y-2 hidden md:block">
            <Button
              type="submit"
              disabled={saving}
              className="w-full h-12 text-base rounded-xl font-bold active:scale-[0.98] transition-transform duration-100 shadow-md bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {saving ? <LoadingSpinner size="sm" /> : <Save className="size-4 me-1.5" />}
              {isEdit
                ? t("procurement.purchaseInvoiceForm.updateBtn", "تحديث الفاتورة")
                : t("procurement.purchaseInvoiceForm.createBtn", "تأكيد وحفظ الفاتورة")}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full rounded-xl text-xs"
            >
              {t("procurement.purchaseInvoiceForm.cancel", "إلغاء والعودة")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sticky Action Bar for Mobile (< 768px) */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-md border-t border-border/80 p-3 flex items-center justify-between shadow-2xl md:hidden">
        <div className="flex flex-col">
          <span className="text-[11px] text-muted-foreground">صافي الفاتورة:</span>
          <span className="text-lg font-black font-mono tabular-nums text-primary">
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
    </div>
  );
};
