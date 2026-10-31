import type { CartVariant } from './cartItemsTypes';

export const normalizeVariant = (value: unknown): CartVariant => {
  if (typeof value !== 'string') {
    return 'standard';
  }

  const normalizedValue = value.trim().toLowerCase();
  if (
    normalizedValue === 'editorial' ||
    normalizedValue === 'compact' ||
    normalizedValue === 'standard' ||
    normalizedValue === 'market-basket' ||
    normalizedValue === 'nature-cart' ||
    normalizedValue === 'playful-basket' ||
    normalizedValue === 'wardrobe-cart' ||
    normalizedValue === 'command-cart'
  ) {
    return normalizedValue;
  }

  return 'standard';
};

export const parseBooleanSetting = (value: unknown, fallback: boolean) => {
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

export const getHeaderWrapperClassName = (variant: CartVariant) => {
  switch (variant) {
    case 'editorial':
      return 'mb-6 rounded-[1.5rem] border border-border bg-[linear-gradient(180deg,hsl(var(--background)),hsl(var(--secondary)/0.22))] p-5';
    case 'compact':
      return 'mb-4 rounded-[1rem] border border-border bg-card p-4';
    case 'market-basket':
      return 'mb-6 rounded-[1.9rem] border border-[#f0d4b0] bg-[linear-gradient(180deg,#fffdf8_0%,#fff6ec_100%)] p-5 shadow-[0_24px_80px_-64px_rgba(154,93,34,0.14)]';
    case 'nature-cart':
      return 'mb-6 rounded-[1.9rem] border border-[#dbe3d4] bg-[linear-gradient(180deg,#ffffff_0%,#f4f8f2_100%)] p-5 shadow-[0_24px_80px_-64px_rgba(26,51,40,0.14)]';
    case 'command-cart':
      return 'mb-6 rounded-[2rem] border border-[#e7d7b6] bg-[linear-gradient(135deg,#fffdf8_0%,#fff7e7_54%,#ffffff_100%)] p-5 shadow-[0_34px_96px_-72px_rgba(90,62,24,0.26)] sm:p-6';
    case 'wardrobe-cart':
      return 'mb-6 rounded-[1.8rem] border border-[#ead9d8] bg-[linear-gradient(180deg,#fffdfc_0%,#fff8f7_100%)] p-5 shadow-[0_24px_80px_-64px_rgba(107,33,49,0.16)]';
    case 'playful-basket':
      return 'mb-8 rounded-[2.5rem] bg-sky-100 p-8 text-center dark:bg-sky-900/30';
    default:
      return 'mb-6';
  }
};

export const getListWrapperClassName = (variant: CartVariant) => {
  switch (variant) {
    case 'editorial':
      return 'overflow-hidden rounded-[1.6rem] border border-border bg-card shadow-[0_24px_80px_-65px_hsl(var(--foreground)/0.45)]';
    case 'compact':
      return 'overflow-hidden rounded-[1rem] border border-border bg-card';
    case 'market-basket':
    case 'nature-cart':
    case 'command-cart':
    case 'wardrobe-cart':
      return 'space-y-4';
    case 'playful-basket':
      return 'space-y-6';
    default:
      return 'space-y-1';
  }
};

export const getRowClassName = (variant: CartVariant) => {
  switch (variant) {
    case 'editorial':
      return 'grid grid-cols-1 items-center gap-4 border-b border-border/70 px-5 py-5 md:grid-cols-[2fr_1fr_1fr_1fr_auto]';
    case 'compact':
      return 'grid grid-cols-1 items-center gap-3 border-b border-border px-4 py-4 md:grid-cols-[2fr_1fr_1fr_1fr_auto]';
    case 'market-basket':
      return 'grid grid-cols-1 items-center gap-5 rounded-[1.8rem] border border-[#f0d4b0] bg-white/95 px-4 py-5 shadow-[0_22px_70px_-58px_rgba(154,93,34,0.14)] md:grid-cols-[2fr_1fr_1fr_1fr_auto]';
    case 'nature-cart':
      return 'grid grid-cols-1 items-center gap-5 rounded-[1.8rem] border border-[#dbe3d4] bg-white/95 px-4 py-5 shadow-[0_22px_70px_-58px_rgba(26,51,40,0.14)] md:grid-cols-[2fr_1fr_1fr_1fr_auto]';
    case 'command-cart':
      return 'grid grid-cols-1 items-center gap-5 rounded-[1.9rem] border border-[#ebdcc0] bg-white/95 px-4 py-5 shadow-[0_28px_86px_-74px_rgba(90,62,24,0.26)] md:grid-cols-[2fr_1fr_1fr_1fr_auto]';
    case 'wardrobe-cart':
      return 'grid grid-cols-1 items-center gap-5 rounded-[1.7rem] border border-[#ead9d8] bg-white px-4 py-5 shadow-[0_22px_70px_-58px_rgba(107,33,49,0.14)] md:grid-cols-[2fr_1fr_1fr_1fr_auto]';
    case 'playful-basket':
      return 'grid grid-cols-1 items-center gap-6 rounded-[2.5rem] border-4 border-white bg-white/60 p-6 shadow-xl backdrop-blur-md transition-transform hover:-rotate-1 active:scale-[0.98] md:grid-cols-[2fr_1fr_1fr_1fr_auto] dark:border-slate-800 dark:bg-slate-900/60';
    default:
      return 'grid grid-cols-1 items-center gap-4 border-b border-border px-4 py-5 md:grid-cols-[2fr_1fr_1fr_1fr_auto]';
  }
};
