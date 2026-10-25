import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import api from "../../../../services/api";
import { useAuth } from "../../../../hooks/useAuthSimple";
import { RewardTypeFormData, RewardTypeRecord } from "./types";
import {
  createInitialRewardTypeForm,
  mapRewardTypeToFormData,
} from "./helpers";

export const useRewardTypesController = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [types, setTypes] = useState<RewardTypeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<RewardTypeRecord | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<RewardTypeRecord | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState<RewardTypeFormData>(() =>
    createInitialRewardTypeForm(),
  );

  useEffect(() => {
    void fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      setLoading(true);
      const response = await api.get("/hr/rewards/types");
      if (response.data.success) {
        setTypes(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching types:", error);
      toast.error(t("rewards.toast.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingType(null);
    setFormData(createInitialRewardTypeForm());
  };

  const openEdit = (type: RewardTypeRecord) => {
    setEditingType(type);
    setFormData(mapRewardTypeToFormData(type));
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name) {
        toast.error(t("rewards.toast.nameRequired"));
        return;
      }

      const response = editingType
        ? await api.put(`/hr/rewards/types/${editingType.id}`, formData)
        : await api.post("/hr/rewards/types", formData);

      if (response.data.success) {
        toast.success(
          editingType ? t("rewards.toast.updated") : t("rewards.toast.created"),
        );
        setIsDialogOpen(false);
        void fetchTypes();
        resetForm();
      }
    } catch (error) {
      console.error("Error saving type:", error);
      toast.error(t("rewards.toast.saveError"));
    }
  };

  const handleDeleteClick = (type: RewardTypeRecord) => {
    setDeleteTarget(type);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget?.id) return;
    try {
      setDeleting(true);
      await api.delete(`/hr/rewards/types/${deleteTarget.id}`);
      toast.success(t("rewards.toast.deleted"));
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      void fetchTypes();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || t("rewards.delete.errorLinked");
      toast.error(message);
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/hr/rewards/types/${id}/toggle`, {
        isActive: !currentStatus,
      });
      toast.success(t("rewards.toast.statusChanged"));
      void fetchTypes();
    } catch {
      toast.error(t("rewards.toast.statusChangeFailed"));
    }
  };

  return {
    t,
    user,
    types,
    loading,
    isDialogOpen,
    setIsDialogOpen,
    editingType,
    deleteDialogOpen,
    setDeleteDialogOpen,
    deleteTarget,
    setDeleteTarget,
    deleting,
    formData,
    setFormData,
    resetForm,
    openEdit,
    handleSubmit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleToggleStatus,
  };
};
