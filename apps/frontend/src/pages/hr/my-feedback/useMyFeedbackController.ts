import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/services/api";
import { useAuth } from "@/hooks/useAuthSimple";
import { Feedback } from "./types";
import { calculateMyFeedbackStats, filterMyFeedback } from "./helpers";

export const useMyFeedbackController = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;

  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("sent");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewItem, setPreviewItem] = useState<Feedback | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const fetchMyFeedback = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/hr/feedback", {
        params: { personal: true },
      });
      if (response.data.success) {
        setFeedback(response.data.feedback || []);
      }
    } catch (error: any) {
      console.error("Error fetching feedback:", error);
      toast.error(t("employee.feedback.fetchError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (userId) fetchMyFeedback();
  }, [userId, fetchMyFeedback]);

  const handleOpenPreview = (item: Feedback) => {
    setPreviewItem(item);
    setIsPreviewOpen(true);
  };

  const handlePreviewOpenChange = (open: boolean) => {
    setIsPreviewOpen(open);
    if (!open) setPreviewItem(null);
  };

  const stats = useMemo(
    () => calculateMyFeedbackStats(feedback, userId),
    [feedback, userId]
  );

  const filteredFeedback = useMemo(
    () =>
      filterMyFeedback(
        feedback,
        userId,
        activeTab,
        searchQuery,
        t("employee.feedback.generalManagement")
      ),
    [feedback, userId, activeTab, searchQuery, t]
  );

  return {
    t,
    navigate,
    loading,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    previewItem,
    isPreviewOpen,
    handleOpenPreview,
    handlePreviewOpenChange,
    stats,
    filteredFeedback,
  };
};
