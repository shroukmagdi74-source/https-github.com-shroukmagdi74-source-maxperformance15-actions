import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { calculateWorkHours } from "../../../utils/shiftHelpers";
import { ShiftEditFormData } from "./types";

interface ShiftEditAndDeleteDialogsProps {
  deleteDialogOpen: boolean;
  onDeleteDialogOpenChange: (open: boolean) => void;
  onConfirmRemoveAssignment: () => void;
  editDialogOpen: boolean;
  onEditDialogOpenChange: (open: boolean) => void;
  formData: ShiftEditFormData;
  onFormDataChange: (data: ShiftEditFormData) => void;
  formErrors: Record<string, string>;
  onUpdateShift: () => void;
}

export const ShiftEditAndDeleteDialogs: React.FC<
  ShiftEditAndDeleteDialogsProps
> = ({
  deleteDialogOpen,
  onDeleteDialogOpenChange,
  onConfirmRemoveAssignment,
  editDialogOpen,
  onEditDialogOpenChange,
  formData,
  onFormDataChange,
  formErrors,
  onUpdateShift,
}) => {
  return (
    <>
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={onDeleteDialogOpenChange}
      >
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم إلغاء تعيين هذا الموظف من المناوبة. يمكنك إعادة تعيينه
              لاحقاً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmRemoveAssignment}
              className="bg-red-500 hover:bg-red-600"
            >
              إلغاء التعيين
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={editDialogOpen} onOpenChange={onEditDialogOpenChange}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل المناوبة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>اسم المناوبة</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  onFormDataChange({ ...formData, name: e.target.value })
                }
                placeholder="مثال: صباحي A، مسائي، ليل"
                className={formErrors["name"] ? "border-red-500" : ""}
              />
              {formErrors["name"] && (
                <p className="text-sm text-red-500 mt-1">
                  {formErrors["name"]}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>وقت البدء</Label>
                <Input
                  type="time"
                  className="font-mono tabular-nums"
                  value={formData.startTime}
                  onChange={(e) =>
                    onFormDataChange({ ...formData, startTime: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>وقت الانتهاء</Label>
                <Input
                  type="time"
                  className="font-mono tabular-nums"
                  value={formData.endTime}
                  onChange={(e) =>
                    onFormDataChange({ ...formData, endTime: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label>مدة الراحة (دقائق)</Label>
                <Input
                  type="number"
                  className="font-mono tabular-nums"
                  value={formData.breakDuration}
                  onChange={(e) =>
                    onFormDataChange({
                      ...formData,
                      breakDuration: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="flex-1">
                <Label>لون التمييز</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      onFormDataChange({ ...formData, color: e.target.value })
                    }
                    className="w-12 h-10 p-1"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {formData.color}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm text-blue-800 dark:text-blue-200 flex justify-between items-center">
              <span>ساعات العمل الصافية:</span>
              <span className="font-bold text-lg">
                <span className="font-mono tabular-nums">
                  {calculateWorkHours(
                    formData.startTime,
                    formData.endTime,
                    formData.breakDuration,
                  )}
                </span>{" "}
                ساعة
              </span>
            </div>

            {formErrors["time"] && (
              <p className="text-sm text-red-500">{formErrors["time"]}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onEditDialogOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button onClick={onUpdateShift}>تحديث</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
