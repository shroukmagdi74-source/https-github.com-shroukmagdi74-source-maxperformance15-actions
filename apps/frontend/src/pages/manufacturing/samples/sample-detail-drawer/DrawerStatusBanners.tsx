import React from 'react';
import {
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
  ExternalLink,
} from 'lucide-react';
import { SampleOrder } from '../../manufacturingApi';

export interface DrawerStatusBannersProps {
  sample: SampleOrder;
  onNavigateOrder: (orderId: string) => void;
  onOpenConvertModal: () => void;
}

export const DrawerStatusBanners: React.FC<DrawerStatusBannersProps> = ({
  sample,
  onNavigateOrder,
  onOpenConvertModal,
}) => {
  return (
    <div className="px-4 pt-3">
      {sample.status === 'CONVERTED' && (
        <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-purple-800 dark:text-purple-200 font-semibold">
            <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />
            <div>
              <p>تم تحويل العينة بنجاح لأمر تصنيع كامل</p>
              <p className="text-[11px] font-normal text-purple-700/80 dark:text-purple-300/80 tabular-nums">
                رقم أمر الإنتاج:{' '}
                {sample.convertedOrder?.orderNumber || sample.convertedOrderId}
              </p>
            </div>
          </div>
          {sample.convertedOrderId && (
            <button
              onClick={() => onNavigateOrder(sample.convertedOrderId!)}
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
            onClick={onOpenConvertModal}
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
            سبب الرفض:{' '}
            <span className="font-medium">
              {sample.resultNotes || 'غير محدد'}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};
