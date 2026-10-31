import type React from 'react';
import { getStatusDisplay } from '../../../utils/statusRegistry';

export interface PurchaseTrackingItem {
  id: string;
  productId?: string;
  variantId?: string;
  name?: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  attributes?: Record<string, string>;
  metadata?: unknown;
  quantityOffer?: {
    groupId?: string;
    offerId?: string;
    offerLabel?: string;
    offerQuantity?: number;
    slotIndex?: number;
    freeShipping?: boolean;
  };
}

export interface PurchaseTrackingState {
  eventId?: string;
  orderNumber: string;
  total: number;
  phone?: string;
  customerName?: string;
  paymentMethod?: string;
  items: PurchaseTrackingItem[];
  storePromotionDiscount?: number;
  storePromotionLabel?: string;
}

export interface TrackedOrderSummary {
  orderNumber: string;
  status?: string;
  paymentMethod?: string;
  total?: number;
  finalTotal?: number;
  shippingAddress?: unknown;
  items?: PurchaseTrackingItem[];
  storePromotionDiscount?: number;
  storePromotionLabel?: string;
}

export interface OrderConfirmationSettings {
  title?: string;
  description?: string;
  continueShoppingText?: string;
  orderNumberPrefix?: string;
  supportText?: string;
  supportEmail?: string;
  whatsappNumber?: string;
  whatsappMessage?: string;
  showTimeline?: boolean;
  showRecommended?: boolean;
  showTrackOrder?: boolean;
  showReorder?: boolean;
  recommendedTitle?: string;
  recommendedSubtitle?: string;
  recommendedLimit?: number | string;
  recommendedBadge?: string;
  recommendedCtaLabel?: string;
  recommendedChooseOptionsLabel?: string;
  recommendedVariantChoicesLabel?: string;
  recommendedVariant?: string;
  statusLabel?: string;
  whatsappSupportLabel?: string;
  trackOrderTitle?: string;
  trackOrderDescription?: string;
  trackOrderButtonText?: string;
  trackOrderPhoneLabel?: string;
  trackOrderPhonePlaceholder?: string;
  reorderTitle?: string;
  reorderDescription?: string;
  reorderButtonText?: string;
  reorderSuccessText?: string;
  [key: string]: unknown;
}

export interface OrderConfirmationProps {
  section?: {
    variant?: string;
    [key: string]: unknown;
  };
  settings?: OrderConfirmationSettings;
}

export type NormalizedOrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type TimelineStep = 'placed' | 'preparing' | 'shipped' | 'delivered';

export interface PcHubStatusExperience {
  timelineStep: TimelineStep;
  heroTitle: string;
  heroDescription: string;
  pillLabel: string;
  spotlightEyebrow: string;
  spotlightTitle: string;
  spotlightDescription: string;
  chips: string[];
  pillClassName: string;
  pulseClassName: string;
  dotClassName: string;
  spotlightCardClassName: string;
  spotlightBadgeClassName: string;
  chipClassName: string;
}

export const normalizeOrderConfirmationVariant = (
  value: unknown,
):
  | 'standard'
  | 'market-aftercare'
  | 'nature-aftercare'
  | 'command-aftercare'
  | 'boutique-aftercare'
  | 'soft-thanks' => {
  if (typeof value !== 'string') {
    return 'standard';
  }

  const normalizedValue = value.trim().toLowerCase();
  if (normalizedValue === 'market-aftercare') {
    return 'market-aftercare';
  }

  if (normalizedValue === 'nature-aftercare') {
    return 'nature-aftercare';
  }

  if (normalizedValue === 'command-aftercare') {
    return 'command-aftercare';
  }

  if (normalizedValue === 'boutique-aftercare') {
    return 'boutique-aftercare';
  }

  if (normalizedValue === 'soft-thanks') {
    return 'soft-thanks';
  }

  return 'standard';
};

export const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

export const asTrimmedString = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

export const getOrderStatusText = (status?: string, t?: (key: string) => string, _prefersArabicCopy = false) => {
  if (!status) return '';
  const info = getStatusDisplay(status);
  return t?.(info.labelKey) || info.label;
};

export const getOrderStatusClassName = (status?: string) => {
  if (!status) return 'bg-gray-100 text-gray-800';
  return getStatusDisplay(status).colorClass;
};

