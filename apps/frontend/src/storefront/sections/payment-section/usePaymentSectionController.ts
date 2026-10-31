import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCheckoutStore } from '../../store/useCheckoutStore';
import { useCheckout } from '../../hooks/useCheckout';
import { useCartStore } from '../../store/useCartStore';
import { useStorefrontSettings } from '../../hooks/useStorefrontSettings';
import { buildStorefrontPath } from '../../utils/paths';
import { formatStorefrontCurrency } from '../../utils/currency';
import { resolvePostPurchaseTarget } from '../../utils/postPurchaseOffer';
import { isKhemetLuxeTheme } from '../../utils/navigationGuards';
import { storefrontApi } from '../../../utils/storefrontApi';
import { useStorefrontFacebookTracking } from '../../hooks/useStorefrontFacebookTracking';
import { trackConversionSuiteUsage } from '../../utils/conversionSuiteTracking';
import { getOrderAttributionPayload } from '../../utils/orderAttribution';
import { useStorefrontTheme } from '../../engine/ThemeProvider';
import { useCheckoutShippingQuote } from '../../hooks/useCheckoutShippingQuote';
import { isValidStorefrontPhone } from '../../utils/phoneValidation';
import { toast } from 'sonner';
import {
  getMethodCardClassName,
  getSummaryWrapperClassName,
  isSameAmount,
  normalizeVariant,
  parseBooleanSetting,
  parseListSetting,
  type PaymentMethodOption,
  type PaymentSectionProps,
} from './types';

