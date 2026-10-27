import React from "react";
import { X } from "lucide-react";
import { Button } from "../../../components/ui/button";

interface DevGoalCheckInModalProps {
  show: boolean;
  checkInForm: {
    content: string;
    confidence: string;
    progressValue: number;
    blockers: string;
    keyResultId: string;
  };
  setCheckInForm: React.Dispatch<
    React.SetStateAction<{
      content: string;
      confidence: string;
      progressValue: number;
      blockers: string;
      keyResultId: string;
    }>
  >;
  onClose: () => void;
  onSave: () => void;
}

export const DevGoalCheckInModal: React.FC<DevGoalCheckInModalProps> = ({
  show,
  checkInForm,
  setCheckInForm,
  onClose,
  onSave,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl max-w-lg w-full shadow-lg overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">
            إضافة مراجعة (Check-in)
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
            <label className="block text-muted-foreground mb-1">
              تفاصيل المراجعة
            </label>
            <textarea
              value={checkInForm.content}
              onChange={(e) =>
                setCheckInForm({ ...checkInForm, content: e.target.value })
              }
              className="w-full h-20 p-2 border border-border rounded-md bg-background text-foreground outline-none focus:ring-1 focus:ring-primary"
              placeholder="ما الذي تم إنجازه؟"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-muted-foreground mb-1">
                مستوى الثقة
              </label>
              <select
                value={checkInForm.confidence}
                onChange={(e) =>
                  setCheckInForm({
                    ...checkInForm,
                    confidence: e.target.value,
                  })
                }
                className="w-full h-8 px-2 border border-border rounded-md bg-background text-foreground outline-none"
              >
                <option value="ON_TRACK">على المسار</option>
                <option value="AT_RISK">في خطر</option>
                <option value="OFF_TRACK">خارج المسار</option>
              </select>
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">
                المعوقات (إن وجدت)
              </label>
              <input
                value={checkInForm.blockers}
                onChange={(e) =>
                  setCheckInForm({
                    ...checkInForm,
                    blockers: e.target.value,
                  })
                }
                className="w-full h-8 px-2.5 border border-border rounded-md bg-background text-foreground outline-none"
                placeholder="أي عوائق تعطل الإنجاز..."
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
            حفظ المراجعة
          </Button>
        </div>
      </div>
    </div>
  );
};
