import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { apiClient } from "../../../../services/apiClient";
import type { TurboTicketItem, TurboMessage } from "../types";
import type { MatchedOrderData } from "./types";
import { parseSafeDate } from "../ticketDateUtils";

interface UseTicketChatOptions {
  ticket: TurboTicketItem | null;
  onRefreshTicket: () => void;
  user: any;
}

export function useTicketChat({ ticket, onRefreshTicket, user }: UseTicketChatOptions) {
  const [replyText, setReplyText] = useState("");
  const [replyImage, setReplyImage] = useState<File | null>(null);
  const [replyImagePreview, setReplyImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sending, setSending] = useState(false);
  const [ratingScore, setRatingScore] = useState<number | null>(null);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showOrderSidebar, setShowOrderSidebar] = useState(false);
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [searchingOrder, setSearchingOrder] = useState(false);
  const [manualMatchedOrder, setManualMatchedOrder] = useState<MatchedOrderData | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate and cleanup object URL for reply image preview
  useEffect(() => {
    if (!replyImage) {
      setReplyImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(replyImage);
    setReplyImagePreview(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [replyImage]);

  // Handle screenshot paste (Ctrl+V) from clipboard
  const handlePaste = useCallback((e: React.ClipboardEvent | ClipboardEvent) => {
    const items = (e as any).clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type && items[i].type.startsWith("image/")) {
        const blob = items[i].getAsFile();
        if (blob) {
          e.preventDefault();
          const ext = blob.type.split("/")[1] || "png";
          const file = new File([blob], `screenshot_${Date.now()}.${ext}`, {
            type: blob.type || "image/png",
          });
          setReplyImage(file);
          toast.success("تم لصق لقطة الشاشة بنجاح! جاهزة للإرسال.");
          return;
        }
      }
    }
  }, []);

  // Global window paste listener for screenshots while viewing ticket
  useEffect(() => {
    const onGlobalPaste = (e: ClipboardEvent) => {
      const activeEl = document.activeElement as HTMLElement;
      if (activeEl && activeEl.tagName === "INPUT" && activeEl.getAttribute("placeholder")?.includes("1042")) {
        return;
      }
      handlePaste(e);
    };
    window.addEventListener("paste", onGlobalPaste);
    return () => window.removeEventListener("paste", onGlobalPaste);
  }, [handlePaste]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type && file.type.startsWith("image/")) {
        setReplyImage(file);
        toast.success("تم إرفاق الصورة بنجاح");
      } else {
        toast.error("يرجى إرفاق ملف صورة صالح (PNG, JPG, WEBP)");
      }
    }
  };

  useEffect(() => {
    if (ticket) {
      setRatingScore(ticket.rate ?? ticket.rating ?? null);
      setReplyText("");
      setReplyImage(null);
      setManualMatchedOrder(null);
      setOrderSearchQuery("");
      if (ticket.matchedOrder) {
        setShowOrderSidebar(true);
      }
    }
  }, [ticket?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [ticket?.messages?.length, ticket?.replies?.length]);

  const activeOrder = ticket?.matchedOrder || manualMatchedOrder;

  const isMessageFromStore = useCallback((msg: TurboMessage) => {
    if (msg.is_client_message === 1 || msg.is_client_message === true) return true;
    if (msg.is_client_message === 0 || msg.is_client_message === false) return false;

    const agentId = (ticket as any)?.agent?.id ? String((ticket as any).agent.id) : null;
    const userId = msg.user?.id ? String(msg.user.id) : null;
    const userName = (msg.user?.name || "").toLowerCase();
    const username = (msg.user?.username || "").toLowerCase();
    const email = (msg.user?.email || "").toLowerCase();

    if (
      (agentId && userId === agentId) ||
      username === "ai_customer_service" ||
      email.includes("algoistic.com") ||
      userName.includes("ai customer") ||
      userName.includes("خدمة العملاء") ||
      userName.includes("الدعم الفني")
    ) {
      return false;
    }

    return true;
  }, [ticket]);

  const formatSenderName = useCallback((msg: TurboMessage) => {
    const isStore = isMessageFromStore(msg);

    if (isStore) {
      const storeName = user?.company?.name?.trim() || "المتجر";
      let personName = (
        msg.sender_name ||
        msg.user?.name ||
        ""
      ).trim();
      personName = personName
        .replace(/العميل\s+[^\s]+/gi, "")
        .replace(/client\s+[^\s]+/gi, "")
        .trim();

      if (
        !personName ||
        personName.toLowerCase() === "المتجر" ||
        personName.toLowerCase() === "swan" ||
        personName.toLowerCase() === "client"
      ) {
        personName =
          `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
          "المسؤول";
      }
      return `${storeName} - ${personName}`;
    } else {
      let turboName = (
        msg.user?.name ||
        msg.sender_name ||
        [msg.user?.first_name, msg.user?.last_name].filter(Boolean).join(" ") ||
        [msg.sender?.first_name, msg.sender?.last_name].filter(Boolean).join(" ") ||
        ""
      ).trim();

      turboName = turboName
        .replace(/^تربو\s*[-–:]*\s*/gi, "")
        .replace(/^turbo\s*[-–:]*\s*/gi, "")
        .trim();

      if (!turboName || turboName === "خدمة عملاء" || turboName === "الدعم الفني") {
        turboName = "خدمة العملاء";
      }
      return `تربو - ${turboName}`;
    }
  }, [isMessageFromStore, user]);

  const handleSearchOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderSearchQuery.trim()) return;
    try {
      setSearchingOrder(true);
      const res = await apiClient.get<any>(
        `/orders?search=${encodeURIComponent(orderSearchQuery.trim())}&limit=1`
      );
      const ord =
        res.data?.orders?.[0] ||
        res.data?.data?.orders?.[0] ||
        res.data?.data?.[0];
      if (ord) {
        setManualMatchedOrder({
          id: ord.id,
          orderNumber: ord.orderNumber,
          status: ord.status,
          turboStatus: ord.turboShipmentStatus || ord.shippingStatus,
          turboTrackingNumber: ord.turboTrackingNumber,
          turboShipmentId: ord.turboShipmentId,
          turboCaptainName: ord.turboCaptainName,
          turboCaptainPhone: ord.turboCaptainPhone,
          customer: {
            name: ord.customerName || ord.customer?.name,
            phone: ord.customerPhone || ord.customer?.phone,
            address:
              ord.shippingAddress ||
              ord.customerAddress ||
              ord.customer?.address,
            city: ord.city || ord.customer?.city,
            governorate: ord.governorate || ord.customer?.governorate,
          },
          items: (ord.orderItems || ord.items || []).map((it: any) => ({
            id: it.id,
            productName: it.productName || it.product?.name || "منتج",
            variantName: it.variantName || it.productVariant?.name,
            quantity: it.quantity,
            unitPrice: Number(it.price || it.unitPrice || 0),
            total: Number(it.total || (it.quantity || 1) * (it.price || 0)),
          })),
          financials: {
            subtotal: Number(ord.subtotal || 0),
            shippingFee: Number(ord.shippingFee || ord.shippingCost || 0),
            discount: Number(ord.discount || 0),
            total: Number(ord.total || 0),
          },
        });
        toast.success(`تم العثور على أوردر #${ord.orderNumber}`);
      } else {
        toast.error("لم يتم العثور على أوردر بهذا الرقم");
      }
    } catch {
      toast.error("فشل البحث عن الأوردر");
    } finally {
      setSearchingOrder(false);
    }
  };

  const messages: TurboMessage[] = ticket?.messages || ticket?.replies || [];
  const uniqueMessages = React.useMemo(() => {
    if (!ticket) return [];
    const sorted = [...messages].sort((a, b) => {
      const tA = parseSafeDate(a.created_at)?.getTime() || 0;
      const tB = parseSafeDate(b.created_at)?.getTime() || 0;
      return tA - tB;
    });

    const seenKeys = new Set<string>();
    const initialText = (ticket.content || ticket.description || "")
      .trim()
      .replace(/\s+/g, " ");

    return sorted.filter((msg, idx) => {
      const text = (msg.content || msg.message || "").trim().replace(/\s+/g, " ");

      if (msg.id) {
        const idKey = `id_${msg.id}`;
        if (seenKeys.has(idKey)) return false;
        seenKeys.add(idKey);
      }

      const isStore = isMessageFromStore(msg);
      if (initialText && text === initialText && (idx === 0 || isStore)) {
        return false;
      }

      const contentKey = `c_${text}_${msg.created_at || ""}_${msg.user?.name || ""}`;
      if (seenKeys.has(contentKey)) return false;
      seenKeys.add(contentKey);

      return true;
    });
  }, [ticket, messages, isMessageFromStore]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success("تم نسخ كود الشحنة");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRate = async (score: number) => {
    if (submittingRating || !ticket?.id) return;
    try {
      setSubmittingRating(true);
      const res = await apiClient.post<any>(
        `/turbo/tickets/${ticket.id}/rate`,
        { rate: score }
      );
      if (res.data?.success) {
        setRatingScore(score);
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

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!replyText.trim() && !replyImage) || sending || !ticket?.id) return;

    try {
      setSending(true);
      const formData = new FormData();
      const text = replyText.trim() || (replyImage ? "مرفق لقطة شاشة / صورة" : "");
      formData.append("message", text);
      formData.append("content", text);
      formData.append("ticket_id", String(ticket.id));

      if (replyImage) {
        formData.append("image", replyImage);
      }

      const res = await apiClient.post<any>(
        `/turbo/tickets/${ticket.id}/reply`,
        formData
      );

      if (res.data?.success) {
        toast.success("تم إرسال الرد والمرفق بنجاح لشركة الشحن");
        setReplyText("");
        setReplyImage(null);
        onRefreshTicket();
      } else {
        toast.error(res.data?.message || res.data?.error || "فشل إرسال الرد");
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "حدث خطأ أثناء إرسال الرد"
      );
    } finally {
      setSending(false);
    }
  };

  return {
    replyText,
    setReplyText,
    replyImage,
    setReplyImage,
    replyImagePreview,
    isDragging,
    sending,
    ratingScore,
    submittingRating,
    copiedCode,
    previewImage,
    setPreviewImage,
    showOrderSidebar,
    setShowOrderSidebar,
    orderSearchQuery,
    setOrderSearchQuery,
    searchingOrder,
    activeOrder,
    messagesEndRef,
    uniqueMessages,
    handlePaste,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleCopyCode,
    handleRate,
    handleSendReply,
    handleSearchOrder,
    isMessageFromStore,
    formatSenderName,
  };
}
