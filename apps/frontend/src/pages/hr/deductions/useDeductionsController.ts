import { useState, useEffect } from "react";
import api from "../../../services/api";
import i18n from "../../../i18n";
import {
  Deduction,
  DeductionStats,
  CreateDeductionForm,
} from "./types";
import { createDefaultDeductionForm } from "./helpers";

export const useDeductionsController = () => {
  const [deductions, setDeductions] = useState<Deduction[]>([]);
  const [filteredDeductions, setFilteredDeductions] = useState<Deduction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DeductionStats | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDeduction, setSelectedDeduction] = useState<Deduction | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState<CreateDeductionForm>(
    createDefaultDeductionForm(),
  );

  useEffect(() => {
    loadData();
    loadEmployees();
  }, []);

  useEffect(() => {
    filterDeductions();
  }, [
    deductions,
    searchTerm,
    filterStatus,
    filterType,
    filterMonth,
    filterYear,
  ]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [deductionsRes, statsRes] = await Promise.all([
        api.get("/hr/deductions"),
        api.get("/hr/deductions/stats"),
      ]);

      if (deductionsRes.data?.success) {
        setDeductions(deductionsRes.data.deductions || []);
      }

      if (statsRes.data?.success) {
        setStats(statsRes.data.stats || null);
      }
    } catch (error: any) {
      console.error("❌ Error loading deductions:", error);
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "حدث خطأ أثناء جلب الخصومات";
      const details = error.response?.data?.details || "";
      alert(`${errorMsg}\n${details ? `التفاصيل: ${details}` : ""}`);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await api.get("/hr/employees");
      if (response.data?.success) {
        setEmployees(response.data.employees || []);
      }
    } catch (error) {
      console.error("Error loading employees:", error);
    }
  };

  const filterDeductions = () => {
    let filtered = [...deductions];

    if (searchTerm) {
      filtered = filtered.filter(
        (d) =>
          d.employee?.firstName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          d.employee?.lastName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          d.employee?.employeeNumber
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          d.reason?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (filterStatus) {
      filtered = filtered.filter((d) => d.status === filterStatus);
    }

    if (filterType) {
      filtered = filtered.filter((d) => d.type === filterType);
    }

    if (filterMonth && filterYear) {
      filtered = filtered.filter(
        (d) =>
          d.effectiveMonth === parseInt(filterMonth) &&
          d.effectiveYear === parseInt(filterYear),
      );
    }

    setFilteredDeductions(filtered);
  };

  const handleCreateDeduction = async () => {
    try {
      if (!createForm.employeeId) {
        alert(i18n.t("Deductions.msg_8727"));
        return;
      }

      if (!createForm.amount || parseFloat(createForm.amount) <= 0) {
        alert(i18n.t("Deductions.msg_dc9a"));
        return;
      }

      if (!createForm.reason || createForm.reason.trim().length < 5) {
        alert(i18n.t("Deductions.please_reason_7f8b"));
        return;
      }

      let response;
      if (isEditing && editingId) {
        response = await api.put(`/hr/deductions/${editingId}`, createForm);
      } else {
        response = await api.post("/hr/deductions", createForm);
      }

      if (response.data?.success) {
        alert(isEditing ? "تم تحديث الخصم بنجاح" : "تم إنشاء الخصم بنجاح");
        setShowCreateModal(false);
        resetCreateForm();
        loadData();
      }
    } catch (error: any) {
      console.error("Error saving deduction:", error);
      let errorMessage =
        error.response?.data?.error ||
        `حدث خطأ أثناء ${isEditing ? "تحديث" : "إنشاء"} الخصم`;

      if (
        error.response?.data?.errors &&
        Array.isArray(error.response.data.errors)
      ) {
        const validationErrors = error.response.data.errors
          .map((err: any) => `${err.field}: ${err.message}`)
          .join("\n");
        errorMessage += "\n\nأخطاء التحقق:\n" + validationErrors;
      }

      alert(errorMessage);
    }
  };

  const handleEdit = (deduction: Deduction) => {
    setEditingId(deduction.id);
    setIsEditing(true);
    setCreateForm({
      employeeId: deduction.employeeId,
      type: deduction.type,
      category: deduction.category || "",
      amount: deduction.amount.toString(),
      reason: deduction.reason,
      description: deduction.description || "",
      date: deduction.date.split("T")[0],
      effectiveMonth: deduction.effectiveMonth,
      effectiveYear: deduction.effectiveYear,
      notes: deduction.notes || "",
    });
    setShowCreateModal(true);
  };

  const handleApprove = async (id: string) => {
    if (!confirm("هل أنت متأكد من الموافقة على هذا الخصم؟")) return;

    try {
      const response = await api.post(`/hr/deductions/${id}/approve`);
      if (response.data?.success) {
        alert(i18n.t("Deductions.msg_04f1"));
        loadData();
      }
    } catch (error: any) {
      console.error("Error approving deduction:", error);
      alert(error.response?.data?.error || "حدث خطأ أثناء الموافقة");
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("أدخل سبب الرفض:");
    if (!reason) return;

    try {
      const response = await api.post(`/hr/deductions/${id}/reject`, {
        reason,
      });
      if (response.data?.success) {
        alert(i18n.t("Deductions.msg_cec9"));
        loadData();
      }
    } catch (error: any) {
      console.error("Error rejecting deduction:", error);
      alert(error.response?.data?.error || "حدث خطأ أثناء الرفض");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الخصم؟")) return;

    try {
      const response = await api.delete(`/hr/deductions/${id}`);
      if (response.data?.success) {
        alert(i18n.t("Deductions.success_delete_59dc"));
        loadData();
      }
    } catch (error: any) {
      console.error("Error deleting deduction:", error);
      alert(error.response?.data?.error || "حدث خطأ أثناء الحذف");
    }
  };

  const resetCreateForm = () => {
    setCreateForm(createDefaultDeductionForm());
    setIsEditing(false);
    setEditingId(null);
  };

  const openNewDeductionModal = () => {
    setIsEditing(false);
    setEditingId(null);
    resetCreateForm();
    setShowCreateModal(true);
  };

  return {
    deductions,
    filteredDeductions,
    loading,
    stats,
    showCreateModal,
    setShowCreateModal,
    showDetailsModal,
    setShowDetailsModal,
    selectedDeduction,
    setSelectedDeduction,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterType,
    setFilterType,
    filterMonth,
    setFilterMonth,
    filterYear,
    setFilterYear,
    employees,
    isEditing,
    createForm,
    setCreateForm,
    loadData,
    handleCreateDeduction,
    handleEdit,
    handleApprove,
    handleReject,
    handleDelete,
    resetCreateForm,
    openNewDeductionModal,
  };
};
