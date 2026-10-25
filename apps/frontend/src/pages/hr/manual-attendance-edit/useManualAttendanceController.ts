import { useState, useEffect, useCallback } from "react";
import api from "../../../services/api";
import { toast } from "sonner";
import { tToast } from "../../../utils/i18n-toast";
import { AttendanceRecord, EditingRecord, EmployeeOption } from "./types";
import { calculateWorkHours, validateTimes } from "./helpers";

export const useManualAttendanceController = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [editingRecords, setEditingRecords] = useState<Map<string, EditingRecord>>(
    new Map(),
  );
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [useDateRange, setUseDateRange] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [showAllEmployees, setShowAllEmployees] = useState(false);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [allEmployeesWithAttendance, setAllEmployeesWithAttendance] = useState<
    AttendanceRecord[]
  >([]);

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await api.get("/hr/employees?limit=1000&status=ACTIVE");
      const employeesList = response.data.employees || [];
      setEmployees(employeesList);
    } catch (error) {
      console.error("❌ Error fetching employees:", error);
      tToast.error("manualAttendance.error_error_e58c");
    }
  }, []);

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        startDate: selectedDate || "",
        endDate: (useDateRange ? endDate : selectedDate) || "",
      } as Record<string, string>);

      if (statusFilter && statusFilter !== "ALL") {
        params.append("status", statusFilter);
      }
      if (employeeId) {
        params.append("employeeId", employeeId);
      }

      const response = await api.get(`/hr/attendance?${params}`);
      setRecords(response.data.records || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination?.total || 0,
        totalPages: response.data.pagination?.totalPages || 0,
      }));
    } catch (error) {
      console.error("Error fetching attendance:", error);
      tToast.error("manualAttendance.error_error_9b3e");
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    selectedDate,
    useDateRange,
    endDate,
    statusFilter,
    employeeId,
  ]);

  const fetchAllEmployeesWithAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const employeesResponse = await api.get(
        "/hr/employees?limit=1000&status=ACTIVE",
      );
      const employeesList = employeesResponse.data.employees || [];
      const targetDate = selectedDate;

      const attendanceResponse = await api.get(
        `/hr/attendance?startDate=${targetDate}&endDate=${targetDate}&limit=1000`,
      );
      const attendanceRecords = attendanceResponse.data.records || [];

      const attendanceMap = new Map(
        attendanceRecords.map((r: AttendanceRecord) => [r.employee.id, r]),
      );

      const combinedRecords = employeesList.map((emp: EmployeeOption) => {
        const existingRecord = attendanceMap.get(emp.id);
        if (existingRecord) {
          return existingRecord;
        }
        return {
          id: `temp-${emp.id}`,
          date: targetDate,
          checkIn: null,
          checkOut: null,
          status: "ABSENT",
          workHours: null,
          overtimeHours: null,
          lateMinutes: null,
          notes: null,
          employee: {
            id: emp.id,
            firstName: emp.firstName,
            lastName: emp.lastName,
            avatar: emp.avatar || "",
            employeeNumber: emp.employeeNumber,
            department: emp.department || null,
          },
          isNew: true,
        };
      });

      setAllEmployeesWithAttendance(combinedRecords);
      setPagination((prev) => ({
        ...prev,
        total: combinedRecords.length,
        totalPages: Math.ceil(combinedRecords.length / prev.limit),
      }));
    } catch (error) {
      console.error("Error fetching all employees:", error);
      tToast.error("manualAttendance.error_error_6ea7");
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    if (showAllEmployees) {
      fetchAllEmployeesWithAttendance();
    } else {
      fetchAttendance();
    }
  }, [
    selectedDate,
    endDate,
    useDateRange,
    statusFilter,
    employeeId,
    showAllEmployees,
    fetchAllEmployeesWithAttendance,
    fetchAttendance,
  ]);

  const startEditing = (record: AttendanceRecord) => {
    let checkInTime = "09:00";
    let checkOutTime = "";

    if (record.checkIn) {
      try {
        const date = new Date(record.checkIn);
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        checkInTime = `${hours}:${minutes}`;
      } catch (error) {
        console.error("Error parsing checkIn time:", error);
      }
    }

    if (record.checkOut) {
      try {
        const date = new Date(record.checkOut);
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        checkOutTime = `${hours}:${minutes}`;
      } catch (error) {
        console.error("Error parsing checkOut time:", error);
      }
    }

    setEditingRecords((prev) =>
      new Map(prev).set(record.id, {
        id: record.id,
        checkIn: checkInTime,
        checkOut: checkOutTime,
        status: record.status,
        notes: record.notes || "",
        lateHours: Math.floor((record.lateMinutes || 0) / 60),
        lateMins: (record.lateMinutes || 0) % 60,
        earlyHours: Math.floor((record.earlyLeaveMinutes || 0) / 60),
        earlyMins: (record.earlyLeaveMinutes || 0) % 60,
      }),
    );
  };

  const cancelEditing = (recordId: string) => {
    setEditingRecords((prev) => {
      const newMap = new Map(prev);
      newMap.delete(recordId);
      return newMap;
    });
  };

  const updateEditingField = (
    recordId: string,
    field: keyof EditingRecord,
    value: string | number,
  ) => {
    setEditingRecords((prev) => {
      const newMap = new Map(prev);
      const record = newMap.get(recordId);
      if (record) {
        newMap.set(recordId, { ...record, [field]: value });
      }
      return newMap;
    });
  };

  const setCurrentTimeForCheckIn = (recordId: string) => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const currentTime = `${hours}:${minutes}`;
    updateEditingField(recordId, "checkIn", currentTime);
    toast.success(`تم تعيين وقت الحضور: ${currentTime}`);
  };

  const setCurrentTimeForCheckOut = (recordId: string) => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const currentTime = `${hours}:${minutes}`;
    updateEditingField(recordId, "checkOut", currentTime);
    toast.success(`تم تعيين وقت الانصراف: ${currentTime}`);
  };

  const isEditing = (recordId: string): boolean => {
    return editingRecords.has(recordId);
  };

  const resetFilters = () => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setEndDate(new Date().toISOString().split("T")[0]);
    setUseDateRange(false);
    setStatusFilter("");
    setEmployeeId("");
  };

  const saveRecord = async (recordId: string) => {
    const editingData = editingRecords.get(recordId);
    if (!editingData) return;

    if (saving === recordId) return;

    if (!validateTimes(editingData.checkIn, editingData.checkOut)) {
      return;
    }

    try {
      setSaving(recordId);
      const allRecords = showAllEmployees
        ? allEmployeesWithAttendance
        : records;
      const record = allRecords.find((r) => r.id === recordId);
      if (!record) {
        tToast.error("manualAttendance.msg_4c48");
        return;
      }

      const dateOnly = new Date(record.date).toISOString().split("T")[0];
      const workHours = calculateWorkHours(
        editingData.checkIn,
        editingData.checkOut,
      );

      if (record.isNew) {
        try {
          await api.post("/hr/attendance/manual", {
            employeeId: record.employee.id,
            date: dateOnly,
            checkIn: editingData.checkIn,
            checkOut: editingData.checkOut,
            status: editingData.status,
            notes: editingData.notes || null,
            lateMinutes: editingData.lateHours * 60 + editingData.lateMins,
            earlyLeaveMinutes:
              editingData.earlyHours * 60 + editingData.earlyMins,
          });
          tToast.success("manualAttendance.success_save_e3c5");
        } catch (error: any) {
          if (
            error.response?.status === 400 ||
            error.response?.data?.error?.includes("موجود")
          ) {
            const existingRecords = await api.get(
              `/hr/attendance?startDate=${dateOnly}&endDate=${dateOnly}&employeeId=${record.employee.id}`,
            );
            if (
              existingRecords.data.records &&
              existingRecords.data.records.length > 0
            ) {
              const existingRecordId = existingRecords.data.records[0].id;
              await api.put(`/hr/attendance/${existingRecordId}`, {
                date: dateOnly,
                checkIn: editingData.checkIn,
                checkOut: editingData.checkOut,
                status: editingData.status,
                notes: editingData.notes || null,
                workHours: workHours,
                lateMinutes: editingData.lateHours * 60 + editingData.lateMins,
                earlyLeaveMinutes:
                  editingData.earlyHours * 60 + editingData.earlyMins,
              });
              tToast.success("manualAttendance.success_update_d969");
            } else {
              throw error;
            }
          } else {
            throw error;
          }
        }
      } else {
        await api.put(`/hr/attendance/${recordId}`, {
          date: dateOnly,
          checkIn: editingData.checkIn,
          checkOut: editingData.checkOut,
          status: editingData.status,
          notes: editingData.notes || null,
          workHours: workHours,
          lateMinutes: editingData.lateHours * 60 + editingData.lateMins,
          earlyLeaveMinutes:
            editingData.earlyHours * 60 + editingData.earlyMins,
        });
        tToast.success("manualAttendance.success_save_5920");
      }

      cancelEditing(recordId);
      if (showAllEmployees) {
        await fetchAllEmployeesWithAttendance();
      } else {
        await fetchAttendance();
      }
    } catch (error: any) {
      console.error("Error saving attendance:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "حدث خطأ أثناء حفظ التعديلات";
      toast.error(errorMessage);
    } finally {
      setSaving(null);
    }
  };

  const displayedRecords = showAllEmployees ? allEmployeesWithAttendance : records;

  return {
    loading,
    saving,
    records,
    displayedRecords,
    editingRecords,
    pagination,
    setPagination,
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
    showAllEmployees,
    setShowAllEmployees,
    employees,
    startEditing,
    cancelEditing,
    updateEditingField,
    setCurrentTimeForCheckIn,
    setCurrentTimeForCheckOut,
    isEditing,
    resetFilters,
    saveRecord,
  };
};
