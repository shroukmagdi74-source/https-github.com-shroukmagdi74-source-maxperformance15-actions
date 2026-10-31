import { getDefaultRegisteredVariantId, hasRegisteredVariant } from '../../variants';
import { isKhemetLuxeTheme } from '../../utils/navigationGuards';
import { buildVersionedStorefrontStaticAssetUrl } from '../../utils/productImages';

export interface OfferCard {
  label?: string;
  title: string;
  subtitle: string;
  ctaText?: string;
  link: string;
  tone?: string;
  stat?: string;
  image?: string;
}

export const isFeminineTheme = (themeId?: string) =>
  themeId === 'women-fashion-eg' ||
  themeId === 'solea-femme' ||
  themeId === 'khemet-fashion-eg' ||
  themeId === 'rose-boutique-eg';

export interface OfferBentoProps {
  section?: {
    variant?: string;
    [key: string]: unknown;
  };
  settings?: {
    badge?: string;
    title?: string;
    subtitle?: string;
    hideSubtitle?: boolean;
    cards?: unknown;
    [key: string]: unknown;
  };
}

export const DEFAULT_CARDS: OfferCard[] = [
  {
    label: 'اختيار اليوم',
    title: 'الأكثر طلبًا هذا الأسبوع',
    subtitle: 'منتجات عليها طلب أعلى وتناسب من يريد شراءً أسرع.',
    ctaText: 'شاهد المنتجات',
    link: '/shop?sort=popular',
    tone: 'primary',
    stat: 'الأكثر طلبًا',
  },
  {
    label: 'عروض موفرة',
    title: 'وفر أكثر عند الجمع',
    subtitle: 'اختيارات بأسعار أوضح وباقات تسهّل القرار من أول نظرة.',
    ctaText: 'اذهب للعروض',
    link: '/sale',
    tone: 'accent',
    stat: 'عروض يومية',
  },
  {
    label: 'خدمة أوضح',
    title: 'الشحن والمتابعة قبل الدفع',
    subtitle: 'اعرف التوصيل والمتابعة وسياسة الطلب قبل تأكيد الشراء.',
    ctaText: 'اعرف أكثر',
    link: '/shipping',
    tone: 'slate',
    stat: 'شحن خلال 48 ساعة',
  },
];

export const TONE_CLASS_MAP: Record<string, string> = {
  primary:
    'border-primary/12 bg-[linear-gradient(135deg,hsl(var(--primary)/0.16),rgba(255,255,255,0.96)_55%,hsl(var(--secondary)/0.92))] text-foreground',
  accent:
    'border-amber-200 bg-[linear-gradient(135deg,rgba(251,191,36,0.24),rgba(255,255,255,0.98)_58%,rgba(255,247,237,0.94))] text-foreground',
  slate:
    'border-slate-200 bg-[linear-gradient(135deg,rgba(15,23,42,0.09),rgba(255,255,255,0.98)_58%,rgba(241,245,249,0.96))] text-foreground',
};

export const isOfferCard = (value: unknown): value is OfferCard =>
  Boolean(value) &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  typeof (value as OfferCard).title === 'string' &&
  typeof (value as OfferCard).subtitle === 'string' &&
  typeof (value as OfferCard).link === 'string';

export const parseCards = (value: unknown): OfferCard[] => {
  if (Array.isArray(value)) {
    const parsed = value.filter(isOfferCard).map((card) => ({
      label: card.label?.trim(),
      title: card.title.trim(),
      subtitle: card.subtitle.trim(),
      ctaText: card.ctaText?.trim(),
      link: card.link.trim(),
      tone: card.tone?.trim(),
      stat: card.stat?.trim(),
      image: card.image?.trim(),
    }));
    if (parsed.length > 0) {
      return parsed;
    }
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = value
      .split(/\r?\n/)
      .map((line) => line.split('|').map((part) => part.trim()))
      .filter((parts) => parts.some(Boolean))
      .map(([label, title, subtitle, ctaText, link, tone, stat, image]) => ({
        label: label || undefined,
        title: title || '',
        subtitle: subtitle || '',
        ctaText: ctaText || undefined,
        link: link || '/shop',
        tone: tone || undefined,
        stat: stat || undefined,
        image: image || undefined,
      }))
      .filter((card) => card.title && card.subtitle && card.link);

    if (parsed.length > 0) {
      return parsed;
    }
  }

  return DEFAULT_CARDS;
};

export const normalizeOfferText = (value: string): string =>
  value.trim().toLowerCase();

