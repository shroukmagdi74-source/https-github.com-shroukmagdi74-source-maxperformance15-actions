import { useState } from "react";
import { toast } from "sonner";
import uploadService from "../../../../../services/uploadService";
import type { FormData, CarouselCard } from "../../types";

interface UseStep5CarouselCardsProps {
  formData: FormData;
  handleChange: (field: keyof FormData, value: any) => void;
  isEn: boolean;
}

export function useStep5CarouselCards({
  formData,
  handleChange,
  isEn,
}: UseStep5CarouselCardsProps) {
  const [uploadingCardId, setUploadingCardId] = useState<string | null>(null);

  const handleCardImageUpload = async (cardId: string, file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(
        isEn ? "Please select a valid image file" : "يرجى اختيار ملف صورة صالح",
      );
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error(
        isEn
          ? "Image size must not exceed 25MB"
          : "حجم الصورة يجب ألا يتجاوز 25 ميجابايت",
      );
      return;
    }

    try {
      setUploadingCardId(cardId);
      toast.loading(
        isEn ? "Uploading card image..." : "جاري رفع صورة البطاقة...",
        { id: `card-upload-${cardId}` },
      );
      const res = await uploadService.uploadMedia(file);
      if (res.success && res.data) {
        let mediaUrl = res.data.url;
        if (res.data.fullUrl) {
          mediaUrl = res.data.fullUrl;
        } else if (mediaUrl.startsWith("/")) {
          mediaUrl = `${window.location.origin}${mediaUrl}`;
        }
        const updated = formData.carouselCards.map((c) =>
          c.id === cardId ? { ...c, imageUrl: mediaUrl } : c,
        );
        handleChange("carouselCards", updated);
        toast.success(
          isEn ? "Card image uploaded successfully" : "تم رفع صورة البطاقة بنجاح",
          { id: `card-upload-${cardId}` },
        );
      } else {
        toast.error(
          res.error || (isEn ? "Failed to upload image" : "فشل رفع الصورة"),
          { id: `card-upload-${cardId}` },
        );
      }
    } catch (err: any) {
      toast.error(
        err.message || (isEn ? "Failed to upload image" : "فشل رفع الصورة"),
        { id: `card-upload-${cardId}` },
      );
    } finally {
      setUploadingCardId(null);
    }
  };

  const handleAddCard = () => {
    if (formData.carouselCards.length < 10) {
      handleChange("carouselCards", [
        ...formData.carouselCards,
        {
          id: Date.now().toString(),
          imageUrl: "",
          headline: "",
          description: "",
          linkUrl: "",
        },
      ]);
    }
  };

  const handleRemoveCard = (cardId: string) => {
    handleChange(
      "carouselCards",
      formData.carouselCards.filter((c) => c.id !== cardId),
    );
  };

  const handleUpdateCard = (cardId: string, updates: Partial<CarouselCard>) => {
    const updated = formData.carouselCards.map((c) =>
      c.id === cardId ? { ...c, ...updates } : c,
    );
    handleChange("carouselCards", updated);
  };

  return {
    uploadingCardId,
    handleCardImageUpload,
    handleAddCard,
    handleRemoveCard,
    handleUpdateCard,
  };
}
