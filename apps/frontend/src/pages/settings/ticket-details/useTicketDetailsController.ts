import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import i18n from "../../../i18n";
import { tToast } from "../../../utils/i18n-toast";
import { apiClient } from "../../../services/apiClient";
import { TicketDetailsData, TicketMessage } from "./types";

export function useTicketDetailsController() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<TicketDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyImage, setReplyImage] = useState<File | null>(null);
  const [sendingReply, setSendingReply] = useState(false);
  const [currentRating, setCurrentRating] = useState<number | null>(null);
  const [submittingRating, setSubmittingRating] = useState(false);

  const loadTicketDetails = async () => {
    if (!ticketId) return;

    try {
      setLoading(true);
      setError(null);

      const [ticketResponse, logResponse] = await Promise.all([
        apiClient.get<any>(`/turbo/tickets/${ticketId}`),
        apiClient.get<any>(`/turbo/tickets/${ticketId}/log`),
      ]);

      if (!ticketResponse.data?.success) {
        throw new Error(
          ticketResponse.data?.message || i18n.t("TicketDetails.failed_load_cd6e")
        );
      }

      const ticketResult = ticketResponse.data.data;
      const logResult = logResponse.data?.data;

      const ticketData = ticketResult?.ticket || {};
      const logsData = logResult?.logs || [];
      const messages = (ticketData.messages || ticketData.replies || []) as TicketMessage[];

      const sortedMessages = [...messages].sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateA - dateB;
      });

      const combinedTicket: TicketDetailsData = {
        id: ticketData.id || parseInt(ticketId || "0", 10),
        description: ticketData.content || ticketData.description || "تذكرة Turbo",
        content: ticketData.content || ticketData.description || "",
        status: ticketData.status !== undefined ? ticketData.status : 1,
        created_at: ticketData.created_at || new Date().toISOString(),
        messages: sortedMessages,
        logs: logsData,
        rate: ticketData.rate ?? ticketData.rating ?? null,
      };

      if (ticketData.rate !== undefined && ticketData.rate !== null) {
        setCurrentRating(Number(ticketData.rate));
      } else if (ticketData.rating !== undefined && ticketData.rating !== null) {
        setCurrentRating(Number(ticketData.rating));
      }

      setTicket(combinedTicket);
    } catch (err: any) {
      console.error("Error loading ticket from Backend:", err);
      setError(
        err.response?.data?.message || err.message || "فشل تحميل تفاصيل التذكرة"
      );
      tToast.error("TicketDetails.failed_load_cd6e");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) {
      void loadTicketDetails();
    }
  }, [ticketId]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!replyMessage.trim() && !replyImage) {
      tToast.error("TicketDetails.msg_0d3f");
      return;
    }

    if (!ticketId) {
      tToast.error("TicketDetails.msg_8919");
      return;
    }

    try {
      setSendingReply(true);

      const text = replyMessage.trim() || (replyImage ? "مرفق لقطة شاشة / صورة" : "");
      const formData = new FormData();
      formData.append("message", text);
      formData.append("content", text);

      if (replyImage) {
        formData.append("image", replyImage);
      }

      const response = await apiClient.post<any>(
        `/turbo/tickets/${ticketId}/reply`,
        formData
      );

      if (response.data?.success) {
        tToast.success("TicketDetails.success_send_02a0");
        setReplyMessage("");
        setReplyImage(null);
        void loadTicketDetails();
      } else {
        throw new Error(response.data?.message || i18n.t("TicketDetails.failed_send_234e"));
      }
    } catch (err: any) {
      console.error("Error sending reply:", err);
      toast.error(err.response?.data?.error || err.message || "فشل إرسال الرد");
    } finally {
      setSendingReply(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        tToast.error("TicketDetails.msg_47f7");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        tToast.error("TicketDetails.msg_ff96");
        return;
      }
      setReplyImage(file);
    }
  };

  const handleRateTicket = async (score: number) => {
    if (!ticketId || submittingRating) return;
    try {
      setSubmittingRating(true);
      const res = await apiClient.post<any>(`/turbo/tickets/${ticketId}/rate`, {
        rate: score,
      });
      if (res.data?.success) {
        setCurrentRating(score);
        toast.success("تم تقييم التذكرة بنجاح");
      } else {
        toast.error(res.data?.message || "تعذر إرسال التقييم");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "حدث خطأ أثناء التقييم");
    } finally {
      setSubmittingRating(false);
    }
  };

  return {
    ticketId,
    navigate,
    ticket,
    loading,
    error,
    replyMessage,
    setReplyMessage,
    replyImage,
    setReplyImage,
    sendingReply,
    currentRating,
    submittingRating,
    loadTicketDetails,
    handleReply,
    handleImageChange,
    handleRateTicket,
  };
}
