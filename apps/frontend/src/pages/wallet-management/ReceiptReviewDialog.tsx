import React from "react";
import { AlertCircle, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  type PendingReceiptRecord,
  formatCurrency,
  formatDate,
  getFullImageUrl,
} from "./types";

export type ReceiptReviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: PendingReceiptRecord | null;
  submitting: boolean;
  onDecision: (decision: "approve" | "reject") => void;
};

export const ReceiptReviewDialog: React.FC<ReceiptReviewDialogProps> = ({
  open,
  onOpenChange,
  receipt,
  submitting,
  onDecision,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto text-right sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>مراجعة الإيصال</DialogTitle>
          <DialogDescription>
            راجع بيانات الشركة والفاتورة وصورة الإيصال قبل اعتماد العملية أو رفضها.
          </DialogDescription>
        </DialogHeader>

        {receipt ? (
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card size="sm" className="rounded-[1.5rem]">
                <CardHeader>
                  <CardTitle>بيانات الشركة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">الشركة</p>
                    <p className="font-semibold">{receipt.invoice.company.name || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">البريد الإلكتروني</p>
                    <p className="font-mono text-xs">{receipt.invoice.company.email || "-"}</p>
                  </div>
                </CardContent>
              </Card>

              <Card size="sm" className="rounded-[1.5rem]">
                <CardHeader>
                  <CardTitle>بيانات الدفع</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">رقم الفاتورة</p>
                    <p className="font-semibold font-mono tabular-nums">
                      {receipt.invoice.invoiceNumber || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">المبلغ</p>
                    <p className="font-semibold text-primary font-mono tabular-nums">
                      {formatCurrency(receipt.invoice.totalAmount)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">تاريخ الإرسال</p>
                    <p className="font-mono tabular-nums">{formatDate(receipt.submittedAt)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="rounded-[1.5rem] border border-border/60 bg-muted/20 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">المحفظة المستخدمة</p>
                  <p className="font-semibold">{receipt.walletNumber.name || "-"}</p>
                  <p className="font-mono text-xs text-muted-foreground tabular-nums">
                    {receipt.walletNumber.number || "-"}
                  </p>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">حالة المراجعة</p>
                  <p className="font-semibold">بانتظار قرار الإدارة</p>
                </div>
              </div>
            </div>

            {receipt.receiptImage ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">صورة الإيصال</p>
                <img
                  src={getFullImageUrl(receipt.receiptImage)}
                  alt="إيصال الدفع"
                  className="max-h-[26rem] w-full rounded-[1.5rem] border border-border/60 object-contain"
                  loading="lazy"
                />
              </div>
            ) : (
              <Alert className="text-right">
                <AlertCircle className="size-4" />
                <AlertTitle>لا توجد صورة مرفقة</AlertTitle>
                <AlertDescription>
                  هذا الإيصال لا يحتوي على صورة مرفوعة، لذلك راجع البيانات بعناية قبل اتخاذ القرار.
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={submitting || !receipt}
            onClick={() => onDecision("reject")}
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <XCircle className="size-4" />
            )}
            رفض الإيصال
          </Button>
          <Button
            type="button"
            disabled={submitting || !receipt}
            onClick={() => onDecision("approve")}
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            اعتماد الإيصال
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
