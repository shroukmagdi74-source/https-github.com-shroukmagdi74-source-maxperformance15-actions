import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Badge } from "../../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { formatCurrency } from "./helpers";
import type { AdvanceRequest } from "./types";

interface AdvanceDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: AdvanceRequest | null;
}

export const AdvanceDetailsDialog: React.FC<AdvanceDetailsDialogProps> = ({
  open,
  onOpenChange,
  request,
}) => {
  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl" dir="rtl">
        <DialogHeader>
          <DialogTitle>تفاصيل السلفة</DialogTitle>
          <DialogDescription>تفاصيل الطلب وجدول الأقساط</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">المبلغ</p>
              <p className="font-bold text-lg text-gray-900 dark:text-white font-mono tabular-nums">
                {formatCurrency(request.amount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                نظام السداد
              </p>
              <p className="font-bold text-gray-900 dark:text-white text-sm">
                {request.repaymentType === "ONE_TIME" ? "دفعة واحدة" : "أقساط"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                سبب الطلب
              </p>
              <p className="text-gray-900 dark:text-gray-100 text-sm">
                {request.reason || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                تاريخ ووقت الطلب
              </p>
              <p className="text-gray-900 dark:text-gray-100 text-xs font-mono tabular-nums">
                {new Date(
                  request.createdAt || request.requestDate,
                ).toLocaleString("ar-EG", {
                  dateStyle: "long",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </div>

          {request.repaymentType === "INSTALLMENTS" &&
            request.installments?.length > 0 && (
              <div>
                <h4 className="font-bold mb-2 text-gray-900 dark:text-white text-sm">
                  جدول الأقساط
                </h4>
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-100 dark:bg-gray-800">
                        <TableHead className="text-right text-gray-700 dark:text-gray-300 text-xs">
                          القسط
                        </TableHead>
                        <TableHead className="text-right text-gray-700 dark:text-gray-300 text-xs">
                          تاريخ الاستحقاق
                        </TableHead>
                        <TableHead className="text-right text-gray-700 dark:text-gray-300 text-xs">
                          المبلغ
                        </TableHead>
                        <TableHead className="text-right text-gray-700 dark:text-gray-300 text-xs">
                          الحالة
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {request.installments.map((inst, idx) => (
                        <TableRow key={inst.id} className="dark:border-gray-700">
                          <TableCell className="dark:text-gray-200 text-xs font-mono tabular-nums">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="dark:text-gray-200 text-xs font-mono tabular-nums">
                            {new Date(inst.dueDate).toLocaleDateString("ar-EG")}
                          </TableCell>
                          <TableCell className="dark:text-gray-200 text-xs font-mono tabular-nums font-bold">
                            {formatCurrency(inst.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                inst.status === "PAID" ? "default" : "outline"
                              }
                              className="text-[10px]"
                            >
                              {inst.status === "PAID" ? "تم الدفع" : "مستحق"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