export const usePaymentSectionController = (props: PaymentSectionProps) => {
  const { section, settings: sectionSettings } = props;
  const { paymentMethod, setPaymentMethod, formData, appliedCoupon } = useCheckoutStore();
  const { placeOrder, isSubmitting, orderSuccess } = useCheckout();
  const { items, getSubtotal } = useCartStore();
  const { settings: storefrontSettings } = useStorefrontSettings();
  const { trackInitiateCheckoutEvent } = useStorefrontFacebookTracking();
  const { theme } = useStorefrontTheme();
  const isAirlume = theme.id === 'airlume-ai';
  const isZenOrganic = theme.id === 'zen-organic';
  const isBiteRush = theme.id === 'restaurant-demo';
  const isKhemetLuxe = isKhemetLuxeTheme(theme.id);
  const navigate = useNavigate();
  const location = useLocation();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [usePoints, setUsePoints] = useState(false);
  const [useCashback, setUseCashback] = useState(false);
  const trackedCheckoutFingerprintRef = useRef('');
  const checkoutDraftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const walletPaymentSettings =
    (storefrontSettings?.storefront?.settings as any)?.walletPaymentSettings || null;
  const dbEnabledMethods = useMemo(() => {
    const raw =
      storefrontSettings?.storefront?.storefrontFeatures?.enabledPaymentMethods ??
      (storefrontSettings?.storefront?.settings as any)?.enabledPaymentMethods ??
      (storefrontSettings as any)?.storefrontSettings?.enabledPaymentMethods ??
      (storefrontSettings as any)?.enabledPaymentMethods;
    if (Array.isArray(raw)) return raw.map(String);
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map(String);
      } catch {}
    }
    return ['cod'];
  }, [storefrontSettings]);

  const isWalletActiveInSettings =
    walletPaymentSettings?.enabled !== false &&
    dbEnabledMethods.includes('wallet');
  const walletEnabled =
    Boolean(walletPaymentSettings?.walletNumber?.trim()) && isWalletActiveInSettings;
  const walletDiscountEnabled = Boolean(walletPaymentSettings?.discountEnabled);
  const walletDiscountPercent = Math.max(
    0,
    Number(walletPaymentSettings?.discountPercent || 0),
  );
  const showWalletDiscountBadge = walletPaymentSettings?.showDiscountBadge !== false;
  const walletDiscountActive =
    walletDiscountEnabled &&
    walletDiscountPercent > 0 &&
    (paymentMethod === 'card' || (paymentMethod === 'wallet' && walletEnabled));
  const [walletProofImageUrl, setWalletProofImageUrl] = useState('');
  const [walletProofUploading, setWalletProofUploading] = useState(false);
  const [walletTransferRef, setWalletTransferRef] = useState('');
  const walletFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleWalletProofFile = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setValidationErrors(['صيغة الملف يجب أن تكون صورة (JPG/PNG).']);
      return;
    }
    setWalletProofUploading(true);
    try {
      const res = await storefrontApi.uploadWalletProof(file);
      const url = res?.data?.imageUrl || res?.imageUrl;
      if (!url) {
        setValidationErrors(['فشل رفع صورة الإيصال. حاول مرة أخرى.']);
        return;
      }
      setWalletProofImageUrl(String(url));
      setValidationErrors((prev) => prev.filter((e) => !e.includes('صورة')));
    } catch (err) {
      console.error('[WALLET-PROOF] Upload failed:', err);
      setValidationErrors(['فشل رفع صورة الإيصال. حاول مرة أخرى.']);
    } finally {
      setWalletProofUploading(false);
    }
  };

  const subtotal = getSubtotal();
  const walletDiscount =
    walletDiscountActive && (paymentMethod === 'wallet' || paymentMethod === 'card')
      ? (Number(subtotal) || 0) * (walletDiscountPercent / 100)
      : 0;
  const activeCoupon =
    appliedCoupon && isSameAmount(Number(appliedCoupon.orderAmount || 0), subtotal)
      ? appliedCoupon
      : null;
  const couponDiscount = Number(activeCoupon?.discountAmount || 0);
  const currency =
    storefrontSettings?.storefront?.settings?.currency ||
    storefrontSettings?.company?.currency ||
    'EGP';
  const trimmedGovernorate = formData.governorate?.trim();
  const hasCheckoutDraftSignal = Boolean(
    formData.customerName?.trim() ||
    formData.phone?.trim() ||
    formData.email?.trim() ||
    formData.address?.trim() ||
    formData.city?.trim() ||
    trimmedGovernorate ||
    formData.notes?.trim(),
  );
  const requiresShippingSelection = subtotal > 0 && !trimmedGovernorate;
  const isPhoneValid = isValidStorefrontPhone(formData.phone || '');
  const isEmailValid = !formData.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const variant = normalizeVariant(section?.variant);
  const isMarketPayment = variant === 'market-payment';
  const isNaturePayment = variant === 'nature-payment';
  const isCommandPayment = variant === 'command-payment';
  const isBoutiquePayment = variant === 'boutique-payment';
  const isWomenFashionPayment = theme.id === 'women-fashion-eg' && isBoutiquePayment;
  const hasNaturePaymentTone = isZenOrganic || isNaturePayment;
  const hasEnhancedPaymentTone =
    isCommandPayment || isBoutiquePayment || isMarketPayment || isNaturePayment;

  const title =
    sectionSettings?.title || (isBiteRush ? 'الدفع الأخير' : 'طريقة الدفع');
  const subtitle =
    sectionSettings?.subtitle ||
    (isBiteRush
      ? 'اختَر وسيلة الدفع، راجع الإجمالي النهائي، ثم اقفل الطلب بخطوة واحدة.'
      : isMarketPayment
        ? 'اختر وسيلة الدفع الأنسب ثم راجع الإجمالي والشحن بخطوة أخيرة واضحة وسريعة.'
      : isNaturePayment
        ? 'اختر وسيلة الدفع المناسبة وسنكمل الطلب بهدوء مع مراجعة واضحة للشحن والإجمالي.'
      : isCommandPayment
        ? 'اختر وسيلة الدفع الأنسب وسنراجع الشحن النهائي قبل اعتماد الطلب.'
      : isBoutiquePayment
        ? 'اختاري الطريقة الأنسب، ثم نكمل الطلب بهدوء مع مراجعة أخيرة واضحة.'
      : 'اختر طريقة الدفع المناسبة وأكمل الطلب بعد مراجعة الشحن والإجمالي.');
  const summaryTitle =
    sectionSettings?.summaryTitle || (isBiteRush ? 'آخر مراجعة قبل الإرسال' : 'ملخص الطلب');
  const summaryDescription =
    sectionSettings?.summaryDescription ||
    (isBiteRush
      ? 'السعر، الشحن، والخصم ظاهرين بوضوح قبل ما تضغط تأكيد.'
      : isMarketPayment
        ? 'ملخص واضح للسعر، الشحن، والخصم قبل تأكيد الطلب النهائي.'
      : isNaturePayment
        ? 'الملخص يظل هادئًا وواضحًا قبل اعتماد الطلب بشكل نهائي.'
      : isCommandPayment
        ? 'السعر النهائي يشمل الشحن الفعلي والخصم ويظهر بوضوح قبل التأكيد.'
      : isBoutiquePayment
        ? 'الملخص يظل واضحًا وهادئًا قبل اعتماد الطلب النهائي.'
      : 'ملخص مباشر يعرض السعر، الشحن، وأي خصم قبل تأكيد الطلب.');
  const confirmOrderText =
    sectionSettings?.confirmOrderText ||
    (isBiteRush
      ? 'أكّد الطلب الآن'
      : isCommandPayment
        ? 'اعتماد الطلب'
        : isMarketPayment
          ? 'تأكيد الطلب'
          : 'تأكيد الطلب');
  const payButtonPrefix =
    sectionSettings?.payButtonPrefix || (isBiteRush ? 'ادفع الآن' : 'ادفع');
  const processingText =
    sectionSettings?.processingText ||
    (isBiteRush ? 'جارٍ تثبيت الطلب وإرساله للمطبخ...' : 'جارٍ إرسال الطلب...');
  const shippingPromptText =
    sectionSettings?.shippingPromptText ||
    (isBiteRush ? 'اختر المحافظة أولًا لنثبت رسوم التوصيل قبل الإرسال.' : 'اختر المحافظة أولًا لحساب الشحن.');
  const enterGovernorateText =
    sectionSettings?.enterGovernorateText || 'اختر المحافظة';
  const subtotalLabel =
    sectionSettings?.subtotalLabel || 'المجموع الفرعي';
  const shippingLabel =
    sectionSettings?.shippingLabel || 'الشحن';
  const totalLabel =
    sectionSettings?.totalLabel || 'الإجمالي';
  const calculatingText =
    sectionSettings?.calculatingText || 'جارٍ الحساب...';
  const shippingCalculatedText =
    sectionSettings?.shippingCalculatedText ||
    (isBiteRush
      ? 'رسوم التوصيل إلى {{governorate}} ظهرت في الإجمالي.'
      : 'تم حساب الشحن إلى {{governorate}} بنجاح.');
  const noShippingChargeText =
    sectionSettings?.noShippingChargeText ||
    (isBiteRush
      ? 'لا توجد رسوم توصيل مضافة لهذه المنطقة حاليًا.'
      : 'لا توجد تكلفة شحن مضافة لهذه المحافظة حاليًا.');
  const shippingErrorText =
    sectionSettings?.shippingErrorText ||
    (isBiteRush
      ? 'تعذر تحديث رسوم التوصيل الآن، وسنؤكدها معك قبل التنفيذ.'
      : 'تعذر حساب الشحن الآن وسيتم تأكيده مع الطلب.');
  const governorateRequiredText =
    sectionSettings?.governorateRequiredText ||
    'اختيار المحافظة مطلوب قبل تأكيد الطلب.';
  const invalidEmailText =
    sectionSettings?.invalidEmailText ||
    'صيغة البريد الإلكتروني غير صحيحة. اتركه فارغًا أو أدخل عنوان صحيح.';
  const invalidPhoneText =
    sectionSettings?.invalidPhoneText ||
    'رقم الهاتف غير صحيح. يرجى إدخال رقم هاتف صحيح (مثال: 01xxxxxxxxx أو +201xxxxxxxxx).';
  const securityText =
    sectionSettings?.securityText ||
    (isBiteRush
      ? 'تأكيد مشفّر وبياناتك محفوظة'
      : isMarketPayment
        ? 'بياناتك محفوظة والتأكيد النهائي يمر بمراجعة واضحة قبل التنفيذ'
      : isNaturePayment
        ? 'بياناتك محفوظة ومراجعة الطلب تتم بهدوء قبل التنفيذ'
      : isCommandPayment
        ? 'بياناتك محفوظة والتأكيد النهائي يمر بمراجعة سريعة قبل التنفيذ'
      : isBoutiquePayment
        ? 'بياناتك محفوظة والتأكيد النهائي يمر بهدوء قبل التنفيذ'
        : 'دفع آمن ومشفّر');
  const assuranceBadge = (sectionSettings?.assuranceBadge as string) || 'طمأنة قبل الدفع';
  const assuranceTitle =
    (sectionSettings?.assuranceTitle as string) ||
    (isMarketPayment
      ? 'قبل ما تؤكد، نراجع الطلب والعنوان والشحن النهائي بخطوات واضحة.'
      : isNaturePayment
        ? 'قبل ما تؤكد، نراجع الطلب والشحن النهائي بهدوء ووضوح.'
        : 'قبل ما تؤكد، نراجع الطلب والعنوان والشحن النهائي خطوة بخطوة.');
  const assuranceItems = parseListSetting(sectionSettings?.assuranceItems, [
    ...(isMarketPayment
      ? [
          'نراجع العنوان وبيانات التواصل',
          'نثبت تكلفة الشحن حسب المحافظة',
          'نرسل متابعة واضحة حتى الاستلام',
        ]
      : isNaturePayment
        ? [
            'نراجع البيانات والعنوان بهدوء',
            'نثبت الشحن النهائي بشكل واضح',
            'نرسل متابعة لطيفة حتى الاستلام',
          ]
        : [
            'نراجع العنوان والموديل المطلوب',
            'نثبت تكلفة الشحن حسب المحافظة',
            'نرسل متابعة واضحة حتى الاستلام',
          ]),
  ]);
  const postConfirmStepsTitle =
    (sectionSettings?.postConfirmStepsTitle as string) || 'بعد تأكيد الطلب';
  const postConfirmSteps = parseListSetting(sectionSettings?.postConfirmSteps, [
    ...(isMarketPayment
      ? [
          'يصلك رقم الطلب فورًا',
          'نراجع التجهيز والعنوان النهائي',
          'ننسق معك الشحن أو التأكيد الأخير',
        ]
      : isNaturePayment
        ? [
            'يصلك رقم الطلب فورًا',
            'نراجع التغليف والتجهيز المناسب',
            'نشاركك تحديثات حتى التسليم',
          ]
        : [
            'يصلك رقم الطلب فورًا',
            'نراجع توفر القطع والتجهيز',
            'ننسق معك الشحن أو التأكيد النهائي',
        ]),
  ]);

  const {
    shippingCost,
    freeShippingDiscount,
    shippingMessage,
    isShippingLoading,
    quantityOfferFreeShippingActive,
    quantityOfferFreeShippingText,
    freeShippingActive: checkoutFreeShippingActive,
  } = useCheckoutShippingQuote({
    shippingPromptText,
    shippingCalculatedText,
    noShippingChargeText,
    shippingErrorText,
    storefrontLoadingText: hasNaturePaymentTone
      ? 'سيتم حساب الشحن بمجرد اكتمال تحميل بيانات المتجر.'
      : 'Shipping will be calculated once storefront details finish loading.',
  });
  const shipping = shippingCost;

  const tierProgress = useCheckoutStore((s) => s.tierProgress);
  const tiersEnabled = tierProgress?.tiersEnabled === true;
  const autoDiscountEnabled = tierProgress?.autoDiscountEnabled === true;
  const loyaltyFreeShipping = tiersEnabled ? Boolean(tierProgress?.rewards?.freeShipping) : false;
  const loyaltyDiscountPercent = tiersEnabled ? Number(tierProgress?.rewards?.discountPercent || 0) : 0;
  let loyaltyDiscount =
    loyaltyDiscountPercent > 0 ? (Number(subtotal) || 0) * (loyaltyDiscountPercent / 100) : 0;
  let voucherDiscount =
    autoDiscountEnabled && tierProgress?.activeVoucher
      ? (Number(subtotal) || 0) * (Number(tierProgress.activeVoucher.percent) / 100)
      : 0;

  const combination = tierProgress?.discountCombination || 'ADDITIVE';
  const maxTotalPct = Number(tierProgress?.maxTotalDiscountPercent || 0);
  const base = Number(subtotal) || 0;
  let combined = 0;
  if (combination === 'BEST') {
    combined = Math.max(loyaltyDiscount, voucherDiscount);
  } else if (combination === 'COMPOUND') {
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
  const effectiveShipping =
    loyaltyFreeShipping && Number(shipping) > 0 ? 0 : Number(shipping);

  const total = Math.max(0, subtotal + effectiveShipping - couponDiscount - loyaltyDiscount - voucherDiscount - walletDiscount);

  const summaryShippingValueText = (() => {
    if (isShippingLoading) {
      return calculatingText;
    }

    if (quantityOfferFreeShippingActive) {
      return quantityOfferFreeShippingText.replace(/\.$/, '');
    }

    if (loyaltyFreeShipping && Number(shipping) > 0) {
      return 'مجاني (مستوى الولاء)';
    }

    if (!trimmedGovernorate) {
      return enterGovernorateText;
    }

    if (checkoutFreeShippingActive) {
      return freeShippingDiscount > 0
        ? `-${formatStorefrontCurrency(freeShippingDiscount, currency)}`
        : noShippingChargeText;
    }

    return formatStorefrontCurrency(shipping, currency);
  })();

  const showSummaryCard =
    !isKhemetLuxe && parseBooleanSetting(sectionSettings?.showSummaryCard, true);
  const showHeaderBadge = parseBooleanSetting(
    sectionSettings?.showHeaderBadge,
    hasEnhancedPaymentTone,
  );
  const showAssuranceCard = parseBooleanSetting(
    sectionSettings?.showAssuranceCard,
    hasEnhancedPaymentTone,
  );
  const showNextSteps = parseBooleanSetting(
    sectionSettings?.showNextSteps,
    hasEnhancedPaymentTone,
  );
  const showCompactInlineSummary = isWomenFashionPayment && !showSummaryCard;

  const methodCardClassName = (active: boolean) =>
    `${getMethodCardClassName(variant, active)}${
      isBiteRush
        ? ` border-[#f8c08c] ${
            active
              ? 'bg-[linear-gradient(135deg,#fff4e8_0%,#ffe0c3_100%)] shadow-[0_22px_54px_-40px_rgba(247,115,22,0.5)]'
              : 'bg-[linear-gradient(135deg,#fffdfb_0%,#fff6ec_100%)] shadow-[0_18px_40px_-36px_rgba(247,115,22,0.18)] hover:border-[#f97316] hover:bg-white'
          }`
        : isAirlume
        ? ' border-primary/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(239,246,255,0.76))] shadow-[0_18px_54px_-44px_rgba(15,23,42,0.28)] hover:border-primary/24 hover:bg-white'
        : isKhemetLuxe
          ? ` border-[#d9c8ad] ${
              active
                ? 'bg-[#fcf7ee] shadow-none ring-0'
                : 'bg-white shadow-none hover:border-[#b89255] hover:bg-[#fcf8f2]'
            } rounded-[0.7rem]`
        : hasNaturePaymentTone
          ? ' border-[#dbe3d4] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(244,246,241,0.92))] shadow-[0_18px_52px_-44px_rgba(26,51,40,0.2)] hover:border-[#88a876] hover:bg-white'
          : isMarketPayment
            ? ` border-[#f0d4b0] ${
                active
                  ? 'bg-[linear-gradient(135deg,#fff6ea_0%,#ffe8cb_100%)] shadow-[0_22px_54px_-40px_rgba(154,93,34,0.22)] ring-0'
                  : 'bg-white/96 shadow-[0_18px_48px_-42px_rgba(154,93,34,0.1)] hover:border-[#c9874a] hover:bg-[#fffaf3]'
              }`
          : isBoutiquePayment
            ? ` border-[#ead8cf] ${
                active
                  ? 'bg-[linear-gradient(135deg,#fff3ef_0%,#ffe7e1_100%)] shadow-[0_22px_54px_-40px_rgba(107,33,49,0.18)] ring-0'
                  : 'bg-white/96 shadow-[0_18px_48px_-42px_rgba(107,33,49,0.1)] hover:border-[#d77d6a] hover:bg-[#fff8f5]'
              }`
          : isCommandPayment
            ? ` border-[#ead8b1] ${
                active
                  ? 'bg-[linear-gradient(135deg,#fff6df_0%,#fff1cf_100%)] shadow-[0_22px_54px_-40px_rgba(90,62,24,0.26)] ring-0'
                  : 'bg-white/96 shadow-[0_18px_48px_-42px_rgba(90,62,24,0.12)] hover:border-[#d4a64a] hover:bg-[#fffaf0]'
              }`
        : ''
    }`;

  const summaryWrapperClassName = `${getSummaryWrapperClassName(variant)}${
    isWomenFashionPayment
      ? ' rounded-[1.35rem] p-3.5 shadow-[0_18px_52px_-46px_rgba(107,33,49,0.12)]'
      : isBiteRush
      ? ' border-[#f8c08c] bg-[linear-gradient(180deg,#fffaf4_0%,#fff1e4_100%)] shadow-[0_28px_80px_-60px_rgba(247,115,22,0.34)]'
      : isAirlume
      ? ' border-primary/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(239,246,255,0.84))] shadow-[0_28px_80px_-60px_hsl(var(--primary)/0.42)]'
      : isKhemetLuxe
        ? ' bg-transparent shadow-none p-0'
      : hasNaturePaymentTone
        ? ' border-[#dbe3d4] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,247,242,0.96))] shadow-[0_28px_80px_-60px_rgba(26,51,40,0.24)]'
        : isMarketPayment
          ? ' border-[#f0d4b0] bg-[linear-gradient(180deg,#fffdf8_0%,#fff6ec_100%)] shadow-[0_28px_80px_-60px_rgba(154,93,34,0.16)]'
        : isBoutiquePayment
          ? ' border-[#ead8cf] bg-[linear-gradient(180deg,#fffdfc_0%,#fff7f4_100%)] shadow-[0_28px_80px_-60px_rgba(107,33,49,0.14)]'
        : isCommandPayment
          ? ' border-[#ead8b1] bg-[linear-gradient(180deg,#fffdf9_0%,#fff7e9_100%)] shadow-[0_28px_80px_-60px_rgba(90,62,24,0.22)]'
      : ''
  }`;

  const confirmButtonClassName = isWomenFashionPayment
    ? 'h-12 rounded-full border-none bg-[linear-gradient(135deg,#3d2a2f_0%,#8f4d41_100%)] text-sm font-black text-white shadow-[0_22px_70px_-34px_rgba(107,33,49,0.28)] transition-all hover:opacity-95 active:scale-[0.98] sm:h-13 sm:text-base'
    : isBiteRush
      ? 'h-14 rounded-full border-none bg-[linear-gradient(135deg,#f97316_0%,#ef4444_100%)] text-base font-black text-white shadow-[0_28px_90px_-34px_rgba(239,68,68,0.62)] transition-all hover:shadow-[0_34px_94px_-30px_rgba(249,115,22,0.72)] active:scale-[0.98]'
    : isAirlume
      ? 'h-14 rounded-full border-none bg-[linear-gradient(135deg,#0f172a_0%,hsl(var(--primary))_58%,#60a5fa_100%)] text-base font-black text-white shadow-[0_28px_90px_-40px_hsl(var(--primary)/0.7)] transition-all hover:opacity-95 active:scale-[0.98]'
      : isKhemetLuxe
        ? 'h-13 rounded-[0.85rem] border-none bg-[linear-gradient(135deg,#2c241b_0%,#7b6030_48%,#b89255_100%)] text-sm font-black text-white shadow-none transition-all hover:opacity-95 active:scale-[0.98] sm:h-14 sm:text-base'
      : hasNaturePaymentTone
        ? 'h-14 rounded-full border-none bg-[linear-gradient(135deg,#1a3328_0%,#476343_100%)] text-base font-black text-white shadow-[0_28px_80px_-36px_rgba(26,51,40,0.52)] transition-all hover:opacity-95 active:scale-[0.98]'
        : isMarketPayment
          ? 'h-14 rounded-full border-none bg-[linear-gradient(135deg,#6b4423_0%,#c9874a_100%)] text-base font-black text-white shadow-[0_28px_80px_-36px_rgba(154,93,34,0.34)] transition-all hover:opacity-95 active:scale-[0.98]'
        : isBoutiquePayment
          ? 'h-14 rounded-full border-none bg-[linear-gradient(135deg,#3d2a2f_0%,#8f4d41_100%)] text-base font-black text-white shadow-[0_28px_90px_-36px_rgba(107,33,49,0.3)] transition-all hover:opacity-95 active:scale-[0.98]'
        : isCommandPayment
          ? 'h-14 rounded-full border-none bg-[linear-gradient(135deg,#1f1f1b_0%,#725523_52%,#d5ac58_100%)] text-base font-black text-white shadow-[0_28px_90px_-36px_rgba(90,62,24,0.48)] transition-all hover:opacity-95 active:scale-[0.98]'
        : 'h-14 text-base font-bold shadow-xl shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-[0.98]';

  const validationBoxClassName = isWomenFashionPayment
    ? 'space-y-2 rounded-[1.2rem] border border-rose-200 bg-[linear-gradient(135deg,#fff9f8_0%,#fff1ee_100%)] p-3.5'
    : isBiteRush
      ? 'space-y-2 rounded-[1.4rem] border border-rose-200 bg-[linear-gradient(135deg,#fff5f5_0%,#fff0ef_100%)] p-4'
    : isMarketPayment
      ? 'space-y-2 rounded-[1.4rem] border border-rose-200 bg-[linear-gradient(135deg,#fffaf8_0%,#fff2ea_100%)] p-4'
    : hasNaturePaymentTone
      ? 'space-y-2 rounded-[1.4rem] border border-rose-200 bg-[linear-gradient(135deg,#f8fbf7_0%,#f1f6ee_100%)] p-4'
    : isBoutiquePayment
      ? 'space-y-2 rounded-[1.4rem] border border-rose-200 bg-[linear-gradient(135deg,#fff9f8_0%,#fff1ee_100%)] p-4'
    : isCommandPayment
      ? 'space-y-2 rounded-[1.4rem] border border-rose-200 bg-[linear-gradient(135deg,#fff7f4_0%,#fff2ef_100%)] p-4'
    : 'space-y-2 rounded-[var(--radius)] border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/20';

  const assuranceCardClassName = isWomenFashionPayment
    ? 'rounded-[1.4rem] border border-[#ead8cf] bg-[linear-gradient(135deg,#fffaf8_0%,#fff1ed_100%)] p-4 shadow-[0_18px_54px_-44px_rgba(107,33,49,0.12)]'
    : isKhemetLuxe
      ? 'rounded-[0.95rem] border border-[#e7ddd0] bg-transparent p-0 shadow-none'
    : isCommandPayment
      ? 'rounded-[1.7rem] border border-[#ead8b1] bg-[linear-gradient(135deg,#fffaf0_0%,#fff2d8_100%)] p-5 shadow-[0_22px_70px_-56px_rgba(90,62,24,0.18)]'
    : isBoutiquePayment
      ? 'rounded-[1.7rem] border border-[#ead8cf] bg-[linear-gradient(135deg,#fffaf8_0%,#fff1ed_100%)] p-5 shadow-[0_22px_70px_-56px_rgba(107,33,49,0.14)]'
      : isMarketPayment
        ? 'rounded-[1.7rem] border border-[#f0d4b0] bg-[linear-gradient(135deg,#fffaf3_0%,#fff0de_100%)] p-5 shadow-[0_22px_70px_-56px_rgba(154,93,34,0.14)]'
        : hasNaturePaymentTone
          ? 'rounded-[1.7rem] border border-[#dbe3d4] bg-[linear-gradient(135deg,#fbfdf9_0%,#eef5ea_100%)] p-5 shadow-[0_22px_70px_-56px_rgba(26,51,40,0.14)]'
          : '';

  const nextStepsCardClassName = isWomenFashionPayment
    ? 'rounded-[1.3rem] border border-[#ead8cf] bg-white/95 p-3.5 shadow-[0_16px_44px_-40px_rgba(107,33,49,0.1)]'
    : isKhemetLuxe
      ? 'rounded-[0.95rem] border border-[#e7ddd0] bg-transparent p-0 shadow-none'
    : isCommandPayment
      ? 'rounded-[1.5rem] border border-[#ead8b1] bg-white/95 p-4 shadow-[0_18px_50px_-42px_rgba(90,62,24,0.16)]'
    : isBoutiquePayment
      ? 'rounded-[1.5rem] border border-[#ead8cf] bg-white/95 p-4 shadow-[0_18px_50px_-42px_rgba(107,33,49,0.12)]'
      : isMarketPayment
        ? 'rounded-[1.5rem] border border-[#f0d4b0] bg-white/95 p-4 shadow-[0_18px_50px_-42px_rgba(154,93,34,0.12)]'
        : hasNaturePaymentTone
          ? 'rounded-[1.5rem] border border-[#dbe3d4] bg-white/95 p-4 shadow-[0_18px_50px_-42px_rgba(26,51,40,0.12)]'
          : '';

  const surfaceClassName = `${showCompactInlineSummary ? 'space-y-5' : 'space-y-6'}${
    isWomenFashionPayment
      ? ' rounded-[1.85rem] border border-[#ead8cf] bg-[linear-gradient(180deg,#fffdfc_0%,#fff8f5_52%,#ffffff_100%)] p-4 shadow-[0_28px_86px_-72px_rgba(107,33,49,0.14)] sm:p-5'
      : isBiteRush
        ? ' rounded-[2rem] border border-[#f7b77d] bg-[linear-gradient(135deg,#fff8f1_0%,#ffffff_45%,#ffe4ce_100%)] p-5 shadow-[0_34px_110px_-78px_rgba(247,115,22,0.48)] sm:p-6'
      : isAirlume
      ? ' rounded-[2rem] border border-primary/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.98))] p-5 shadow-[0_34px_110px_-78px_hsl(var(--primary)/0.4)] sm:p-6'
      : isKhemetLuxe
        ? ' bg-transparent shadow-none p-0 space-y-10'
      : hasNaturePaymentTone
          ? ' rounded-[2rem] border border-[#dbe3d4] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,247,242,0.98))] p-5 shadow-[0_34px_110px_-78px_rgba(26,51,40,0.26)] sm:p-6'
          : isMarketPayment
            ? ' rounded-[2.1rem] border border-[#f0d4b0] bg-[linear-gradient(180deg,#fffdf8_0%,#fff7ef_52%,#ffffff_100%)] p-5 shadow-[0_34px_110px_-78px_rgba(154,93,34,0.16)] sm:p-6'
            : isBoutiquePayment
              ? ' rounded-[2.1rem] border border-[#ead8cf] bg-[linear-gradient(180deg,#fffdfc_0%,#fff8f5_52%,#ffffff_100%)] p-5 shadow-[0_34px_110px_-78px_rgba(107,33,49,0.14)] sm:p-6'
            : isCommandPayment
              ? ' rounded-[2.2rem] border border-[#ead8b1] bg-[linear-gradient(180deg,#fffdf9_0%,#fff8ec_52%,#ffffff_100%)] p-5 shadow-[0_34px_110px_-78px_rgba(90,62,24,0.18)] sm:p-6'
              : ''
  }`;

  const titleClassName = isWomenFashionPayment
    ? 'font-heading text-base font-bold text-foreground sm:text-lg'
    : isKhemetLuxe
      ? 'font-heading text-[1.12rem] font-bold text-foreground sm:text-[1.18rem]'
    : 'font-heading text-lg font-bold text-foreground';

  const subtitleClassName = isWomenFashionPayment
    ? 'text-sm leading-5 text-muted-foreground'
    : isKhemetLuxe
      ? 'text-sm leading-6 text-[#6f6455]'
    : 'text-sm leading-6 text-muted-foreground';

  const methodStackClassName = isWomenFashionPayment ? 'space-y-2.5' : 'space-y-3';
  const inlineSummaryClassName = isWomenFashionPayment
    ? 'rounded-[1.2rem] border border-[#ead8cf] bg-white/96 p-3.5 shadow-[0_16px_42px_-38px_rgba(107,33,49,0.1)]'
    : summaryWrapperClassName;

  const checkoutFingerprint = useMemo(
    () => items.map((item) => `${item.id}:${item.quantity}:${item.price}`).join('|'),
    [items],
  );

  useEffect(() => {
    if (checkoutDraftTimerRef.current) {
      clearTimeout(checkoutDraftTimerRef.current);
    }

    if (!items.length || !hasCheckoutDraftSignal) {
      return undefined;
    }

    checkoutDraftTimerRef.current = setTimeout(() => {
      void storefrontApi.saveCheckoutDraft({
        customerName: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        governorate: formData.governorate,
        notes: formData.notes,
        paymentMethod,
        couponCode: activeCoupon?.code || undefined,
        shippingCost: shipping,
        subtotal,
        total,
        attribution: getOrderAttributionPayload(storefrontSettings?.companyId) || undefined,
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId || undefined,
          name: item.name,
          price: item.price,
          basePrice: item.basePrice,
          quantity: item.quantity,
          attributes: item.attributes || {},
          image: item.imageUrl,
          productImage: item.imageUrl,
          quantityOffer: item.quantityOffer || undefined,
          volumeDiscount:
            Array.isArray(item.volumeDiscounts) && item.volumeDiscounts[0]
              ? item.volumeDiscounts[0]
              : undefined,
        })),
      });
    }, 1200);

    return () => {
      if (checkoutDraftTimerRef.current) {
        clearTimeout(checkoutDraftTimerRef.current);
      }
    };
  }, [
    activeCoupon?.code,
    formData.address,
    formData.city,
    formData.customerName,
    formData.email,
    formData.governorate,
    formData.notes,
    formData.phone,
    hasCheckoutDraftSignal,
    items,
    paymentMethod,
    shipping,
    storefrontSettings?.companyId,
    subtotal,
    total,
  ]);

  useEffect(() => {
    if (!items.length || subtotal <= 0 || !checkoutFingerprint) {
      return;
    }

    if (trackedCheckoutFingerprintRef.current === checkoutFingerprint) {
      return;
    }

    const eventId = trackInitiateCheckoutEvent({
      items: items.map((item) => ({
        id: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
      total: subtotal,
    });

    if (eventId !== undefined) {
      trackedCheckoutFingerprintRef.current = checkoutFingerprint;
    }

    void trackConversionSuiteUsage(storefrontSettings, {
      feature: 'checkout_payment_view',
      dedupeKey: `checkout-payment-view:${checkoutFingerprint}`,
      metadata: {
        subtotal,
        itemCount: items.length,
      },
    });
  }, [checkoutFingerprint, items, storefrontSettings, subtotal, trackInitiateCheckoutEvent]);

  useEffect(() => {
    if (isShippingLoading || !trimmedGovernorate || quantityOfferFreeShippingActive) {
      return;
    }

    void trackConversionSuiteUsage(storefrontSettings, {
      feature: 'shipping_quote_calculated',
      dedupeKey: `shipping-quote:${storefrontSettings?.company?.id || 'store'}:${trimmedGovernorate}:${subtotal}`,
      metadata: {
        governorate: trimmedGovernorate,
        shippingCost: shipping,
        subtotal,
      },
    });
  }, [
    isShippingLoading,
    quantityOfferFreeShippingActive,
    shipping,
    storefrontSettings,
    storefrontSettings?.company?.id,
    subtotal,
    trimmedGovernorate,
  ]);

  useEffect(() => {
    if (orderSuccess) {
      const resolvedOrderId = orderSuccess.orderNumber || orderSuccess.id || 'success';
      const purchasedItems = (Array.isArray(orderSuccess?.items) && orderSuccess.items.length > 0)
        ? orderSuccess.items
        : items.map((it) => ({ productId: it.productId }));
      const targetRoute = resolvePostPurchaseTarget(storefrontSettings, purchasedItems);
      const nextPath = buildStorefrontPath(
        location.pathname,
        `${targetRoute}?orderId=${encodeURIComponent(resolvedOrderId)}`,
        location.search,
      );
      navigate(nextPath, {
        state: orderSuccess.purchaseTracking
          ? { purchaseTracking: orderSuccess.purchaseTracking }
          : null,
      });
    }
  }, [items, location.pathname, location.search, navigate, orderSuccess, storefrontSettings]);

  const validateForm = useCallback((): { errors: string[]; firstInvalidFieldId?: string } => {
    const errors: string[] = [];
    let firstInvalidFieldId: string | undefined;

    if (!formData.customerName?.trim()) {
      errors.push('يرجى إدخال الاسم الكامل.');
      if (!firstInvalidFieldId) firstInvalidFieldId = 'checkout-customer-name';
    }
    if (!formData.phone?.trim()) {
      errors.push('يرجى إدخال رقم الهاتف.');
      if (!firstInvalidFieldId) firstInvalidFieldId = 'checkout-phone';
    } else if (!isPhoneValid) {
      errors.push('رقم الهاتف غير صحيح. يرجى إدخال رقم هاتف صحيح (مثال: 01xxxxxxxxx أو +201xxxxxxxxx).');
      if (!firstInvalidFieldId) firstInvalidFieldId = 'checkout-phone';
    }
    if (!formData.address?.trim()) {
      errors.push('يرجى إدخال عنوان الشحن.');
      if (!firstInvalidFieldId) firstInvalidFieldId = 'checkout-address';
    }
    if (!trimmedGovernorate) {
      errors.push('يرجى اختيار المحافظة.');
      if (!firstInvalidFieldId) firstInvalidFieldId = 'checkout-governorate';
    }
    if (!isEmailValid) {
      errors.push('صيغة البريد الإلكتروني غير صحيحة. اتركه فارغًا أو أدخل عنوان صحيح.');
      if (!firstInvalidFieldId) firstInvalidFieldId = 'checkout-email';
    }
    return { errors, firstInvalidFieldId };
  }, [formData.customerName, formData.phone, formData.address, trimmedGovernorate, isPhoneValid, isEmailValid]);

  const handlePlaceOrder = async () => {
    const { errors, firstInvalidFieldId } = validateForm();
    if (paymentMethod === 'wallet') {
      if (walletProofUploading) {
        errors.push('جارٍ رفع صورة الإيصال، انتظر قليلًا.');
      } else if (!walletProofImageUrl) {
        errors.push('يرجى رفع صورة إيصال التحويل لإتمام الدفع بالمحفظة.');
      }
    }
    if (errors.length > 0) {
      setValidationErrors(errors);
      toast.error(errors[0]);
      if (firstInvalidFieldId) {
        const el = document.getElementById(firstInvalidFieldId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
        }
      } else if (paymentMethod === 'wallet' && !walletProofImageUrl) {
        walletFileInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    setValidationErrors([]);

    void trackConversionSuiteUsage(storefrontSettings, {
      feature: 'order_submit_attempt',
      metadata: {
        paymentMethod,
        subtotal,
        shippingCost: effectiveShipping,
        discountAmount: couponDiscount + loyaltyDiscount + walletDiscount,
        total,
        couponApplied: Boolean(activeCoupon?.code),
        loyaltyTier: tierProgress?.tier?.nameAr || tierProgress?.tier?.name || null,
      },
    });

    await placeOrder({
      ...formData,
      paymentMethod,
      couponCode: activeCoupon?.code,
      shippingCost: effectiveShipping,
      subtotal,
      total,
      redeemPoints: usePoints,
      useWallet: useCashback,
      walletAmount: useCashback ? Math.min(Number(tierProgress?.walletBalance || 0), subtotal + effectiveShipping) : 0,
      ...(paymentMethod === 'wallet' && walletProofImageUrl
        ? {
            walletProof: {
              imageUrl: walletProofImageUrl,
              walletNumber: walletPaymentSettings?.walletNumber || undefined,
              transferRef: walletTransferRef.trim() || undefined,
            },
          }
        : {}),
    });
  };

  const allMethodOptions: PaymentMethodOption[] = [
    {
      id: 'cod',
      label: (sectionSettings?.codLabel as string) || 'الدفع عند الاستلام',
      icon: '💵',
      desc:
        (sectionSettings?.codDesc as string) ||
        (isBiteRush
          ? 'اطلب الآن وادفع عند الاستلام من غير أي خطوة إضافية'
          : isMarketPayment
            ? 'اختيار واضح وسهل للطلبات التي تريد تأكيدها عند الاستلام'
          : hasNaturePaymentTone
            ? 'اختيار مريح لو تحب تثبيت الطلب أولًا ثم الدفع عند الاستلام'
          : isCommandPayment
            ? 'الأفضل للطلبات عالية القيمة مع دفع عند الاستلام بعد التأكيد'
          : 'ادفع كاش عند وصول الطلب لباب بيتك'),
    },
    {
      id: 'card',
      label: (sectionSettings?.cardLabel as string) || 'بطاقة ائتمان / خصم',
      icon: '💳',
      desc:
        (sectionSettings?.cardDesc as string) ||
        (isBiteRush
          ? 'ادفع فورًا وخلي الطلب يدخل التحضير مباشرة'
          : isMarketPayment
            ? 'لو تريد إنهاء أسرع وخطوة أقل قبل بدء التجهيز'
          : hasNaturePaymentTone
            ? 'اختيار هادئ لتأكيد أسرع مع مراجعة أقل بعد الطلب'
          : isCommandPayment
            ? 'أنسب لو تريد تسريع تجهيز الطلب والدخول مباشرة في التنفيذ'
          : 'فيزا، ماستركارد، أو أي بطاقة محفوظة'),
    },
    {
      id: 'wallet',
      label:
        (sectionSettings?.walletLabel as string) ||
        (walletPaymentSettings?.recipientName
          ? `تحويل على ${walletPaymentSettings.recipientName}`
          : 'الدفع بالمحفظة (تحويل + رفع إيصال)'),
      icon: '📱',
      desc:
        (sectionSettings?.walletDesc as string) ||
        (walletPaymentSettings?.walletNumber
          ? `حوّل المبلغ على ${walletPaymentSettings.walletNumber} ثم ارفع صورة الإيصال`
          : 'حوّل المبلغ على رقم المحفظة ثم ارفع صورة الإيصال لإثبات الدفع'),
    },
  ];

  const themeEnabledMethods = Array.isArray(sectionSettings?.enabledMethods)
    ? (sectionSettings?.enabledMethods as string[])
    : [];
  const enabledMethods = (dbEnabledMethods && dbEnabledMethods.length > 0 ? dbEnabledMethods : themeEnabledMethods) || [];
  const enabledIds: string[] =
    enabledMethods.length > 0 ? enabledMethods : ['cod'];

  const methodOptions = allMethodOptions.filter((method) =>
    method.id === 'wallet'
      ? enabledIds.includes('wallet') && walletEnabled
      : enabledIds.includes(method.id),
  );

  useEffect(() => {
    const firstMethod = methodOptions[0];
    if (firstMethod && !methodOptions.find((method) => method.id === paymentMethod)) {
      setPaymentMethod(firstMethod.id);
    }
  }, [methodOptions, paymentMethod, setPaymentMethod]);

  return {
    items,
    paymentMethod,
    setPaymentMethod,
    methodOptions,
    subtotal,
    shipping,
    effectiveShipping,
    total,
    currency,
    walletDiscountEnabled,
    walletDiscountPercent,
    showWalletDiscountBadge,
    walletDiscount,
    walletEnabled,
    walletPaymentSettings,
    walletProofUploading,
    walletProofImageUrl,
    walletTransferRef,
    setWalletTransferRef,
    walletFileInputRef,
    handleWalletProofFile,
    tierProgress,
    tiersEnabled,
    loyaltyDiscount,
    loyaltyDiscountPercent,
    voucherDiscount,
    couponDiscount,
    activeCoupon,
    loyaltyFreeShipping,
    checkoutFreeShippingActive,
    trimmedGovernorate,
    isShippingLoading,
    summaryShippingValueText,
    shippingMessage,
    requiresShippingSelection,
    isEmailValid,
    isPhoneValid,
    formData,
    governorateRequiredText,
    invalidEmailText,
    invalidPhoneText,
    usePoints,
    setUsePoints,
    useCashback,
    setUseCashback,
    validationErrors,
    handlePlaceOrder,
    isSubmitting,
    confirmOrderText,
    payButtonPrefix,
    processingText,
    securityText,
    title,
    subtitle,
    summaryTitle,
    summaryDescription,
    subtotalLabel,
    shippingLabel,
    totalLabel,
    shippingPromptText,
    assuranceBadge,
    assuranceTitle,
    assuranceItems,
    postConfirmStepsTitle,
    postConfirmSteps,
    showSummaryCard,
    showHeaderBadge,
    showAssuranceCard,
    showNextSteps,
    showCompactInlineSummary,
    isKhemetLuxe,
    isBiteRush,
    isMarketPayment,
    isNaturePayment,
    isCommandPayment,
    isBoutiquePayment,
    isWomenFashionPayment,
    hasNaturePaymentTone,
    hasEnhancedPaymentTone,
    // Class names
    surfaceClassName,
    titleClassName,
    subtitleClassName,
    assuranceCardClassName,
    methodStackClassName,
    methodCardClassName,
    summaryWrapperClassName,
    inlineSummaryClassName,
    validationBoxClassName,
    confirmButtonClassName,
    nextStepsCardClassName,
  };
};

export type PaymentSectionController = ReturnType<typeof usePaymentSectionController>;
