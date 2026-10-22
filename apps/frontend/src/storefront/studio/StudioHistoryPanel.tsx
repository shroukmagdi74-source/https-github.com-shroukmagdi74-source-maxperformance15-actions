import React, { useEffect, useState, useCallback } from "react";
import {
  ClockIcon,
  XMarkIcon,
  ArrowPathIcon,
  ArrowUturnLeftIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  DocumentDuplicateIcon,
  Squares2X2Icon,
  PaintBrushIcon,
} from "@heroicons/react/24/outline";
import {
  storefrontSettingsService,
  type StorefrontSettingsRevisionSummary,
  type StorefrontSettingsRevision,
  type StorefrontSettings,
} from "../../services/storefrontSettingsService";
import { toast } from "sonner";

interface StudioHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  companyId?: string;
  onRestoreSuccess?: (restoredSettings: StorefrontSettings) => void;
}

export const formatArabicDateTime = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat("ar-EG", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d);
  } catch {
    return dateStr;
  }
};

export const countSnapshotDetails = (snapshot?: Record<string, unknown> | null) => {
  if (!snapshot) return { pagesCount: 0, sectionsCount: 0, themeId: "modern-minimal" };
  const tokens = (snapshot.designTokens || snapshot) as Record<string, unknown>;
  const pages = (tokens.pages || {}) as Record<string, { sections?: unknown[] }>;
  const pagesCount = Object.keys(pages).length || 1;

  let sectionsCount = 0;
  for (const pageKey of Object.keys(pages)) {
    const secList = pages[pageKey]?.sections;
    if (Array.isArray(secList)) {
      sectionsCount += secList.length;
    }
  }

  const themeId = (snapshot.themeId || tokens.themeId || "modern-minimal") as string;
  return { pagesCount, sectionsCount, themeId };
};

