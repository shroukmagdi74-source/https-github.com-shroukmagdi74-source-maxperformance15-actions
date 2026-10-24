export type SaveState = "idle" | "saving" | "saved";

export interface FreeShippingSettings {
  freeShippingEnabled: boolean;
  freeShippingThreshold: number;
  freeShippingMessage: string;
}

export interface FlatShippingSettings {
  flatShippingEnabled: boolean;
  flatShippingFee: number;
}

export const MAX_THRESHOLD = 100000;
export const MAX_FEE = 10000;
export const AMOUNT_TOKEN = "{amount}";

export const SWITCH_SIZE_CLASS =
  "h-6! w-11! [&_[data-slot=switch-thumb]]:size-5! data-checked:[&_[data-slot=switch-thumb]]:translate-x-full! rtl:data-checked:[&_[data-slot=switch-thumb]]:-translate-x-full!";

export const formatAmount = (value: number): string =>
  Number(value || 0).toLocaleString("en-US");
