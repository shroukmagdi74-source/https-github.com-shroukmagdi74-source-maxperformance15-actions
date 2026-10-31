import React from "react";
import { headingStyle } from "./types";

interface TextGalleryCreateFormProps {
  title: string;
  setTitle: (val: string) => void;
  content: string;
  setContent: (val: string) => void;
  imagePreviews: string[];
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  saving: boolean;
  onSave: () => void;
}

export const TextGalleryCreateForm: React.FC<TextGalleryCreateFormProps> = ({
  title,
  setTitle,
  content,
  setContent,
  imagePreviews,
  onImageSelect,
  onRemoveImage,
  saving,
  onSave,
}) => {
  return (
    <div className="business-page-panel mb-6 p-4">
      <h4 className="mb-3 text-sm font-semibold" style={headingStyle}>
        إضافة نص جديد
      </h4>
      <div className="space-y-3">
        <input
          type="text"
          placeholder="عنوان النص (اختياري)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="business-control-input w-full px-3 py-2"
        />
        <textarea
          placeholder="محتوى النص..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="business-chat-input w-full resize-none px-3 py-2"
        />

        {/* Image upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium" style={headingStyle}>
            إرفاق صور (اختياري)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onImageSelect}
            className="hidden"
            id="text-gallery-new-image"
          />
          <label
            htmlFor="text-gallery-new-image"
            className="business-upload-dropzone cursor-pointer px-4 py-2"
            data-tone="success"
          >
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="text-sm">اختر صور لإرفاقها</span>
          </label>

          {imagePreviews.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt=""
                    className="h-24 w-full rounded-lg border object-cover"
                    style={{ borderColor: "var(--business-card-border)" }}
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveImage(index)}
                    className="business-icon-button business-icon-button--sm absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100"
                    style={{
                      background: "var(--business-danger)",
                      borderColor: "transparent",
                      color: "white",
                    }}
                    aria-label="حذف الصورة"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={saving || (!content.trim() && imagePreviews.length === 0)}
          className="business-chip-button w-full px-4 py-2 disabled:cursor-not-allowed"
          style={{
            background:
              "linear-gradient(135deg, var(--business-success) 0%, var(--color-secondary) 100%)",
            borderColor: "transparent",
            color: "white",
          }}
        >
          {saving ? (
            <div className="flex items-center justify-center">
              <div
                className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2"
                style={{ borderColor: "currentColor" }}
              />
              <span>جاري الحفظ...</span>
            </div>
          ) : (
            "حفظ النص"
          )}
        </button>
      </div>
    </div>
  );
};
