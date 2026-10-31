import React from "react";
import {
  TextGalleryModalProps,
  overlayStyle,
} from "./types";
import { useTextGalleryController } from "./useTextGalleryController";
import { TextGalleryHeader } from "./TextGalleryHeader";
import { TextGalleryCreateForm } from "./TextGalleryCreateForm";
import { TextGalleryList } from "./TextGalleryList";

export const TextGalleryModal: React.FC<TextGalleryModalProps> = ({
  isOpen,
  onClose,
  onSelectText,
  onInsertText,
}) => {
  const {
    savedTexts,
    loading,
    saving,
    deleting,
    editingId,
    updating,
    pinning,
    newTitle,
    setNewTitle,
    newContent,
    setNewContent,
    newImagePreviews,
    editExistingImages,
    editImagePreviews,
    saveText,
    updateText,
    deleteText,
    togglePin,
    handleNewImageSelect,
    handleEditImageSelect,
    removeNewImage,
    removeEditExistingImage,
    removeEditNewImage,
    startEditing,
    cancelEditing,
  } = useTextGalleryController(isOpen);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={overlayStyle}
    >
      <div className="business-modal-surface flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden">
        {/* Header */}
        <TextGalleryHeader count={savedTexts.length} onClose={onClose} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {/* Add new text form */}
          <TextGalleryCreateForm
            title={newTitle}
            setTitle={setNewTitle}
            content={newContent}
            setContent={setNewContent}
            imagePreviews={newImagePreviews}
            onImageSelect={handleNewImageSelect}
            onRemoveImage={removeNewImage}
            saving={saving}
            onSave={saveText}
          />

          {/* Texts list */}
          <TextGalleryList
            savedTexts={savedTexts}
            loading={loading}
            editingId={editingId}
            updating={updating}
            pinning={pinning}
            deleting={deleting}
            editExistingImages={editExistingImages}
            editImagePreviews={editImagePreviews}
            onSelectText={onSelectText}
            onInsertText={onInsertText}
            onClose={onClose}
            onStartEditing={startEditing}
            onCancelEditing={cancelEditing}
            onSaveEdit={updateText}
            onRemoveEditExistingImage={removeEditExistingImage}
            onRemoveEditNewImage={removeEditNewImage}
            onSelectEditImages={handleEditImageSelect}
            onTogglePin={togglePin}
            onDelete={deleteText}
          />
        </div>
      </div>
    </div>
  );
};

export default TextGalleryModal;
