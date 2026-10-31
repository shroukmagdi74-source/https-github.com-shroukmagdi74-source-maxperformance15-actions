import {
  formatDateRange,
  interpolateCount,
  interpolateTemplate,
  normalizeBackInStockStyle,
  normalizeCountdownStyle,
  normalizeEstimatedDeliveryStyle,
  normalizeFakeVisitorStyle,
  normalizeLowStockStyle,
  normalizePurchaseFomoStyle,
  normalizeSoldCounterStyle,
  parseBadgeItems,
  resolveDateLocale,
  resolveDirectionalCopy,
  type CountdownParts,
} from './types';

interface ConversionLabelsInput {
  sectionSettings: Record<string, unknown> | undefined;
  ui: Record<string, unknown>;
  copy: Record<string, unknown>;
  countdown: Record<string, unknown>;
  estimatedDelivery: Record<string, unknown>;
  commerceCopy: Record<string, unknown>;
  prefersArabicCopy: boolean;
  isPcHubTheme: boolean;
  product: Record<string, unknown> | null | undefined;
  viewerCount: number;
  soldCount: number;
  purchaseFomoSource: 'active_carts' | 'recent_orders' | 'waitlist' | null;
  purchaseFomoCount: number;
  purchaseFomoRecentPurchaseWindowHours: number;
  purchaseFomoCartWindowHours: number;
  countdownParts: CountdownParts | null;
  showLowStock: boolean;
  lowStockDisplayCount: number | null;
  lowStockLimit: number;
  showEstimatedDelivery: boolean;
  showPreOrder: boolean;
  storefrontCurrency: string | undefined;
}

