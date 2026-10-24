import {
  CreditCard,
  FileText,
  Globe,
  HelpCircle,
  Info,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from 'lucide-react';

export interface PageTypeMeta {
  key: string;
  labelKey: string;
  icon: LucideIcon;
  colorClass: string;
}

export const PAGE_TYPE_CONFIG: Record<string, PageTypeMeta> = {
  SHIPPING_POLICY: {
    key: 'SHIPPING_POLICY',
    labelKey: 'shippingPolicy',
    icon: Truck,
    colorClass: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
  },
  RETURN_POLICY: {
    key: 'RETURN_POLICY',
    labelKey: 'returnPolicy',
    icon: ShieldAlert,
    colorClass: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
  },
  REFUND_POLICY: {
    key: 'REFUND_POLICY',
    labelKey: 'refundPolicy',
    icon: ShieldCheck,
    colorClass: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
  },
  PRIVACY_POLICY: {
    key: 'PRIVACY_POLICY',
    labelKey: 'privacyPolicy',
    icon: ShieldCheck,
    colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  },
  TERMS_CONDITIONS: {
    key: 'TERMS_CONDITIONS',
    labelKey: 'termsConditions',
    icon: FileText,
    colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  },
  ABOUT_US: {
    key: 'ABOUT_US',
    labelKey: 'aboutUs',
    icon: Info,
    colorClass: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  },
  CONTACT_US: {
    key: 'CONTACT_US',
    labelKey: 'contactUs',
    icon: Mail,
    colorClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  },
  FAQ: {
    key: 'FAQ',
    labelKey: 'faq',
    icon: HelpCircle,
    colorClass: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  },
  PAYMENT_METHODS: {
    key: 'PAYMENT_METHODS',
    labelKey: 'paymentMethods',
    icon: CreditCard,
    colorClass: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
  },
  CUSTOM: {
    key: 'CUSTOM',
    labelKey: 'customPage',
    icon: FileText,
    colorClass: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20',
  },
};
