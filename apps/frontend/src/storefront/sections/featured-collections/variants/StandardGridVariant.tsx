import React from 'react';
import { Link } from 'react-router-dom';
import { FeaturedCollectionsController } from '../useFeaturedCollectionsController';
import {
  SmartBazaarCategoryScene,
  isSmartBazaarThemeAssetImage,
  resolveSmartBazaarSceneKey,
} from '../../../components/SmartBazaarMockups';

export const StandardGridVariant: React.FC<{
  ctrl: FeaturedCollectionsController;
}> = ({ ctrl }) => {
  const {
    variant,
    collectionCards,
    theme,
    isSoleaFemme,
    isBiteRush,
    isCafeDemo,
    isKidsPlay,
    isSmartBazaar,
    isFakhama,
    isAtelierNova,
  } = ctrl;

  return (
    <div
      className={`grid grid-cols-1 ${
        variant === 'fast-nav-grid'
          ? 'gap-4 sm:grid-cols-2 xl:grid-cols-4'
          : 'gap-5 sm:grid-cols-2 xl:grid-cols-3'
      }`}
    >
      {collectionCards.map((collection, index) => (
        <Link
          key={collection.id}
          to={collection.href}
          className={`group overflow-hidden rounded-[var(--radius)] transition-all duration-300 hover:-translate-y-1 ${
            isSoleaFemme
              ? `border border-primary/10 bg-card/90 shadow-[0_28px_80px_-50px_hsl(var(--primary)/0.7)] ${
                  index === 0 ? 'xl:col-span-2' : ''
                }`
              : isBiteRush
                ? `border-2 border-white bg-white shadow-[0_26px_70px_-34px_rgba(17,17,17,0.14)] hover:shadow-[0_34px_90px_-42px_rgba(17,17,17,0.18)] ${
                    index === 0 ? 'xl:col-span-2' : ''
                  }`
                : isCafeDemo
                  ? `border border-[#e7d6c5] bg-[linear-gradient(180deg,#fffdfa_0%,#fff5ea_100%)] shadow-[0_26px_72px_-40px_rgba(75,46,31,0.18)] hover:shadow-[0_36px_92px_-46px_rgba(75,46,31,0.24)] ${
                      index === 0 ? 'xl:col-span-2' : ''
                    }`
                  : isKidsPlay || variant === 'floating-bubbles'
                    ? `border-0 bg-transparent shadow-none hover:translate-y-0 ${
                        variant === 'floating-bubbles'
                          ? 'flex flex-col items-center'
                          : ''
                      }`
                    : isSmartBazaar
                      ? `border border-primary/10 bg-card shadow-[0_24px_80px_-58px_hsl(var(--primary)/0.45)] hover:shadow-[0_30px_90px_-54px_hsl(var(--primary)/0.55)] ${
                          variant === 'fast-nav-grid'
                            ? ''
                            : index === 0
                              ? 'xl:col-span-2'
                              : ''
                        }`
                      : isFakhama
                        ? 'border border-primary/10 bg-card/60 backdrop-blur-md shadow-sm hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/20'
                        : isKidsPlay
                          ? 'border-2 border-secondary/20 bg-card shadow-[0_20px_40px_-20px_rgba(0,0,0,0.1)] hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.15)] hover:border-secondary/40'
                          : 'border border-border bg-card hover:shadow-xl hover:shadow-primary/10'
          }`}
        >
          {variant === 'floating-bubbles' ? (
            <div className="flex flex-col items-center gap-6 py-6 transition-all duration-500 group-hover:scale-105">
              <div className="relative">
                <div className="relative z-10 h-52 w-52 overflow-hidden rounded-full border-[8px] border-white bg-secondary/20 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] group-hover:shadow-[0_45px_100px_-20px_rgba(0,0,0,0.3)] dark:border-slate-700 transition-all duration-500 group-hover:border-primary">
                  <img
                    src={collection.image}
                    alt={collection.name}
                    className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-125"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>

                <div className="absolute -end-4 -top-4 z-20 flex h-16 w-16 animate-bounce-subtle items-center justify-center rounded-full border-4 border-white bg-primary text-primary-foreground shadow-2xl dark:border-slate-800 transition-transform duration-500 group-hover:scale-110">
                  <span className="text-2xl">✨</span>
                </div>
                <div
                  className="absolute -bottom-3 -start-3 z-20 flex h-14 w-14 animate-bounce-subtle items-center justify-center rounded-full border-4 border-white bg-accent text-accent-foreground shadow-2xl dark:border-slate-800 transition-transform duration-500 group-hover:scale-110"
                  style={{ animationDelay: '0.3s' }}
                >
                  <span className="text-base font-black">
                    0{index + 1}
                  </span>
                </div>

                <div className="absolute inset-[-20%] animate-spin-slow opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-0 left-1/2 h-4 w-4 rounded-full bg-secondary shadow-lg blur-[1px]" />
                  <div className="absolute bottom-0 left-1/2 h-3 w-3 rounded-full bg-accent shadow-lg blur-[1px]" />
                </div>
              </div>

              <div className="space-y-2 text-center px-4">
                <h3 className="text-xl font-black text-foreground font-heading">
                  {collection.name}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                  {collection.description}
                </p>
                <div className="pt-2">
                  <span className="inline-flex rounded-full bg-secondary/50 px-4 py-1.5 text-xs font-black text-secondary-foreground shadow-inner group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    اكتشف الآن
                  </span>
                </div>
              </div>
            </div>
          ) : isSmartBazaar &&
            isSmartBazaarThemeAssetImage(collection.image) ? (
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              <SmartBazaarCategoryScene
                sceneKey={resolveSmartBazaarSceneKey(
                  `${collection.slug || ''} ${collection.name}`,
                  index,
                )}
              />
            </div>
          ) : (
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              <img
                src={collection.image}
                alt={collection.name}
                loading="lazy"
                width="400"
                height="300"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div
                className={`absolute inset-0 ${
                  isSoleaFemme
                    ? 'bg-[linear-gradient(180deg,transparent_5%,rgba(20,14,11,0.12)_40%,rgba(20,14,11,0.72)_100%)]'
                    : isBiteRush
                      ? 'bg-[linear-gradient(180deg,rgba(23,23,23,0.02),rgba(23,23,23,0.18)_40%,rgba(23,23,23,0.78)_100%)]'
                      : isCafeDemo
                        ? 'bg-[linear-gradient(180deg,rgba(34,24,18,0.02),rgba(34,24,18,0.16)_42%,rgba(34,24,18,0.74)_100%)]'
                        : isSmartBazaar
                          ? 'bg-[linear-gradient(180deg,rgba(15,23,42,0.02),rgba(15,23,42,0.12)_36%,rgba(15,23,42,0.72)_100%)]'
                          : 'bg-gradient-to-t from-black/45 via-black/10 to-transparent'
                }`}
              />
              <div
                className={`absolute start-4 top-4 inline-flex rounded-full px-3 py-1 text-[11px] font-black tracking-[0.22em] uppercase backdrop-blur ${
                  isBiteRush
                    ? 'border border-white/20 bg-[#171717]/78 text-orange-200'
                    : isSmartBazaar
                      ? 'border border-white/15 bg-foreground/80 text-background'
                      : 'border border-white/25 bg-background/88 text-primary'
                }`}
              >
                {isBiteRush
                  ? index === 0
                    ? 'المسار الساخن'
                    : `مسار 0${index + 1}`
                  : isCafeDemo
                    ? index === 0
                      ? 'ترشيح الباريستا'
                      : `تحضير 0${index + 1}`
                    : isSmartBazaar
                      ? index === 0
                        ? 'الأكثر طلبًا'
                        : `قسم 0${index + 1}`
                      : index === 0
                        ? theme?.direction === 'rtl'
                          ? 'الأقرب لاحتياجك'
                          : 'Best Match'
                        : `0${index + 1}`}
              </div>
              {!isAtelierNova ? (
                <div
                  className={`absolute bottom-4 start-4 inline-flex rounded-full px-3 py-1 text-xs font-bold text-foreground backdrop-blur ${
                    isBiteRush
                      ? 'bg-white/95 text-[#171717]'
                      : isSmartBazaar
                        ? 'bg-background/92'
                        : 'bg-background/90'
                  }`}
                >
                  {collection.name}
                </div>
              ) : null}
            </div>
          )}
          {variant !== 'floating-bubbles' && (
            <div
              className={`space-y-2 p-5 ${isSoleaFemme ? 'md:p-6' : ''}`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-black text-foreground font-heading">
                  {collection.name}
                </h3>
                {isSoleaFemme ? (
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
                    {collection.slug || collection.id}
                  </span>
                ) : isBiteRush ? (
                  <span className="rounded-full bg-[#fff1ea] px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#dc2626]">
                    اختيار سريع
                  </span>
                ) : isCafeDemo ? (
                  <span className="rounded-full bg-[#f4e4d6] px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#6f4a33]">
                    توصية الباريستا
                  </span>
                ) : isSmartBazaar ? (
                  <span className="rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-accent-foreground">
                    طلبات مرتبة
                  </span>
                ) : null}
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                {collection.description}
              </p>
              <div className="flex items-center justify-between gap-3 pt-1">
                <span
                  className={`inline-flex text-sm font-bold ${
                    isBiteRush
                      ? 'text-[#dc2626]'
                      : isCafeDemo
                        ? 'text-[#6f4a33]'
                        : 'text-primary'
                  }`}
                >
                  {isBiteRush
                    ? 'افتح القسم'
                    : isCafeDemo
                      ? 'تسوق القسم'
                      : theme?.direction === 'rtl'
                        ? 'شاهد منتجات القسم'
                        : 'Shop the collection'}
                </span>
                {isSoleaFemme ? (
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    تنسيق Solea
                  </span>
                ) : isBiteRush ? (
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-[#171717]/55">
                    0{index + 1}
                  </span>
                ) : isCafeDemo ? (
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-[#6f4a33]/70">
                    دفعة اليوم
                  </span>
                ) : isSmartBazaar ? (
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
                    مقارنة أسهل
                  </span>
                ) : null}
              </div>
            </div>
          )}
        </Link>
      ))}
    </div>
  );
};
