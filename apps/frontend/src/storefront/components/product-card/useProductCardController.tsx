import React, { CSSProperties, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useStorefrontSettings } from '../../hooks/useStorefrontSettings';
import { useStorefrontTheme } from '../../engine/ThemeProvider';
import { useStorefrontFacebookTracking } from '../../hooks/useStorefrontFacebookTracking';
import { isPharmacyThemeId } from '../../utils/pharmacyThemes';
import {
  getPrimaryProductImage,
  getProductImageCandidates,
} from '../../utils/productImages';
import { getProductVolumeDiscounts } from '../../utils/volumeDiscounts';
import { sanitizeProductCopy, truncateProductCopy } from '../../utils/productCopy';
import {
  navigateStorefrontDocument,
  shouldStorefrontForceDocumentNavigation,
} from '../../utils/navigationGuards';
import {
  fetchStorefrontProduct,
  getStorefrontProductQueryKey,
} from '../../hooks/useProduct';
import { formatStorefrontCurrency } from '../../utils/currency';
import { buildStorefrontPath } from '../../utils/paths';
import {
  normalizeColorString,
  translateZenCategoryLabel,
  translateRtlRetailCategoryLabel,
} from './productCardHelpers';
import type {
  ProductCardController,
  ProductCardProps,
} from './productCardTypes';

