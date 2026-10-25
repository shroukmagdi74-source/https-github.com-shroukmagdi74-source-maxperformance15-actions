import React from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PermissionRequest, PaginationState } from "./types";
import { PermissionMobileCard } from "./PermissionMobileCard";
import { PermissionTableRow } from "./PermissionTableRow";

interface PermissionTableProps {
  loading: boolean;
  requests: PermissionRequest[];
  isMyPermissions: boolean;
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  onApprove: (id: string) => void;
  onRejectClick: (request: PermissionRequest) => void;
  onDetailsClick: (request: PermissionRequest) => void;
  onDeleteClick: (request: PermissionRequest) => void;
  onOpenAddDialog: () => void;
}

export const PermissionTable: React.FC<PermissionTableProps> = ({
  loading,
  requests,
  isMyPermissions,
  pagination,
  setPagination,
  onApprove,
  onRejectClick,
  onDetailsClick,
  onDeleteClick,
  onOpenAddDialog,
}) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-blue-600 border-t-transparent"></div>
        <p className="text-gray-500 text-sm animate-pulse">
          {t("employee.permissions.loading")}
        </p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-80 text-gray-400 p-4 text-center">
        <div className="p-5 sm:p-6 bg-gray-50 dark:bg-gray-800/50 rounded-full mb-3 sm:mb-4">
          <Calendar className="h-10 w-10 sm:h-12 sm:w-12 opacity-20" />
        </div>
        <p className="text-base sm:text-lg">{t("employee.permissions.noPermissions")}</p>
        <Button variant="link" onClick={onOpenAddDialog} className="text-sm mt-1">
          {t("employee.permissions.noPermissionsHint")}
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Mobile View: Cards */}
      <div className="block md:hidden divide-y divide-gray-100 dark:divide-gray-800">
        {requests.map((request) => (
          <PermissionMobileCard
            key={request.id}
            request={request}
            isMyPermissions={isMyPermissions}
            onApprove={onApprove}
            onRejectClick={onRejectClick}
            onDetailsClick={onDetailsClick}
            onDeleteClick={onDeleteClick}
          />
        ))}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50/50 dark:bg-gray-800/20">
            <TableRow className="border-none">
              {!isMyPermissions && (
                <TableHead className="text-right font-bold py-4">
                  {t("employee.permissions.colEmployee")}
                </TableHead>
              )}
              <TableHead className="text-right font-bold">
                {t("employee.permissions.colType")}
              </TableHead>
              <TableHead className="text-right font-bold">
                {t("employee.permissions.colDate")}
              </TableHead>
              <TableHead className="text-right font-bold">
                {t("employee.permissions.colTime")}
              </TableHead>
              <TableHead className="text-right font-bold">
                {t("employee.permissions.colDuration")}
              </TableHead>
              <TableHead className="text-right font-bold">
                {t("employee.permissions.colStatus")}
              </TableHead>
              <TableHead className="text-left font-bold pl-6">
                {t("employee.permissions.colActions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <PermissionTableRow
                key={request.id}
                request={request}
                isMyPermissions={isMyPermissions}
                onApprove={onApprove}
                onRejectClick={onRejectClick}
                onDetailsClick={onDetailsClick}
                onDeleteClick={onDeleteClick}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-6 bg-gray-50/50 dark:bg-gray-800/10 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-right">
            {t("employee.permissions.showing", {
              from: (pagination.page - 1) * pagination.limit + 1,
              to: Math.min(pagination.page * pagination.limit, pagination.total),
              total: pagination.total,
            })}
          </p>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-white dark:bg-gray-900 h-8 sm:h-9 px-2.5 sm:px-4 rounded-lg text-xs sm:text-sm"
              disabled={pagination.page === 1}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
            >
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1" />
              {t("employee.permissions.previous")}
            </Button>

            {/* Mobile page count */}
            <span className="sm:hidden text-xs text-gray-600 dark:text-gray-400 font-medium px-2 font-mono tabular-nums">
              {pagination.page} / {pagination.totalPages}
            </span>

            {/* Desktop page buttons */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === pagination.page ? "default" : "ghost"}
                  size="sm"
                  className="h-9 w-9 p-0 font-mono tabular-nums"
                  onClick={() => setPagination((prev) => ({ ...prev, page: p }))}
                >
                  {p}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="bg-white dark:bg-gray-900 h-8 sm:h-9 px-2.5 sm:px-4 rounded-lg text-xs sm:text-sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
            >
              {t("employee.permissions.next")}
              <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
