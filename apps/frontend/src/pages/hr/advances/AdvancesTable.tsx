import React from "react";
import {
  DollarSign,
  Eye,
  Check,
  X,
  Edit2,
  Trash,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Progress } from "../../../components/ui/progress";
import {
  statusConfig,
  formatCurrency,
  calculatePaidAmount,
  calculateProgress,
  calculateRemaining,
  isRequestPaid,
} from "./helpers";
import type { AdvanceRequest, AdvancePagination } from "./types";

interface AdvancesTableProps {
  loading: boolean;
  requests: AdvanceRequest[];
  rawTotalCount: number;
  pagination: AdvancePagination;
  onPageChange: (page: number) => void;
  onApprove: (id: string) => void;
  onOpenReject: (request: AdvanceRequest) => void;
  onOpenDetails: (request: AdvanceRequest) => void;
  onOpenUpdateStatus: (request: AdvanceRequest) => void;
  onDelete: (id: string) => void;
  onMarkAsPaid: (id: string) => void;
}

export const AdvancesTable: React.FC<AdvancesTableProps> = ({
  loading,
  requests,
  rawTotalCount,
  pagination,
  onPageChange,
  onApprove,
  onOpenReject,
  onOpenDetails,
  onOpenUpdateStatus,
  onDelete,
  onMarkAsPaid,
}) => {
  return (
    <Card className="shadow-sm border border-slate-200 dark:border-slate-800">
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <DollarSign className="h-12 w-12 mb-3 opacity-40" />
            <p className="text-base font-medium">لا توجد طلبات سلف</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-slate-800/60">
                  <TableHead className="text-right text-xs font-semibold">
                    الموظف
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold">
                    التاريخ والوقت
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold">
                    المبلغ
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold">
                    المتبقي
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold">
                    نوع السداد
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold">
                    التقدم
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold">
                    الحالة
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold">
                    الإجراءات
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => {
                  const paid = isRequestPaid(request);
                  const remaining = Math.max(calculateRemaining(request), 0);
                  const isPending = request.status === "PENDING";
                  const isApproved = request.status === "APPROVED";

                  return (
                    <TableRow
                      key={request.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={request.employee?.avatar} />
                            <AvatarFallback className="text-xs font-bold">
                              {request.employee?.firstName?.[0]}
                              {request.employee?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm text-slate-900 dark:text-white">
                              {request.employee?.firstName}{" "}
                              {request.employee?.lastName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {request.employee?.position?.title || "موظف"}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col text-xs font-mono tabular-nums">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {new Date(
                              request.createdAt || request.requestDate,
                            ).toLocaleDateString("ar-EG")}
                          </span>
                          <span className="text-[11px] text-gray-500">
                            {new Date(
                              request.createdAt || request.requestDate,
                            ).toLocaleTimeString("ar-EG", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="font-bold text-slate-900 dark:text-white font-mono tabular-nums text-sm">
                        {formatCurrency(request.amount)}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs font-mono tabular-nums">
                            {formatCurrency(remaining)}
                          </span>
                          {paid ? (
                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-none text-[10px] font-bold">
                              مسدد
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-[10px] font-bold"
                            >
                              غير مسدد
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-xs font-medium">
                        {request.repaymentType === "ONE_TIME"
                          ? "دفعة واحدة"
                          : `${request.installmentsCount} أقساط`}
                      </TableCell>

                      <TableCell>
                        {isApproved && (
                          <div className="space-y-1 min-w-[120px]">
                            <Progress
                              value={calculateProgress(request)}
                              className="h-1.5"
                            />
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-mono tabular-nums">
                              {formatCurrency(
                                calculatePaidAmount(request.installments),
                              )}{" "}
                              / {formatCurrency(request.amount)}
                            </p>
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={`text-xs px-2.5 py-0.5 font-medium border-none ${
                            statusConfig[request.status]?.color || ""
                          }`}
                        >
                          {statusConfig[request.status]?.label ||
                            request.status}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onOpenDetails(request)}
                            title="التفاصيل"
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Button>

                          {isPending ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                                onClick={() => onApprove(request.id)}
                                title="موافقة"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                onClick={() => onOpenReject(request)}
                                title="رفض"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onOpenUpdateStatus(request)}
                              title="تعديل القرار"
                              className="h-8 w-8 p-0"
                            >
                              <Edit2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </Button>
                          )}

                          {!paid && isApproved && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2 text-xs font-semibold text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                              onClick={() => onMarkAsPaid(request.id)}
                              title="تعليم السلفة كمسددة"
                            >
                              <Check className="h-3.5 w-3.5 ml-1" />
                              <span>تسوية</span>
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDelete(request.id)}
                            title="حذف"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Pagination Footer */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800 text-sm">
          <p className="text-gray-500 font-mono tabular-nums text-xs">
            عرض {(pagination.page - 1) * pagination.limit + 1} -{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} من{" "}
            {pagination.total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
