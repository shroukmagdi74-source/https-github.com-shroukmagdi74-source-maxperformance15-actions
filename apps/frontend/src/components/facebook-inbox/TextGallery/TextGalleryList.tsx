import React from "react";
import {
  SavedText,
  headingStyle,
  mutedStyle,
  selectedToneStyle,
} from "./types";
import { TextGalleryItemEdit } from "./TextGalleryItemEdit";
import { TextGalleryItemView } from "./TextGalleryItemView";

interface TextGalleryListProps {
  savedTexts: SavedText[];
  loading: boolean;
  editingId: string | null;
  updating: boolean;
  pinning: string | null;
  deleting: string | null;
  editExistingImages: string[];
  editImagePreviews: string[];
  onSelectText: (text: { content: string; imageUrls?: string[] }) => void;
  onInsertText?: (content: string) => void;
  onClose: () => void;
  onStartEditing: (text: SavedText, e: React.MouseEvent) => void;
  onCancelEditing: () => void;
  onSaveEdit: (id: string, title: string, content: string) => void;
  onRemoveEditExistingImage: (index: number) => void;
  onRemoveEditNewImage: (index: number) => void;
  onSelectEditImages: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTogglePin: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export const TextGalleryList: React.FC<TextGalleryListProps> = ({
  savedTexts,
  loading,
  editingId,
  updating,
  pinning,
  deleting,
  editExistingImages,
  editImagePreviews,
  onSelectText,
  onInsertText,
  onClose,
  onStartEditing,
  onCancelEditing,
  onSaveEdit,
  onRemoveEditExistingImage,
  onRemoveEditNewImage,
  onSelectEditImages,
  onTogglePin,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div
            className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2"
            style={{ borderColor: "var(--business-success)" }}
          />
          <p style={mutedStyle}>جاري تحميل النصوص...</p>
        </div>
      </div>
    );
  }

  if (savedTexts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-center">
        <div>
          <svg
            className="mx-auto mb-4 h-24 w-24"
            style={mutedStyle}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="mb-2 text-lg" style={headingStyle}>
            لا توجد نصوص محفوظة
          </p>
          <p className="text-sm" style={mutedStyle}>
            احفظ النصوص الشائعة هنا للإرسال السريع
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {savedTexts.map((text) => (
        <div
          key={text.id}
          className={`business-page-panel group p-4 transition-all ${
            editingId === text.id ? "" : "cursor-pointer"
          }`}
          style={editingId === text.id ? selectedToneStyle : undefined}
          onClick={() => {
            if (editingId !== text.id) {
              if (onInsertText && text.content) {
                onInsertText(text.content);
                onClose();
              } else {
                onSelectText({
                  content: text.content,
                  ...(text.imageUrls && { imageUrls: text.imageUrls }),
                });
              }
            }
          }}
        >
          {editingId === text.id ? (
            <TextGalleryItemEdit
              id={text.id}
              initialTitle={text.title || ""}
              initialContent={text.content}
              existingImages={editExistingImages}
              newImagePreviews={editImagePreviews}
              onRemoveExistingImage={onRemoveEditExistingImage}
              onRemoveNewImage={onRemoveEditNewImage}
              onSelectNewImages={onSelectEditImages}
              updating={updating}
              onCancel={onCancelEditing}
              onSave={onSaveEdit}
            />
          ) : (
            <TextGalleryItemView
              text={text}
              onSelectText={onSelectText}
              onInsertText={onInsertText}
              onClose={onClose}
              onStartEditing={onStartEditing}
              onTogglePin={onTogglePin}
              onDelete={onDelete}
              pinning={pinning === text.id}
              deleting={deleting === text.id}
            />
          )}
        </div>
      ))}
    </div>
  );
};
