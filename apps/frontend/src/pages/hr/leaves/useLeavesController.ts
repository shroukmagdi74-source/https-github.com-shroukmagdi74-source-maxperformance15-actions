import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import api from "../../../services/api";
import { toast } from "sonner";
import { LeaveRequest, LeaveFormData, EditLeaveFormData } from "./types";
import {
  calculateTotalDays,
  initialLeaveFormData,
  initialEditLeaveFormData,
  DEFAULT_WORKING_DAYS,
  buildLeaveQueryParams,
} from "./helpers";

export const useLeavesController = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const isMyLeaves = location.pathname === "/my-leaves";
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [workingDays, setWorkingDays] = useState<string[]>(DEFAULT_WORKING_DAYS);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showReopenDialog, setShowReopenDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showChangeDecisionDialog, setShowChangeDecisionDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [newDecision, setNewDecision] = useState<"APPROVE" | "REJECT" | "CANCELLED" | "">("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<LeaveFormData>(initialLeaveFormData);
  const [editFormData, setEditFormData] = useState<EditLeaveFormData>(initialEditLeaveFormData);

  useEffect(() => {
    fetchSettings();
    fetchEmployees();
  }, [isMyLeaves]);

  useEffect(() => {
    fetchLeaveRequests();
  }, [pagination.page, pagination.limit, statusFilter, typeFilter, activeTab, isMyLeaves]);

  useEffect(() => {
    if (location.state && (location.state as any).createNew) {
      setShowAddDialog(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const fetchSettings = async () => {
    try {
      const endpoint = isMyLeaves ? "/hr/leaves/my-config" : "/hr/settings";
      const response = await api.get(endpoint, { _skipErrorToast: true });
      if (response.data.settings?.workingDays) {
        setWorkingDays(response.data.settings.workingDays);
      }
    } catch (error) {
      console.error("Error fetching HR settings:", error);
    }
  };

  const fetchEmployees = async () => {
    if (isMyLeaves) return;
    try {
      const response = await api.get("/hr/employees?limit=100");
      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const params = buildLeaveQueryParams(
        pagination,
        activeTab,
        statusFilter,
        typeFilter,
      );

      const endpoint = isMyLeaves ? "/hr/leaves/my-history" : "/hr/leaves";
      const response = await api.get(`${endpoint}?${params}`);
      setRequests(response.data.requests || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination?.total || 0,
        totalPages: response.data.pagination?.totalPages || 0,
      }));
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      toast.error(t("employee.leaves.fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      await api.post(`/hr/leaves/${requestId}/approve`);
      toast.success(t("employee.leaves.approvedSuccess"));
      fetchLeaveRequests();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || t("employee.leaves.approveError"),
      );
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    try {
      await api.post(`/hr/leaves/${selectedRequest.id}/reject`, {
        reason: rejectionReason,
      });
      toast.success(t("employee.leaves.rejectedSuccess"));
      setShowRejectDialog(false);
      setSelectedRequest(null);
      setRejectionReason("");
      fetchLeaveRequests();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || t("employee.leaves.approveError"),
      );
    }
  };

  const handleReopenRequest = async () => {
    if (!selectedRequest) return;

    try {
      await api.post(`/hr/leaves/${selectedRequest.id}/reopen`);
      toast.success(t("employee.leaves.reopenedSuccess"));
      setShowReopenDialog(false);
      fetchLeaveRequests();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || t("employee.leaves.reopenError"),
      );
    }
  };

  const handleEditRequest = (req?: LeaveRequest) => {
    const target = req || selectedRequest;
    if (!target) return;
    if (req) setSelectedRequest(req);

    setEditFormData({
      type: target.type,
      startDate: target.startDate.split("T")[0],
      endDate: target.endDate.split("T")[0],
      reason: target.reason || "",
      isHalfDay: target.isHalfDay || false,
      halfDayPeriod: target.halfDayPeriod || "",
      isPaid: target.type !== "UNPAID",
    });

    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedRequest) return;

    try {
      await api.post(`/hr/leaves/${selectedRequest.id}/reopen`);

      const typeToSend = editFormData.isPaid ? editFormData.type : "UNPAID";

      const payload = {
        ...editFormData,
        type: typeToSend,
        employeeId: selectedRequest.userId,
      };
      delete (payload as any).isPaid;

      await api.put(`/hr/leaves/${selectedRequest.id}`, payload);

      toast.success(t("employee.leaves.editSuccess"));
      setShowEditDialog(false);
      fetchLeaveRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("employee.leaves.editError"));
    }
  };

  const handleChangeDecision = async (newDecisionVal: "APPROVE" | "REJECT" | "CANCELLED") => {
    if (!selectedRequest) return;

    try {
      if (newDecisionVal === "APPROVE") {
        await api.post(`/hr/leaves/${selectedRequest.id}/approve`);
        toast.success(t("employee.leaves.decisionChangedToApproved"));
      } else if (newDecisionVal === "CANCELLED") {
        await api.post(`/hr/leaves/${selectedRequest.id}/cancel`);
        toast.success(t("employee.leaves.cancelledSuccess"));
      } else {
        if (!rejectionReason.trim()) {
          toast.error(t("employee.leaves.rejectReasonRequired"));
          return;
        }
        await api.post(`/hr/leaves/${selectedRequest.id}/reject`, {
          reason: rejectionReason,
        });
        toast.success(t("employee.leaves.decisionChangedToRejected"));
      }

      setShowChangeDecisionDialog(false);
      setSelectedRequest(null);
      setRejectionReason("");
      fetchLeaveRequests();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || t("employee.leaves.changeDecisionError"),
      );
    }
  };

  const handleCancel = async (requestId: string) => {
    try {
      if (!confirm(t("employee.leaves.cancelConfirm"))) return;

      await api.post(`/hr/leaves/${requestId}/cancel`);
      toast.success(t("employee.leaves.cancelledSuccess"));
      fetchLeaveRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("employee.leaves.cancelError"));
    }
  };

  const handleDelete = async (request: LeaveRequest) => {
    const employeeName = request.employee
      ? `${request.employee.firstName} ${request.employee.lastName}`.trim()
      : t("employee.leaves.thisEmployee");
    const approvalWarning =
      request.status === "APPROVED"
        ? "\n" + t("employee.leaves.deleteRelatedWarning")
        : "";

    if (
      !window.confirm(
        t("employee.leaves.deleteConfirm", { name: employeeName }) + approvalWarning,
      )
    ) {
      return;
    }

    try {
      await api.delete(`/hr/leaves/${request.id}`);
      toast.success(t("employee.leaves.deleteSuccess"));
      if (selectedRequest?.id === request.id) {
        setShowDetailsDialog(false);
        setSelectedRequest(null);
      }
      fetchLeaveRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("employee.leaves.deleteError"));
    }
  };

  const totalDaysCount = calculateTotalDays(
    formData.startDate,
    formData.endDate,
    workingDays,
  );

  const handleAddRequest = async () => {
    try {
      setFieldErrors({});
      const typeToSend = formData.isPaid ? formData.type : "UNPAID";

      const payload = {
        ...formData,
        type: typeToSend,
        totalDays: totalDaysCount,
      };
      delete (payload as any).isPaid;

      if (isMyLeaves) {
        delete (payload as any).employeeId;
      }

      await api.post("/hr/leaves", payload);
      toast.success(t("employee.leaves.submitSuccess"), {
        description: t("employee.leaves.submitSuccessDesc"),
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
      setShowAddDialog(false);
      resetForm();
      fetchLeaveRequests();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const errors: Record<string, string> = {};
        error.response.data.errors.forEach((err: any) => {
          errors[err.field] = err.message;
        });
        setFieldErrors(errors);
        toast.error(t("employee.leaves.validationFailed"), {
          description: t("employee.leaves.validationFailedDesc"),
        });
      } else {
        const message =
          error.response?.data?.message || t("employee.leaves.submitError");
        const code = error.response?.data?.code;

        toast.error(message, {
          description:
            code === "INSUFFICIENT_LEAVE_BALANCE"
              ? t("employee.leaves.submitErrorHint")
              : undefined,
        });
      }
    }
  };

  const resetForm = () => {
    setFormData(initialLeaveFormData);
  };

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  return {
    t,
    isMyLeaves,
    loading,
    requests,
    employees,
    pagination,
    setPagination,
    workingDays,
    statusFilter,
    setStatusFilter,
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
    showReopenDialog,
    setShowReopenDialog,
    showEditDialog,
    setShowEditDialog,
    showChangeDecisionDialog,
    setShowChangeDecisionDialog,
    selectedRequest,
    setSelectedRequest,
    rejectionReason,
    setRejectionReason,
    newDecision,
    setNewDecision,
    fieldErrors,
    formData,
    setFormData,
    editFormData,
    setEditFormData,
    totalDaysCount,
    pendingCount,
    handleApprove,
    handleReject,
    handleReopenRequest,
    handleEditRequest,
    handleSaveEdit,
    handleChangeDecision,
    handleCancel,
    handleDelete,
    handleAddRequest,
    resetForm,
  };
};
