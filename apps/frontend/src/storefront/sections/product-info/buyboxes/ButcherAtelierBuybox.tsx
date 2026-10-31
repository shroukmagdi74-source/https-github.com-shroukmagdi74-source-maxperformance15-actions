import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck } from 'lucide-react';
import type { ProductInfoController } from '../productInfoTypes';
import ProductDescription from '../components/ProductDescription';
import { buildOptimizedStorefrontImageUrl } from '../../../utils/productImages';

export interface ButcherAtelierBuyboxProps {
  ctrl: ProductInfoController;
}

export const ButcherAtelierBuybox: React.FC<ButcherAtelierBuyboxProps> = ({ ctrl }) => {
  const {
    product,
    prefersArabicCopy,
    homePath,
    shopPath,
    breadcrumbHomeLabel,
    breadcrumbShopLabel,
    displayPrice,
    originalPrice,
    handleAddToCart,
    safeDescription,
    descriptionPreviewText,
  } = ctrl;

  const [butcherWeight, setButcherWeight] = useState(1);
  const [butcherPrep, setButcherPrep] = useState<Record<string, string>>({
    cut: prefersArabicCopy ? 'مكعبات' : 'Cubes',
    trim: prefersArabicCopy ? 'وسط' : 'Regular',
  });

  if (!product) return null;

  const butcherBadge = prefersArabicCopy ? 'درجة فاخرة • طازج يومياً' : 'PRIME GRADE • DAILY FRESH';
  const pricePerKgLabel = prefersArabicCopy ? 'السعر للكيلو' : 'Price per KG';
  const weightSelectorLabel = prefersArabicCopy ? 'اختر الوزن المطلوب' : 'Select Weight';
  const prepRoomLabel = prefersArabicCopy ? 'تجهيز غرفة التقطيع' : 'Prep Room Configuration';
  const butcherBuyCta = prefersArabicCopy ? 'تجهيز الطلب الآن' : 'Prepare My Order';

  const primaryImage =
    (Array.isArray(product.images) && product.images[0]) ||
    (product as any).imageUrl ||
    (product as any).image ||
    '/placeholder-meat.jpg';

  return (
    <section className="w-full bg-[#f9f5f2] scroll-mt-20 selection:bg-[#3f0c0d] selection:text-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <nav className="mb-8 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] text-[#3f0c0d]/40">
          <Link to={homePath} className="transition-colors hover:text-[#3f0c0d]">{breadcrumbHomeLabel}</Link>
          <span className="h-1 w-1 rounded-full bg-[#c5a059]" />
          <Link to={shopPath} className="transition-colors hover:text-[#3f0c0d]">{breadcrumbShopLabel}</Link>
          <span className="h-1 w-1 rounded-full bg-[#c5a059]" />
          <span className="text-[#3f0c0d]">{product.name}</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-10">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-white p-2 shadow-[0_40px_100px_-40px_rgba(63,12,13,0.15)]">
              <div className="absolute left-8 top-8 z-10">
                <span className="rounded-full bg-[#3f0c0d] px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059] shadow-2xl">
                  {butcherBadge}
                </span>
              </div>
              <div className="aspect-[4/5] overflow-hidden rounded-[2rem]">
                <img
                  src={buildOptimizedStorefrontImageUrl(primaryImage, { width: 320, quality: 76 })}
                  loading="lazy"
                  decoding="async"
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-1000 hover:scale-105"
                />
              </div>
            </div>

            <div className="rounded-[2.5rem] border border-[#efe1da] bg-white/50 p-8 backdrop-blur-sm">
              <h3 className="mb-6 text-xl font-black italic text-[#3f0c0d]">{prefersArabicCopy ? 'ملاحظات الجزار' : 'Master Butcher Notes'}</h3>
              <div className="grid gap-6 sm:grid-cols-2">
                {[
                  { label: prefersArabicCopy ? 'التعتيق' : 'Aging', value: prefersArabicCopy ? '21 يوم' : '21 Days Dry-Aged' },
                  { label: prefersArabicCopy ? 'المصدر' : 'Source', value: prefersArabicCopy ? 'مزارعنا الخاصة' : 'Local Premium Farm' },
                  { label: prefersArabicCopy ? 'الرخامية' : 'Marbling', value: 'Grade A+' },
                  { label: prefersArabicCopy ? 'القطع' : 'Cut', value: product.category?.name || 'Prime' },
                ].map((note) => (
                  <div key={note.label} className="border-s-2 border-[#c5a059] ps-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#3f0c0d]/50">{note.label}</p>
                    <p className="mt-1 text-sm font-bold text-[#3f0c0d]">{note.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-8 lg:ps-8">
            <div className="space-y-4">
              <h1 className="font-heading text-4xl font-black tracking-tight text-[#3f0c0d] md:text-6xl">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-4xl font-black text-[#3f0c0d]">{displayPrice}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">{pricePerKgLabel}</span>
                </div>
                {originalPrice && (
                  <span className="text-xl text-[#3f0c0d]/30 line-through">{originalPrice}</span>
                )}
              </div>
            </div>

            <div className="prose prose-sm max-w-none text-[#3f0c0d]/70">
              <ProductDescription safeDescription={safeDescription} emptyText={descriptionPreviewText} />
            </div>

            <div className="space-y-6 rounded-[2.5rem] bg-[#3f0c0d] p-8 text-white shadow-2xl">
              <div className="space-y-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#c5a059]">{weightSelectorLabel}</p>
                <div className="flex flex-wrap gap-3">
                  {[0.5, 1, 1.5, 2, 5].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setButcherWeight(w)}
                      className={`group relative flex h-16 w-16 items-center justify-center rounded-2xl border-2 transition-all ${
                        butcherWeight === w
                          ? 'border-[#c5a059] bg-[#c5a059] text-[#3f0c0d]'
                          : 'border-white/10 bg-white/5 hover:border-[#c5a059]/50'
                      }`}
                    >
                      <span className="text-lg font-black">{w}</span>
                      <span className="absolute bottom-1 text-[8px] font-black uppercase">{prefersArabicCopy ? 'كجم' : 'KG'}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-white/10" />

              <div className="space-y-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#c5a059]">{prepRoomLabel}</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { key: 'cut', options: prefersArabicCopy ? ['مكعبات', 'شرائح', 'قطعة كاملة'] : ['Cubes', 'Steaks', 'Whole'] },
                    { key: 'trim', options: prefersArabicCopy ? ['وسط', 'بدون دهن', 'دسم'] : ['Regular', 'Trimmed', 'Fat-on'] },
                  ].map((pref) => (
                    <select
                      key={pref.key}
                      value={butcherPrep[pref.key]}
                      onChange={(e) => setButcherPrep((prev) => ({ ...prev, [pref.key]: e.target.value }))}
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-bold text-white outline-none focus:border-[#c5a059]"
                    >
                      {pref.options.map((o) => (
                        <option key={o} value={o} className="bg-[#3f0c0d]">
                          {o}
                        </option>
                      ))}
                    </select>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-bold opacity-60">{prefersArabicCopy ? 'إجمالي الوزن:' : 'Total Weight:'}</span>
                  <span className="text-xl font-black text-[#c5a059]">{butcherWeight} {prefersArabicCopy ? 'كجم' : 'KG'}</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="group relative h-16 w-full overflow-hidden rounded-2xl bg-[#c5a059] text-lg font-black uppercase tracking-widest text-[#3f0c0d] transition-all hover:scale-[1.02] active:scale-95"
                >
                  <span className="relative z-10">{butcherBuyCta}</span>
                  <div className="absolute inset-0 -translate-x-full bg-white/20 transition-transform group-hover:translate-x-0" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-6 rounded-[2rem] border border-[#efe1da] p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#c5a059]/10 text-[#c5a059]">
                <Truck size={24} />
              </div>
              <div>
                <p className="text-sm font-black text-[#3f0c0d]">{prefersArabicCopy ? 'توصيل مبرد مضمون' : 'Cold-Chain Delivery'}</p>
                <p className="text-xs text-[#3f0c0d]/60">{prefersArabicCopy ? 'يصلك طازجاً في حافظات حرارية' : 'Arrives fresh in thermal artisan packaging'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ButcherAtelierBuybox;
