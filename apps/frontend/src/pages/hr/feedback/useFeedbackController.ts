import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import { useAuth } from "../../../hooks/useAuthSimple";
import { toast } from "sonner";
import { tToast } from "../../../utils/i18n-toast";
import { FeedbackItem, FeedbackStats } from "./types";

export function useFeedbackController() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");

  // Reply dialog state
  const [selectedFeedback, setSelectedFeedback] =
    useState<FeedbackItem | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);

  const isPrivileged = [
    "SUPER_ADMIN",
    "COMPANY_ADMIN",
    "OWNER",
    "MANAGER",
  ].includes(user?.role || "");

  const fetchFeedback = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/hr/feedback");
      if (response.data?.success) {
        setFeedback(response.data.feedback || []);
      }
    } catch (error: any) {
      console.error("Error fetching feedback:", error);
      tToast.error("Feedback.failed_fetch_9062");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get("/hr/feedback/stats");
      if (response.data?.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  useEffect(() => {
    if (user?.companyId) {
      fetchFeedback();
      fetchStats();
    }
  }, [user?.companyId, fetchFeedback, fetchStats]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm("هل أنت متأكد من رغبتك في حذف هذه التغذية الراجعة؟"))
        return;

      try {
        const response = await api.delete(`/hr/feedback/${id}`);
        if (response.data?.success) {
          tToast.success("Feedback.success_delete_0947");
          setFeedback((prev) => prev.filter((item) => item.id !== id));
          fetchStats();
        }
      } catch (error) {
        console.error("Error deleting feedback:", error);
        tToast.error("Feedback.failed_delete_e7e4");
      }
    },
    [fetchStats],
  );

  const handleReply = useCallback(async () => {
    if (!selectedFeedback || !replyText.trim()) {
      console.warn("⚠️ Cannot send reply: missing feedback or text");
      return;
    }

    try {
      setReplyLoading(true);
      const response = await api.post(
        `/hr/feedback/${selectedFeedback.id}/reply`,
        { reply: replyText },
      );

      if (response.data?.success) {
        tToast.success("Feedback.success_send_a8d1");
        setFeedback((prev) =>
          prev.map((f) =>
            f.id === selectedFeedback.id
              ? {
                  ...f,
                  adminReply: replyText,
                  status: "RESOLVED",
                  repliedAt: new Date().toISOString(),
                }
              : f,
          ),
        );
        setIsReplyDialogOpen(false);
        setReplyText("");
        setSelectedFeedback(null);
      }
    } catch (error: any) {
      console.error("❌ Error replying to feedback:", error);
      toast.error(error.response?.data?.error || "فشل في إرسال الرد");
    } finally {
      setReplyLoading(false);
    }
  }, [selectedFeedback, replyText]);

  const filteredFeedback = useMemo(() => {
    return feedback.filter((item) => {
      const currentUserId = user?.id;

      if (activeTab === "received" && item.toUserId !== currentUserId)
        return false;
      if (activeTab === "sent" && item.fromUserId !== currentUserId)
        return false;

      const safeStr = (val?: string) => (val ? val.toLowerCase() : "");
      const search = searchQuery.toLowerCase();
      const matchesSearch =
        safeStr(item.content).includes(search) ||
        safeStr(item.toEmployee?.firstName).includes(search) ||
        safeStr(item.toEmployee?.lastName).includes(search) ||
        safeStr(item.fromEmployee?.firstName).includes(search) ||
        safeStr(item.fromEmployee?.lastName).includes(search);

      const matchesRating =
        ratingFilter === "all" || item.rating === ratingFilter;

      return matchesSearch && matchesRating;
    });
  }, [feedback, user?.id, activeTab, searchQuery, ratingFilter]);

  const handleOpenReplyDialog = useCallback((item: FeedbackItem) => {
    setSelectedFeedback(item);
    setReplyText("");
    setIsReplyDialogOpen(true);
  }, []);

  const handleCloseReplyDialog = useCallback(() => {
    setIsReplyDialogOpen(false);
    setReplyText("");
    setSelectedFeedback(null);
  }, []);

  const handleNavigateNew = useCallback(() => {
    navigate("/hr/feedback/new");
  }, [navigate]);

  const handleNavigateEdit = useCallback(
    (id: string) => {
      navigate(`/hr/feedback/edit/${id}`);
    },
    [navigate],
  );

  return {
    feedback,
    stats,
    loading,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    ratingFilter,
    setRatingFilter,
    selectedFeedback,
    replyText,
    setReplyText,
    replyLoading,
    isReplyDialogOpen,
    isPrivileged,
    filteredFeedback,
    handleDelete,
    handleReply,
    handleOpenReplyDialog,
    handleCloseReplyDialog,
    handleNavigateNew,
    handleNavigateEdit,
    refetchFeedback: fetchFeedback,
    refetchStats: fetchStats,
  };
}
