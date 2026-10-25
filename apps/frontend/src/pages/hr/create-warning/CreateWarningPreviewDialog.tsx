import React from "react";
import { UseFormWatch } from "react-hook-form";
import {
  AlertCircle,
  Calendar,
  FileText,
  Gavel,
  ShieldAlert,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { WarningFormData } from "./types";

interface CreateWarningPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedEmployee: any;
  watch: UseFormWatch<WarningFormData>;
}

export const CreateWarningPreviewDialog: React.FC<
  CreateWarningPreviewDialogProps
> = ({ open, onOpenChange, selectedEmployee, watch }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl bg-white dark:bg-gray-950 border-none shadow-2xl rounded-[2rem] p-0 overflow-hidden"
        dir="rtl"
      >
        <div className="relative h-32 bg-gradient-to-r from-red-600 to-rose-700 flex items-center px-8 overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

          <div className="flex items-center gap-5 relative z-10 w-full">
            <div className="p-4 bg-white/20 rounded-[1.5rem] backdrop-blur-md shadow-inner ring-1 ring-white/30">
              <ShieldAlert className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-1 flex-1 min-w-0">
              <DialogTitle className="text-2xl font-black text-white break-words pr-2">
                {watch("title") || "عنوان الإنذار"}
              </DialogTitle>
              <div className="flex items-center gap-2 text-white/70 text-xs font-bold uppercase tracking-widest">
                <span className="bg-white/10 px-2 py-0.5 rounded-md backdrop-blur-sm">
                  مسودة معاينة
                </span>
                <span className="h-1 w-1 rounded-full bg-white/30" />
                <span>{watch("type")}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar relative">
          {selectedEmployee && (
            <div className="flex items-center gap-4 p-5 bg-muted/30 rounded-[1.5rem] border border-muted ring-4 ring-muted/20">
              <Avatar className="h-12 w-12 border-2 border-white dark:border-gray-800 shadow-md">
                <AvatarFallback className="bg-primary text-white font-black">
                  {selectedEmployee.firstName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-black text-gray-900 dark:text-white leading-none mb-1">
                  {selectedEmployee.firstName} {selectedEmployee.lastName}
                </p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                  {selectedEmployee.position?.title || "موظف"} •{" "}
                  <span className="font-mono tabular-nums">
                    {selectedEmployee.employeeNumber}
                  </span>
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
              <FileText className="h-3.5 w-3.5" />
              وصف المخالفة المقترح
            </h4>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-500/10 to-transparent rounded-3xl blur opacity-25" />
              <div className="relative bg-white dark:bg-gray-900/50 p-7 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 shadow-sm leading-relaxed whitespace-pre-wrap break-words text-gray-700 dark:text-gray-200 text-lg font-medium">
                {watch("description") || "سيتم عرض وصف المخالفة هنا..."}
              </div>
            </div>
          </div>

          {watch("actionTaken") && (
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-2 px-1">
                <Gavel className="h-3.5 w-3.5" />
                الإجراء الإداري المتخذ
              </h4>
              <div className="bg-amber-500/5 dark:bg-amber-500/10 p-6 rounded-[1.5rem] border border-amber-500/10 shadow-sm border-dashed">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words text-md leading-relaxed">
                  {watch("actionTaken")}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-dashed border-muted font-bold text-xs text-muted-foreground">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/40 rounded-full">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span className="font-mono tabular-nums">
                تاريخ الواقعة: {watch("incidentDate")}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 text-primary rounded-full ring-1 ring-primary/10">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>درجة الشدة: {watch("severity")}</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-muted/20 border-t border-muted/30 flex justify-end">
          <Button
            onClick={() => onOpenChange(false)}
            className="rounded-xl px-10 h-12 font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
          >
            فهمت، العودة للتعديل
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