export const useProductCardController = (
  props: ProductCardProps,
): ProductCardController => {
  const {
    product,
    variant = 'standard',
    styleOverrides,
    quickViewLabel,
    addToWishlistLabel,
    imageLoading,
    imageFetchPriority,
  } = props;

  const { id, name, price, slug } = product;
  const { addItem } = useCartStore();
  const { toggleItem, hasItem } = useWishlistStore();
  const { settings } = useStorefrontSettings();
  const { trackAddToCartEvent } = useStorefrontFacebookTracking();
  const { theme } = useStorefrontTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [isHovered, setIsHovered] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const isAirlume = theme.id === 'airlume-ai';
  const isSoleaFemme = theme.id === 'solea-femme';
  const isFakhama = theme.id === 'fakhama-elite';
  const isDistrictMarket = theme.id === 'district-market';
  const isPerfumeEg = theme.id === 'perfume-eg';
  const isVelaFashion = theme.id === 'vela-fashion-eg';
  const isFastlyTheme = theme.id === 'fastly-eg';
  const isZenOrganic = theme.id === 'zen-organic';
  const isBiteRush = theme.id === 'restaurant-demo';
  const isCafeDemo = theme.id === 'cafe-demo';
  const isClosetOs = theme.id === 'closet-os';
  const isElegantLuxe = theme.id === 'elegant-luxe';
  const isKhemetLuxe = theme.id === 'khemet-luxe-eg';
  const isButcherCounter = theme.id === 'butcher-counter-eg';
  const isPharmacy = isPharmacyThemeId(theme.id);
  const isRedLine = theme.id === 'redline-auto';

  const storefrontSettings = settings?.storefront?.settings;
  const shouldForceDocumentNavigation = shouldStorefrontForceDocumentNavigation(
    theme.id,
    true,
  );

  const features = settings?.storefront?.storefrontFeatures || {
    quickViewEnabled: true,
    wishlistEnabled: true,
    comparisonEnabled: false,
    gridAddToCartIcon: false,
    gridDiscountBanner: false,
  };

  const currency =
    settings?.storefront?.settings?.currency ||
    settings?.company?.currency ||
    'EGP';

  const productRouteBase = isVelaFashion ? '/products' : '/product';
  const productPath = buildStorefrontPath(
    location.pathname,
    `${productRouteBase}/${slug || id}`,
    location.search,
  );

  const queryClient = useQueryClient();
  const prefetchTarget = slug || id;

  const handlePrefetch = React.useCallback(() => {
    if (!prefetchTarget) return;

    const queryKey = getStorefrontProductQueryKey(prefetchTarget);
    if (!queryClient.getQueryData(queryKey) && product) {
      queryClient.setQueryData(queryKey, product);
    }
    void queryClient.prefetchQuery({
      queryKey,
      queryFn: () => fetchStorefrontProduct(prefetchTarget),
      staleTime: 60 * 1000,
    });
  }, [queryClient, prefetchTarget, product]);

  const isRtl = theme?.direction === 'rtl';
  const hasVariantChoices = Boolean(product.productVariants?.length);
  const stockQuantity =
    typeof product.stock === 'number'
      ? product.stock
      : typeof product.inventory === 'number'
        ? product.inventory
        : typeof product.quantity === 'number'
          ? product.quantity
          : null;

  const isBackorderAllowed =
    product.allowBackorders === true ||
    (product.metadata as any)?.allowBackorders === true ||
    product.trackInventory === false ||
    Boolean(product.isPreOrder);
  const isStockTracked = product.trackInventory !== false;

  const hasInStockVariant = hasVariantChoices
    ? (product.productVariants || []).some(
        (v) =>
          v.trackInventory === false ||
          v.allowBackorders === true ||
          (v.metadata as any)?.allowBackorders === true ||
          (typeof v.stock === 'number' ? v.stock > 0 : true),
      )
    : true;

  const isStrictlyOutOfStock = hasVariantChoices
    ? !hasInStockVariant && !isBackorderAllowed
    : isStockTracked &&
      stockQuantity !== null &&
      stockQuantity <= 0 &&
      !isBackorderAllowed;

  const isLowStock =
    !isStrictlyOutOfStock &&
    stockQuantity !== null &&
    stockQuantity > 0 &&
    stockQuantity <= 5;

  const openProductPath = () => {
    if (shouldForceDocumentNavigation) {
      navigateStorefrontDocument(productPath);
      return;
    }
    navigate(productPath);
  };

  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  const numericComparePrice =
    typeof product.comparePrice === 'string'
      ? parseFloat(product.comparePrice)
      : product.comparePrice;

  const hasDiscount =
    typeof numericComparePrice === 'number' &&
    Number.isFinite(numericComparePrice) &&
    numericComparePrice > numericPrice;

  const discountPercentage =
    hasDiscount && typeof numericComparePrice === 'number'
      ? Math.round(
          ((numericComparePrice - numericPrice) / numericComparePrice) * 100,
        )
      : null;

  const formattedPrice = formatStorefrontCurrency(numericPrice, currency);
  const formattedComparePrice =
    hasDiscount && typeof numericComparePrice === 'number'
      ? formatStorefrontCurrency(numericComparePrice, currency)
      : null;

  const savingsAmount =
    hasDiscount && typeof numericComparePrice === 'number'
      ? numericComparePrice - numericPrice
      : null;
  const formattedSavings =
    savingsAmount && savingsAmount > 0
      ? formatStorefrontCurrency(savingsAmount, currency)
      : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isStrictlyOutOfStock) {
      toast.error(
        isRtl
          ? 'عذرًا، نفدت كمية هذا المنتج حاليًا.'
          : 'Sorry, this product is currently out of stock.',
      );
      return;
    }

    if (hasVariantChoices) {
      setIsQuickViewOpen(true);
      return;
    }

    addItem({
      productId: id,
      name,
      price: numericPrice,
      basePrice: numericPrice,
      comparePrice:
        typeof numericComparePrice === 'number' ? numericComparePrice : undefined,
      quantity: 1,
      imageUrl: getPrimaryProductImage(product),
      volumeDiscounts: getProductVolumeDiscounts(product),
    });

    trackAddToCartEvent({
      id,
      name,
      price: numericPrice,
      quantity: 1,
      category: product.category?.name,
    });
  };

  const handleQuickBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isStrictlyOutOfStock) {
      toast.error(
        isRtl
          ? 'عذرًا، نفدت كمية هذا المنتج حاليًا.'
          : 'Sorry, this product is currently out of stock.',
      );
      return;
    }

    if (hasVariantChoices) {
      setIsQuickViewOpen(true);
      return;
    }

    addItem(
      {
        productId: id,
        name,
        price: numericPrice,
        basePrice: numericPrice,
        comparePrice:
          typeof numericComparePrice === 'number' ? numericComparePrice : undefined,
        quantity: 1,
        imageUrl: getPrimaryProductImage(product),
        volumeDiscounts: getProductVolumeDiscounts(product),
      },
      { openCart: false },
    );

    trackAddToCartEvent({
      id,
      name,
      price: numericPrice,
      quantity: 1,
      category: product.category?.name,
    });

    const targetCheckoutPath = buildStorefrontPath(
      location.pathname,
      '/checkout',
      location.search,
    );
    if (shouldForceDocumentNavigation) {
      navigateStorefrontDocument(targetCheckoutPath);
      return;
    }

    navigate(targetCheckoutPath);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(id);
  };

  const isWishlisted = hasItem(id);

  const ratingValue = (() => {
    const directRating =
      typeof product.rating === 'number'
        ? product.rating
        : typeof product.rating === 'string'
          ? parseFloat(product.rating)
          : typeof product.reviewSummary?.averageRating === 'number'
            ? product.reviewSummary.averageRating
            : typeof product.reviewAverage === 'number'
              ? product.reviewAverage
              : null;
    return typeof directRating === 'number' && Number.isFinite(directRating)
      ? directRating
      : null;
  })();

  const reviewCount = (() => {
    const directCount =
      typeof product.reviewCount === 'number'
        ? product.reviewCount
        : typeof product.reviewsCount === 'number'
          ? product.reviewsCount
          : typeof product.ratingCount === 'number'
            ? product.ratingCount
            : typeof product.reviewSummary?.totalReviews === 'number'
              ? product.reviewSummary.totalReviews
              : null;
    return typeof directCount === 'number' && Number.isFinite(directCount)
      ? directCount
      : null;
  })();

  const imageCandidates = getProductImageCandidates(product);
  const prefersArabicCopy =
    isRtl ||
    isRedLine ||
    isZenOrganic ||
    isAirlume ||
    isFakhama ||
    isButcherCounter;

  const productCategorySlug = String(
    product.category?.slug || product.categoryId || product.category?.name || '',
  )
    .trim()
    .toLowerCase();
  const isVelaAccessoryDrivenCard =
    isVelaFashion && ['bags', 'accessories'].includes(productCategorySlug);

  const categoryLabel =
    typeof product.category?.name === 'string' && product.category.name.trim()
      ? isZenOrganic
        ? translateZenCategoryLabel(product.category.name.trim())
        : isRtl
          ? translateRtlRetailCategoryLabel(product.category.name.trim())
          : product.category.name.trim()
      : typeof product.categoryId === 'string' && product.categoryId.trim()
        ? isZenOrganic
          ? translateZenCategoryLabel(product.categoryId.trim())
          : isRtl
            ? translateRtlRetailCategoryLabel(product.categoryId.trim())
            : product.categoryId.trim()
        : isSoleaFemme
          ? 'اختيار Solea'
          : isAirlume
            ? 'Airlume Select'
            : isZenOrganic
              ? 'اختيار طبيعي'
              : isRtl
                ? 'اختيار مميز'
                : 'Featured Item';

  const finalQuickViewLabel =
    quickViewLabel || (isRtl ? 'نظرة سريعة' : 'Quick View');
  const finalWishlistLabel =
    addToWishlistLabel || (isRtl ? 'أضف للمفضلة' : 'Add to Wishlist');

  const detailLabel = isBiteRush
    ? 'شاهد الوجبة'
    : isCafeDemo
      ? 'شاهد التفاصيل'
      : isPharmacy
        ? 'شاهد التفاصيل'
        : isButcherCounter
          ? 'تجهيز القطعية'
          : isSoleaFemme || isFakhama
            ? 'شاهدي التفاصيل'
            : isAirlume || isZenOrganic || isRtl
              ? 'شاهد التفاصيل'
              : 'View details';

  const actionLabel = isStrictlyOutOfStock
    ? isRtl
      ? 'نفدت الكمية'
      : 'Sold out'
    : isVelaFashion
      ? 'Add to cart'
      : hasVariantChoices
        ? isBiteRush
          ? 'اختر الإضافات'
          : isCafeDemo
            ? 'اختر الخيارات'
            : isPharmacy
              ? 'اختر التفاصيل'
              : isButcherCounter
                ? 'تجهيز الطلب'
                : isPerfumeEg
                  ? 'اختاري الحجم'
                  : isSoleaFemme || isFakhama
                    ? 'اختاري المقاس'
                    : isAirlume
                      ? 'اختر الخيارات'
                      : isZenOrganic
                        ? 'اختَر الخيار'
                        : isRtl
                          ? 'اختر الخيارات'
                          : 'Choose options'
        : isBiteRush
          ? 'أضف للطلب'
          : isCafeDemo
            ? 'أضف للسلة'
            : isPharmacy
              ? 'أضف للسلة'
              : isButcherCounter
                ? 'احجز القطعة'
                : isSoleaFemme || isFakhama
                  ? 'أضيفي للسلة'
                  : isAirlume || isZenOrganic
                    ? 'أضف للسلة'
                    : isRtl
                      ? 'أضف للسلة'
                      : 'Add to cart';

  const resolvedImageLoading =
    imageLoading ||
    (isVelaFashion &&
    (variant === 'retail-direct' ||
      variant === 'pastel-fashion' ||
      variant === 'standard' ||
      variant === 'minimal')
      ? 'eager'
      : 'lazy');

  const resolvedImageFetchPriority =
    imageFetchPriority ||
    (resolvedImageLoading === 'eager' ? 'high' : undefined);

  const productDescription = sanitizeProductCopy(product.description);
  const shopperSummary = productDescription
    ? truncateProductCopy(productDescription, 118)
    : hasDiscount
      ? isRtl
        ? 'عرض محدود على هذه القطعة مع سعر أوضح قبل اتخاذ قرار الشراء.'
        : 'Limited-time savings on this item with a clearer price before checkout.'
      : isRtl
        ? 'تفاصيل مختصرة تساعدك على المقارنة السريعة قبل فتح صفحة المنتج.'
        : 'Quick details that help you compare before opening the full product page.';

  const listSummary = productDescription
    ? truncateProductCopy(productDescription, 96)
    : hasDiscount
      ? isRtl
        ? `عرض مباشر مع خصم ${discountPercentage}% على قطعة مطلوبة.`
        : `Limited-time offer with ${discountPercentage}% off on a popular item.`
      : isRtl
        ? 'ملخص سريع يساعدك على مقارنة السعر والتفاصيل قبل الدخول للمنتج.'
        : 'A quick summary to compare price and details before opening the product.';

  const luxuryTopBadge = isElegantLuxe
    ? String((product as any)['editorialBadge'] || 'اختيار الصالون')
    : isPerfumeEg
      ? 'زجاجة أصلية'
      : 'Signature';
  const luxuryAssistLabel = isElegantLuxe
    ? 'منسق للدار'
    : isPerfumeEg
      ? 'حجم واضح'
      : 'Curated';
  const luxurySummary = isElegantLuxe
    ? shopperSummary
    : isPerfumeEg
      ? shopperSummary
      : hasDiscount
        ? `قطعة مميزة بخصم ${discountPercentage}% مع حضور بصري أقوى للمنتجات الفاخرة.`
        : 'صياغة أنيقة لعرض المنتجات premium داخل القوالب ذات الطابع الراقي.';

  const cutlineClubRailCode =
    String(slug || id || '')
      .replace(/[^a-z0-9]/gi, '')
      .slice(-6)
      .toUpperCase() || 'CLUB05';
  const cutlineClubPosterTag =
    hasDiscount && discountPercentage
      ? `DROP ${discountPercentage}%`
      : hasVariantChoices
        ? 'SET READY'
        : 'POSTER MODE';
  const cutlineClubListSummary = productDescription
    ? truncateProductCopy(productDescription, 110)
    : hasDiscount && discountPercentage
      ? isRtl
        ? `خصم ${discountPercentage}% على قطعة جاهزة للدخول في اللوك بسرعة من غير لف طويل.`
        : `${discountPercentage}% off on a ready piece built for a fast styling decision.`
      : hasVariantChoices
        ? isRtl
          ? 'راجع المقاس واللون بسرعة ثم كمّل باقي اللوك من نفس الريل.'
          : 'Check the fit fast, then build the rest of the look from the same rail.'
        : isRtl
          ? 'قطعة مباشرة وواضحة للفرز السريع داخل ريل الشارع.'
          : 'A direct, easy-to-scan piece inside the street rail.';

  const closetOsSlotLabel = hasVariantChoices
    ? isRtl
      ? 'خانة قابلة للتبديل'
      : 'Flexible slot'
    : isRtl
      ? 'أساس متكرر'
      : 'Repeat core';
  const closetOsCareLabel =
    hasDiscount && discountPercentage
      ? isRtl
        ? `وفر ${discountPercentage}%`
        : `Save ${discountPercentage}%`
      : isRtl
        ? 'غسيل بارد'
        : 'Wash cold';
  const closetOsPlannerSummary = productDescription
    ? truncateProductCopy(productDescription, 102)
    : hasVariantChoices
      ? isRtl
        ? 'راجع اللون والمقاس ثم حرك القطعة داخل أيام الأسبوع بسهولة.'
        : 'Check the fit and move the piece across the week with ease.'
      : isRtl
        ? 'قطعة هادئة تخدم أكثر من يوم من غير ما تفقد وضوحها.'
        : 'A calm piece built to work across more than one day.';

  const carryColorOptions = (() => {
    const seen = new Set<string>();
    const options: string[] = [];

    (product.productVariants || []).forEach((productVariant) => {
      const attrValues = (productVariant as any).attributeValues;
      const rawColor =
        productVariant.attributes?.['اللون'] ||
        productVariant.attributes?.color ||
        productVariant.attributes?.Color ||
        attrValues?.['اللون'] ||
        attrValues?.color ||
        attrValues?.Color ||
        productVariant.name ||
        '';

      const colorStr = String(rawColor).trim();
      if (!colorStr) return;

      const parts = colorStr
        .split(/\s*[-/|,]\s*/)
        .map((p) => p.trim())
        .filter(Boolean);
      let detectedColor = colorStr;
      if (parts.length > 1) {
        const knownColors = [
          'ابيض',
          'اسود',
          'بيج',
          'احمر',
          'ازرق',
          'اخضر',
          'بني',
          'رمادي',
          'وردي',
          'كحلي',
          'اوف',
          'عنابي',
          'white',
          'black',
          'beige',
          'red',
          'blue',
          'green',
          'brown',
          'gray',
          'grey',
          'pink',
          'navy',
        ];
        const found = parts.find((p) => {
          const norm = normalizeColorString(p);
          return knownColors.some((kc) => norm.includes(kc));
        });
        if (found) {
          detectedColor = found;
        } else if (!/^\d+$/.test(parts[0])) {
          detectedColor = parts[0];
        }
      }

      const norm = normalizeColorString(detectedColor);
      if (norm && !seen.has(norm)) {
        seen.add(norm);
        options.push(detectedColor);
      }
    });

    return options.slice(0, 3);
  })();

  const carrySizeOptions = Array.from(
    new Set(
      (product.productVariants || [])
        .map((productVariant) =>
          String(
            productVariant.attributes?.['الحجم'] ||
              productVariant.attributes?.['المقاس'] ||
              productVariant.attributes?.size ||
              productVariant.attributes?.Size ||
              '',
          ).trim(),
        )
        .filter(Boolean),
    ),
  ).slice(0, 2);

  const carryCardSummary = productDescription
    ? truncateProductCopy(productDescription, 86)
    : hasVariantChoices
      ? isRtl
        ? 'اختاري اللون أو الحجم ثم أضيفي القطعة الأنسب لحركتك اليومية أو السفر.'
        : 'Choose the right color or size, then add the piece that fits daily carry or travel.'
      : hasDiscount && discountPercentage
        ? isRtl
          ? `وفر ${discountPercentage}% على قطعة عملية جاهزة للدخول في السلة بسرعة.`
          : `Save ${discountPercentage}% on a practical piece ready to drop into cart.`
        : isRtl
          ? 'قطعة عملية بصور أوضح وخيارات أسرع قبل فتح صفحة المنتج.'
          : 'A practical piece with clearer imagery and faster decisions before opening the PDP.';

  const featuredBadgeLabel = isRtl ? 'اختيار مميز' : 'Featured';

  const editorialEyebrow = useMemo(() => {
    if (hasDiscount && discountPercentage) {
      return isAirlume || isZenOrganic || isRtl
        ? `وفر ${discountPercentage}%`
        : `Save ${discountPercentage}%`;
    }
    if (hasVariantChoices) {
      return isPerfumeEg
        ? 'أحجام متاحة'
        : isAirlume || isZenOrganic || isRtl
          ? 'خيارات متعددة'
          : 'Multiple options';
    }
    return isPerfumeEg
      ? 'اختيار موصى به'
      : isAirlume || isRtl
        ? 'اختيار اليوم'
        : isZenOrganic
          ? 'اختيار طبيعي'
          : 'Curated pick';
  }, [
    discountPercentage,
    hasDiscount,
    hasVariantChoices,
    isAirlume,
    isPerfumeEg,
    isRtl,
    isZenOrganic,
  ]);

  const renderImageFallback = (className = '') => (
    <div
      className={`flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_top,hsl(var(--background)),hsl(var(--muted))_68%)] px-4 text-center ${className}`}
    >
      <span className="inline-flex rounded-full border border-primary/10 bg-background/85 px-3 py-1 text-[11px] font-bold text-muted-foreground backdrop-blur">
        {categoryLabel}
      </span>
      <span className="mt-3 line-clamp-2 text-sm font-semibold text-foreground/85">
        {name}
      </span>
    </div>
  );

  const FloatingIcons: React.FC<{ forceVisible?: boolean }> = ({
    forceVisible = false,
  }) => (
    <div
      className={`absolute top-2 end-2 z-10 flex flex-col gap-2 transition-all duration-300 ${
        forceVisible || isHovered
          ? 'opacity-100 translate-x-0'
          : 'opacity-100 translate-x-0 md:opacity-0 md:translate-x-4 md:rtl:-translate-x-4'
      }`}
    >
      {features.wishlistEnabled && (
        <button
          onClick={handleWishlist}
          className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${
            isWishlisted
              ? isAirlume || isSoleaFemme
                ? 'bg-primary text-primary-foreground'
                : 'bg-rose-500 text-white'
              : isAirlume
                ? 'border border-white/70 bg-white/88 text-foreground hover:border-primary/30 hover:bg-background hover:text-primary'
                : isSoleaFemme
                  ? 'bg-background/92 text-foreground hover:bg-primary hover:text-primary-foreground'
                  : 'bg-white text-gray-900 shadow-md hover:text-rose-500'
          }`}
          title={finalWishlistLabel}
          aria-label={finalWishlistLabel}
        >
          <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
      )}
      {features.quickViewEnabled && (
        <button
          onClick={handleQuickView}
          className={`flex h-10 w-10 items-center justify-center rounded-full shadow-sm transition-all duration-300 hover:scale-110 active:scale-95 ${
            isAirlume
              ? 'border border-white/70 bg-white/88 text-foreground hover:border-primary/30 hover:bg-background hover:text-primary'
              : isSoleaFemme
                ? 'bg-background/92 text-foreground hover:bg-primary hover:text-primary-foreground'
                : 'bg-white text-gray-900 shadow-md hover:text-primary'
          }`}
          title={finalQuickViewLabel}
          aria-label={finalQuickViewLabel}
        >
          <Eye size={18} />
        </button>
      )}
    </div>
  );

  const productCardStyles = (overrides: CSSProperties = {}): CSSProperties => ({
    borderRadius: 'var(--product-card-radius, var(--radius))',
    boxShadow: isHovered
      ? 'var(--product-card-hover-shadow, var(--product-card-shadow))'
      : 'var(--product-card-shadow)',
    backgroundColor:
      'hsl(var(--card) / var(--product-card-surface-opacity, 1))',
    ...styleOverrides,
    ...overrides,
  });

  const productCardBadgeStyles: CSSProperties = {
    borderRadius: 'var(--product-card-badge-radius, 999px)',
  };

  const DiscountBadge: React.FC<{
    className?: string;
    showSavings?: boolean;
  }> = ({ className = '', showSavings = false }) => {
    if (isStrictlyOutOfStock) {
      return (
        <span
          style={productCardBadgeStyles}
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black shadow-sm bg-rose-600/95 text-white ${className}`}
        >
          {isRtl ? 'نفدت الكمية' : 'Sold out'}
        </span>
      );
    }

    if (!discountPercentage) return null;

    const shouldShowMonetarySavings =
      showSavings || (formattedSavings && (isRtl || prefersArabicCopy));

    return (
      <span
        style={productCardBadgeStyles}
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black shadow-sm ${
          isZenOrganic
            ? 'bg-[#88a876] text-white'
            : isAirlume
              ? 'border border-white/70 bg-white/92 text-slate-950'
              : 'bg-rose-600 text-white shadow-rose-500/20'
        } ${className}`}
      >
        {shouldShowMonetarySavings && formattedSavings
          ? isRtl
            ? `وفر ${formattedSavings}`
            : `Save ${formattedSavings}`
          : isZenOrganic
            ? `وفر ${discountPercentage}%`
            : `-${discountPercentage}%`}
      </span>
    );
  };

  const UrgencyBadge: React.FC<{ className?: string }> = ({
    className = '',
  }) => {
    if (!isLowStock || !stockQuantity) return null;

    return (
      <span
        style={productCardBadgeStyles}
        className={`inline-flex items-center gap-1 rounded-full bg-[#b84838]/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm backdrop-blur-sm tabular-nums ${className}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
        <span>
          {isRtl ? `باقي ${stockQuantity} فقط!` : `Only ${stockQuantity} left!`}
        </span>
      </span>
    );
  };

  const CardShell: React.FC<{
    children: React.ReactNode;
    className: string;
    style?: CSSProperties;
  }> = ({ children, className, style }) => (
    <Link
      to={productPath}
      reloadDocument={shouldForceDocumentNavigation}
      onMouseEnter={() => {
        setIsHovered(true);
        handlePrefetch();
      }}
      onTouchStart={handlePrefetch}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
      style={{ ...productCardStyles(style), touchAction: 'manipulation' }}
    >
      {children}
    </Link>
  );

  return {
    product,
    name: product.name,
    features,
    variant,
    theme,
    isRtl,
    settings,
    storefrontSettings,
    currency,
    productPath,
    shouldForceDocumentNavigation,
    styleOverrides,
    isAirlume,
    isSoleaFemme,
    isFakhama,
    isDistrictMarket,
    isPerfumeEg,
    isVelaFashion,
    isFastlyTheme,
    isZenOrganic,
    isBiteRush,
    isCafeDemo,
    isClosetOs,
    isElegantLuxe,
    isKhemetLuxe,
    isButcherCounter,
    isPharmacy,
    isRedLine,
    isVelaAccessoryDrivenCard,
    prefersArabicCopy,
    hasVariantChoices,
    stockQuantity,
    isStrictlyOutOfStock,
    isLowStock,
    formattedPrice,
    numericPrice,
    numericComparePrice,
    hasDiscount,
    discountPercentage,
    formattedComparePrice,
    savingsAmount,
    formattedSavings,
    ratingValue,
    reviewCount,
    imageCandidates,
    resolvedImageLoading,
    resolvedImageFetchPriority,
    renderImageFallback,
    FloatingIcons,
    DiscountBadge,
    UrgencyBadge,
    CardShell,
    productCardStyles,
    categoryLabel,
    finalQuickViewLabel,
    finalWishlistLabel,
    detailLabel,
    actionLabel,
    shopperSummary,
    listSummary,
    luxuryTopBadge,
    luxuryAssistLabel,
    luxurySummary,
    cutlineClubRailCode,
    cutlineClubPosterTag,
    cutlineClubListSummary,
    closetOsSlotLabel,
    closetOsCareLabel,
    closetOsPlannerSummary,
    carryColorOptions,
    carrySizeOptions,
    carryCardSummary,
    featuredBadgeLabel,
    editorialEyebrow,
    isHovered,
    setIsHovered,
    isQuickViewOpen,
    setIsQuickViewOpen,
    isWishlisted,
    handlePrefetch,
    openProductPath,
    handleAddToCart,
    handleQuickBuy,
    handleQuickView,
    handleWishlist,
  };
};
