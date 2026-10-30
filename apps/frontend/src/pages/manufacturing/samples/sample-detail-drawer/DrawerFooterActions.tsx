import React from 'react';
import { CheckCircle2, ArrowRightLeft } from 'lucide-react';
import { SampleOrder } from '../manufacturingApi';

export interface DrawerFooterActionsProps {
  sample: SampleOrder;
  loading: boolean;
  onOpenApproveModal: () => void;
  onOpenRejectModal: () => void;
  onOpenConvertModal: () => void;
}

export const DrawerFooterActions: React.FC<DrawerFooterActionsProps> = ({
  sample,
  loading,
  onOpenApproveModal,
  onOpenRejectModal,
  onOpenConvertModal,
}) => {
  if (sample.status === 'CONVERTED') return null;

  return (
    <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between gap-2">
      {sample.status !== 'APPROVED' && (
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenApproveModal}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-sm active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>اعتماد العينة</span>
          </button>
          <button
            onClick={onOpenRejectModal}
            disabled={loading}
            className="px-3.5 py-2 rounded-lg border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <span>رفض</span>
          </button>
        </div>
      )}

      {sample.status === 'APPROVED' && (
        <button
          onClick={onOpenConvertModal}
          className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>تحويل العينة إلى أمر تصنيع وتشغيل كامل</span>
        </button>
      )}
    </div>
  );
};
