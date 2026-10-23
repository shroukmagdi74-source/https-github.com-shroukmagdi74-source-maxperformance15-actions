import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { apiClient, type ApiRequestConfig } from "../../../services/apiClient";
import {
  CATEGORY_EVENT_MAP,
  CATEGORY_VARIABLES,
  createEmptyTemplateForm,
  MetaSessionOption,
  NoticeTone,
  SUPER_ADMIN_CATEGORY_SET,
  SUPER_ADMIN_EVENT_TYPE_SET,
  Template,
  TemplateFormState,
  WhatsAppTemplatesProps,
} from "./types";

export function useWhatsAppTemplatesController({
  companyId,
  companyName,
  superAdminMode = false,
}: WhatsAppTemplatesProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [metaPickerOpen, setMetaPickerOpen] = useState(false);

  const isArabic = i18n.language === "ar";

  const CATEGORY_LABELS = useMemo(() => {
    const translatedSystemLabel = t("common.system");
    const systemLabel =
      translatedSystemLabel && translatedSystemLabel !== "common.system"
        ? translatedSystemLabel
        : isArabic
          ? "النظام"
          : "System";

    return {
      PRODUCTS: t("whatsappNotifications.tabs.products"),
      CUSTOMER: isArabic ? "العملاء" : "Customers",
      MARKETING: t("whatsappNotifications.tabs.marketing"),
      ABANDONED_CART: t("whatsappNotifications.tabs.abandonedCart"),
      HR: t("whatsappNotifications.tabs.hr"),
      SYSTEM: systemLabel,
    };
  }, [isArabic, t]);

  const EVENT_LABELS = useMemo(
    () => ({
      BACK_IN_STOCK: t("whatsappNotifications.products.backInStock"),
      PRICE_DROP: t("whatsappNotifications.products.priceDrop"),
      NEW_PRODUCT: t("whatsappNotifications.products.newProduct"),
      CART_ABANDONED_1H: t("whatsappNotifications.abandonedCart.firstReminder"),
      CART_ABANDONED_24H: t("whatsappNotifications.abandonedCart.secondReminder"),
      CART_ABANDONED_72H: t("whatsappNotifications.abandonedCart.thirdReminder"),
      CART_ABANDONED_WITH_DISCOUNT: t(
        "whatsappNotifications.abandonedCart.incentiveDiscount",
      ),
      PROMOTIONAL: t("whatsappNotifications.marketing.promotional"),
      COUPON_SENT: t("whatsappNotifications.marketing.coupons"),
      BIRTHDAY_WISH: t("whatsappNotifications.marketing.birthday"),
      LOYALTY_POINTS_AWARDED: isArabic
        ? "إشعار كسب نقاط ولاء"
        : "Loyalty points awarded",
      LOYALTY_TIER_UPGRADED: isArabic
        ? "الترقية لمستوى أعلى"
        : "Loyalty tier upgrade",
      LOYALTY_TIER_DOWNGRADED: isArabic
        ? "انخفاض مستوى الولاء"
        : "Loyalty tier downgrade",
      LOYALTY_POINTS_EXPIRY_WARNING: isArabic
        ? "تنبيه قرب انتهاء النقاط"
        : "Points expiry warning",
      LOYALTY_POINTS_EXPIRED: isArabic
        ? "انتهاء صلاحية النقاط"
        : "Loyalty points expired",
      LOYALTY_POINTS_REDEEMED: isArabic
        ? "استبدال النقاط"
        : "Loyalty points redeemed",
      CASHBACK_CREDITED: isArabic ? "ايداع كاش باك" : "Cashback credited",
      CASHBACK_REVERSED: isArabic ? "خصم كاش باك" : "Cashback reversed",
      CUSTOMER_QUALITY_UPGRADED: isArabic
        ? "ارتفاع تصنيف الجودة"
        : "Customer quality upgrade",
      CUSTOMER_QUALITY_DOWNGRADED: isArabic
        ? "انخفاض تصنيف الجودة"
        : "Customer quality downgrade",
      REVIEW_REQUEST: isArabic
        ? "طلب تقييم بعد الاستلام"
        : "Post-delivery review request",
      AUTO_DISCOUNT_COUPON_GRANTED: isArabic
        ? "منح كوبون الخصم التلقائي"
        : "Auto-discount coupon granted",
      AUTO_DISCOUNT_COUPON_EXPIRING: isArabic
        ? "تنبيه قرب انتهاء كوبون الخصم"
        : "Auto-discount coupon expiring",
      AUTO_DISCOUNT_CASHBACK_CONVERTED: isArabic
        ? "تحويل الكوبون المنتهي إلى كاش باك"
        : "Expired coupon converted to cashback",
      CADENCE_PRODUCT: isArabic
        ? "دورية: ترشيح منتج جديد (كل 10 أيام)"
        : "Cadence: New product (every 10 days)",
      CADENCE_BALANCE: isArabic
        ? "دورية: تحديث الرصيد (كل 15 يوم)"
        : "Cadence: Balance update (every 15 days)",
      CADENCE_REFERRAL: isArabic
        ? "دورية: تذكير الإحالة (كل 30 يوم)"
        : "Cadence: Referral reminder (every 30 days)",
      CADENCE_TIER: isArabic
        ? "دورية: تذكير المستوى (كل 30 يوم)"
        : "Cadence: Tier reminder (every 30 days)",
      NEW_SIGNUP_WELCOME: isArabic
        ? "رسالة ترحيب بعد التسجيل"
        : "Welcome after signup",
      NEW_SIGNUP_ADMIN_ALERT: isArabic
        ? "تنبيه الإدارة بتسجيل جديد"
        : "Admin alert for new signup",
      SUBSCRIPTION_CREATED: isArabic
        ? "تأكيد إنشاء الاشتراك"
        : "Subscription created",
      SUBSCRIPTION_RENEWED: isArabic
        ? "تجديد الاشتراك"
        : "Subscription renewed",
      SUBSCRIPTION_CANCELLED: isArabic
        ? "إلغاء الاشتراك"
        : "Subscription cancelled",
      NEWSLETTER_SUBSCRIBED: isArabic
        ? "تأكيد الاشتراك في النشرة"
        : "Newsletter subscribed",
      BENEFIT_GRANTED: isArabic ? "إشعار المزايا" : "Benefit granted",
      ATTENDANCE_REMINDER: t("whatsappNotifications.hr.attendance"),
      ATTENDANCE_CONFIRMED: t("whatsappNotifications.hr.attendanceConfirmed"),
      CHECKOUT_CONFIRMED: t("whatsappNotifications.hr.checkoutConfirmed"),
      LEAVE_APPROVED: t("whatsappNotifications.hr.leave"),
      LEAVE_REJECTED: t("whatsappNotifications.hr.leave"),
      PERMISSION_APPROVED: t("whatsappNotifications.hr.permission"),
      PERMISSION_REJECTED: t("whatsappNotifications.hr.permission"),
      MANUAL_DEDUCTION: t("whatsappNotifications.hr.deduction"),
      PAYROLL_READY: t("whatsappNotifications.hr.payroll"),
      BIRTHDAY_EMPLOYEE: t("whatsappNotifications.hr.birthday"),
      WARNING_ISSUED: t("whatsappNotifications.hr.warnings"),
      ANNOUNCEMENT: t("whatsappNotifications.marketing.promotional"),
      OTP: isArabic ? "كود تسجيل الدخول عبر واتساب" : "WhatsApp login code",
    }),
    [isArabic, t],
  );

  const availableCategoryEntries = useMemo(
    () =>
      Object.entries(CATEGORY_LABELS).filter(
        ([key]) => !superAdminMode || SUPER_ADMIN_CATEGORY_SET.has(key),
      ),
    [CATEGORY_LABELS, superAdminMode],
  );

  const availableEventEntries = useMemo(
    () =>
      Object.entries(EVENT_LABELS).filter(
        ([key]) => !superAdminMode || SUPER_ADMIN_EVENT_TYPE_SET.has(key),
      ),
    [EVENT_LABELS, superAdminMode],
  );

  const defaultCategory = (() => {
    const param = searchParams.get("category");
    if (param && param !== "ORDERS") return param;
    return "ALL";
  })();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);

  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateCategory, setTemplateCategory] = useState(defaultCategory);
  const [metaSubCategory, setMetaSubCategory] = useState<string>("ALL");
  const [templateForm, setTemplateForm] = useState<TemplateFormState>(() =>
    createEmptyTemplateForm(superAdminMode),
  );

  const [metaSessions, setMetaSessions] = useState<MetaSessionOption[]>([]);
  const [selectedMetaSession, setSelectedMetaSession] = useState("");
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const metaCategoryCounts = useMemo(() => {
    const metaList = templates.filter(
      (tpl) =>
        Boolean(tpl.metaTemplateName) ||
        String(tpl.channel || "").toUpperCase() === "META_CLOUD",
    );
    const counts: Record<string, number> = { ALL: metaList.length };
    for (const tpl of metaList) {
      counts[tpl.category] = (counts[tpl.category] || 0) + 1;
    }
    return counts;
  }, [templates]);

  const dialogEventEntries = useMemo(() => {
    const allowed = templateForm.category
      ? CATEGORY_EVENT_MAP[templateForm.category]
      : null;
    if (!allowed || allowed.length === 0) return availableEventEntries;
    const allowedSet = new Set(allowed);
    return availableEventEntries.filter(([key]) => allowedSet.has(key));
  }, [availableEventEntries, templateForm.category]);

  const activeCategoryVars = useMemo(() => {
    return (
      CATEGORY_VARIABLES[templateForm.category] ||
      CATEGORY_VARIABLES.CUSTOMER ||
      []
    );
  }, [templateForm.category]);

  const insertVariable = useCallback((varText: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setTemplateForm((prev) => ({
        ...prev,
        content: (prev.content || "") + " " + varText,
      }));
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const val = templateForm.content || "";
    const nextVal = val.substring(0, start) + varText + val.substring(end);
    setTemplateForm((prev) => ({ ...prev, content: nextVal }));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + varText.length, start + varText.length);
    }, 0);
  }, [templateForm.content]);

  const pageTitle = companyName
    ? `${t("whatsappNotifications.tabs.templates")} · ${companyName}`
    : t("whatsappNotifications.tabs.templates");

  const pageDescription = superAdminMode
    ? isArabic
      ? "أدر قوالب رسائل تسجيل الشركات والاشتراك التي تخص السوبر أدمن من مساحة واحدة."
      : "Manage platform-owned company signup and subscription WhatsApp message templates."
    : isArabic
      ? "تحكم في قوالب الرسائل الآلية وسلوك الإرسال عبر واتساب من مساحة واحدة."
      : "Control automation message templates and operational WhatsApp notification behavior from one workspace.";

  const withCompanyConfig = useCallback(
    (config: ApiRequestConfig = {}) =>
      companyId ? { ...config, _companyId: companyId } : config,
    [companyId],
  );

  const showNotice = useCallback((tone: NoticeTone, message: string) => {
    if (tone === "success") toast.success(message);
    else if (tone === "error") toast.error(message);
    else if (tone === "warning") toast.warning(message);
    else toast(message);
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await apiClient.get(
        "/whatsapp-notifications/templates",
        withCompanyConfig({ params: { includeOrders: true } }),
      );
      setTemplates((response as any).data.templates || []);
    } catch (error) {
      console.error("Error loading WhatsApp templates:", error);
      showNotice(
        "error",
        isArabic ? "فشل في تحميل القوالب." : "Failed to load templates.",
      );
    }
  }, [withCompanyConfig, isArabic, showNotice]);

  const fetchMetaSessions = useCallback(async () => {
    try {
      const res = await apiClient.get(
        "/whatsapp/sessions",
        withCompanyConfig(),
      );
      const list: MetaSessionOption[] = (res as any).data?.sessions || [];
      const cloudSessions = list.filter((s) => s.provider === "META_CLOUD");
      setMetaSessions(cloudSessions);
      if (cloudSessions.length > 0 && cloudSessions[0] && !selectedMetaSession) {
        setSelectedMetaSession(cloudSessions[0].id);
      }
    } catch {
      /* ignore */
    }
  }, [withCompanyConfig, selectedMetaSession]);

  const publishToMeta = useCallback(
    async (templateId: string) => {
      if (!selectedMetaSession) {
        showNotice(
          "warning",
          isArabic ? "اختر جلسة ميتا أولاً" : "Select a Meta session first",
        );
        return;
      }
      setPublishingId(templateId);
      try {
        await apiClient.post(
          `/whatsapp-notifications/templates/${templateId}/publish`,
          { sessionId: selectedMetaSession },
          withCompanyConfig(),
        );
        showNotice(
          "success",
          isArabic
            ? "تم إرسال القالب لميتا للمراجعة"
            : "Template sent to Meta for review",
        );
        await fetchTemplates();
      } catch (error: unknown) {
        const err = error as {
          response?: { data?: { error?: string } };
          message?: string;
        };
        showNotice(
          "error",
          isArabic
            ? `فشل النشر: ${err.response?.data?.error || err.message}`
            : `Publish failed: ${err.response?.data?.error || err.message}`,
        );
      } finally {
        setPublishingId(null);
      }
    },
    [
      selectedMetaSession,
      withCompanyConfig,
      isArabic,
      showNotice,
      fetchTemplates,
    ],
  );

  const refreshPageData = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchTemplates();
      await fetchMetaSessions();
    } catch (error) {
      console.error("Error refreshing WhatsApp templates:", error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchTemplates, fetchMetaSessions]);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        if (mounted) {
          setLoading(true);
        }
        await fetchTemplates();
        await fetchMetaSessions();
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
  }, [fetchTemplates, fetchMetaSessions]);

  // Sync category state with searchParams
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (
      categoryParam &&
      categoryParam !== "ORDERS" &&
      categoryParam !== templateCategory
    ) {
      setTemplateCategory(categoryParam);
    }
  }, [searchParams, templateCategory]);

  const handleCategoryChange = useCallback(
    (val: string) => {
      setTemplateCategory(val);
      setSearchParams((prev) => {
        if (val === "ALL") prev.delete("category");
        else prev.set("category", val);
        return prev;
      });
    },
    [setSearchParams],
  );

  useEffect(() => {
    if (editingTemplate) {
      setTemplateForm({
        name: editingTemplate.name || "",
        category:
          editingTemplate.category || (superAdminMode ? "CUSTOMER" : "PRODUCTS"),
        eventType: editingTemplate.eventType || "",
        content: editingTemplate.content || "",
        isActive: editingTemplate.isActive ?? true,
        channel:
          (editingTemplate.channel as "AUTO" | "BAILEYS" | "META_CLOUD") ||
          "AUTO",
        metaTemplateName: editingTemplate.metaTemplateName || "",
      });
      return;
    }

    setTemplateForm(createEmptyTemplateForm(superAdminMode));
  }, [editingTemplate, superAdminMode, templateDialogOpen]);

  useEffect(() => {
    if (
      superAdminMode &&
      templateCategory !== "ALL" &&
      !SUPER_ADMIN_CATEGORY_SET.has(templateCategory)
    ) {
      handleCategoryChange("ALL");
    }
  }, [superAdminMode, templateCategory, handleCategoryChange]);

  const saveTemplate = useCallback(async () => {
    if (!templateForm.content || !templateForm.eventType) {
      showNotice(
        "error",
        isArabic
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
        isArabic ? "تم حفظ القالب بنجاح." : "Template saved successfully.",
      );
      setTemplateDialogOpen(false);
      setEditingTemplate(null);
      await fetchTemplates();
    } catch (error) {
      console.error("Error saving template:", error);
      showNotice(
        "error",
        isArabic ? "فشل في حفظ القالب." : "Failed to save template.",
      );
    } finally {
      setSaving(false);
    }
  }, [
    editingTemplate?.id,
    fetchTemplates,
    isArabic,
    showNotice,
    templateForm,
    withCompanyConfig,
  ]);

  const openCreateTemplateDialog = useCallback(() => {
    setEditingTemplate(null);
    const initialCategory =
      templateCategory !== "ALL"
        ? templateCategory
        : superAdminMode
          ? "CUSTOMER"
          : "PRODUCTS";
    const initialEvent = CATEGORY_EVENT_MAP[initialCategory]?.[0] || "";
    setTemplateForm({
      name: "",
      category: initialCategory,
      eventType: initialEvent,
      content: "",
      isActive: true,
      channel: "AUTO",
      metaTemplateName: "",
    });
    setTemplateDialogOpen(true);
  }, [superAdminMode, templateCategory]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      // META category view
      if (templateCategory === "META") {
        const isMeta =
          Boolean(template.metaTemplateName) ||
          String(template.channel || "").toUpperCase() === "META_CLOUD";
        if (!isMeta) return false;

        if (metaSubCategory !== "ALL" && template.category !== metaSubCategory) {
          return false;
        }

        const matchSearch =
          templateSearch.trim() === "" ||
          (template.name &&
            template.name.toLowerCase().includes(templateSearch.toLowerCase())) ||
          (template.metaTemplateName &&
            template.metaTemplateName
              .toLowerCase()
              .includes(templateSearch.toLowerCase())) ||
          (template.eventType &&
            template.eventType
              .toLowerCase()
              .includes(templateSearch.toLowerCase())) ||
          (template.content &&
            template.content
              .toLowerCase()
              .includes(templateSearch.toLowerCase()));

        return matchSearch;
      }

      // Exclude ORDERS from this general automation view (managed in status templates)
      if (template.category === "ORDERS") return false;

      const matchSearch =
        templateSearch.trim() === "" ||
        (template.name &&
          template.name.toLowerCase().includes(templateSearch.toLowerCase())) ||
        (template.eventType &&
          template.eventType.toLowerCase().includes(templateSearch.toLowerCase())) ||
        (template.content &&
          template.content.toLowerCase().includes(templateSearch.toLowerCase()));

      const matchCategory =
        templateCategory === "ALL" || template.category === templateCategory;

      return matchSearch && matchCategory;
    });
  }, [templates, templateSearch, templateCategory, metaSubCategory]);

  return {
    t,
    i18n,
    isArabic,
    navigate,
    textareaRef,
    metaPickerOpen,
    setMetaPickerOpen,
    pageTitle,
    pageDescription,
    loading,
    refreshing,
    saving,
    publishingId,
    templates,
    filteredTemplates,
    templateDialogOpen,
    setTemplateDialogOpen,
    editingTemplate,
    setEditingTemplate,
    templateSearch,
    setTemplateSearch,
    templateCategory,
    metaSubCategory,
    setMetaSubCategory,
    templateForm,
    setTemplateForm,
    metaSessions,
    selectedMetaSession,
    setSelectedMetaSession,
    metaCategoryCounts,
    availableCategoryEntries,
    dialogEventEntries,
    activeCategoryVars,
    CATEGORY_LABELS,
    EVENT_LABELS,
    insertVariable,
    handleCategoryChange,
    publishToMeta,
    refreshPageData,
    saveTemplate,
    openCreateTemplateDialog,
  };
}
