import React from "react";
import { Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AttendanceNotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notes: string;
}

export const AttendanceNotesDialog: React.FC<AttendanceNotesDialogProps> = ({
  open,
  onOpenChange,
  notes,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-500" />
            ملاحظات الحضور
          </DialogTitle>
        </DialogHeader>
        <div className="py-6 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 min-h-[100px] flex items-center justify-center text-center">
          <p className="text-gray-700 dark:text-gray-300 font-medium whitespace-pre-wrap">
            {notes}
          </p>
        </div>
        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
