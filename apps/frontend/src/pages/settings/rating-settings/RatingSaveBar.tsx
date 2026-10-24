import React from "react";
import { Loader, Save } from "lucide-react";

interface RatingSaveBarProps {
  saving: boolean;
  disabled: boolean;
  onSave: () => void;
}

export const RatingSaveBar: React.FC<RatingSaveBarProps> = ({
  saving,
  disabled,
  onSave,
}) => {
  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={onSave}
        disabled={saving || disabled}
        className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-sm disabled:opacity-50 transition-all duration-150 cursor-pointer font-medium"
      >
        {saving ? (
          <Loader className="animate-spin" size={18} />
        ) : (
          <Save size={18} />
        )}
        <span>حفظ التغييرات</span>
      </button>
    </div>
  );
};
