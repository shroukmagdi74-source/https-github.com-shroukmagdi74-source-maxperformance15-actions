import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { businessSpecialtyService, type BusinessSpecialty } from "../../../services/businessSpecialtyService";
import { extractErrorMessage } from "../utils";
import type { Company, CompanyFormData } from "../types";

interface UseCompanyFormModalOptions {
  createCompany: { mutateAsync: (data: any) => Promise<any> };
  editCompany: { mutateAsync: (data: any) => Promise<any> };
}

export function useCompanyFormModal({ createCompany, editCompany }: UseCompanyFormModalOptions) {
  const [specialties, setSpecialties] = useState<BusinessSpecialty[]>([]);
  useEffect(() => {
    businessSpecialtyService
      .listSpecialties()
      .then((list) => setSpecialties(list.filter((s) => s.isActive)))
      .catch((err) => console.error("Failed to load specialties", err));
  }, []);

  const [companyModal, setCompanyModal] = useState<{
    open: boolean;
    mode: "create" | "edit";
    company: Company | null;
  }>({ open: false, mode: "create", company: null });

  const [companyForm, setCompanyForm] = useState<CompanyFormData>({
    name: "",
    email: "",
    phone: "",
    website: "",
    currency: "EGP",
    businessSpecialtyId: "",
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminPassword: "",
  });
  const [companyFormErrors, setCompanyFormErrors] = useState<Record<string, string>>({});
  const [savingCompany, setSavingCompany] = useState(false);

  const handleCreateCompany = useCallback(() => {
    setCompanyForm({
      name: "",
      email: "",
      phone: "",
      website: "",
      currency: "EGP",
      businessSpecialtyId: "",
      adminFirstName: "",
      adminLastName: "",
      adminEmail: "",
      adminPassword: "",
    });
    setCompanyFormErrors({});
    setCompanyModal({ open: true, mode: "create", company: null });
  }, []);

  const handleEditCompany = useCallback((company: Company) => {
    setCompanyForm({
      name: company.name || "",
      email: company.email || "",
      phone: company.phone || "",
      website: company.website || "",
      currency: company.currency || "EGP",
      businessSpecialtyId:
        company.businessSpecialtyId || company.businessSpecialty?.id || "",
      adminFirstName: "",
      adminLastName: "",
      adminEmail: "",
      adminPassword: "",
    });
    setCompanyFormErrors({});
    setCompanyModal({ open: true, mode: "edit", company });
  }, []);

  const validateCompanyForm = () => {
    const errors: Record<string, string> = {};
    if (!companyForm.name.trim()) errors.name = "اسم الشركة مطلوب";
    if (!companyForm.email.trim()) errors.email = "البريد الإلكتروني مطلوب";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyForm.email))
      errors.email = "صيغة غير صحيحة";
    if (companyModal.mode === "create") {
      if (!companyForm.adminFirstName.trim()) errors.adminFirstName = "مطلوب";
      if (!companyForm.adminLastName.trim()) errors.adminLastName = "مطلوب";
      if (!companyForm.adminEmail.trim()) errors.adminEmail = "مطلوب";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyForm.adminEmail))
        errors.adminEmail = "صيغة غير صحيحة";
      if (!companyForm.adminPassword.trim()) errors.adminPassword = "مطلوبة";
    }
    setCompanyFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveCompany = async () => {
    if (!validateCompanyForm()) return;
    setSavingCompany(true);
    try {
      if (companyModal.mode === "create") {
        await createCompany.mutateAsync({
          name: companyForm.name.trim(),
          email: companyForm.email.trim(),
          phone: companyForm.phone.trim() || undefined,
          website: companyForm.website.trim() || undefined,
          currency: companyForm.currency,
          businessSpecialtyId: companyForm.businessSpecialtyId || undefined,
          adminFirstName: companyForm.adminFirstName.trim(),
          adminLastName: companyForm.adminLastName.trim(),
          adminEmail: companyForm.adminEmail.trim(),
          adminPassword: companyForm.adminPassword,
        });
      } else if (companyModal.company) {
        await editCompany.mutateAsync({
          id: companyModal.company.id,
          name: companyForm.name.trim(),
          email: companyForm.email.trim(),
          phone: companyForm.phone.trim() || "",
          website: companyForm.website.trim() || "",
          currency: companyForm.currency,
          businessSpecialtyId: companyForm.businessSpecialtyId || null,
        });
      }
      setCompanyModal((prev) => ({ ...prev, open: false }));
    } catch (err) {
      toast.error(extractErrorMessage(err, "فشل في الحفظ"));
    } finally {
      setSavingCompany(false);
    }
  };

  return {
    specialties,
    companyModal,
    setCompanyModal,
    companyForm,
    setCompanyForm,
    companyFormErrors,
    savingCompany,
    handleCreateCompany,
    handleEditCompany,
    handleSaveCompany,
  };
}
