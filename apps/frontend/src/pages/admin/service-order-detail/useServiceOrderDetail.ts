import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ServiceMediaFile } from "../../../components/services/MediaUploadZone";
import { authHeaders, PaymentFormState } from "./types";

export function useServiceOrderDetail(id: string | undefined) {
  const navigate = useNavigate();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingNotes, setSavingNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  // Files state
  const [showAddFiles, setShowAddFiles] = useState(false);
  const [additionalFiles, setAdditionalFiles] = useState<ServiceMediaFile[]>([]);
  const [savingFiles, setSavingFiles] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // WhatsApp state
  const [waDetection, setWaDetection] = useState<any>(null);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [waMessageText, setWaMessageText] = useState("");
  const [selectedWaSessionId, setSelectedWaSessionId] = useState("");
  const [sendingWa, setSendingWa] = useState(false);

  // Payment & Invoice state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState<PaymentFormState>({
    totalAmount: 0,
    newPaymentAmount: "",
    paymentMethod: "VODAFONE_CASH",
    newPaymentNote: "",
  });

  // Settings
  const [companySettings, setCompanySettings] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchOrder();
      fetchWhatsAppSession();
      fetchTeamMembers();
      fetchSettings();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/service-orders/${id}`, {
        headers: authHeaders() as any,
      });
      const data = await res.json();
      if (data.success && data.data) {
        setOrder(data.data);
        setNotes(data.data.notes || "");
        setAssignedTo(data.data.assignedTo || "");
        setPaymentForm((prev) => ({
          ...prev,
          totalAmount:
            data.data.payment?.totalAmount || data.data.service?.price || 0,
        }));
      } else {
        toast.error(data.error || "تعذر العثور على الطلب");
        navigate("/admin/service-orders");
      }
    } catch (e) {
      toast.error("حدث خطأ أثناء تحميل بيانات الطلب");
    } finally {
      setLoading(false);
    }
  };

  const fetchWhatsAppSession = async () => {
    try {
      const res = await fetch(`/api/v1/service-orders/${id}/whatsapp-session`, {
        headers: authHeaders() as any,
      });
      const data = await res.json();
      if (data.success && data.data) {
        setWaDetection(data.data);
        if (data.data.session?.id) {
          setSelectedWaSessionId(data.data.session.id);
        }
      }
    } catch (e) {
      console.warn("Could not fetch WhatsApp session:", e);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const res = await fetch("/api/v1/service-orders/team-members", {
        headers: authHeaders() as any,
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setTeamMembers(data.data);
      }
    } catch (e) {}
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/v1/service-orders/settings", {
        headers: authHeaders() as any,
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCompanySettings(data.data);
      }
    } catch (e) {}
  };

  const updateStatus = async (status: string) => {
    if (!id) return;
    try {
      const res = await fetch(`/api/v1/service-orders/${id}/status`, {
        method: "PUT",
        headers: authHeaders() as any,
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("تم تحديث حالة الطلب بنجاح");
        setOrder(data.data);
        if (data.data.assignedTo) {
          setAssignedTo(data.data.assignedTo);
        }
      } else {
        toast.error(data.error || "فشل تحديث الحالة");
      }
    } catch (e) {
      toast.error("خطأ في الاتصال بالخادم");
    }
  };

  const saveNotesAndAssignment = async () => {
    if (!id) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/v1/service-orders/${id}`, {
        method: "PUT",
        headers: authHeaders() as any,
        body: JSON.stringify({ notes, assignedTo }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("تم حفظ الملاحظات وتعيين الموظف المسؤول");
        setOrder(data.data);
      } else {
        toast.error(data.error || "فشل حفظ التعديلات");
      }
    } catch (e) {
      toast.error("خطأ أثناء حفظ التعديلات");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleSaveAdditionalFiles = async () => {
    if (!id || additionalFiles.length === 0) return;
    setSavingFiles(true);
    try {
      const currentFiles = order?.files || order?.referenceFiles || [];
      const updatedFiles = [...currentFiles, ...additionalFiles];
      const res = await fetch(`/api/v1/service-orders/${id}`, {
        method: "PUT",
        headers: authHeaders() as any,
        body: JSON.stringify({ referenceFiles: updatedFiles }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("تمت إضافة الملفات للطلب بنجاح");
        setOrder(data.data);
        setAdditionalFiles([]);
        setShowAddFiles(false);
      } else {
        toast.error(data.error || "فشل حفظ الملفات");
      }
    } catch (e) {
      toast.error("خطأ في حفظ الملفات");
    } finally {
      setSavingFiles(false);
    }
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSavingPayment(true);
    try {
      const res = await fetch(`/api/v1/service-orders/${id}/payment`, {
        method: "PUT",
        headers: authHeaders() as any,
        body: JSON.stringify({
          totalAmount: Number(paymentForm.totalAmount),
          paymentMethod: paymentForm.paymentMethod,
          newPaymentAmount: paymentForm.newPaymentAmount
            ? Number(paymentForm.newPaymentAmount)
            : undefined,
          newPaymentNote: paymentForm.newPaymentNote || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("تم تسجيل بيانات الدفع بنجاح!");
        setOrder(data.data);
        setShowPaymentModal(false);
        setPaymentForm((prev) => ({
          ...prev,
          newPaymentAmount: "",
          newPaymentNote: "",
        }));
      } else {
        toast.error(data.error || "فشل تسجيل الدفعة");
      }
    } catch (e) {
      toast.error("خطأ أثناء تحديث البيانات المالية");
    } finally {
      setSavingPayment(false);
    }
  };

  const handleSendWhatsAppSystem = async () => {
    if (!waMessageText.trim() || !id) {
      toast.error("يرجى كتابة نص الرسالة أولاً");
      return;
    }
    setSendingWa(true);
    try {
      const res = await fetch(`/api/v1/service-orders/${id}/send-whatsapp`, {
        method: "POST",
        headers: authHeaders() as any,
        body: JSON.stringify({
          message: waMessageText.trim(),
          sessionId: selectedWaSessionId || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("تم إرسال رسالة الواتساب للعميل من النظام بنجاح!");
        setShowWhatsAppModal(false);
        setWaMessageText("");
      } else {
        toast.error(data.error || "تعذر إرسال رسالة الواتساب");
      }
    } catch (e: any) {
      toast.error("خطأ في الاتصال بجلسة الواتساب");
    } finally {
      setSendingWa(false);
    }
  };

  const openWhatsAppExternal = () => {
    if (!order?.phone) return;
    let cleanPhone = order.phone.replace(/\D/g, "");
    if (cleanPhone.startsWith("01")) {
      cleanPhone = "2" + cleanPhone;
    }
    const serviceName = order.service?.name || "الخدمة";
    const shortId = order.id ? `#${order.id.slice(-6).toUpperCase()}` : "";
    const text = `مرحباً ${order.customerName || "عميلنا العزيز"}، نتواصل معك بخصوص طلبك لخدمة (${serviceName}) رقم ${shortId}.`;
    window.open(
      `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const openInternalWhatsAppChat = () => {
    if (!order?.phone) return;
    let cleanPhone = order.phone.replace(/\D/g, "");
    if (cleanPhone.startsWith("01")) cleanPhone = "2" + cleanPhone;
    navigate(`/whatsapp?phone=${cleanPhone}`);
  };

  const applyTemplate = (
    type: "CONFIRM" | "PROGRESS" | "INVOICE" | "DELIVERY"
  ) => {
    if (!order) return;
    const serviceName = order.service?.name || "الخدمة";
    const shortId = order.id ? `#${order.id.slice(-6).toUpperCase()}` : "";
    const total = order.payment?.totalAmount || 0;
    const paid = order.payment?.paidAmount || 0;
    const remaining = order.payment?.remainingAmount || 0;

    switch (type) {
      case "CONFIRM":
        setWaMessageText(
          `مرحباً ${order.customerName}، تم استلام وتأكيد طلبك لخدمة (${serviceName}) رقم ${shortId} بنجاح.\nسنتواصل معك لمتابعة التنفيذ فوراً.`
        );
        break;
      case "PROGRESS":
        setWaMessageText(
          `مرحباً ${order.customerName}، يسعدنا إبلاغك بأن طلبك لخدمة (${serviceName}) رقم ${shortId} قيد التنفيذ الآن بواسطة فريقنا الفني.`
        );
        break;
      case "INVOICE":
        setWaMessageText(
          `فاتورة طلب خدمة (${serviceName}) رقم ${shortId}:\n• إجمالي الحساب: ${total} ج.م\n• المدفوع (عربون): ${paid} ج.م\n• المتبقي: ${remaining} ج.م\n${
            companySettings?.vodafoneCashNumber
              ? `• فودافون كاش: ${companySettings.vodafoneCashNumber}\n`
              : ""
          }${
            companySettings?.instapayAddress
              ? `• إنستاباي: ${companySettings.instapayAddress}\n`
              : ""
          }شكراً لتعاملك معنا!`
        );
        break;
      case "DELIVERY":
        setWaMessageText(
          `مرحباً ${order.customerName}، نود إعلامك باكتمال العمل الخاص بطلبك لخدمة (${serviceName}) رقم ${shortId}، وهو جاهز للتسليم الآن!`
        );
        break;
    }
  };

  const handleDeleteOrder = async () => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الطلب نهائياً؟")) return;
    try {
      const res = await fetch(`/api/v1/service-orders/${id}`, {
        method: "DELETE",
        headers: authHeaders() as any,
      });
      const data = await res.json();
      if (data.success) {
        toast.success("تم حذف الطلب بنجاح");
        navigate("/admin/service-orders");
      } else {
        toast.error(data.error || "فشل حذف الطلب");
      }
    } catch (e) {
      toast.error("حدث خطأ أثناء حذف الطلب");
    }
  };

  return {
    order,
    loading,
    notes,
    setNotes,
    assignedTo,
    setAssignedTo,
    teamMembers,
    savingNotes,
    showAddFiles,
    setShowAddFiles,
    additionalFiles,
    setAdditionalFiles,
    savingFiles,
    selectedImage,
    setSelectedImage,
    waDetection,
    showWhatsAppModal,
    setShowWhatsAppModal,
    waMessageText,
    setWaMessageText,
    selectedWaSessionId,
    setSelectedWaSessionId,
    sendingWa,
    showPaymentModal,
    setShowPaymentModal,
    showInvoiceModal,
    setShowInvoiceModal,
    savingPayment,
    paymentForm,
    setPaymentForm,
    companySettings,
    updateStatus,
    saveNotesAndAssignment,
    handleSaveAdditionalFiles,
    handleSavePayment,
    handleSendWhatsAppSystem,
    openWhatsAppExternal,
    openInternalWhatsAppChat,
    applyTemplate,
    handleDeleteOrder,
  };
}
