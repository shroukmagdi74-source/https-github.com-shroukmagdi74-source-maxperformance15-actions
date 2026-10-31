import React, { useCallback, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useCheckoutStore } from '../../store/useCheckoutStore';
import { useCartStore } from '../../store/useCartStore';
import { useStorefrontTheme } from '../../engine/ThemeProvider';
import { isKhemetLuxeTheme } from '../../utils/navigationGuards';
import { useTierProgress } from '../../hooks/useTierProgress';
import type { CheckoutFormProps } from './checkoutFormTypes';
import {
  getStepWrapperClassName,
  governorateAliases,
  normalizeArabic,
  normalizeVariant,
  parseBooleanSetting,
  parseListSetting,
} from './checkoutFormHelpers';

export const useCheckoutFormController = ({ section, settings }: CheckoutFormProps) => {
  const { formData, updateFormData } = useCheckoutStore();
  const { items } = useCartStore();
  const { theme } = useStorefrontTheme();
  const location = useLocation();
  const { refreshTierProgress } = useTierProgress();
  const variant = normalizeVariant(section?.variant);

  const isAirlume = theme.id === 'airlume-ai';
  const isZenOrganic = theme.id === 'zen-organic';
  const isBiteRush = theme.id === 'restaurant-demo';
  const isKhemetLuxe = isKhemetLuxeTheme(theme.id);
  const isMarketCheckout = variant === 'market-checkout';
  const isNatureCheckout = variant === 'nature-checkout';
  const isSoftFlow = variant === 'soft-flow';
  const isCommandCheckout = variant === 'command-checkout';
  const isFittingRoomCheckout = variant === 'fitting-room-checkout';
  const isButcherCheckout = theme.id === 'butcher-counter-eg';
  const isWomenFashionCheckout = theme.id === 'women-fashion-eg' && isSoftFlow;
  const hasNatureCheckoutTone = isZenOrganic || isNatureCheckout || isButcherCheckout;
  const hasEnhancedCheckoutIntro =
    isCommandCheckout || isMarketCheckout || isNatureCheckout;

  // Customer login (WhatsApp OTP) lives on the main app — NOT under /store.
  const loginParams = new URLSearchParams(location.search);
  const loginKeep = new URLSearchParams();
  ['companyId', 'previewTheme', 'previewSource', 'previewAdminOrigin'].forEach((key) => {
    const value = loginParams.get(key);
    if (value) loginKeep.set(key, value);
  });
  const loginQuery = loginKeep.toString();
  const loginPath = `/auth/customer-register${loginQuery ? `?${loginQuery}` : ''}`;

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    updateFormData({ [name]: value });
  };

  const handlePhoneBlur = () => {
    refreshTierProgress(formData.phone);
  };

  // Automatically refresh tier progress & active voucher when phone is present
  useEffect(() => {
    if (formData.phone && formData.phone.trim().length >= 10) {
      refreshTierProgress(formData.phone);
    }
  }, [formData.phone, refreshTierProgress]);

  const detectGovernorate = useCallback(
    (value: string) => {
      const normalized = normalizeArabic(value);
      if (!normalized) {
        return '';
      }

      for (const [governorate, aliases] of Object.entries(governorateAliases)) {
        if (aliases.some((alias) => normalized.includes(normalizeArabic(alias)))) {
          return governorate;
        }
      }

      return '';
    },
    [],
  );

  useEffect(() => {
    if (formData.governorate?.trim()) {
      return;
    }

    const timer = setTimeout(() => {
      const detectedFromCity = detectGovernorate(formData.city || '');
      const detectedFromAddress = detectGovernorate(formData.address || '');
      const detectedGovernorate = detectedFromCity || detectedFromAddress;

      if (detectedGovernorate) {
        updateFormData({ governorate: detectedGovernorate });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [detectGovernorate, formData.address, formData.city, formData.governorate, updateFormData]);

  const inputClassName =
    isWomenFashionCheckout
      ? 'w-full min-h-[44px] rounded-[1rem] border border-[#ead9d8] bg-white px-3.5 py-2.5 text-sm text-foreground placeholder:text-[#8d6a66] shadow-[0_12px_32px_-28px_rgba(107,33,49,0.12)] transition-all focus:border-[#f08a76] focus:outline-none focus:ring-2 focus:ring-[#f08a76]/18'
      : isFittingRoomCheckout
        ? 'w-full min-h-[44px] rounded-[1rem] border border-transparent bg-[#f7f4f1] px-4 py-2.5 text-sm text-[#242220] placeholder:text-[#aaa39d] shadow-inner transition-all focus:border-[#d8cec4] focus:outline-none focus:ring-2 focus:ring-[#242220]/10'
      : isBiteRush
      ? 'w-full rounded-[1.25rem] border border-[#f8c08c] bg-white px-4 py-3 text-sm text-[#111111] placeholder:text-[#b26b36] shadow-[0_16px_45px_-34px_rgba(247,115,22,0.42)] transition-all focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/20'
      : isAirlume
      ? 'w-full rounded-[1.1rem] border border-primary/10 bg-white/90 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground shadow-[0_12px_36px_-28px_rgba(15,23,42,0.26)] transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
      : isKhemetLuxe
      ? 'w-full min-h-[46px] rounded-[0.5rem] border border-[#d1c2b0] bg-white px-4 py-3 text-sm text-[#111111] placeholder:text-[#9a8c75] shadow-sm transition-all focus:border-[#b89255] focus:outline-none focus:ring-[3px] focus:ring-[#b89255]/10'
      : hasNatureCheckoutTone
        ? 'w-full rounded-[1.2rem] border border-[#d8e0d1] bg-white/92 px-4 py-3 text-sm text-foreground placeholder:text-[#88947f] shadow-[0_16px_44px_-34px_rgba(26,51,40,0.22)] transition-all focus:border-[#88a876] focus:outline-none focus:ring-2 focus:ring-[#88a876]/20'
      : isMarketCheckout
        ? 'w-full rounded-[1.2rem] border border-[#f0d4b0] bg-white px-4 py-3 text-sm text-[#4b3321] placeholder:text-[#a67d56] shadow-[0_16px_44px_-34px_rgba(154,93,34,0.16)] transition-all focus:border-[#c9874a] focus:outline-none focus:ring-2 focus:ring-[#c9874a]/18'
      : isCommandCheckout
        ? 'w-full rounded-[1.2rem] border border-[#ead8b1] bg-white px-4 py-3 text-sm text-[#1f1f1b] placeholder:text-[#8c7341] shadow-[0_16px_44px_-34px_rgba(90,62,24,0.16)] transition-all focus:border-[#d4a64a] focus:outline-none focus:ring-2 focus:ring-[#d4a64a]/18'
      : isSoftFlow
        ? 'w-full rounded-[1.15rem] border border-[#ead9d8] bg-white px-4 py-3 text-sm text-foreground placeholder:text-[#8d6a66] shadow-[0_14px_40px_-34px_rgba(107,33,49,0.12)] transition-all focus:border-[#f08a76] focus:outline-none focus:ring-2 focus:ring-[#f08a76]/18'
      : 'w-full rounded-[var(--radius)] border border-border bg-muted/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

  const sectionStackClassName = isWomenFashionCheckout
      ? 'space-y-4 rounded-[1.7rem] border border-[#ead9d8] bg-[linear-gradient(180deg,#fffdfc_0%,#fff8f5_100%)] p-3.5 shadow-[0_24px_72px_-60px_rgba(107,33,49,0.12)] sm:p-5'
      : isFittingRoomCheckout
        ? 'mx-auto w-full max-w-[25.5rem] space-y-4 rounded-[2.2rem] border border-[#efe5dd] bg-white p-5 shadow-[0_28px_90px_-52px_rgba(42,38,35,0.2)]'
      : isBiteRush
        ? 'space-y-8 rounded-[2rem] border border-[#f7b77d] bg-[linear-gradient(135deg,#fff9f3_0%,#ffffff_50%,#ffe6d1_100%)] p-4 shadow-[0_38px_100px_-72px_rgba(247,115,22,0.5)] sm:p-6'
    : isAirlume
      ? 'space-y-8 rounded-[2rem] border border-primary/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.96))] p-4 shadow-[0_34px_110px_-78px_hsl(var(--primary)/0.42)] sm:p-6'
      : isKhemetLuxe
        ? 'space-y-10 sm:space-y-14'
      : hasNatureCheckoutTone
        ? 'space-y-8 rounded-[2rem] border border-[#dbe3d4] bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(246,247,242,0.97))] p-4 shadow-[0_36px_100px_-76px_rgba(26,51,40,0.28)] sm:p-6'
        : isMarketCheckout
          ? 'space-y-6 rounded-[2.1rem] border border-[#f0d4b0] bg-[linear-gradient(180deg,#fffdf8_0%,#fff7ef_52%,#ffffff_100%)] p-4 shadow-[0_34px_100px_-76px_rgba(154,93,34,0.16)] sm:p-6'
        : isCommandCheckout
          ? 'space-y-6 rounded-[2.2rem] border border-[#ead8b1] bg-[linear-gradient(180deg,#fffdf9_0%,#fff8ec_54%,#ffffff_100%)] p-4 shadow-[0_38px_110px_-78px_rgba(90,62,24,0.2)] sm:p-6'
        : isSoftFlow
          ? 'space-y-6 rounded-[2rem] border border-[#ead9d8] bg-[linear-gradient(180deg,#fffdfc_0%,#fff7f5_100%)] p-4 shadow-[0_30px_90px_-76px_rgba(107,33,49,0.14)] sm:p-6'
        : 'space-y-8';

  const stepBadgeClassName = isBiteRush
    ? 'flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,#111111_0%,#f97316_55%,#ef4444_100%)] text-xs font-black text-white shadow-[0_18px_46px_-24px_rgba(249,115,22,0.58)]'
    : isAirlume
      ? 'flex h-7 w-7 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f172a_0%,hsl(var(--primary))_58%,#60a5fa_100%)] text-xs font-black text-white shadow-[0_18px_50px_-28px_hsl(var(--primary)/0.58)]'
      : isKhemetLuxe
        ? 'flex h-7 w-7 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2c241b_0%,#6d5527_56%,#b89255_100%)] text-xs font-black text-white shadow-[0_18px_44px_-26px_rgba(65,48,25,0.36)]'
      : hasNatureCheckoutTone
        ? 'flex h-7 w-7 items-center justify-center rounded-full bg-[linear-gradient(135deg,#1a3328_0%,#476343_100%)] text-xs font-black text-white shadow-[0_18px_44px_-26px_rgba(26,51,40,0.48)]'
      : isMarketCheckout
        ? 'flex h-7 w-7 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6b4423_0%,#c9874a_100%)] text-xs font-black text-white shadow-[0_18px_44px_-26px_rgba(154,93,34,0.34)]'
      : isCommandCheckout
        ? 'flex h-7 w-7 items-center justify-center rounded-full bg-[linear-gradient(135deg,#1f1f1b_0%,#725523_52%,#d5ac58_100%)] text-xs font-black text-white shadow-[0_18px_44px_-26px_rgba(90,62,24,0.36)]'
      : isFittingRoomCheckout
        ? 'flex h-7 w-7 items-center justify-center rounded-full bg-[#2b2b2b] text-xs font-black text-white shadow-[0_14px_34px_-22px_rgba(31,31,31,0.38)]'
      : isSoftFlow
        ? 'flex h-7 w-7 items-center justify-center rounded-full bg-[linear-gradient(135deg,#8b3d33_0%,#f08a76_100%)] text-xs font-black text-white shadow-[0_16px_40px_-24px_rgba(107,33,49,0.28)]'
        : 'flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs text-primary';

  const labelClassName = isBiteRush
      ? 'ms-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#a14a14]'
      : isAirlume
      ? 'ms-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500'
      : isKhemetLuxe
        ? 'ms-0 text-[12px] font-medium tracking-normal text-[#8a7a63]'
      : hasNatureCheckoutTone
        ? 'ms-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#7b8772]'
        : isMarketCheckout
          ? 'ms-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#9a6c41]'
        : isCommandCheckout
          ? 'ms-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#8c7341]'
        : isFittingRoomCheckout
          ? 'ms-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#8a837c]'
        : isSoftFlow
          ? 'ms-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#8d6a66]'
        : 'ms-1 text-xs font-bold tracking-wider text-muted-foreground';

  const stepWrapperClassName = (stepVariant: typeof variant) =>
    `${getStepWrapperClassName(stepVariant)}${
      isWomenFashionCheckout
        ? ' rounded-[1.4rem] border border-[#ead9d8] bg-[linear-gradient(135deg,#ffffff_0%,#fff9f7_100%)] p-4 shadow-[0_16px_44px_-38px_rgba(107,33,49,0.1)]'
      : isFittingRoomCheckout
        ? ' rounded-[1.45rem] border border-[#efe5dd] bg-white p-4 shadow-[0_18px_54px_-42px_rgba(42,38,35,0.16)]'
      : isBiteRush
        ? ' rounded-[1.7rem] border border-[#f8c08c] bg-[linear-gradient(135deg,#fffdfb_0%,#fff0df_100%)] p-5 shadow-[0_24px_64px_-52px_rgba(247,115,22,0.42)]'
        : isAirlume
        ? ' rounded-[1.6rem] border border-primary/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(239,246,255,0.72))] p-5 shadow-[0_22px_70px_-58px_hsl(var(--primary)/0.36)]'
        : isKhemetLuxe
          ? ' bg-transparent p-0 shadow-none'
        : hasNatureCheckoutTone
          ? ' rounded-[1.7rem] border border-[#dbe3d4] bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(243,245,239,0.9))] p-5 shadow-[0_22px_70px_-56px_rgba(26,51,40,0.22)]'
          : isMarketCheckout
            ? ' rounded-[1.8rem] border border-[#f0d4b0] bg-[linear-gradient(135deg,#ffffff_0%,#fff7ee_100%)] p-5 shadow-[0_20px_60px_-48px_rgba(154,93,34,0.14)]'
          : isCommandCheckout
            ? ' rounded-[1.9rem] border border-[#ead8b1] bg-[linear-gradient(135deg,#ffffff_0%,#fff8ec_100%)] p-5 shadow-[0_20px_60px_-48px_rgba(90,62,24,0.14)]'
          : isSoftFlow
            ? ' rounded-[1.8rem] border border-[#ead9d8] bg-[linear-gradient(135deg,#ffffff_0%,#fff8f7_100%)] p-5 shadow-[0_18px_60px_-48px_rgba(107,33,49,0.12)]'
          : ''
    }`;

  const autoHintClassName = isBiteRush
    ? 'mb-2 rounded-[1rem] border border-[#fde0bf] bg-[#fff7ee] px-3 py-2 text-xs text-[#9a5a24] shadow-sm'
      : isFittingRoomCheckout
      ? 'mb-2 rounded-[1rem] border border-[#efe5dd] bg-[#fbf8f5] px-3 py-2 text-xs text-[#8a837c] shadow-sm'
      : isAirlume
      ? 'mb-2 rounded-[0.95rem] border border-primary/8 bg-white/92 px-3 py-2 text-xs text-muted-foreground shadow-sm'
      : isKhemetLuxe
        ? 'mb-2 rounded-[0.75rem] border border-[#ece2d4] bg-[#fcf8f2] px-3 py-2 text-xs text-[#7b6d58]'
      : hasNatureCheckoutTone
        ? 'mb-2 rounded-[1rem] border border-[#dbe3d4] bg-[#f6f7f2] px-3 py-2 text-xs text-[#64725f] shadow-sm'
        : isMarketCheckout
          ? 'mb-2 rounded-[1rem] border border-[#f0d4b0] bg-[#fff8ef] px-3 py-2 text-xs text-[#8b6037] shadow-sm'
        : isCommandCheckout
          ? 'mb-2 rounded-[1rem] border border-[#ead8b1] bg-[#fff8ec] px-3 py-2 text-xs text-[#7c6430] shadow-sm'
        : 'mb-2 text-xs text-muted-foreground';

  const autoSuccessClassName = isBiteRush
    ? 'mt-2 rounded-[1rem] border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700'
      : isFittingRoomCheckout
      ? 'mt-2 rounded-[1rem] border border-[#cfe8e1] bg-[#f1fbf8] px-3 py-2 text-xs font-medium text-[#4b8a7c]'
      : isAirlume
      ? 'mt-2 rounded-[0.95rem] border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700'
      : isKhemetLuxe
        ? 'mt-2 rounded-[0.75rem] border border-[#e4d6bf] bg-[#fcf8f1] px-3 py-2 text-xs font-medium text-[#725523]'
      : hasNatureCheckoutTone
        ? 'mt-2 rounded-[1rem] border border-[#cfe0c3] bg-[#edf5e8] px-3 py-2 text-xs font-medium text-[#4a6843]'
        : isMarketCheckout
          ? 'mt-2 rounded-[1rem] border border-[#f1d4b5] bg-[#fff7ec] px-3 py-2 text-xs font-medium text-[#8b6037]'
        : isCommandCheckout
          ? 'mt-2 rounded-[1rem] border border-[#d7e7c5] bg-[#f4faed] px-3 py-2 text-xs font-medium text-[#52703d]'
        : 'mt-2 text-xs text-emerald-600';

  const contactTitle = settings?.contactTitle || settings?.title || 'بيانات التواصل';
  const configuredContactDescription =
    typeof settings?.contactDescription === 'string'
      ? settings.contactDescription
      : typeof settings?.subtitle === 'string'
        ? settings.subtitle
        : undefined;
  const contactDescription =
    configuredContactDescription ??
    (isBiteRush
      ? 'سيب اسمك ورقمك الصح مرة واحدة عشان نثبت الطلب ونوصله من أول محاولة.'
      : isMarketCheckout
        ? 'اكتب بياناتك الأساسية مرة واحدة وسنجهز الطلب بخطوات واضحة من غير لف كثير.'
      : isNatureCheckout
        ? 'سيب بيانات التواصل الأساسية وسنكمل الطلب بهدوء مع متابعة واضحة حتى التسليم.'
      : isCommandCheckout
        ? 'اكتب الاسم والموبايل الصحيحين لتأكيد الموديل وموعد التوصيل أو أي مراجعة قبل الشحن.'
      : 'اكتب بيانات التواصل الرئيسية حتى نقدر نؤكد الطلب ونتابع التوصيل.');

  const shippingTitle = settings?.shippingTitle || 'عنوان الشحن';
  const configuredShippingDescription =
    typeof settings?.shippingDescription === 'string'
      ? settings.shippingDescription
      : undefined;
  const shippingDescription =
    configuredShippingDescription ??
    (isBiteRush
      ? 'العنوان الدقيق يسرّع المندوب ويقلل أي مكالمة إضافية قبل الوصول.'
      : isMarketCheckout
        ? 'العنوان الواضح يسهّل تثبيت الشحن من أول مرة ويقلل أي تأخير قبل التسليم.'
      : isNatureCheckout
        ? 'العنوان الواضح يساعدنا نثبت المحافظة والشحن بطريقة أبسط وأهدأ.'
      : isCommandCheckout
        ? 'العنوان الدقيق يقلل المكالمات ويُسرّع تسليم الأجهزة والإكسسوارات بأمان.'
      : 'هذه البيانات تساعدنا في تحديد المحافظة وحساب تكلفة الشحن بشكل أدق.');

  const notesTitle = settings?.notesTitle || 'ملاحظات على الطلب';
  const notesDescription =
    settings?.notesDescription ||
    (isBiteRush
      ? 'اكتب الدور أو علامة مميزة أو أي طلب خاص عشان الطلب يوصلك مضبوط.'
      : isMarketCheckout
        ? 'اكتب أي علامة مميزة أو وقت مناسب للتواصل أو ملاحظة تساعدنا نجهز الطلب أسرع.'
      : isNatureCheckout
        ? 'أضف أي ملاحظة خاصة بالتوصيل أو التغليف أو طريقة الاستلام لو تحب.'
      : isCommandCheckout
        ? 'اكتب لو محتاج فاتورة باسم شركة، مكالمة قبل الشحن، أو مراجعة توافق قطعة مع جهازك.'
      : 'يمكنك إضافة أي ملاحظات خاصة بالتوصيل أو تفاصيل إضافية عن الطلب.');

  const notesOptionalLabel = settings?.notesOptionalLabel || '(اختياري)';
  const fullNameLabel = settings?.fullNameLabel || 'الاسم الكامل';
  const fullNamePlaceholder = settings?.fullNamePlaceholder || 'مثال: سارة أحمد';
  const emailLabel = settings?.emailLabel || 'البريد الإلكتروني';
  const emailPlaceholder = settings?.emailPlaceholder || 'name@example.com';
  const phoneLabel = settings?.phoneLabel || 'رقم الهاتف';
  const phonePlaceholder = settings?.phonePlaceholder || '01xxxxxxxxx';
  const addressLabel = settings?.addressLabel || 'العنوان بالتفصيل';
  const addressPlaceholder =
    settings?.addressPlaceholder || 'الشارع، المنطقة، ورقم العمارة';
  const cityLabel = settings?.cityLabel || 'المدينة';
  const cityPlaceholder = settings?.cityPlaceholder || 'مثال: مدينة نصر';
  const governorateLabel = settings?.governorateLabel || 'المحافظة';
  const governoratePlaceholder =
    settings?.governoratePlaceholder || 'اختر المحافظة';
  const notesPlaceholder =
    settings?.notesPlaceholder || 'أي ملاحظات خاصة بالتوصيل أو الطلب';
  const showNotesSection = parseBooleanSetting(
    settings?.showNotesSection,
    true,
  );
  const autoDetectHint =
    settings?.autoDetectHint ||
    (isBiteRush
      ? 'اكتب المدينة أو جزءًا من العنوان وسنقترح المحافظة تلقائيًا.'
      : isMarketCheckout
        ? 'اكتب المدينة أو جزءًا من العنوان وسنساعدك في اقتراح المحافظة تلقائيًا.'
      : 'سنحاول اقتراح المحافظة تلقائيًا من المدينة أو العنوان.');
  const autoDetectSuccessText =
    settings?.autoDetectSuccessText ||
    (isBiteRush
      ? 'حددنا المحافظة تلقائيًا؛ راجعها بسرعة ثم كمّل الطلب.'
      : isMarketCheckout
        ? 'تم اقتراح المحافظة تلقائيًا. راجعها بسرعة ثم أكمل تأكيد الطلب.'
      : isNatureCheckout
        ? 'اقترحنا المحافظة تلقائيًا ويمكنك تعديلها بسهولة قبل المتابعة.'
      : isCommandCheckout
        ? 'تم اقتراح المحافظة تلقائيًا. راجعها بسرعة ثم أكمل تأكيد الطلب.'
      : 'تم اقتراح المحافظة تلقائيًا ويمكنك تعديلها إذا لزم.');
  const assuranceBadge = settings?.assuranceBadge || 'إتمام آمن';
  const assuranceTitle =
    settings?.assuranceTitle ||
    (isCommandCheckout
      ? '3 خطوات واضحة من البيانات حتى اعتماد الطلب.'
      : isMarketCheckout
        ? 'تجهيز واضح من البيانات حتى تثبيت الطلب.'
        : isNatureCheckout
          ? 'تدفق هادئ من البيانات حتى التأكيد النهائي.'
          : '');
  const assuranceItems = parseListSetting(settings?.assuranceItems, [
    ...(isMarketCheckout
      ? [
          'مراجعة الاسم والرقم قبل التنفيذ',
          'تثبيت المحافظة والشحن بوضوح',
          'متابعة سريعة حتى التسليم',
        ]
      : isNatureCheckout
        ? [
            'مراجعة البيانات بهدوء قبل التنفيذ',
            'تغليف مناسب للمنتجات الحساسة',
            'متابعة واضحة حتى الاستلام',
          ]
        : [
            'تأكيد بياناتك قبل التنفيذ',
            'تغليف محمي للأجهزة والإكسسوارات',
            'متابعة معك حتى التسليم',
          ]),
  ]);

  const returningCustomerText =
    theme.direction === 'rtl'
      ? 'عندك حساب أو طلب قديم؟'
      : 'Returning customer?';
  const returningCustomerHint =
    theme.direction === 'rtl'
      ? 'سجّل دخولك واسحب بياناتك فورًا بدل من كتابتها من جديد.'
      : 'Sign in to speed up checkout and restore saved customer details.';
  const loginLinkText =
    theme.direction === 'rtl'
      ? 'دخول سريع'
      : 'Click here to login';

  const renderStepNumber = (num: number, color: string) => {
    if (isKhemetLuxe) {
      return null;
    }

    if (variant === 'safe-adventure') {
      return (
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color} rotate-3 text-lg font-black text-white shadow-lg transition-transform hover:rotate-0 hover:scale-110`}>
          {num}
        </div>
      );
    }
    return (
      <span className={stepBadgeClassName}>
        {num}
      </span>
    );
  };

  const stepHeadingClassName =
    variant === 'safe-adventure'
      ? 'flex items-center gap-4 font-heading text-xl font-black text-foreground'
      : isKhemetLuxe
        ? 'font-heading text-[1.08rem] font-bold text-[#111111]'
      : variant === 'soft-flow' || variant === 'nature-checkout' || variant === 'market-checkout' || variant === 'fitting-room-checkout'
        ? 'flex items-center gap-3 font-heading text-[1.1rem] font-black text-foreground'
      : 'flex items-center gap-2 font-heading text-lg font-bold text-foreground';

  const loginLinkClassName = isBiteRush
    ? 'inline-flex w-fit items-center justify-center rounded-full border border-[#111111] bg-[#111111] px-5 py-2.5 text-sm font-black text-white transition-all hover:-translate-y-0.5 hover:bg-[#f97316] hover:border-[#f97316]'
    : isKhemetLuxe
      ? 'inline-flex w-fit items-center justify-center rounded-[0.75rem] border border-[#e7ddd0] bg-white px-4 py-2.5 text-sm font-semibold text-[#725523] transition-colors hover:border-[#b89255] hover:bg-[#fcf8f2]'
    : isMarketCheckout
      ? 'inline-flex w-fit items-center justify-center rounded-full border border-[#f0d4b0] bg-white px-5 py-2.5 text-sm font-semibold text-[#8b6037] transition-colors hover:border-[#c9874a] hover:text-[#6b4423]'
    : isCommandCheckout
      ? 'inline-flex w-fit items-center justify-center rounded-full border border-[#ead8b1] bg-white px-5 py-2.5 text-sm font-semibold text-[#6d5527] transition-colors hover:border-[#d4a64a] hover:text-[#2b2a25]'
    : isNatureCheckout
      ? 'inline-flex w-fit items-center justify-center rounded-full border border-[#dbe3d4] bg-white px-5 py-2.5 text-sm font-semibold text-[#4a6843] transition-colors hover:border-[#88a876] hover:text-[#1f3a2d]'
    : isFittingRoomCheckout
      ? 'inline-flex w-fit items-center justify-center rounded-[1rem] border border-[#efe5dd] bg-[#f7f4f1] px-5 py-2.5 text-sm font-semibold text-[#242220] transition-colors hover:border-[#d8cec4] hover:bg-white'
    : isSoftFlow
      ? 'inline-flex w-fit items-center justify-center rounded-full border border-[#ead9d8] bg-white px-5 py-2.5 text-sm font-semibold text-[#8b3d33] transition-colors hover:border-[#f08a76] hover:text-[#8b3d33]'
    : 'inline-flex w-fit items-center justify-center rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/25 hover:text-primary';

  const introTextClassName = isWomenFashionCheckout
    ? 'text-sm leading-5 text-muted-foreground'
    : isFittingRoomCheckout
      ? 'text-sm leading-5 text-[#8a837c]'
    : isKhemetLuxe
      ? 'text-[13px] leading-6 text-[#8a7a63]'
    : 'text-sm leading-6 text-muted-foreground';

  const contactGridClassName = isWomenFashionCheckout
    ? 'grid grid-cols-1 gap-3 sm:grid-cols-2'
    : isFittingRoomCheckout
      ? 'grid grid-cols-1 gap-3 sm:grid-cols-2'
    : 'grid grid-cols-1 gap-4 md:grid-cols-2';

  const shippingGridClassName = isWomenFashionCheckout
    ? 'grid grid-cols-1 gap-3 sm:grid-cols-2'
    : isFittingRoomCheckout
      ? 'grid grid-cols-1 gap-3 sm:grid-cols-2'
    : 'grid grid-cols-1 gap-4 md:grid-cols-2';

  const notesTextareaClassName = `${inputClassName} ${
    isWomenFashionCheckout || isFittingRoomCheckout ? 'h-20 resize-none' : 'h-24 resize-none'
  }`;

  const loginStripClassName = isKhemetLuxe
    ? 'flex flex-col gap-4 rounded-[0.95rem] border border-[#e7ddd0] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between'
    : stepWrapperClassName(variant);

  return {
    items,
    formData,
    updateFormData,
    theme,
    variant,
    isAirlume,
    isZenOrganic,
    isBiteRush,
    isKhemetLuxe,
    isMarketCheckout,
    isNatureCheckout,
    isSoftFlow,
    isCommandCheckout,
    isFittingRoomCheckout,
    isButcherCheckout,
    isWomenFashionCheckout,
    hasNatureCheckoutTone,
    hasEnhancedCheckoutIntro,
    loginPath,
    handleChange,
    handlePhoneBlur,
    inputClassName,
    sectionStackClassName,
    stepBadgeClassName,
    labelClassName,
    stepWrapperClassName,
    autoHintClassName,
    autoSuccessClassName,
    contactTitle,
    contactDescription,
    shippingTitle,
    shippingDescription,
    notesTitle,
    notesDescription,
    notesOptionalLabel,
    fullNameLabel,
    fullNamePlaceholder,
    emailLabel,
    emailPlaceholder,
    phoneLabel,
    phonePlaceholder,
    addressLabel,
    addressPlaceholder,
    cityLabel,
    cityPlaceholder,
    governorateLabel,
    governoratePlaceholder,
    notesPlaceholder,
    showNotesSection,
    autoDetectHint,
    autoDetectSuccessText,
    assuranceBadge,
    assuranceTitle,
    assuranceItems,
    returningCustomerText,
    returningCustomerHint,
    loginLinkText,
    renderStepNumber,
    stepHeadingClassName,
    loginLinkClassName,
    introTextClassName,
    contactGridClassName,
    shippingGridClassName,
    notesTextareaClassName,
    loginStripClassName,
  };
};
