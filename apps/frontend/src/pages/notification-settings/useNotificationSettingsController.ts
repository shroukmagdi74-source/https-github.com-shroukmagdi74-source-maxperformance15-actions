import { useEffect, useMemo, useState } from "react";
import api from "@/services/api";
import { useAuth } from "@/hooks/useAuthSimple";
import {
  getBrowserNotificationPermission,
  isBrowserNotificationSupported,
  requestBrowserNotificationPermission,
  showBrowserNotification,
  type BrowserNotificationPermissionState,
} from "@/utils/browserNotifications";
import {
  cacheNotificationSettings,
  type NotificationChannelId,
  type NotificationSettingsData,
} from "@/utils/notificationSettings";
import {
  type FeedbackState,
  type NotificationStats,
  type NotificationType,
  type SettingsTab,
  buildDefaultTypePreference,
  cloneSettings,
  createNormalizedSettings,
} from "./types";

export const useNotificationSettingsController = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [settings, setSettings] = useState<NotificationSettingsData | null>(null);
  const [savedSettings, setSavedSettings] =
    useState<NotificationSettingsData | null>(null);
  const [notificationTypes, setNotificationTypes] = useState<NotificationType[]>(
    [],
  );
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [browserPermission, setBrowserPermission] =
    useState<BrowserNotificationPermissionState>(
      getBrowserNotificationPermission(),
    );
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  const userId = user?.id ? String(user.id) : "";
  const companyId = user?.companyId || user?.company?.id || "1";
  const userEmail = user?.email || "";
  const userTimezone = user?.timezone || "Africa/Cairo";

  const hasUnsavedChanges = useMemo(() => {
    if (!settings || !savedSettings) {
      return false;
    }

    return JSON.stringify(settings) !== JSON.stringify(savedSettings);
  }, [savedSettings, settings]);

  useEffect(() => {
    setBrowserPermission(getBrowserNotificationPermission());
  }, []);

  const refreshBrowserPermissionState = () => {
    const nextPermission = getBrowserNotificationPermission();
    setBrowserPermission(nextPermission);
    return nextPermission;
  };

  useEffect(() => {
    if (authLoading || !userId) {
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setLoadError(null);

        const [settingsResponse, typesResponse, statsResponse] =
          await Promise.all([
            api.get(`/notifications/settings/${userId}`),
            api.get(`/notifications/types`, {
              params: { companyId },
            }),
            api.get(`/notifications/stats/${userId}`),
          ]);

        const fetchedTypes = Array.isArray(typesResponse.data?.data)
          ? (typesResponse.data.data as NotificationType[])
          : [];
        const normalizedSettings = createNormalizedSettings({
          rawSettings: settingsResponse.data?.data,
          notificationTypes: fetchedTypes,
          userId,
          companyId,
          email: userEmail,
          timezone: userTimezone,
        });

        setNotificationTypes(fetchedTypes);
        setSettings(normalizedSettings);
        setSavedSettings(cloneSettings(normalizedSettings));
        cacheNotificationSettings(normalizedSettings);
        setStats((statsResponse.data?.data as NotificationStats) || null);
      } catch (error) {
        console.error("Error loading notification settings page:", error);
        setLoadError("تعذر تحميل إعدادات الإشعارات الآن. حاول مرة أخرى.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [authLoading, companyId, userEmail, userId, userTimezone]);

  const updateSettings = (path: string, value: unknown) => {
    setSettings((previousSettings) => {
      if (!previousSettings) {
        return previousSettings;
      }

      const nextSettings = cloneSettings(previousSettings);
      const keys = path.split(".");
      let current: Record<string, unknown> = nextSettings as Record<
        string,
        unknown
      >;

      for (let index = 0; index < keys.length - 1; index += 1) {
        current = current[keys[index]] as Record<string, unknown>;
      }

      current[keys[keys.length - 1]] = value;
      return nextSettings;
    });
  };

  const getTypePreference = (type: NotificationType) =>
    settings?.typeSettings[type.id] || buildDefaultTypePreference(type);

  const handleToggleTypeEnabled = (type: NotificationType, enabled: boolean) => {
    updateSettings(`typeSettings.${type.id}.enabled`, enabled);
  };

  const handleToggleTypeChannel = (
    type: NotificationType,
    channel: NotificationChannelId,
    checked: boolean,
  ) => {
    const currentChannels = getTypePreference(type).channels;
    const nextChannels = checked
      ? Array.from(new Set([...currentChannels, channel]))
      : currentChannels.filter((currentChannel) => currentChannel !== channel);

    updateSettings(`typeSettings.${type.id}.channels`, nextChannels);
  };

  const handleBrowserChannelToggle = async (enabled: boolean) => {
    if (!enabled) {
      updateSettings("channels.browser.enabled", false);
      setFeedback({
        type: "info",
        message: "تم إيقاف إشعارات المتصفح.",
      });
      return;
    }

    if (!isBrowserNotificationSupported()) {
      setBrowserPermission("unsupported");
      setFeedback({
        type: "error",
        message: "هذا المتصفح لا يدعم إشعارات النظام.",
      });
      return;
    }

    let permission = getBrowserNotificationPermission();
    if (permission === "default") {
      permission = await requestBrowserNotificationPermission();
    }

    setBrowserPermission(permission);

    if (permission !== "granted") {
      setFeedback({
        type: "error",
        message:
          permission === "denied"
            ? "تم رفض إذن إشعارات المتصفح. فعّله من إعدادات المتصفح أولاً."
            : "لا يمكن تفعيل إشعارات المتصفح قبل منح الإذن.",
      });
      return;
    }

    updateSettings("channels.browser.enabled", true);

    setFeedback({
      type: "success",
      message: "تم تفعيل إشعارات المتصفح بنجاح.",
    });
  };

  const handleRequestBrowserPermission = async () => {
    const currentPermission = refreshBrowserPermissionState();

    if (currentPermission === "unsupported") {
      setFeedback({
        type: "error",
        message: "هذا المتصفح لا يدعم إشعارات النظام.",
      });
      return;
    }

    if (currentPermission === "granted") {
      setFeedback({
        type: "success",
        message: "إذن إشعارات المتصفح مفعّل بالفعل.",
      });
      return;
    }

    if (currentPermission === "denied") {
      setFeedback({
        type: "info",
        message:
          "الإذن مرفوض لهذا الموقع. اسمح بالإشعارات من إعدادات المتصفح أو إعدادات الموقع، ثم اضغط تحديث الحالة وبعدها احفظ الإعدادات.",
      });
      return;
    }

    const permission = await requestBrowserNotificationPermission();
    setBrowserPermission(permission);

    setFeedback({
      type: permission === "granted" ? "success" : "info",
      message:
        permission === "granted"
          ? "تم منح إذن إشعارات المتصفح."
          : permission === "denied"
            ? "تم رفض إذن إشعارات المتصفح. فعّله من إعدادات المتصفح ثم حدّث الحالة."
            : "إذن إشعارات المتصفح لم يتغير.",
    });
  };

  const handleSaveSettings = async () => {
    if (!settings || !userId) {
      return;
    }

    try {
      setSaving(true);
      setFeedback(null);

      const response = await api.put(`/notifications/settings/${userId}`, settings);
      const normalizedResponse = createNormalizedSettings({
        rawSettings: response.data?.data,
        notificationTypes,
        userId,
        companyId,
        email: userEmail,
        timezone: userTimezone,
      });

      setSettings(normalizedResponse);
      setSavedSettings(cloneSettings(normalizedResponse));
      cacheNotificationSettings(normalizedResponse);
      setFeedback({
        type: "success",
        message: "تم حفظ إعدادات الإشعارات بنجاح.",
      });
    } catch (error) {
      console.error("Error saving notification settings:", error);
      setFeedback({
        type: "error",
        message: "فشل حفظ الإعدادات. حاول مرة أخرى.",
      });
    } finally {
      setSaving(false);
    }
  };

  const getPreferredTestChannel = (type: NotificationType) => {
    const channels = getTypePreference(type).channels;
    const canUseBrowserForTest =
      settings?.channels.browser.enabled && browserPermission === "granted";

    if (channels.includes("browser") && canUseBrowserForTest) {
      return "browser";
    }

    const nonBrowserChannel = channels.find((channel) => channel !== "browser");
    return nonBrowserChannel || channels[0] || type.channels[0] || "inApp";
  };

  const handleTestNotification = async (type: NotificationType) => {
    const channel = getPreferredTestChannel(type);

    try {
      await api.post("/notifications/test", {
        userId,
        testConfig: {
          type: type.id,
          channel,
          message: "هذا إشعار تجريبي",
        },
      });

      if (channel === "browser") {
        const shown = showBrowserNotification({
          title: "تجربة إشعار المتصفح",
          body: `تم اختبار إشعار ${type.name} بنجاح`,
          tag: "notification-settings-test",
          requireInteraction:
            settings?.channels.browser.requireInteraction ?? false,
        });

        if (!shown) {
          setFeedback({
            type: "info",
            message:
              "تم إرسال الطلب التجريبي لكن إشعار المتصفح لم يظهر لأن الإذن غير مُفعّل.",
          });
          return;
        }
      }

      setFeedback({
        type: "success",
        message: `تم إرسال اختبار ${type.name} بنجاح.`,
      });
    } catch (error) {
      console.error("Error testing notification:", error);
      setFeedback({
        type: "error",
        message:
          (error as { response?: { data?: { error?: string } } })?.response?.data
            ?.error || "فشل إرسال الإشعار التجريبي.",
      });
    }
  };

  const browserPermissionLabel = useMemo(() => {
    switch (browserPermission) {
      case "granted":
        return {
          label: "مفعل",
          className: "bg-green-50 text-green-700 border-green-100",
        };
      case "denied":
        return {
          label: "مرفوض",
          className: "bg-red-50 text-red-700 border-red-100",
        };
      case "default":
        return {
          label: "بانتظار الإذن",
          className: "bg-amber-50 text-amber-700 border-amber-100",
        };
      default:
        return {
          label: "غير مدعوم",
          className: "bg-gray-100 text-gray-700 border-gray-200",
        };
    }
  }, [browserPermission]);

  const browserNotificationStatusLabel = useMemo(() => {
    if (!isBrowserNotificationSupported()) {
      return {
        label: "غير مدعوم",
        className: "bg-gray-100 text-gray-700 border-gray-200",
      };
    }

    if (!settings?.channels.browser.enabled) {
      return {
        label: "متوقف",
        className: "bg-gray-100 text-gray-700 border-gray-200",
      };
    }

    if (browserPermission === "granted") {
      return {
        label: "مفعّل",
        className: "bg-green-50 text-green-700 border-green-100",
      };
    }

    if (browserPermission === "denied") {
      return {
        label: "محظور بالمتصفح",
        className: "bg-red-50 text-red-700 border-red-100",
      };
    }

    return {
      label: "بانتظار منح الإذن",
      className: "bg-amber-50 text-amber-700 border-amber-100",
    };
  }, [browserPermission, settings?.channels.browser.enabled]);

  const browserPermissionAction = useMemo(() => {
    if (browserPermission === "granted") {
      return null;
    }

    if (browserPermission === "denied") {
      return {
        label: "تحديث حالة الإذن",
        helper:
          "الإذن مرفوض الآن. افتح إعدادات الموقع في المتصفح وغيّر Notifications إلى Allow، ثم ارجع واضغط تحديث الحالة.",
      };
    }

    if (browserPermission === "unsupported") {
      return {
        label: "التحقق من الدعم",
        helper: "هذا المتصفح لا يدعم إشعارات النظام المباشرة.",
      };
    }

    return {
      label: "طلب إذن المتصفح",
      helper:
        "إذا لم تمنح إذن المتصفح بعد، اطلب الإذن أولًا لتصلك تنبيهات الطلبات والرسائل الجديدة فوراً.",
    };
  }, [browserPermission]);

  return {
    settings,
    savedSettings,
    notificationTypes,
    stats,
    loading: authLoading || loading,
    saving,
    loadError,
    feedback,
    browserPermission,
    activeTab,
    setActiveTab,
    hasUnsavedChanges,
    browserPermissionLabel,
    browserNotificationStatusLabel,
    browserPermissionAction,
    updateSettings,
    getTypePreference,
    handleToggleTypeEnabled,
    handleToggleTypeChannel,
    handleBrowserChannelToggle,
    handleRequestBrowserPermission,
    handleSaveSettings,
    handleTestNotification,
  };
};
