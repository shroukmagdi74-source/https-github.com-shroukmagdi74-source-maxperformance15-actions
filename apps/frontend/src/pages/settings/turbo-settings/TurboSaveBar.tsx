import React from "react";

interface TurboSaveBarProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
  saving: boolean;
  disabled: boolean;
  onSave: () => void;
}

export const TurboSaveBar: React.FC<TurboSaveBarProps> = ({
  t,
  saving,
  disabled,
  onSave,
}) => {
  return (
    <div className="flex justify-end pt-6 border-t dark:border-gray-700">
      <button
        type="button"
        onClick={onSave}
        disabled={saving || disabled}
        className="px-6 py-2.5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors shadow-sm"
      >
        {saving ? t("turbo.k_21") : t("turbo.k_22")}
      </button>
    </div>
  );
};
