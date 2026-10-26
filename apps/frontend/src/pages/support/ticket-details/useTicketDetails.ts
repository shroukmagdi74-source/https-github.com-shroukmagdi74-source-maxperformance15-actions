import { useState, useEffect, useRef } from "react";
import supportService, {
  Ticket,
  AttachmentFile,
} from "../../../services/supportService";

interface UseTicketDetailsProps {
  ticketId: string | undefined;
  isAdmin: boolean;
  userId?: string;
}

export function useTicketDetails({
  ticketId,
  isAdmin,
  userId,
}: UseTicketDetailsProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageContent, setMessageContent] = useState("");
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState("");
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);

  // Admin specific state
  const [adminTab, setAdminTab] = useState<"reply" | "note">("reply");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [userHistory, setUserHistory] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // All tickets for sidebar
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [ticketsSearchQuery, setTicketsSearchQuery] = useState("");

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchTicketDetails = async () => {
    if (!ticketId) return;
    try {
      setLoading(true);
      const data = await supportService.getTicketDetails(ticketId);

      if (data.success) {
        setTicket(data.ticket);
        if (
          !isAdmin &&
          data.ticket.status === "closed" &&
          !data.ticket.rating
        ) {
          setShowRating(true);
        }
      } else {
        setError("التذكرة غير موجودة");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "حدث خطأ في جلب تفاصيل التذكرة",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTickets = async () => {
    try {
      const data = await supportService.getAllTickets();
      if (data.success) setAllTickets(data.tickets || []);
    } catch (err) {
      console.error("Error fetching all tickets", err);
    }
  };

  const fetchUserHistory = async () => {
    if (!ticket?.userId) return;
    try {
      // @ts-ignore
      const targetUserId = ticket.userId.id;
      const data = await supportService.getUserTicketHistory(
        targetUserId,
        ticket.ticketId,
      );
      if (data.success) setUserHistory(data.tickets);
    } catch (err) {
      console.error("Error fetching history", err);
    }
  };

  const fetchStaffList = async () => {
    try {
      const data = await supportService.getSupportStaff();
      if (data.success) setStaffList(data.staff);
    } catch (err) {
      console.error("Error fetching staff", err);
    }
  };

  useEffect(() => {
    if (ticketId) {
      fetchTicketDetails();
    }
  }, [ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.messages]);

  useEffect(() => {
    if (isAdmin && ticket?.userId) {
      fetchUserHistory();
      fetchStaffList();
    }
  }, [ticket?.userId, isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchAllTickets();
    }
  }, [isAdmin]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!ticket) return;
    try {
      setUpdatingStatus(true);
      const data = await supportService.updateTicket(ticket.ticketId, {
        status: newStatus,
      });
      if (data.success) {
        await fetchTicketDetails();
        showNotification("تم تحديث الحالة بنجاح");
      }
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdatePriority = async (newPriority: string) => {
    if (!ticket) return;
    try {
      const data = await supportService.updateTicket(ticket.ticketId, {
        priority: newPriority,
      });
      if (data.success) {
        await fetchTicketDetails();
        showNotification("تم تحديث الأولوية بنجاح");
      }
    } catch (err) {
      console.error("Failed to update priority", err);
    }
  };

  const handleAssignToMe = async () => {
    if (!ticket || !userId) return;
    try {
      const data = await supportService.updateTicket(ticket.ticketId, {
        assignedUserId: userId,
      });
      if (data.success) {
        await fetchTicketDetails();
        showNotification("تم تعيين التذكرة لك بنجاح");
      }
    } catch (err) {
      console.error("Failed to assign ticket", err);
    }
  };

  const handleAssignUser = async (targetStaffId: string) => {
    if (!ticket) return;
    try {
      const data = await supportService.updateTicket(ticket.ticketId, {
        assignedUserId: targetStaffId,
      });
      if (data.success) {
        await fetchTicketDetails();
        showNotification("تم تعيين التذكرة للموظف بنجاح");
      }
    } catch (err) {
      console.error("Failed to assign ticket", err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxFiles = 5;
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (attachments.length + files.length > maxFiles) {
      setError(`يمكنك رفع ${maxFiles} ملفات كحد أقصى`);
      return;
    }

    const validFiles: AttachmentFile[] = [];

    files.forEach((file) => {
      if (file.size > maxSize) {
        setError(`حجم الملف ${file.name} كبير جداً (الحد الأقصى 10 ميجابايت)`);
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];

      if (!allowedTypes.includes(file.type)) {
        setError(`نوع الملف ${file.name} غير مسموح`);
        return;
      }

      const attachmentFile: AttachmentFile = { file };

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
          attachmentFile.preview = uploadEvent.target?.result as string;
          setAttachments((prev) => [...prev, attachmentFile]);
        };
        reader.readAsDataURL(file);
      } else {
        validFiles.push(attachmentFile);
      }
    });

    if (validFiles.length > 0) {
      setAttachments((prev) => [...prev, ...validFiles]);
    }

    e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageContent.trim() && attachments.length === 0) {
      setError("يجب كتابة رسالة أو إرفاق ملف");
      return;
    }

    setSendingMessage(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("content", messageContent);
      if (adminTab === "note") {
        formData.append("isInternal", "true");
      }

      attachments.forEach((attachment) => {
        formData.append("attachments", attachment.file);
      });

      const data = await supportService.addMessage(ticketId!, formData);

      if (data.success) {
        setTicket(data.ticket);
        setMessageContent("");
        setAttachments([]);
      } else {
        setError(data.message || "حدث خطأ في إرسال الرسالة");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "حدث خطأ في إرسال الرسالة");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      setError("يرجى اختيار تقييم");
      return;
    }

    setSubmittingRating(true);
    setError("");

    try {
      const data = await supportService.rateTicket(ticketId!, {
        rating,
        feedback,
      });

      if (data.success) {
        setTicket(data.ticket);
        setShowRating(false);
      } else {
        setError(data.message || "حدث خطأ في تقييم الخدمة");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "حدث خطأ في تقييم الخدمة");
    } finally {
      setSubmittingRating(false);
    }
  };

  const filteredTickets = allTickets.filter(
    (t) =>
      t.subject.toLowerCase().includes(ticketsSearchQuery.toLowerCase()) ||
      t.ticketId.toLowerCase().includes(ticketsSearchQuery.toLowerCase()),
  );

  return {
    ticket,
    loading,
    error,
    messageContent,
    setMessageContent,
    attachments,
    sendingMessage,
    showRating,
    setShowRating,
    rating,
    setRating,
    feedback,
    setFeedback,
    submittingRating,
    adminTab,
    setAdminTab,
    updatingStatus,
    userHistory,
    staffList,
    notification,
    allTickets,
    ticketsSearchQuery,
    setTicketsSearchQuery,
    filteredTickets,
    messagesEndRef,
    handleUpdateStatus,
    handleUpdatePriority,
    handleAssignToMe,
    handleAssignUser,
    handleFileUpload,
    removeAttachment,
    handleSendMessage,
    handleRatingSubmit,
  };
}
