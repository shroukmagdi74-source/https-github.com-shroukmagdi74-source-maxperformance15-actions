import React from "react";
import { Eye, ReceiptText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BusinessSectionPanel } from "@/components/business/BusinessSurface";
import { cn } from "@/lib/utils";
import {
  type PendingReceiptRecord,
  type SectionProps,
  formatCurrency,
  formatDate,
} from "./types";
import {
  SectionEmptyState,
  SectionErrorNotice,
  SectionLoadingState,
} from "./WalletSectionStates";

export type PendingReceiptsSectionProps = SectionProps & {
  receipts: PendingReceiptRecord[];
  onOpenReceipt: (receipt: PendingReceiptRecord) => void;
};

export const PendingReceiptsSection: React.FC<PendingReceiptsSectionProps> = ({
  receipts,
  loading,
  error,
  onOpenReceipt,
}) => {
  return (
    <BusinessSectionPanel
      title="الإيصالات المعلقة"
      description="مراجعة سريعة للإيصالات المرسلة مع فتح نافذة التفاصيل للموافقة أو الرفض."
      headerAside={
        <Badge
          variant="outline"
          className={cn(
            "rounded-full px-3 py-1 font-mono tabular-nums",
            receipts.length > 0
              ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
              : undefined,
          )}
        >
          {receipts.length} إيصال
        </Badge>
      }
      contentClassName="space-y-4"
    >
      {error ? <SectionErrorNotice message={error} /> : null}
      {loading ? <SectionLoadingState label="جاري تحميل الإيصالات المعلقة..." /> : null}

      {!loading && receipts.length === 0 ? (
        <SectionEmptyState
          icon={ReceiptText}
          title="لا توجد إيصالات معلقة"
          description="أي إيصال جديد يحتاج مراجعة سيظهر هنا مباشرة مع بيانات الشركة والفاتورة."
        />
      ) : null}

      {!loading && receipts.length > 0 ? (
        <>
          <div className="grid gap-3 md:hidden">
            {receipts.map((receipt) => (
              <Card key={receipt.id} size="sm" className="rounded-[1.5rem]">
                <CardHeader className="gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <CardTitle className="text-right">
                        {receipt.invoice.company.name || "شركة غير معروفة"}
                      </CardTitle>
                      <CardDescription>{receipt.invoice.company.email || "-"}</CardDescription>
                    </div>
                    <Badge variant="outline" className="rounded-full px-3 py-1 font-mono tabular-nums">
                      {receipt.invoice.invoiceNumber || "بدون رقم"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 rounded-2xl bg-muted/30 p-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">المبلغ</span>
                      <span className="font-semibold text-primary font-mono tabular-nums">
                        {formatCurrency(receipt.invoice.totalAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">المحفظة</span>
                      <div className="text-right">
                        <p className="font-medium">{receipt.walletNumber.name || "-"}</p>
                        <p className="font-mono text-xs text-muted-foreground tabular-nums">
                          {receipt.walletNumber.number || "-"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">تاريخ الإرسال</span>
                      <span className="font-mono tabular-nums">{formatDate(receipt.submittedAt)}</span>
                    </div>
                  </div>

                  <Button type="button" className="w-full" onClick={() => onOpenReceipt(receipt)}>
                    <Eye className="size-4" />
                    مراجعة الإيصال
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="hidden md:block">
            <div className="overflow-hidden rounded-[1.5rem] border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="text-right">الشركة</TableHead>
                    <TableHead className="text-right">الفاتورة</TableHead>
                    <TableHead className="text-right">المبلغ</TableHead>
                    <TableHead className="text-right">المحفظة</TableHead>
                    <TableHead className="text-right">تاريخ الإرسال</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipts.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell>
                        <div className="space-y-1 text-right">
                          <p className="font-medium text-foreground">
                            {receipt.invoice.company.name || "شركة غير معروفة"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {receipt.invoice.company.email || "-"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono tabular-nums">
                        {receipt.invoice.invoiceNumber || "-"}
                      </TableCell>
                      <TableCell className="font-semibold text-primary font-mono tabular-nums">
                        {formatCurrency(receipt.invoice.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-right">
                          <p className="font-medium">{receipt.walletNumber.name || "-"}</p>
                          <p className="font-mono text-xs text-muted-foreground tabular-nums">
                            {receipt.walletNumber.number || "-"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono tabular-nums">
                        {formatDate(receipt.submittedAt)}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onOpenReceipt(receipt)}
                        >
                          <Eye className="size-4" />
                          مراجعة
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      ) : null}
    </BusinessSectionPanel>
  );
};
