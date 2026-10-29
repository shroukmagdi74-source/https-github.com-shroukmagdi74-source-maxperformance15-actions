import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
  Play,
  Check,
  Plus,
  Upload,
  ExternalLink,
  FileText,
  Share2,
  Building2,
  Calendar,
  DollarSign,
  AlertTriangle,
  CreditCard,
  Trash2,
  Clock,
} from 'lucide-react';
import { manufacturingApi, SampleOrder, SampleOrderStage, PartnerFactory } from '../manufacturingApi';
import { SampleStatusBadge, MaterialSourceBadge } from './SampleStatusBadge';
import { ConvertToOrderModal } from './ConvertToOrderModal';
import { SampleApproveModal, SampleRejectModal } from './SampleApproveRejectModals';
import { ShareSampleModal } from './ShareSampleModal';

interface SampleDetailDrawerProps {
  sample: SampleOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export const SampleDetailDrawer: React.FC<SampleDetailDrawerProps> = ({
  sample,
  isOpen,
  onClose,
  onRefresh,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'info' | 'stages' | 'attachments' | 'finance'>('stages');
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
  const [paymentPaidAt, setPaymentPaidAt] = useState(new Date().toISOString().split('T')[0]);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Factory edit state
  const [isFactoryModalOpen, setIsFactoryModalOpen] = useState(false);
  const [factories, setFactories] = useState<PartnerFactory[]>([]);
  const [selectedFactoryId, setSelectedFactoryId] = useState('');
  const [selectedExpectedDeliveryAt, setSelectedExpectedDeliveryAt] = useState('');

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

  if (!isOpen || !sample) return null;

  const handleStageStatusChange = async (stage: SampleOrderStage, newStatus: string) => {
    try {
      setLoading(true);
      await manufacturingApi.updateSampleStage(sample.id, stage.id, {
        status: newStatus,
        startedAt: newStatus === 'IN_PROGRESS' ? new Date().toISOString() : undefined,
        completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : undefined,
      });
      onRefresh();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || err?.message || 'فشل تحديث حالة المرحلة');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStageName.trim()) return;

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
      setActionError(err?.response?.data?.message || err?.message || 'فشل إضافة المرحلة');
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
      setActionError(err?.response?.data?.message || err?.message || 'فشل في إضافة المصروف');
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
      setActionError(err?.response?.data?.message || err?.message || 'فشل في حذف المصروف');
    }
  };

  const handleApprove = async (notes: string) => {
    try {
      setLoading(true);
      setActionError(null);
      await manufacturingApi.approveSampleOrder(sample.id, { resultNotes: notes.trim() || undefined });
      setIsApproveModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || err?.message || 'فشل اعتماد العينة');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (reason: string) => {
    try {
      setLoading(true);
      setActionError(null);
      await manufacturingApi.rejectSampleOrder(sample.id, { resultNotes: reason.trim() });
      setIsRejectModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || err?.message || 'فشل رفض العينة');
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
      setPaymentError(err?.response?.data?.message || err?.message || 'فشل تسجيل الدفعة');
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الدفعة؟')) return;
    try {
      setLoading(true);
      await manufacturingApi.deleteSamplePayment(sample.id, paymentId);
      onRefresh();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || err?.message || 'فشل حذف الدفعة');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFactoryModal = async () => {
    setSelectedFactoryId(sample.partnerFactoryId || '');
    setSelectedExpectedDeliveryAt(sample.expectedDeliveryAt ? sample.expectedDeliveryAt.split('T')[0] : '');
    setIsFactoryModalOpen(true);
    try {
      const res: any = await manufacturingApi.listPartnerFactories();
      setFactories(Array.isArray(res) ? res : (res?.items || []));
    } catch (_) {}
  };

  const handleSaveFactoryCommercial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await manufacturingApi.updateSampleCommercial(sample.id, {
        partnerFactoryId: selectedFactoryId || null,
        expectedDeliveryAt: selectedExpectedDeliveryAt || null,
      });
      setIsFactoryModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || err?.message || 'فشل تحديث بيانات المصنع');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);

