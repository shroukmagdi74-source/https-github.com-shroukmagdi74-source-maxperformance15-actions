import React from 'react';
import { Gift } from 'lucide-react';
import { Switch } from '../../../components/ui/switch';
import type { PaymentOffersFormState } from './types';

interface PaymentOffersDiscountCardProps {
  form: PaymentOffersFormState;
  update: <K extends keyof PaymentOffersFormState>(
    key: K,
    value: PaymentOffersFormState[K],
  ) => void;
}

export const PaymentOffersDiscountCard: React.FC<PaymentOffersDiscountCardProps> = ({
  form,
  update,
}) => {
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/20">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <span>خصم الدفع الإلكتروني</span>
            <Gift className="size-4 text-emerald-600 dark:text-emerald-400" />
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            لو العميل دفع بالبطاقة أو بالمحفظة الإلكترونية، يحصل على خصم على قيمة المنتجات. فعّل الخصم وحدد نسبته بالأسفل.
          </p>
        </div>
        <Switch
          checked={form.discountEnabled}
          onCheckedChange={(checked) => update('discountEnabled', checked)}
        />
      </div>

      {form.discountEnabled ? (
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              نسبة الخصم (%)
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={form.discountPercent || ''}
              onChange={(e) =>
                update(
                  'discountPercent',
                  Math.min(100, Math.max(0, Number(e.target.value))),
                )
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-primary font-mono tabular-nums"
              dir="ltr"
              placeholder="مثال: 10"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              يُحسب الخصم على إجمالي المنتجات (قبل الشحن). مثال: لو كتبت 10، العميل يحصل على خصم 10%.
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg bg-card px-3.5 py-3 border border-border/80">
            <div>
              <p className="text-sm font-medium text-foreground">
                إظهار الخصم للعميل
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                يظهر بجانب طرق الدفع الإلكترونية وفي ملخص الشيك أوت لتحفيز العميل على الدفع مقدماً.
              </p>
            </div>
            <Switch
              checked={form.showDiscountBadge}
              onCheckedChange={(checked) => update('showDiscountBadge', checked)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};
