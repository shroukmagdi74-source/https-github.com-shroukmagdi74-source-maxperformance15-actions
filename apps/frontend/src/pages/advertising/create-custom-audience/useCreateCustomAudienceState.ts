import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { tToast } from "../../../utils/i18n-toast";
import {
  facebookAdsService,
  CreateCustomAudienceData,
  FacebookAdAccount,
  FacebookPixel,
  FacebookPage,
} from "../../../services/facebookAdsService";

export function useCreateCustomAudienceState() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [adAccounts, setAdAccounts] = useState<FacebookAdAccount[]>([]);
  const [pixels, setPixels] = useState<FacebookPixel[]>([]);
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);

  // Form data
  const [formData, setFormData] = useState<CreateCustomAudienceData>({
    name: "",
    description: "",
    audienceType: "WEBSITE",
    adAccountId: "",
    customerList: [],
    sourceType: "STORE_CUSTOMERS",
    rawCustomerText: "",
    pixelId: "",
    eventType: "ALL_VISITORS",
    urlContains: "",
    retentionDays: 30,
    pageId: "",
    pageEngagementType: "page_engaged",
    igEngagementType: "ig_business_profile_engaged",
    videoViewDuration: "video_watched_10s",
  });

  const [tosErrorUrl, setTosErrorUrl] = useState<string | null>(null);

  const totalSteps = 3;

  useEffect(() => {
    void loadAllAssets();
  }, []);

  const loadAllAssets = async () => {
    try {
      setLoadingAssets(true);
      const [accounts, fetchedPixels, fetchedPages] = await Promise.all([
        facebookAdsService.getAdAccounts().catch(() => []),
        facebookAdsService.getFacebookPixels().catch(() => []),
        facebookAdsService.getFacebookPages().catch(() => []),
      ]);

      setAdAccounts(accounts || []);
      setPixels(fetchedPixels || []);
      setPages(fetchedPages || []);

      setFormData((prev) => ({
        ...prev,
        adAccountId: prev.adAccountId || accounts?.[0]?.id || "",
        pixelId: prev.pixelId || fetchedPixels?.[0]?.id || "",
        pageId: prev.pageId || fetchedPages?.[0]?.id || "",
      }));
    } catch (error: any) {
      console.error("Error loading advertising assets:", error);
      tToast.error("CreateCustomAudience.failed_load_0ade");
    } finally {
      setLoadingAssets(false);
    }
  };

  const handleInputChange = (
    field: keyof CreateCustomAudienceData,
    value: any,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const parseManualCustomers = (text: string) => {
    const tokens = text.split(/[\n,;\t\r]+/);
    const list: Array<{ email?: string; phone?: string; firstName?: string; lastName?: string }> = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\d+]{8,16}$/;

    tokens.forEach((raw) => {
      const item = raw.trim();
      if (!item) return;
      if (emailRegex.test(item)) {
        list.push({ email: item });
      } else if (phoneRegex.test(item.replace(/[\s-]/g, ""))) {
        list.push({ phone: item.replace(/[\s-]/g, "") });
      } else {
        const parts = item.split(/\s+/);
        list.push({ firstName: parts[0], lastName: parts.slice(1).join(" ") });
      }
    });

    setFormData((prev) => ({
      ...prev,
      customerList: list,
      rawCustomerText: text,
      sourceType: "MANUAL",
    }));

    if (list.length > 0) {
      toast.success(`تم استخراج ${list.length} جهة اتصال بنجاح`);
    } else {
      toast.warning("لم يتم العثور على أرقام أو إيميلات صالحة في النص المدخل");
    }
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;
      const lines = content.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length <= 1) {
        toast.error("الملف فارغ أو لا يحتوي على بيانات كافية");
        return;
      }

      const headers = lines[0].toLowerCase().split(",").map((h) => h.trim().replace(/['"]/g, ""));
      const emailIdx = headers.findIndex((h) => h.includes("email") || h.includes("بريد") || h.includes("mail"));
      const phoneIdx = headers.findIndex((h) => h.includes("phone") || h.includes("هاتف") || h.includes("موبايل") || h.includes("tel"));
      const nameIdx = headers.findIndex((h) => h.includes("name") || h.includes("اسم"));

      const list: Array<{ email?: string; phone?: string; firstName?: string; lastName?: string }> = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim().replace(/['"]/g, ""));
        const email = emailIdx >= 0 ? cols[emailIdx] : "";
        const phone = phoneIdx >= 0 ? cols[phoneIdx] : "";
        const name = nameIdx >= 0 ? cols[nameIdx] : "";
        const names = name ? name.split(" ") : [];

        if (email || phone) {
          list.push({
            email: email || undefined,
            phone: phone || undefined,
            firstName: names[0] || undefined,
            lastName: names.slice(1).join(" ") || undefined,
          });
        }
      }

      setFormData((prev) => ({
        ...prev,
        customerList: list,
        sourceType: "CSV_IMPORT",
      }));
      toast.success(`تم استيراد ${list.length} عميل من ملف CSV بنجاح`);
    };
    reader.readAsText(file);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          toast.error("يرجى إدخال اسم الجمهور المخصص");
          return false;
        }
        if (!formData.audienceType) {
          toast.error("يرجى اختيار نوع الجمهور");
          return false;
        }
        return true;
      case 2:
        if (formData.audienceType === "WEBSITE" && !formData.pixelId) {
          toast.error("يرجى اختيار أو إدخال Pixel ID");
          return false;
        }
        if (
          formData.audienceType === "CUSTOMER_LIST" &&
          formData.sourceType !== "STORE_CUSTOMERS" &&
          (!formData.customerList || formData.customerList.length === 0)
        ) {
          toast.error("يرجى إضافة أو لصق أو رفع بيانات عملاء صالحة");
          return false;
        }
        if (
          (formData.audienceType === "PAGE_ENGAGEMENT" || formData.audienceType === "VIDEO_VIEWS") &&
          !formData.pageId &&
          pages.length === 0
        ) {
          toast.error("يرجى اختيار صفحة فيسبوك");
          return false;
        }
        return true;
      case 3:
        return true; // Review step
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    try {
      setLoading(true);
      setTosErrorUrl(null);
      await facebookAdsService.createCustomAudience(formData);
      tToast.success("CreateCustomAudience.success_create_d55e");
      navigate("/advertising/facebook-ads/audiences");
    } catch (error: any) {
      console.error("Error creating custom audience:", error);
      const resp = error?.response?.data;
      if (resp?.errorCode === "FACEBOOK_CUSTOM_AUDIENCE_TOS_REQUIRED" || resp?.tosUrl) {
        setTosErrorUrl(
          resp.tosUrl ||
            `https://business.facebook.com/ads/manage/customaudiences/tos/?act=${formData.adAccountId}`,
        );
        toast.error("مطلوب قبول شروط الجماهير المخصصة لهذا الحساب لدى Meta أولاً.");
      } else {
        toast.error(resp?.error || "فشل في إنشاء الجمهور");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    navigate,
    currentStep,
    setCurrentStep,
    totalSteps,
    loading,
    adAccounts,
    pixels,
    pages,
    loadingAssets,
    formData,
    setFormData,
    tosErrorUrl,
    setTosErrorUrl,
    handleInputChange,
    parseManualCustomers,
    handleCsvUpload,
    handleNext,
    handlePrevious,
    handleSubmit,
  };
}
