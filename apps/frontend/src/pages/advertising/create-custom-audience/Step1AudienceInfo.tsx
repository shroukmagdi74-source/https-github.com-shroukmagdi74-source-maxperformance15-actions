import React from "react";
import { AUDIENCE_TYPES, CreateCustomAudienceData } from "./types";

interface Step1AudienceInfoProps {
  formData: CreateCustomAudienceData;
  onInputChange: (field: keyof CreateCustomAudienceData, value: any) => void;
}

export const Step1AudienceInfo: React.FC<Step1AudienceInfoProps> = ({
  formData,
  onInputChange,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="custom-audience-name"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          اسم الجمهور *
        </label>
        <input
          id="custom-audience-name"
          name="name"
          type="text"
          autoComplete="off"
          value={formData.name}
          onChange={(e) => onInputChange("name", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="مثال: عملاء نشطون - يناير 2025"
        />
      </div>

      <div>
        <label
          htmlFor="custom-audience-description"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          الوصف (اختياري)
        </label>
        <textarea
          id="custom-audience-description"
          name="description"
          autoComplete="off"
          value={formData.description}
          onChange={(e) => onInputChange("description", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          rows={3}
          placeholder="وصف مختصر للجمهور..."
        />
      </div>

      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-2">
          نوع الجمهور *
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {AUDIENCE_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = formData.audienceType === type.value;
            return (
              <label
                htmlFor={`custom-audience-type-${type.value}`}
                key={type.value}
                className={`cursor-pointer p-4 border rounded-xl transition-all duration-150 flex items-start gap-3.5 ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-500/20"
                    : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/50"
                }`}
              >
                <input
                  id={`custom-audience-type-${type.value}`}
                  type="radio"
                  name="audienceType"
                  value={type.value}
                  checked={isSelected}
                  onChange={(e) =>
                    onInputChange("audienceType", e.target.value)
                  }
                  className="sr-only"
                />
                <div
                  className={`p-2.5 rounded-lg flex-shrink-0 ${
                    isSelected
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-gray-900 text-sm">
                      {type.label}
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                      {type.badge}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {type.description}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
};
