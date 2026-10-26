import React from "react";
import {
  ShoppingBag,
  Video,
  Image,
  RefreshCw,
  Trash2,
  UploadCloud,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { FormData } from "../../types";
import { PlacementMediaCustomizer } from "../PlacementMediaCustomizer";

interface CreativeMediaUploadSectionProps {
  formData: FormData;
  handleChange: (field: keyof FormData, value: any) => void;
  getError: (field: string) => string;
  isEn: boolean;
  onOpenProductPicker: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  uploading: boolean;
  uploadProgress: number;
  isDragging: boolean;
  uploadError: string | null;
  handleMediaUpload: (file: File) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
}

export const CreativeMediaUploadSection: React.FC<CreativeMediaUploadSectionProps> = ({
  formData,
  handleChange,
  getError,
  isEn,
  onOpenProductPicker,
  fileInputRef,
  uploading,
  uploadProgress,
  isDragging,
  uploadError,
  handleMediaUpload,
  handleDragOver,
  handleDragLeave,
  handleDrop,
}) => {
  const isImage = formData.creativeType === "SINGLE_IMAGE";
  const isVideo = formData.creativeType === "SINGLE_VIDEO";
  const hasActiveMedia =
    (isImage && Boolean(formData.imageUrl)) ||
    (isVideo && Boolean(formData.videoUrl));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {isImage ? (isEn ? "Image" : "الصورة") : (isEn ? "Video" : "الفيديو")}{" "}
          <span className="text-red-500">*</span>
        </label>
        <button
          type="button"
          onClick={onOpenProductPicker}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors border border-blue-200 dark:border-blue-800"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          {isEn ? "Select from Store Products" : "اختيار من منتجات المتجر"}
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={
          isImage
            ? "image/png,image/jpeg,image/webp,image/jpg"
            : "video/mp4,video/quicktime,video/webm"
        }
        className="hidden"
        id="media-upload"
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleMediaUpload(file);
        }}
      />

      {/* Active preview if media is present */}
      {hasActiveMedia && !uploading ? (
        <div className="relative rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 overflow-hidden">
          {isVideo ? (
            <div className="relative bg-black flex items-center justify-center">
              <video
                src={formData.videoUrl}
                className="w-full max-h-64 object-contain mx-auto"
                controls
                preload="metadata"
              />
            </div>
          ) : (
            <div className="relative h-48 sm:h-56 bg-slate-900/5 dark:bg-slate-950/40 flex items-center justify-center p-2">
              <img
                src={formData.imageUrl}
                alt="Ad Creative"
                className="max-h-full max-w-full object-contain rounded"
              />
            </div>
          )}

          <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-400">
                {isVideo ? (
                  <Video className="w-4 h-4" />
                ) : (
                  <Image className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                  {isImage ? formData.imageUrl : formData.videoUrl}
                </p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  {isEn ? "Media ready for Meta Ad" : "الملف جاهز للإعلان"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                {isEn ? "Replace" : "تغيير"}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isImage) {
                    handleChange("imageUrl", "");
                  } else {
                    handleChange("videoUrl", "");
                  }
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                title={isEn ? "Remove" : "حذف"}
                aria-label={isEn ? "Remove" : "حذف"}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Drag & drop upload area */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
            isDragging
              ? "border-blue-500 bg-blue-50/70 dark:bg-blue-950/40"
              : "border-gray-300 dark:border-gray-700 hover:border-blue-400 bg-gray-50 dark:bg-gray-800/60"
          }`}
        >
          {uploading ? (
            <div className="py-2 space-y-3">
              <Loader2 className="w-10 h-10 mx-auto text-blue-500 animate-spin" />
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {isEn ? `Uploading... ${uploadProgress}%` : `جاري الرفع... ${uploadProgress}%`}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {isEn ? "Processing file and verifying format" : "جاري معالجة الملف والتحقق من التنسيق"}
                </p>
              </div>
              <div className="w-full max-w-xs mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div>
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                {isEn
                  ? "Click to upload or drag & drop"
                  : "انقر للرفع من جهازك أو اسحب الملف وأفلته هنا"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isImage
                  ? (isEn
                      ? "PNG, JPG, WEBP (Max 25MB) • 1080x1080 Recommended"
                      : "PNG, JPG, WEBP (بحد أقصى 25 ميجابايت) • يُفضل 1080x1080")
                  : (isEn
                      ? "MP4, MOV (Max 100MB) • Up to 2 minutes recommended"
                      : "MP4, MOV (بحد أقصى 100 ميجابايت) • مدة حتى دقيقتين")}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Upload error banner if any */}
      {uploadError && (
        <div className="flex items-center gap-2 p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Direct URL Input */}
      <div className="pt-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {isEn ? "or enter direct URL" : "أو أدخل رابط مباشر"}
          </span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
        </div>
        <input
          type="url"
          value={isImage ? formData.imageUrl : formData.videoUrl}
          onChange={(e) =>
            handleChange(isImage ? "imageUrl" : "videoUrl", e.target.value)
          }
          placeholder="https://..."
          className="w-full px-3.5 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
        />
        {isImage && getError("imageUrl") && (
          <p className="mt-1 text-xs text-red-500">
            {getError("imageUrl")}
          </p>
        )}
        {isVideo && getError("videoUrl") && (
          <p className="mt-1 text-xs text-red-500">
            {getError("videoUrl")}
          </p>
        )}
      </div>

      {/* Stories / Reels 9:16 Custom Media */}
      <PlacementMediaCustomizer
        customStoriesMedia={Boolean(formData.customStoriesMedia)}
        onToggleCustomStories={(val) => handleChange("customStoriesMedia", val)}
        storyImageUrl={formData.storyImageUrl || ""}
        onStoryImageUrlChange={(val) => handleChange("storyImageUrl", val)}
        storyVideoUrl={formData.storyVideoUrl || ""}
        onStoryVideoUrlChange={(val) => handleChange("storyVideoUrl", val)}
        creativeType={formData.creativeType}
      />
    </div>
  );
};