export const getPaymentMethodText = (value?: string, prefersArabicCopy = false) =>
  ({
    cod: prefersArabicCopy ? 'الدفع عند الاستلام' : 'Cash on delivery',
    cash: prefersArabicCopy ? 'الدفع عند الاستلام' : 'Cash on delivery',
    card: prefersArabicCopy ? 'الدفع بالبطاقة' : 'Card payment',
    credit_card: prefersArabicCopy ? 'الدفع بالبطاقة' : 'Card payment',
    wallet: prefersArabicCopy ? 'المحفظة الرقمية' : 'Digital wallet',
    bank_transfer: prefersArabicCopy ? 'تحويل بنكي' : 'Bank transfer',
  }[String(value || '').trim().toLowerCase()] || value || (prefersArabicCopy ? 'الدفع عند إتمام الطلب' : 'Checkout payment'));

export const resolveShippingLocation = (shippingAddress: unknown): string => {
  if (!shippingAddress) return '';
  if (typeof shippingAddress === 'string') {
    const trimmedAddress = shippingAddress.trim();
    if (!trimmedAddress) return '';

    try {
      const parsedAddress = JSON.parse(trimmedAddress);
      const resolvedAddress = resolveShippingLocation(parsedAddress);
      if (resolvedAddress) return resolvedAddress;
    } catch (_) {
      // Legacy orders may store this field as plain text.
    }

    return trimmedAddress;
  }
  if (typeof shippingAddress !== 'object' || Array.isArray(shippingAddress)) return '';
  const data = shippingAddress as Record<string, unknown>;
  const fullAddress = String(data['address'] || '').trim();
  if (fullAddress) {
    return fullAddress;
  }

  return Array.from(
    new Set(
      [data['governorate'], data['city'], data['street'], data['addressLine1']]
        .map((value) => String(value || '').trim())
        .filter(Boolean),
    ),
  ).join(', ');
};

export const normalizeOrderStatus = (status?: string): NormalizedOrderStatus => {
  const normalized = String(status || '').trim().toUpperCase();
  if (normalized === 'PENDING') return 'PENDING';
  if (normalized === 'CONFIRMED') return 'CONFIRMED';
  if (normalized === 'SHIPPED') return 'SHIPPED';
  if (normalized === 'DELIVERED') return 'DELIVERED';
  if (normalized === 'CANCELLED') return 'CANCELLED';
  return 'PROCESSING';
};

export const resolveTimelineStepFromStatus = (status: NormalizedOrderStatus): TimelineStep => {
  if (status === 'PENDING') return 'placed';
  if (status === 'SHIPPED') return 'shipped';
  if (status === 'DELIVERED') return 'delivered';
  return 'preparing';
};

