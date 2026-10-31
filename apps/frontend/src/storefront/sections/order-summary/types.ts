import React from "react";
import { formatStorefrontCurrency } from "../../utils/currency";
import { DEFAULT_STOREFRONT_CART_STORAGE_NAME } from "../../store/useCartStore";

export type StorefrontSettingsRecord = Record<string, unknown>;

export type CouponValidationError = {
  response?: {
    data?: {
      error?: string;
    };
  };
  message?: string;
};

export type OrderSummaryVariant =
  | "standard"
  | "highlighted"
  | "minimal"
  | "market-summary"
  | "nature-summary"
  | "command-summary"
  | "boutique-summary"
  | "fitting-room-summary";

export interface OrderSummarySettings {
  title?: string;
  subtitle?: string;
  shippingHelpText?: string;
  couponPlaceholder?: string;
  couponButtonText?: string;
  checkoutButtonText?: string;
  subtotalLabel?: string;
  shippingLabel?: string;
  shippingValueText?: string;
  totalLabel?: string;
  secureCheckoutText?: string;
  returnsText?: string;
  freeShippingTitle?: string;
  freeShippingReachedText?: string;
  showTrustRow?: string | boolean;
  showCouponField?: string | boolean;
  showFreeShippingProgress?: string | boolean;
  hideCheckoutButton?: string | boolean;
  showLineItems?: string | boolean;
  lineItemsEditable?: string | boolean;
  lineItemsTitle?: string;
  showAssuranceCard?: string | boolean;
  showNextSteps?: string | boolean;
  headerBadge?: string;
  assuranceTitle?: string;
  assuranceItems?: string[] | string;
  nextStepsTitle?: string;
  nextSteps?: string[] | string;
  [key: string]: unknown;
}

export interface OrderSummaryProps {
  section?: {
    variant?: string;
    [key: string]: unknown;
  };
  settings?: OrderSummarySettings;
}

export const normalizeVariant = (value: unknown): OrderSummaryVariant => {
  if (typeof value !== "string") {
    return "standard";
  }

  const normalizedValue = value.trim().toLowerCase();
  if (
    normalizedValue === "highlighted" ||
    normalizedValue === "minimal" ||
    normalizedValue === "standard" ||
    normalizedValue === "market-summary" ||
    normalizedValue === "nature-summary" ||
    normalizedValue === "command-summary" ||
    normalizedValue === "boutique-summary" ||
    normalizedValue === "fitting-room-summary"
  ) {
    return normalizedValue;
  }

  return "standard";
};

export const parseBooleanSetting = (
  value: unknown,
  fallback: boolean,
): boolean => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase();
    if (normalizedValue === "true") {
      return true;
    }
    if (normalizedValue === "false") {
      return false;
    }
  }

  return fallback;
};

export const parseListSetting = (
  value: unknown,
  fallback: string[],
): string[] => {
  const items = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/,|\n/)
      : fallback;

  return items.map((item) => String(item).trim()).filter(Boolean);
};

export const parsePositiveNumber = (
  value: unknown,
  fallback: number,
): number => {
  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return fallback;
  }

  return numericValue;
};

export const isSameAmount = (left: number, right: number): boolean =>
  Math.abs(left - right) < 0.01;

export const replaceCurrencyToken = (
  template: string,
  remainingAmount: number,
  currency: string,
): string =>
  template.replace(
    "{{remaining}}",
    formatStorefrontCurrency(remainingAmount, currency),
  );

export const DEFAULT_FREE_SHIPPING_MESSAGE_VARIANTS = [
  "Add {{remaining}} to unlock free shipping",
  "Add {{remaining}} to unlock free shipping!",
];

export const DEFAULT_FREE_SHIPPING_REACHED_VARIANTS = [
  "You unlocked free shipping",
];

export const normalizeDirectionalCopy = (value: string): string =>
  value.trim().replace(/\s+/g, " ");

