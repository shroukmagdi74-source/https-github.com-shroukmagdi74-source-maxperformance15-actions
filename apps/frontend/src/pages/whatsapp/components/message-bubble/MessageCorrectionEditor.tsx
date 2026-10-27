import React from "react";
import { cn } from "@/lib/utils";

export interface MessageCorrectionEditorProps {
  isEditing: boolean;
  isAI: boolean;
  isFromMe: boolean;
  correctionText: string;
  setCorrectionText: (text: string) => void;
  saving: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export const MessageCorrectionEditor: React.FC<MessageCorrectionEditorProps> = ({
  isEditing,
  isAI,
  isFromMe,
  correctionText,
  setCorrectionText,
  saving,
  onCancel,
  onSubmit,
}) => {
  if (!isEditing || !isAI) return null;

  return (
    <div
      className={cn(
        "mt-1 w-full px-1.5",
        isFromMe ? "flex justify-end" : "flex justify-start"
      )}
    >
      <div className="w-[75%] rounded-xl border border-purple-300/50 bg-[var(--whatsapp-surface)] p-2.5 shadow-sm dark:border-purple-500/30">
        <p className="mb-1.5 text-[11px] font-semibold text-purple-700 dark:text-purple-300">
          تصحيح رد الوكيل:
        </p>
        <textarea
          value={correctionText}
          onChange={(e) => setCorrectionText(e.target.value)}
          className="w-full min-h-[3.5rem] resize-none rounded-lg border border-[color:var(--shell-control-border)] bg-[var(--whatsapp-surface-muted)] p-2 text-sm text-[color:var(--color-foreground)] outline-none focus:border-purple-500 dark:focus:border-purple-400"
          placeholder="اكتب الرد الصحيح للعميل هنا..."
        />
        <div className="mt-1.5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-3 py-1 text-xs font-medium text-[color:var(--color-muted-foreground)] transition-colors hover:bg-[var(--whatsapp-surface-hover)]"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={saving || !correctionText.trim()}
            className="rounded-lg bg-purple-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50 dark:bg-purple-500 dark:hover:bg-purple-600"
          >
            {saving ? "جارٍ الحفظ..." : "حفظ وتصحيح"}
          </button>
        </div>
      </div>
    </div>
  );
};
