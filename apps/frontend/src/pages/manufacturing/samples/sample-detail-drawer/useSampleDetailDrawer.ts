import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  manufacturingApi,
  SampleOrder,
  SampleOrderStage,
  PartnerFactory,
} from '../../manufacturingApi';
import { DrawerTab } from './types';

export function useSampleDetailDrawer(
  sample: SampleOrder | null,
  onRefresh: () => void
) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DrawerTab>('stages');
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modals inside drawer
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentPaidAt, setPaymentPaidAt] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Factory edit state
  const [isFactoryModalOpen, setIsFactoryModalOpen] = useState(false);
  const [factories, setFactories] = useState<PartnerFactory[]>([]);
  const [selectedFactoryId, setSelectedFactoryId] = useState('');
  const [selectedExpectedDeliveryAt, setSelectedExpectedDeliveryAt] =
    useState('');

  // Add stage form state
  const [newStageName, setNewStageName] = useState('');
  const [isAddingStage, setIsAddingStage] = useState(false);

  // File upload
  const [uploadingFile, setUploadingFile] = useState(false);

  // Sample expense management state
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [expenseNameInput, setExpenseNameInput] = useState('');
  const [expenseAmountInput, setExpenseAmountInput] = useState('');
  const [expenseSubmitting, setExpenseSubmitting] = useState(false);

  const handleStageStatusChange = async (
    stage: SampleOrderStage,
    newStatus: string
  ) => {
    if (!sample) return;
    try {
      setLoading(true);
      await manufacturingApi.updateSampleStage(sample.id, stage.id, {
        status: newStatus,
        startedAt:
          newStatus === 'IN_PROGRESS' ? new Date().toISOString() : undefined,
        completedAt:
          newStatus === 'COMPLETED' ? new Date().toISOString() : undefined,
      });
      onRefresh();
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message ||
          err?.message ||
          'فشل تحديث حالة المرحلة'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sample || !newStageName.trim()) return;

    try {
      setLoading(true);
      await manufacturingApi.addSampleStage(sample.id, {
        name: newStageName.trim(),
        sequence: (sample.stages?.length || 0) + 1,
      });
      setNewStageName('');
      setIsAddingStage(false);
      onRefresh();
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message || err?.message || 'فشل إضافة المرحلة'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!sample || !expenseNameInput.trim()) return;
    const amt = Number(expenseAmountInput) || 0;
    if (amt < 0) return;
    setExpenseSubmitting(true);
    try {
      await manufacturingApi.addSampleExpense(sample.id, {
        name: expenseNameInput.trim(),
        amount: amt,
      });
      setExpenseNameInput('');
      setExpenseAmountInput('');
      setIsAddingExpense(false);
      onRefresh();
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message || err?.message || 'فشل في إضافة المصروف'
      );
    } finally {
      setExpenseSubmitting(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!sample) return;
    if (!window.confirm('هل أنت متأكد من حذف هذا المصروف؟')) return;
    try {
      await manufacturingApi.deleteSampleExpense(sample.id, expenseId);
      onRefresh();
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message || err?.message || 'فشل في حذف المصروف'
      );
    }
  };

  const handleApprove = async (notes: string) => {
    if (!sample) return;
    try {
      setLoading(true);
      setActionError(null);
      await manufacturingApi.approveSampleOrder(sample.id, {
        resultNotes: notes.trim() || undefined,
      });
      setIsApproveModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message || err?.message || 'فشل اعتماد العينة'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (reason: string) => {
    if (!sample) return;
    try {
      setLoading(true);
      setActionError(null);
      await manufacturingApi.rejectSampleOrder(sample.id, {
        resultNotes: reason.trim(),
      });
      setIsRejectModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message || err?.message || 'فشل رفض العينة'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPaymentModal = () => {
    setPaymentAmount('');
    setPaymentMethod('CASH');
    setPaymentPaidAt(new Date().toISOString().split('T')[0]);
    setPaymentNotes('');
    setPaymentReference('');
    setPaymentError(null);
    setIsPaymentModalOpen(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sample) return;
    const amt = Number(paymentAmount);
    if (!amt || amt <= 0) {
      setPaymentError('مبلغ الدفعة يجب أن يكون رقماً موجباً');
      return;
    }
    setPaymentSubmitting(true);
    setPaymentError(null);
    try {
      await manufacturingApi.createSamplePayment(sample.id, {
        amount: amt,
        method: paymentMethod,
        paidAt: paymentPaidAt,
        reference: paymentReference.trim() || undefined,
        notes: paymentNotes.trim() || undefined,
      });
      setIsPaymentModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setPaymentError(
        err?.response?.data?.message || err?.message || 'فشل تسجيل الدفعة'
      );
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!sample) return;
    if (!window.confirm('هل أنت متأكد من حذف هذه الدفعة؟')) return;
    try {
      setLoading(true);
      await manufacturingApi.deleteSamplePayment(sample.id, paymentId);
      onRefresh();
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message || err?.message || 'فشل حذف الدفعة'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFactoryModal = async () => {
    if (!sample) return;
    setSelectedFactoryId(sample.partnerFactoryId || '');
    setSelectedExpectedDeliveryAt(
      sample.expectedDeliveryAt ? sample.expectedDeliveryAt.split('T')[0] : ''
    );
    setIsFactoryModalOpen(true);
    try {
      const res: any = await manufacturingApi.listPartnerFactories();
      setFactories(Array.isArray(res) ? res : res?.items || []);
    } catch (_) {}
  };

  const handleSaveFactoryCommercial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sample) return;
    try {
      setLoading(true);
      await manufacturingApi.updateSampleCommercial(sample.id, {
        partnerFactoryId: selectedFactoryId || null,
        expectedDeliveryAt: selectedExpectedDeliveryAt || null,
      });
      setIsFactoryModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message || err?.message || 'فشل تحديث بيانات المصنع'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!sample) return;
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);

      await manufacturingApi.uploadSampleFile(sample.id, formData);
      onRefresh();
    } catch {
      setActionError('فشل رفع الملف المرفق');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleToggleReceipt = async (currentReceived?: boolean) => {
    if (!sample) return;
    try {
      setLoading(true);
      await manufacturingApi.markSampleReceived(sample.id, {
        received: !currentReceived,
        receivedAt: !currentReceived ? new Date().toISOString() : undefined,
      });
      onRefresh();
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message ||
          err?.message ||
          'فشل تحديث حالة استلام العينة'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAttachment = async (fileId: string) => {
    if (!sample) return;
    if (!window.confirm('هل أنت متأكد من حذف هذا الملف المرفق؟')) return;
    try {
      setLoading(true);
      await manufacturingApi.deleteSampleFile(sample.id, fileId);
      onRefresh();
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message || err?.message || 'فشل حذف الملف المرفق'
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    navigate,
    activeTab,
    setActiveTab,
    loading,
    actionError,
    setActionError,
    isConvertModalOpen,
    setIsConvertModalOpen,
    isRejectModalOpen,
    setIsRejectModalOpen,
    isApproveModalOpen,
    setIsApproveModalOpen,
    isShareModalOpen,
    setIsShareModalOpen,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    paymentAmount,
    setPaymentAmount,
    paymentMethod,
    setPaymentMethod,
    paymentPaidAt,
    setPaymentPaidAt,
    paymentNotes,
    setPaymentNotes,
    paymentReference,
    setPaymentReference,
    paymentSubmitting,
    paymentError,
    isFactoryModalOpen,
    setIsFactoryModalOpen,
    factories,
    selectedFactoryId,
    setSelectedFactoryId,
    selectedExpectedDeliveryAt,
    setSelectedExpectedDeliveryAt,
    newStageName,
    setNewStageName,
    isAddingStage,
    setIsAddingStage,
    uploadingFile,
    isAddingExpense,
    setIsAddingExpense,
    expenseNameInput,
    setExpenseNameInput,
    expenseAmountInput,
    setExpenseAmountInput,
    expenseSubmitting,
    handleStageStatusChange,
    handleAddStage,
    handleAddExpense,
    handleDeleteExpense,
    handleApprove,
    handleReject,
    handleOpenPaymentModal,
    handleRecordPayment,
    handleDeletePayment,
    handleOpenFactoryModal,
    handleSaveFactoryCommercial,
    handleFileUpload,
    handleToggleReceipt,
    handleDeleteAttachment,
  };
}
