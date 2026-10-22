import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Settings,
  ShoppingCart,
  Megaphone,
  Bell,
  Briefcase,
  BarChart3,
} from "lucide-react";
import { apiClient, type ApiRequestConfig } from "../../../services/apiClient";
import type {
  NotificationSettings,
  Session,
  Template,
  NoticeTone,
  NoticeState,
  TemplateFormState,
  TabId,
  TabDefinition,
  WhatsAppNotificationsProps,
} from "./types";
import {
  createEmptyTemplateForm,
  SUPER_ADMIN_CATEGORY_SET,
  SUPER_ADMIN_EVENT_TYPE_SET,
} from "./types";

export function useWhatsAppNotificationsController({
  companyId,
  superAdminMode = false,
}: WhatsAppNotificationsProps) {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [notice, setNotice] = useState<NoticeState>(null);

  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [testEventType, setTestEventType] = useState(
    superAdminMode ? "NEW_SIGNUP_WELCOME" : "BACK_IN_STOCK",
  );
  const [sendingTest, setSendingTest] = useState(false);

  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateCategory, setTemplateCategory] = useState("ALL");
  const [templateForm, setTemplateForm] = useState<TemplateFormState>(() =>
    createEmptyTemplateForm(superAdminMode),
  );

  const withCompanyConfig = useCallback(
    (config: ApiRequestConfig = {}) =>
      companyId ? { ...config, _companyId: companyId } : config,
    [companyId],
  );

  const showNotice = useCallback((tone: NoticeTone, message: string) => {
    setNotice({ tone, message });
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timeoutId = window.setTimeout(() => setNotice(null), 4500);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  const fetchSettings = useCallback(async () => {
    const response = await apiClient.get(
      "/whatsapp-notifications/settings",
      withCompanyConfig(),
    );
    setSettings((response as any).data.settings);
    setSessions((response as any).data.sessions || []);
  }, [withCompanyConfig]);

  const fetchTemplates = useCallback(async () => {
    const response = await apiClient.get(
      "/whatsapp-notifications/templates",
      withCompanyConfig(),
    );
    setTemplates((response as any).data.templates || []);
  }, [withCompanyConfig]);

  const refreshPageData = useCallback(async () => {
    try {
      setRefreshing(true);
      setNotice(null);
      await Promise.all([fetchSettings(), fetchTemplates()]);
    } catch {
      showNotice(
        "error",
        i18n.language === "ar"
          ? "تعذر تحديث بيانات الإشعارات حالياً."
          : "Unable to refresh notification data right now.",
      );
    } finally {
      setRefreshing(false);
    }
  }, [fetchSettings, fetchTemplates, i18n.language, showNotice]);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        if (mounted) {
          setLoading(true);
          setNotice(null);
        }
        await Promise.all([fetchSettings(), fetchTemplates()]);
      } catch {
        if (mounted) {
          showNotice(
            "error",
            i18n.language === "ar"
              ? "فشل في تحميل إعدادات إشعارات واتساب."
              : "Failed to load WhatsApp notification settings.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      mounted = false;
    };
  }, [fetchSettings, fetchTemplates, i18n.language, showNotice]);

  const TABS = useMemo<TabDefinition[]>(() => {
    if (superAdminMode) {
      return [
        {
          id: "company",
          label: i18n.language === "ar" ? "تسجيل الشركات" : "Company signup",
          icon: Bell,
        },
      ];
    }

    return [
      { id: "general", label: t("whatsappNotifications.tabs.general"), icon: Settings },
      { id: "products", label: t("whatsappNotifications.tabs.products"), icon: ShoppingCart },
      { id: "marketing", label: t("whatsappNotifications.tabs.marketing"), icon: Megaphone },
      {
        id: "company",
        label: i18n.language === "ar" ? "رحلة الشركة" : "Company journey",
        icon: Bell,
      },
      { id: "hr", label: t("whatsappNotifications.tabs.hr"), icon: Briefcase },
      { id: "tasks", label: "المهام", icon: Briefcase },
      {
        id: "reports",
        label: t("whatsappNotifications.tabs.reports", i18n.language === "ar" ? "التقارير المجدولة" : "Scheduled Reports"),
        icon: BarChart3,
      },
    ];
  }, [i18n.language, superAdminMode, t]);

  const activeTabParam = searchParams.get("tab");
  const activeTab: TabId = TABS.some((tab) => tab.id === activeTabParam)
    ? (activeTabParam as TabId)
    : superAdminMode
      ? "company"
      : "general";

  const handleTabChange = useCallback(
    (tabId: TabId) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("tab", tabId);
        return next;
      });
    },
    [setSearchParams],
  );

  const updateSetting = useCallback(
    <K extends keyof NotificationSettings>(
      key: K,
      value: NotificationSettings[K],
    ) => {
      setSettings((current) => (current ? { ...current, [key]: value } : current));
    },
    [],
  );

  const saveSettings = useCallback(async () => {
    if (!settings) return;

    try {
      setSaving(true);
      await apiClient.put(
        "/whatsapp-notifications/settings",
        settings,
        withCompanyConfig(),
      );
      showNotice(
        "success",
        i18n.language === "ar"
          ? "تم حفظ إعدادات الإشعارات بنجاح."
          : "Notification settings saved successfully.",
      );
    } catch {
      showNotice(
        "error",
        i18n.language === "ar"
          ? "فشل في حفظ إعدادات الإشعارات."
          : "Failed to save notification settings.",
      );
    } finally {
      setSaving(false);
    }
  }, [i18n.language, settings, showNotice, withCompanyConfig]);

  const saveTemplate = useCallback(async () => {
    if (!templateForm.content || !templateForm.eventType) {
      showNotice(
        "error",
        i18n.language === "ar"
          ? "يرجى ملء كل الحقول المطلوبة قبل حفظ القالب."
          : "Please complete all required template fields before saving.",
      );
      return;
    }

    try {
      setSaving(true);

      if (editingTemplate?.id) {
        await apiClient.put(
          `/whatsapp-notifications/templates/${editingTemplate.id}`,
          templateForm,
          withCompanyConfig(),
        );
      } else {
        await apiClient.post(
          "/whatsapp-notifications/templates",
          templateForm,
          withCompanyConfig(),
        );
      }

      showNotice(
        "success",
        i18n.language === "ar"
          ? "تم حفظ القالب بنجاح."
          : "Template saved successfully.",
      );
      setTemplateDialogOpen(false);
      setEditingTemplate(null);
      await fetchTemplates();
    } catch {
      showNotice(
        "error",
        i18n.language === "ar" ? "فشل في حفظ القالب." : "Failed to save template.",
      );
    } finally {
      setSaving(false);
    }
  }, [editingTemplate?.id, fetchTemplates, i18n.language, showNotice, templateForm, withCompanyConfig]);

  const sendTestNotification = useCallback(async () => {
    if (!testPhone.trim()) {
      showNotice(
        "error",
        i18n.language === "ar" ? "يرجى إدخال رقم الهاتف." : "Please enter a phone number.",
      );
      return;
    }

    try {
      setSendingTest(true);
      const response = await apiClient.post(
        "/whatsapp-notifications/test",
        {
          phone: testPhone,
          eventType: testEventType,
        },
        withCompanyConfig(),
      );
      showNotice(
        "success",
        (response as any).data?.message ||
          (i18n.language === "ar"
            ? "تم إرسال الإشعار الاختباري بنجاح."
            : "Test notification sent successfully."),
      );
      setTestDialogOpen(false);
    } catch (err: unknown) {
      const responseData =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: unknown }).response === "object" &&
        (err as { response?: { data?: unknown } }).response !== null
          ? (err as { response?: { data?: { message?: string; error?: string } } })
              .response?.data
          : undefined;
      showNotice(
        "error",
        responseData?.message ||
          responseData?.error ||
          (i18n.language === "ar"
            ? "فشل في إرسال الإشعار الاختباري."
            : "Failed to send the test notification."),
      );
    } finally {
      setSendingTest(false);
    }
  }, [i18n.language, showNotice, testEventType, testPhone, withCompanyConfig]);

  useEffect(() => {
    if (editingTemplate) {
      setTemplateForm({
        name: editingTemplate.name || "",
        category: editingTemplate.category || (superAdminMode ? "CUSTOMER" : "PRODUCTS"),
        eventType: editingTemplate.eventType || "",
        content: editingTemplate.content || "",
        isActive: editingTemplate.isActive ?? true,
      });
      return;
    }
    setTemplateForm(createEmptyTemplateForm(superAdminMode));
  }, [editingTemplate, superAdminMode, templateDialogOpen]);

  const connectedSessions = useMemo(
    () => sessions.filter((s) => s.status === "CONNECTED").length,
    [sessions],
  );

  const enabledModules = useMemo(() => {
    if (superAdminMode) {
      return [settings?.companyLifecycleNotificationsEnabled].filter(Boolean).length;
    }
    return [
      settings?.orderNotificationsEnabled,
      settings?.productNotificationsEnabled,
      settings?.abandonedCartEnabled,
      settings?.marketingNotificationsEnabled,
      settings?.companyLifecycleNotificationsEnabled,
      settings?.hrNotificationsEnabled,
    ].filter(Boolean).length;
  }, [settings, superAdminMode]);

  const currentSession = useMemo(
    () => sessions.find((s) => s.id === settings?.defaultSessionId),
    [sessions, settings?.defaultSessionId],
  );

  return {
    t,
    i18n,
    loading,
    refreshing,
    saving,
    settings,
    sessions,
    templates,
    notice,
    setNotice,
    testDialogOpen,
    setTestDialogOpen,
    testPhone,
    setTestPhone,
    testEventType,
    setTestEventType,
    sendingTest,
    templateDialogOpen,
    setTemplateDialogOpen,
    editingTemplate,
    setEditingTemplate,
    templateSearch,
    setTemplateSearch,
    templateCategory,
    setTemplateCategory,
    templateForm,
    setTemplateForm,
    TABS,
    activeTab,
    handleTabChange,
    connectedSessions,
    enabledModules,
    currentSession,
    refreshPageData,
    saveSettings,
    saveTemplate,
    sendTestNotification,
    updateSetting,
  };
}
