import React, { useState } from "react";
import { EyeIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { DISPLAY_CONDITION_PRESETS } from "../utils/displayConditions";

export interface StudioDisplayConditionsControlProps {
  conditions?: any;
  onChangeConditions: (conditions: any) => void;
}

export const StudioDisplayConditionsControl: React.FC<StudioDisplayConditionsControlProps> = ({
  conditions,
  onChangeConditions,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Normalize string or object
  const currentConditionStr =
    typeof conditions === "string"
      ? conditions
      : conditions?.type || (Array.isArray(conditions) && conditions[0]) || "";

  const handleSelectPreset = (presetId: string) => {
    if (presetId === "none") {
      onChangeConditions(undefined);
    } else {
      onChangeConditions(presetId);
    }
  };

  const hasCondition = Boolean(conditions && conditions !== "none");

  return (
    <div
      data-testid="studio-display-conditions-control"
      className="space-y-2 pt-3 border-t border-[#ececee]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <FunnelIcon className="h-3.5 w-3.5 text-[#2b6cf6]" />
          <span className="text-[10px] font-bold text-[#6f747b]">
            شروط العرض والظهور (Display Conditions)
          </span>
        </div>
        {hasCondition && (
          <span className="text-[9.5px] font-semibold text-[#2b6cf6] bg-[#2b6cf6]/10 px-1.5 py-0.5 rounded">
            شرط نشط
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        <select
          data-testid="select-display-condition"
          value={currentConditionStr || "none"}
          onChange={(e) => handleSelectPreset(e.target.value)}
          className="w-full rounded-lg border border-[#ececee] bg-[#f6f7f8] px-2.5 py-1.5 text-[11px] text-[#17181c] outline-none focus:border-[#2b6cf6] focus:bg-white"
        >
          <option value="none">ظاهر دائماً (بدون شروط)</option>
          {DISPLAY_CONDITION_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>

        {currentConditionStr && currentConditionStr !== "none" && (
          <div className="flex items-center gap-1 text-[10px] text-[#8a8f96] bg-[#f6f7f8] p-1.5 rounded-md">
            <EyeIcon className="h-3 w-3 shrink-0 text-[#2b6cf6]" />
            <span>
              {DISPLAY_CONDITION_PRESETS.find((p) => p.id === currentConditionStr)?.description ||
                `القاعدة المطبقة: ${currentConditionStr}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
