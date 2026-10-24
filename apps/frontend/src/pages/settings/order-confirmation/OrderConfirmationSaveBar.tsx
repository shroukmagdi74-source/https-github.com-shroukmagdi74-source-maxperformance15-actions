import React from "react";

export interface OrderConfirmationSaveBarProps {
  saving: boolean;
  onSave: () => void;
}

export function OrderConfirmationSaveBar({ saving, onSave }: OrderConfirmationSaveBarProps) {
  return (
    <div className="flex justify-end pt-2">
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      >
        {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
      </button>
    </div>
  );
}