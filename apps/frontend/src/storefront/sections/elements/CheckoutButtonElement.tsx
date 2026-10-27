import React from 'react';
import {
  buildElementTypographyStyle,
  useElementTypographyRef,
  type ElementTypographySettings,
} from './elementTypography';
import { useCartStore } from '../../store/useCartStore';
import { buildStorefrontPath } from '../../utils/paths';

export interface CheckoutButtonElementSettings extends ElementTypographySettings {
  label?: string;
  variant?: 'primary' | 'outline' | 'ghost' | string;
  size?: 'sm' | 'md' | 'lg' | string;
  fullWidth?: boolean;
  align?: 'start' | 'center' | 'end' | 'left' | 'right' | string;
  className?: string;
}

export interface CheckoutButtonElementProps {
  section?: {
    type?: string;
    variant?: string;
    settings?: CheckoutButtonElementSettings;
    [key: string]: unknown;
  };
  settings?: CheckoutButtonElementSettings;
  onClick?: () => void;
  onCheckout?: () => void;
  disabled?: boolean;
}

const CheckoutButtonElement: React.FC<CheckoutButtonElementProps> = ({
  section,
  settings: directSettings,
  onClick,
  onCheckout,
  disabled: propDisabled,
}) => {
  const mergedSettings = { ...section?.settings, ...directSettings };
  const typographyRef = useElementTypographyRef(mergedSettings);
  const typographyStyle = buildElementTypographyStyle(mergedSettings);

  const { items } = useCartStore();

  // Strict Rule: Hide button when cart is empty (0 buttons in empty cart state)
  if (!items || items.length === 0) {
    return null;
  }

  const label = mergedSettings?.label || 'إتمام الطلب';
  const fullWidth = mergedSettings?.fullWidth !== false;
  const rawSize = String(mergedSettings?.size || 'md').trim().toLowerCase();
  const rawVariant = String(
    mergedSettings?.variant || section?.variant || 'primary',
  ).trim().toLowerCase();

  let sizeClasses = 'px-5 py-3 text-sm font-bold';
  if (rawSize === 'sm') {
    sizeClasses = 'px-3.5 py-2 text-xs font-semibold';
  } else if (rawSize === 'lg') {
    sizeClasses = 'px-6 py-4 text-base font-extrabold';
  }

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    if (onCheckout) {
      onCheckout();
      return;
    }
    if (typeof window !== 'undefined') {
      const checkoutPath = buildStorefrontPath(
        window.location.pathname,
        '/checkout',
        window.location.search,
      );
      window.location.assign(checkoutPath);
    }
  };

  return (
    <div
      data-testid="checkout-button-container"
      className={`w-full ${fullWidth ? 'block' : 'flex justify-start'} ${mergedSettings?.className || ''}`}
    >
      <button
        ref={typographyRef}
        type="button"
        data-testid="checkout-button"
        disabled={propDisabled}
        onClick={handleClick}
        style={{
          borderRadius: 'var(--store-radius, 10px)',
          ...typographyStyle,
        }}
        className={`inline-flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none ${
          fullWidth ? 'w-full' : 'w-auto'
        } ${sizeClasses} ${
          rawVariant === 'outline'
            ? 'border-2 border-primary text-primary bg-transparent hover:bg-primary/5'
            : rawVariant === 'ghost'
              ? 'text-primary bg-transparent hover:bg-primary/10'
              : 'bg-primary text-primary-foreground shadow-sm hover:opacity-95'
        }`}
      >
        <span>{label}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="rtl:rotate-180"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default CheckoutButtonElement;
