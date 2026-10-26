import React from "react";
import { PhotoIcon, TrashIcon } from "@heroicons/react/24/outline";
import { getImageUrl } from "../../../../utils/imageUrl";

interface QuickAddImagesSectionProps {
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  uploadingImage: boolean;
  handleImageFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const QuickAddImagesSection: React.FC<QuickAddImagesSectionProps> = ({
  images,
  setImages,
  fileInputRef,
  uploadingImage,
  handleImageFileChange,
}) => {
  return (
    <div>
      <label className="block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
        صور المنتج
      </label>
      <div className="flex flex-wrap items-center gap-3">
        {/* Existing Uploaded Images */}
        {images.map((imgUrl, idx) => (
          <div
            key={imgUrl}
            className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
          >
            <img
              src={getImageUrl(imgUrl) || imgUrl}
              alt=""
              className="w-full h-full object-cover"
            />
            {idx === 0 && (
              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 text-[9px] font-bold bg-indigo-600 text-white rounded">
                الرئيسية
              </span>
            )}
            <button
              type="button"
              onClick={() => setImages((prev) => prev.filter((u) => u !== imgUrl))}
              className="absolute top-1 left-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
              title="حذف الصورة"
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {/* Upload Trigger Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImage}
          className="w-20 h-20 flex flex-col items-center justify-center gap-1 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50/50 dark:bg-slate-800/40"
        >
          {uploadingImage ? (
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <PhotoIcon className="w-6 h-6" />
              <span className="text-[10px] font-medium">إضافة صورة</span>
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageFileChange}
        />
      </div>
    </div>
  );
};
