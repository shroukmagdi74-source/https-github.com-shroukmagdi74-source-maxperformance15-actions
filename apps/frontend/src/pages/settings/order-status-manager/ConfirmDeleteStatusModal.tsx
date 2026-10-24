import React from "react";
import { Trash2 } from "lucide-react";

export interface ConfirmDeleteStatusModalProps {
  confirmDeleteId: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmDeleteStatusModal({
  confirmDeleteId,
  onClose,
  onConfirm,
}: ConfirmDeleteStatusModalProps) {
  if (!confirmDeleteId) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            حذف الحالة
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-xs leading-relaxed">
          هل أنت متأكد من حذف هذه الحالة؟ لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.
        </p>
        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-xs font-semibold transition"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 text-xs font-semibold shadow-xs transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}