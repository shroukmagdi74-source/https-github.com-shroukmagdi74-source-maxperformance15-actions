import { useState, useCallback } from "react";
import { toast } from "sonner";
import { tToast } from "../../../utils/i18n-toast";
import { tokenManager } from "../../../utils/tokenManager";
import { apiClient } from "../../../services/apiClient";
import { extractErrorMessage } from "../utils";
import { useCompanyFormModal } from "./useCompanyFormModal";
import { useCompanyFollowUpModal } from "./useCompanyFollowUpModal";
import type { Company, EmployeeFormData } from "../types";

interface UseSuperAdminCompaniesModalsOptions {
  admin: { id?: string } | null | undefined;
  refetch: () => void;
  createCompany: { mutateAsync: (data: any) => Promise<any> };
  editCompany: { mutateAsync: (data: any) => Promise<any> };
  bulkDelete: { mutateAsync: (ids: string[]) => Promise<any> };
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export function useSuperAdminCompaniesModals({
  admin,
  refetch,
  createCompany,
  editCompany,
  bulkDelete,
  setSelectedIds,
}: UseSuperAdminCompaniesModalsOptions) {
  // Company Form Modal Hook
  const companyFormState = useCompanyFormModal({ createCompany, editCompany });

  // Follow-Up Modal Hook
  const followUpState = useCompanyFollowUpModal({ admin, refetch });

  // Add Employee Modal
  const [ownersOpen, setOwnersOpen] = useState(false);
  const [employeeForm, setEmployeeForm] = useState<EmployeeFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "COMPANY_ADMIN",
  });
  const [employeeErrors, setEmployeeErrors] = useState<Record<string, string>>({});
  const [savingEmployee, setSavingEmployee] = useState(false);

  // Company Users Modal
  const [usersOpen, setUsersOpen] = useState(false);
  const [userCompany, setUserCompany] = useState<Company | null>(null);

  // Facebook Pages Modal
  const [pagesOpen, setPagesOpen] = useState(false);
  const [pagesCompany, setPagesCompany] = useState<Company | null>(null);
  const [pages, setPages] = useState<
    {
      id: string;
      pageName: string;
      pageId: string;
      status: string;
      connectedAt?: string;
      updatedAt?: string;
      messageCount?: number;
    }[]
  >([]);
  const [loadingPages, setLoadingPages] = useState(false);

  // Transfer Ownership Modal
  const [ownerTransferOpen, setOwnerTransferOpen] = useState(false);
  const [ownerTransferCompany, setOwnerTransferCompany] = useState<Company | null>(null);
  const [ownerTransferTarget, setOwnerTransferTarget] = useState("");
  const [transferring, setTransferring] = useState(false);

  // Mobile Actions Sheet
  const [actionsSheetOpen, setActionsSheetOpen] = useState(false);
  const [actionsCompany, setActionsCompany] = useState<Company | null>(null);

  // Delete Dialog
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    ids: string[];
    name: string;
  }>({ open: false, ids: [], name: "" });
  const [deleting, setDeleting] = useState(false);

  const [activeCompany, setActiveCompany] = useState<Company | null>(null);

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await bulkDelete.mutateAsync(deleteDialog.ids);
      setDeleteDialog({ open: false, ids: [], name: "" });
      setSelectedIds([]);
    } catch {
      /* handled by mutation */
    } finally {
      setDeleting(false);
    }
  };

  const handleLoginAsAdmin = useCallback(async (company: Company) => {
    try {
      const res = await apiClient.post(`/admin/companies/${company.id}/login-as-admin`);
      if (res.data?.success) {
        const superToken = tokenManager.getAccessToken();
        if (superToken) localStorage.setItem("superAuth", superToken);
        const u = localStorage.getItem("user");
        if (u) localStorage.setItem("superUser", u);
        tokenManager.setAccessToken(res.data.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.data.user));
        window.location.href = "/company-dashboard";
      } else toast.error(res.data?.message || "فشل تسجيل الدخول");
    } catch (err) {
      toast.error(extractErrorMessage(err, "فشل تسجيل الدخول"));
    }
  }, []);

  const handleOpenWhatsApp = useCallback((company: Company) => {
    const phone = company.phone?.replace(/\s+/g, "").replace(/^0+/, "");
    if (!phone) {
      tToast.error("index.msg_5363");
      return;
    }
    const full = phone.startsWith("+")
      ? phone.slice(1)
      : phone.startsWith("20")
      ? phone
      : `20${phone}`;
    window.open(`https://wa.me/${full}`, "_blank", "noopener,noreferrer");
  }, []);

  const handleOpenUsers = useCallback(async (company: Company) => {
    setUserCompany(company);
    setUsersOpen(true);
  }, []);

  const handleOpenFacebookPages = useCallback(async (company: Company) => {
    setPagesCompany(company);
    setPages([]);
    setPagesOpen(true);
    setLoadingPages(true);
    try {
      const res = await apiClient.get(`/admin/companies/${company.id}/facebook-pages`);
      if (res.data?.success) setPages(res.data.data || []);
      else toast.error(res.data?.message || "فشل");
    } catch (err) {
      toast.error(extractErrorMessage(err, "فشل"));
    } finally {
      setLoadingPages(false);
    }
  }, []);

  const handleTransferOwnership = useCallback((company: Company) => {
    setOwnerTransferCompany(company);
    setOwnerTransferTarget("");
    setOwnerTransferOpen(true);
  }, []);

  const handleTransferConfirm = async () => {
    if (!ownerTransferCompany) return;
    setTransferring(true);
    try {
      const res = await apiClient.post(
        `/admin/companies/${ownerTransferCompany.id}/transfer-ownership`,
        { targetUserId: ownerTransferTarget }
      );
      if (res.data?.success) {
        tToast.success("index.msg_3f26");
        setOwnerTransferOpen(false);
        refetch();
      } else toast.error(res.data?.message || "فشل");
    } catch (err) {
      toast.error(extractErrorMessage(err, "فشل"));
    } finally {
      setTransferring(false);
    }
  };

  const handleAddEmployee = useCallback((company: Company) => {
    setActiveCompany(company);
    setEmployeeForm({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "COMPANY_ADMIN",
    });
    setEmployeeErrors({});
    setOwnersOpen(true);
  }, []);

  const validateEmployeeForm = () => {
    const errors: Record<string, string> = {};
    if (!employeeForm.firstName.trim()) errors.firstName = "مطلوب";
    if (!employeeForm.lastName.trim()) errors.lastName = "مطلوب";
    if (!employeeForm.email.trim()) errors.email = "مطلوب";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employeeForm.email))
      errors.email = "صيغة غير صحيحة";
    if (!employeeForm.password.trim()) errors.password = "مطلوبة";
    setEmployeeErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddEmployeeSubmit = async () => {
    if (!activeCompany || !validateEmployeeForm()) return;
    setSavingEmployee(true);
    try {
      const res = await apiClient.post(
        `/admin/companies/${activeCompany.id}/employees`,
        {
          firstName: employeeForm.firstName.trim(),
          lastName: employeeForm.lastName.trim(),
          email: employeeForm.email.trim(),
          password: employeeForm.password,
          role: employeeForm.role,
        }
      );
      if (res.data?.success) {
        tToast.success("index.msg_8006");
        setOwnersOpen(false);
        refetch();
      } else toast.error(res.data?.message || "فشل");
    } catch (err) {
      toast.error(extractErrorMessage(err, "فشل"));
    } finally {
      setSavingEmployee(false);
    }
  };

  const handleDeleteCompany = useCallback((company: Company) => {
    setDeleteDialog({ open: true, ids: [company.id], name: company.name });
  }, []);

  return {
    ...companyFormState,
    ...followUpState,
    ownersOpen,
    setOwnersOpen,
    employeeForm,
    setEmployeeForm,
    employeeErrors,
    savingEmployee,
    usersOpen,
    setUsersOpen,
    userCompany,
    pagesOpen,
    setPagesOpen,
    pagesCompany,
    pages,
    loadingPages,
    ownerTransferOpen,
    setOwnerTransferOpen,
    ownerTransferCompany,
    ownerTransferTarget,
    setOwnerTransferTarget,
    transferring,
    actionsSheetOpen,
    setActionsSheetOpen,
    actionsCompany,
    setActionsCompany,
    deleteDialog,
    setDeleteDialog,
    deleting,
    activeCompany,
    handleTransferOwnership,
    handleTransferConfirm,
    handleAddEmployee,
    handleAddEmployeeSubmit,
    handleDeleteCompany,
    handleDeleteConfirm,
    handleLoginAsAdmin,
    handleOpenWhatsApp,
    handleOpenUsers,
    handleOpenFacebookPages,
  };
}
