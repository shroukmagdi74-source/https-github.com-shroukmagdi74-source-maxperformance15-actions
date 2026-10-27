import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../../../services/apiClient";
import { useAuth } from "../../../hooks/useAuthSimple";
import { toast } from "sonner";
import {
  type AffiliateSettingsData,
  type ApiSuccess,
  DEFAULT_SETTINGS,
  normalizeSettings,
  validateSettings,
} from "./types";

export function useAffiliateSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<AffiliateSettingsData>({
    ...DEFAULT_SETTINGS,
  });

  const currentCompanyId = user?.companyId || (user as any)?.company?.id;

  const fetchSettings = useCallback(async () => {
    try {
      const response = await apiClient.get<ApiSuccess<AffiliateSettingsData>>(
        "/affiliate-settings",
        {
          headers: {
            "Cache-Control": "no-cache, no-store",
            Pragma: "no-cache",
          },
          params: {
            _t: Date.now(),
          },
        },
      );
      if (response.data.success) {
        setSettings(normalizeSettings(response.data.data));
      }
    } catch (error) {
      console.error("Error fetching affiliate settings:", error);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings, currentCompanyId]);

  const handleToggleAutoApprove = async (nextValue: boolean) => {
    const updatedSettings = {
      ...settings,
      autoApproveAffiliates: nextValue,
      isActive: nextValue ? true : settings.isActive,
    };
    setSettings(updatedSettings);

    try {
      const response = await apiClient.put<
        ApiSuccess<AffiliateSettingsData>,
        AffiliateSettingsData
      >("/affiliate-settings", updatedSettings);

      if (response.data.success) {
        setSettings(normalizeSettings(response.data.data));
        if (nextValue) {
          toast.success("تم تفعيل الموافقة التلقائية على المسوقين الجدد وحفظها بنجاح!");
        } else {
          toast.success("تم تعطيل الموافقة التلقائية (يتطلب الآن موافقة يدوية) وحفظ التعديل!");
        }
      }
    } catch (error: any) {
      setSettings((prev) => ({
        ...prev,
        autoApproveAffiliates: !nextValue,
      }));
      toast.error(
        error.response?.data?.message || "حدث خطأ أثناء حفظ التعديل، يرجى المحاولة ثانية",
      );
    }
  };

  const handleToggleIsActive = async (nextValue: boolean) => {
    const updatedSettings = {
      ...settings,
      isActive: nextValue,
      autoApproveAffiliates: !nextValue ? false : settings.autoApproveAffiliates,
    };
    setSettings(updatedSettings);

    try {
      const response = await apiClient.put<
        ApiSuccess<AffiliateSettingsData>,
        AffiliateSettingsData
      >("/affiliate-settings", updatedSettings);

      if (response.data.success) {
        setSettings(normalizeSettings(response.data.data));
        if (nextValue) {
          toast.success("تم تفعيل نظام تسجيل المسوقين وحفظ التعديل بنجاح!");
        } else {
          toast.success("تم إيقاف نظام تسجيل المسوقين وحفظ التعديل!");
        }
      }
    } catch (error: any) {
      setSettings((prev) => ({
        ...prev,
        isActive: !nextValue,
      }));
      toast.error(
        error.response?.data?.message || "حدث خطأ أثناء حفظ التعديل",
      );
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const validationError = validateSettings(settings);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.put<
        ApiSuccess<AffiliateSettingsData>,
        AffiliateSettingsData
      >("/affiliate-settings", settings);

      if (response.data.success) {
        const recalculatedProducts = Number(
          response.data.recalculatedProducts || 0,
        );
        toast.success(
          recalculatedProducts > 0
            ? `تم تحديث الإعدادات وإعادة حساب ${recalculatedProducts} منتج`
            : "تم تحديث إعدادات نظام المسوقين بنجاح!",
        );
        setSettings(normalizeSettings(response.data.data));
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "حدث خطأ أثناء حفظ الإعدادات",
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    settings,
    setSettings,
    loading,
    fetchSettings,
    handleToggleAutoApprove,
    handleToggleIsActive,
    handleSubmit,
  };
}
