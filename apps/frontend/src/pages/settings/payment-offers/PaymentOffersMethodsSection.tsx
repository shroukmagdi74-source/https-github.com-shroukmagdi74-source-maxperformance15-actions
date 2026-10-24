import React from 'react';
import { AlertTriangle, CreditCard, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Switch } from '../../../components/ui/switch';
import type { PaymentOffersFormState } from './types';

interface PaymentOffersMethodsSectionProps {
  form: PaymentOffersFormState;
  update: <K extends keyof PaymentOffersFormState>(
    key: K,
    value: PaymentOffersFormState[K],
  ) => void;
  hasElectronicMethodActive: boolean;
}

export const PaymentOffersMethodsSection: React.FC<PaymentOffersMethodsSectionProps> = ({
  form,
  update,
  hasElectronicMethodActive,
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-5 pt-2">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h3 className="text-base font-bold text-foreground">
            طرق الدفع الإلكترونية لتطبيق الخصم عليها
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            حدد الطرق الإلكترونية التي ستظهر لعملائك ليتمكنوا من الاستفادة من هذا العرض.
          </p>
        </div>
      </div>

      {!hasElectronicMethodActive && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-200">
          <AlertTriangle className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="leading-relaxed">
            <strong>تنبيه:</strong> حتى يظهر الخصم لعملائك في المتجر، يجب إدخال رقم المحفظة بالأسفل أو تفعيل البطاقة البنكية.
          </div>
        </div>
      )}

      {/* Wallet Details */}
      <div className="rounded-xl border border-border p-4 space-y-4 bg-muted/20">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Smartphone className="size-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">
                الدفع بالمحفظة (فودافون كاش / إنستاباي / المحافظ الذكية)
              </h4>
              <p className="text-xs text-muted-foreground">
                العميل يحول على رقم المحفظة ويرفع صورة الإيصال لإثبات الدفع.
              </p>
            </div>
          </div>
          <Switch
            checked={form.walletEnabled}
            onCheckedChange={(checked) => update('walletEnabled', checked)}
          />
        </div>

        {form.walletEnabled ? (
          <div className="space-y-3.5 pt-2 border-t border-border/80">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  رقم المحفظة أو عنوان إنستاباي <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={form.walletNumber}
                  onChange={(e) => update('walletNumber', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-primary font-mono tabular-nums"
                  dir="ltr"
                  placeholder="01xxxxxxxxx أو username@instapay"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  اسم المستلم
                </label>
                <input
                  type="text"
                  value={form.recipientName}
                  onChange={(e) => update('recipientName', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="مثال: متجر سوان"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                تعليمات التحويل للعميل (اختياري)
              </label>
              <input
                type="text"
                value={form.instructions}
                onChange={(e) => update('instructions', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="مثال: يرجى كتابة اسمك في بيان التحويل ثم رفع صورة الإيصال"
              />
            </div>
          </div>
        ) : null}
      </div>

      {/* Card Payment Details */}
      <div className="rounded-xl border border-border p-4 space-y-3 bg-muted/20">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              <CreditCard className="size-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">
                الدفع بالبطاقة البنكية (فيزا / ماستركارد)
              </h4>
              <p className="text-xs text-muted-foreground">
                {form.hasGatewayConfig
                  ? 'بوابة الدفع (Kashier) مهيأة في متجرك.'
                  : 'يتطلب ربط بوابة الدفع Kashier من إعدادات المتجر.'}
              </p>
            </div>
          </div>
          <Switch
            checked={form.cardEnabled}
            onCheckedChange={(checked) => update('cardEnabled', checked)}
          />
        </div>

        {!form.hasGatewayConfig && form.cardEnabled ? (
          <div className="flex items-center justify-between gap-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/50">
            <span>
              لم تُدخل مفاتيح بوابة Kashier بعد. يمكنك إعدادها من صفحة إعدادات المتجر.
            </span>
            <button
              type="button"
              onClick={() => navigate('/settings/store')}
              className="font-bold underline shrink-0 hover:text-amber-900"
            >
              إعداد البوابة
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
