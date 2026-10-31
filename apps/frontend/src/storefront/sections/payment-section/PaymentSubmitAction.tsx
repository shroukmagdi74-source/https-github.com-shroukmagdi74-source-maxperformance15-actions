import React from 'react';
import Button from '../../components/Button';
import { formatStorefrontCurrency } from '../../utils/currency';

interface PaymentSubmitActionProps {
  validationErrors: string[];
  validationBoxClassName: string;
  handlePlaceOrder: () => Promise<void>;
  isSubmitting: boolean;
  subtotal: number;
  confirmButtonClassName: string;
  paymentMethod: string;
  processingText: string;
  confirmOrderText: string;
  payButtonPrefix: string;
  total: number;
  currency: string;
  securityText: string;
}

export const PaymentSubmitAction: React.FC<PaymentSubmitActionProps> = ({
  validationErrors,
  validationBoxClassName,
  handlePlaceOrder,
  isSubmitting,
  subtotal,
  confirmButtonClassName,
  paymentMethod,
  processingText,
  confirmOrderText,
  payButtonPrefix,
  total,
  currency,
  securityText,
}) => {
  return (
    <>
      {validationErrors.length > 0 && (
        <div className={validationBoxClassName}>
          {validationErrors.map((error, index) => (
            <p
              key={index}
              className="flex items-start gap-2 text-sm font-medium text-red-700 dark:text-red-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-0.5 shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
              {error}
            </p>
          ))}
        </div>
      )}

      <Button
        fullWidth
        size="lg"
        onClick={handlePlaceOrder}
        disabled={isSubmitting || subtotal === 0}
        className={confirmButtonClassName}
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            {paymentMethod === 'card'
              ? 'جارٍ تحويلك لبوابة الدفع الآمنة...'
              : processingText}
          </div>
        ) : paymentMethod === 'cod' ? (
          confirmOrderText
        ) : (
          `${payButtonPrefix} ${formatStorefrontCurrency(total, currency)}`
        )}
      </Button>

      <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        {securityText}
      </div>
    </>
  );
};

export default PaymentSubmitAction;
