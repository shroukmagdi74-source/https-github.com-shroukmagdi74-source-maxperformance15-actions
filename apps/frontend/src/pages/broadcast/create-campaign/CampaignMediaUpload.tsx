import React from "react";
import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface CampaignMediaUploadProps {
  images: File[];
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
}

export const CampaignMediaUpload: React.FC<CampaignMediaUploadProps> = ({
  images,
  onImageChange,
  onRemoveImage,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        <PhotoIcon className="h-5 w-5 inline ml-1" />
        إرفاق صور (اختياري)
      </label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
        <div className="space-y-1 text-center">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <div className="flex text-sm text-gray-600 dark:text-gray-400">
            <label
              htmlFor="images"
              className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
            >
              <span>اختر الصور</span>
              <input
                id="images"
                name="images"
                type="file"
                multiple
                accept="image/*"
                onChange={onImageChange}
                className="sr-only"
              />
            </label>
            <p className="pr-1">أو اسحب الصور هنا</p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            PNG, JPG, GIF حتى 10MB
          </p>
        </div>
      </div>

      {images.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            الصور المرفقة ({images.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`صورة ${index + 1}`}
                  className="h-20 w-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => onRemoveImage(index)}
                  aria-label={`حذف صورة ${index + 1}`}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
