import React, { useState } from "react";
import {
  ExclamationTriangleIcon,
  XMarkIcon,
  ArrowPathIcon,
  DocumentMagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { computeTokensDiff } from "./utils/studioPermissions";

export interface StudioConflictPanelProps {
  isOpen: boolean;
  baseRevision: number;
  serverRevision?: number;
  localTokens?: Record<string, unknown> | null;
  serverTokens?: Record<string, unknown> | null;
  onClose: () => void;
  onReload?: () => void | Promise<void>;
}

export const StudioConflictPanel: React.FC<StudioConflictPanelProps> = ({
  isOpen,
  baseRevision,
  serverRevision,
  localTokens,
  serverTokens,
  onClose,
  onReload,
}) => {
  const [showDiff, setShowDiff] = useState(false);
  const [reloading, setReloading] = useState(false);

  if (!isOpen) return null;

  const diffSummary = computeTokensDiff(localTokens, serverTokens);
  const resolvedServerRev = serverRevision ?? baseRevision + 1;

  const handleReload = async () => {
    setReloading(true);
    try {
      if (onReload) {
        await onReload();
      }
      onClose();
    } finally {
      setReloading(false);
    }
  };

  return (
    <div
      data-testid="studio-conflict-panel"
      role="alertdialog"
      aria-labelledby="studio-conflict-title"
      className="fixed inset-x-0 top-[52px] z-50 mx-auto max-w-2xl px-4 py-3 sm:py-4 transition-all animate-in fade-in slide-in-from-top-4"
    >
      <div className="rounded-2xl border border-red-500/40 bg-[#1f1618] p-4 text-[#e8eaee] shadow-2xl backdrop-blur-md">
        {/* Top bar with icon & close */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
              <ExclamationTriangleIcon className="h-5 w-5" />
            </div>
            <div>
              <h3
                id="studio-conflict-title"
                className="text-sm font-bold text-red-200"
              >
                حد تاني عدّل — تعارض في التعديلات المتزامنة
              </h3>
              <p className="mt-1 text-xs text-red-300/80 leading-relaxed">
                قام محرر آخر بحفظ تعديلات على هذا المتجر قبلك (إصدار سيرفر #{resolvedServerRev}، بينما نسختك مبنية على #{baseRevision}).
                تم إيقاف الحفظ تلقائيًا بدون مسح أي من تعديلاتك أو تعديلات المحرر الآخر.
              </p>
            </div>
          </div>

          <button
            type="button"
            data-testid="studio-conflict-close-btn"
            onClick={onClose}
            className="rounded-lg p-1 text-[#9ba0a8] hover:bg-[#2c2225] hover:text-white transition-colors"
            title="إغلاق التنبيه والاحتفاظ بالمسودة المحلية"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {/* 1. Show Diff Button */}
          <button
            type="button"
            data-testid="studio-conflict-diff-btn"
            onClick={() => setShowDiff((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-lg border border-[#3f3034] bg-[#291e22] px-3 py-1.5 text-xs font-semibold text-[#f1c3cb] hover:bg-[#342429] hover:text-white transition-colors"
          >
            <DocumentMagnifyingGlassIcon className="h-4 w-4 text-red-400" />
            <span>اعرض الفرق</span>
            {showDiff ? (
              <ChevronUpIcon className="h-3 w-3" />
            ) : (
              <ChevronDownIcon className="h-3 w-3" />
            )}
          </button>

          {/* 2. Reload Version Button */}
          <button
            type="button"
            data-testid="studio-conflict-reload-btn"
            onClick={handleReload}
            disabled={reloading}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md hover:bg-red-500 active:scale-95 transition-all disabled:opacity-50"
          >
            {reloading ? (
              <>
                <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
                <span>جاري التحديث…</span>
              </>
            ) : (
              <>
                <ArrowPathIcon className="h-3.5 w-3.5" />
                <span>حدّث نسختك</span>
              </>
            )}
          </button>

          {/* 3. Dismiss */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2.5 py-1.5 text-xs text-[#9ba0a8] hover:text-white transition-colors"
          >
            إلغاء والاحتفاظ بمسودتي
          </button>
        </div>

        {/* Expandable Diff View */}
        {showDiff && (
          <div
            data-testid="studio-conflict-diff-view"
            className="mt-3 rounded-xl border border-[#3f3034] bg-[#171012] p-3 text-xs text-[#d6c7cb]"
          >
            <div className="font-semibold text-red-300 mb-1.5">
              مقارنة التغييرات بين النسختين:
            </div>
            {diffSummary.details.length === 0 ? (
              <div className="text-muted-foreground text-[11px]">
                لا توجد اختلافات جذرية في البنية — قد يكون التعارض ناتجًا عن حفظ متزامن لنفس القيم.
              </div>
            ) : (
              <ul className="space-y-1 list-disc list-inside text-[11px]">
                {diffSummary.details.map((item, idx) => (
                  <li key={idx} className="text-[#f1c3cb]">
                    {item}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-2 text-[10.5px] text-[#9ba0a8]">
              نصيحة: يمكنك نسخ نصوصك أو أقسامك كقالب قبل الضغط على «حدّث نسختك» لتفادي إعادة الكتابة.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
