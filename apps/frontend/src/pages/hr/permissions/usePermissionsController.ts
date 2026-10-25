import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../../../services/api";
import { toast } from "sonner";
import {
  PermissionRequest,
  PermissionFormData,
  PermissionStats,
  PaginationState,
} from "./types";
import { calculateHours, createDefaultPermissionForm } from "./helpers";

export const usePermissionsController = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const isMyPermissions = location.pathname === "/my-permissions";

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<PermissionRequest[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [stats, setStats] = useState<PermissionStats | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PermissionRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<PermissionFormData>(createDefaultPermissionForm());

  useEffect(() => {
    fetchPermissions();
    fetchStats();
    if (!isMyPermissions) fetchEmployees();
  }, [pagination.page, typeFilter, activeTab, isMyPermissions]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/hr/employees?limit=100");
      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (activeTab === "pending") {
        params.append("status", "PENDING");
      } else if (activeTab === "approved") {
        params.append("status", "APPROVED");
      } else if (activeTab === "rejected") {
        params.append("status", "REJECTED");
      }

      if (typeFilter && typeFilter !== "all") params.append("type", typeFilter);
      if (isMyPermissions) {
        params.append("mine", "true");
      }

      const response = await api.get(`/hr/permissions?${params}`);
      setRequests(response.data.requests);
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages,
      }));
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error(t("employee.permissions.fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const url = isMyPermissions ? "/hr/permissions/stats?mine=true" : "/hr/permissions/stats";
      const response = await api.get(url);
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const resetForm = () => {
    setFormData(createDefaultPermissionForm());
    setFieldErrors({});
  };

  const handleCreate = async () => {
    if (!isMyPermissions && !formData.employeeId) {
      toast.error(t("employee.permissions.employeeRequired"));
      return;
    }

    if (!formData.reason || formData.reason.trim() === "") {
      toast.error(t("employee.permissions.reasonRequired"));
      return;
    }

    try {
      setSubmitting(true);
      setFieldErrors({});

      const totalHoursStr = calculateHours(formData.startTime, formData.endTime);
      const payload = {
        ...formData,
        totalHours: parseFloat(totalHoursStr),
      };

      const response = await api.post("/hr/permissions", payload);

      if (response.data.success) {
        toast.success(t("employee.permissions.createSuccess"));
        setShowAddDialog(false);
        resetForm();
        await Promise.all([fetchPermissions(), fetchStats()]);
      }
    } catch (error: any) {
      console.error("Error creating permission:", error);
      const errorMessage =
        error.response?.data?.message || t("employee.permissions.createError");

      if (
        error.response?.data?.errors &&
        Array.isArray(error.response.data.errors)
      ) {
        const errors: Record<string, string> = {};
        error.response.data.errors.forEach((err: any) => {
          errors[err.field] = err.message;
        });
        setFieldErrors(errors);
        toast.error(t("employee.permissions.validationError"));
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      await api.post(`/hr/permissions/${requestId}/approve`);
      toast.success(t("employee.permissions.approveSuccess"));
      fetchPermissions();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("employee.permissions.approveError"));
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason) {
      toast.error(t("employee.permissions.rejectReasonRequired"));
      return;
    }
    try {
      await api.post(`/hr/permissions/${selectedRequest.id}/reject`, {
        reason: rejectionReason,
      });
      toast.success(t("employee.permissions.rejectSuccess"));
      setShowRejectDialog(false);
      setRejectionReason("");
      fetchPermissions();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("employee.permissions.rejectError"));
    }
  };

  const handleDelete = (request: PermissionRequest) => {
    setSelectedRequest(request);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedRequest) return;

    try {
      setSubmitting(true);
      await api.delete(`/hr/permissions/${selectedRequest.id}`);
      toast.success(t("employee.permissions.deleteSuccess"));
      setShowDeleteDialog(false);
      setSelectedRequest(null);
      fetchPermissions();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("employee.permissions.deleteError"));
    } finally {
      setSubmitting(false);
    }
  };

  return {
    isMyPermissions,
    loading,
    requests,
    employees,
    stats,
    pagination,
    setPagination,
    typeFilter,
    setTypeFilter,
    activeTab,
    setActiveTab,
    showAddDialog,
    setShowAddDialog,
    showDetailsDialog,
    setShowDetailsDialog,
    showRejectDialog,
    setShowRejectDialog,
    showDeleteDialog,
    setShowDeleteDialog,
    selectedRequest,
    setSelectedRequest,
    rejectionReason,
    setRejectionReason,
    fieldErrors,
    submitting,
    formData,
    setFormData,
    resetForm,
    fetchPermissions,
    fetchStats,
    handleCreate,
    handleApprove,
    handleReject,
    handleDelete,
    confirmDelete,
  };
};
