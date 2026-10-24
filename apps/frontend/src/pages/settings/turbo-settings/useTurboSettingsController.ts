import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { apiClient } from "../../../services/apiClient";
import { defaultTurboSettings, TurboSettingsData } from "./types";

export function useTurboSettingsController() {
  const { t: tVal } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = tVal as any;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [settings, setSettings] = useState<TurboSettingsData>(defaultTurboSettings);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/store-settings/turbo");
      if (response.data?.success) {
        const d = response.data.data || {};
        setSettings({
          turboEnabled: d.turboEnabled || false,
          turboAutoCreate: d.turboAutoCreate || false,
          turboApiKey: "",
          turboMainClientCode: d.turboMainClientCode || null,
          turboSenderNumber: d.turboSenderNumber || "",
          turboWebhookUrl: d.turboWebhookUrl || "",
          turboWebhookToken: d.turboWebhookToken || "",
          hasApiKey: d.hasApiKey || false,
          maskedApiKey: d.maskedApiKey || "",
        });
      }
    } catch (error) {
      console.error("Error loading Turbo settings:", error);
      toast.error(t("turbo.k_1"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSettings();
  }, []);

  const handleSave = async () => {
    if (!settings.turboApiKey && !settings.hasApiKey) {
      toast.error(t("turbo.k_2"));
      return;
    }

    if (settings.turboEnabled && !settings.turboApiKey && !settings.hasApiKey) {
      toast.error(t("turbo.k_3"));
      return;
    }

    try {
      setSaving(true);
      const response = await apiClient.put("/store-settings/turbo", {
        turboApiKey: settings.turboApiKey || undefined,
        turboMainClientCode: settings.turboMainClientCode || undefined,
        turboSenderNumber: settings.turboSenderNumber || undefined,
        turboEnabled: settings.turboEnabled,
        turboAutoCreate: settings.turboAutoCreate,
        turboWebhookUrl: settings.turboWebhookUrl || undefined,
        turboWebhookToken: settings.turboWebhookToken || undefined,
      });

      if (response.data?.success) {
        toast.success(t("turbo.k_4"));
        void loadSettings(); // Reload to get updated masked key
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("turbo.k_5"));
      console.error("Error saving Turbo settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!settings.turboApiKey && !settings.hasApiKey) {
      toast.error(t("turbo.k_6"));
      return;
    }

    try {
      setSaving(true);
      const response = await apiClient.post("/turbo/calculate", {
        city: t("turbo.k_7"),
        address: "test",
        items: [{ weight: 1, dimensions: { length: 10, width: 10, height: 10 } }],
      });
      if (response.data?.success) {
        toast.success(t("turbo.k_8"));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || t("turbo.k_9"));
      console.error("Error testing Turbo connection:", error);
    } finally {
      setSaving(false);
    }
  };

  return {
    t,
    navigate,
    loading,
    saving,
    showApiKey,
    setShowApiKey,
    settings,
    setSettings,
    handleSave,
    handleTestConnection,
  };
}
