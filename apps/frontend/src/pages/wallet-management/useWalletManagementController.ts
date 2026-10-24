import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Building2, ReceiptText, ShieldCheck, Wallet } from "lucide-react";
import { tToast } from "@/utils/i18n-toast";
import { apiClient } from "@/services/apiClient";
import {
  type ApiResponse,
  type CompanyWalletRecord,
  type FundsFormState,
  INITIAL_FUNDS_FORM,
  INITIAL_WALLET_FORM,
  type PendingReceiptRecord,
  type WalletFormState,
  type WalletNumberRecord,
  type WalletTab,
  formatCurrency,
  getApiErrorMessage,
  toNumber,
} from "./types";

export const useWalletManagementController = () => {
  const [activeTab, setActiveTab] = useState<WalletTab>("wallets");

  const [walletNumbers, setWalletNumbers] = useState<WalletNumberRecord[]>([]);
  const [pendingReceipts, setPendingReceipts] = useState<PendingReceiptRecord[]>([]);
  const [companyWallets, setCompanyWallets] = useState<CompanyWalletRecord[]>([]);

  const [loadingState, setLoadingState] = useState<Record<WalletTab, boolean>>({
    wallets: false,
    receipts: false,
    companies: false,
  });
  const [sectionErrors, setSectionErrors] = useState<Record<WalletTab, string | null>>({
    wallets: null,
    receipts: null,
    companies: null,
  });
  const [companiesLoaded, setCompaniesLoaded] = useState(false);

  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [addFundsDialogOpen, setAddFundsDialogOpen] = useState(false);

  const [editingWallet, setEditingWallet] = useState<WalletNumberRecord | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<PendingReceiptRecord | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CompanyWalletRecord | null>(null);
  const [walletPendingDelete, setWalletPendingDelete] = useState<WalletNumberRecord | null>(null);

  const [walletForm, setWalletForm] = useState<WalletFormState>(INITIAL_WALLET_FORM);
  const [fundsForm, setFundsForm] = useState<FundsFormState>(INITIAL_FUNDS_FORM);
  const [companySearch, setCompanySearch] = useState("");

  const [savingWallet, setSavingWallet] = useState(false);
  const [addingFunds, setAddingFunds] = useState(false);
  const [reviewingReceipt, setReviewingReceipt] = useState(false);
  const [deletingWallet, setDeletingWallet] = useState(false);
  const [togglingWalletId, setTogglingWalletId] = useState<string | null>(null);

  const setSectionLoading = (tab: WalletTab, value: boolean) => {
    setLoadingState((current) => ({ ...current, [tab]: value }));
  };

  const setSectionError = (tab: WalletTab, value: string | null) => {
    setSectionErrors((current) => ({ ...current, [tab]: value }));
  };

  const fetchWalletNumbers = useCallback(async () => {
    setSectionLoading("wallets", true);
    setSectionError("wallets", null);

    try {
      const response = await apiClient.get<ApiResponse<WalletNumberRecord[]>>(
        "/wallet-payment/admin/wallet-numbers",
      );
      setWalletNumbers(response.data.data ?? []);
    } catch (error: unknown) {
      setSectionError(
        "wallets",
        getApiErrorMessage(error, "تعذر تحميل أرقام المحافظ الحالية."),
      );
    } finally {
      setSectionLoading("wallets", false);
    }
  }, []);

  const fetchPendingReceipts = useCallback(async () => {
    setSectionLoading("receipts", true);
    setSectionError("receipts", null);

    try {
      const response = await apiClient.get<ApiResponse<PendingReceiptRecord[]>>(
        "/wallet-payment/admin/pending-receipts",
      );
      setPendingReceipts(response.data.data ?? []);
    } catch (error: unknown) {
      setSectionError(
        "receipts",
        getApiErrorMessage(error, "تعذر تحميل الإيصالات المعلقة."),
      );
    } finally {
      setSectionLoading("receipts", false);
    }
  }, []);

  const fetchCompanyWallets = useCallback(async () => {
    setSectionLoading("companies", true);
    setSectionError("companies", null);

    try {
      const response = await apiClient.get<ApiResponse<CompanyWalletRecord[]>>(
        "/admin/wallet/companies",
      );
      setCompanyWallets(response.data.data ?? []);
      setCompaniesLoaded(true);
    } catch (error: unknown) {
      setSectionError(
        "companies",
        getApiErrorMessage(error, "تعذر تحميل محافظ الشركات."),
      );
    } finally {
      setSectionLoading("companies", false);
    }
  }, []);

  useEffect(() => {
    void fetchWalletNumbers();
    void fetchPendingReceipts();
  }, [fetchPendingReceipts, fetchWalletNumbers]);

  useEffect(() => {
    if (activeTab === "companies" && !companiesLoaded) {
      void fetchCompanyWallets();
    }
  }, [activeTab, companiesLoaded, fetchCompanyWallets]);

  const filteredCompanyWallets = useMemo(() => {
    const query = companySearch.trim().toLowerCase();
    if (!query) {
      return companyWallets;
    }

    return companyWallets.filter((wallet) => {
      return (
        wallet.companyName.toLowerCase().includes(query) ||
        wallet.companyEmail.toLowerCase().includes(query)
      );
    });
  }, [companySearch, companyWallets]);

  const companyBalanceTotal = useMemo(() => {
    return companyWallets.reduce(
      (sum, wallet) => sum + toNumber(wallet.balance),
      0,
    );
  }, [companyWallets]);

  const metrics = useMemo(() => {
    const activeWalletsCount = walletNumbers.filter((wallet) => wallet.isActive).length;

    return [
      {
        title: "المحافظ المسجلة",
        value: walletNumbers.length,
        subtitle: "كل محافظ الدفع المربوطة بلوحة الإدارة.",
        tone: "primary" as const,
        icon: Wallet,
      },
      {
        title: "المحافظ النشطة",
        value: activeWalletsCount,
        subtitle: "محافظ متاحة حاليًا لاستقبال المدفوعات.",
        tone: "success" as const,
        icon: ShieldCheck,
      },
      {
        title: "الإيصالات المعلقة",
        value: pendingReceipts.length,
        subtitle: "تحتاج قرار اعتماد أو رفض من الإدارة.",
        tone: "warning" as const,
        icon: ReceiptText,
      },
      {
        title: "إجمالي أرصدة الشركات",
        value: companiesLoaded ? formatCurrency(companyBalanceTotal) : "—",
        subtitle: companiesLoaded
          ? "مجموع الأرصدة الحالية لكل الشركات."
          : "سيظهر بعد فتح تبويب محافظ الشركات.",
        tone: "secondary" as const,
        icon: Building2,
      },
    ];
  }, [companiesLoaded, companyWallets, pendingReceipts.length, walletNumbers]);

  const activeTabDescription = useMemo(() => {
    switch (activeTab) {
      case "wallets":
        return "إدارة وسائل الدفع اليدوي وتفعيلها أو تعديلها من شاشة واحدة أوضح على الموبايل.";
      case "receipts":
        return "مراجعة الإيصالات المرسلة بسرعة مع تجربة عرض أنسب للمحمول وسهلة الصيانة.";
      case "companies":
        return "متابعة أرصدة الشركات والبحث عنها وإضافة الرصيد بدون الاعتماد على جداول MUI القديمة.";
      default:
        return "";
    }
  }, [activeTab]);

  const updateWalletForm = (field: keyof WalletFormState, value: string) => {
    setWalletForm((current) => ({ ...current, [field]: value }));
  };

  const updateFundsForm = (field: keyof FundsFormState, value: string) => {
    setFundsForm((current) => ({ ...current, [field]: value }));
  };

  const openCreateWallet = () => {
    setEditingWallet(null);
    setWalletForm(INITIAL_WALLET_FORM);
    setWalletDialogOpen(true);
  };

  const openEditWallet = (wallet: WalletNumberRecord) => {
    setEditingWallet(wallet);
    setWalletForm({
      name: wallet.name ?? "",
      number: wallet.number ?? "",
      icon: wallet.icon ?? "",
      color: wallet.color ?? "#1d4ed8",
    });
    setWalletDialogOpen(true);
  };

  const openReceiptDialog = (receipt: PendingReceiptRecord) => {
    setSelectedReceipt(receipt);
    setReceiptDialogOpen(true);
  };

  const openAddFundsDialog = (wallet: CompanyWalletRecord) => {
    setSelectedCompany(wallet);
    setFundsForm(INITIAL_FUNDS_FORM);
    setAddFundsDialogOpen(true);
  };

  const refreshCurrentTab = async () => {
    switch (activeTab) {
      case "wallets":
        await fetchWalletNumbers();
        return;
      case "receipts":
        await fetchPendingReceipts();
        return;
      case "companies":
        await fetchCompanyWallets();
        return;
      default:
        return;
    }
  };

  const handleSaveWallet = async () => {
    if (!walletForm.name.trim() || !walletForm.number.trim()) {
      tToast.error("WalletManagement.msg_9034");
      return;
    }

    setSavingWallet(true);

    try {
      if (editingWallet) {
        await apiClient.put(
          `/wallet-payment/admin/wallet-numbers/${editingWallet.id}`,
          {
            ...walletForm,
            isActive: editingWallet.isActive,
          },
        );
        tToast.success("WalletManagement.success_update_c3e3");
      } else {
        await apiClient.post("/wallet-payment/admin/wallet-numbers", walletForm);
        tToast.success("WalletManagement.msg_1efc");
      }

      setWalletDialogOpen(false);
      setEditingWallet(null);
      setWalletForm(INITIAL_WALLET_FORM);
      await fetchWalletNumbers();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "تعذر حفظ بيانات المحفظة."));
    } finally {
      setSavingWallet(false);
    }
  };

  const handleToggleWallet = async (
    wallet: WalletNumberRecord,
    nextValue: boolean,
  ) => {
    setTogglingWalletId(wallet.id);

    try {
      await apiClient.put(`/wallet-payment/admin/wallet-numbers/${wallet.id}`, {
        name: wallet.name,
        number: wallet.number,
        isActive: nextValue,
        icon: wallet.icon ?? "",
        color: wallet.color ?? "#1d4ed8",
      });
      setWalletNumbers((current) =>
        current.map((entry) =>
          entry.id === wallet.id ? { ...entry, isActive: nextValue } : entry,
        ),
      );
      toast.success(nextValue ? "تم تفعيل المحفظة" : "تم إيقاف المحفظة");
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "تعذر تحديث حالة المحفظة."));
    } finally {
      setTogglingWalletId(null);
    }
  };

  const handleDeleteWallet = async () => {
    if (!walletPendingDelete) {
      return;
    }

    setDeletingWallet(true);

    try {
      await apiClient.delete(
        `/wallet-payment/admin/wallet-numbers/${walletPendingDelete.id}`,
      );
      tToast.success("WalletManagement.success_delete_cda7");
      setWalletPendingDelete(null);
      await fetchWalletNumbers();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "تعذر حذف المحفظة."));
    } finally {
      setDeletingWallet(false);
    }
  };

  const handleReviewReceipt = async (decision: "approve" | "reject") => {
    if (!selectedReceipt?.id) {
      return;
    }

    setReviewingReceipt(true);

    try {
      await apiClient.post(
        `/wallet-payment/admin/review-receipt/${selectedReceipt.id}`,
        {
          action: decision,
          notes: "",
        },
      );
      toast.success(
        decision === "approve"
          ? "تم اعتماد الإيصال بنجاح"
          : "تم رفض الإيصال بنجاح",
      );
      setReceiptDialogOpen(false);
      setSelectedReceipt(null);
      await fetchPendingReceipts();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "تعذر تحديث حالة الإيصال."));
    } finally {
      setReviewingReceipt(false);
    }
  };

  const handleAddFunds = async () => {
    if (!selectedCompany) {
      return;
    }

    const amount = Number(fundsForm.amount);
    const bonus = fundsForm.bonus ? Number(fundsForm.bonus) : 0;

    if (!Number.isFinite(amount) || amount <= 0) {
      tToast.error("WalletManagement.msg_834a");
      return;
    }

    if (!Number.isFinite(bonus) || bonus < 0) {
      tToast.error("WalletManagement.msg_2a19");
      return;
    }

    setAddingFunds(true);

    try {
      await apiClient.post("/admin/wallet/add-funds", {
        companyId: selectedCompany.companyId,
        amount,
        bonus,
        notes: fundsForm.notes,
      });
      tToast.success("WalletManagement.success_add_ca6f");
      setAddFundsDialogOpen(false);
      setSelectedCompany(null);
      setFundsForm(INITIAL_FUNDS_FORM);
      await fetchCompanyWallets();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "تعذر إضافة الرصيد للشركة."));
    } finally {
      setAddingFunds(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    walletNumbers,
    pendingReceipts,
    companyWallets,
    loadingState,
    sectionErrors,
    companiesLoaded,
    walletDialogOpen,
    setWalletDialogOpen,
    receiptDialogOpen,
    setReceiptDialogOpen,
    addFundsDialogOpen,
    setAddFundsDialogOpen,
    editingWallet,
    setEditingWallet,
    selectedReceipt,
    setSelectedReceipt,
    selectedCompany,
    setSelectedCompany,
    walletPendingDelete,
    setWalletPendingDelete,
    walletForm,
    setWalletForm,
    fundsForm,
    setFundsForm,
    companySearch,
    setCompanySearch,
    savingWallet,
    addingFunds,
    reviewingReceipt,
    deletingWallet,
    togglingWalletId,
    filteredCompanyWallets,
    companyBalanceTotal,
    metrics,
    activeTabDescription,
    updateWalletForm,
    updateFundsForm,
    openCreateWallet,
    openEditWallet,
    openReceiptDialog,
    openAddFundsDialog,
    refreshCurrentTab,
    handleSaveWallet,
    handleToggleWallet,
    handleDeleteWallet,
    handleReviewReceipt,
    handleAddFunds,
  };
};
