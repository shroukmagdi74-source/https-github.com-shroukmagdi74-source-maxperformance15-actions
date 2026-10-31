import React from "react";
import {
  ArrowLeft,
  Printer,
  Pencil,
  Trash2,
  Banknote,
  Receipt,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "../../../utils/currency";
import { formatShortDate } from "../../../utils/dateFormat";
import { PAYMENT_METHODS } from "./constants";
import { ExistingPayment } from "./types";

interface PaymentViewVoucherProps {
  existingPayment: ExistingPayment;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onNewPayment: () => void;
}

export const PaymentViewVoucher: React.FC<PaymentViewVoucherProps> = ({
  existingPayment,
  onBack,
  onEdit,
  onDelete,
  onNewPayment,
}) => {
  return (
    <div className="p-3 sm:p-6 max-w-4xl mx-auto space-y-5">
      {/* Navigation Bar */}
      <div className="flex items-center justify-between gap-3 no-print">
        <Button
          variant="ghost"
          onClick={onBack}
          className="gap-2 rounded-xl"
        >
          <ArrowLeft className="size-4" /> العودة لقائمة المدفوعات
        </Button>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="gap-2 rounded-xl"
          >
            <Printer className="size-4" /> طباعة السند
          </Button>
          <Button
            variant="outline"
            onClick={onEdit}
            className="gap-2 rounded-xl hover:text-primary"
          >
            <Pencil className="size-4" /> تعديل السند
          </Button>
          <Button
            variant="outline"
            onClick={onDelete}
            className="gap-2 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="size-4" /> حذف السند
          </Button>
          <Button
            onClick={onNewPayment}
            className="gap-2 rounded-xl bg-primary text-primary-foreground font-semibold"
          >
            <Banknote className="size-4" /> تسجيل دفعة جديدة
          </Button>
        </div>
      </div>

      {/* Official Printable Voucher Card */}
      <Card className="border border-border/80 shadow-lg bg-card print:border-none print:shadow-none print:m-0">
        <CardContent className="p-6 sm:p-10 space-y-6">
          {/* Voucher Header */}
          <div className="flex items-center justify-between pb-6 border-b border-border/80">
            <div className="space-y-1">
              <span className="text-xs font-bold tracking-widest uppercase text-primary">
                إيصال / سند صرف رسمي
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground">
                سند صرف نقدية / بنكي
              </h1>
              <p className="text-xs text-muted-foreground">
                Payment Voucher — Procurement & Supplier Settlement
              </p>
            </div>

            <div className="text-right space-y-1 font-mono">
              <div className="text-xs text-muted-foreground font-sans">رقم السند:</div>
              <div className="text-xl font-black text-primary px-3 py-1 bg-primary/10 rounded-xl border border-primary/20 inline-block">
                {existingPayment.paymentNumber}
              </div>
              <div className="text-xs text-muted-foreground pt-1">
                تاريخ السند:{" "}
                <strong className="text-foreground tabular-nums">
                  {formatShortDate(existingPayment.paymentDate, "ar")}
                </strong>
              </div>
            </div>
          </div>

          {/* Voucher Amount Highlights */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                المبلغ المنصرف للمورد:
              </span>
              <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatCurrency(existingPayment.amount)}
              </div>
            </div>
            <div className="text-right space-y-1">
              <span className="text-xs text-muted-foreground font-medium">طريقة الصرف:</span>
              <div className="text-base font-bold text-foreground flex items-center gap-1.5 justify-end">
                <CheckCircle2 className="size-4 text-emerald-600" />
                {PAYMENT_METHODS.find((m) => m.value === existingPayment.paymentMethod)?.label ||
                  existingPayment.paymentMethod}
              </div>
            </div>
          </div>

          {/* Beneficiary & Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-xl border border-border/60 bg-muted/30 space-y-2">
              <span className="text-xs font-bold text-muted-foreground block">
                بيانات المستفيد (المورد):
              </span>
              <div className="text-base font-bold text-foreground">
                {existingPayment.supplier?.name || "غير محدد"}
              </div>
              {existingPayment.supplier?.phone && (
                <div className="text-xs text-muted-foreground font-mono">
                  هاتف: {existingPayment.supplier.phone}
                </div>
              )}
              {existingPayment.supplier?.contactPerson && (
                <div className="text-xs text-muted-foreground">
                  مسؤول التواصل: {existingPayment.supplier.contactPerson}
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl border border-border/60 bg-muted/30 space-y-2">
              <span className="text-xs font-bold text-muted-foreground block">
                التخصيص والربط المحاسبي:
              </span>
              {existingPayment.purchaseInvoice ? (
                <>
                  <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Receipt className="size-4 text-primary" />
                    سداد مقابل فاتورة:{" "}
                    <strong className="font-mono text-primary">
                      {existingPayment.purchaseInvoice.invoiceNumber}
                    </strong>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono tabular-nums">
                    إجمالي الفاتورة:{" "}
                    {formatCurrency(existingPayment.purchaseInvoice.totalAmount)}
                  </div>
                </>
              ) : (
                <div className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Clock className="size-4 text-amber-500" />
                  سداد عام على حساب المورد (دفعة تحت الحساب)
                </div>
              )}
              {existingPayment.referenceNumber && (
                <div className="text-xs text-muted-foreground font-mono">
                  المرجع: {existingPayment.referenceNumber}
                </div>
              )}
            </div>
          </div>

          {/* Bank / Check Details (if applicable) */}
          {(existingPayment.bankName || existingPayment.checkNumber) && (
            <div className="p-4 rounded-xl border border-border/60 bg-muted/20 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {existingPayment.bankName && (
                <div>
                  <span className="text-muted-foreground block">البنك:</span>
                  <strong className="text-sm text-foreground">{existingPayment.bankName}</strong>
                </div>
              )}
              {existingPayment.checkNumber && (
                <div>
                  <span className="text-muted-foreground block">رقم الشيك:</span>
                  <strong className="text-sm font-mono text-foreground">
                    {existingPayment.checkNumber}
                  </strong>
                </div>
              )}
              {existingPayment.checkDate && (
                <div>
                  <span className="text-muted-foreground block">تاريخ استحقاق الشيك:</span>
                  <strong className="text-sm font-mono text-foreground tabular-nums">
                    {formatShortDate(existingPayment.checkDate, "ar")}
                  </strong>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {existingPayment.notes && (
            <div className="p-3.5 rounded-xl border border-border/50 bg-muted/10 space-y-1">
              <span className="text-xs text-muted-foreground font-medium block">
                ملاحظات السند:
              </span>
              <p className="text-xs text-foreground leading-relaxed">
                {existingPayment.notes}
              </p>
            </div>
          )}

          {/* Signature Blocks */}
          <div className="pt-8 border-t border-border/70 grid grid-cols-3 gap-4 text-center text-xs text-muted-foreground">
            <div className="space-y-6">
              <div>المحاسب المسؤول</div>
              <div className="h-0.5 w-24 mx-auto border-b border-dashed border-border" />
            </div>
            <div className="space-y-6">
              <div>المدير المالي / الاعتماد</div>
              <div className="h-0.5 w-24 mx-auto border-b border-dashed border-border" />
            </div>
            <div className="space-y-6">
              <div>توقيع المستلم (المورد)</div>
              <div className="h-0.5 w-24 mx-auto border-b border-dashed border-border" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
