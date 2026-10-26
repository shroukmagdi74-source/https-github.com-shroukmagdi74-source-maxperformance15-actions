import React from "react";
import { Image, Eye, Layout, Sparkles } from "lucide-react";
import type { FormData } from "../../types";

interface CreativeFormatSelectorProps {
  formData: FormData;
  handleChange: (field: keyof FormData, value: any) => void;
  getError: (field: string) => string;
  isEn: boolean;
}

export const CreativeFormatSelector: React.FC<CreativeFormatSelectorProps> = ({
  formData,
  handleChange,
  getError,
  isEn,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        {isEn ? "Creative Format" : "نوع المحتوى"}
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => handleChange("creativeType", "SINGLE_IMAGE")}
          className={`p-4 border-2 rounded-xl text-center transition-all ${
            formData.creativeType === "SINGLE_IMAGE"
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
          }`}
        >
          <Image
            className={`w-8 h-8 mx-auto mb-2 ${formData.creativeType === "SINGLE_IMAGE" ? "text-blue-500" : "text-gray-400 dark:text-gray-500"}`}
          />
          <div className="font-medium text-sm">{isEn ? "Image" : "صورة"}</div>
        </button>

        <button
          type="button"
          onClick={() => handleChange("creativeType", "SINGLE_VIDEO")}
          className={`p-4 border-2 rounded-xl text-center transition-all ${
            formData.creativeType === "SINGLE_VIDEO"
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
          }`}
        >
          <Eye
            className={`w-8 h-8 mx-auto mb-2 ${formData.creativeType === "SINGLE_VIDEO" ? "text-blue-500" : "text-gray-400 dark:text-gray-500"}`}
          />
          <div className="font-medium text-sm">{isEn ? "Video" : "فيديو"}</div>
        </button>

        <button
          type="button"
          onClick={() => {
            handleChange("creativeType", "CAROUSEL");
            if (formData.carouselCards.length === 0) {
              handleChange("carouselCards", [
                {
                  id: "1",
                  imageUrl: "",
                  headline: "",
                  description: "",
                  linkUrl: "",
                },
                {
                  id: "2",
                  imageUrl: "",
                  headline: "",
                  description: "",
                  linkUrl: "",
                },
              ]);
            }
          }}
          className={`p-4 border-2 rounded-xl text-center transition-all ${
            formData.creativeType === "CAROUSEL"
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
          }`}
        >
          <Layout
            className={`w-8 h-8 mx-auto mb-2 ${formData.creativeType === "CAROUSEL" ? "text-blue-500" : "text-gray-400 dark:text-gray-500"}`}
          />
          <div className="font-medium text-sm">{isEn ? "Carousel" : "دوّار"}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{isEn ? "2-10 cards" : "2-10 بطاقات"}</div>
        </button>

        <button
          type="button"
          disabled
          aria-disabled="true"
          title={isEn ? "Flexible format in progress" : "التنسيق المرن قيد التجهيز"}
          className="p-4 border-2 rounded-xl text-center transition-all border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 text-gray-400 dark:text-gray-500 opacity-60 cursor-not-allowed"
        >
          <Sparkles
            className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-500"
          />
          <div className="font-medium text-sm">{isEn ? "Flexible" : "مرن"}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{isEn ? "Soon" : "قريبًا"}</div>
        </button>
      </div>

      {getError("creativeType") && (
        <p className="mt-2 text-sm text-red-500">
          {getError("creativeType")}
        </p>
      )}
    </div>
  );
};
