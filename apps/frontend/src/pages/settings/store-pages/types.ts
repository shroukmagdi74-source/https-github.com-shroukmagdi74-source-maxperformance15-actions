export interface StorePage {
  id: string;
  title: string;
  slug: string;
  content: string;
  pageType: string;
  isActive: boolean;
  showInFooter: boolean;
  showInMenu: boolean;
  order: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageFormData {
  title: string;
  slug: string;
  content: string;
  pageType: string;
  isActive: boolean;
  showInFooter: boolean;
  showInMenu: boolean;
  order: number;
  metaTitle: string;
  metaDescription: string;
}

export type PageTypeKey =
  | 'SHIPPING_POLICY'
  | 'RETURN_POLICY'
  | 'REFUND_POLICY'
  | 'PRIVACY_POLICY'
  | 'TERMS_CONDITIONS'
  | 'ABOUT_US'
  | 'CONTACT_US'
  | 'FAQ'
  | 'PAYMENT_METHODS'
  | 'CUSTOM';

export interface PageTypeInfo {
  label: string;
  iconName: string;
  colorClass: string;
}
