import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import api from "../../../services/api";
import { toast } from "sonner";
import { tToast } from "../../../utils/i18n-toast";
import useKeyboardShortcuts from "../../../hooks/useKeyboardShortcuts";
import { validateShiftTimes } from "../../../utils/shiftHelpers";
import type {
  Shift,
  ShiftFormData,
  ViewMode,
  StatusFilter,
  SortBy,
  ShiftStats,
} from "./types";

const INITIAL_FORM_DATA: ShiftFormData = {
  name: "",
  startTime: "09:00",
  endTime: "17:00",
  breakDuration: 60,
  color: "#3B82F6",
  sortOrder: 0,
};

export const useShiftsController = () => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Core Shift State
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem("shiftsViewMode") as ViewMode) || "grid";
  });

  // Dialogs State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [shiftToAssign, setShiftToAssign] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Selection & Editing
  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);
  const [shiftToDelete, setShiftToDelete] = useState<string | null>(null);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("custom");

  // Form State
  const [formData, setFormData] = useState<ShiftFormData>(INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchShifts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/hr/shifts");
      setShifts(response.data?.shifts || []);
    } catch (error: any) {
      console.error("❌ Error fetching shifts:", error);
      toast.error(error.response?.data?.error || "فشل في جلب المناوبات");
      setShifts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  useEffect(() => {
    localStorage.setItem("shiftsViewMode", viewMode);
  }, [viewMode]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors["name"] = "يرجى إدخال اسم المناوبة";

    const validation = validateShiftTimes(
      formData.startTime,
      formData.endTime,
      formData.breakDuration,
    );

    if (!validation.valid && validation.error) {
      errors["time"] = validation.error;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setFormErrors({});
    setEditingShift(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (shift: Shift) => {
    setEditingShift(shift);
    setFormData({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      breakDuration: shift.breakDuration,
      color: shift.color,
      sortOrder: shift.sortOrder || 0,
    });
    setDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    try {
      await api.post("/hr/shifts", formData);
      tToast.success("Shifts.success_create_c830");
      setDialogOpen(false);
      resetForm();
      fetchShifts();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "فشل في إنشاء المناوبة");
    }
  };

  const handleUpdate = async () => {
    if (!editingShift || !validateForm()) return;
    try {
      await api.put(`/hr/shifts/${editingShift.id}`, formData);
      tToast.success("Shifts.success_update_bb31");
      setDialogOpen(false);
      resetForm();
      fetchShifts();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "فشل في تحديث المناوبة");
    }
  };

  const handleToggleStatus = async (
    shiftId: string,
    currentStatus: boolean,
  ) => {
    try {
      setShifts((prev) =>
        prev.map((s) =>
          s.id === shiftId ? { ...s, isActive: !currentStatus } : s,
        ),
      );

      await api.put(`/hr/shifts/${shiftId}`, { isActive: !currentStatus });
      toast.success(currentStatus ? "تم تعطيل المناوبة" : "تم تفعيل المناوبة");
    } catch (error) {
      setShifts((prev) =>
        prev.map((s) =>
          s.id === shiftId ? { ...s, isActive: currentStatus } : s,
        ),
      );
      tToast.error("Shifts.msg_744f");
    }
  };

  const handleDuplicate = async (shift: Shift) => {
    setFormData({
      name: `${shift.name} (نسخة)`,
      startTime: shift.startTime,
      endTime: shift.endTime,
      breakDuration: shift.breakDuration,
      color: shift.color,
      sortOrder: shift.sortOrder,
    });
    setEditingShift(null);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!shiftToDelete) return;
    try {
      if (shiftToDelete === "bulk") {
        await Promise.all(
          selectedShifts.map((id) => api.delete(`/hr/shifts/${id}`)),
        );
        toast.success(`تم حذف ${selectedShifts.length} مناوبة`);
        setSelectedShifts([]);
      } else {
        await api.delete(`/hr/shifts/${shiftToDelete}`);
        tToast.success("Shifts.success_delete_06fc");
      }
      setDeleteDialogOpen(false);
      setShiftToDelete(null);
      fetchShifts();
    } catch (error) {
      tToast.error("Shifts.failed_delete_901a");
    }
  };

  const toggleSelectShift = (id: string) => {
    setSelectedShifts((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = (allIds: string[]) => {
    setSelectedShifts((prev) =>
      prev.length === allIds.length ? [] : allIds,
    );
  };

  const filteredAndSortedShifts = useMemo(() => {
    return shifts
      .filter((shift) => {
        if (
          searchTerm &&
          !shift.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
          return false;
        if (statusFilter === "active" && !shift.isActive) return false;
        if (statusFilter === "inactive" && shift.isActive) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name, "ar");
        if (sortBy === "startTime")
          return a.startTime.localeCompare(b.startTime);
        if (sortBy === "employees")
          return (
            (b._count?.shiftAssignments || 0) -
            (a._count?.shiftAssignments || 0)
          );
        if (sortBy === "custom") {
          if (a.sortOrder !== b.sortOrder)
            return (a.sortOrder || 0) - (b.sortOrder || 0);
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
        return 0;
      });
  }, [shifts, searchTerm, statusFilter, sortBy]);

  const stats: ShiftStats = useMemo(() => {
    const total = shifts.length;
    const active = shifts.filter((s) => s.isActive).length;
    const totalAssignments = shifts.reduce(
      (sum, s) => sum + (s._count?.shiftAssignments || 0),
      0,
    );
    return { total, active, inactive: total - active, totalAssignments };
  }, [shifts]);

  // Keyboard Shortcuts
  useKeyboardShortcuts({
    n: () => {
      openCreateDialog();
    },
    "/": (e: KeyboardEvent) => {
      e.preventDefault();
      searchInputRef.current?.focus();
    },
    escape: () => {
      setDialogOpen(false);
      setDeleteDialogOpen(false);
    },
  });

  return {
    shifts,
    loading,
    viewMode,
    setViewMode,
    dialogOpen,
    setDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    assignDialogOpen,
    setAssignDialogOpen,
    shiftToAssign,
    setShiftToAssign,
    selectedShifts,
    setSelectedShifts,
    shiftToDelete,
    setShiftToDelete,
    editingShift,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    formData,
    setFormData,
    formErrors,
    searchInputRef,
    fetchShifts,
    openCreateDialog,
    openEditDialog,
    resetForm,
    handleCreate,
    handleUpdate,
    handleToggleStatus,
    handleDuplicate,
    handleDelete,
    toggleSelectShift,
    toggleSelectAll,
    filteredAndSortedShifts,
    stats,
  };
};
