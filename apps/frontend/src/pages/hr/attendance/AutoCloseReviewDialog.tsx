import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AttendanceRecord, AutoCloseReviewStatus } from "./types";
import { formatAttendanceDate, getAutoCloseReasonLabel } from "./helpers";

interface AutoCloseReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAutoCloseRecord: AttendanceRecord | null;
  attendanceTimezone: string;
  autoCloseReviewForm: {
    reviewStatus: AutoCloseReviewStatus;
    reviewNotes: string;
  };
  setAutoCloseReviewForm: React.Dispatch<
    React.SetStateAction<{
      reviewStatus: AutoCloseReviewStatus;
      reviewNotes: string;
    }>
  >;
  onSubmitReview: () => void;
  onOpenEdit: (record: AttendanceRecord) => void;
}

export const AutoCloseReviewDialog: React.FC<AutoCloseReviewDialogProps> = ({
  open,
  onOpenChange,
  selectedAutoCloseRecord,
  attendanceTimezone,
  autoCloseReviewForm,
  setAutoCloseReviewForm,
  onSubmitReview,
  onOpenEdit,
}) => {
  const formatAttendanceTime = (dateValue: string | null) => {
    if (!dateValue) return "-";

    return new Date(dateValue).toLocaleTimeString("ar-EG", {
      timeZone: attendanceTimezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-right">مراجعة الإغلاق التلقائي</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2" dir="rtl">
          {selectedAutoCloseRecord && (
            <div className="rounded-xl border border-amber-100 bg-amber-50/60 dark:bg-amber-950/20 dark:border-amber-900/30 p-4 space-y-2">
              <div className="font-bold text-gray-900 dark:text-white">
                {selectedAutoCloseRecord.employee?.firstName}{" "}
                {selectedAutoCloseRecord.employee?.lastName}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                تاريخ السجل:{" "}
                <span className="font-mono tabular-nums">
                  {formatAttendanceDate(
                    selectedAutoCloseRecord.date,
                    { year: "numeric", month: "long", day: "numeric" },
                    "-",
                    attendanceTimezone,
                  )}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                وقت الإغلاق المعتمد:{" "}
                <span className="font-mono tabular-nums">
                  {formatAttendanceTime(
                    selectedAutoCloseRecord.autoCloseAudit?.scheduledCheckOut ||
                      null,
                  )}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                السبب:{" "}
                {getAutoCloseReasonLabel(
                  selectedAutoCloseRecord.autoCloseAudit?.autoCloseReason,
                )}
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label>حالة المراجعة</Label>
            <Select
              value={autoCloseReviewForm.reviewStatus}
              onValueChange={(value) =>
                setAutoCloseReviewForm((prev) => ({
                  ...prev,
                  reviewStatus: (value as AutoCloseReviewStatus) || "REVIEWED",
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر حالة المراجعة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">بانتظار المراجعة</SelectItem>
                <SelectItem value="REVIEWED">تمت المراجعة</SelectItem>
                <SelectItem value="ADJUSTED">تم التعديل</SelectItem>
                <SelectItem value="DISMISSED">اعتماد كما هو</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>ملاحظات المراجعة</Label>
            <Textarea
              value={autoCloseReviewForm.reviewNotes}
              onChange={(e) =>
                setAutoCloseReviewForm((prev) => ({
                  ...prev,
                  reviewNotes: e.target.value,
                }))
              }
              placeholder="اكتب ملخص قرار المراجعة أو أي ملاحظات للإدارة/الموظف..."
              className="min-h-[120px]"
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          {selectedAutoCloseRecord && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                onOpenEdit(selectedAutoCloseRecord);
              }}
            >
              فتح السجل للتعديل
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button
            onClick={onSubmitReview}
            className="bg-amber-600 hover:bg-amber-700"
          >
            حفظ المراجعة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
