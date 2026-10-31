import { useState, useEffect, useCallback } from "react";
import i18n from "../../../i18n";
import { apiClient } from "@/services/apiClient";
import { SavedText } from "./types";

export const useTextGalleryController = (isOpen: boolean) => {
  // States
  const [savedTexts, setSavedTexts] = useState<SavedText[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [pinning, setPinning] = useState<string | null>(null);

  // New text form
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  // Edit form
  const [editImages, setEditImages] = useState<File[]>([]);
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);
  const [editExistingImages, setEditExistingImages] = useState<string[]>([]);

  // Load texts
  const loadTexts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/user/text-gallery");
      if (response.data?.texts) {
        // ترتيب النصوص: المثبتة أولاً، ثم الباقي حسب التاريخ (الأحدث أولاً)
        const sortedTexts = [...response.data.texts].sort((a, b) => {
          if (!!a.isPinned === !!b.isPinned) {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          }
          return a.isPinned ? -1 : 1;
        });
        setSavedTexts(sortedTexts);
      }
    } catch (error) {
      console.error("Error loading text gallery:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadTexts();
    }
  }, [isOpen, loadTexts]);

  // Helper to upload images
  const uploadImageFiles = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;

      const formData = new FormData();
      formData.append("image", file);

      const uploadResponse = await apiClient.post(
        "/user/image-gallery/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      const imageUrl =
        uploadResponse.data?.image?.url ||
        uploadResponse.data?.image?.fileUrl;
      if (imageUrl) {
        urls.push(imageUrl);
      }
    }
    return urls;
  };

  // Save new text
  const saveText = async () => {
    if (!newContent.trim() && newImages.length === 0) {
      alert(i18n.t("textGallery.msg_b002"));
      return;
    }

    try {
      setSaving(true);
      let imageUrls: string[] = [];

      if (newImages.length > 0) {
        imageUrls = await uploadImageFiles(newImages);
      }

      await apiClient.post("/user/text-gallery", {
        title: newTitle.trim() || null,
        content: newContent.trim() || null,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      });

      await loadTexts();
      setNewTitle("");
      setNewContent("");
      setNewImages([]);
      setNewImagePreviews([]);
      alert(i18n.t("textGallery.success_save_13c8"));
    } catch (error) {
      console.error("Error saving text:", error);
      alert(i18n.t("textGallery.failed_save_5d61"));
    } finally {
      setSaving(false);
    }
  };

  // Update text
  const updateText = async (textId: string, title: string, content: string) => {
    if (
      !content.trim() &&
      editExistingImages.length === 0 &&
      editImages.length === 0
    ) {
      alert(i18n.t("textGallery.msg_b002"));
      return;
    }

    try {
      setUpdating(true);
      let imageUrls: string[] = [...editExistingImages];

      if (editImages.length > 0) {
        const uploadedUrls = await uploadImageFiles(editImages);
        imageUrls.push(...uploadedUrls);
      }

      await apiClient.put(`/user/text-gallery/${textId}`, {
        title: title.trim() || null,
        content: content.trim() || null,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      });

      await loadTexts();
      setEditingId(null);
      setEditImages([]);
      setEditImagePreviews([]);
      setEditExistingImages([]);
      alert(i18n.t("textGallery.success_update_8adb"));
    } catch (error) {
      console.error("Error updating text:", error);
      alert(i18n.t("textGallery.failed_update_38bf"));
    } finally {
      setUpdating(false);
    }
  };

  // Delete text
  const deleteText = async (textId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("هل أنت متأكد من حذف هذا النص من الحافظة؟")) return;

    try {
      setDeleting(textId);
      await apiClient.delete(`/user/text-gallery/${textId}`);
      setSavedTexts((prev) => prev.filter((t) => t.id !== textId));
    } catch (error) {
      console.error("Error deleting text:", error);
      alert(i18n.t("textGallery.failed_delete_2cad"));
    } finally {
      setDeleting(null);
    }
  };

  // Toggle pin
  const togglePin = async (textId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setPinning(textId);
      const text = savedTexts.find((t) => t.id === textId);
      await apiClient.patch(`/user/text-gallery/${textId}/pin`, {
        isPinned: !text?.isPinned,
      });
      await loadTexts();
    } catch (error) {
      console.error("Error toggling pin:", error);
      alert(i18n.t("textGallery.failed_update_status_7f81"));
    } finally {
      setPinning(null);
    }
  };

  // Handle image selection for new text
  const handleNewImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const validFiles: File[] = [];
    const previews: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (!file) continue;
      if (file.size > 10 * 1024 * 1024) {
        alert(`حجم الملف ${file.name} كبير جداً. الحد الأقصى 10 ميجابايت.`);
        continue;
      }
      if (!file.type.startsWith("image/")) {
        alert(`الملف ${file.name} ليس صورة.`);
        continue;
      }

      validFiles.push(file);
      previews.push(URL.createObjectURL(file));
    }

    setNewImages((prev) => [...prev, ...validFiles]);
    setNewImagePreviews((prev) => [...prev, ...previews]);
    e.target.value = "";
  };

  // Handle image selection for edit
  const handleEditImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const validFiles: File[] = [];
    const previews: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (!file) continue;
      if (file.size > 10 * 1024 * 1024) continue;
      if (!file.type.startsWith("image/")) continue;

      validFiles.push(file);
      previews.push(URL.createObjectURL(file));
    }

    setEditImages((prev) => [...prev, ...validFiles]);
    setEditImagePreviews((prev) => [...prev, ...previews]);
    e.target.value = "";
  };

  // Remove image from new text
  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove existing image from edit
  const removeEditExistingImage = (index: number) => {
    setEditExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove new image from edit
  const removeEditNewImage = (index: number) => {
    setEditImages((prev) => prev.filter((_, i) => i !== index));
    setEditImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Start editing
  const startEditing = (text: SavedText, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(text.id);
    setEditExistingImages(text.imageUrls || []);
    setEditImages([]);
    setEditImagePreviews([]);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditImages([]);
    setEditImagePreviews([]);
    setEditExistingImages([]);
  };

  return {
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
    newImages,
    newImagePreviews,
    editImages,
    editImagePreviews,
    editExistingImages,
    loadTexts,
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
  };
};
