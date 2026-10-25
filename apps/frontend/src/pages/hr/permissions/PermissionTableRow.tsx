import React from "react";
import { Check, X, Eye, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TableRow, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PermissionRequest } from "./types";
import { permissionTypeConfig, statusConfig } from "./helpers";

interface PermissionTableRowProps {
  request: PermissionRequest;
  isMyPermissions: boolean;
  onApprove: (id: string) => void;
  onRejectClick: (request: PermissionRequest) => void;
  onDetailsClick: (request: PermissionRequest) => void;
  onDeleteClick: (request: PermissionRequest) => void;
}

export const PermissionTableRow: React.FC<PermissionTableRowProps> = ({
  request,
  isMyPermissions,
  onApprove,
  onRejectClick,
  onDetailsClick,
  onDeleteClick,
}) => {
  const { t } = useTranslation();
  const typeConfig =
    permissionTypeConfig[request.type] || permissionTypeConfig["DEDUCTIBLE"];
  const TypeIcon = typeConfig.icon;
  const status = statusConfig[request.status];

  return (
    <TableRow
      key={request.id}
      className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors border-gray-100 dark:border-gray-800"
    >
      {!isMyPermissions && (
        <TableCell className="py-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-white dark:border-gray-800 ring-1 ring-gray-100 dark:ring-gray-800 shadow-sm">
              <AvatarImage src={request.employee?.avatar} />
              <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">
                {request.employee?.firstName?.[0]}
                {request.employee?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-gray-900 dark:text-white leading-tight">
                {request.employee?.firstName} {request.employee?.lastName}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {request.employee?.department?.name ||
                  t("employee.permissions.noDepartment")}{" "}
                • {request.employee?.employeeNumber}
              </p>
            </div>
          </div>
        </TableCell>
      )}
      <TableCell>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg w-fit text-xs font-semibold border ${typeConfig.color}`}
        >
          <TypeIcon className="h-4 w-4" />
          {t(`employee.permissions.${typeConfig.labelKey}`)}
        </div>
      </TableCell>
      <TableCell className="font-medium font-mono tabular-nums">
        {new Date(request.date).toLocaleDateString("ar-EG", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <span className="font-bold font-mono tabular-nums text-gray-900 dark:text-white">
            {request.startTime}
          </span>
          <span className="text-xs">{t("employee.permissions.timeDelimiter")}</span>
          <span className="font-bold font-mono tabular-nums text-gray-900 dark:text-white">
            {request.endTime}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded font-bold font-mono tabular-nums">
            {request.totalHours}
          </span>
          <span className="text-xs text-gray-500">{t("employee.permissions.hour")}</span>
        </div>
      </TableCell>
      <TableCell>
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full w-fit text-[10px] uppercase tracking-wider font-bold ${status.color}`}
        >
          <status.icon className="h-3.5 w-3.5" />
          {t(`employee.permissions.${status.labelKey}`)}
        </div>
      </TableCell>
      <TableCell className="pl-6">
        <div className="flex items-center justify-start gap-2">
          {request.status === "PENDING" && !isMyPermissions && (
            <>
              <Button
                size="sm"
                className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700 rounded-lg shadow-sm"
                onClick={() => onApprove(request.id)}
                title={t("employee.permissions.approve")}
              >
                <Check className="h-4 w-4 text-white" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="h-8 w-8 p-0 rounded-lg shadow-sm"
                onClick={() => onRejectClick(request)}
                title={t("employee.permissions.reject")}
              >
                <X className="h-4 w-4 text-white" />
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-lg"
            onClick={() => onDetailsClick(request)}
            title={t("employee.permissions.detailsButton", "تفاصيل")}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {(!isMyPermissions || request.status === "PENDING") && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg"
              onClick={() => onDeleteClick(request)}
              title={t("employee.permissions.delete")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};