export const resolveOfferSignals = (
  card: OfferCard,
  index: number,
  themeId?: string,
): string[] => {
  if (card.stat && card.stat.trim()) {
    return [];
  }

  const content = normalizeOfferText(
    `${card.label || ''} ${card.title} ${card.subtitle} ${card.stat || ''}`,
  );

  if (themeId === 'restaurant-demo') {
    if (content.includes('كومبو') || content.includes('combo') || content.includes('value')) {
      return ['وجبة + بطاطس + مشروب', 'قرار أسرع', 'قيمة أعلى'];
    }

    if (content.includes('ليل') || content.includes('night') || content.includes('late')) {
      return ['طلبات ما بعد الدوام', 'إضافات جاهزة', 'سحب أسرع للسلة'];
    }

    return index === 0
      ? ['برجر smash', 'الأكثر طلبًا اليوم', 'زر طلب مباشر']
      : ['توصيل ساخن', 'رسالة أوضح', 'رفع متوسط الطلب'];
  }

  if (isKhemetLuxeTheme(themeId)) {
    if (
      content.includes('2+1') ||
      content.includes('الثالث') ||
      content.includes('عرض')
    ) {
      return ['اختاري 3 أزواج', 'وفري في الطلب', 'مقاسات متاحة'];
    }

    if (
      content.includes('الأكثر') ||
      content.includes('popular') ||
      content.includes('طلب')
    ) {
      return ['موديلات رائجة', 'صور واضحة', 'اختيار أسرع'];
    }

    if (
      content.includes('مقاس') ||
      content.includes('نفاد') ||
      content.includes('new')
    ) {
      return ['مقاسات محدودة', 'طلب مباشر', 'توصيل أسرع'];
    }

    return ['صور واضحة', 'مقاسات أسهل', 'طلب من نفس الصفحة'];
  }

  if (
    content.includes('شحن') ||
    content.includes('استبدال') ||
    content.includes('ثقة') ||
    content.includes('آمن')
  ) {
    return ['الدفع عند الاستلام', 'استبدال حتى 14 يوم', 'متابعة واضحة للطلب'];
  }

  if (
    content.includes('عرض') ||
    content.includes('خصم') ||
    content.includes('سعر') ||
    content.includes('اقتصادي')
  ) {
    return ['خصم حتى 25%', 'منتجات أقل من 299 ج.م', 'عروض متجددة أسبوعيًا'];
  }

  if (
    content.includes('الأكثر') ||
    content.includes('سريع') ||
    content.includes('طلب')
  ) {
    return ['منظمات وعلب تخزين', 'هدايا عملية', 'تجهيز خلال 48 ساعة'];
  }

  return index === 0
    ? ['منتجات عملية', 'أسعار أوضح', 'قرار أسرع']
    : ['شحن واضح', 'توصيل أسرع', 'طلب مباشر'];
};

export const resolveRedlineCardImage = (card: OfferCard, index: number): string => {
  const content = `${card.label || ''} ${card.title} ${card.subtitle}`.toLowerCase();
  if (content.includes('سيدان') || content.includes('5 قطع') || content.includes('خمس')) {
    return '/assets/stores/red-line/full-kit-80.png';
  }
  if (content.includes('suv') || content.includes('جيب') || content.includes('7 قطع') || content.includes('سبع')) {
    return '/assets/stores/red-line/redline-exterior-view.jpg';
  }
  if (content.includes('جرار') || content.includes('سحاب')) {
    return '/assets/stores/red-line/tint-80-movable.png';
  }
  if (content.includes('2 قطعة') || content.includes('أمامي') || content.includes('قطعتين')) {
    return '/assets/stores/red-line/tint-80-fixed.png';
  }
  if (content.includes('خلفي') || content.includes('شنطة')) {
    return '/assets/stores/red-line/rear-windshield-80.png';
  }
  if (content.includes('معاينة') || content.includes('ضمان') || content.includes('تجربة')) {
    return '/assets/stores/red-line/redline-installation-detail.jpg';
  }
  return [
    '/assets/stores/red-line/full-kit-80.png',
    '/assets/stores/red-line/redline-exterior-view.jpg',
    '/assets/stores/red-line/tint-80-movable.png',
  ][index % 3];
};

export const resolveDistrictMarketOfferImage = (
  card: OfferCard,
  index: number,
): string => {
  const content = normalizeOfferText(
    `${card.label || ''} ${card.title} ${card.subtitle} ${card.stat || ''}`,
  );

  if (
    content.includes('شحن') ||
    content.includes('استبدال') ||
    content.includes('ثقة') ||
    content.includes('دفع')
  ) {
    return '/assets/themes/district-market/feature-clarity.webp';
  }

  if (
    content.includes('عرض') ||
    content.includes('خصم') ||
    content.includes('سعر')
  ) {
    return '/assets/themes/district-market/lane-deals.webp';
  }

  if (
    content.includes('الأكثر') ||
    content.includes('طلب') ||
    content.includes('حركة')
  ) {
    return '/assets/themes/district-market/lane-essentials.webp';
  }

  return index === 0
    ? '/assets/themes/district-market/hero-scene.webp'
    : '/assets/themes/district-market/lane-home.webp';
};

