import { useState, useEffect } from "react";
import api from "../../../services/api";
import { toast } from "sonner";
import { tToast } from "../../../utils/i18n-toast";
import {
  AttendanceRecord,
  TodayStats,
  AutoCloseSummary,
  AutoCloseReviewStatus,
  EmployeeSimple,
  SelectedLocationData,
  ManualAttendanceForm,
  ManualOverrides,
} from "./types";
import {
  CAIRO_TIMEZONE,
  getLocalDateString,
  createDefaultManualForm,
  createDefaultOverrides,
  recordToManualForm,
  buildAttendancePayload,
  exportAttendanceRecords,
} from "./helpers";

export const useAttendanceController = () => {
  const [loading, setLoading] = useState(true);
  const [todayStats, setTodayStats] = useState<TodayStats | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceTimezone, setAttendanceTimezone] = useState(CAIRO_TIMEZONE);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [autoCloseSummary, setAutoCloseSummary] = useState<AutoCloseSummary>({
    total: 0, pending: 0, reviewed: 0, adjusted: 0, dismissed: 0,
  });

  // Filters
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [endDate, setEndDate] = useState(getLocalDateString());
  const [useDateRange, setUseDateRange] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [employeeId, setEmployeeId] = useState("");
  const [autoClosedOnly, setAutoClosedOnly] = useState(false);
  const [autoCloseReviewStatus, setAutoCloseReviewStatus] = useState<"ALL" | AutoCloseReviewStatus>("ALL");

  // Employees list for filters
  const [employees, setEmployees] = useState<EmployeeSimple[]>([]);

  // Dialog states
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocationData | null>(null);

  // Manual attendance form
  const [manualForm, setManualForm] = useState<ManualAttendanceForm>(createDefaultManualForm());
  const [manualOverrides, setManualOverrides] = useState<ManualOverrides>(createDefaultOverrides());
  const [manualBaseline, setManualBaseline] = useState<ManualAttendanceForm | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);

  // Viewing notes state
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState("");
  const [showAutoCloseReviewDialog, setShowAutoCloseReviewDialog] = useState(false);
  const [selectedAutoCloseRecord, setSelectedAutoCloseRecord] = useState<AttendanceRecord | null>(null);
  const [autoCloseReviewForm, setAutoCloseReviewForm] = useState<{
    reviewStatus: AutoCloseReviewStatus;
    reviewNotes: string;
  }>({
    reviewStatus: "REVIEWED",
    reviewNotes: "",
  });

  // Delete Confirmation Logic
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  const confirmDelete = (id: string) => {
    setIdToDelete(id);
    setDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!idToDelete) return;
    try {
      await api.delete(`/hr/attendance/${idToDelete}`);
      tToast.success("attendance.success_delete_8e6c");
      setDeleteDialogOpen(false);
      setIdToDelete(null);
      fetchTodayStats();
      fetchAttendance();
    } catch (error: any) {
      tToast.error("attendance.msg_138c");
      console.error(error);
    }
  };

  const openAutoCloseReview = (record: AttendanceRecord) => {
    const currentReviewStatus =
      record.autoCloseAudit?.reviewStatus && record.autoCloseAudit.isAutoClosed
        ? record.autoCloseAudit.reviewStatus
        : "REVIEWED";

    setSelectedAutoCloseRecord(record);
    setAutoCloseReviewForm({
      reviewStatus: currentReviewStatus,
      reviewNotes: record.autoCloseAudit?.reviewNotes || "",
    });
    setShowAutoCloseReviewDialog(true);
  };

  const submitAutoCloseReview = async () => {
    if (!selectedAutoCloseRecord) return;

    try {
      await api.put(
        `/hr/attendance/${selectedAutoCloseRecord.id}/auto-close-review`,
        autoCloseReviewForm,
      );
      tToast.success("attendance.success_save_e260");
      setShowAutoCloseReviewDialog(false);
      setSelectedAutoCloseRecord(null);
      fetchAttendance();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "فشل في حفظ مراجعة الإغلاق التلقائي",
      );
    }
  };

  useEffect(() => {
    fetchTodayStats();
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [
    pagination.page,
    selectedDate,
    endDate,
    useDateRange,
    statusFilter,
    employeeId,
    autoClosedOnly,
    autoCloseReviewStatus,
  ]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/hr/employees?limit=1000&status=ACTIVE");
      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchTodayStats = async () => {
    try {
      const response = await api.get("/hr/attendance/today");
      if (response.data) {
        setTodayStats(response.data);
        if (response.data.timezone) {
          setAttendanceTimezone(response.data.timezone);
        }
      }
    } catch (error: any) {
      console.error("Error fetching today stats:", error);
      toast.error(error.response?.data?.message || "فشل في جلب إحصائيات اليوم");
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);

      const searchStartDate = selectedDate;
      const searchEndDate = useDateRange ? endDate : selectedDate;

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        startDate: searchStartDate || "",
        endDate: searchEndDate || "",
      } as Record<string, string>);

      if (statusFilter && statusFilter !== "ALL") {
        params.append("status", statusFilter);
      }
      if (employeeId) {
        params.append("employeeId", employeeId);
      }
      if (autoClosedOnly) {
        params.append("autoClosedOnly", "true");
      }
      if (autoCloseReviewStatus !== "ALL") {
        params.append("autoCloseReviewStatus", autoCloseReviewStatus);
      }

      const response = await api.get(`/hr/attendance?${params}`);
      setRecords(response.data.records);
      setAutoCloseSummary(
        response.data.autoCloseSummary || {
          total: 0,
          pending: 0,
          reviewed: 0,
          adjusted: 0,
          dismissed: 0,
        },
      );
      if (response.data.timezone) {
        setAttendanceTimezone(response.data.timezone);
      }
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages,
      }));
    } catch (error) {
      console.error("Error fetching attendance:", error);
      tToast.error("attendance.error_error_7db4");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (empId: string) => {
    try {
      await api.post("/hr/attendance/check-in", {
        employeeId: empId,
        method: "manual",
      });
      tToast.success("attendance.success_login_9112");
      fetchTodayStats();
      fetchAttendance();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "حدث خطأ أثناء تسجيل الحضور");
    }
  };

  const handleCheckOut = async (empId: string) => {
    try {
      await api.post("/hr/attendance/check-out", {
        employeeId: empId,
        method: "manual",
      });
      tToast.success("attendance.success_login_2d09");
      fetchTodayStats();
      fetchAttendance();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "حدث خطأ أثناء تسجيل الانصراف",
      );
    }
  };

  const handleManualAttendance = async () => {
    if (!manualForm.employeeId) {
      tToast.error("attendance.msg_98c9");
      return;
    }

    try {
      const payload = buildAttendancePayload(
        manualForm,
        manualOverrides,
        isEditMode,
        manualBaseline,
      );

      if (isEditMode && editingRecordId && !editingRecordId.startsWith("temp-")) {
        await api.put(`/hr/attendance/${editingRecordId}`, payload);
        tToast.success("attendance.success_update_8d09");
      } else {
        await api.post("/hr/attendance/manual", payload);
        tToast.success("attendance.success_create_9ea4");
      }

      setShowManualDialog(false);
      resetManualForm();
      fetchTodayStats();
      fetchAttendance();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "حدث خطأ",
      );
    }
  };

  const resetManualForm = () => {
    setManualForm(createDefaultManualForm(attendanceTimezone));
    setManualOverrides(createDefaultOverrides());
    setManualBaseline(null);
    setIsEditMode(false);
    setEditingRecordId(null);
  };

  const handleEditClick = (record: AttendanceRecord) => {
    const nextManualForm = recordToManualForm(record, attendanceTimezone);
    setManualForm(nextManualForm);
    setManualBaseline(nextManualForm);
    setManualOverrides(createDefaultOverrides());
    setEditingRecordId(record.id);
    setIsEditMode(true);
    setShowManualDialog(true);
  };

  const openLocationInMap = (
    latitude: number,
    longitude: number,
    type: string,
  ) => {
    setSelectedLocation({ latitude, longitude, type });
    setShowMapModal(true);
  };

  const handleExport = async () => {
    try {
      await exportAttendanceRecords({
        selectedDate,
        endDate,
        useDateRange,
        statusFilter,
        employeeId,
        autoClosedOnly,
        autoCloseReviewStatus,
      });
      tToast.success("attendance.msg_83be");
    } catch (error) {
      tToast.error("attendance.msg_2a18");
    }
  };

  return {
    loading,
    todayStats,
    records,
    attendanceTimezone,
    pagination,
    setPagination,
    autoCloseSummary,
    selectedDate,
    setSelectedDate,
    endDate,
    setEndDate,
    useDateRange,
    setUseDateRange,
    statusFilter,
    setStatusFilter,
    employeeId,
    setEmployeeId,
    autoClosedOnly,
    setAutoClosedOnly,
    autoCloseReviewStatus,
    setAutoCloseReviewStatus,
    employees,
    showManualDialog,
    setShowManualDialog,
    showMapModal,
    setShowMapModal,
    selectedLocation,
    manualForm,
    setManualForm,
    manualOverrides,
    setManualOverrides,
    isEditMode,
    showNotesDialog,
    setShowNotesDialog,
    selectedNotes,
    setSelectedNotes,
    showAutoCloseReviewDialog,
    setShowAutoCloseReviewDialog,
    selectedAutoCloseRecord,
    autoCloseReviewForm,
    setAutoCloseReviewForm,
    deleteDialogOpen,
    setDeleteDialogOpen,
    confirmDelete,
    executeDelete,
    openAutoCloseReview,
    submitAutoCloseReview,
    fetchAttendance,
    fetchTodayStats,
    handleCheckIn,
    handleCheckOut,
    handleManualAttendance,
    resetManualForm,
    handleEditClick,
    openLocationInMap,
    handleExport,
  };
};
