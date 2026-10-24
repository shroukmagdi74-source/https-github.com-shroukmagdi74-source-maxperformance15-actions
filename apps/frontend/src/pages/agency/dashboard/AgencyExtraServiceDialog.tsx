import React from "react";
import { Plus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { AgencyClient, EXTRA_SERVICE_PRESETS } from "./types";

interface AgencyExtraServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedClient: AgencyClient | null;
  extraForm: {
    month: string;
    category: string;
    title: string;
    amount: number;
    date: string;
    notes: string;
  };
  onFormChange: (data: any) => void;
  onSelectPresetCategory: (category: string) => void;
  onSave: () => void;
  currency: string;
}

export const AgencyExtraServiceDialog: React.FC<AgencyExtraServiceDialogProps> = ({
  open,
  onOpenChange,
  selectedClient,
  extraForm,
  onFormChange,
  onSelectPresetCategory,
  onSave,
  currency,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md max-h-[90dvh] flex flex-col p-0 overflow-hidden"
        dir="rtl"
      >
        <DialogHeader className="p-4 sm:p-5 border-b border-border/60 bg-muted/20 shrink-0">
          <DialogTitle className="font-black text-base sm:text-lg flex items-center gap-2 text-foreground">
            <Plus className="size-5 text-emerald-600" />
            إضافة بند إضافي / نفقة - {selectedClient?.name}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto p-4 sm:p-5 flex-1 space-y-3.5 text-xs">
          <div>
            <Label className="text-xs font-bold">نوع الخدمة الإضافية (نموذج مسبق)</Label>
            <select
              className="w-full mt-1 h-10 sm:h-9 px-3 rounded-xl border border-border bg-background text-base sm:text-xs font-bold"
              value={extraForm.category}
              onChange={(e) => onSelectPresetCategory(e.target.value)}
            >
              {EXTRA_SERVICE_PRESETS.map((p) => (
                <option key={p.category} value={p.category}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-xs font-bold">وصف أو عنوان البند في الفاتورة *</Label>
            <Input
              className="mt-1 h-10 sm:h-9 text-base sm:text-xs rounded-xl"
              value={extraForm.title}
              onChange={(e) => onFormChange({ ...extraForm, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-bold">المبلغ المستحق ({currency}) *</Label>
              <Input
                className="mt-1 h-10 sm:h-9 text-base sm:text-xs rounded-xl font-mono tabular-nums"
                type="number"
                value={extraForm.amount || ""}
                onChange={(e) =>
                  onFormChange({ ...extraForm, amount: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label className="text-xs font-bold">الشهر المرتبط به</Label>
              <Input
                type="month"
                className="mt-1 h-10 sm:h-9 text-base sm:text-xs font-bold rounded-xl"
                value={extraForm.month}
                onChange={(e) => onFormChange({ ...extraForm, month: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-bold">ملاحظات داخلية (اختياري)</Label>
            <Input
              className="mt-1 h-10 sm:h-9 text-base sm:text-xs rounded-xl"
              placeholder="تفاصيل التكلفة، اسم المصمم أو جهة التنفيذ..."
              value={extraForm.notes}
              onChange={(e) => onFormChange({ ...extraForm, notes: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter className="p-3.5 sm:p-4 border-t border-border/60 bg-background/95 backdrop-blur-xs shrink-0 flex flex-col-reverse sm:flex-row gap-2 sm:justify-start">
          <Button
            type="button"
            onClick={onSave}
            className="font-bold h-11 sm:h-9 text-xs w-full sm:w-auto"
          >
            إضافة البند للفاتورة
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11 sm:h-9 text-xs w-full sm:w-auto"
          >
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
