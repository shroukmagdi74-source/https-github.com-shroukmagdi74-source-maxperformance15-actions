import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { tToast } from "../../../utils/i18n-toast";
import { apiClient, type ApiRequestConfig } from "../../../services/apiClient";
import { templateLibrary } from "@/data/metaTemplateLibrary";
import {
  TEMPLATE_SECTIONS,
  resolveTemplateSection,
} from "@/data/templateSectionRegistry";
import {
  addHistory,
  extractVariableNumbers,
  hasNamedVariables,
  initialForm,
  isValidButtonUrl,
  loadHistory,
  MetaTemplate,
  runComplianceCheck,
  sanitizeTemplateName,
  TemplateFormState,
  TemplateHistoryEntry,
  ComplianceResult,
} from "./types";

interface UseWhatsAppMetaTemplatesControllerProps {
  companyId?: string;
  companyName?: string;
  superAdminMode?: boolean;
}

export function useWhatsAppMetaTemplatesController({
  companyId,
  companyName,
  superAdminMode = false,
}: UseWhatsAppMetaTemplatesControllerProps) {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [templates, setTemplates] = useState<MetaTemplate[]>([]);
  const [sessions, setSessions] = useState<
    { id: string; name?: string; phoneNumber: string }[]
  >([]);
  const [selectedSessionId, _setSelectedSessionId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("meta_templates_selected_session") || "";
    }
    return "";
  });

  const setSelectedSessionId = useCallback((id: string) => {
    _setSelectedSessionId(id);
    if (typeof window !== "undefined" && id) {
      localStorage.setItem("meta_templates_selected_session", id);
    }
  }, []);

  const [createOpen, setCreateOpen] = useState(false);
  const [createStep, setCreateStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<TemplateFormState>(initialForm);

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewTemplate, setViewTemplate] = useState<MetaTemplate | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<TemplateFormState | null>(null);
  const [editSending, setEditSending] = useState(false);
  const [editComplianceResults, setEditComplianceResults] = useState<
    ComplianceResult[]
  >([]);
  const [editShowCompliance, setEditShowCompliance] = useState(false);

  const [varValues, setVarValues] = useState<Record<string, string>>({});
  const [uploadingHeader, setUploadingHeader] = useState(false);

  const [libraryOpen, setLibraryOpen] = useState(false);
  const [librarySearch, setLibrarySearch] = useState("");
  const [libraryDomainFilter, setLibraryDomainFilter] = useState<
    "ALL" | "ORDERS" | "LOYALTY" | "CART" | "MARKETING" | "AUTH"
  >("ALL");

  const [historyOpen, setHistoryOpen] = useState(false);
  const [templateHistory, setTemplateHistory] = useState<TemplateHistoryEntry[]>(
    [],
  );

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );

  const [sectionFilter, setSectionFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const [varPreviewOpen, setVarPreviewOpen] = useState<Record<string, boolean>>(
    {},
  );
  const [varPreviewValues, setVarPreviewValues] = useState<
    Record<string, string>
  >({});

  const [complianceResults, setComplianceResults] = useState<ComplianceResult[]>(
    [],
  );
  const [showCompliance, setShowCompliance] = useState(false);

  const withCompanyConfig = useCallback(
    (config: ApiRequestConfig = {}) =>
      companyId ? { ...config, _companyId: companyId } : config,
    [companyId],
  );

  const fetchSessions = useCallback(async () => {
    try {
      const res = await apiClient.get("/whatsapp/sessions", withCompanyConfig());
      const metaSessions = ((res as any).data?.sessions || []).filter(
        (s: any) => s.provider === "META_CLOUD" || s.metaWabaId,
      );
      setSessions(metaSessions);
      if (metaSessions.length > 0) {
        _setSelectedSessionId((prev) => {
          if (prev && metaSessions.some((s: any) => s.id === prev)) {
            return prev;
          }
          const defaultId = metaSessions[0].id;
          if (typeof window !== "undefined") {
            localStorage.setItem("meta_templates_selected_session", defaultId);
          }
          return defaultId;
        });
      }
    } catch {
      // ignore
    }
  }, [withCompanyConfig]);

  const fetchTemplates = useCallback(
    async (options?: { forceRefresh?: boolean }) => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (selectedSessionId) {
          queryParams.set("sessionId", selectedSessionId);
        }
        if (options?.forceRefresh) {
          queryParams.set("refresh", "true");
        }
        const queryString = queryParams.toString();
        const url = `/whatsapp-templates/templates${queryString ? `?${queryString}` : ""}`;
        const res = await apiClient.get(url, withCompanyConfig());
        const data = (res as any).data;
        setTemplates(data?.templates || []);
        if (data?.sessionId) {
          _setSelectedSessionId((prev) => {
            if (!prev) {
              if (typeof window !== "undefined") {
                localStorage.setItem("meta_templates_selected_session", data.sessionId);
              }
              return data.sessionId;
            }
            return prev;
          });
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.error || "فشل تحميل القوالب");
      } finally {
        setLoading(false);
      }
    },
    [selectedSessionId, withCompanyConfig],
  );

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    void fetchTemplates();
  }, [fetchTemplates]);

  const sanitizedName = useMemo(
    () => sanitizeTemplateName(form.name),
    [form.name],
  );
  const nameValid = sanitizedName.length >= 1 && sanitizedName.length <= 512;
  const headerVarsOk =
    form.headerFormat !== "TEXT" ||
    !form.headerText ||
    !hasNamedVariables(form.headerText);
  const bodyVarsOk = !form.bodyText || !hasNamedVariables(form.bodyText);
  const buttonUrlOk = isValidButtonUrl(form.buttonUrl);

  const extractedVars = useMemo(() => {
    const allText = [
      form.headerText,
      form.bodyText,
      form.footerText,
      form.buttonText,
    ]
      .filter(Boolean)
      .join(" ");
    return extractVariableNumbers(allText);
  }, [form.headerText, form.bodyText, form.footerText, form.buttonText]);

  const bodyVars = useMemo(
    () => extractVariableNumbers(form.bodyText || ""),
    [form.bodyText],
  );

  const insertBodyVariable = useCallback(() => {
    const numbers = bodyVars.map((v) => parseInt(v.replace(/\D/g, ""), 10));
    const next = (numbers.length ? Math.max(...numbers) : 0) + 1;
    setForm((prev) => {
      const text = (prev.bodyText || "").replace(/\s+$/, "");
      const separator = !text || text.endsWith("\n") ? "" : " ";
      return { ...prev, bodyText: `${text}${separator}{{${next}}}` };
    });
  }, [bodyVars]);

  const previewText = useMemo(() => {
    if (form.category === "AUTHENTICATION") {
      const code = varValues["1"] || "482915";
      const btn =
        form.buttonText || (form.language === "ar" ? "نسخ الرمز" : "Copy Code");
      if (form.language === "ar") {
        return `رمز التحقق الخاص بك هو: ${code}\n\nلأسباب أمنية، لا تشارك هذا الرمز مع أي شخص.\nينتهي هذا الرمز خلال 10 دقائق.\n\n[ ${btn} ]`;
      }
      return `Your verification code is: ${code}\n\nFor security reasons, do not share this code.\nThis code expires in 10 minutes.\n\n[ ${btn} ]`;
    }
    let text = "";
    if (form.headerFormat === "TEXT" && form.headerText) {
      text += `${form.headerText}\n\n`;
    } else if (form.headerFormat !== "TEXT" && form.headerText) {
      text += `[${form.headerFormat}] ${form.headerText}\n\n`;
    } else if (form.headerFormat !== "TEXT") {
      text += `[${form.headerFormat} media]\n\n`;
    }
    if (form.bodyText) text += `${form.bodyText}\n`;
    if (form.footerText) text += `\n${form.footerText}`;
    if (form.buttonText) text += `\n\n[ ${form.buttonText} ]`;
    extractedVars.forEach((v) => {
      const key = v.replace(/\D/g, "");
      text = text.replace(
        new RegExp(`\\{\\{${key}\\}\\}`, "g"),
        varValues[key] || `{{${key}}}`,
      );
    });
    return text;
  }, [form, extractedVars, varValues]);

  const buildComponents = useCallback(
    (f: TemplateFormState, samples: Record<string, string> = {}) => {
      if (f.category === "AUTHENTICATION") {
        return [
          { type: "BODY", add_security_recommendation: true },
          { type: "FOOTER", code_expiration_minutes: 10 },
          {
            type: "BUTTONS",
            buttons: [
              {
                type: "OTP",
                otp_type: "COPY_CODE",
                text:
                  f.buttonText ||
                  (f.language === "ar" ? "نسخ الرمز" : "Copy Code"),
              },
            ],
          },
        ];
      }

      const sampleFor = (token: string) => {
        const key = token.replace(/\D/g, "");
        return samples[key] || `مثال ${key}`;
      };
      const fillSamples = (text: string) =>
        extractVariableNumbers(text).reduce(
          (acc, token) =>
            acc.replace(
              new RegExp(`\\{\\{${token.replace(/\D/g, "")}\\}\\}`, "g"),
              sampleFor(token),
            ),
          text,
        );

      const components: any[] = [];
      if (f.headerFormat === "TEXT" && f.headerText) {
        const header: any = {
          type: "HEADER",
          format: "TEXT",
          text: f.headerText,
        };
        if (extractVariableNumbers(f.headerText).length > 0) {
          header.example = { header_text: [fillSamples(f.headerText)] };
        }
        components.push(header);
      } else if (f.headerFormat !== "TEXT") {
        const header: any = { type: "HEADER", format: f.headerFormat };
        if (f.headerMediaHandle) header.headerHandle = f.headerMediaHandle;
        components.push(header);
      } else if (f.headerText) {
        components.push({ type: "HEADER", format: "TEXT", text: f.headerText });
      }

      const bodyComp: any = { type: "BODY", text: f.bodyText };
      const bodyTokens = extractVariableNumbers(f.bodyText || "");
      if (bodyTokens.length > 0) {
        bodyComp.example = { body_text: [bodyTokens.map(sampleFor)] };
      }
      components.push(bodyComp);

      if (f.footerText) {
        components.push({ type: "FOOTER", text: f.footerText });
      }
      if (f.buttonText) {
        const url = f.buttonUrl || "https://example.com";
        const finalUrl = url.startsWith("http") ? url : `https://${url}`;
        const buttons: any[] = [
          { type: "URL", text: f.buttonText, url: finalUrl },
        ];
        components.push({ type: "BUTTONS", buttons });
      }
      return components;
    },
    [],
  );

  const handleComplianceCheck = useCallback((f: TemplateFormState) => {
    const results = runComplianceCheck(f);
    setComplianceResults(results);
    setShowCompliance(true);
    return results.filter((r) => r.severity === "error").length === 0;
  }, []);

  const closeCreateDialog = useCallback(() => {
    setCreateOpen(false);
    setCreateStep(1);
    setShowCompliance(false);
    setComplianceResults([]);
    setForm({ ...initialForm });
    setVarValues({});
  }, []);

  const handleCreate = useCallback(async () => {
    if (
      !sanitizedName ||
      (form.category !== "AUTHENTICATION" && !form.bodyText)
    ) {
      tToast.error("WhatsAppMetaTemplates.msg_5d29");
      return;
    }
    if (!nameValid) {
      tToast.error("WhatsAppMetaTemplates.msg_7367");
      return;
    }
    if (form.headerFormat !== "TEXT" && !form.headerMediaHandle) {
      tToast.error(
        "ارفع صورة/وسيط الرأس الأول — ميتا مش هتقبل قالب برأس IMAGE من غير صورة.",
      );
      return;
    }
    const checkPassed = handleComplianceCheck(form);
    if (!checkPassed) return;
    try {
      setSending(true);
      const components = buildComponents(form, varValues);

      await apiClient.post(
        "/whatsapp-templates/templates",
        {
          sessionId: selectedSessionId,
          name: sanitizedName,
          language: form.language,
          category: form.category,
          components,
        },
        withCompanyConfig(),
      );
      addHistory({
        action: "created",
        name: sanitizedName,
        language: form.language,
        timestamp: Date.now(),
        category: form.category,
      });
      tToast.success("WhatsAppMetaTemplates.success_create_b7fe");
      setCreateOpen(false);
      setForm({ ...initialForm });
      setVarValues({});
      setShowCompliance(false);
      setComplianceResults([]);
      await fetchTemplates();
    } catch (err: any) {
      const metaMsg = err?.response?.data?.error;
      toast.error(metaMsg || "فشل إنشاء القالب", { duration: 8000 });
    } finally {
      setSending(false);
    }
  }, [
    form,
    varValues,
    sanitizedName,
    nameValid,
    selectedSessionId,
    withCompanyConfig,
    fetchTemplates,
    buildComponents,
    handleComplianceCheck,
  ]);

  const handleEdit = useCallback(async () => {
    if (!editForm || !editForm.name) {
      tToast.error("WhatsAppMetaTemplates.msg_bfc1");
      return;
    }
    const results = runComplianceCheck(editForm);
    setEditComplianceResults(results);
    setEditShowCompliance(true);
    if (results.some((r) => r.severity === "error")) {
      tToast.error("WhatsAppMetaTemplates.msg_e04d");
      return;
    }
    try {
      setEditSending(true);
      const components = buildComponents(editForm);

      await apiClient.put(
        "/whatsapp-templates/templates",
        {
          sessionId: selectedSessionId,
          templateName: editForm.name,
          components,
          language: editForm.language,
          category: editForm.category,
        },
        withCompanyConfig(),
      );
      addHistory({
        action: "edited",
        name: editForm.name,
        language: editForm.language,
        timestamp: Date.now(),
        category: editForm.category,
      });
      tToast.success("WhatsAppMetaTemplates.success_update_ee74");
      setEditOpen(false);
      setEditForm(null);
      await fetchTemplates();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "فشل تحديث القالب", {
        duration: 8000,
      });
    } finally {
      setEditSending(false);
    }
  }, [
    editForm,
    selectedSessionId,
    withCompanyConfig,
    fetchTemplates,
    buildComponents,
  ]);

  const handleDelete = useCallback(
    async (templateName: string) => {
      try {
        await apiClient.delete("/whatsapp-templates/templates", {
          data: { sessionId: selectedSessionId, templateName },
          ...withCompanyConfig(),
        });
        addHistory({
          action: "deleted",
          name: templateName,
          language: "",
          timestamp: Date.now(),
        });
        tToast.success("WhatsAppMetaTemplates.success_delete_3acd");
        setDeleteConfirm(null);
        await fetchTemplates();
      } catch (err: any) {
        toast.error(err?.response?.data?.error || "فشل حذف القالب");
      }
    },
    [selectedSessionId, withCompanyConfig, fetchTemplates],
  );

  const filteredTemplates = useMemo(
    () => templates.filter((tpl) => tpl.status !== "DELETED"),
    [templates],
  );

  const groupBestStatus = useMemo(() => {
    const map: Record<string, string> = {};
    for (const tpl of filteredTemplates) {
      const cur = map[tpl.name];
      if (!cur) {
        map[tpl.name] = tpl.status;
        continue;
      }
      if (cur === "APPROVED" && tpl.status !== "APPROVED") {
        map[tpl.name] = tpl.status;
      }
    }
    return map;
  }, [filteredTemplates]);

  const groupedTemplates = useMemo(() => {
    const groups: Record<string, MetaTemplate[]> = {};
    const q = searchQuery.trim().toLowerCase();
    for (const tpl of filteredTemplates) {
      const section = resolveTemplateSection(tpl.name, tpl.category);
      if (sectionFilter !== "ALL" && section.id !== sectionFilter) continue;
      if (statusFilter !== "ALL" && groupBestStatus[tpl.name] !== statusFilter)
        continue;
      if (
        q &&
        !tpl.name.toLowerCase().includes(q) &&
        !tpl.id?.toLowerCase().includes(q)
      )
        continue;
      if (!groups[tpl.name]) groups[tpl.name] = [];
      groups[tpl.name]!.push(tpl);
    }
    return groups;
  }, [
    filteredTemplates,
    sectionFilter,
    statusFilter,
    searchQuery,
    groupBestStatus,
  ]);

  const statusFilterCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: 0,
      APPROVED: 0,
      PENDING: 0,
      REJECTED: 0,
      DISABLED: 0,
      PAUSED: 0,
    };
    const seen = new Set<string>();
    for (const tpl of filteredTemplates) {
      counts.ALL += 1;
      if (!seen.has(tpl.name)) {
        seen.add(tpl.name);
        const best = groupBestStatus[tpl.name] ?? tpl.status;
        counts[best] = (counts[best] || 0) + 1;
      }
    }
    return counts;
  }, [filteredTemplates, groupBestStatus]);

  const allFilteredGroupNames = useMemo(
    () => Object.keys(groupedTemplates),
    [groupedTemplates],
  );
  const allSelected =
    allFilteredGroupNames.length > 0 &&
    allFilteredGroupNames.every((n) => selectedRows.has(n));
  const someSelected = selectedRows.size > 0 && !allSelected;

  const toggleRow = useCallback((name: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        for (const n of allFilteredGroupNames) next.delete(n);
      } else {
        for (const n of allFilteredGroupNames) next.add(n);
      }
      return next;
    });
  }, [allSelected, allFilteredGroupNames]);

  const substituteVars = useCallback(
    (text: string, key: string) => {
      if (!text) return text;
      return text.replace(/\{\{(\d+)\}\}/g, (match, n) => {
        const v = varPreviewValues[`${key}::${n}`];
        return v && v.length > 0 ? v : match;
      });
    },
    [varPreviewValues],
  );

  const sectionFilterOptions = useMemo(() => TEMPLATE_SECTIONS, []);

  const statusCounts = useMemo(() => {
    const counts = {
      approved: 0,
      pending: 0,
      rejected: 0,
      disabled: 0,
      paused: 0,
      total: 0,
    };
    for (const group of Object.values(groupedTemplates)) {
      counts.total += 1;
      const statuses = new Set(group.map((t) => t.status));
      if (statuses.has("REJECTED")) counts.rejected += 1;
      else if (statuses.has("PENDING")) counts.pending += 1;
      else if (statuses.has("DISABLED")) counts.disabled += 1;
      else if (statuses.has("PAUSED")) counts.paused += 1;
      else if (statuses.has("APPROVED")) counts.approved += 1;
    }
    return counts;
  }, [groupedTemplates]);

  const toggleGroup = useCallback((name: string) => {
    setExpandedGroups((p) => ({ ...p, [name]: !p[name] }));
  }, []);

  const applyLibraryTemplate = useCallback(
    (libTpl: (typeof templateLibrary)[number]) => {
      const lang = libTpl.languages[0]!;
      setForm({
        name: libTpl.name,
        language: lang.code,
        category: libTpl.category,
        headerFormat: libTpl.headerFormat || "TEXT",
        headerText: lang.headerText,
        headerMediaHandle: "",
        headerMediaName: "",
        bodyText: lang.bodyText,
        footerText: lang.footerText,
        buttonText: libTpl.buttonText || "",
        buttonUrl: libTpl.buttonUrl || "",
      });
      setLibraryOpen(false);
      setLibrarySearch("");
      setCreateStep(1);
      setCreateOpen(true);
    },
    [],
  );

  const uploadHeaderMedia = useCallback(
    async (file: File, apply: (handle: string, name: string) => void) => {
      if (!selectedSessionId) {
        tToast.error("WhatsAppMetaTemplates.msg_5d29");
        return;
      }
      setUploadingHeader(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("sessionId", selectedSessionId);
        const res = await apiClient.post<{
          success?: boolean;
          mediaId?: string;
          fileName?: string;
          error?: string;
        }>("/whatsapp-templates/templates/upload-media", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          ...withCompanyConfig(),
        });
        const data = res.data;
        if (data?.success && data.mediaId) {
          apply(data.mediaId, data.fileName || file.name);
          tToast.success("WhatsAppMetaTemplates.success_upload_media");
        } else {
          toast.error(data?.error || "فشل رفع الوسيط");
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.error || "فشل رفع الوسيط إلى ميتا");
      } finally {
        setUploadingHeader(false);
      }
    },
    [selectedSessionId, withCompanyConfig],
  );

  const filteredLibrary = useMemo(() => {
    return templateLibrary.filter((libTpl) => {
      if (libraryDomainFilter === "ORDERS") {
        if (
          !libTpl.tags.some((tag) =>
            [
              "order",
              "delivery",
              "tracking",
              "created",
              "shipped",
              "confirmed",
              "processing",
            ].includes(tag),
          )
        )
          return false;
      } else if (libraryDomainFilter === "LOYALTY") {
        if (
          !libTpl.tags.some((tag) =>
            ["loyalty", "points", "cashback", "wallet", "vip"].includes(tag),
          )
        )
          return false;
      } else if (libraryDomainFilter === "CART") {
        if (!libTpl.tags.some((tag) => ["cart", "abandoned"].includes(tag)))
          return false;
      } else if (libraryDomainFilter === "MARKETING") {
        if (libTpl.category !== "MARKETING") return false;
      } else if (libraryDomainFilter === "AUTH") {
        if (libTpl.category !== "AUTHENTICATION" && !libTpl.tags.includes("auth"))
          return false;
      }

      if (!librarySearch) return true;
      const q = librarySearch.toLowerCase();
      return (
        libTpl.name.includes(q) ||
        libTpl.description.includes(q) ||
        libTpl.tags.some((tag) => tag.includes(q)) ||
        libTpl.category.toLowerCase().includes(q)
      );
    });
  }, [librarySearch, libraryDomainFilter]);

  const libraryByCategory = useMemo(() => {
    const groups: Record<string, typeof templateLibrary> = {};
    for (const libTpl of filteredLibrary) {
      if (!groups[libTpl.category]) groups[libTpl.category] = [];
      groups[libTpl.category]!.push(libTpl);
    }
    return groups;
  }, [filteredLibrary]);

  const pageTitle = companyName
    ? `قوالب Meta API · ${companyName}`
    : "قوالب Meta API";

  return {
    t,
    loading,
    sending,
    sessions,
    selectedSessionId,
    setSelectedSessionId,
    pageTitle,
    templates,
    groupedTemplates,
    statusCounts,
    statusFilter,
    setStatusFilter,
    statusFilterCounts,
    sectionFilter,
    setSectionFilter,
    sectionFilterOptions,
    searchQuery,
    setSearchQuery,
    selectedRows,
    setSelectedRows,
    toggleRow,
    toggleAll,
    allSelected,
    someSelected,
    expandedGroups,
    toggleGroup,
    varPreviewOpen,
    setVarPreviewOpen,
    varPreviewValues,
    setVarPreviewValues,
    substituteVars,
    createOpen,
    setCreateOpen,
    createStep,
    setCreateStep,
    form,
    setForm,
    sanitizedName,
    nameValid,
    headerVarsOk,
    bodyVarsOk,
    buttonUrlOk,
    bodyVars,
    varValues,
    setVarValues,
    previewText,
    complianceResults,
    showCompliance,
    setShowCompliance,
    uploadingHeader,
    uploadHeaderMedia,
    insertBodyVariable,
    handleCreate,
    closeCreateDialog,
    editOpen,
    setEditOpen,
    editForm,
    setEditForm,
    editSending,
    editComplianceResults,
    editShowCompliance,
    setEditShowCompliance,
    handleEdit,
    deleteConfirm,
    setDeleteConfirm,
    handleDelete,
    viewTemplate,
    setViewTemplate,
    libraryOpen,
    setLibraryOpen,
    librarySearch,
    setLibrarySearch,
    libraryDomainFilter,
    setLibraryDomainFilter,
    filteredLibrary,
    libraryByCategory,
    applyLibraryTemplate,
    historyOpen,
    setHistoryOpen,
    templateHistory,
    setTemplateHistory,
    fetchTemplates,
  };
}
