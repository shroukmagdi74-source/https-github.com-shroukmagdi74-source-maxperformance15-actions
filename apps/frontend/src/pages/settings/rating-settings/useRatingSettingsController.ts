import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CustomerRatingHealthData,
  returnService,
} from "../../../services/returnService";
import { tToast } from "../../../utils/i18n-toast";
import { defaultRatingSettings, RatingSettings } from "./types";

export function useRatingSettingsController() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [healthData, setHealthData] = useState<CustomerRatingHealthData | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [settings, setSettings] = useState<RatingSettings>(defaultRatingSettings);

  const fetchSettingsAndHealth = async () => {
    setLoading(true);
    try {
      const [settingsRes, healthRes] = await Promise.allSettled([
        returnService.getSettings(),
        returnService.getRatingHealth(),
      ]);

      if (settingsRes.status === "fulfilled") {
        const res = settingsRes.value;
        setSettings({
          excellentThreshold: res.data.excellentThreshold ?? 90,
          goodThreshold: res.data.goodThreshold ?? 75,
          averageThreshold: (res.data as any).averageThreshold ?? 50,
          minOrdersForRating: res.data.minOrdersForRating ?? 3,
          autoApproveExcellent: res.data.autoApproveExcellent ?? false,
          autoRejectBad: res.data.autoRejectBad ?? false,
        });
      }

      if (healthRes.status === "fulfilled" && healthRes.value.data?.data) {
        setHealthData(healthRes.value.data.data);
      }
    } catch (error) {
      console.error("Failed to load rating settings or health:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSettingsAndHealth();
  }, []);

  const refreshHealthReport = async () => {
    setLoadingHealth(true);
    try {
      const res = await returnService.getRatingHealth();
      if (res.data?.data) {
        setHealthData(res.data.data);
      }
    } catch (e) {
      console.warn("Failed to refresh health report:", e);
    } finally {
      setLoadingHealth(false);
    }
  };

  const validateSequence = () => {
    const avg = Number(settings.averageThreshold);
    const good = Number(settings.goodThreshold);
    const exc = Number(settings.excellentThreshold);
    const minOrders = Number(settings.minOrdersForRating);

    if (isNaN(avg) || isNaN(good) || isNaN(exc) || isNaN(minOrders)) {
      return "جميع قيم العتبات والحد الأدنى للطلبات يجب أن تكون أرقاماً صالحة";
    }
    if (avg < 0 || avg > 100 || good < 0 || good > 100 || exc < 0 || exc > 100) {
      return "نسب التقييم يجب أن تكون بين 0% و 100%";
    }
    if (avg >= good) {
      return "نسبة التقييم المتوسط يجب أن تكون أقل من نسبة التقييم الجيد (متوسط < جيد)";
    }
    if (good >= exc) {
      return "نسبة التقييم الجيد يجب أن تكون أقل من نسبة التقييم الممتاز (جيد < ممتاز)";
    }
    if (minOrders < 1) {
      return "الحد الأدنى للطلبات يجب أن يكون 1 على الأقل";
    }
    return null;
  };

  const validationError = validateSequence();

  const handleSave = async () => {
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSaving(true);
    try {
      await returnService.updateSettings(settings);
      tToast.success("RatingSettingsManager.success_save_3111");
      // Refresh health report in background after recalculation begins
      setTimeout(() => {
        void refreshHealthReport();
      }, 1000);
    } catch (error: any) {
      const msg = error.response?.data?.error || error.response?.data?.message;
      if (msg) {
        toast.error(msg);
      } else {
        tToast.error("RatingSettingsManager.failed_save_dfaf");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: keyof RatingSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return {
    loading,
    saving,
    healthData,
    loadingHealth,
    settings,
    setSettings,
    validationError,
    handleSave,
    handleChange,
    refreshHealthReport,
  };
}
