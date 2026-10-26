import React from "react";
import { Sparkles, Eye, X } from "lucide-react";
import type { FormData } from "../../types";

interface CreativeFlexibleAssetsSectionProps {
  formData: FormData;
  handleChange: (field: keyof FormData, value: any) => void;
  isEn: boolean;
  flexibleInputRef: React.RefObject<HTMLInputElement>;
  handleFlexibleFilesUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveFlexibleAsset: (assetId: string) => void;
}

export const CreativeFlexibleAssetsSection: React.FC<CreativeFlexibleAssetsSectionProps> = ({
  formData,
  isEn,
  flexibleInputRef,
  handleFlexibleFilesUpload,
  handleRemoveFlexibleAsset,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {isEn ? "Images & Videos (up to 10 files)" : "الصور والفيديوهات (حتى 10 ملفات)"}{" "}
        <span className="text-red-500">*</span>
      </label>

      <div
        onClick={() => flexibleInputRef.current?.click()}
        className="border-2 border-dashed border-green-300 dark:border-green-800/60 rounded-xl p-6 text-center hover:border-green-400 transition-colors cursor-pointer bg-green-50 dark:bg-green-950/30"
      >
        <input
          type="file"
          ref={flexibleInputRef}
          multiple
          accept="image/png,image/jpeg,image/webp,video/mp4,video/quicktime,video/webm"
          className="hidden"
          onChange={handleFlexibleFilesUpload}
        />
        <Sparkles className="w-12 h-12 mx-auto text-green-500 mb-3" />
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-1 font-medium">
          {isEn ? "Upload up to 10 images or videos" : "ارفع حتى 10 صور أو فيديوهات"}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          {isEn ? "Facebook will automatically select the best format for each user" : "سيختار Facebook تلقائياً أفضل تنسيق لكل مستخدم"}
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            flexibleInputRef.current?.click();
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
        >
          {isEn ? "Choose Files" : "اختر الملفات"}
        </button>
      </div>

      {/* Uploaded Assets List */}
      {formData.flexibleAssets.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isEn ? `Uploaded Files (${formData.flexibleAssets.length}/10)` : `الملفات المرفوعة (${formData.flexibleAssets.length}/10)`}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {formData.flexibleAssets.map((asset, index) => (
              <div key={asset.id} className="relative group">
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                  {asset.type === "IMAGE" ? (
                    <img
                      src={asset.url}
                      alt={`Asset ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <Eye className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFlexibleAsset(asset.id)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={isEn ? "Remove asset" : "حذف الملف"}
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-black bg-opacity-70 text-white text-xs rounded">
                  {asset.type === "IMAGE" ? (isEn ? "Image" : "صورة") : (isEn ? "Video" : "فيديو")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