export const StudioHistoryPanel: React.FC<StudioHistoryPanelProps> = ({
  isOpen,
  onClose,
  companyId,
  onRestoreSuccess,
}) => {
  const [revisions, setRevisions] = useState<StorefrontSettingsRevisionSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [previewRevision, setPreviewRevision] = useState<StorefrontSettingsRevision | null>(null);
  const [loadingPreviewId, setLoadingPreviewId] = useState<string | null>(null);
  const [confirmingRevision, setConfirmingRevision] = useState<StorefrontSettingsRevisionSummary | null>(null);
  const [restoring, setRestoring] = useState<boolean>(false);

  const fetchRevisions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await storefrontSettingsService.getRevisions(30, companyId);
      if (res.success && Array.isArray(res.data)) {
        setRevisions(res.data);
      } else {
        setRevisions([]);
      }
    } catch (err) {
      console.error("Failed to load revisions:", err);
      toast.error("تعذر تحميل سجل الإصدارات");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (isOpen) {
      void fetchRevisions();
      setPreviewRevision(null);
      setConfirmingRevision(null);
    }
  }, [isOpen, fetchRevisions]);

  const handlePreview = async (revSummary: StorefrontSettingsRevisionSummary) => {
    if (previewRevision?.id === revSummary.id) {
      setPreviewRevision(null);
      return;
    }

    setLoadingPreviewId(revSummary.id);
    try {
      const res = await storefrontSettingsService.getRevisionById(revSummary.id, companyId);
      if (res.success && res.data) {
        setPreviewRevision(res.data);
      } else {
        toast.error("تعذر جلب تفاصيل الإصدار للمعاينة");
      }
    } catch {
      toast.error("خطأ أثناء جلب تفاصيل الإصدار");
    } finally {
      setLoadingPreviewId(null);
    }
  };

  const handleConfirmRestore = async () => {
    if (!confirmingRevision) return;

    setRestoring(true);
    try {
      const res = await storefrontSettingsService.restoreRevision(confirmingRevision.id, companyId);
      if (res.success && res.data) {
        toast.success(`تم استرجاع الإصدار #${confirmingRevision.revisionNumber} بنجاح ✨`);
        if (onRestoreSuccess) {
          onRestoreSuccess(res.data);
        }
        setConfirmingRevision(null);
        setPreviewRevision(null);
        onClose();
      } else {
        toast.error(res.message || "فشل استرجاع الإصدار");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "حدث خطأ أثناء الاسترجاع";
      toast.error(message);
    } finally {
      setRestoring(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      data-testid="studio-history-panel"
      className="fixed inset-y-0 right-0 z-[100] flex w-full max-w-[420px] flex-col border-s border-[#2a2d33] bg-[#17181c] text-[#e8eaee] shadow-2xl transition-transform duration-200"
      dir="rtl"
    >
      {/* 1. Header */}
      <div className="flex items-center justify-between border-b border-[#2a2d33] px-4 py-3 bg-[#1d1f24]">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2b6cf6]/20 text-[#60a5fa]">
            <ClockIcon className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">سجل الإصدارات</h2>
            <p className="text-[11px] text-[#9ba0a8]">آخر 30 حفظ للمتجر مع إمكانية الاسترجاع</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={fetchRevisions}
            disabled={loading}
            className="rounded-lg p-1.5 text-[#9ba0a8] hover:bg-[#282b31] hover:text-white transition-colors"
            title="تحديث القائمة"
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#9ba0a8] hover:bg-[#282b31] hover:text-white transition-colors"
            title="إغلاق"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2. Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {loading && revisions.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-center text-[#9ba0a8]">
            <ArrowPathIcon className="h-6 w-6 animate-spin text-[#60a5fa]" />
            <span className="text-xs">جاري تحميل سجل الإصدارات…</span>
          </div>
        ) : revisions.length === 0 ? (
          <div
            data-testid="studio-history-empty"
            className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#2a2d33] bg-[#1d1f24]/50 p-6 text-center text-[#9ba0a8]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2a2d33]/50 text-[#7e848d]">
              <ClockIcon className="h-6 w-6" />
            </div>
            <p className="text-xs font-semibold text-[#c3c7cd]">
              مفيش إصدارات لسه — أول حفظ هينشئ إصدار
            </p>
          </div>
        ) : (
          revisions.map((rev) => {
            const author = rev.createdByName || rev.createdByEmail?.split("@")[0] || "المدير";
            const isPreviewOpen = previewRevision?.id === rev.id;

            return (
              <div
                key={rev.id}
                className={`rounded-xl border transition-all duration-150 ${
                  isPreviewOpen
                    ? "border-[#2b6cf6]/50 bg-[#1e232d]"
                    : "border-[#2a2d33] bg-[#1d1f24] hover:border-[#383c44]"
                } p-3`}
              >
                {/* Meta line formatted: #12 · 22 أكتوبر 14:32 · محمد · «تعديل المنيو» */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center rounded-md bg-[#2b6cf6]/20 px-1.5 py-0.5 text-[11px] font-black text-[#60a5fa] font-mono">
                        #{rev.revisionNumber}
                      </span>
                      <span className="text-[11px] text-[#9ba0a8]">
                        · {formatArabicDateTime(rev.createdAt)}
                      </span>
                      <span className="text-[11px] font-semibold text-[#e8eaee]">
                        · {author}
                      </span>
                      {rev.note && (
                        <span className="text-[11px] text-[#fcd34d] truncate max-w-[180px]">
                          · «{rev.note}»
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-2.5 flex items-center justify-end gap-1.5 border-t border-[#2a2d33]/60 pt-2">
                  <button
                    type="button"
                    data-testid={`preview-revision-${rev.id}`}
                    onClick={() => void handlePreview(rev)}
                    disabled={loadingPreviewId === rev.id}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-[#9ba0a8] hover:bg-[#282b31] hover:text-white transition-colors"
                  >
                    <EyeIcon className="h-3.5 w-3.5" />
                    <span>{isPreviewOpen ? "إخفاء المعاينة" : "معاينة"}</span>
                  </button>
                  <button
                    type="button"
                    data-testid={`restore-revision-${rev.id}`}
                    onClick={() => setConfirmingRevision(rev)}
                    className="flex items-center gap-1 rounded-md bg-[#2b6cf6]/15 hover:bg-[#2b6cf6] hover:text-white px-2.5 py-1 text-[11px] font-bold text-[#60a5fa] transition-colors"
                  >
                    <ArrowUturnLeftIcon className="h-3.5 w-3.5" />
                    <span>استرجاع</span>
                  </button>
                </div>

                {/* Preview summary drawer inside card */}
                {isPreviewOpen && previewRevision && (
                  <div className="mt-3 rounded-lg border border-[#2b6cf6]/30 bg-[#161a22] p-2.5 space-y-2 text-xs">
                    <div className="text-[11px] font-bold text-[#60a5fa] flex items-center gap-1">
                      <EyeIcon className="h-3.5 w-3.5" />
                      <span>ملخص الإصدار #{previewRevision.revisionNumber}</span>
                    </div>
                    {(() => {
                      const details = countSnapshotDetails(previewRevision.snapshot);
                      return (
                        <div className="grid grid-cols-3 gap-1.5 text-center">
                          <div className="rounded-md bg-[#1f242e] p-1.5 border border-[#2b6cf6]/20">
                            <span className="block text-[10px] text-[#9ba0a8]">عدد الصفحات</span>
                            <span className="font-bold text-white text-sm">{details.pagesCount}</span>
                          </div>
                          <div className="rounded-md bg-[#1f242e] p-1.5 border border-[#2b6cf6]/20">
                            <span className="block text-[10px] text-[#9ba0a8]">عدد الأقسام</span>
                            <span className="font-bold text-white text-sm">{details.sectionsCount}</span>
                          </div>
                          <div className="rounded-md bg-[#1f242e] p-1.5 border border-[#2b6cf6]/20">
                            <span className="block text-[10px] text-[#9ba0a8]">الستايل</span>
                            <span className="font-bold text-[#60a5fa] text-[11px] truncate block">
                              {details.themeId}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 3. Confirmation Dialog */}
      {confirmingRevision && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fadeIn">
          <div
            data-testid="restore-confirmation-modal"
            className="w-full max-w-sm rounded-2xl border border-[#2a2d33] bg-[#1d1f24] p-5 shadow-2xl text-center space-y-4"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
              <ExclamationTriangleIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">تأكيد الاسترجاع</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#c3c7cd]">
                هيرجع المتجر لحالة #{confirmingRevision.revisionNumber} — التغييرات الحالية هتتحفظ كإصدار جديد
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmingRevision(null)}
                disabled={restoring}
                className="flex-1 rounded-lg border border-[#32353b] bg-[#202226] py-2 text-xs font-semibold text-[#e8eaee] hover:bg-[#282b30] transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                data-testid="confirm-restore-btn"
                onClick={handleConfirmRestore}
                disabled={restoring}
                className="flex-1 rounded-lg bg-[#2b6cf6] py-2 text-xs font-bold text-white shadow-md hover:bg-[#1d5ce6] transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
              >
                {restoring ? (
                  <>
                    <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
                    <span>جاري الاسترجاع…</span>
                  </>
                ) : (
                  <span>تأكيد الاسترجاع</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
