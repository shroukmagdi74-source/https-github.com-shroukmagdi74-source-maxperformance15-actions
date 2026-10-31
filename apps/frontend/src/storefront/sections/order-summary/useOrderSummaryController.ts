import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useCartStore } from "../../store/useCartStore";
import { useCheckoutStore } from "../../store/useCheckoutStore";
import { useStorefrontSettings } from "../../hooks/useStorefrontSettings";
import { useMinimumOrderSettings } from "../../hooks/useMinimumOrderSettings";
import { useStorefrontTheme } from "../../engine/ThemeProvider";
import { formatStorefrontCurrency } from "../../utils/currency";
import { buildStorefrontPath } from "../../utils/paths";
import { isKhemetLuxeTheme } from "../../utils/navigationGuards";
import { storefrontApi } from "../../../utils/storefrontApi";
import { trackStorefrontAppUsage } from "../../utils/appUsageTracking";
import { useCheckoutShippingQuote } from "../../hooks/useCheckoutShippingQuote";
import {
  getStorefrontMarketplaceAppSettings,
  isStorefrontMarketplaceAppEnabled,
} from "../../utils/marketplaceApps";
import {
  getActiveStorePromotionFromCompany,
  calculateStorePromotionDiscount,
} from "../../utils/storePromotion";
import {
  OrderSummaryProps,
  StorefrontSettingsRecord,
  normalizeVariant,
  parseBooleanSetting,
  parseListSetting,
  parsePositiveNumber,
  isSameAmount,
  replaceCurrencyToken,
  resolveDirectionalFreeShippingCopy,
  getCouponValidationMessage,
  getPersistedCartItemCount,
  getWrapperClassName,
  DEFAULT_FREE_SHIPPING_MESSAGE_VARIANTS,
  DEFAULT_FREE_SHIPPING_REACHED_VARIANTS,
} from "./types";

