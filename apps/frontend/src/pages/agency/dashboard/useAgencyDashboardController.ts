import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { apiClient } from "../../../services/apiClient";
import {
  calculateClientStatement,
  generateWhatsAppInvoiceMessage,
} from "./invoiceCalculations";
import {
  AgencyApproval,
  AgencyClient,
  ClientInvoiceStatement,
  EXTRA_SERVICE_PRESETS,
  HybridType,
  InvoicesResponse,
  PricingModel,
} from "./types";

export const useAgencyDashboardController = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { tab: paramTab } = useParams<{ tab?: string }>();
  const activeTab = paramTab || searchParams.get("tab") || "overview";

  const [loading, setLoading] = useState(true);
  const [currency] = useState("ج.م");
  const currentMonthString = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthString);

  // Overview metrics
  const [overview, setOverview] = useState({
    totalClients: 0,
    activeClients: 0,
    totalBudget: 0,
    totalSpend: 0,
    totalRetainers: 0,
    totalAgencyRevenue: 0,
    unpaidInvoicesCount: 0,
    totalUncollected: 0,
    pendingApprovals: 0,
    expectedPacingPercent: 0,
    currentDay: 1,
    daysInMonth: 30,
  });

  const [clients, setClients] = useState<AgencyClient[]>([]);
  const [approvals, setApprovals] = useState<AgencyApproval[]>([]);
  const [invoicesData, setInvoicesData] = useState<InvoicesResponse | null>(null);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<ClientInvoiceStatement | null>(null);

  // Client modal state
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<AgencyClient | null>(null);
  const [clientForm, setClientForm] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    pricingModel: "RETAINER" as PricingModel,
    baseRetainer: 5000,
    pricingRate: 10,
    feePerOrder: 25,
    feePerItem: 15,
    hybridType: "PERCENT_SPEND" as HybridType,
    monthlyBudget: 50000,
    currentSpend: 0,
    monthlySales: 0,
    monthlyOrders: 0,
    monthlyUnits: 0,
    isOffPlatform: false,
    adAccountId: "",
    status: "active" as const,
    notes: "",
  });

  // Performance Log Modal State
  const [perfModalOpen, setPerfModalOpen] = useState(false);
  const [selectedClientForPerf, setSelectedClientForPerf] = useState<AgencyClient | null>(null);

  // Extra Service Modal State
  const [extraModalOpen, setExtraModalOpen] = useState(false);
  const [selectedClientForExtra, setSelectedClientForExtra] = useState<AgencyClient | null>(null);
  const [extraForm, setExtraForm] = useState({
    month: currentMonthString,
    category: "LOGO_DESIGN",
    title: "تصميم لوجو وهوية بصرية كاملة",
    amount: 3500,
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  // Approval modal state
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approvalForm, setApprovalForm] = useState({
    clientId: "",
    title: "",
    mediaUrl: "",
    copyText: "",
    platform: "facebook",
    campaignName: "",
  });

  // Search filter
  const [searchTerm, setSearchTerm] = useState("");
  const [appInactiveNotice, setAppInactiveNotice] = useState<string | null>(null);

  // Pagination for clients
  const [clientPage, setClientPage] = useState(1);
  const CLIENTS_PER_PAGE = 6;

  // Media upload for approvals
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const getArabicMonthName = useCallback((monthStr: string) => {
    try {
      const [y, m] = monthStr.split("-").map(Number);
      if (!y || !m) return monthStr;
      const d = new Date(y, m - 1, 1);
      return d.toLocaleDateString("ar-EG", { month: "long", year: "numeric" });
    } catch {
      return monthStr;
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [ovRes, clRes, apRes] = await Promise.all([
        apiClient.get("/agency/overview", { _skipErrorToast: true } as any),
        apiClient.get("/agency/clients", { _skipErrorToast: true } as any),
        apiClient.get("/agency/approvals", { _skipErrorToast: true } as any),
      ]);

      if (ovRes.data?.success) {
        setAppInactiveNotice(null);
        const m = ovRes.data.data?.metrics || {};
        setOverview({
          totalClients: Number(m.totalClients) || 0,
          activeClients: Number(m.activeClients) || 0,
          totalBudget: Number(m.totalBudget) || 0,
          totalSpend: Number(m.totalSpend) || 0,
          totalRetainers: Number(m.totalRetainers) || 0,
          totalAgencyRevenue: Number(m.totalAgencyRevenue) || 0,
          unpaidInvoicesCount: Number(m.unpaidInvoicesCount) || 0,
          totalUncollected: Number(m.totalUncollected) || 0,
          pendingApprovals: Number(m.pendingApprovals) || 0,
          expectedPacingPercent: Number(m.expectedPacingPercent) || 0,
          currentDay: Number(m.currentDay) || 1,
          daysInMonth: Number(m.daysInMonth) || 30,
        });
      }

      if (clRes.data?.success && Array.isArray(clRes.data.data)) {
        setClients(
          clRes.data.data.map((c: any) => ({
            ...c,
            pricingModel: c.pricingModel || "RETAINER",
            baseRetainer: Number(c.baseRetainer ?? c.monthlyRetainer) || 0,
            monthlyBudget: Number(c.monthlyBudget) || 0,
            currentSpend: Number(c.currentSpend) || 0,
            status: (c.status || "active").toLowerCase(),
          })),
        );
      }

      if (apRes.data?.success && Array.isArray(apRes.data.data)) {
        setApprovals(apRes.data.data);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "";
      if (err.response?.status === 403 || msg.includes("هذه الميزة تتطلب تفعيل")) {
        setAppInactiveNotice(msg || "هذه الميزة تتطلب تفعيل تطبيق: إدارة وكالات التسويق");
      } else {
        toast.error(msg || "تعذر تحميل بيانات الوكالة");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInvoices = useCallback(async (monthToFetch = selectedMonth) => {
    try {
      setInvoicesLoading(true);
      const res = await apiClient.get(`/agency/invoices?month=${monthToFetch}`, {
        _skipErrorToast: true,
      } as any);
      if (res.data?.success) {
        setInvoicesData(res.data.data);
      }
    } catch (err: any) {
      if (err.response?.status === 403) return;
      toast.error(err.response?.data?.message || "فشل جلب فواتير الوكالة");
    } finally {
      setInvoicesLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (activeTab === "invoices") {
      fetchInvoices(selectedMonth);
    }
  }, [activeTab, selectedMonth, fetchInvoices]);

  const handleTabChange = useCallback(
    (val: string) => {
      if (paramTab) {
        navigate(`/agency/${val}`);
      } else {
        setSearchParams({ tab: val });
      }
    },
    [paramTab, navigate, setSearchParams],
  );

  const handleOpenFormalInvoice = useCallback((stmt: ClientInvoiceStatement) => {
    setSelectedInvoice(stmt);
    setInvoiceModalOpen(true);
  }, []);

  const handleOpenFormalInvoiceFromClient = useCallback(
    async (client: AgencyClient) => {
      let stmt = invoicesData?.statements?.find((s) => s.clientId === client.id);
      if (!stmt) {
        try {
          setInvoicesLoading(true);
          const res = await apiClient.get(`/agency/invoices?month=${selectedMonth}`);
          if (res.data?.success) {
            setInvoicesData(res.data.data);
            stmt = res.data.data?.statements?.find((s: any) => s.clientId === client.id);
          }
        } catch (err: any) {
          console.error("Failed to fetch invoices for client statement", err);
        } finally {
          setInvoicesLoading(false);
        }
      }

      if (stmt) {
        setSelectedInvoice(stmt);
      } else {
        setSelectedInvoice(calculateClientStatement(client, selectedMonth, currency));
      }
      setInvoiceModalOpen(true);
    },
    [currency, invoicesData?.statements, selectedMonth],
  );

  const handleOpenNewClient = useCallback(() => {
    setEditingClient(null);
    setClientForm({
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      pricingModel: "RETAINER",
      baseRetainer: 5000,
      pricingRate: 10,
      feePerOrder: 25,
      feePerItem: 15,
      hybridType: "PERCENT_SPEND",
      monthlyBudget: 50000,
      currentSpend: 0,
      monthlySales: 0,
      monthlyOrders: 0,
      monthlyUnits: 0,
      isOffPlatform: false,
      adAccountId: "",
      status: "active",
      notes: "",
    });
    setClientModalOpen(true);
  }, []);

  const handleOpenEditClient = useCallback((c: AgencyClient) => {
    setEditingClient(c);
    setClientForm({
      name: c.name,
      contactPerson: c.contactPerson || "",
      email: c.email || "",
      phone: c.phone || "",
      pricingModel: c.pricingModel || "RETAINER",
      baseRetainer: c.baseRetainer || 0,
      pricingRate: c.pricingRate || 10,
      feePerOrder: c.feePerOrder || 25,
      feePerItem: c.feePerItem || 15,
      hybridType: c.hybridType || "PERCENT_SPEND",
      monthlyBudget: c.monthlyBudget || 0,
      currentSpend: c.currentSpend || 0,
      monthlySales: c.monthlySales || 0,
      monthlyOrders: c.monthlyOrders || 0,
      monthlyUnits: c.monthlyUnits || 0,
      isOffPlatform: Boolean(c.isOffPlatform),
      adAccountId: c.adAccountId || "",
      status: c.status,
      notes: c.notes || "",
    });
    setClientModalOpen(true);
  }, []);

  const handleSaveClient = useCallback(async () => {
    if (!clientForm.name.trim()) {
      toast.error("اسم العميل مطلوب");
      return;
    }

    try {
      if (editingClient) {
        const res = await apiClient.put(`/agency/clients/${editingClient.id}`, clientForm);
        if (res.data?.success) {
          toast.success("تم تحديث بيانات العميل بنجاح");
          setClientModalOpen(false);
          fetchData();
          if (activeTab === "invoices") fetchInvoices(selectedMonth);
        }
      } else {
        const res = await apiClient.post("/agency/clients", clientForm);
        if (res.data?.success) {
          toast.success("تم إضافة العميل بنجاح");
          setClientModalOpen(false);
          fetchData();
          if (activeTab === "invoices") fetchInvoices(selectedMonth);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "فشل في حفظ العميل");
    }
  }, [clientForm, editingClient, fetchData, activeTab, fetchInvoices, selectedMonth]);

  const handleDeleteClient = useCallback(
    async (id: string, name: string) => {
      if (!window.confirm(`هل أنت متأكد من حذف العميل "${name}"؟`)) return;
      try {
        const res = await apiClient.delete(`/agency/clients/${id}`);
        if (res.data?.success) {
          toast.success("تم حذف العميل");
          fetchData();
          if (activeTab === "invoices") fetchInvoices(selectedMonth);
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || "فشل في حذف العميل");
      }
    },
    [fetchData, activeTab, fetchInvoices, selectedMonth],
  );

  const handleOpenPerfModal = useCallback((client: AgencyClient) => {
    setSelectedClientForPerf(client);
    setPerfModalOpen(true);
  }, []);

  const handleOpenExtraModal = useCallback(
    (client: AgencyClient) => {
      setSelectedClientForExtra(client);
      setExtraForm({
        month: selectedMonth,
        category: "LOGO_DESIGN",
        title: "تصميم لوجو وهوية بصرية كاملة",
        amount: 3500,
        date: new Date().toISOString().slice(0, 10),
        notes: "",
      });
      setExtraModalOpen(true);
    },
    [selectedMonth],
  );

  const handleSelectPresetCategory = useCallback((cat: string) => {
    const preset = EXTRA_SERVICE_PRESETS.find((p) => p.category === cat);
    if (preset) {
      setExtraForm((prev) => ({
        ...prev,
        category: preset.category,
        title: preset.title,
        amount: preset.defaultAmount,
      }));
    }
  }, []);

  const handleSaveExtraService = useCallback(async () => {
    if (!selectedClientForExtra) return;
    if (!extraForm.title.trim()) {
      toast.error("عنوان الخدمة أو المصروف مطلوب");
      return;
    }
    if (Number(extraForm.amount) <= 0) {
      toast.error("المبلغ يجب أن يكون أكبر من صفر");
      return;
    }

    try {
      const res = await apiClient.post(
        `/agency/clients/${selectedClientForExtra.id}/extra-services`,
        extraForm,
      );
      if (res.data?.success) {
        toast.success("تم إضافة البند الإضافي بنجاح");
        setExtraModalOpen(false);
        fetchData();
        fetchInvoices(selectedMonth);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "فشل إضافة البند الإضافي");
    }
  }, [selectedClientForExtra, extraForm, fetchData, fetchInvoices, selectedMonth]);

  const handleDeleteExtraService = useCallback(
    async (clientId: string, serviceId: string) => {
      if (!window.confirm("هل أنت متأكد من حذف هذا البند من الفاتورة؟")) return;
      try {
        const res = await apiClient.delete(
          `/agency/clients/${clientId}/extra-services/${serviceId}`,
        );
        if (res.data?.success) {
          toast.success("تم حذف البند الإضافي");
          fetchData();
          fetchInvoices(selectedMonth);
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || "فشل في الحذف");
      }
    },
    [fetchData, fetchInvoices, selectedMonth],
  );

  const handleToggleInvoicePaid = useCallback(
    async (clientId: string, currentPaid: boolean) => {
      try {
        const res = await apiClient.patch(
          `/agency/clients/${clientId}/invoices/${selectedMonth}/status`,
          {
            isPaid: !currentPaid,
          },
        );
        if (res.data?.success) {
          toast.success(res.data.message);
          fetchInvoices(selectedMonth);
          fetchData();
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || "فشل تحديث حالة السداد");
      }
    },
    [selectedMonth, fetchInvoices, fetchData],
  );

  const handleShareInvoiceWhatsApp = useCallback(
    (stmt: ClientInvoiceStatement) => {
      const lines = generateWhatsAppInvoiceMessage(stmt, currency);
      const phone = stmt.phone ? stmt.phone.replace(/[^0-9]/g, "") : "";
      const formattedPhone = phone.startsWith("0") ? `2${phone}` : phone;

      if (formattedPhone) {
        window.open(
          `https://wa.me/${formattedPhone}?text=${encodeURIComponent(lines)}`,
          "_blank",
        );
      } else {
        navigator.clipboard.writeText(lines);
        toast.success("تم نسخ تفاصيل الفاتورة للحافظة لمشاركتها عبر الواتساب!");
      }
    },
    [currency],
  );

  const handleUploadMediaFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        setIsUploadingMedia(true);
        const formData = new FormData();
        formData.append("files", file);
        formData.append("image", file);
        const res = await apiClient.post("/upload/media", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 60000,
        });
        if (res.data?.success && (res.data.data?.url || res.data.data?.fullUrl)) {
          const url = res.data.data.fullUrl || res.data.data.url;
          setApprovalForm((prev) => ({ ...prev, mediaUrl: url }));
          toast.success("تم رفع ملف التصميم / الفيديو بنجاح!");
        } else {
          const fallbackUrl = URL.createObjectURL(file);
          setApprovalForm((prev) => ({ ...prev, mediaUrl: fallbackUrl }));
          toast.info("تم اعتماد الملف للمعاينة المباشرة");
        }
      } catch {
        const fallbackUrl = URL.createObjectURL(file);
        setApprovalForm((prev) => ({ ...prev, mediaUrl: fallbackUrl }));
        toast.info("تم اعتماد الملف للمعاينة المباشرة");
      } finally {
        setIsUploadingMedia(false);
      }
    },
    [],
  );

  const handleOpenNewApproval = useCallback(() => {
    if (clients.length === 0) {
      toast.info("يرجى إضافة عميل أولاً قبل إنشاء طلب موافقة له");
      handleOpenNewClient();
      return;
    }
    setApprovalForm({
      clientId: clients[0].id,
      title: "",
      mediaUrl: "",
      copyText: "",
      platform: "facebook",
      campaignName: "",
    });
    setApprovalModalOpen(true);
  }, [clients, handleOpenNewClient]);

  const shareApprovalWhatsApp = useCallback(
    (item: AgencyApproval) => {
      const client = clients.find((c) => c.id === item.clientId);
      const token = item.shareToken || item.publicToken;
      const fullUrl = `${window.location.origin}/agency/client-portal/${token}`;
      const text = encodeURIComponent(
        `مرحباً ${client?.name || ""}\nفريق وكالة التسويق يشارك معكم مسودة: "${item.title}" للمراجعة والاعتماد.\n\nرابط المعاينة والموافقة بضغطة زر:\n${fullUrl}`,
      );
      const phone = client?.phone ? client.phone.replace(/[^0-9]/g, "") : "";
      const formatted = phone.startsWith("0") ? `2${phone}` : phone;
      if (formatted) {
        window.open(`https://wa.me/${formatted}?text=${text}`, "_blank");
      } else {
        window.open(`https://wa.me/?text=${text}`, "_blank");
      }
    },
    [clients],
  );

  const handleSaveApproval = useCallback(async () => {
    if (!approvalForm.title.trim()) {
      toast.error("عنوان الحملة أو التصميم مطلوب");
      return;
    }
    try {
      const res = await apiClient.post("/agency/approvals", approvalForm);
      if (res.data?.success) {
        toast.success("تم إنشاء طلب الموافقة وتوليد الرابط العام");
        setApprovalModalOpen(false);
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "فشل في حفظ طلب الموافقة");
    }
  }, [approvalForm, fetchData]);

  const handleDeleteApproval = useCallback(
    async (id: string) => {
      if (!window.confirm("هل أنت متأكد من حذف هذا العنصر؟")) return;
      try {
        const res = await apiClient.delete(`/agency/approvals/${id}`);
        if (res.data?.success) {
          toast.success("تم حذف طلب الموافقة");
          fetchData();
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || "فشل في الحذف");
      }
    },
    [fetchData],
  );

  const copyApprovalLink = useCallback((token?: string) => {
    if (!token) return;
    const fullUrl = `${window.location.origin}/agency/client-portal/${token}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("تم نسخ رابط بوابة العميل للموافقة!");
  }, []);

  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clients;
    const q = searchTerm.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.adAccountId && c.adAccountId.toLowerCase().includes(q)),
    );
  }, [clients, searchTerm]);

  const totalClientPages = Math.ceil(filteredClients.length / CLIENTS_PER_PAGE) || 1;
  const paginatedClients = useMemo(() => {
    const start = (clientPage - 1) * CLIENTS_PER_PAGE;
    return filteredClients.slice(start, start + CLIENTS_PER_PAGE);
  }, [filteredClients, clientPage]);

  return {
    activeTab,
    loading,
    currency,
    selectedMonth,
    setSelectedMonth,
    overview,
    clients,
    approvals,
    invoicesData,
    invoicesLoading,
    invoiceModalOpen,
    setInvoiceModalOpen,
    selectedInvoice,
    clientModalOpen,
    setClientModalOpen,
    editingClient,
    clientForm,
    setClientForm,
    perfModalOpen,
    setPerfModalOpen,
    selectedClientForPerf,
    extraModalOpen,
    setExtraModalOpen,
    selectedClientForExtra,
    extraForm,
    setExtraForm,
    approvalModalOpen,
    setApprovalModalOpen,
    approvalForm,
    setApprovalForm,
    searchTerm,
    setSearchTerm,
    appInactiveNotice,
    clientPage,
    setClientPage,
    totalClientPages,
    paginatedClients,
    filteredClients,
    isUploadingMedia,
    fileInputRef,
    getArabicMonthName,
    fetchData,
    fetchInvoices,
    handleTabChange,
    handleOpenFormalInvoice,
    handleOpenFormalInvoiceFromClient,
    handleOpenNewClient,
    handleOpenEditClient,
    handleSaveClient,
    handleDeleteClient,
    handleOpenPerfModal,
    handleOpenExtraModal,
    handleSelectPresetCategory,
    handleSaveExtraService,
    handleDeleteExtraService,
    handleToggleInvoicePaid,
    handleShareInvoiceWhatsApp,
    handleUploadMediaFile,
    handleOpenNewApproval,
    shareApprovalWhatsApp,
    handleSaveApproval,
    handleDeleteApproval,
    copyApprovalLink,
    navigate,
  };
};

export type AgencyDashboardController = ReturnType<
  typeof useAgencyDashboardController
>;
