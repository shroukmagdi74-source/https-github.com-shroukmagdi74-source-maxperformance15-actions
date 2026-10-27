import React from "react";
import { X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { KeyResult } from "./types";

interface DevGoalKRModalProps {
  show: boolean;
  editingKR: KeyResult | null;
  krForm: {
    title: string;
    description: string;
    targetType: string;
    targetValue: number;
    currentValue: number;
    unit: string;
    weight: number;
  };
  setKrForm: React.Dispatch<
    React.SetStateAction<{
      title: string;
      description: string;
      targetType: string;
      targetValue: number;
      currentValue: number;
      unit: string;
      weight: number;
    }>
  >;
  onClose: () => void;
  onSave: () => void;
}

export const DevGoalKRModal: React.FC<DevGoalKRModalProps> = ({
  show,
  editingKR,
  krForm,
  setKrForm,
  onClose,
  onSave,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl max-w-lg w-full shadow-lg overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">
            {editingKR ? "تعديل النتيجة الرئيسية" : "نتيجة رئيسية جديدة"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground rounded cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="p-4 space-y-3 text-xs">
          <div>
            <label className="block text-muted-foreground mb-1">العنوان</label>
            <input
              value={krForm.title}
              onChange={(e) => setKrForm({ ...krForm, title: e.target.value })}
              className="w-full h-8 px-2.5 border border-border rounded-md bg-background text-foreground outline-none focus:ring-1 focus:ring-primary"
              placeholder="مثال: خفض زمن الاستجابة إلى 200ms"
            />
          </div>
          <div>
            <label className="block text-muted-foreground mb-1">الوصف</label>
            <textarea
              value={krForm.description}
              onChange={(e) =>
                setKrForm({ ...krForm, description: e.target.value })
              }
              className="w-full h-16 p-2 border border-border rounded-md bg-background text-foreground outline-none focus:ring-1 focus:ring-primary"
              placeholder="تفاصيل إضافية..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-muted-foreground mb-1">
                القيمة المستهدفة
              </label>
              <input
                type="number"
                value={krForm.targetValue}
                onChange={(e) =>
                  setKrForm({
                    ...krForm,
                    targetValue: Number(e.target.value),
                  })
                }
                className="w-full h-8 px-2.5 border border-border rounded-md bg-background text-foreground outline-none font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">الوحدة</label>
              <input
                value={krForm.unit}
                onChange={(e) => setKrForm({ ...krForm, unit: e.target.value })}
                className="w-full h-8 px-2.5 border border-border rounded-md bg-background text-foreground outline-none"
                placeholder="مثال: % أو تذكرة أو يوم"
              />
            </div>
          </div>
        </div>
        <div className="p-3 border-t border-border flex justify-end gap-2 bg-muted/20">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 text-xs cursor-pointer"
          >
            إلغاء
          </Button>
          <Button onClick={onSave} size="sm" className="h-8 text-xs cursor-pointer">
            حفظ
          </Button>
        </div>
      </div>
    </div>
  );
};
