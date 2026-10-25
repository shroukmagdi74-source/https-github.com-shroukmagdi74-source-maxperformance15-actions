import React from "react";
import {
  Calendar,
  Timer,
  ArrowRight,
  FileText,
  Check,
  History,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PermissionRequest } from "./types";
import { permissionTypeConfig, statusConfig } from "./helpers";

interface PermissionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRequest: PermissionRequest | null;
  isMyPermissions: boolean;
  onApprove: (id: string) => void;
  onRejectClick: (request: PermissionRequest) => void;
}

export const PermissionDetailsDialog: React.FC<PermissionDetailsDialogProps> = ({
  open,
  onOpenChange,
  selectedRequest,
  isMyPermissions,
  onApprove,
  onRejectClick,
}) => {
  const { t } = useTranslation();

  if (!selectedRequest) return null;

  const typeConfig =
    permissionTypeConfig[selectedRequest.type] || permissionTypeConfig["DEDUCTIBLE"];
  const status = statusConfig[selectedRequest.status];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] flex flex-col bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 p-0 overflow-hidden rounded-2xl shadow-2xl">
        <div
          className={`p-4 sm:p-6 text-white text-right relative overflow-hidden shrink-0 ${
            selectedRequest.status === "APPROVED"
              ? "bg-green-600"
              : selectedRequest.status === "REJECTED"
                ? "bg-red-600"
                : "bg-amber-600"
          }`}
        >
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-none text-xs">
                {t(`employee.permissions.${status.labelKey}`)}
              </Badge>
              <DialogTitle className="text-xl sm:text-2xl font-bold flex items-center justify-end gap-2">
                {t("employee.permissions.detailsTitle")}
              </DialogTitle>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 justify-end">
              <div className="text-right">
                <p className="font-bold text-base sm:text-lg">
                  {selectedRequest.employee?.firstName}{" "}
                  {selectedRequest.employee?.lastName}
                </p>
                <p className="text-blue-100 text-xs sm:text-sm">
                  {selectedRequest.employee?.employeeNumber} •{" "}
                  {selectedRequest.employee?.department?.name}
                </p>
              </div>
              <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 sm:border-4 border-white/20 shadow-xl shrink-0">
                <AvatarImage src={selectedRequest.employee?.avatar} />
                <AvatarFallback className="bg-white/10 text-white text-base sm:text-xl">
                  {selectedRequest.employee?.firstName?.[0]}
                  {selectedRequest.employee?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <div className="absolute -left-10 -bottom-10 h-32 w-32 sm:h-40 sm:w-40 text-white opacity-10 rotate-12">
            {React.createElement(typeConfig?.icon || History, {
              className: "h-full w-full",
            })}
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1" dir="rtl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 rounded-xl border border-gray-100 dark:border-gray-800">
              <p className="text-[11px] sm:text-xs text-gray-500 mb-1">
                {t("employee.permissions.requestDate")}
              </p>
              <p className="font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500 shrink-0" />
                <span className="truncate font-mono tabular-nums">
                  {new Date(selectedRequest.date).toLocaleDateString("ar-EG", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 rounded-xl border border-gray-100 dark:border-gray-800">
              <p className="text-[11px] sm:text-xs text-gray-500 mb-1">
                {t("employee.permissions.permissionType")}
              </p>
              <p className="font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                {React.createElement(typeConfig?.icon || History, {
                  className: "h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500 shrink-0",
                })}
                <span className="truncate">
                  {t(`employee.permissions.${typeConfig?.labelKey}`)}
                </span>
              </p>
            </div>
          </div>

          <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3.5 sm:p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <Timer className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <p className="font-bold text-xs sm:text-sm text-blue-900 dark:text-blue-100">
                {t("employee.permissions.permissionPeriod")}
              </p>
            </div>
            <div className="flex items-center justify-center gap-4 sm:gap-8 py-1 sm:py-2">
              <div className="text-center">
                <p className="text-[11px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">
                  {t("employee.permissions.exitTimeLabel")}
                </p>
                <p className="text-xl sm:text-2xl font-black text-blue-600 font-mono tabular-nums">
                  {selectedRequest.startTime}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-300 rotate-180 shrink-0" />
              <div className="text-center">
                <p className="text-[11px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">
                  {t("employee.permissions.returnTimeLabel")}
                </p>
                <p className="text-xl sm:text-2xl font-black text-blue-600 font-mono tabular-nums">
                  {selectedRequest.endTime}
                </p>
              </div>
            </div>
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-blue-100 dark:border-blue-900/30 flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium text-right">
                {t("employee.permissions.totalHoursLabel")}
              </span>
              <span className="bg-blue-600 text-white px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold font-mono tabular-nums">
                {selectedRequest.totalHours} {t("employee.permissions.hour")}
              </span>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="text-right">
              <Label className="text-gray-500 text-[11px] sm:text-xs mb-1.5 sm:mb-2 block">
                {t("employee.permissions.reasonDetail")}
              </Label>
              <div className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 rounded-xl border border-gray-100 dark:border-gray-800 text-xs sm:text-sm font-medium leading-relaxed">
                {selectedRequest.reason}
              </div>
            </div>

            {selectedRequest.attachments && (
              <div className="text-right">
                <Label className="text-gray-500 text-[11px] sm:text-xs mb-1.5 sm:mb-2 block">
                  {t("employee.permissions.attachments")}
                </Label>
                <a
                  href={selectedRequest.attachments}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-bold bg-blue-50 dark:bg-blue-900/20 p-2.5 sm:p-3 rounded-xl border border-blue-100 dark:border-blue-800 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  {t("employee.permissions.viewFile")}
                </a>
              </div>
            )}

            {selectedRequest.status === "REJECTED" &&
              selectedRequest.rejectionReason && (
                <div className="text-right">
                  <Label className="text-red-500 text-[11px] sm:text-xs mb-1.5 sm:mb-2 block">
                    {t("employee.permissions.rejectReason")}
                  </Label>
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 sm:p-4 rounded-xl border border-red-100 dark:border-red-800 text-red-700 dark:text-red-400 text-xs sm:text-sm font-bold">
                    {selectedRequest.rejectionReason}
                  </div>
                </div>
              )}

            {selectedRequest.approvedBy && (
              <div className="flex items-center justify-end gap-1.5 text-xs text-gray-500 mt-3 sm:mt-4">
                <span>
                  {t("employee.permissions.reviewedBy", {
                    name: `${selectedRequest.approvedBy.firstName} ${selectedRequest.approvedBy.lastName}`,
                  })}
                </span>
                <Check className="h-3 w-3 text-green-500" />
              </div>
            )}
          </div>
        </div>

        <div className="p-3.5 sm:p-6 bg-gray-50 dark:bg-gray-900/50 flex flex-wrap sm:flex-nowrap gap-2 sm:gap-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
          <Button
            variant="outline"
            className="flex-1 h-10 sm:h-11 rounded-xl text-xs sm:text-sm"
            onClick={() => onOpenChange(false)}
          >
            {t("employee.permissions.closeButton")}
          </Button>
          {selectedRequest.status === "PENDING" && !isMyPermissions && (
            <div className="flex gap-2 flex-1 sm:flex-[2]">
              <Button
                variant="destructive"
                className="flex-1 h-10 sm:h-11 rounded-xl text-xs sm:text-sm"
                onClick={() => {
                  onOpenChange(false);
                  onRejectClick(selectedRequest);
                }}
              >
                {t("employee.permissions.rejectButton")}
              </Button>
              <Button
                className="flex-1 h-10 sm:h-11 rounded-xl bg-green-600 hover:bg-green-700 font-bold text-xs sm:text-sm"
                onClick={() => {
                  onApprove(selectedRequest.id);
                  onOpenChange(false);
                }}
              >
                {t("employee.permissions.approveButton")}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