export const getPcHubStatusExperience = (
  status: NormalizedOrderStatus,
  prefersArabicCopy = false,
): PcHubStatusExperience => {
  const base = {
    timelineStep: resolveTimelineStepFromStatus(status),
    spotlightEyebrow: prefersArabicCopy ? 'الوضع الحالي' : 'Current state',
  };

  switch (status) {
    case 'PENDING':
      return {
        ...base,
        heroTitle: prefersArabicCopy ? 'طلبك قيد المراجعة الأولى' : 'Your order is in initial review',
        heroDescription: prefersArabicCopy
          ? 'استلمنا الطلب ونراجع الهاتف والعنوان والموديل المطلوب قبل إدخاله إلى مرحلة التجهيز.'
          : 'We received the order and are reviewing the phone, address, and selected model before prep.',
        pillLabel: prefersArabicCopy ? 'قيد المراجعة' : 'In review',
        spotlightTitle: prefersArabicCopy ? 'نراجع البيانات قبل التجهيز' : 'Reviewing the details before prep',
        spotlightDescription: prefersArabicCopy
          ? 'الخطوة التالية هي تثبيت بيانات التواصل والعنوان حتى ينتقل الطلب إلى تجهيز القطع والشحن.'
          : 'The next step is confirming the contact and address details before prep begins.',
        chips: prefersArabicCopy
          ? ['تأكيد الهاتف', 'مراجعة العنوان', 'جاهز للتجهيز']
          : ['Phone check', 'Address review', 'Ready for prep'],
        pillClassName:
          'flex items-center gap-2 rounded-full border border-[#f3d08c] bg-[#fff6dc] px-4 py-2 text-[#8a5a06] shadow-inner',
        pulseClassName: 'absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-75',
        dotClassName: 'relative inline-flex h-2 w-2 rounded-full bg-amber-500',
        spotlightCardClassName:
          'mt-8 rounded-[1.8rem] border border-[#f2d38d] bg-[linear-gradient(180deg,#fffaf0_0%,#fff1ce_100%)] p-5 text-start shadow-[0_22px_60px_-44px_rgba(180,83,9,0.2)]',
        spotlightBadgeClassName:
          'inline-flex items-center gap-2 rounded-full border border-[#f3d08c] bg-white/80 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#8a5a06]',
        chipClassName:
          'rounded-full border border-[#eed79f] bg-white/86 px-3 py-1 text-xs font-semibold text-[#8a5a06]',
      };
    case 'SHIPPED':
      return {
        ...base,
        heroTitle: prefersArabicCopy ? 'طلبك خرج للشحن' : 'Your order is out for delivery',
        heroDescription: prefersArabicCopy
          ? 'تم تجهيز الطلب وخرج للشحن. خلي موبايلك متاحًا لأن شركة الشحن قد تتواصل معك في أي وقت.'
          : 'The order was prepared and is now on its way. Keep your phone available for delivery updates.',
        pillLabel: prefersArabicCopy ? 'خرج للشحن' : 'Out for delivery',
        spotlightTitle: prefersArabicCopy ? 'الشحنة في الطريق إليك' : 'The shipment is on the way',
        spotlightDescription: prefersArabicCopy
          ? 'الخطوة التالية المتوقعة هي تواصل المندوب أو محاولة التسليم على العنوان المسجل في الطلب.'
          : 'The next expected step is a courier contact or delivery attempt at the saved address.',
        chips: prefersArabicCopy
          ? ['تواصل المندوب', 'الهاتف متاح', 'استلام ومراجعة']
          : ['Courier contact', 'Phone available', 'Receive & inspect'],
        pillClassName:
          'flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sky-700 shadow-inner',
        pulseClassName: 'absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-300 opacity-75',
        dotClassName: 'relative inline-flex h-2 w-2 rounded-full bg-sky-500',
        spotlightCardClassName:
          'mt-8 rounded-[1.8rem] border border-sky-200 bg-[linear-gradient(180deg,#f8fbff_0%,#eaf4ff_100%)] p-5 text-start shadow-[0_22px_60px_-44px_rgba(59,130,246,0.2)]',
        spotlightBadgeClassName:
          'inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-sky-700',
        chipClassName:
          'rounded-full border border-sky-200 bg-white/90 px-3 py-1 text-xs font-semibold text-sky-700',
      };
    case 'DELIVERED':
      return {
        ...base,
        heroTitle: prefersArabicCopy ? 'تم تسليم طلبك بنجاح' : 'Your order was delivered successfully',
        heroDescription: prefersArabicCopy
          ? 'وصلت التجهيزة بنجاح. لو محتاج نفس الطلب مرة أخرى أو ملحقات تكمله فكل شيء جاهز من نفس الصفحة.'
          : 'Your setup has arrived. Reorder the same setup or add matching accessories from this page.',
        pillLabel: prefersArabicCopy ? 'تم التسليم' : 'Delivered',
        spotlightTitle: prefersArabicCopy ? 'اكتملت الرحلة الأساسية' : 'The main journey is complete',
        spotlightDescription: prefersArabicCopy
          ? 'يمكنك الآن إعادة نفس التجهيزة، أو إضافة شاشة وملحقات تكمل الاستخدام الفعلي بعد الاستلام.'
          : 'You can now reorder the same setup or add a display and accessories that match real usage.',
        chips: prefersArabicCopy
          ? ['إعادة الطلب', 'ملحقات مكملة', 'دعم ما بعد البيع']
          : ['Reorder', 'Matching add-ons', 'After-sales support'],
        pillClassName:
          'flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-emerald-700 shadow-inner',
        pulseClassName: 'absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75',
        dotClassName: 'relative inline-flex h-2 w-2 rounded-full bg-emerald-500',
        spotlightCardClassName:
          'mt-8 rounded-[1.8rem] border border-emerald-200 bg-[linear-gradient(180deg,#f7fffb_0%,#e8fff2_100%)] p-5 text-start shadow-[0_22px_60px_-44px_rgba(16,185,129,0.18)]',
        spotlightBadgeClassName:
          'inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700',
        chipClassName:
          'rounded-full border border-emerald-200 bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-700',
      };
    case 'CANCELLED':
      return {
        ...base,
        heroTitle: prefersArabicCopy ? 'تم إيقاف تنفيذ الطلب' : 'The order was halted',
        heroDescription: prefersArabicCopy
          ? 'إذا كان هذا غير متوقع، راجعنا على واتساب لنوضح السبب أو نساعدك في إعادة تجهيز الطلب.'
          : 'If this is unexpected, contact us on WhatsApp so we can clarify the reason or help rebuild the order.',
        pillLabel: prefersArabicCopy ? 'تم الإيقاف' : 'Cancelled',
        spotlightTitle: prefersArabicCopy ? 'الطلب لا يتحرك الآن' : 'The order is not progressing now',
        spotlightDescription: prefersArabicCopy
          ? 'أفضل خطوة تالية هي مراجعة الفريق لمعرفة السبب وتصحيح البيانات أو إعادة الطلب عند الحاجة.'
          : 'The best next step is reviewing the issue with the team and fixing the details if needed.',
        chips: prefersArabicCopy
          ? ['مراجعة الدعم', 'تحديث البيانات', 'طلب جديد عند الحاجة']
          : ['Support review', 'Update details', 'New order if needed'],
        pillClassName:
          'flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-rose-700 shadow-inner',
        pulseClassName: 'absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-300 opacity-75',
        dotClassName: 'relative inline-flex h-2 w-2 rounded-full bg-rose-500',
        spotlightCardClassName:
          'mt-8 rounded-[1.8rem] border border-rose-200 bg-[linear-gradient(180deg,#fff9fa_0%,#ffe8eb_100%)] p-5 text-start shadow-[0_22px_60px_-44px_rgba(244,63,94,0.18)]',
        spotlightBadgeClassName:
          'inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/80 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-rose-700',
        chipClassName:
          'rounded-full border border-rose-200 bg-white/90 px-3 py-1 text-xs font-semibold text-rose-700',
      };
    case 'CONFIRMED':
    case 'PROCESSING':
    default:
      return {
        ...base,
        heroTitle: prefersArabicCopy ? 'تم تسجيل طلبك وجارٍ مراجعته' : 'Your order is now under review',
        heroDescription: prefersArabicCopy
          ? 'رقم الطلب عندك جاهز، ونحن نراجع التوفر والتغليف والشحن قبل التنفيذ حتى تستلم التجهيزة بشكل واضح وآمن.'
          : 'Your order number is ready and we are reviewing stock, protection, and shipping before fulfillment.',
        pillLabel: prefersArabicCopy ? 'مراجعة وتجهيز' : 'Review & prep',
        spotlightTitle: prefersArabicCopy ? 'نثبت التوفر ونجهز الشحنة' : 'Confirming stock and preparing shipment',
        spotlightDescription: prefersArabicCopy
          ? 'الخطوة الحالية هي مراجعة القطع والإضافات والتغليف قبل تسليم الطلب إلى الشحن.'
          : 'We are currently reviewing the items, add-ons, and packaging before handoff to shipping.',
        chips: prefersArabicCopy
          ? ['مراجعة التوفر', 'تجهيز القطع', 'تغليف محمي']
          : ['Stock review', 'Item prep', 'Protected packaging'],
        pillClassName:
          'flex items-center gap-2 rounded-full border border-[#e7d99f] bg-[#111827] px-4 py-2 text-[#f8d76a] shadow-inner',
        pulseClassName: 'absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-75',
        dotClassName: 'relative inline-flex h-2 w-2 rounded-full bg-[#f5c94b]',
        spotlightCardClassName:
          'mt-8 rounded-[1.8rem] border border-[#ead89d] bg-[linear-gradient(180deg,#fffef8_0%,#fff4d7_100%)] p-5 text-start shadow-[0_22px_60px_-44px_rgba(15,23,42,0.18)]',
        spotlightBadgeClassName:
          'inline-flex items-center gap-2 rounded-full border border-[#ead89d] bg-white/80 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#8a5a06]',
        chipClassName:
          'rounded-full border border-[#eed79f] bg-white/86 px-3 py-1 text-xs font-semibold text-[#8a5a06]',
      };
  }
};
