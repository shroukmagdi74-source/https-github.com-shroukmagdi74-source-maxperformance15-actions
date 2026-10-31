import React from 'react';
import { Link } from 'react-router-dom';
import type { ProductInfoController } from '../productInfoTypes';
import QuantitySelector from '../../../components/QuantitySelector';
import VariantSelector from '../../../components/VariantSelector';
import ConfigurableTrustBadges from '../components/ConfigurableTrustBadges';
import {
  STOREFRONT_BUYBOX_ID,
  STOREFRONT_PRODUCT_DESCRIPTION_ID,
  STOREFRONT_REVIEWS_SECTION_ID,
} from '../productInfoHelpers';
import { Facebook, Twitter, Share2 } from 'lucide-react';

export interface GearLoadoutBuyboxProps {
  ctrl: ProductInfoController;
}

export const GearLoadoutBuybox: React.FC<GearLoadoutBuyboxProps> = ({ ctrl }) => {
  const {
    product,
    prefersArabicCopy,
    homePath,
    shopPath,
    breadcrumbHomeLabel,
    breadcrumbShopLabel,
    displayPrice,
    originalPrice,
    discount,
    quantity,
    setQuantity,
    handleAddToCart,
    handleBuyNow,
    handleShareAction,
    addToCartText,
    buyNowText,
    descriptionTitle,
    shippingTitle,
    shippingText,
    guaranteesTitle,
    guaranteesSubtitle,
    guaranteeItems,
    guaranteeStyle,
    externalOnlyProduct,
    showExternalAffiliateCta,
    renderExternalPurchaseCta,
    shouldRenderPrimaryBuyBox,
    hasEmbeddedPdpCheckout,
    inlinePdpQuickOrderFallback,
    shortDescription,
    safeDescription,
    selectedAttributes,
    setSelectedAttributes,
    variantSettings,
    specs,
  } = ctrl;

  if (!product) return null;

  const productTagValues = Array.isArray(product.tags) ? product.tags : [];
  const gearTagValues = productTagValues;
  const gearCategoryLabel =
    typeof product.category?.name === 'string' && product.category.name.trim()
      ? product.category.name.trim()
      : typeof product.categoryId === 'string' && product.categoryId.trim()
        ? product.categoryId.trim()
        : 'Gaming Gear';

  const normalizedSpecs = specs
    .map((spec) => ({
      label: String(spec.label || '').trim(),
      value: String(spec.value || '').trim(),
    }))
    .filter((spec) => spec.label && spec.value);

  const gearFallbackFacts = [
    {
      label: prefersArabicCopy ? 'الفئة' : 'Category',
      value: gearCategoryLabel,
    },
    {
      label: prefersArabicCopy ? 'التهيئة' : 'Setup',
      value:
        product.productVariants && product.productVariants.length > 0
          ? prefersArabicCopy
            ? 'خيارات متعددة جاهزة للتخصيص'
            : 'Multiple configurations available'
          : prefersArabicCopy
            ? 'جاهز للشراء مباشرة'
            : 'Ready for instant checkout',
    },
    {
      label: prefersArabicCopy ? 'الشحن' : 'Shipping',
      value: prefersArabicCopy
        ? 'الرسوم والتجهيز تظهر بوضوح قبل اعتماد الطلب.'
        : 'Shipping and handling stay visible before final checkout.',
    },
    {
      label: prefersArabicCopy ? 'الدعم' : 'Support',
      value:
        guaranteeItems[0]?.title?.trim() ||
        (prefersArabicCopy ? 'دعم واضح بعد الشراء' : 'Clear post-purchase support'),
    },
  ];

  const gearQuickFacts = [...normalizedSpecs.slice(0, 2), ...gearFallbackFacts]
    .filter(
      (fact, index, array) =>
        array.findIndex((candidate) => candidate.label === fact.label) === index,
    )
    .slice(0, 4);

  const gearSupportItems = (
    guaranteeItems.length
      ? guaranteeItems
      : [
          {
            title: prefersArabicCopy ? 'اختيارات موثوقة' : 'Trusted picks',
            description: prefersArabicCopy
              ? 'كل قطعة تمر برسالة خدمة أوضح قبل غلق الطلب.'
              : 'Each product keeps service messaging visible before checkout.',
          },
          {
            title: prefersArabicCopy ? 'شحن أوضح' : 'Clear shipping',
            description: prefersArabicCopy
              ? 'تظهر الرسوم وخطوات التوصيل داخل مسار الشراء نفسه.'
              : 'Delivery cost and steps stay visible in the purchase flow.',
          },
          {
            title: prefersArabicCopy ? 'تجهيز أسرع' : 'Faster setup',
            description: prefersArabicCopy
              ? 'اقتراحات الباندل والإضافات تقلل وقت اتخاذ القرار.'
              : 'Bundle suggestions reduce decision time for full setups.',
          },
        ]
  ).slice(0, 3);

  const gearStatusChips = [
    discount && discount > 0
      ? prefersArabicCopy
        ? `وفر ${discount}%`
        : `Save ${discount}%`
      : product.productVariants && product.productVariants.length > 0
        ? prefersArabicCopy
          ? 'قابل للتخصيص'
          : 'Configurable'
        : prefersArabicCopy
          ? 'جاهز الآن'
          : 'Ready now',
    ...gearTagValues.slice(0, 2),
  ].filter(Boolean) as string[];

  const gearSummaryText =
    shortDescription ||
    (prefersArabicCopy
      ? 'جمعنا لك أهم التفاصيل وخيارات الشراء والإضافات المرتبطة في مسار واحد أوضح حتى تحسم اختيارك بسرعة.'
      : 'Key details, purchase options, and related add-ons are grouped into one clearer buying flow.');

  const handleQuickScroll = (targetId: string, block: ScrollLogicalPosition = 'start') => {
    if (typeof document === 'undefined') return;
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block });
    }
  };

  return (
    <section className="w-full overflow-hidden px-1 py-4">
      <div className="relative isolate overflow-hidden rounded-[2.15rem] border border-cyan-400/15 bg-[linear-gradient(180deg,rgba(3,7,18,0.98),rgba(10,14,29,0.94))] p-5 text-slate-50 shadow-[0_42px_140px_-88px_rgba(34,211,238,0.72)] md:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.14),transparent_28%)]" />
        <div className="pointer-events-none absolute -left-12 top-8 h-32 w-32 rounded-full bg-cyan-400/14 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-10 h-40 w-40 rounded-full bg-primary/12 blur-3xl" />

        <div className="relative z-10 space-y-6">
          <nav className="flex flex-wrap items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
            <Link to={homePath} className="transition-colors hover:text-cyan-100">
              {breadcrumbHomeLabel}
            </Link>
            <span>/</span>
            <Link to={shopPath} className="transition-colors hover:text-cyan-100">
              {breadcrumbShopLabel}
            </Link>
            <span>/</span>
            <span className="max-w-[18rem] truncate text-slate-200">{product.name}</span>
          </nav>

          <div className="flex flex-wrap gap-2">
            {gearStatusChips.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100/85"
              >
                {chip}
              </span>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
            <div className="space-y-3">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-200/70">
                {gearCategoryLabel}
              </p>
              <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl md:leading-[0.95]">
                {product.name}
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-slate-300 md:text-base md:leading-8">
                {gearSummaryText}
              </p>
            </div>

            <div className="rounded-[1.6rem] border border-cyan-400/20 bg-white/[0.05] px-5 py-4 shadow-[0_28px_80px_-60px_rgba(34,211,238,0.65)]">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-200/70">
                {prefersArabicCopy ? 'السعر الحالي' : 'Live Price'}
              </p>
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <span className="text-4xl font-black text-white">{displayPrice}</span>
                {originalPrice ? (
                  <span className="text-base font-semibold text-slate-400 line-through">
                    {originalPrice}
                  </span>
                ) : null}
              </div>
              <div className="mt-4 inline-flex rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-200/80">
                {discount && discount > 0
                  ? prefersArabicCopy
                    ? `وفر ${discount}%`
                    : `Save ${discount}%`
                  : prefersArabicCopy
                    ? 'الشحن واضح عند الدفع'
                    : 'Shipping stays visible at checkout'}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {gearQuickFacts.map((fact) => (
              <div
                key={`${fact.label}:${fact.value}`}
                className="rounded-[1.35rem] border border-white/10 bg-white/[0.05] p-4 shadow-[0_20px_50px_-45px_rgba(15,23,42,0.95)]"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200/65">
                  {fact.label}
                </p>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-100">
                  {fact.value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
            <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_32px_90px_-70px_rgba(15,23,42,0.88)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-200/70">
                    {prefersArabicCopy ? 'اختيار الجير' : 'Gear Setup'}
                  </p>
                  <p className="text-sm leading-6 text-slate-300/80">
                    {prefersArabicCopy
                      ? 'ابدأ من النسخة المناسبة ثم أغلق الطلب أو أضف الإكسسوارات في نفس المسار.'
                      : 'Configure the main item first, then complete the order or add matching accessories in the same flow.'}
                  </p>
                </div>
                <span className="inline-flex rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-200/75">
                  {product.productVariants && product.productVariants.length > 0
                    ? prefersArabicCopy
                      ? `${product.productVariants.length} خيارات`
                      : `${product.productVariants.length} options`
                    : prefersArabicCopy
                      ? 'قطعة واحدة'
                      : 'Single setup'}
                </span>
              </div>

              <div className="mt-5">
                {product.productVariants && product.productVariants.length > 0 ? (
                  <div
                    id={hasEmbeddedPdpCheckout ? STOREFRONT_BUYBOX_ID : undefined}
                    className="space-y-4"
                  >
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200/70">
                        {prefersArabicCopy ? 'التخصيص' : 'Loadout'}
                      </p>
                      <p className="text-sm leading-6 text-slate-300/78">
                        {prefersArabicCopy
                          ? 'اختر النسخة أو اللون أو المقاس المناسب قبل تأكيد الإضافة للسلة.'
                          : 'Pick the right configuration before you lock the item into the cart.'}
                      </p>
                    </div>
                    <VariantSelector
                      variants={product.productVariants}
                      selectedAttributes={selectedAttributes}
                      onChange={setSelectedAttributes}
                      variantSettings={variantSettings}
                    />
                  </div>
                ) : (
                  <div className="rounded-[1.35rem] border border-dashed border-white/12 bg-black/20 p-4 text-sm leading-7 text-slate-300/78">
                    {prefersArabicCopy
                      ? 'هذا المنتج جاهز للإضافة المباشرة بدون إعدادات إضافية. لو تريد مقارنة بدائل قريبة ستجدها أسفل الصفحة.'
                      : 'This product is ready for direct checkout without extra configuration. Close alternatives are available lower on the page.'}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-1 sm:hidden">
                {[
                  {
                    label: prefersArabicCopy ? 'عام' : 'General',
                    targetId: hasEmbeddedPdpCheckout ? 'checkout-form' : STOREFRONT_BUYBOX_ID,
                  },
                  {
                    label: descriptionTitle,
                    targetId: STOREFRONT_PRODUCT_DESCRIPTION_ID,
                  },
                  {
                    label: prefersArabicCopy ? 'التقييمات' : 'Reviews',
                    targetId: STOREFRONT_REVIEWS_SECTION_ID,
                  },
                ].map((item) => (
                  <button
                    key={item.targetId}
                    type="button"
                    onClick={() => handleQuickScroll(item.targetId)}
                    className="inline-flex shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-300/30 hover:text-cyan-100"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="rounded-[1.7rem] border border-cyan-400/18 bg-white/[0.05] p-5 shadow-[0_32px_90px_-68px_rgba(34,211,238,0.5)]">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-200/70">
                    {prefersArabicCopy ? 'قفل الطلب' : 'Lock The Order'}
                  </p>
                  <p className="text-sm leading-6 text-slate-300/80">
                    {prefersArabicCopy
                      ? 'خذ قرار الشراء من نفس اللوحة مع كمية واضحة ورسائل دعم قبل ما تغلق السلة.'
                      : 'Complete the purchase from the same panel with clear quantity and support cues before checkout.'}
                  </p>
                </div>

                <div className="mt-5 space-y-4">
                  {externalOnlyProduct ? (
                    renderExternalPurchaseCta('card')
                  ) : shouldRenderPrimaryBuyBox ? (
                    <>
                      <div
                        id={hasEmbeddedPdpCheckout ? undefined : STOREFRONT_BUYBOX_ID}
                        className="flex flex-col gap-3"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <QuantitySelector value={quantity} onChange={setQuantity} />
                          <button
                            type="button"
                            onClick={handleAddToCart}
                            className="h-14 flex-1 rounded-[1.2rem] border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(6,182,212,0.95),rgba(59,130,246,0.95))] px-5 text-sm font-black uppercase tracking-[0.2em] text-white shadow-[0_24px_70px_-34px_rgba(34,211,238,0.55)] transition-all hover:brightness-105 active:scale-[0.98]"
                          >
                            {addToCartText}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={handleBuyNow}
                          className="h-12 rounded-[1rem] border border-white/12 bg-black/28 text-sm font-black uppercase tracking-[0.18em] text-slate-100 transition-colors hover:border-cyan-300/35 hover:text-cyan-100"
                        >
                          {buyNowText}
                        </button>
                      </div>
                      {showExternalAffiliateCta ? (
                        <div className="pt-1">{renderExternalPurchaseCta('inline')}</div>
                      ) : null}
                    </>
                  ) : showExternalAffiliateCta ? (
                    renderExternalPurchaseCta('block')
                  ) : null}

                  {inlinePdpQuickOrderFallback}
                </div>

                <div className="flex items-center gap-6 pt-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100/55">
                    {prefersArabicCopy ? 'شاركي' : 'Share'}
                  </span>
                  <div className="flex gap-3 text-slate-300/75">
                    {[
                      { id: 'facebook', label: prefersArabicCopy ? 'فيسبوك' : 'Facebook', icon: Facebook },
                      { id: 'twitter', label: prefersArabicCopy ? 'إكس' : 'X', icon: Twitter },
                      { id: 'copy', label: prefersArabicCopy ? 'نسخ الرابط' : 'Copy link', icon: Share2 },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            void handleShareAction(item.id);
                          }}
                          aria-label={item.label}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-slate-200 transition-colors hover:border-cyan-300/30 hover:text-cyan-100"
                        >
                          <Icon size={16} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
            <div
              id={STOREFRONT_PRODUCT_DESCRIPTION_ID}
              className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_32px_96px_-74px_rgba(15,23,42,0.9)] md:p-6"
            >
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-200/70">
                  {descriptionTitle}
                </p>
                <p className="text-sm leading-6 text-slate-300/78">
                  {prefersArabicCopy
                    ? 'رسالة أوضح عن الاستخدام والميزة الأساسية حتى لا تعتمد الصفحة على الصور وحدها.'
                    : 'A clearer usage and value story so the page does not rely on imagery alone.'}
                </p>
              </div>

              <div className="mt-5">
                {safeDescription ? (
                  <div
                    className="prose prose-sm max-w-none text-slate-100 prose-headings:text-white prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-white prose-a:text-cyan-200"
                    dangerouslySetInnerHTML={{ __html: safeDescription }}
                  />
                ) : (
                  <p className="text-sm leading-8 text-slate-300/82">
                    {prefersArabicCopy
                      ? 'لا يوجد وصف تفصيلي لهذا المنتج بعد، لكن الصفحة الحالية أبقت المواصفات والشراء والثقة في مسار واحد أوضح.'
                      : 'Detailed copy is not available for this product yet, but the page now keeps specifications, purchase actions, and trust cues in one clearer flow.'}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_32px_96px_-74px_rgba(15,23,42,0.9)]">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-200/70">
                  {shippingTitle}
                </p>
                <p className="mt-4 text-sm leading-7 text-slate-300/82">
                  {shippingText}
                </p>

                <div className="mt-5 grid gap-3">
                  {gearSupportItems.map((item, index) => (
                    <div
                      key={`${item.title || 'support'}-${index}`}
                      className="rounded-[1.2rem] border border-white/10 bg-black/22 px-4 py-3"
                    >
                      <p className="text-sm font-black text-white">
                        {item.title || (prefersArabicCopy ? 'ميزة إضافية' : 'Support signal')}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-300/78">
                        {item.description ||
                          (prefersArabicCopy
                            ? 'رسالة ثقة إضافية تساعدك تحسم قبل إغلاق الطلب.'
                            : 'An extra reassurance message that helps close the purchase faster.')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_32px_96px_-74px_rgba(15,23,42,0.9)]">
                <ConfigurableTrustBadges
                  title={guaranteesTitle}
                  subtitle={guaranteesSubtitle}
                  items={guaranteeItems.length ? guaranteeItems : undefined}
                  variant={guaranteeStyle === 'grid' ? 'minimal' : guaranteeStyle}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GearLoadoutBuybox;
