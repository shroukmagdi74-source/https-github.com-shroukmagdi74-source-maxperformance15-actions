import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import api from "../../../services/api";
import { Training, TrainingStats } from "./types";

export const useMyTrainingController = () => {
  const { t } = useTranslation();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const fetchMyTrainings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/hr/trainings/my");
      setTrainings(response.data.trainings || []);
    } catch (error: any) {
      console.error("Error fetching my trainings:", error);
      try {
        const fallback = await api.get("/hr/trainings?self=true");
        setTrainings(fallback.data.trainings || []);
      } catch {
        toast.error(t("employee.training.fetchError"));
        setTrainings([]);
      }
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchMyTrainings();
  }, [fetchMyTrainings]);

  const stats: TrainingStats = {
    total: trainings.length,
    completed: trainings.filter((item) => item.status === "COMPLETED").length,
    ongoing: trainings.filter((item) => item.status === "ONGOING").length,
    totalHours: trainings.reduce((sum, item) => sum + (item.duration || 0), 0),
  };

  const filteredTrainings = useMemo(() => {
    return trainings.filter((item) => {
      const matchesSearch =
        item.trainingName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.provider?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [trainings, searchTerm, statusFilter]);

  return {
    t,
    loading,
    selectedTraining,
    setSelectedTraining,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    stats,
    filteredTrainings,
    fetchMyTrainings,
  };
};
