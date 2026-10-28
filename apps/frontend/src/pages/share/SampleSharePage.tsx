import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Package,
  Calendar,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Upload,
  Check,
  Building2,
  Sparkles,
  ImageIcon,
  Send,
  Eye,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import {
  publicSampleShareApi,
  PublicSampleShareData,
} from '../manufacturing/manufacturingApi';

export const SampleSharePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<PublicSampleShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Factory acknowledgment form state
  const [ackName, setAckName] = useState('');
  const [ackFile, setAckFile] = useState<File | null>(null);
  const [ackPreview, setAckPreview] = useState<string | null>(null);
  const [submittingAck, setSubmittingAck] = useState(false);
  const [ackSuccess, setAckSuccess] = useState<boolean>(false);
  const [ackError, setAckError] = useState<string | null>(null);

  // Image preview modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    // Set no-referrer meta dynamically to prevent token leakage
    let meta = document.querySelector('meta[name="referrer"]') as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'referrer';
      meta.content = 'no-referrer';
      document.head.appendChild(meta);
    } else {
      meta.content = 'no-referrer';
    }

    if (token) {
      fetchData(token);
    } else {
      setError('الرابط غير صالح');
      setLoading(false);
    }
  }, [token]);

  const fetchData = async (t: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await publicSampleShareApi.get(t);
      setData(res);
      if (res?.ack?.at) {
        setAckSuccess(true);
      }
      document.title = res?.sampleNumber ? `عينة ${res.sampleNumber} | ${res.company?.name || 'MaxP'}` : 'متابعة العينة';
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'الرابط غير صالح');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAckFile(file);
      setAckPreview(URL.createObjectURL(file));
      setAckError(null);
    }
  };

  const handleFactoryAckSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      setSubmittingAck(true);
      setAckError(null);

      const formData = new FormData();
      if (ackName.trim()) {
        formData.append('name', ackName.trim());
      }
      if (ackFile) {
        formData.append('file', ackFile);
      }

      await publicSampleShareApi.factoryAck(token, formData);
      setAckSuccess(true);
      // Refresh data
      await fetchData(token);
    } catch (err: any) {
      setAckError(err?.response?.data?.error || err.message || 'حدث خطأ أثناء تأكيد الاستلام');
    } finally {
      setSubmittingAck(false);
    }
  };

  const getStatusBadge = (status: string, label: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {label || 'معتمدة'}
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Clock className="w-3.5 h-3.5" />
            {label || 'قيد التنفيذ'}
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" />
            {label || 'مرفوضة'}
          </span>
        );
      case 'CONVERTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            {label || 'تم التحويل لأمر تصنيع'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Layers className="w-3.5 h-3.5" />
            {label || 'مسودة'}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">جاري تحميل بيانات العينة...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div dir="rtl" className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {error || 'الرابط غير صالح'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
            عذراً، هذا الرابط غير صالح، أو تم إلغاؤه، أو انتهت فترة صلاحيته. يرجى التواصل مع الجهة المسؤولة للحصول على رابط جديد.
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER CUSTOMER VIEW
  // --------------------------------------------------------------------------
  if (data.kind === 'CUSTOMER') {
    return (
      <div dir="rtl" className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Main Top Header */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {data.company?.logo ? (
                <img
                  src={data.company.logo}
                  alt={data.company.name}
                  className="w-14 h-14 rounded-xl object-contain border border-slate-200 dark:border-slate-800 bg-white p-1"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                  <Building2 className="w-7 h-7" />
                </div>
              )}
              <div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  {data.company?.name || 'MaxP'}
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                  <span>عينة رقم:</span>
                  <span className="font-mono text-primary">{data.sampleNumber}</span>
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-center">
              {getStatusBadge(data.status, data.statusLabel)}
            </div>
          </div>

          {/* Sample Key Specs & Details */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              <span>مواصفات وتفاصيل العينة</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 block mb-1">اسم المنتج</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {data.productName}
                </span>
              </div>

              {data.brandName && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-500 block mb-1">البراند / العلامة</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {data.brandName}
                  </span>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 block mb-1">المقاس</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {data.size || '—'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 block mb-1">اللون</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {data.color || '—'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 block mb-1">الكمية المطلوبة</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {data.plannedQuantity} قطعة
                </span>
              </div>

              {data.dueDate && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-500 block mb-1">الموعد المستهدف</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {new Date(data.dueDate).toLocaleDateString('ar-EG')}
                  </span>
                </div>
              )}

              {data.createdAt && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-500 block mb-1">تاريخ الإنشاء</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {new Date(data.createdAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>
              )}
            </div>

            {/* Design Notes */}
            {data.designNotes && (
              <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                <span className="text-xs font-semibold text-primary block mb-1">
                  ملاحظات التصميم والمواصفات:
                </span>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {data.designNotes}
                </p>
              </div>
            )}

            {/* Rejection Result Notes (if rejected) */}
            {data.status === 'REJECTED' && data.resultNotes && (
              <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300">
                <span className="text-xs font-bold block mb-1 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-500" />
                  سبب رفض العينة:
                </span>
                <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                  {data.resultNotes}
                </p>
              </div>
            )}
          </div>

          {/* Optional Money Block (Shown ONLY if money != null) */}
          {data.money && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <span>البيانات المالية للعينة</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {data.money.totalAmount != null && (
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                    <span className="text-xs text-slate-500 block mb-1">المبلغ الإجمالي للعينة</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {data.money.totalAmount.toLocaleString('ar-EG')} {data.money.currency || 'ج.م'}
                    </span>
                  </div>
                )}

                {data.money.paidAmount != null && (
                  <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/15">
                    <span className="text-xs text-slate-500 block mb-1">المدفوع / العربون</span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {data.money.paidAmount.toLocaleString('ar-EG')} {data.money.currency || 'ج.م'}
                    </span>
                  </div>
                )}

                {data.money.remaining != null && (
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
                    <span className="text-xs text-slate-500 block mb-1">المبلغ المتبقي</span>
                    <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                      {data.money.remaining.toLocaleString('ar-EG')} {data.money.currency || 'ج.م'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Attachments / Images Gallery */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              <span>صور ومرفقات العينة</span>
            </h2>

            {data.attachments && data.attachments.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {data.attachments.map((att) => {
                  const isImage = att.kind === 'IMAGE' || /\.(jpe?g|png|webp|gif)$/i.test(att.fileName || att.url);
                  return (
                    <div
                      key={att.id}
                      className="group relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-800/40 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => isImage && setPreviewImage(att.url)}
                    >
                      {isImage ? (
                        <div className="aspect-square w-full overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                          <img
                            src={att.url}
                            alt={att.fileName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="aspect-square w-full flex flex-col items-center justify-center p-3 text-slate-500">
                          <FileText className="w-10 h-10 mb-2 text-primary" />
                          <span className="text-xs text-center truncate max-w-full">{att.fileName}</span>
                        </div>
                      )}

                      <div className="p-2.5 text-xs text-slate-600 dark:text-slate-300 truncate border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="truncate">{att.fileName}</span>
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-slate-400 hover:text-primary transition-colors ml-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500">لا توجد صور مرفقة للعينة حالياً</p>
              </div>
            )}
          </div>

          {/* Timeline & Stages */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span>خط الزمن ومراحل التنفيذ</span>
            </h2>

            {data.timeline && data.timeline.length > 0 ? (
              <div className="relative pr-6 border-r-2 border-primary/20 space-y-6 my-2">
                {data.timeline.map((item, idx) => {
                  const isCompleted = item.status === 'COMPLETED';
                  const isRejected = item.status === 'REJECTED';
                  const isInProgress = item.status === 'IN_PROGRESS';

                  return (
                    <div key={idx} className="relative group">
                      {/* Indicator circle on vertical line */}
                      <div
                        className={`absolute -right-[31px] top-1 w-4 h-4 rounded-full border-2 bg-white dark:bg-slate-900 ${
                          isCompleted
                            ? 'border-emerald-500 bg-emerald-500'
                            : isRejected
                            ? 'border-rose-500 bg-rose-500'
                            : isInProgress
                            ? 'border-blue-500 bg-blue-500 animate-pulse'
                            : 'border-slate-300 dark:border-slate-700'
                        }`}
                      />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                          {item.title}
                        </h4>
                        {item.date && (
                          <span className="text-xs text-slate-400 font-mono">
                            {new Date(item.date).toLocaleString('ar-EG')}
                          </span>
                        )}
                      </div>

                      {item.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500">لا توجد تحديثات في خط الزمن حتى الآن</p>
            )}
          </div>
        </div>

        {/* Modal Image Lightbox */}
        {previewImage && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setPreviewImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh]">
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER FACTORY VIEW (Strictly Whitelabel, zero internal costs/margins/customer info)
  // --------------------------------------------------------------------------
  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Whitelabel Header */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {data.company?.name || 'طلب عينة'}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
              <span>طلب تشغيل عينة:</span>
              <span className="font-mono text-primary">{data.sampleNumber}</span>
            </h1>
          </div>
          <div>{getStatusBadge(data.status, data.statusLabel)}</div>
        </div>

        {/* Basic Factory Specs Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <span>بيانات العينة المطلوب تصنيعها</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 block mb-1">اسم المنتج</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {data.productName}
              </span>
            </div>

            {data.brandName && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 block mb-1">العلامة / الموديل</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {data.brandName}
                </span>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 block mb-1">المقاس</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {data.size || '—'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 block mb-1">اللون</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {data.color || '—'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 block mb-1">الكمية</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {data.plannedQuantity} قطعة
              </span>
            </div>

            {data.expectedDeliveryAt && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 block mb-1">موعد التسليم المتوقع</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {new Date(data.expectedDeliveryAt).toLocaleDateString('ar-EG')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Factory Images Gallery */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            <span>صور وتصميم العينة</span>
          </h2>

          {data.attachments && data.attachments.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {data.attachments.map((att) => (
                <div
                  key={att.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-800/40 cursor-pointer group"
                  onClick={() => setPreviewImage(att.url)}
                >
                  <div className="aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <img
                      src={att.url}
                      alt={att.fileName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-500">لا توجد صور مرفقة للعينة</p>
            </div>
          )}
        </div>

        {/* SINGLE FORM: Factory Acknowledgment & Sample Image Upload */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            <span>تأكيد الاستلام ورفع صورة العينة</span>
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            يرجى تأكيد استلام أمر تشغيل العينة، ويمكنك إرفاق صورة العينة الجاهزة أو قيد التشغيل.
          </p>

          {ackSuccess || data.ack?.at ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-emerald-700 dark:text-emerald-300">
                تم تسجيل استلام العينة بنجاح
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                تم تسجيل استلام المصنع بتاريخ{' '}
                <span className="font-semibold">
                  {data.ack?.at ? new Date(data.ack.at).toLocaleString('ar-EG') : new Date().toLocaleString('ar-EG')}
                </span>
                {data.ack?.by && <span> بواسطة: {data.ack.by}</span>}
              </p>
            </div>
          ) : (
            <form onSubmit={handleFactoryAckSubmit} className="space-y-4">
              {ackError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{ackError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  اسم المستلم / المشرف بالمصنع (اختياري)
                </label>
                <input
                  type="text"
                  value={ackName}
                  onChange={(e) => setAckName(e.target.value)}
                  placeholder="مثال: م. سامي"
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  رفع صورة العينة (اختياري)
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary/50 transition-colors bg-slate-50/50 dark:bg-slate-800/30">
                    <Upload className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs text-slate-500">اضغط لاختيار صورة العينة (JPG, PNG, WebP)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {ackPreview && (
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative shrink-0">
                      <img src={ackPreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingAck}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {submittingAck ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>جاري تسجيل الاستلام...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>تأكيد استلام العينة</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Modal Image Lightbox */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SampleSharePage;
