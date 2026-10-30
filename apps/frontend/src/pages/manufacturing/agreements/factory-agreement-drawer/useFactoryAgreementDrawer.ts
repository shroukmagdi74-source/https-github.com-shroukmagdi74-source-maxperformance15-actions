import { useState, useEffect, useCallback } from "react";
import {
  manufacturingApi,
  FactoryAgreement,
  FactoryAgreementPayment,
} from "../../manufacturingApi";
import type { AgreementTab } from "./types";

export interface UseFactoryAgreementDrawerProps {
  agreementId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function useFactoryAgreementDrawer({
  agreementId,
  isOpen,
  onClose,
  onRefresh,
}: UseFactoryAgreementDrawerProps) {
  const [agreement, setAgreement] = useState<FactoryAgreement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AgreementTab>("payments");

  // Payment creation modal
  const [showAddPaymentModal, setShowAddPaymentModal] = useState<boolean>(false);
  const [paymentLabel, setPaymentLabel] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentDueDate, setPaymentDueDate] = useState<string>("");
  const [paymentNotes, setPaymentNotes] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Pay modal
  const [payingPayment, setPayingPayment] =
    useState<FactoryAgreementPayment | null>(null);
  const [payReference, setPayReference] = useState<string>("");
  const [payNotes, setPayNotes] = useState<string>("");

  // File upload state
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);

  const fetchAgreement = useCallback(async () => {
    if (!agreementId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await manufacturingApi.getFactoryAgreement(agreementId);
      setAgreement(res.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "تعذر تحميل بيانات الاتفاقية",
      );
    } finally {
      setLoading(false);
    }
  }, [agreementId]);

  useEffect(() => {
    if (isOpen && agreementId) {
      fetchAgreement();
    } else {
      setAgreement(null);
    }
  }, [isOpen, agreementId, fetchAgreement]);

  // Activation handler
  const handleActivate = async () => {
    if (!agreement) return;
    try {
      setActionLoading(true);
      setError(null);
      await manufacturingApi.activateAgreement(agreement.id);
      await fetchAgreement();
      onRefresh();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "فشل تفعيل الاتفاقية",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Close agreement handler
  const handleCloseAgreement = async () => {
    if (!agreement) return;
    try {
      setActionLoading(true);
      setError(null);
      await manufacturingApi.closeAgreement(agreement.id);
      await fetchAgreement();
      onRefresh();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "فشل إغلاق الاتفاقية",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel agreement handler
  const handleCancelAgreement = async () => {
    if (!agreement) return;
    if (!window.confirm("هل أنت متأكد من رغبتك في إلغاء هذه الاتفاقية؟")) return;
    try {
      setActionLoading(true);
      setError(null);
      await manufacturingApi.cancelAgreement(agreement.id);
      await fetchAgreement();
      onRefresh();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "فشل إلغاء الاتفاقية",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Delete draft handler
  const handleDeleteDraft = async () => {
    if (!agreement) return;
    if (!window.confirm("هل أنت متأكد من حذف هذه المسودة نهائياً؟")) return;
    try {
      setActionLoading(true);
      setError(null);
      await manufacturingApi.deleteFactoryAgreement(agreement.id);
      onRefresh();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "فشل حذف المسودة");
      setActionLoading(false);
    }
  };

  // Generate 70/20/10 schedule
  const handleGenerateDefaultPayments = async () => {
    if (!agreement) return;
    try {
      setActionLoading(true);
      setError(null);
      await manufacturingApi.generateAgreementPayments(agreement.id);
      await fetchAgreement();
      onRefresh();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "فشل توليد جدول الدفعات",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Add manual payment
  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreement) return;
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      setError("يرجى إدخال مبلغ صحيح للدفعة");
      return;
    }
    try {
      setActionLoading(true);
      setError(null);
      await manufacturingApi.createAgreementPayment(agreement.id, {
        label: paymentLabel.trim() || undefined,
        amount: Number(paymentAmount),
        dueDate: paymentDueDate || undefined,
        notes: paymentNotes.trim() || undefined,
      });
      setShowAddPaymentModal(false);
      setPaymentLabel("");
      setPaymentAmount("");
      setPaymentDueDate("");
      setPaymentNotes("");
      await fetchAgreement();
      onRefresh();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "فشل إضافة الدفعة",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Mark payment as paid
  const handleConfirmPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreement || !payingPayment) return;
    try {
      setActionLoading(true);
      setError(null);
      await manufacturingApi.payAgreementPayment(
        agreement.id,
        payingPayment.id,
        {
          reference: payReference.trim() || undefined,
          notes: payNotes.trim() || undefined,
        },
      );
      setPayingPayment(null);
      setPayReference("");
      setPayNotes("");
      await fetchAgreement();
      onRefresh();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "فشل تسجيل السداد",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel payment
  const handleCancelPayment = async (paymentId: string) => {
    if (!agreement) return;
    if (!window.confirm("هل أنت متأكد من إلغاء هذه الدفعة؟")) return;
    try {
      setActionLoading(true);
      setError(null);
      await manufacturingApi.cancelAgreementPayment(agreement.id, paymentId);
      await fetchAgreement();
      onRefresh();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "فشل إلغاء الدفعة",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // File upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!agreement || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    try {
      setUploadingFile(true);
      setError(null);
      await manufacturingApi.uploadAgreementFile(agreement.id, formData);
      await fetchAgreement();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "فشل رفع الملف");
    } finally {
      setUploadingFile(false);
      e.target.value = "";
    }
  };

  // File delete
  const handleDeleteFile = async (fileId: string) => {
    if (!agreement) return;
    if (!window.confirm("هل أنت متأكد من حذف هذا الملف؟")) return;
    try {
      setActionLoading(true);
      setError(null);
      await manufacturingApi.deleteAgreementFile(agreement.id, fileId);
      await fetchAgreement();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "فشل حذف الملف");
    } finally {
      setActionLoading(false);
    }
  };

  return {
    agreement,
    loading,
    error,
    setError,
    activeTab,
    setActiveTab,
    actionLoading,
    showAddPaymentModal,
    setShowAddPaymentModal,
    paymentLabel,
    setPaymentLabel,
    paymentAmount,
    setPaymentAmount,
    paymentDueDate,
    setPaymentDueDate,
    paymentNotes,
    setPaymentNotes,
    payingPayment,
    setPayingPayment,
    payReference,
    setPayReference,
    payNotes,
    setPayNotes,
    uploadingFile,
    fetchAgreement,
    handleActivate,
    handleCloseAgreement,
    handleCancelAgreement,
    handleDeleteDraft,
    handleGenerateDefaultPayments,
    handleCreatePayment,
    handleConfirmPay,
    handleCancelPayment,
    handleFileUpload,
    handleDeleteFile,
  };
}
