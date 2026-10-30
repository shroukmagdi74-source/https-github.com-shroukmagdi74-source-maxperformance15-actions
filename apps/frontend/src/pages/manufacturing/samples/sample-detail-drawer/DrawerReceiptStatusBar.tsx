import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { SampleOrder } from '../../manufacturingApi';

export interface DrawerReceiptStatusBarProps {
  sample: SampleOrder;
  loading: boolean;
  onToggleReceipt: (currentReceived?: boolean) => void;
}

export const DrawerReceiptStatusBar: React.FC<DrawerReceiptStatusBarProps> = ({
  sample,
  loading,
  onToggleReceipt,
}) => {
  return (
    <div className="px-4 py-2.5 bg-muted/40 border-b border-border/70 flex items-center justify-between text-xs">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground font-medium">الاستلام الفعلي:</span>
        {sample.sampleReceived ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="tabular-nums">
              تم الاستلام{' '}
              {sample.receivedAt
                ? `(${new Date(sample.receivedAt).toLocaleDateString('ar-EG')})`
                : ''}
            </span>
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
        onClick={() => onToggleReceipt(sample.sampleReceived)}
        disabled={loading}
        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50 ${
          sample.sampleReceived
            ? 'border border-border text-muted-foreground hover:bg-muted hover:text-foreground'
            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
        }`}
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>
          {sample.sampleReceived ? 'إلغاء الاستلام' : 'تأكيد استلام العينة'}
        </span>
      </button>
    </div>
  );
};
