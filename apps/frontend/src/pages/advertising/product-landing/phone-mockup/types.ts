import { LandingSection, ProductLandingProduct } from "../types";

export interface PhoneMockupPreviewProps {
  title: string;
  product: ProductLandingProduct | null;
  sections: LandingSection[];
  formConfig: {
    orderKicker: string;
    orderTitle: string;
    orderCopy: string;
    buttonLabel: string;
  };
  previewUrl?: string;
  customerUrl?: string;
  isMobileView?: boolean;
}

export type DeviceType = "mobile" | "tablet" | "desktop";
export type ViewModeType = "live" | "sync";

export interface BundleTier {
  qty: number;
  label: string;
  discount: number;
  badge: string;
}
