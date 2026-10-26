import { useState, useRef } from "react";
import { toast } from "sonner";
import uploadService from "../../../../../services/uploadService";
import type { FormData } from "../../types";

interface UseStep5MediaUploadProps {
  formData: FormData;
  handleChange: (field: keyof FormData, value: any) => void;
  isEn: boolean;
}

export function useStep5MediaUpload({
  formData,
  handleChange,
  isEn,
}: UseStep5MediaUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleMediaUpload = async (file: File) => {
    if (!file) return;
    setUploadError(null);

    const isImage = formData.creativeType === "SINGLE_IMAGE";
    const isVideo = formData.creativeType === "SINGLE_VIDEO";

    // 1. Type validation
    if (isImage && !file.type.startsWith("image/")) {
      const msg = isEn
        ? "Please select a valid image file (PNG, JPG, WEBP)"
        : "يرجى اختيار ملف صورة صالح (PNG, JPG, WEBP)";
      setUploadError(msg);
      toast.error(msg);
      return;
    }
    if (isVideo && !file.type.startsWith("video/")) {
      const msg = isEn
        ? "Please select a valid video file (MP4, MOV, WEBM)"
        : "يرجى اختيار ملف فيديو صالح (MP4, MOV, WEBM)";
      setUploadError(msg);
      toast.error(msg);
      return;
    }

    // 2. Size validation
    const maxImageSize = 25 * 1024 * 1024; // 25MB
    const maxVideoSize = 100 * 1024 * 1024; // 100MB
    if (isImage && file.size > maxImageSize) {
      const msg = isEn
        ? "Image size must not exceed 25MB"
        : "حجم الصورة يجب ألا يتجاوز 25 ميجابايت";
      setUploadError(msg);
      toast.error(msg);
      return;
    }
    if (isVideo && file.size > maxVideoSize) {
      const msg = isEn
        ? "Video size must not exceed 100MB"
        : "حجم الفيديو يجب ألا يتجاوز 100 ميجابايت";
      setUploadError(msg);
      toast.error(msg);
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      const toastId = "media-upload-toast";
      toast.loading(
        isEn
          ? `Uploading ${isImage ? "image" : "video"}...`
          : `جاري رفع ${isImage ? "الصورة" : "الفيديو"}...`,
        { id: toastId },
      );

      const res = await uploadService.uploadMedia(file, (percent) => {
        setUploadProgress(percent);
      });

      if (res.success && res.data) {
        let mediaUrl = res.data.url;
        if (res.data.fullUrl) {
          mediaUrl = res.data.fullUrl;
        } else if (mediaUrl.startsWith("/")) {
          mediaUrl = `${window.location.origin}${mediaUrl}`;
        }

        if (isImage) {
          handleChange("imageUrl", mediaUrl);
          toast.success(
            isEn ? "Image uploaded successfully" : "تم رفع الصورة بنجاح",
            { id: toastId },
          );
        } else {
          handleChange("videoUrl", mediaUrl);
          toast.success(
            isEn ? "Video uploaded successfully" : "تم رفع الفيديو بنجاح",
            { id: toastId },
          );
        }
      } else {
        const errorMsg =
          res.error || (isEn ? "Failed to upload media" : "فشل رفع الملف");
        setUploadError(errorMsg);
        toast.error(errorMsg, { id: toastId });
      }
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error ||
        err.message ||
        (isEn ? "Upload failed" : "فشل في رفع الملف");
      setUploadError(errorMsg);
      toast.error(errorMsg, { id: "media-upload-toast" });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploading) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleMediaUpload(file);
    }
  };

  return {
    fileInputRef,
    uploading,
    uploadProgress,
    isDragging,
    uploadError,
    handleMediaUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}