      await manufacturingApi.uploadSampleFile(sample.id, formData);
      onRefresh();
    } catch (err: any) {
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
      setActionError(err?.response?.data?.message || err?.message || 'فشل تحديث حالة استلام العينة');
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
      setActionError(err?.response?.data?.message || err?.message || 'فشل حذف الملف المرفق');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 w-full max-w-xl z-50 bg-card border-r border-border shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-border/80 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-foreground tabular-nums">{sample.sampleNumber}</h2>
            <SampleStatusBadge status={sample.status} />
            <MaterialSourceBadge source={sample.materialSource} />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              title="مشاركة العينة"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>مشاركة</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Receipt Quick Status Bar */}
        <div className="px-4 py-2.5 bg-muted/40 border-b border-border/70 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium">الاستلام الفعلي:</span>
            {sample.sampleReceived ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>تم الاستلام {sample.receivedAt ? `(${new Date(sample.receivedAt).toLocaleDateString('ar-EG')})` : ''}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                <Clock className="w-3.5 h-3.5" />
                <span>في انتظار الاستلام</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleToggleReceipt(sample.sampleReceived)}
            disabled={loading}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50 ${
              sample.sampleReceived
                ? 'border border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{sample.sampleReceived ? 'إلغاء الاستلام' : 'تأكيد استلام العينة'}</span>
          </button>
        </div>

        {/* Global Action Error Alert */}
        {actionError && (
          <div className="p-3 mx-4 mt-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center justify-between">
            <span>{actionError}</span>
            <button onClick={() => setActionError(null)} className="text-rose-400 hover:text-rose-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Big Conversion / Approval Status Banner */}
        <div className="px-4 pt-3">
          {sample.status === 'CONVERTED' && (
            <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-purple-800 dark:text-purple-200 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />
                <div>
                  <p>تم تحويل العينة بنجاح لأمر تصنيع كامل</p>
                  <p className="text-[11px] font-normal text-purple-700/80 dark:text-purple-300/80">
                    رقم أمر الإنتاج: {sample.convertedOrder?.orderNumber || sample.convertedOrderId}
                  </p>
                </div>
              </div>
              {sample.convertedOrderId && (
                <button
                  onClick={() => navigate(`/manufacturing/orders/${sample.convertedOrderId}`)}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors shrink-0 flex items-center gap-1 shadow-sm text-xs"
                >
                  <span>اذهب للأمر</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {sample.status === 'APPROVED' && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p>العينة معتمدة وجاهزة للتحويل لأمر تصنيع كامل</p>
                  {sample.resultNotes && (
                    <p className="text-[11px] font-normal text-emerald-700/80 dark:text-emerald-300/80">
                      ملاحظات الاعتماد: {sample.resultNotes}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsConvertModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shrink-0 flex items-center gap-1 shadow-sm text-xs active:scale-95"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>تحويل لأمر تصنيع</span>
              </button>
            </div>
          )}

          {sample.status === 'REJECTED' && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs">
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200 font-semibold mb-1">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>تم رفض هذه العينة</span>
              </div>
              <p className="text-[11px] text-rose-700 dark:text-rose-300">
                سبب الرفض: <span className="font-medium">{sample.resultNotes || 'غير محدد'}</span>
              </p>
            </div>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="px-4 pt-3 border-b border-border flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('stages')}
            className={`pb-2.5 font-medium border-b-2 transition-all ${
              activeTab === 'stages'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            مراحل التشغيل ({sample.stages?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-2.5 font-medium border-b-2 transition-all ${
              activeTab === 'info'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            المواصفات والبيانات
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={`pb-2.5 font-medium border-b-2 transition-all flex items-center gap-1 ${
              activeTab === 'finance'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>المصنع والدفع</span>
            {sample.isOverdue && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('attachments')}
            className={`pb-2.5 font-medium border-b-2 transition-all ${
              activeTab === 'attachments'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            المرفقات والصور ({sample.attachments?.length || 0})
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: STAGES */}
          {activeTab === 'stages' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">مسار تشغيل مراحل العينة</span>
                <button
                  onClick={() => setIsAddingStage(true)}
                  className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" /> إضافة مرحلة
                </button>
              </div>

              {isAddingStage && (
                <form onSubmit={handleAddStage} className="p-3 rounded-xl border border-primary/30 bg-primary/5 space-y-2">
                  <input
                    type="text"
                    required
                    value={newStageName}
                    onChange={(e) => setNewStageName(e.target.value)}
                    placeholder="اسم المرحلة الجديدة (مثال: تطريز اللوجو)"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background outline-none focus:ring-1 focus:ring-primary"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingStage(false)}
                      className="px-2.5 py-1 text-xs rounded-md border hover:bg-muted"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-3 py-1 text-xs rounded-md bg-primary text-primary-foreground font-medium"
                    >
                      إضافة
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {sample.stages?.map((st) => (
                  <div
                    key={st.id}
                    className="p-3 rounded-xl border border-border/70 bg-card hover:border-border transition-all flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center font-bold text-[11px] tabular-nums shrink-0">
                        {st.sequence}
                      </span>
                      <div>
                        <p className="font-semibold text-foreground">{st.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {st.status === 'COMPLETED'
                            ? 'مكتملة بنجاح'
                            : st.status === 'IN_PROGRESS'
                            ? 'قيد التنفيذ حالياً'
                            : 'في الانتظار'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {st.status === 'PENDING' && (
                        <button
                          onClick={() => handleStageStatusChange(st, 'IN_PROGRESS')}
                          disabled={loading}
                          className="px-2.5 py-1 rounded-lg border border-blue-500/30 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium hover:bg-blue-100 flex items-center gap-1 active:scale-95"
                        >
                          <Play className="w-3 h-3" />
                          <span>بدء</span>
                        </button>
                      )}
                      {st.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleStageStatusChange(st, 'COMPLETED')}
                          disabled={loading}
                          className="px-2.5 py-1 rounded-lg border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium hover:bg-emerald-100 flex items-center gap-1 active:scale-95"
                        >
                          <Check className="w-3 h-3" />
                          <span>إنهاء</span>
                        </button>
                      )}
                      {st.status === 'COMPLETED' && (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>تم</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SPECIFICATIONS */}
          {activeTab === 'info' && (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl border border-border/70 bg-card space-y-2">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">اسم المنتج:</span>
                  <span className="font-bold text-foreground">{sample.productName}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">العميل:</span>
                  <span className="font-medium">{sample.customerName || 'عميل غير مسجل'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">العلامة التجارية:</span>
                  <span className="font-medium">{sample.brandName || '-'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">الكمية:</span>
                  <span className="font-semibold tabular-nums">{sample.plannedQuantity} قطعة</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">المقاس / اللون:</span>
                  <span className="font-semibold">
                    {sample.size || '-'} / {sample.color || '-'}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">مصدر الخامة:</span>
                  <span className="font-medium">
                    {sample.materialSource === 'CUSTOMER' ? 'خامة من العميل (CMT)' : 'خامة من المصنع'}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">سعر / تكلفة العينة:</span>
                  <span className="font-bold text-foreground tabular-nums">
                    {sample.fee ? `${sample.fee} ج.م` : 'غير محدد'}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-muted-foreground">المصاريف ({sample.expenses?.length || 0}):</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold tabular-nums">
                      {Number(sample.expensesTotal || 0).toLocaleString()} ج.م
                    </span>
                    {sample.status !== 'CONVERTED' && !isAddingExpense && (
                      <button
                        type="button"
                        onClick={() => setIsAddingExpense(true)}
                        className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-0.5"
                        title="إضافة مصروف للعينة"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>إضافة</span>
                      </button>
                    )}
                  </div>
                </div>

                {isAddingExpense && (
                  <div className="p-2 rounded bg-muted/40 border border-border/70 space-y-2 mb-1">
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        placeholder="اسم المصروف (مثال: شحن)"
                        value={expenseNameInput}
                        onChange={(e) => setExpenseNameInput(e.target.value)}
                        className="px-2 py-1 text-xs rounded border border-border bg-background"
                      />
                      <input
                        type="number"
                        placeholder="المبلغ (ج.م)"
                        min="0"
                        value={expenseAmountInput}
                        onChange={(e) => setExpenseAmountInput(e.target.value)}
                        className="px-2 py-1 text-xs rounded border border-border bg-background"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsAddingExpense(false)}
                        className="px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground"
                      >
                        إلغاء
                      </button>
                      <button
                        type="button"
                        disabled={expenseSubmitting || !expenseNameInput.trim()}
                        onClick={handleAddExpense}
                        className="px-2 py-0.5 text-[11px] font-medium rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                      >
                        {expenseSubmitting ? 'جاري الإضافة...' : 'حفظ'}
                      </button>
                    </div>
                  </div>
                )}

                {sample.expenses?.map((ex) => (
                  <div key={ex.id} className="flex justify-between items-center text-[11px] text-muted-foreground pr-2 border-b pb-1">
                    <span className="flex items-center gap-1.5">
                      {sample.status !== 'CONVERTED' && (
                        <button
                          type="button"
                          onClick={() => handleDeleteExpense(ex.id)}
                          className="hover:text-rose-600 p-0.5 rounded transition-colors"
                          title="حذف هذا المصروف"
                        >
                          <Trash2 className="w-3 h-3 text-muted-foreground hover:text-rose-600" />
                        </button>
                      )}
                      <span>· {ex.name}</span>
                    </span>
                    <span className="tabular-nums font-medium text-foreground">{Number(ex.amount).toLocaleString()} ج.م</span>
                  </div>
                ))}
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">التكلفة الإجمالية للعينة:</span>
                  <span className="font-bold text-foreground tabular-nums">
                    {Number(sample.totalCost || 0).toLocaleString()} ج.م
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">موعد تسليم العميل:</span>
                  <span className="font-medium">
                    {sample.dueDate ? new Date(sample.dueDate).toLocaleDateString('ar-EG') : '-'}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">المصنع المنفذ:</span>
                  <span className="font-semibold text-foreground">
                    {sample.partnerFactory?.name || 'بدون مصنع'}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">موعد استلام المصنع:</span>
                  <span className="font-medium">
                    {sample.expectedDeliveryAt
                      ? new Date(sample.expectedDeliveryAt).toLocaleDateString('ar-EG')
                      : 'غير محدد'}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">حالة استلام العينة:</span>
                  <div>
                    {sample.sampleReceived ? (
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تم الاستلام {sample.receivedAt ? `(${new Date(sample.receivedAt).toLocaleDateString('ar-EG')})` : ''}</span>
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">في انتظار الاستلام من المصنع</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الحساب المالي:</span>
                  <span className="font-bold text-foreground tabular-nums">
                    {(() => {
                      const total = sample.totalAmount !== null && sample.totalAmount !== undefined ? Number(sample.totalAmount) : Number(sample.fee || 0);
                      const paid = Number(sample.paidAmount || 0);
                      const rem = sample.remaining !== undefined ? Number(sample.remaining) : total - paid;
                      return `إجمالي: ${total.toLocaleString()} · مدفوع: ${paid.toLocaleString()} · متبقي: ${rem.toLocaleString()} ج.م`;
                    })()}
                  </span>
                </div>
              </div>

              {sample.designNotes && (
                <div className="p-3 rounded-xl border border-border/70 bg-muted/20">
                  <p className="font-semibold text-foreground mb-1">ملاحظات التصميم:</p>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{sample.designNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ATTACHMENTS */}
          {activeTab === 'attachments' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">صور ومرفقات العينة</span>
                <label className="text-xs text-primary hover:underline flex items-center gap-1 font-medium cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingFile ? 'جاري الرفع...' : 'رفع صورة/ملف'}</span>
                  <input type="file" onChange={handleFileUpload} disabled={uploadingFile} className="hidden" />
                </label>
              </div>

              {(!sample.attachments || sample.attachments.length === 0) && (
                <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
                  لا توجد مرفقات أو صور مرفوعة بعد
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {sample.attachments?.map((att) => (
                  <div key={att.id} className="p-2 rounded-xl border border-border bg-card group relative overflow-hidden flex flex-col justify-between">
                    <div className="relative">
                      {att.kind === 'IMAGE' ? (
                        <img src={att.url} alt={att.fileName} className="w-full h-32 object-cover rounded-lg mb-1.5" />
                      ) : (
                        <div className="w-full h-32 bg-muted/40 rounded-lg mb-1.5 flex flex-col items-center justify-center text-muted-foreground">
                          <FileText className="w-8 h-8 mb-1" />
                          <span className="text-[10px]">{att.kind}</span>
                        </div>
                      )}
                      <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-background/80 backdrop-blur-xs border border-border text-foreground">
                        {att.kind}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-1 pt-1">
                      <p className="text-[11px] font-medium text-foreground truncate flex-1" title={att.fileName}>
                        {att.fileName}
                      </p>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
                          title="عرض / تحميل"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDeleteAttachment(att.id)}
                          className="p-1 rounded text-muted-foreground hover:text-rose-500 hover:bg-muted"
                          title="حذف المرفق"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: FINANCE & FACTORY */}
          {activeTab === 'finance' && (
            <div className="space-y-4 text-xs">
              {/* Overdue Alert Banner if overdue */}
              {sample.isOverdue && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-xs">تنبيه: فات موعد الاستلام المتوقع من المصنع!</p>
                    <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
                      موعد الاستلام المحدد كان{' '}
                      {sample.expectedDeliveryAt ? new Date(sample.expectedDeliveryAt).toLocaleDateString('ar-EG') : '—'}{' '}
                      (تأخير {sample.overdueDays} يوم)، والعينة لم يتم استلامها بعد.
                    </p>
                  </div>
                </div>
              )}

              {/* Card 1: Partner Factory */}
              <div className="p-3.5 rounded-xl border border-border/70 bg-card space-y-2.5">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <Building2 className="w-4 h-4 text-primary" />
                    <span>المصنع المنفذ للعينة</span>
                  </div>
                  {sample.status !== 'CONVERTED' && (
                    <button
                      onClick={handleOpenFactoryModal}
                      className="text-xs text-primary hover:underline font-semibold"
                    >
                      {sample.partnerFactory ? 'تغيير المصنع' : 'تعيين مصنع'}
                    </button>
                  )}
                </div>

                {sample.partnerFactory ? (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">اسم المصنع:</span>
                      <span className="font-bold text-foreground">{sample.partnerFactory.name}</span>
                    </div>
                    {sample.partnerFactory.code && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">كود المصنع:</span>
                        <span className="font-mono text-xs">{sample.partnerFactory.code}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">مسؤول الاتصال:</span>
                      <span className="font-medium">{sample.partnerFactory.contactPerson || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">رقم الهاتف:</span>
                      <span className="font-medium">{sample.partnerFactory.phone || '—'}</span>
                    </div>
                    {sample.partnerFactory.email && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">البريد الإلكتروني:</span>
                        <span className="font-medium">{sample.partnerFactory.email}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground border border-dashed rounded-lg">
                    <p className="mb-2">لم يتم تحديد مصنع منفذ لهذه العينة بعد</p>
                    {sample.status !== 'CONVERTED' && (
                      <button
                        onClick={handleOpenFactoryModal}
                        className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded-md font-semibold text-xs"
                      >
                        + اختيار مصنع شريك
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Card 2: Dates & Schedule */}
              <div className="p-3.5 rounded-xl border border-border/70 bg-card space-y-2">
                <div className="flex items-center gap-2 font-bold text-foreground border-b border-border/60 pb-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>المواعيد والجدول الزمني</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-2">
                  <span className="text-muted-foreground">موعد تسليم العميل (DueDate):</span>
                  <span className="font-semibold text-foreground">
                    {sample.dueDate ? new Date(sample.dueDate).toLocaleDateString('ar-EG') : 'غير محدد'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">موعد الاستلام المتوقع من المصنع:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {sample.expectedDeliveryAt
                        ? new Date(sample.expectedDeliveryAt).toLocaleDateString('ar-EG')
                        : 'غير محدد'}
                    </span>
                    {sample.sampleReceived ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>مستلمة {sample.receivedAt ? `(${new Date(sample.receivedAt).toLocaleDateString('ar-EG')})` : ''}</span>
                      </span>
                    ) : (
                      sample.isOverdue && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          متأخر {sample.overdueDays} يوم
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Card 3: Financial Summary & Payments */}
              {(() => {
                const total = sample.totalAmount !== null && sample.totalAmount !== undefined ? Number(sample.totalAmount) : Number(sample.fee || 0);
                const deposit = Number(sample.depositAmount || 0);
                const paid = Number(sample.paidAmount || 0);
                const remaining = sample.remaining !== undefined ? Number(sample.remaining) : Math.round((total - paid) * 100) / 100;
                const progressPct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : (paid > 0 ? 100 : 0);

                return (
                  <div className="p-3.5 rounded-xl border border-border/70 bg-card space-y-3">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <div className="flex items-center gap-2 font-bold text-foreground">
                        <CreditCard className="w-4 h-4 text-primary" />
                        <span>الحساب المالي والدفع</span>
                      </div>
                      <button
                        onClick={handleOpenPaymentModal}
                        className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 flex items-center gap-1 shadow-sm active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>تسجيل دفعة</span>
                      </button>
                    </div>

                    {/* 4 Financial Metric Boxes */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60">
                        <div className="text-[10px] text-muted-foreground mb-0.5">المبلغ الإجمالي</div>
                        <div className="font-bold text-sm text-foreground tabular-nums">
                          {total.toLocaleString()} <span className="text-[10px] font-normal">ج.م</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/50">
                        <div className="text-[10px] text-blue-700 dark:text-blue-300 mb-0.5">العربون المطلوب</div>
                        <div className="font-bold text-sm text-blue-800 dark:text-blue-200 tabular-nums">
                          {deposit.toLocaleString()} <span className="text-[10px] font-normal">ج.م</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/50">
                        <div className="text-[10px] text-emerald-700 dark:text-emerald-300 mb-0.5">المدفوع الفعلي</div>
                        <div className="font-bold text-sm text-emerald-800 dark:text-emerald-200 tabular-nums">
                          {paid.toLocaleString()} <span className="text-[10px] font-normal">ج.م</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/50">
                        <div className="text-[10px] text-amber-700 dark:text-amber-300 mb-0.5">المتبقي</div>
                        <div className="font-bold text-sm text-amber-800 dark:text-amber-200 tabular-nums">
                          {remaining.toLocaleString()} <span className="text-[10px] font-normal">ج.م</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>نسبة سداد العينة: {progressPct}%</span>
                        <span>{paid.toLocaleString()} من {total.toLocaleString()} ج.م</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Payments Table */}
                    <div className="pt-2 border-t border-border/60">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-foreground">سجل الدفعات ({sample.payments?.length || 0})</span>
                      </div>

                      {(!sample.payments || sample.payments.length === 0) ? (
                        <div className="p-4 text-center text-muted-foreground border border-dashed rounded-lg text-xs">
                          لا توجد دفعات مسجلة لهذه العينة حتى الآن
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-lg border border-border/60">
                          <table className="w-full text-right text-xs">
                            <thead className="bg-muted/50 text-muted-foreground font-semibold border-b">
                              <tr>
                                <th className="py-2 px-3">التاريخ</th>
                                <th className="py-2 px-3">النوع</th>
                                <th className="py-2 px-3">الطريقة</th>
                                <th className="py-2 px-3">المبلغ</th>
                                <th className="py-2 px-3">ملاحظات</th>
                                <th className="py-2 px-3 text-left">إجراء</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                              {sample.payments.map((p) => (
                                <tr key={p.id} className="hover:bg-muted/30">
                                  <td className="py-2 px-3 tabular-nums whitespace-nowrap">
                                    {p.paidAt ? new Date(p.paidAt).toLocaleDateString('ar-EG') : '—'}
                                  </td>
                                  <td className="py-2 px-3 whitespace-nowrap">
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary">
                                      {p.kind === 'DEPOSIT'
                                        ? 'عربون'
                                        : p.kind === 'FINAL'
                                        ? 'نهائية'
                                        : 'دفعة'}
                                    </span>
                                  </td>
                                  <td className="py-2 px-3 whitespace-nowrap text-muted-foreground">
                                    {p.method || 'نقدي'}
                                  </td>
                                  <td className="py-2 px-3 font-bold text-foreground tabular-nums whitespace-nowrap">
                                    {Number(p.amount).toLocaleString()} ج.م
                                  </td>
                                  <td className="py-2 px-3 text-muted-foreground truncate max-w-[150px]">
                                    {p.notes || p.reference || '—'}
                                  </td>
                                  <td className="py-2 px-3 text-left whitespace-nowrap">
                                    <button
                                      onClick={() => handleDeletePayment(p.id)}
                                      disabled={loading}
                                      className="p-1 text-muted-foreground hover:text-rose-600 rounded transition-colors"
                                      title="حذف الدفعة"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        {sample.status !== 'CONVERTED' && (
          <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between gap-2">
            {sample.status !== 'APPROVED' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsApproveModalOpen(true)}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-sm active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>اعتماد العينة</span>
                </button>
                <button
                  onClick={() => setIsRejectModalOpen(true)}
                  disabled={loading}
                  className="px-3.5 py-2 rounded-lg border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <span>رفض</span>
                </button>
              </div>
            )}

            {sample.status === 'APPROVED' && (
              <button
                onClick={() => setIsConvertModalOpen(true)}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>تحويل العينة إلى أمر تصنيع وتشغيل كامل</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Convert Modal */}
      <ConvertToOrderModal
        isOpen={isConvertModalOpen}
        sample={sample}
        onClose={() => setIsConvertModalOpen(false)}
        onSuccess={(order) => {
          onRefresh();
          navigate(`/manufacturing/orders/${order.id}`);
        }}
      />

      {/* Separate Approve Modal */}
      <SampleApproveModal
        isOpen={isApproveModalOpen}
        loading={loading}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={handleApprove}
      />

      {/* Separate Reject Modal */}
      <SampleRejectModal
        isOpen={isRejectModalOpen}
        loading={loading}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleReject}
      />

      {/* Share Sample Modal */}
      <ShareSampleModal
        sample={sample}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onRefresh={onRefresh}
      />

      {/* Record Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-foreground">تسجيل دفعة على أمر العينة ({sample.sampleNumber})</h3>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {paymentError && (
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs text-rose-700 dark:text-rose-300">
                {paymentError}
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">المبلغ المطلوب سداده (ج.م) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder={`المتبقي: ${sample.remaining ?? ''}`}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background outline-none focus:ring-1 focus:ring-primary tabular-nums"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">طريقة الدفع *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="CASH">نقدي (CASH)</option>
                  <option value="INSTAPAY">انستاباي (InstaPay)</option>
                  <option value="BANK_TRANSFER">تحويل بنكي (Bank Transfer)</option>
                  <option value="VODAFONE_CASH">فودافون كاش (Vodafone Cash)</option>
                  <option value="CREDIT_CARD">بطاقة ائتمان (Credit Card)</option>
                  <option value="VISA">فيزا (Visa)</option>
                  <option value="MASTERCARD">ماستركارد (MasterCard)</option>
                  <option value="WALLET">محفظة إلكترونية (Wallet)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">تاريخ الدفعة *</label>
                <input
                  type="date"
                  required
                  value={paymentPaidAt}
                  onChange={(e) => setPaymentPaidAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">الرقم المرجعي (إيصال / عملية)</label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="مثال: REF-928174 أو رقم التحويل"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">ملاحظات إضافية</label>
                <textarea
                  rows={2}
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="أي تفاصيل عن الدفعة..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  disabled={paymentSubmitting}
                  className="px-3.5 py-1.5 rounded-lg border hover:bg-muted"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={paymentSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50"
                >
                  {paymentSubmitting ? 'جاري التسجيل...' : 'تسجيل الدفعة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign / Change Factory Modal */}
      {isFactoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-foreground">تعديل المصنع وموعد الاستلام</h3>
              <button
                onClick={() => setIsFactoryModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFactoryCommercial} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">المصنع المنفذ</label>
                <select
                  value={selectedFactoryId}
                  onChange={(e) => setSelectedFactoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">بدون مصنع</option>
                  {factories.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} {f.code ? `(${f.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">موعد استلام العينة من المصنع</label>
                <input
                  type="date"
                  value={selectedExpectedDeliveryAt}
                  onChange={(e) => setSelectedExpectedDeliveryAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFactoryModalOpen(false)}
                  disabled={loading}
                  className="px-3.5 py-1.5 rounded-lg border hover:bg-muted"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
