import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { storefrontSettingsService } from '../../../services/storefrontSettingsService';
import type { PaymentOffersFormState, WalletPaymentSettingsShape } from './types';

export const parseWalletSettings = (raw: unknown): WalletPaymentSettingsShape => {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as WalletPaymentSettingsShape;
    } catch {
      return {};
    }
  }
  return raw as WalletPaymentSettingsShape;
};

export const parseEnabledMethods = (raw: unknown): string[] => {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed.map(String) : ['cod'];
  } catch {
    return ['cod'];
  }
};

export function usePaymentOffersController() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PaymentOffersFormState>({
    discountEnabled: false,
    discountPercent: 0,
    showDiscountBadge: true,
    walletEnabled: true,
    walletNumber: '',
    recipientName: '',
    instructions: '',
    cardEnabled: false,
    hasGatewayConfig: false,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await storefrontSettingsService.getSettings();
        const parsed = parseWalletSettings(
          (data as { walletPaymentSettings?: unknown })?.walletPaymentSettings,
        );
        const methods = parseEnabledMethods(
          (data as { enabledPaymentMethods?: unknown })?.enabledPaymentMethods,
        );
        const hasGateway = Boolean(
          (data as { paymentGatewayConfig?: unknown })?.paymentGatewayConfig,
        );

        if (!active) return;
        setForm({
          discountEnabled: parsed?.discountEnabled === true,
          discountPercent: Number(parsed?.discountPercent || 0),
          showDiscountBadge: parsed?.showDiscountBadge !== false,
          walletEnabled: parsed?.enabled !== false,
          walletNumber: parsed?.walletNumber || '',
          recipientName: parsed?.recipientName || '',
          instructions: parsed?.instructions || '',
          cardEnabled: methods.includes('card'),
          hasGatewayConfig: hasGateway,
        });
      } catch {
        toast.error('تعذر تحميل إعدادات عروض الدفع');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const update = <K extends keyof PaymentOffersFormState>(
    key: K,
    value: PaymentOffersFormState[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (form.discountEnabled && form.discountPercent <= 0) {
      toast.error('يرجى إدخال نسبة خصم أكبر من 0%');
      return;
    }

    const willWalletBeActive = form.walletEnabled && Boolean(form.walletNumber.trim());

    if (form.discountEnabled && !willWalletBeActive && !form.cardEnabled) {
      toast.error(
        'لتطبيق الخصم في المتجر، يرجى كتابة رقم المحفظة أو تفعيل البطاقة البنكية',
      );
      return;
    }

    setSaving(true);
    try {
      const { data } = await storefrontSettingsService.getSettings();
      const existing = parseWalletSettings(
        (data as { walletPaymentSettings?: unknown })?.walletPaymentSettings,
      );
      const currentMethods = parseEnabledMethods(
        (data as { enabledPaymentMethods?: unknown })?.enabledPaymentMethods,
      );

      let nextMethods = [...currentMethods];

      if (willWalletBeActive && !nextMethods.includes('wallet')) {
        nextMethods.push('wallet');
      } else if (!willWalletBeActive && nextMethods.includes('wallet')) {
        nextMethods = nextMethods.filter((m) => m !== 'wallet');
      }

      if (form.cardEnabled && !nextMethods.includes('card')) {
        nextMethods.push('card');
      } else if (!form.cardEnabled && nextMethods.includes('card')) {
        nextMethods = nextMethods.filter((m) => m !== 'card');
      }

      if (!nextMethods.includes('cod')) {
        nextMethods.unshift('cod');
      }

      const result = await storefrontSettingsService.updateSettings({
        walletPaymentSettings: {
          ...existing,
          enabled: willWalletBeActive,
          walletNumber: form.walletNumber.trim(),
          recipientName: form.recipientName.trim(),
          instructions: form.instructions.trim(),
          discountEnabled: form.discountEnabled,
          discountPercent: form.discountPercent,
          showDiscountBadge: form.showDiscountBadge,
        },
        enabledPaymentMethods: JSON.stringify(nextMethods),
      } as Parameters<typeof storefrontSettingsService.updateSettings>[0]);

      if (result?.data) {
        toast.success('تم حفظ إعدادات عروض الدفع وتفعيلها في المتجر بنجاح');
      }
    } catch (error) {
      toast.error(
        'حدث خطأ أثناء الحفظ: ' +
          ((error as { message?: string })?.message || 'خطأ غير معروف'),
      );
    } finally {
      setSaving(false);
    }
  };

  const sampleOrderSubtotal = 500;
  const sampleDiscountAmount = (sampleOrderSubtotal * (form.discountPercent || 0)) / 100;
  const sampleOrderTotal = sampleOrderSubtotal - sampleDiscountAmount;
  const hasElectronicMethodActive =
    (form.walletEnabled && Boolean(form.walletNumber.trim())) || form.cardEnabled;

  return {
    loading,
    saving,
    form,
    update,
    handleSave,
    sampleOrderSubtotal,
    sampleDiscountAmount,
    sampleOrderTotal,
    hasElectronicMethodActive,
  };
}
