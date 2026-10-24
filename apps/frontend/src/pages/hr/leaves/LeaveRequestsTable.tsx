import React from "react";
import {
  Calendar,
  Check,
  X,
  Eye,
  RotateCcw,
  ArrowRight,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { LeaveRequest, leaveTypeConfig, statusConfig } from "./types";

interface LeaveRequestsTableProps {
  t: (key: string, options?: any) => string;
  loading: boolean;
  requests: LeaveRequest[];
  isMyLeaves: boolean;
  pagination: { page: number; limit: number; total: number; totalPages: number };
  setPagination: React.Dispatch<
    React.SetStateAction<{ page: number; limit: number; total: number; totalPages: number }>
  >;
  onApprove: (id: string) => void;
  onOpenReject: (req: LeaveRequest) => void;
  onCancel: (id: string) => void;
  onOpenChangeDecision: (req: LeaveRequest) => void;
  onOpenEdit: (req: LeaveRequest) => void;
  onDelete: (req: LeaveRequest) => void;
  onOpenDetails: (req: LeaveRequest) => void;
}

export const LeaveRequestsTable: React.FC<LeaveRequestsTableProps> = ({
  t,
  loading,
  requests,
  isMyLeaves,
  pagination,
  setPagination,
  onApprove,
  onOpenReject,
  onCancel,
  onOpenChangeDecision,
  onOpenEdit,
  onDelete,
  onOpenDetails,
}) => {
  return (
    <Card>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Calendar className="h-12 w-12 mb-4 opacity-50" />
            <p>{t("employee.leaves.noLeaveRequests")}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {!isMyLeaves && (
                  <TableHead className="text-right">{t("employee.leaves.employee")}</TableHead>
                )}
                <TableHead className="text-right">{t("employee.leaves.leaveType")}</TableHead>
                <TableHead className="text-right">{t("employee.leaves.from")}</TableHead>
                <TableHead className="text-right">{t("employee.leaves.to")}</TableHead>
                <TableHead className="text-right">{t("employee.leaves.duration")}</TableHead>
                <TableHead className="text-right">{t("employee.leaves.status")}</TableHead>
                <TableHead className="text-right">{t("employee.leaves.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => {
                const typeConfig =
                  leaveTypeConfig[request.type] || leaveTypeConfig["OTHER"];
                const TypeIcon = typeConfig?.icon || Calendar;

                return (
                  <TableRow key={request.id}>
                    {!isMyLeaves && (
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={request.employee?.avatar} />
                            <AvatarFallback>
                              {request.employee?.firstName?.[0]}
                              {request.employee?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {request.employee?.firstName} {request.employee?.lastName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {request.employee?.department?.name}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={typeConfig?.color || "bg-gray-100"}>
                          <TypeIcon className="h-3 w-3 ml-1" />
                          {t(typeConfig?.labelKey) || request.type}
                        </Badge>
                        <Badge
                          className={`${
                            request.type !== "UNPAID"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {request.type !== "UNPAID"
                            ? t("employee.leaves.paid")
                            : t("employee.leaves.unpaid")}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono tabular-nums">
                      {new Date(request.startDate).toLocaleDateString("ar-EG")}
                    </TableCell>
                    <TableCell className="font-mono tabular-nums">
                      {new Date(request.endDate).toLocaleDateString("ar-EG")}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium font-mono tabular-nums">{request.totalDays}</span>{" "}
                      {t("employee.leaves.day")}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[request.status]?.color || ""}>
                        {t(statusConfig[request.status]?.labelKey) || request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {request.status === "PENDING" && !isMyLeaves && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => onApprove(request.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => onOpenReject(request)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}

                        {request.status === "PENDING" && isMyLeaves && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="bg-orange-500 hover:bg-orange-600"
                            onClick={() => onCancel(request.id)}
                          >
                            {t("employee.leaves.cancel")}
                          </Button>
                        )}

                        {(request.status === "REJECTED" || request.status === "APPROVED") &&
                          !isMyLeaves && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-blue-500 text-blue-600 hover:bg-blue-50"
                                onClick={() => onOpenChangeDecision(request)}
                              >
                                <RotateCcw className="h-4 w-4 ml-1" />
                                {t("employee.leaves.changeDecision")}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-amber-500 text-amber-600 hover:bg-amber-50"
                                onClick={() => onOpenEdit(request)}
                              >
                                <ArrowRight className="h-4 w-4 ml-1" />
                                {t("employee.leaves.edit")}
                              </Button>
                            </>
                          )}

                        {!isMyLeaves && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500 text-red-600 hover:bg-red-50"
                            onClick={() => onDelete(request)}
                          >
                            <Trash2 className="h-4 w-4 ml-1" />
                            {t("employee.leaves.delete")}
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onOpenDetails(request)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t">
          <p className="text-sm text-gray-500 font-mono tabular-nums">
            {t("employee.leaves.pagination", {
              from: (pagination.page - 1) * pagination.limit + 1,
              to: Math.min(pagination.page * pagination.limit, pagination.total),
              total: pagination.total,
            })}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
