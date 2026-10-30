import React from 'react';
import {
  AlertTriangle,
  Building2,
  Calendar,
  CreditCard,
  Plus,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { SampleOrder } from '../manufacturingApi';

export interface SampleFinanceTabProps {
  sample: SampleOrder;
  loading: boolean;
  onOpenFactoryModal: () => void;
  onOpenPaymentModal: () => void;
  onDeletePayment: (paymentId: string) => void;
}

export const SampleFinanceTab: React.FC<SampleFinanceTabProps> = ({
  sample,
  loading,
  onOpenFactoryModal,
  onOpenPaymentModal,
  onDeletePayment,
}) => {
  const total =
    sample.totalAmount !== null && sample.totalAmount !== undefined
      ? Number(sample.totalAmount)
      : Number(sample.fee || 0);
  const deposit = Number(sample.depositAmount || 0);
  const paid = Number(sample.paidAmount || 0);
  const remaining =
    sample.remaining !== undefined
      ? Number(sample.remaining)
      : Math.round((total - paid) * 100) / 100;
  const progressPct =
    total > 0
      ? Math.min(100, Math.round((paid / total) * 100))
      : paid > 0
      ? 100
      : 0;

  return (
    <div className="space-y-4 text-xs">
      {/* Overdue Alert Banner if overdue */}
      {sample.isOverdue && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-xs">
              تنبيه: فات موعد الاستلام المتوقع من المصنع!
            </p>
            <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5 tabular-nums">
              موعد الاستلام المحدد كان{' '}
              {sample.expectedDeliveryAt
                ? new Date(sample.expectedDeliveryAt).toLocaleDateString(
                    'ar-EG'
                  )
                : '—'}{' '}
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
              onClick={onOpenFactoryModal}
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
              <span className="font-bold text-foreground">
                {sample.partnerFactory.name}
              </span>
            </div>
            {sample.partnerFactory.code && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">كود المصنع:</span>
                <span className="font-mono text-xs tabular-nums">
                  {sample.partnerFactory.code}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">مسؤول الاتصال:</span>
              <span className="font-medium">
                {sample.partnerFactory.contactPerson || '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">رقم الهاتف:</span>
              <span className="font-medium tabular-nums">
                {sample.partnerFactory.phone || '—'}
              </span>
            </div>
            {sample.partnerFactory.email && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">البريد الإلكتروني:</span>
                <span className="font-medium">
                  {sample.partnerFactory.email}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground border border-dashed rounded-lg">
            <p className="mb-2">لم يتم تحديد مصنع منفذ لهذه العينة بعد</p>
            {sample.status !== 'CONVERTED' && (
              <button
                onClick={onOpenFactoryModal}
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
          <span className="text-muted-foreground">
            موعد تسليم العميل (DueDate):
          </span>
          <span className="font-semibold text-foreground tabular-nums">
            {sample.dueDate
              ? new Date(sample.dueDate).toLocaleDateString('ar-EG')
              : 'غير محدد'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">
            موعد الاستلام المتوقع من المصنع:
          </span>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground tabular-nums">
              {sample.expectedDeliveryAt
                ? new Date(sample.expectedDeliveryAt).toLocaleDateString('ar-EG')
                : 'غير محدد'}
            </span>
            {sample.sampleReceived ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span className="tabular-nums">
                  مستلمة{' '}
                  {sample.receivedAt
                    ? `(${new Date(sample.receivedAt).toLocaleDateString(
                        'ar-EG'
                      )})`
                    : ''}
                </span>
              </span>
            ) : (
              sample.isOverdue && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 tabular-nums">
                  متأخر {sample.overdueDays} يوم
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* Card 3: Financial Summary & Payments */}
      <div className="p-3.5 rounded-xl border border-border/70 bg-card space-y-3">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <CreditCard className="w-4 h-4 text-primary" />
            <span>الحساب المالي والدفع</span>
          </div>
          <button
            onClick={onOpenPaymentModal}
            className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 flex items-center gap-1 shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>تسجيل دفعة</span>
          </button>
        </div>

        {/* 4 Financial Metric Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60">
            <div className="text-[10px] text-muted-foreground mb-0.5">
              المبلغ الإجمالي
            </div>
            <div className="font-bold text-sm text-foreground tabular-nums">
              {total.toLocaleString()}{' '}
              <span className="text-[10px] font-normal">ج.م</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/50">
            <div className="text-[10px] text-blue-700 dark:text-blue-300 mb-0.5">
              العربون المطلوب
            </div>
            <div className="font-bold text-sm text-blue-800 dark:text-blue-200 tabular-nums">
              {deposit.toLocaleString()}{' '}
              <span className="text-[10px] font-normal">ج.م</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/50">
            <div className="text-[10px] text-emerald-700 dark:text-emerald-300 mb-0.5">
              المدفوع الفعلي
            </div>
            <div className="font-bold text-sm text-emerald-800 dark:text-emerald-200 tabular-nums">
              {paid.toLocaleString()}{' '}
              <span className="text-[10px] font-normal">ج.م</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/50">
            <div className="text-[10px] text-amber-700 dark:text-amber-300 mb-0.5">
              المتبقي
            </div>
            <div className="font-bold text-sm text-amber-800 dark:text-amber-200 tabular-nums">
              {remaining.toLocaleString()}{' '}
              <span className="text-[10px] font-normal">ج.م</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-muted-foreground tabular-nums">
            <span>نسبة سداد العينة: {progressPct}%</span>
            <span>
              {paid.toLocaleString()} من {total.toLocaleString()} ج.م
            </span>
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
            <span className="font-bold text-foreground">
              سجل الدفعات (
              <span className="tabular-nums">
                {sample.payments?.length || 0}
              </span>
              )
            </span>
          </div>

          {!sample.payments || sample.payments.length === 0 ? (
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
                        {p.paidAt
                          ? new Date(p.paidAt).toLocaleDateString('ar-EG')
                          : '—'}
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
                          onClick={() => onDeletePayment(p.id)}
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
    </div>
  );
};