export const resolveConversionLabels = ({
  sectionSettings,
  ui,
  copy,
  countdown,
  estimatedDelivery,
  commerceCopy,
  prefersArabicCopy,
  isPcHubTheme,
  product,
  viewerCount,
  soldCount,
  purchaseFomoSource,
  purchaseFomoCount,
  purchaseFomoRecentPurchaseWindowHours,
  purchaseFomoCartWindowHours,
  countdownParts,
  showLowStock,
  lowStockDisplayCount,
  lowStockLimit,
  showEstimatedDelivery,
  showPreOrder,
  storefrontCurrency,
}: ConversionLabelsInput) => {
  const countdownStyle = normalizeCountdownStyle(
    typeof sectionSettings?.countdownStyle === 'string'
      ? sectionSettings.countdownStyle
      : ui['countdownStyle'],
  );
  const countdownLabel = resolveDirectionalCopy({
    value: sectionSettings?.countdownLabel || countdown['label'],
    englishFallback: 'Offer ends in',
    arabicFallback: 'ينتهي العرض خلال',
    prefersArabicCopy,
  });
  const lowStockLabel =
    (typeof sectionSettings?.lowStockLabel === 'string' &&
      sectionSettings.lowStockLabel.trim()) ||
    (prefersArabicCopy ? 'الكمية محدودة' : 'Low Stock');
  const lowStockStyle = normalizeLowStockStyle(
    typeof sectionSettings?.lowStockStyle === 'string'
      ? sectionSettings.lowStockStyle
      : ui['lowStockStyle'],
  );
  const estimatedDeliveryLabel =
    (typeof sectionSettings?.estimatedDeliveryLabel === 'string' &&
      sectionSettings.estimatedDeliveryLabel.trim()) ||
    resolveDirectionalCopy({
      value: estimatedDelivery['label'],
      englishFallback: 'Estimated delivery',
      arabicFallback: 'موعد التوصيل المتوقع',
      prefersArabicCopy,
    });
  const estimatedDeliveryStyle = normalizeEstimatedDeliveryStyle(
    typeof sectionSettings?.estimatedDeliveryStyle === 'string'
      ? sectionSettings.estimatedDeliveryStyle
      : ui['estimatedDeliveryStyle'],
  );
  const fakeVisitorMessage = interpolateCount(
    sectionSettings?.fakeVisitorMessage || copy['fakeVisitorMessage'],
    viewerCount,
    prefersArabicCopy
      ? `${viewerCount} شخص يشاهدون هذا المنتج الآن`
      : `${viewerCount} people are viewing this right now`,
  );
  const fakeVisitorStyle = normalizeFakeVisitorStyle(
    typeof sectionSettings?.fakeVisitorStyle === 'string'
      ? sectionSettings.fakeVisitorStyle
      : ui['fakeVisitorStyle'],
  );
  const soldCounterMessage = interpolateCount(
    sectionSettings?.soldCounterMessage || copy['soldCounterMessage'],
    soldCount,
    prefersArabicCopy ? `تم بيع هذا المنتج ${soldCount} مرة` : `Sold ${soldCount} times`,
  );
  const soldCounterStyle = normalizeSoldCounterStyle(
    typeof sectionSettings?.soldCounterStyle === 'string'
      ? sectionSettings.soldCounterStyle
      : ui['soldCounterStyle'],
  );
  const purchaseFomoMessage = interpolateTemplate(
    sectionSettings?.purchaseFomoMessage ||
      (purchaseFomoSource === 'active_carts'
        ? copy['purchaseFomoCartMessage']
        : purchaseFomoSource === 'recent_orders'
          ? copy['purchaseFomoRecentMessage']
          : copy['purchaseFomoWaitlistMessage']),
    {
      count: purchaseFomoCount,
      hours:
        purchaseFomoSource === 'recent_orders'
          ? purchaseFomoRecentPurchaseWindowHours
          : purchaseFomoCartWindowHours,
    },
    purchaseFomoSource === 'active_carts'
      ? prefersArabicCopy
        ? `${purchaseFomoCount} عميل أضافوا هذا المنتج إلى سلتهم الآن`
        : `${purchaseFomoCount} shoppers currently have this in their cart`
      : purchaseFomoSource === 'recent_orders'
        ? prefersArabicCopy
          ? `${purchaseFomoCount} طلب تضمّن هذا المنتج خلال الساعات الأخيرة`
          : `${purchaseFomoCount} orders included this product in the last hours`
        : prefersArabicCopy
          ? `${purchaseFomoCount} عميل طلبوا تنبيهًا عند عودة المنتج`
          : `${purchaseFomoCount} shoppers asked to be notified when this product returns`,
  );
  const purchaseFomoStyle = normalizePurchaseFomoStyle(
    typeof sectionSettings?.purchaseFomoStyle === 'string'
      ? sectionSettings.purchaseFomoStyle
      : ui['purchaseFomoStyle'],
  );
  const trustedBadgeItems = parseBadgeItems(
    (isPcHubTheme ? product?.['trustedBadgeItems'] : undefined) ||
      sectionSettings?.trustedBadgeItems ||
      copy['trustedBadgeItems'],
  );
  const trustedBadgeStyleSource =
    typeof sectionSettings?.trustedBadgeStyle === 'string'
      ? sectionSettings.trustedBadgeStyle
      : ui['trustedBadgeStyle'];
  const trustedBadgeStyle =
    trustedBadgeStyleSource === 'grid' ||
    trustedBadgeStyleSource === 'minimal' ||
    trustedBadgeStyleSource === 'perfume-minimal'
      ? trustedBadgeStyleSource
      : 'strip';

  const backInStockStyle = normalizeBackInStockStyle(
    typeof sectionSettings?.['backInStockStyle'] === 'string'
      ? (sectionSettings['backInStockStyle'] as string)
      : (ui['backInStockStyle'] as string),
  );

  const countdownSummary = countdownParts
    ? prefersArabicCopy
      ? `${countdownParts.days > 0 ? `${countdownParts.days} يوم ` : ''}${countdownParts.hours} ساعة ${countdownParts.minutes} دقيقة متبقية`
      : `${countdownParts.days > 0 ? `${countdownParts.days}d ` : ''}${countdownParts.hours}h ${countdownParts.minutes}m left`
    : '';

  const lowStockProgress =
    showLowStock && lowStockDisplayCount !== null
      ? Math.max(
          8,
          Math.min(
            100,
            Math.round(
              (lowStockDisplayCount /
                Math.max(lowStockLimit, Math.max(lowStockDisplayCount, 1))) *
                100,
            ),
          ),
        )
      : 0;

  const storefrontLocale = resolveDateLocale(storefrontCurrency || 'EGP');
  const deliveryRange = showEstimatedDelivery
    ? formatDateRange(
        Number(estimatedDelivery['minDays'] || 2),
        Number(estimatedDelivery['maxDays'] || 4),
        storefrontLocale,
      )
    : '';

  const preOrderDate =
    showPreOrder && product?.['preOrderDate']
      ? new Intl.DateTimeFormat(storefrontLocale, {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }).format(new Date(String(product['preOrderDate'])))
      : '';

  const preOrderTitle = String(
    commerceCopy['preOrderLabel'] ||
      (prefersArabicCopy ? 'متاح للطلب المسبق' : 'Available for pre-order'),
  );

  const preOrderDescription = String(
    product?.['preOrderMessage'] ||
      (preOrderDate
        ? prefersArabicCopy
          ? `التوفر المتوقع تقريبًا في ${preOrderDate}.`
          : `Expected availability around ${preOrderDate}.`
        : prefersArabicCopy
          ? 'احجز المنتج قبل وصوله.'
          : 'Reserve your item before it arrives.'),
  );

  return {
    countdownStyle,
    countdownLabel,
    lowStockLabel,
    lowStockStyle,
    estimatedDeliveryLabel,
    estimatedDeliveryStyle,
    fakeVisitorMessage,
    fakeVisitorStyle,
    soldCounterMessage,
    soldCounterStyle,
    purchaseFomoMessage,
    purchaseFomoStyle,
    trustedBadgeItems,
    trustedBadgeStyle,
    backInStockStyle,
    countdownSummary,
    lowStockProgress,
    deliveryRange,
    preOrderDate,
    preOrderTitle,
    preOrderDescription,
  };
};
