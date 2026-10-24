import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type {
  CustomerBlockAction,
  CustomerBlockActionOption,
  CustomerBlockSettingsShape,
} from './types';

interface CustomerBlockConfigSectionProps {
  settings: CustomerBlockSettingsShape;
  setSettings: React.Dispatch<React.SetStateAction<CustomerBlockSettingsShape>>;
  actionOptions: CustomerBlockActionOption[];
  updateBoolean: (field: keyof CustomerBlockSettingsShape) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveSettings: () => Promise<void>;
  isSaving: boolean;
}

export const CustomerBlockConfigSection: React.FC<CustomerBlockConfigSectionProps> = ({
  settings,
  setSettings,
  actionOptions,
  updateBoolean,
  handleSaveSettings,
  isSaving,
}) => {
  const { t } = useTranslation();

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="mb-5 flex items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            {t('customerBlocks.k_38', 'سياسات الحظر العامة')}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('customerBlocks.k_39', 'تحديد القنوات والنقاط التي يتم تطبيق الحظر عندها')}
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-foreground">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={updateBoolean('enabled')}
            className="size-4 rounded border-input text-red-600 focus:ring-red-500"
          />
          {t('customerBlocks.k_40', 'تفعيل نظام الحظر')}
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {[
          ['blockCheckout', t('customerBlocks.k_22', 'حظر إتمام الطلب من المتجر (Checkout)')],
          ['blockManualOrders', t('customerBlocks.k_23', 'حظر إنشاء طلب يدوي للعميل المحظور')],
          ['blockAffiliateManualOrders', t('customerBlocks.k_24', 'حظر إنشاء طلبات المسوقين بالعمولة')],
          ['blockAiOrderCreation', t('customerBlocks.k_25', 'حظر إنشاء الطلب عبر مساعد الذكاء الاصطناعي')],
          ['allowManagerOverride', t('customerBlocks.k_26', 'السماح للمدير بتجاوز الحظر يدويًا')],
        ].map(([key, label]) => (
          <label
            key={key}
            className="flex cursor-pointer items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-4 py-3 transition hover:bg-muted/40"
          >
            <span className="text-sm font-medium text-foreground">{label}</span>
            <input
              type="checkbox"
              checked={Boolean(settings[key as keyof CustomerBlockSettingsShape])}
              onChange={updateBoolean(key as keyof CustomerBlockSettingsShape)}
              className="size-4 rounded border-input text-red-600 focus:ring-red-500"
            />
          </label>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-foreground">
            {t('customerBlocks.k_41', 'الإجراء الافتراضي عند التطابق')}
          </span>
          <select
            value={settings.defaultAction}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                defaultAction: event.target.value as CustomerBlockAction,
              }))
            }
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {actionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div>
          <span className="mb-2 block text-sm font-medium text-foreground">
            {t('customerBlocks.k_42', 'معايير المطابقة التلقائية')}
          </span>
          <div className="grid grid-cols-2 gap-2">
            {[
              ['matchPhone', t('customerBlocks.k_27', 'رقم الهاتف')],
              ['matchEmail', t('customerBlocks.k_28', 'البريد الإلكتروني')],
              ['matchFacebook', 'Facebook'],
              ['matchWhatsapp', 'WhatsApp'],
            ].map(([key, label]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm text-foreground transition hover:bg-muted/40"
              >
                <input
                  type="checkbox"
                  checked={Boolean(settings[key as keyof CustomerBlockSettingsShape])}
                  onChange={updateBoolean(key as keyof CustomerBlockSettingsShape)}
                  className="size-4 rounded border-input text-red-600 focus:ring-red-500"
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-foreground">
            {t('customerBlocks.k_43', 'رسالة التنبيه للعميل في المتجر')}
          </span>
          <textarea
            value={settings.checkoutMessage || ''}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                checkoutMessage: event.target.value,
              }))
            }
            rows={3}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-foreground">
            {t('customerBlocks.k_44', 'رسالة التحذير الداخلية للموظفين')}
          </span>
          <textarea
            value={settings.internalWarningMessage || ''}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                internalWarningMessage: event.target.value,
              }))
            }
            rows={3}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>
      </div>

      <div className="mt-5 flex justify-end">
        <Button
          type="button"
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="bg-red-600 hover:bg-red-700 text-white gap-2 font-semibold"
        >
          {isSaving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Check className="size-4" />
          )}
          {t('customerBlocks.k_45', 'حفظ الإعدادات العامة')}
        </Button>
      </div>
    </section>
  );
};