export const resolveCampaignStackImage = (card: OfferCard, index: number): string => {
  if (card.image?.trim()) {
    return buildVersionedStorefrontStaticAssetUrl(card.image.trim());
  }

  const fallback = [
    '/placeholders/luxury-shoes/sneaker-white.png',
    '/placeholders/luxury-shoes/flats.png',
    '/placeholders/luxury-shoes/hero.png',
  ][index % 3]!;

  return buildVersionedStorefrontStaticAssetUrl(fallback);
};

export const resolveDistrictMarketOfferCaption = (
  card: OfferCard,
  index: number,
): string => {
  const content = normalizeOfferText(
    `${card.label || ''} ${card.title} ${card.subtitle} ${card.stat || ''}`,
  );

  if (
    content.includes('شحن') ||
    content.includes('استبدال') ||
    content.includes('ثقة') ||
    content.includes('دفع')
  ) {
    return 'رسائل الخدمة الأساسية تظهر قبل الدخول إلى الدفع.';
  }

  if (
    content.includes('عرض') ||
    content.includes('خصم') ||
    content.includes('سعر')
  ) {
    return 'خصم واضح يسهل المقارنة بدل الزحام بين كروت كثيرة.';
  }

  if (
    content.includes('الأكثر') ||
    content.includes('طلب') ||
    content.includes('حركة')
  ) {
    return 'منتجات عملية يرى العميل أنها تتحرك فعلًا داخل المتجر.';
  }

  return index === 0
    ? 'مدخل أسرع لقرار الشراء داخل المتجر.'
    : 'طبقة أوضح للحسم بعد أول تصفح.';
};

export type TechBundleMeta = {
  eyebrow: string;
  packageTitle: string;
  items: string[];
  note: string;
};

export const resolveTechBundleMeta = (
  card: OfferCard,
  index: number,
): TechBundleMeta => {
  const content = normalizeOfferText(
    `${card.label || ''} ${card.title} ${card.subtitle} ${card.stat || ''}`,
  );

  if (
    content.includes('laptop') ||
    content.includes('شغل') ||
    content.includes('study') ||
    content.includes('جامعة')
  ) {
    return {
      eyebrow: 'Work / Study',
      packageTitle: 'Setup for daily work',
      items: ['Laptop', 'Mouse', 'Bag / Sleeve'],
      note: 'يركز على الحركة اليومية والسعر الواضح والإضافات الأساسية فقط.',
    };
  }

  if (
    content.includes('desktop') ||
    content.includes('gaming') ||
    content.includes('creator') ||
    content.includes('تجميع')
  ) {
    return {
      eyebrow: 'Creator / Gaming',
      packageTitle: 'High-load bundle',
      items: ['Desktop', 'Monitor', 'Cooling / Power'],
      note: 'مبني على الأداء والتوافق بدل المقارنة بين قطع كثيرة غير مرتبة.',
    };
  }

  if (
    content.includes('dock') ||
    content.includes('accessor') ||
    content.includes('upgrade') ||
    content.includes('إكسسوارات')
  ) {
    return {
      eyebrow: 'Desk Upgrade',
      packageTitle: 'Fast add-ons',
      items: ['Dock / Hub', 'Keyboard', 'Mouse / Audio'],
      note: 'إضافات صغيرة ترفع قيمة الطلب وتكمل المكتب أو اللابتوب بسرعة.',
    };
  }

  return [
    {
      eyebrow: 'Quick Route',
      packageTitle: 'Ready bundle',
      items: ['Core item', 'Key add-on', 'Clear next step'],
      note: 'باقة تقود العميل نحو قرار أوضح داخل الصفحة.',
    },
    {
      eyebrow: 'Focused Path',
      packageTitle: 'Use-case bundle',
      items: ['Primary product', 'Support accessory', 'Faster CTA'],
      note: 'محتوى بيع أقرب للاستخدام الحقيقي من مجرد عرض عام.',
    },
  ][index % 2]!;
};

export type OfferBentoVariant =
  | 'category-promo'
  | 'daily-picks'
  | 'campaign-stack'
  | 'editorial-columns'
  | 'combo-deals'
  | 'bundle-matrix'
  | 'boutique-duo'
  | 'vela-fashion-mosaic';

export const OFFER_BENTO_FAMILY = 'OfferBento';
export const OFFER_BENTO_DEFAULT =
  (getDefaultRegisteredVariantId(OFFER_BENTO_FAMILY) as OfferBentoVariant | undefined) ||
  'category-promo';

export const normalizeOfferBentoVariant = (rawVariant: unknown): OfferBentoVariant => {
  const value = String(rawVariant || '').trim().toLowerCase();
  if (
    (
      value === 'category-promo' ||
      value === 'daily-picks' ||
      value === 'campaign-stack' ||
      value === 'editorial-columns' ||
      value === 'combo-deals' ||
      value === 'bundle-matrix' ||
      value === 'boutique-duo' ||
      value === 'vela-fashion-mosaic'
    ) &&
    hasRegisteredVariant(OFFER_BENTO_FAMILY, value)
  ) {
    return value as OfferBentoVariant;
  }
  return OFFER_BENTO_DEFAULT;
};
