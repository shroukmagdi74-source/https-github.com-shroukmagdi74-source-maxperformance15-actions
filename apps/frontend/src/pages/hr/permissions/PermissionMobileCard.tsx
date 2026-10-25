import React from "react";
import { Clock, Calendar, Check, X, Eye, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PermissionRequest } from "./types";
import { permissionTypeConfig, statusConfig } from "./helpers";

interface PermissionMobileCardProps {
  request: PermissionRequest;
  isMyPermissions: boolean;
  onApprove: (id: string) => void;
  onRejectClick: (request: PermissionRequest) => void;
  onDetailsClick: (request: PermissionRequest) => void;
  onDeleteClick: (request: PermissionRequest) => void;
}

export const PermissionMobileCard: React.FC<PermissionMobileCardProps> = ({
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
    <div className="p-3.5 space-y-2.5 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
      {/* Top row: Employee (if admin) or Type badge + Status badge */}
      <div className="flex items-start justify-between gap-2">
        {!isMyPermissions && (
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar className="h-9 w-9 border border-gray-100 dark:border-gray-800 shrink-0">
              <AvatarImage src={request.employee?.avatar} />
              <AvatarFallback className="bg-blue-50 text-blue-600 font-bold text-xs">
                {request.employee?.firstName?.[0]}
                {request.employee?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                {request.employee?.firstName} {request.employee?.lastName}
              </p>
              <p className="text-[11px] text-gray-500 truncate">
                {request.employee?.department?.name ||
                  t("employee.permissions.noDepartment")}{" "}
                • {request.employee?.employeeNumber}
              </p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-1.5 shrink-0 ms-auto">
          <span
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${status.color}`}
          >
            <status.icon className="h-3 w-3" />
            {t(`employee.permissions.${status.labelKey}`)}
          </span>
        </div>
      </div>

      {/* Middle row: Type, Urgency, Date */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${typeConfig.color}`}
        >
          <TypeIcon className="h-3.5 w-3.5" />
          {t(`employee.permissions.${typeConfig.labelKey}`)}
        </span>
        {request.isUrgent && (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {t("employee.permissions.urgent")}
          </span>
        )}
        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 ms-auto text-xs font-medium">
          <Calendar className="h-3.5 w-3.5 text-gray-400" />
          <span className="font-mono tabular-nums">
            {new Date(request.date).toLocaleDateString("ar-EG", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Time & Duration Box */}
      <div className="flex items-center justify-between text-xs bg-gray-50/80 dark:bg-gray-800/40 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
          <Clock className="h-3.5 w-3.5 text-blue-500 shrink-0" />
          <span className="font-bold font-mono tabular-nums">{request.startTime}</span>
          <span className="text-[10px] text-gray-400">{t("employee.permissions.timeDelimiter")}</span>
          <span className="font-bold font-mono tabular-nums">{request.endTime}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded font-bold font-mono tabular-nums">
            {request.totalHours}
          </span>
          <span className="text-[11px] text-gray-500">{t("employee.permissions.hour")}</span>
        </div>
      </div>

      {/* Reason snippet */}
      {request.reason && (
        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 bg-white/50 dark:bg-gray-900/50 px-2 py-1 rounded">
          {request.reason}
        </p>
      )}

      {/* Footer actions */}
      <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-gray-100/60 dark:border-gray-800/60">
        {request.status === "PENDING" && !isMyPermissions && (
          <>
            <Button
              size="sm"
              className="h-8 px-2.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-1"
              onClick={() => onApprove(request.id)}
            >
              <Check className="h-3.5 w-3.5" />
              <span>{t("employee.permissions.approve")}</span>
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="h-8 px-2.5 text-xs rounded-lg flex items-center gap-1"
              onClick={() => onRejectClick(request)}
            >
              <X className="h-3.5 w-3.5" />
              <span>{t("employee.permissions.reject")}</span>
            </Button>
          </>
        )}
        <Button
          size="sm"
          variant="outline"
          className="h-8 px-2.5 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg flex items-center gap-1"
          onClick={() => onDetailsClick(request)}
        >
          <Eye className="h-3.5 w-3.5" />
          <span>{t("employee.permissions.detailsButton", "تفاصيل")}</span>
        </Button>
        {(!isMyPermissions || request.status === "PENDING") && (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg"
            onClick={() => onDeleteClick(request)}
            title={t("employee.permissions.delete")}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
};
