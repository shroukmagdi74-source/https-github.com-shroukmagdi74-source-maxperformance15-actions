import React, { useState } from "react";
import { headingStyle } from "./types";

interface TextGalleryItemEditProps {
  id: string;
  initialTitle: string;
  initialContent: string;
  existingImages: string[];
  newImagePreviews: string[];
  onRemoveExistingImage: (index: number) => void;
  onRemoveNewImage: (index: number) => void;
  onSelectNewImages: (e: React.ChangeEvent<HTMLInputElement>) => void;
  updating: boolean;
  onCancel: () => void;
  onSave: (id: string, title: string, content: string) => void;
}

export const TextGalleryItemEdit: React.FC<TextGalleryItemEditProps> = ({
  id,
  initialTitle,
  initialContent,
  existingImages,
  newImagePreviews,
  onRemoveExistingImage,
  onRemoveNewImage,
  onSelectNewImages,
  updating,
  onCancel,
  onSave,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  return (
    <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
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

      {/* Existing images */}
      {existingImages.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium" style={headingStyle}>
            الصور الحالية
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {existingImages.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt=""
                  className="h-24 w-full rounded-lg border object-cover"
                  style={{ borderColor: "var(--business-card-border)" }}
                />
                <button
                  type="button"
                  onClick={() => onRemoveExistingImage(index)}
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
        </div>
      )}

      {/* Add new images */}
      <div className="space-y-2">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={onSelectNewImages}
          className="hidden"
          id={`edit-image-${id}`}
        />
        <label
          htmlFor={`edit-image-${id}`}
          className="business-upload-dropzone cursor-pointer px-4 py-2"
          data-tone="primary"
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
          <span className="text-sm">إضافة صور جديدة</span>
        </label>

        {newImagePreviews.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {newImagePreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt=""
                  className="h-24 w-full rounded-lg border object-cover"
                  style={{ borderColor: "var(--business-card-border)" }}
                />
                <button
                  type="button"
                  onClick={() => onRemoveNewImage(index)}
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

      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="business-chip-button px-4 py-2"
        >
          إلغاء
        </button>
        <button
          type="button"
          onClick={() => onSave(id, title, content)}
          disabled={updating}
          className="business-chip-button px-4 py-2"
          data-active="true"
        >
          {updating ? "جاري التحديث..." : "حفظ التعديلات"}
        </button>
      </div>
    </div>
  );
};
