import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { LeaveRequest, leaveTypeConfig, statusConfig } from "./types";

interface LeaveDetailsDialogProps {
  t: (key: string) => string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRequest: LeaveRequest | null;
}

export const LeaveDetailsDialog: React.FC<LeaveDetailsDialogProps> = ({
  t,
  open,
  onOpenChange,
  selectedRequest,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("employee.leaves.detailsTitle")}</DialogTitle>
        </DialogHeader>

        {selectedRequest && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={selectedRequest.employee?.avatar} />
                <AvatarFallback>
                  {selectedRequest.employee?.firstName?.[0]}
                  {selectedRequest.employee?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">
                  {selectedRequest.employee?.firstName} {selectedRequest.employee?.lastName}
                </h3>
                <p className="text-gray-500">
                  {selectedRequest.employee?.department?.name}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-500">{t("employee.leaves.leaveType")}</Label>
                <p className="font-medium">
                  {t(leaveTypeConfig[selectedRequest.type]?.labelKey)}
                </p>
              </div>
              <div>
                <Label className="text-gray-500">{t("employee.leaves.payStatusLabel")}</Label>
                <Badge
                  className={
                    selectedRequest.type !== "UNPAID"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }
                >
                  {selectedRequest.type !== "UNPAID"
                    ? t("employee.leaves.paid")
                    : t("employee.leaves.unpaid")}
                </Badge>
              </div>
              <div>
                <Label className="text-gray-500">{t("employee.leaves.status")}</Label>
                <Badge
                  className={statusConfig[selectedRequest.status]?.color || ""}
                >
                  {t(statusConfig[selectedRequest.status]?.labelKey) ||
                    selectedRequest.status}
                </Badge>
              </div>
              <div>
                <Label className="text-gray-500">{t("employee.leaves.from")}</Label>
                <p className="font-medium font-mono tabular-nums">
                  {new Date(selectedRequest.startDate).toLocaleDateString("ar-EG")}
                </p>
              </div>
              <div>
                <Label className="text-gray-500">{t("employee.leaves.to")}</Label>
                <p className="font-medium font-mono tabular-nums">
                  {new Date(selectedRequest.endDate).toLocaleDateString("ar-EG")}
                </p>
              </div>
              <div>
                <Label className="text-gray-500">{t("employee.leaves.duration")}</Label>
                <p className="font-medium font-mono tabular-nums">
                  {selectedRequest.totalDays} {t("employee.leaves.day")}
                </p>
              </div>
              <div>
                <Label className="text-gray-500">{t("employee.leaves.requestDate")}</Label>
                <p className="font-medium font-mono tabular-nums">
                  {new Date(selectedRequest.createdAt).toLocaleDateString("ar-EG")}
                </p>
              </div>
            </div>

            {selectedRequest.reason && (
              <div>
                <Label className="text-gray-500">{t("employee.leaves.reasonLabel")}</Label>
                <p className="mt-1">{selectedRequest.reason}</p>
              </div>
            )}

            {selectedRequest.rejectionReason && (
              <div className="p-3 bg-red-50 rounded-lg">
                <Label className="text-red-600">{t("employee.leaves.rejectReasonLabel")}</Label>
                <p className="mt-1 text-red-700">
                  {selectedRequest.rejectionReason}
                </p>
              </div>
            )}

            {selectedRequest.approver && (
              <div>
                <Label className="text-gray-500">{t("employee.leaves.reviewedBy")}</Label>
                <p className="font-medium">
                  {selectedRequest.approver.firstName} {selectedRequest.approver.lastName}
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t("employee.leaves.closeButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
