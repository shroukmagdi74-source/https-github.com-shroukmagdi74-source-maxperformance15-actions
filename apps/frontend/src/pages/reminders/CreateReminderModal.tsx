import React from "react";
import { ReminderFormState } from "./types";

interface CreateReminderModalProps {
  open: boolean;
  form: ReminderFormState;
  onFormChange: React.Dispatch<React.SetStateAction<ReminderFormState>>;
  onSave: () => void;
  onClose: () => void;
}

export const CreateReminderModal: React.FC<CreateReminderModalProps> = ({
  open,
  form,
  onFormChange,
  onSave,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="rounded-xl border border-border/80 bg-card p-5 shadow-xl max-w-md w-full animate-in fade-in zoom-in-95">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          إنشاء تذكير جديد
        </h3>
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-foreground mb-1">
              العنوان
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                onFormChange((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full border border-border rounded-lg px-3 py-1.5 bg-background text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
              placeholder="عنوان التذكير"
            />
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">
              الوصف
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                onFormChange((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={2}
              className="w-full border border-border rounded-lg px-3 py-1.5 bg-background text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
              placeholder="وصف التذكير"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-foreground mb-1">
                النوع
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  onFormChange((prev) => ({ ...prev, type: e.target.value }))
                }
                className="w-full border border-border rounded-lg px-3 py-1.5 bg-background text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
              >
                <option value="FOLLOW_UP">متابعة عميل</option>
                <option value="QUOTE_FOLLOW_UP">متابعة عرض سعر</option>
                <option value="PAYMENT_REMINDER">تذكير دفع</option>
                <option value="TASK_REMINDER">تذكير مهمة</option>
                <option value="APPOINTMENT_REMINDER">تذكير موعد</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-foreground mb-1">
                الأولوية
              </label>
              <select
                value={form.priority}
                onChange={(e) =>
                  onFormChange((prev) => ({
                    ...prev,
                    priority: e.target.value,
                  }))
                }
                className="w-full border border-border rounded-lg px-3 py-1.5 bg-background text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
              >
                <option value="low">منخفضة</option>
                <option value="medium">متوسطة</option>
                <option value="high">عالية</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">
              وقت التذكير
            </label>
            <input
              type="datetime-local"
              value={form.scheduledTime}
              onChange={(e) =>
                onFormChange((prev) => ({
                  ...prev,
                  scheduledTime: e.target.value,
                }))
              }
              className="w-full border border-border rounded-lg px-3 py-1.5 bg-background text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 border border-border rounded-lg text-xs font-mono text-muted-foreground hover:bg-muted"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!form.title.trim() || !form.scheduledTime}
            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-mono font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            إنشاء
          </button>
        </div>
      </div>
    </div>
  );
};
