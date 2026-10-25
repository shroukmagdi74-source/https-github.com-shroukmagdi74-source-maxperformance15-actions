import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { tToast } from "../../../utils/i18n-toast";
import api from "../../../services/api";
import { validateShiftTimes } from "../../../utils/shiftHelpers";
import { Shift, ShiftEditFormData } from "./types";

export const useShiftDetailsController = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shift, setShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(
    null,
  );
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ShiftEditFormData>({
    name: "",
    startTime: "09:00",
    endTime: "17:00",
    breakDuration: 60,
    color: "#3B82F6",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchShiftDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/hr/shifts/${id}`);
      setShift(response.data.shift);
    } catch (error: any) {
      console.error("Error fetching shift details:", error);
      tToast.error("ShiftDetails.failed_fetch_7074");
      navigate("/hr/shifts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchShiftDetails();
    }
  }, [id]);

  const handleDeleteShift = async () => {
    try {
      await api.delete(`/hr/shifts/${id}`);
      tToast.success("ShiftDetails.success_delete_dd40");
      navigate("/hr/shifts");
    } catch (error) {
      console.error("Error deleting shift:", error);
      tToast.error("ShiftDetails.failed_delete_a11e");
    }
  };

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

  const handleUpdateShift = async () => {
    if (!validateForm()) return;
    try {
      await api.put(`/hr/shifts/${id}`, formData);
      tToast.success("ShiftDetails.success_update_5ce6");
      setEditDialogOpen(false);
      fetchShiftDetails();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || "فشل في تحديث المناوبة";
      toast.error(errorMsg);
    }
  };

  const openEditDialog = () => {
    if (shift) {
      setFormData({
        name: shift.name,
        startTime: shift.startTime,
        endTime: shift.endTime,
        breakDuration: shift.breakDuration,
        color: shift.color,
      });
      setFormErrors({});
      setEditDialogOpen(true);
    }
  };

  const handleRemoveAssignment = async () => {
    if (!assignmentToDelete) return;

    try {
      await api.delete(`/hr/shifts/assignments/${assignmentToDelete}`);
      tToast.success("ShiftDetails.msg_8f31");
      setDeleteDialogOpen(false);
      setAssignmentToDelete(null);
      fetchShiftDetails();
    } catch (error) {
      console.error("Error removing assignment:", error);
      tToast.error("ShiftDetails.msg_1d22");
    }
  };

  const confirmRemoveAssignment = (assignmentId: string) => {
    setAssignmentToDelete(assignmentId);
    setDeleteDialogOpen(true);
  };

  const goBack = () => navigate("/hr/shifts");

  return {
    shift,
    loading,
    deleteDialogOpen,
    setDeleteDialogOpen,
    assignDialogOpen,
    setAssignDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    formData,
    setFormData,
    formErrors,
    fetchShiftDetails,
    handleDeleteShift,
    handleUpdateShift,
    openEditDialog,
    handleRemoveAssignment,
    confirmRemoveAssignment,
    goBack,
  };
};
