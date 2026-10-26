import React from "react";
import { Sparkles } from "lucide-react";
import type { FormData } from "../../types";

interface CreativeAdvantageEnhancementsSectionProps {
  formData: FormData;
  handleChange: (field: keyof FormData, value: any) => void;
  isEn: boolean;
}

export const CreativeAdvantageEnhancementsSection: React.FC<CreativeAdvantageEnhancementsSectionProps> = ({
  formData,
  handleChange,
  isEn,
}) => {
  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/60">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            {isEn ? "Advantage+ Creative Enhancements (Meta AI)" : "تحسينات Advantage+ Creative الإبداعية (Meta AI)"}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {isEn
              ? "Let Meta algorithms optimize image lighting, auto-crop for different placements, and generate copy combinations to boost CTR and conversions."
              : "دع خوارزميات Meta تحسن إضاءة الصور، قصها تلقائياً للمواضع المختلفة، وتوليد تركيبات للعناوين لرفع نسبة النقر والتحويل."}
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(formData.advantageCreative)}
            onChange={(e) => {
              const checked = e.target.checked;
              handleChange("advantageCreative", checked);
              handleChange("imageEnhancement", checked);
              handleChange("textGeneration", checked);
            }}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>
    </div>
  );
};