export const resolveDirectionalFreeShippingCopy = ({
  value,
  direction,
  rtlFallback,
  ltrFallback,
  knownEnglishDefaults,
}: {
  value: unknown;
  direction: "rtl" | "ltr";
  rtlFallback: string;
  ltrFallback: string;
  knownEnglishDefaults: string[];
}): string => {
  if (typeof value !== "string" || !value.trim()) {
    return direction === "rtl" ? rtlFallback : ltrFallback;
  }

  const trimmedValue = value.trim();
  if (
    direction === "rtl" &&
    knownEnglishDefaults.some(
      (candidate) =>
        normalizeDirectionalCopy(candidate) ===
        normalizeDirectionalCopy(trimmedValue),
    )
  ) {
    return rtlFallback;
  }

  return trimmedValue;
};

export const getCouponValidationMessage = (error: unknown): string => {
  const candidate = error as CouponValidationError | null;
  return String(
    candidate?.response?.data?.error ||
      candidate?.message ||
      "تعذر التحقق من كود الخصم الآن.",
  );
};

export const getPersistedCartItemCount = (): number => {
  if (typeof window === "undefined") {
    return 0;
  }

  try {
    const rawCart = window.localStorage.getItem(
      DEFAULT_STOREFRONT_CART_STORAGE_NAME,
    );
    if (!rawCart) {
      return 0;
    }

    const parsedCart = JSON.parse(rawCart) as {
      state?: { items?: unknown[] };
    };

    return Array.isArray(parsedCart.state?.items)
      ? parsedCart.state.items.length
      : 0;
  } catch {
    return 0;
  }
};

export const getWrapperClassName = (variant: OrderSummaryVariant): string => {
  switch (variant) {
    case "highlighted":
      return "rounded-[1.6rem] border border-border bg-[linear-gradient(180deg,hsl(var(--background)),hsl(var(--secondary)/0.26))] p-6 space-y-5 sticky top-24 shadow-[0_26px_80px_-55px_hsl(var(--primary)/0.35)]";
    case "minimal":
      return "rounded-[1.1rem] border border-border bg-background p-5 space-y-5 sticky top-24";
    case "market-summary":
      return "rounded-[2rem] border border-[#f0d4b0] bg-[linear-gradient(180deg,#fffdf8_0%,#fff6ec_54%,#ffffff_100%)] p-6 space-y-5 sticky top-24 shadow-[0_34px_100px_-76px_rgba(154,93,34,0.14)]";
    case "nature-summary":
      return "rounded-[2rem] border border-[#dbe3d4] bg-[linear-gradient(180deg,#ffffff_0%,#f5f8f2_56%,#ffffff_100%)] p-6 space-y-5 sticky top-24 shadow-[0_34px_100px_-76px_rgba(26,51,40,0.14)]";
    case "command-summary":
      return "rounded-[2rem] border border-[#e7d7b6] bg-[linear-gradient(180deg,#fffdf9_0%,#fff7e9_54%,#ffffff_100%)] p-6 space-y-5 sticky top-24 shadow-[0_34px_100px_-76px_rgba(90,62,24,0.24)]";
    case "boutique-summary":
      return "rounded-[2rem] border border-[#ead8cf] bg-[linear-gradient(180deg,#fffdfc_0%,#fff7f4_56%,#ffffff_100%)] p-6 space-y-5 sticky top-24 shadow-[0_34px_100px_-76px_rgba(107,33,49,0.14)]";
    case "fitting-room-summary":
      return "mx-auto w-full max-w-[25.5rem] rounded-[2.2rem] border border-[#efe5dd] bg-white p-5 space-y-4 shadow-[0_28px_90px_-52px_rgba(42,38,35,0.22)]";
    default:
      return "rounded-[var(--radius)] border border-border bg-card p-6 space-y-5 sticky top-24";
  }
};

export const getProgressBarClassName = (
  variant: OrderSummaryVariant,
): string => {
  switch (variant) {
    case "highlighted":
      return "h-2 rounded-full bg-primary/10";
    case "minimal":
      return "h-1.5 rounded-full bg-muted";
    case "market-summary":
      return "h-2 rounded-full bg-[#f2dfc6]";
    case "nature-summary":
      return "h-2 rounded-full bg-[#dce4d5]";
    case "command-summary":
      return "h-2 rounded-full bg-[#eadcbc]";
    case "boutique-summary":
      return "h-2 rounded-full bg-[#f1dfdc]";
    case "fitting-room-summary":
      return "h-1.5 rounded-full bg-[#eee8e2]";
    default:
      return "h-2 rounded-full bg-muted";
  }
};
