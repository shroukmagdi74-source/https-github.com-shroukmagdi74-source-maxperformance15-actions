import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import api from "../../../services/api";
import { toast } from "sonner";
import { tToast } from "../../../utils/i18n-toast";
import {
  Benefit,
  Employee,
  BenefitFormData,
  EnrollmentFormData,
  PaginationState,
} from "./types";
import {
  createDefaultBenefitForm,
  createDefaultEnrollmentForm,
} from "./helpers";

export const useBenefitsController = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedBenefit, setSelectedBenefit] = useState<Benefit | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [enrollLoading, setEnrollLoading] = useState(false);

  const [formData, setFormData] = useState<BenefitFormData>(
    createDefaultBenefitForm(),
  );

  const [enrollmentFormData, setEnrollmentFormData] =
    useState<EnrollmentFormData>(createDefaultEnrollmentForm());

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationState>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  useEffect(() => {
    setPage(1);
  }, [search, typeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBenefits();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, typeFilter, page]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (id && id !== "new") {
      fetchBenefitDetails(id);
    } else if (location.pathname.endsWith("/new")) {
      setDialogOpen(true);
    }
  }, [id, location.pathname]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/hr/employees?limit=1000");
      setEmployees(response.data?.employees || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchBenefitDetails = async (benefitId: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/hr/benefits/${benefitId}`);
      setSelectedBenefit(response.data?.benefit || null);
      setDetailsOpen(true);
    } catch (error) {
      console.error("Error fetching benefit details:", error);
      tToast.error("benefits.failed_fetch_81e2");
      navigate("/hr/benefits");
    } finally {
      setLoading(false);
    }
  };

  const fetchBenefits = async () => {
    try {
      setLoading(true);
      const response = await api.get("/hr/benefits", {
        params: {
          search,
          type: typeFilter,
          page,
          limit: 9,
        },
      });
      setBenefits(response.data?.benefits || []);
      setPagination(
        response.data?.pagination || {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      );
    } catch (error) {
      console.error("Error fetching benefits:", error);
      tToast.error("benefits.failed_fetch_cfae");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!enrollmentFormData.employeeId) {
      tToast.error("benefits.msg_7103");
      return;
    }

    try {
      setEnrollLoading(true);
      await api.post("/hr/benefits/enroll", {
        benefitId: selectedBenefit?.id,
        ...enrollmentFormData,
      });
      tToast.success("benefits.success_login_9cb9");
      setEnrollmentFormData(createDefaultEnrollmentForm());
      if (selectedBenefit) {
        fetchBenefitDetails(selectedBenefit.id);
      }
      fetchBenefits();
    } catch (error: any) {
      console.error("Error enrolling employee:", error);
      toast.error(error.response?.data?.error || "فشل في تسجيل الموظف");
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      tToast.error("benefits.name_required_6cb0");
      return;
    }

    try {
      setSubmitting(true);
      if (editingId) {
        await api.put(`/hr/benefits/${editingId}`, formData);
        tToast.success("benefits.success_update_38b1");
      } else {
        await api.post("/hr/benefits", formData);
        tToast.success("benefits.success_create_3efd");
      }
      setDialogOpen(false);
      resetForm();
      fetchBenefits();
      if (!editingId && location.pathname.endsWith("/new")) {
        navigate("/hr/benefits");
      }
    } catch (error: any) {
      console.error("Error saving benefit:", error);
      toast.error(
        error.response?.data?.error ||
          (editingId ? "فشل في تحديث الميزة" : "فشل في إنشاء الميزة"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, benefitId: string) => {
    e.stopPropagation();
    if (!confirm("هل أنت متأكد من حذف هذه الميزة؟")) return;

    try {
      await api.delete(`/hr/benefits/${benefitId}`);
      tToast.success("benefits.success_delete_aded");
      fetchBenefits();
    } catch (error) {
      console.error("Error deleting benefit:", error);
      tToast.error("benefits.failed_delete_29dd");
    }
  };

  const resetForm = () => {
    setFormData(createDefaultBenefitForm());
    setEditingId(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
    navigate("/hr/benefits/new");
  };

  const openEditDialog = (benefit: Benefit) => {
    setFormData({
      name: benefit.name || "",
      description: benefit.description || "",
      type: benefit.type || "health_insurance",
      cost: benefit.cost || 0,
      currency: benefit.currency || "EGP",
      isActive: benefit.isActive,
    });
    setEditingId(benefit.id);
    setDialogOpen(true);
  };

  return {
    benefits,
    loading,
    dialogOpen,
    setDialogOpen,
    detailsOpen,
    setDetailsOpen,
    submitting,
    editingId,
    selectedBenefit,
    setSelectedBenefit,
    employees,
    enrollLoading,
    formData,
    setFormData,
    enrollmentFormData,
    setEnrollmentFormData,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    page,
    setPage,
    pagination,
    fetchBenefits,
    fetchBenefitDetails,
    fetchEmployees,
    handleEnroll,
    handleSubmit,
    handleDelete,
    resetForm,
    openCreateDialog,
    openEditDialog,
  };
};
