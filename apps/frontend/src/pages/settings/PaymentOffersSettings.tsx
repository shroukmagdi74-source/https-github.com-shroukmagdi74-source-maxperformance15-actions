import React from 'react';
import { getDirection } from '../../i18n';
import { Button } from '@/components/ui/button';
import {
  PaymentOffersDiscountCard,
  PaymentOffersHeader,
  PaymentOffersMethodsSection,
  PaymentOffersPreviewCard,
  usePaymentOffersController,
  type PaymentOffersFormState,
} from './payment-offers';

export type { PaymentOffersFormState };

const PaymentOffersSettings: React.FC = () => {
  const {
    loading,
    saving,
    form,
    update,
    handleSave,
    sampleOrderSubtotal,
    sampleDiscountAmount,
    sampleOrderTotal,
    hasElectronicMethodActive,
  } = usePaymentOffersController();

  return (
    <div className="space-y-6" dir={getDirection()}>
      <PaymentOffersHeader />

      {loading ? (
        <div className="bg-card rounded-2xl border border-border p-6 shadow-xs">
          <p className="text-sm text-muted-foreground">
            جارٍ تحميل إعدادات عروض الدفع...
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border p-6 space-y-5 shadow-xs">
            <PaymentOffersDiscountCard form={form} update={update} />

            {form.discountEnabled && (
              <PaymentOffersMethodsSection
                form={form}
                update={update}
                hasElectronicMethodActive={hasElectronicMethodActive}
              />
            )}

            {form.discountEnabled && (
              <PaymentOffersPreviewCard
                form={form}
                sampleOrderSubtotal={sampleOrderSubtotal}
                sampleDiscountAmount={sampleDiscountAmount}
                sampleOrderTotal={sampleOrderTotal}
              />
            )}

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving || loading}
                className="font-semibold text-xs h-10 px-6 rounded-xl"
              >
                {saving ? 'جارٍ الحفظ والتفعيل...' : 'حفظ إعدادات عروض الدفع'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentOffersSettings;
