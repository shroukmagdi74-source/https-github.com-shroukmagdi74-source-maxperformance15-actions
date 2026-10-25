import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { tToast } from "../../../utils/i18n-toast";
import api from "../../../services/api";
import { Position, Department, PositionFormData } from "./types";

export function usePositionsController() {
  const navigate = useNavigate();
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState<Position | null>(null);

  const form = useForm<PositionFormData>({
    defaultValues: {
      title: "",
      description: "",
      code: "",
      level: 1,
      departmentId: "",
      minSalary: undefined,
      maxSalary: undefined,
    },
  });

  const { reset } = form;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [positionsRes, departmentsRes] = await Promise.all([
        api.get("/hr/positions"),
        api.get("/hr/departments").catch(() => ({ data: { departments: [] } })),
      ]);

      setPositions(positionsRes.data?.positions || []);
      setDepartments(departmentsRes.data?.departments || []);
    } catch (error: any) {
      console.error("❌ Error fetching data:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "فشل في تحميل البيانات";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (editingPosition) {
      reset({
        title: editingPosition.title,
        description: editingPosition.description || "",
        code: editingPosition.code || "",
        level: editingPosition.level,
        departmentId: editingPosition.departmentId || "",
        minSalary: editingPosition.minSalary || undefined,
        maxSalary: editingPosition.maxSalary || undefined,
      });
    }
  }, [editingPosition, reset]);

  const filteredPositions = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return positions.filter(
      (position) =>
        position.title.toLowerCase().includes(term) ||
        (position.code && position.code.toLowerCase().includes(term)) ||
        (position.description &&
          position.description.toLowerCase().includes(term)),
    );
  }, [positions, searchTerm]);

  const onSubmit = useCallback(
    async (data: PositionFormData) => {
      try {
        setLoading(true);

        if (!data.title || data.title.trim() === "") {
          tToast.error("PositionsManagement.msg_1afe");
          setLoading(false);
          return;
        }

        const cleanedData = {
          ...data,
          title: data.title.trim(),
          description: data.description?.trim() || undefined,
          code: data.code?.trim() || undefined,
          minSalary:
            data.minSalary && !isNaN(data.minSalary)
              ? Number(data.minSalary)
              : undefined,
          maxSalary:
            data.maxSalary && !isNaN(data.maxSalary)
              ? Number(data.maxSalary)
              : undefined,
        };

        if (editingPosition) {
          const response = await api.put(
            `/hr/positions/${editingPosition.id}`,
            cleanedData,
          );
          console.log("Position updated:", response.data);
          tToast.success("PositionsManagement.success_update_7e3b");
          setIsEditDialogOpen(false);
          setEditingPosition(null);
        } else {
          const response = await api.post("/hr/positions", cleanedData);
          console.log("Position created:", response.data);
          tToast.success("PositionsManagement.success_create_8e61");
          setIsCreateDialogOpen(false);
        }

        reset();
        fetchData();
      } catch (error: any) {
        console.error("❌ Error saving position:", error);
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "فشل في حفظ المنصب";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [editingPosition, reset, fetchData],
  );

  const handleEdit = useCallback((position: Position) => {
    setEditingPosition(position);
    setIsEditDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (position: Position) => {
      try {
        setLoading(true);
        await api.delete(`/hr/positions/${position.id}`);
        tToast.success("PositionsManagement.success_delete_f7bf");
        setDeleteDialogOpen(false);
        setPositionToDelete(null);
        fetchData();
      } catch (error: any) {
        console.error("❌ Error deleting position:", error);
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "فشل في حذف المنصب";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [fetchData],
  );

  const openDeleteDialog = useCallback((position: Position) => {
    setPositionToDelete(position);
    setDeleteDialogOpen(true);
  }, []);

  const handleNavigateBack = useCallback(() => {
    navigate("/hr");
  }, [navigate]);

  return {
    positions,
    departments,
    loading,
    searchTerm,
    setSearchTerm,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    editingPosition,
    setEditingPosition,
    deleteDialogOpen,
    setDeleteDialogOpen,
    positionToDelete,
    filteredPositions,
    form,
    onSubmit,
    handleEdit,
    handleDelete,
    openDeleteDialog,
    handleNavigateBack,
    refetchData: fetchData,
  };
}
