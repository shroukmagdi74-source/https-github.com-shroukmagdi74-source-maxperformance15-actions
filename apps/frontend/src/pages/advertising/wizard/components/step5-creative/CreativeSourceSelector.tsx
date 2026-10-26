import React from "react";
import { Plus, FileText } from "lucide-react";
import type { FormData } from "../../types";
import type { CreativeSourceType } from "./types";

interface CreativeSourceSelectorProps {
  creativeSource: CreativeSourceType;
  setCreativeSource: (val: CreativeSourceType) => void;
  formData: FormData;
  handleChange: (field: keyof FormData, value: any) => void;
  isEn: boolean;
}

export const CreativeSourceSelector: React.FC<CreativeSourceSelectorProps> = ({
  creativeSource,
  setCreativeSource,
  formData,
  handleChange,
  isEn,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {isEn ? "Creative Source" : "مصدر الإعلان (Creative Source)"}
      </label>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          type="button"
          onClick={() => {
            setCreativeSource("NEW_AD");
            if (formData.creativeType === "EXISTING_POST") {
              handleChange("creativeType", "SINGLE_IMAGE");
            }
          }}
          className={`p-3 border-2 rounded-xl flex items-center justify-center gap-2 transition-all font-medium text-sm ${
            creativeSource === "NEW_AD"
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-sm"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800"
          }`}
        >
          <Plus className="w-4 h-4" />
          {isEn ? "Create New Ad" : "إنشاء إعلان جديد"}
        </button>
        <button
          type="button"
          onClick={() => {
            setCreativeSource("EXISTING_POST");
            handleChange("creativeType", "EXISTING_POST");
          }}
          className={`p-3 border-2 rounded-xl flex items-center justify-center gap-2 transition-all font-medium text-sm ${
            creativeSource === "EXISTING_POST"
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-sm"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          {isEn ? "Use Existing Post" : "استخدام منشور حالي"}
        </button>
      </div>
    </div>
  );
};