export function useOrderSummaryController({
  section,
  settings: sectionSettings,
}: OrderSummaryProps) {
  const couponFieldId = React.useId();
  const [couponCode, setCouponCode] = useState("");
  const [isCouponLoading, setIsCouponLoading] = useState(false);
  const location = useLocation();

  const { items, getSubtotal, hasQuantityOfferFreeShipping, updateQuantity } =
    useCartStore();
  const persistedCartItemCount =
    items.length === 0 ? getPersistedCartItemCount() : 0;
  const {
    appliedCoupon,
    setAppliedCoupon,
    clearAppliedCoupon,
    paymentMethod,
    pendingCouponCode,
    setPendingCouponCode,
  } = useCheckoutStore();
  const { settings: storefrontSettings } = useStorefrontSettings();
  const { theme } = useStorefrontTheme();

  const isAirlume = theme.id === "airlume-ai";
  const isZenOrganic = theme.id === "zen-organic";
  const isBiteRush = theme.id === "restaurant-demo";
  const isSproutRoom = theme.id === "elessi-sprout-room";
  const isWomenFashionSummary = theme.id === "women-fashion-eg";
  const isKhemetLuxe = isKhemetLuxeTheme(theme.id);
  const checkoutPath = buildStorefrontPath(
    location.pathname,
    "/checkout",
    location.search,
  );
  const subtotal = getSubtotal();
  const quantityOfferFreeShippingActive = hasQuantityOfferFreeShipping();
  const currency =
    storefrontSettings?.storefront?.settings?.currency ||
    storefrontSettings?.company?.currency ||
    "EGP";
  const minimumOrder = useMinimumOrderSettings(subtotal, currency);
  const prefersArabicCopy = theme.direction === "rtl";
  const variant = normalizeVariant(section?.variant);
  const isMarketSummary = variant === "market-summary";
  const isNatureSummary = variant === "nature-summary";
  const isCommandSummary = variant === "command-summary";
  const isBoutiqueSummary = variant === "boutique-summary";
  const isFittingRoomSummary = variant === "fitting-room-summary";
  const hasNatureSummaryTone = isZenOrganic || isNatureSummary;
  const hasEnhancedSummaryTone =
    isCommandSummary ||
    isBoutiqueSummary ||
    isFittingRoomSummary ||
    isMarketSummary ||
    isNatureSummary;
  const activeCoupon =
    appliedCoupon &&
    isSameAmount(Number(appliedCoupon.orderAmount || 0), subtotal)
      ? appliedCoupon
      : null;
  const storePromotion = getActiveStorePromotionFromCompany(
    storefrontSettings?.company,
  );
  const { discount: storePromotionDiscount, tier: storePromotionTier } =
    calculateStorePromotionDiscount(items, storePromotion);
  const couponDiscount = storePromotion?.disableOtherDiscounts
    ? 0
    : Number(activeCoupon?.discountAmount || 0);

  // Loyalty rewards
  const tierProgress = useCheckoutStore((s) => s.tierProgress);
  const tiersEnabled = tierProgress?.tiersEnabled === true;
  const autoDiscountEnabled = tierProgress?.autoDiscountEnabled === true;
  const loyaltyFreeShipping = tiersEnabled
    ? Boolean(tierProgress?.rewards?.freeShipping)
    : false;
  const loyaltyDiscountPercent = tiersEnabled
    ? Number(tierProgress?.rewards?.discountPercent || 0)
    : 0;
  let loyaltyDiscount =
    loyaltyDiscountPercent > 0
      ? (Number(subtotal) || 0) * (loyaltyDiscountPercent / 100)
      : 0;
  let voucherDiscount =
    autoDiscountEnabled && tierProgress?.activeVoucher
      ? (Number(subtotal) || 0) *
        (Number(tierProgress.activeVoucher.percent) / 100)
      : 0;

  const combination = tierProgress?.discountCombination || "ADDITIVE";
  const maxTotalPct = Number(tierProgress?.maxTotalDiscountPercent || 0);
  const base = Number(subtotal) || 0;
  let combined = 0;
  if (combination === "BEST") {
    combined = Math.max(loyaltyDiscount, voucherDiscount);
  } else if (combination === "COMPOUND") {
    const lp = base > 0 ? (loyaltyDiscount / base) * 100 : 0;
    const vp = base > 0 ? (voucherDiscount / base) * 100 : 0;
    combined = base * (1 - (1 - lp / 100) * (1 - vp / 100));
  } else {
    combined = loyaltyDiscount + voucherDiscount;
  }
  if (maxTotalPct > 0) {
    const cap = base * (maxTotalPct / 100);
    if (combined > cap) combined = cap;
  }
  if (combined !== loyaltyDiscount + voucherDiscount) {
    loyaltyDiscount = combined;
    voucherDiscount = 0;
  }

  const conversionEnabled = isStorefrontMarketplaceAppEnabled(
    storefrontSettings,
    "conversion-suite",
  );
  const conversionSettings = getStorefrontMarketplaceAppSettings(
    storefrontSettings,
    "conversion-suite",
  );
  const modules = useMemo(
    () =>
      (conversionSettings["modules"] as StorefrontSettingsRecord | undefined) ||
      {},
    [conversionSettings],
  );
  const thresholds = useMemo(
    () =>
      (conversionSettings["thresholds"] as
        | StorefrontSettingsRecord
        | undefined) || {},
    [conversionSettings],
  );
  const copy = useMemo(
    () =>
      (conversionSettings["copy"] as StorefrontSettingsRecord | undefined) ||
      {},
    [conversionSettings],
  );
  const conversionFreeShippingEnabled =
    conversionEnabled &&
    modules["freeShippingBar"] !== false &&
    parsePositiveNumber(thresholds["freeShippingAmount"], 0) > 0;
  const freeShippingEnabled =
    quantityOfferFreeShippingActive || conversionFreeShippingEnabled;
  const freeShippingAmount = parsePositiveNumber(
    thresholds["freeShippingAmount"],
    0,
  );
  const freeShippingRemaining = quantityOfferFreeShippingActive
    ? 0
    : Math.max(freeShippingAmount - subtotal, 0);
  const freeShippingProgress = quantityOfferFreeShippingActive
    ? 100
    : freeShippingEnabled && freeShippingAmount > 0
      ? Math.min((subtotal / freeShippingAmount) * 100, 100)
      : 0;

  const showTrustRow = parseBooleanSetting(sectionSettings?.showTrustRow, true);
  const showCouponField =
    !storePromotion?.disableOtherDiscounts &&
    parseBooleanSetting(sectionSettings?.showCouponField, true);
  const showFreeShippingProgress = parseBooleanSetting(
    sectionSettings?.showFreeShippingProgress,
    freeShippingEnabled,
  );
  const hideCheckoutButton = parseBooleanSetting(
    sectionSettings?.hideCheckoutButton,
    false,
  );
  const shouldShowAssuranceCard =
    hasEnhancedSummaryTone && (!isWomenFashionSummary || !hideCheckoutButton);
  const shouldShowNextStepsCard =
    hasEnhancedSummaryTone && !isWomenFashionSummary;
  const shouldShowTrustSummaryRow =
    showTrustRow && (!isWomenFashionSummary || !hideCheckoutButton);

  const trustedItems = useMemo(
    () =>
      String(copy["trustedBadgeItems"] || "")
        .split(/,|\n/)
        .map((item) => item.trim())
        .filter(Boolean),
    [copy],
  );

  const title =
    typeof sectionSettings?.title === "string"
      ? sectionSettings.title
      : isBiteRush
        ? "مراجعة الطلب"
        : "ملخص السلة";
  const subtitle =
    typeof sectionSettings?.subtitle === "string"
      ? sectionSettings.subtitle
      : (() => {
          if (isSproutRoom) {
            return "إجمالي النباتات والإضافات المختارة مع شحن واضح وخطوة دفع أخيرة بسيطة.";
          }
          if (isBiteRush) {
            return "راجع الإجمالي، فعّل الخصم، ثم كمّل الطلب قبل ما يبرد.";
          }
          if (isMarketSummary) {
            return "ملخص واضح للسعر والشحن والخطوة التالية بطريقة مألوفة وسريعة.";
          }
          if (isNatureSummary) {
            return "ملخص هادئ يجمع السعر والشحن والخطوة التالية بدون ضوضاء بصرية.";
          }
          if (isCommandSummary) {
            return "سعر واضح، شحن محسوب، وخطوات متابعة ثابتة قبل اعتماد الطلب.";
          }
          if (isBoutiqueSummary) {
            return "ملخص هادئ يضم السعر والشحن والخطوة التالية من غير ازدحام بصري.";
          }
          return "ملخص مرتب يجمع السعر والشحن والكوبون في مكان واحد.";
        })();
  const shippingHelpText =
    sectionSettings?.shippingHelpText ||
    (isBiteRush
      ? "رسوم التوصيل تتثبت حسب المحافظة في خطوة الدفع التالية."
      : "سيظهر الشحن بعد اختيار المحافظة داخل صفحة الدفع.");
  const couponPlaceholder =
    sectionSettings?.couponPlaceholder ||
    (isBiteRush ? "عندك كود؟" : "كود الخصم");
  const couponButtonText =
    sectionSettings?.couponButtonText || (isBiteRush ? "فعّل" : "تطبيق");
  const checkoutButtonText =
    sectionSettings?.checkoutButtonText ||
    (isBiteRush ? "كمّل الطلب" : "إتمام الطلب");
  const subtotalLabel = sectionSettings?.subtotalLabel || "المجموع الفرعي";
  const shippingLabel = sectionSettings?.shippingLabel || "الشحن";
  const shippingValueText =
    sectionSettings?.shippingValueText || "يحسب عند الدفع";
  const totalLabel =
    sectionSettings?.totalLabel ||
    (isBiteRush ? "الإجمالي المتوقع الآن" : "الإجمالي المتوقع");
  const secureCheckoutText =
    sectionSettings?.secureCheckoutText ||
    (isBiteRush ? "إرسال آمن للطلب" : trustedItems[0]) ||
    "بياناتك محمية";
  const returnsText =
    sectionSettings?.returnsText ||
    (isBiteRush
      ? "دعم سريع لو احتجت تعديل"
      : trustedItems[trustedItems.length - 1]) ||
    "دعم سريع بعد الطلب";
  const freeShippingTitle =
    sectionSettings?.freeShippingTitle ||
    resolveDirectionalFreeShippingCopy({
      value: isBiteRush
        ? "أضف {{remaining}} للحصول على شحن مجاني"
        : copy["freeShippingMessage"],
      direction: prefersArabicCopy ? "rtl" : "ltr",
      rtlFallback: "أضف {{remaining}} للحصول على شحن مجاني",
      ltrFallback: "Add {{remaining}} to unlock free shipping",
      knownEnglishDefaults: DEFAULT_FREE_SHIPPING_MESSAGE_VARIANTS,
    });
  const freeShippingReachedText =
    sectionSettings?.freeShippingReachedText ||
    resolveDirectionalFreeShippingCopy({
      value: isBiteRush
        ? "رائع، تم تفعيل الشحن المجاني"
        : copy["freeShippingReachedMessage"],
      direction: prefersArabicCopy ? "rtl" : "ltr",
      rtlFallback: "رائع، تم تفعيل الشحن المجاني",
      ltrFallback: "You unlocked free shipping",
      knownEnglishDefaults: DEFAULT_FREE_SHIPPING_REACHED_VARIANTS,
    });
  const quantityOfferFreeShippingText =
    "تم تفعيل الشحن المجاني بواسطة عرض الكميات";
  const headerBadge =
    sectionSettings?.headerBadge !== undefined
      ? String(sectionSettings.headerBadge)
      : isSproutRoom
        ? "Order details"
        : isMarketSummary
          ? "مراجعة السلة"
          : isNatureSummary
            ? "خلاصة هادئة"
            : isCommandSummary
              ? "قرار الشراء"
              : isBoutiqueSummary
                ? "خلاصة الطلب"
                : undefined;
  const assuranceTitle =
    sectionSettings?.assuranceTitle ||
    (isSproutRoom
      ? "يشملك مع الطلب"
      : hasEnhancedSummaryTone
        ? "يشملك مع الطلب"
        : "نقاط ثقة");
  const assuranceItems = parseListSetting(sectionSettings?.assuranceItems, [
    ...(isSproutRoom
      ? [
          "تغليف مناسب للنباتات والأصص",
          "تأكيد المقاس أو ملاحظات الهدية قبل التجهيز",
          "دعم بعد الاستلام لو احتجت عناية إضافية",
        ]
      : isBoutiqueSummary
        ? [
            "تغليف مرتب يحافظ على القطعة أثناء الوصول",
            "مراجعة المقاس أو الملاحظة قبل التجهيز عند الحاجة",
            "متابعة واضحة حتى الاستلام",
          ]
        : isMarketSummary
          ? [
              "تأكيد واضح للعنوان ورقم الهاتف",
              "تثبيت تكلفة الشحن حسب المحافظة",
              "متابعة سريعة حتى الاستلام",
            ]
          : isNatureSummary
            ? [
                "تغليف مناسب للمنتجات الحساسة",
                "تأكيد هادئ للعناوين والملاحظات",
                "متابعة واضحة بعد الاستلام عند الحاجة",
              ]
            : [
                "تغليف محمي للأجهزة الحساسة",
                "ضمان مكتوب على القطع المعتمدة",
                "تأكيد هاتفي قبل الشحن عند الحاجة",
              ]),
  ]);
  const nextStepsTitle =
    sectionSettings?.nextStepsTitle ||
    (isSproutRoom
      ? "بعد تأكيد الطلب"
      : isMarketSummary
        ? "الخطوة التالية"
        : isNatureSummary
          ? "بعد المتابعة"
          : isCommandSummary
            ? "ما الذي يحدث بعد ذلك"
            : isBoutiqueSummary
              ? "بعد الضغط على المتابعة"
              : "الخطوة التالية");
  const nextSteps = parseListSetting(sectionSettings?.nextSteps, [
    ...(isSproutRoom
      ? [
          "نراجع العنوان والمقاس المطلوب قبل التجهيز",
          "نثبت تكلفة الشحن حسب المحافظة",
          "نرسل متابعة حتى التسليم أو الاستلام",
        ]
      : isBoutiqueSummary
        ? [
            "نراجع القطع والعنوان قبل التجهيز",
            "نثبت الشحن حسب المحافظة",
            "نرسل متابعة حتى الاستلام",
          ]
        : isMarketSummary
          ? [
              "نراجع العنوان قبل التنفيذ",
              "نثبت الشحن حسب المحافظة",
              "نرسل تحديثًا واضحًا حتى الاستلام",
            ]
          : isNatureSummary
            ? [
                "نراجع العنوان والملاحظات بهدوء",
                "نثبت الشحن النهائي بوضوح",
                "نتابع معك حتى التسليم",
              ]
            : [
                "نراجع الموديل والعنوان قبل التنفيذ",
                "نثبت تكلفة الشحن حسب المحافظة",
                "نرسل متابعة حتى الاستلام",
              ]),
  ]);

  const {
    shippingCost,
    freeShippingDiscount,
    shippingMessage,
    isShippingLoading,
    trimmedGovernorate,
    freeShippingActive: checkoutFreeShippingActive,
  } = useCheckoutShippingQuote({
    shippingPromptText: shippingHelpText,
    shippingCalculatedText: "تم حساب الشحن إلى {{governorate}} بنجاح.",
    noShippingChargeText: "لا توجد تكلفة شحن مضافة لهذه المحافظة حاليًا.",
    shippingErrorText: "تعذر حساب الشحن الآن وسيتم تأكيده مع الطلب.",
    storefrontLoadingText:
      hasNatureSummaryTone || isKhemetLuxe
        ? "سيتم حساب الشحن بمجرد اكتمال تحميل بيانات المتجر."
        : "Shipping will be calculated once storefront details finish loading.",
  });

  const effectiveShipping =
    loyaltyFreeShipping && Number(shippingCost) > 0 ? 0 : Number(shippingCost);

  const walletPaymentSettings = (storefrontSettings?.storefront?.settings?.[
    "walletPaymentSettings"
  ] as
    | {
        enabled?: boolean;
        walletNumber?: string;
        discountEnabled?: boolean;
        discountPercent?: number;
        showDiscountBadge?: boolean;
      }
    | undefined) || null;

  const dbEnabledMethods = useMemo(() => {
    const raw =
      storefrontSettings?.storefront?.storefrontFeatures?.enabledPaymentMethods ??
      (storefrontSettings?.storefront?.settings as any)?.enabledPaymentMethods ??
      (storefrontSettings as any)?.storefrontSettings?.enabledPaymentMethods ??
      (storefrontSettings as any)?.enabledPaymentMethods;
    if (Array.isArray(raw)) return raw.map(String);
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map(String);
      } catch {}
    }
    return ["cod"];
  }, [storefrontSettings]);

  const isWalletActiveInSettings =
    walletPaymentSettings?.enabled !== false &&
    dbEnabledMethods.includes("wallet");
  const isWalletAvailable =
    Boolean(walletPaymentSettings?.walletNumber) && isWalletActiveInSettings;
  const walletDiscountEnabled = Boolean(walletPaymentSettings?.discountEnabled);
  const walletDiscountPercent = Math.max(
    0,
    Number(walletPaymentSettings?.discountPercent || 0),
  );
  const walletDiscountActive =
    walletDiscountEnabled &&
    walletDiscountPercent > 0 &&
    (paymentMethod === "card" ||
      (paymentMethod === "wallet" && isWalletAvailable));
  const walletDiscount = walletDiscountActive
    ? (Number(subtotal) || 0) * (walletDiscountPercent / 100)
    : 0;

  const showLineItems = parseBooleanSetting(
    sectionSettings?.showLineItems,
    isFittingRoomSummary,
  );
  const lineItemsEditable = parseBooleanSetting(
    sectionSettings?.lineItemsEditable,
    true,
  );
  const lineItemsTitle =
    typeof sectionSettings?.lineItemsTitle === "string"
      ? sectionSettings.lineItemsTitle
      : prefersArabicCopy
        ? "المنتجات"
        : "Items";
  const showAssuranceCard = parseBooleanSetting(
    sectionSettings?.showAssuranceCard,
    shouldShowAssuranceCard,
  );
  const showNextStepsCard = parseBooleanSetting(
    sectionSettings?.showNextSteps,
    shouldShowNextStepsCard,
  );

  const estimatedTotal = Math.max(
    0,
    subtotal +
      effectiveShipping -
      couponDiscount -
      storePromotionDiscount -
      loyaltyDiscount -
      voucherDiscount -
      walletDiscount,
  );

  const resolvedFreeShippingText = quantityOfferFreeShippingActive
    ? quantityOfferFreeShippingText
    : freeShippingReachedText;

  const resolvedShippingValueText = (() => {
    if (quantityOfferFreeShippingActive) {
      return "مجاني عبر عرض الكميات";
    }

    if (!trimmedGovernorate) {
      return shippingValueText;
    }

    if (isShippingLoading) {
      return "جارٍ الحساب...";
    }

    if (checkoutFreeShippingActive) {
      return freeShippingDiscount > 0
        ? `-${formatStorefrontCurrency(freeShippingDiscount, currency)}`
        : "مجاني";
    }

    return formatStorefrontCurrency(shippingCost, currency);
  })();

  const resolvedShippingHelpText = shippingMessage || shippingHelpText;

  const wrapperClassName = `${getWrapperClassName(variant)}${
    isFittingRoomSummary
      ? " border-[#efe5dd] bg-white text-[#242220]"
      : isWomenFashionSummary
        ? " space-y-4 p-4 sm:p-5"
        : isBiteRush
          ? " border-[#f8c08c] bg-[linear-gradient(180deg,#fffaf4_0%,#fff1e4_100%)] shadow-[0_38px_110px_-78px_rgba(247,115,22,0.42)]"
          : isSproutRoom
            ? " border-[#d8e6d8] bg-white shadow-[0_28px_80px_-70px_rgba(32,53,40,0.18)]"
            : isAirlume
              ? " border-primary/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(239,246,255,0.82))] shadow-[0_38px_110px_-78px_hsl(var(--primary)/0.44)]"
              : isKhemetLuxe
                ? " bg-transparent shadow-none p-0"
                : hasNatureSummaryTone
                  ? " border-[#dbe3d4] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,247,242,0.96))] shadow-[0_38px_110px_-82px_rgba(26,51,40,0.32)]"
                  : isMarketSummary
                    ? " border-[#f0d4b0] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,247,239,0.96))] shadow-[0_38px_110px_-82px_rgba(154,93,34,0.16)]"
                    : isBoutiqueSummary
                      ? " border-[#ead8cf] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,248,246,0.96))] shadow-[0_38px_110px_-82px_rgba(107,33,49,0.16)]"
                      : ""
  }${isKhemetLuxe ? " min-h-[46rem] lg:min-h-0" : ""}`;

  const sectionClassName = `w-full ${
    isFittingRoomSummary
      ? "bg-[linear-gradient(180deg,#f5ece4_0%,#f7efe8_48%,#ffffff_100%)] py-6"
      : isSproutRoom
        ? "bg-[linear-gradient(180deg,#fbfaf5_0%,#eef5ea_42%,#ffffff_100%)]"
        : hasNatureSummaryTone
          ? "bg-[linear-gradient(180deg,#f8fbf7_0%,#eef5ea_42%,#ffffff_100%)]"
          : isMarketSummary
            ? "bg-[linear-gradient(180deg,#fffdf9_0%,#fff7ef_46%,#ffffff_100%)]"
            : isKhemetLuxe
              ? "bg-transparent"
              : isBoutiqueSummary
                ? "bg-[linear-gradient(180deg,#fffdfc_0%,#fff8f6_46%,#ffffff_100%)]"
                : "bg-background"
  }`;

  useEffect(() => {
    setCouponCode(activeCoupon?.code || "");
  }, [activeCoupon?.code]);

  useEffect(() => {
    if (
      appliedCoupon &&
      Number.isFinite(Number(appliedCoupon.orderAmount)) &&
      !isSameAmount(Number(appliedCoupon.orderAmount), subtotal)
    ) {
      clearAppliedCoupon();
    }
  }, [appliedCoupon, clearAppliedCoupon, subtotal]);

  // URL coupon auto-apply
  useEffect(() => {
    const codeToApply =
      pendingCouponCode ||
      new URLSearchParams(location.search).get("coupon") ||
      new URLSearchParams(location.search).get("apply_coupon");

    const companyId = storefrontSettings?.company?.id;

    if (
      codeToApply &&
      subtotal > 0 &&
      companyId &&
      (!appliedCoupon ||
        appliedCoupon.code !== codeToApply.trim().toUpperCase()) &&
      !isCouponLoading
    ) {
      const normalizedCode = codeToApply.trim().toUpperCase();
      setCouponCode(normalizedCode);
      void (async () => {
        try {
          setIsCouponLoading(true);
          const response = await storefrontApi.validateCoupon(
            companyId,
            normalizedCode,
            subtotal,
          );
          const coupon = response?.data?.coupon;
          if (coupon) {
            const discountAmount = Number(response?.data?.discountAmount || 0);
            const finalAmount = Number(response?.data?.finalAmount || subtotal);
            setAppliedCoupon({
              code: String(coupon.code || normalizedCode).trim().toUpperCase(),
              name: typeof coupon.name === "string" ? coupon.name : "",
              discountAmount,
              finalAmount,
              orderAmount: subtotal,
            });
            setPendingCouponCode(null);
            toast.success("تم تطبيق كوبون الخصم تلقائياً ✓");
          }
        } catch {
          // ignore error on auto-apply
        } finally {
          setIsCouponLoading(false);
        }
      })();
    }
  }, [
    subtotal,
    pendingCouponCode,
    storefrontSettings?.company?.id,
    appliedCoupon,
    isCouponLoading,
    location.search,
    setAppliedCoupon,
    setPendingCouponCode,
  ]);

  useEffect(() => {
    if (
      !showFreeShippingProgress ||
      !freeShippingEnabled ||
      (!quantityOfferFreeShippingActive && freeShippingAmount <= 0)
    ) {
      return;
    }

    const milestones = [25, 50, 75, 100];
    const reachedMilestone = milestones.reduce(
      (lastReached, milestone) =>
        freeShippingProgress >= milestone ? milestone : lastReached,
      0,
    );

    if (reachedMilestone <= 0) {
      return;
    }

    void trackStorefrontAppUsage({
      slug: "conversion-suite",
      feature: "free_shipping_progress_milestone",
      dedupeKey: `free-shipping-progress:${storefrontSettings?.company?.id || "store"}:${reachedMilestone}:${subtotal}`,
      metadata: {
        milestone: reachedMilestone,
        subtotal,
      },
    });
  }, [
    freeShippingAmount,
    freeShippingEnabled,
    freeShippingProgress,
    quantityOfferFreeShippingActive,
    showFreeShippingProgress,
    storefrontSettings?.company?.id,
    subtotal,
  ]);

  const handleApplyCoupon = async () => {
    const normalizedCouponCode = couponCode.trim();

    if (!normalizedCouponCode) {
      clearAppliedCoupon();
      toast.error(
        theme.direction === "rtl"
          ? "يرجى إدخال كود الخصم"
          : "Please enter a coupon code",
      );
      return;
    }

    void trackStorefrontAppUsage({
      slug: "conversion-suite",
      feature: "coupon_validation_attempt",
      metadata: {
        subtotal,
      },
    });

    try {
      setIsCouponLoading(true);
      const response = await storefrontApi.validateCoupon(
        storefrontSettings?.company?.id || "",
        normalizedCouponCode,
        subtotal,
      );

      const discountAmount = Number(response?.data?.discountAmount || 0);
      const finalAmount = Number(response?.data?.finalAmount || subtotal);
      const coupon = response?.data?.coupon;

      setAppliedCoupon({
        code: String(coupon?.code || normalizedCouponCode)
          .trim()
          .toUpperCase(),
        name: typeof coupon?.name === "string" ? coupon.name : "",
        discountAmount,
        finalAmount,
        orderAmount: subtotal,
      });

      void trackStorefrontAppUsage({
        slug: "conversion-suite",
        feature: "coupon_validation_success",
        metadata: {
          subtotal,
          discountAmount,
        },
      });

      toast.success(
        discountAmount > 0
          ? isBiteRush
            ? `الكود اشتغل. وفّرت ${formatStorefrontCurrency(discountAmount, currency)} من الطلب.`
            : `تم تطبيق الكوبون بنجاح. وفّرت ${formatStorefrontCurrency(discountAmount, currency)}.`
          : "الكوبون صالح.",
      );
    } catch (error: unknown) {
      clearAppliedCoupon();

      void trackStorefrontAppUsage({
        slug: "conversion-suite",
        feature: "coupon_validation_failure",
        metadata: {
          subtotal,
        },
      });

      toast.error(getCouponValidationMessage(error));
    } finally {
      setIsCouponLoading(false);
    }
  };

  const handleCheckoutClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (minimumOrder.blocked) {
      event.preventDefault();
      toast.error(minimumOrder.message);
      return;
    }

    void trackStorefrontAppUsage({
      slug: "conversion-suite",
      feature: "checkout_cta_click",
      metadata: {
        subtotal,
        couponApplied: Boolean(activeCoupon),
      },
    });
  };

  return {
    couponFieldId,
    couponCode,
    setCouponCode,
    isCouponLoading,
    items,
    persistedCartItemCount,
    updateQuantity,
    currency,
    subtotal,
    variant,
    theme,
    prefersArabicCopy,
    isAirlume,
    isZenOrganic,
    isBiteRush,
    isSproutRoom,
    isWomenFashionSummary,
    isKhemetLuxe,
    isMarketSummary,
    isNatureSummary,
    isCommandSummary,
    isBoutiqueSummary,
    isFittingRoomSummary,
    hasNatureSummaryTone,
    hasEnhancedSummaryTone,
    checkoutPath,
    minimumOrder,
    effectiveShipping,
    loyaltyFreeShipping,
    loyaltyDiscount,
    voucherDiscount,
    couponDiscount,
    storePromotionDiscount,
    storePromotionTier,
    walletDiscount,
    walletDiscountPercent,
    walletDiscountEnabled,
    walletPaymentSettings,
    tierProgress,
    tiersEnabled,
    activeCoupon,
    freeShippingEnabled,
    freeShippingRemaining,
    freeShippingProgress,
    freeShippingTitle,
    resolvedFreeShippingText,
    showFreeShippingProgress,
    showLineItems,
    lineItemsEditable,
    lineItemsTitle,
    showCouponField,
    couponPlaceholder,
    couponButtonText,
    hideCheckoutButton,
    checkoutButtonText,
    subtotalLabel,
    shippingLabel,
    totalLabel,
    estimatedTotal,
    resolvedShippingValueText,
    resolvedShippingHelpText,
    title,
    subtitle,
    headerBadge,
    assuranceTitle,
    assuranceItems,
    showAssuranceCard,
    nextStepsTitle,
    nextSteps,
    showNextStepsCard,
    shouldShowTrustSummaryRow,
    secureCheckoutText,
    returnsText,
    wrapperClassName,
    sectionClassName,
    handleApplyCoupon,
    handleCheckoutClick,
  };
}
