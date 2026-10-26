import { useRef } from "react";
import { toast } from "sonner";
import uploadService from "../../../../../services/uploadService";
import type { FormData } from "../../types";

interface UseStep5FlexibleUploadProps {
  formData: FormData;
  handleChange: (field: keyof FormData, value: any) => void;
  isEn: boolean;
}

export function useStep5FlexibleUpload({
  formData,
  handleChange,
  isEn,
}: UseStep5FlexibleUploadProps) {
  const flexibleInputRef = useRef<HTMLInputElement>(null);

  const handleFlexibleFilesUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (formData.flexibleAssets.length + files.length > 10) {
      toast.error(
        isEn ? "Maximum 10 assets allowed" : "الحد الأقصى هو 10 ملفات",
      );
      return;
    }

    toast.loading(
      isEn ? "Uploading assets..." : "جاري رفع الملفات...",
      { id: "flexible-upload" },
    );
    try {
      const newAssets: { id: string; type: "IMAGE" | "VIDEO"; url: string }[] =
        [];
      for (const file of files) {
        const isVid = file.type.startsWith("video/");
        const res = await uploadService.uploadMedia(file);
        if (res.success && res.data) {
          const url =
            res.data.fullUrl || `${window.location.origin}${res.data.url}`;
          newAssets.push({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            type: isVid ? "VIDEO" : "IMAGE",
            url,
          });
        }
      }
      if (newAssets.length > 0) {
        handleChange("flexibleAssets", [
          ...formData.flexibleAssets,
          ...newAssets,
        ]);
        toast.success(
          isEn
            ? `Uploaded ${newAssets.length} asset(s)`
            : `تم رفع ${newAssets.length} ملف(ات) بنجاح`,
          { id: "flexible-upload" },
        );
      }
    } catch (err: any) {
      toast.error(err.message || (isEn ? "Upload failed" : "فشل الرفع"), {
        id: "flexible-upload",
      });
    } finally {
      if (flexibleInputRef.current) flexibleInputRef.current.value = "";
    }
  };

  const handleRemoveFlexibleAsset = (assetId: string) => {
    const newAssets = formData.flexibleAssets.filter((a) => a.id !== assetId);
    handleChange("flexibleAssets", newAssets);
  };

  return {
    flexibleInputRef,
    handleFlexibleFilesUpload,
    handleRemoveFlexibleAsset,
  };
}
