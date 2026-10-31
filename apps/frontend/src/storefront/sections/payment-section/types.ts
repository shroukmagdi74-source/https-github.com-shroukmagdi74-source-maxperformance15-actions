export interface PaymentSectionSettings {
  title?: string;
  subtitle?: string;
  summaryTitle?: string;
  summaryDescription?: string;
  confirmOrderText?: string;
  payButtonPrefix?: string;
  processingText?: string;
  shippingPromptText?: string;
  enterGovernorateText?: string;
  subtotalLabel?: string;
  shippingLabel?: string;
  totalLabel?: string;
  calculatingText?: string;
  shippingCalculatedText?: string;
  noShippingChargeText?: string;
  shippingErrorText?: string;
  governorateRequiredText?: string;
  invalidEmailText?: string;
  invalidPhoneText?: string;
  securityText?: string;
  enabledMethods?: string[];
  codLabel?: string;
  codDesc?: string;
  cardLabel?: string;
  cardDesc?: string;
  walletLabel?: string;
  walletDesc?: string;
  assuranceBadge?: string;
  assuranceTitle?: string;
  assuranceItems?: string[] | string;
  postConfirmStepsTitle?: string;
  postConfirmSteps?: string[] | string;
  showSummaryCard?: string | boolean;
  showHeaderBadge?: string | boolean;
  showAssuranceCard?: string | boolean;
  showNextSteps?: string | boolean;
  [key: string]: unknown;
}

export interface PaymentSectionProps {
  section?: {
    variant?: string;
    [key: string]: unknown;
  };
  settings?: PaymentSectionSettings;
}

export type PaymentSectionVariant =
  | 'standard'
  | 'cards'
  | 'minimal'
  | 'market-payment'
  | 'nature-payment'
  | 'command-payment'
  | 'boutique-payment';

export interface PaymentMethodOption {
  id: 'cod' | 'card' | 'wallet';
  label: string;
  icon: string;
  desc: string;
}

export const normalizeVariant = (value: unknown): PaymentSectionVariant => {
  if (typeof value !== 'string') {
    return 'standard';
  }

  const normalizedValue = value.trim().toLowerCase();
  if (
    normalizedValue === 'cards' ||
    normalizedValue === 'minimal' ||
    normalizedValue === 'standard' ||
    normalizedValue === 'market-payment' ||
    normalizedValue === 'nature-payment' ||
    normalizedValue === 'command-payment' ||
    normalizedValue === 'boutique-payment'
  ) {
    return normalizedValue as PaymentSectionVariant;
  }

  return 'standard';
};

export const parseListSetting = (value: unknown, fallback: string[]): string[] => {
  const items = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(/,|\n/)
      : fallback;

  return items.map((item) => String(item).trim()).filter(Boolean);
};

export const parseBooleanSetting = (value: unknown, fallback: boolean): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalizedValue = value.trim().toLowerCase();
    if (normalizedValue === 'true') {
      return true;
    }
    if (normalizedValue === 'false') {
      return false;
    }
  }

  return fallback;
};

export const getMethodCardClassName = (
  variant: PaymentSectionVariant,
  active: boolean,
): string => {
  const stateClassName = active
    ? 'border-primary bg-primary/5 ring-1 ring-primary'
    : 'border-border bg-card hover:bg-muted';

  switch (variant) {
    case 'cards':
      return `w-full rounded-[1.25rem] border p-4 text-start transition-all duration-200 ${stateClassName}`;
    case 'minimal':
      return `w-full rounded-[0.95rem] border p-3 text-start transition-all duration-200 ${stateClassName}`;
    case 'market-payment':
      return `w-full rounded-[1.6rem] border p-4 text-start transition-all duration-200 ${stateClassName}`;
    case 'nature-payment':
      return `w-full rounded-[1.6rem] border p-4 text-start transition-all duration-200 ${stateClassName}`;
    case 'command-payment':
      return `w-full rounded-[1.6rem] border p-4 text-start transition-all duration-200 ${stateClassName}`;
    case 'boutique-payment':
      return `w-full rounded-[1.6rem] border p-4 text-start transition-all duration-200 ${stateClassName}`;
    default:
      return `w-full rounded-[var(--radius)] border p-4 text-start transition-all duration-200 ${stateClassName}`;
  }
};

export const getSummaryWrapperClassName = (variant: PaymentSectionVariant): string => {
  switch (variant) {
    case 'cards':
      return 'rounded-[1.35rem] border border-border bg-[linear-gradient(180deg,hsl(var(--background)),hsl(var(--secondary)/0.22))] p-5 space-y-3';
    case 'minimal':
      return 'rounded-[1rem] border border-border/70 bg-background p-4 space-y-3';
    case 'market-payment':
      return 'rounded-[1.7rem] border border-[#f0d4b0] bg-[linear-gradient(180deg,#fffdf8_0%,#fff6ec_100%)] p-5 space-y-4 shadow-[0_24px_70px_-54px_rgba(154,93,34,0.14)]';
    case 'nature-payment':
      return 'rounded-[1.7rem] border border-[#dbe3d4] bg-[linear-gradient(180deg,#ffffff_0%,#f5f8f2_100%)] p-5 space-y-4 shadow-[0_24px_70px_-54px_rgba(26,51,40,0.14)]';
    case 'command-payment':
      return 'rounded-[1.7rem] border border-[#ead8b1] bg-[linear-gradient(180deg,#fffdf9_0%,#fff7e9_100%)] p-5 space-y-4 shadow-[0_24px_70px_-54px_rgba(90,62,24,0.18)]';
    case 'boutique-payment':
      return 'rounded-[1.7rem] border border-[#ead8cf] bg-[linear-gradient(180deg,#fffdfc_0%,#fff7f4_100%)] p-5 space-y-4 shadow-[0_24px_70px_-54px_rgba(107,33,49,0.14)]';
    default:
      return 'rounded-[var(--radius)] border border-border/50 bg-muted/30 p-4 space-y-3';
  }
};

export const isSameAmount = (left: number, right: number): boolean =>
  Math.abs(left - right) < 0.01;
