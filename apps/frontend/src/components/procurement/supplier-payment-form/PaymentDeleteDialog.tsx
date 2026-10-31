import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { formatCurrency } from "../../../utils/currency";
import { ExistingPayment } from "./types";

interface PaymentDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingPayment: ExistingPayment | null;
  deleting: boolean;
  onConfirmDelete: () => void;
}

export const PaymentDeleteDialog: React.FC<PaymentDeleteDialogProps> = ({
  open,
  onOpenChange,
  existingPayment,
  deleting,
  onConfirmDelete,
}) => {
  if (!existingPayment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive text-lg font-bold">
            <AlertCircle className="size-5" />
            <span>تأكيد حذف سند الصرف</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground pt-1">
            سيتم التراجع عن هذه المعاملة المالية وإعادة تسوية الحسابات.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-sm">
          <p className="leading-relaxed">
            هل أنت متأكد من حذف سند الصرف رقم{" "}
            <strong className="font-mono text-primary font-bold">
              {existingPayment.paymentNumber}
            </strong>{" "}
            بقيمة{" "}
            <strong className="text-destructive font-bold tabular-nums">
              {formatCurrency(existingPayment.amount)}
            </strong>{" "}
            الخاص بالمورد{" "}
            <strong className="font-bold">{existingPayment.supplier?.name}</strong>{" "}
            نهائياً؟
          </p>
          <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/5 text-xs text-destructive space-y-1">
            <p className="font-semibold">تأثير الحذف:</p>
            <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
              <li>سيتم زيادة مديونية المورد (إرجاع المبلغ لرصيده).</li>
              {existingPayment.purchaseInvoice && (
                <li>
                  سيتم إعادة فتح المبلغ المتبقي على الفاتورة رقم{" "}
                  <span className="font-mono">
                    {existingPayment.purchaseInvoice.invoiceNumber}
                  </span>
                  .
                </li>
              )}
              <li>سيتم حذف القيد المالي المرتبط بالدفعة في الخزينة.</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
          >
            إلغاء
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirmDelete}
            disabled={deleting}
            className="gap-2"
          >
            {deleting && <LoadingSpinner size="sm" />}
            {deleting ? "جاري الحذف..." : "حذف نهائياً"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
