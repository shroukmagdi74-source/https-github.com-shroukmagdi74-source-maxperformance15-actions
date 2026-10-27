import React from "react";
import { MapPin } from "lucide-react";
import { EGYPT_GOVERNORATES } from "./types";

interface TierGovernoratesPickerProps {
  targetGovernorates?: string[];
  onChange: (governorates: string[]) => void;
}

export const TierGovernoratesPicker: React.FC<TierGovernoratesPickerProps> = ({
  targetGovernorates = [],
  onChange,
}) => {
  return (
    <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <label className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-purple-600" />
          النطاق الجغرافي للمستوى (المحافظات المؤهلة)
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
          >
            تحديد كعام (لكل المحافظات)
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={() => onChange([...EGYPT_GOVERNORATES])}
            className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
          >
            اختيار الكل
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        اتركها فارغة لتطبيق المستوى على جميع المحافظات، أو اختر محافظات معينة
        (مثل القاهرة والجيزة) ليكون مستوى مخصصاً لمنطقتهم فقط.
      </p>

      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {EGYPT_GOVERNORATES.map((gov) => {
          const isSelected =
            Array.isArray(targetGovernorates) &&
            targetGovernorates.includes(gov);
          return (
            <button
              key={gov}
              type="button"
              onClick={() => {
                const current = Array.isArray(targetGovernorates)
                  ? targetGovernorates
                  : [];
                const updated = isSelected
                  ? current.filter((g) => g !== gov)
                  : [...current, gov];
                onChange(updated);
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                isSelected
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {isSelected ? "✓ " : ""}
              {gov}
            </button>
          );
        })}
      </div>
    </div>
  );
};
