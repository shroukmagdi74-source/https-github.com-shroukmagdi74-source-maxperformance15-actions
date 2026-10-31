import React from 'react';

interface FiltersThemedHeroProps {
  isPcHub: boolean;
  isRoseBoutique: boolean;
  isDistrictMarket: boolean;
  sidebarBadge: string;
  sidebarTitle: string;
  sidebarSubtitle: string;
  selectedCategoryLabel: string;
  selectedPriceLabel: string;
  selectedSortLabel: string;
}

export const FiltersThemedHero: React.FC<FiltersThemedHeroProps> = ({
  isPcHub,
  isRoseBoutique,
  isDistrictMarket,
  sidebarBadge,
  sidebarTitle,
  sidebarSubtitle,
  selectedCategoryLabel,
  selectedPriceLabel,
  selectedSortLabel,
}) => {
  if (isPcHub) {
    return (
      <div className="rounded-[1.45rem] border border-[#d9dee5] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,242,222,0.95))] p-4 shadow-[0_26px_70px_-56px_rgba(31,36,44,0.26)]">
        <span className="inline-flex rounded-full border border-[#1f242c]/10 bg-[#1f242c] px-3 py-1 text-[11px] font-black tracking-[0.22em] text-[#fff4d1]">
          {sidebarBadge}
        </span>
        <h3 className="mt-3 font-heading text-[1.35rem] font-black tracking-tight text-[#1f242c]">
          {sidebarTitle}
        </h3>
        <p className="mt-2 text-sm leading-7 text-[#646b77]">{sidebarSubtitle}</p>
        <div className="mt-4 grid gap-2">
          <div className="rounded-[1rem] border border-[#d9dee5] bg-white px-4 py-3">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#7c818b]">
              القسم الحالي
            </p>
            <p className="mt-1 text-sm font-black text-[#1f242c]">
              {selectedCategoryLabel}
            </p>
          </div>
          <div className="rounded-[1rem] border border-[#d9dee5] bg-white px-4 py-3">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#7c818b]">
              الميزانية
            </p>
            <p dir="ltr" className="mt-1 text-sm font-black text-[#1f242c] tabular-nums">
              {selectedPriceLabel}
            </p>
          </div>
          <div className="rounded-[1rem] border border-[#eadfb8] bg-[#fff8e2] px-4 py-3">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8f6f00]">
              حالة الفرز
            </p>
            <p className="mt-1 text-sm font-black text-[#4c3d00]">
              {selectedSortLabel}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isRoseBoutique) {
    return (
      <div className="rounded-[1.45rem] border border-[#ead8cf] bg-[linear-gradient(180deg,rgba(255,253,251,0.98),rgba(250,244,240,0.98))] p-4 shadow-[0_28px_72px_-58px_rgba(76,42,44,0.22)]">
        <span className="inline-flex rounded-full border border-[#f0e2db] bg-white px-3 py-1 text-[11px] font-black tracking-[0.22em] text-[#8f4d41]">
          {sidebarBadge}
        </span>
        <h3 className="mt-3 font-heading text-[1.3rem] font-black tracking-tight text-[#3d2a2f]">
          {sidebarTitle}
        </h3>
        <p className="mt-2 text-sm leading-7 text-[#7a6268]">{sidebarSubtitle}</p>
        <div className="mt-4 grid gap-2">
          <div className="rounded-[1rem] border border-[#f0e2db] bg-white px-4 py-3">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#a26c73]">
              القسم المفتوح
            </p>
            <p className="mt-1 text-sm font-black text-[#3d2a2f]">
              {selectedCategoryLabel}
            </p>
          </div>
          <div className="rounded-[1rem] border border-[#f0e2db] bg-white px-4 py-3">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#a26c73]">
              الميزانية
            </p>
            <p dir="ltr" className="mt-1 text-sm font-black text-[#3d2a2f] tabular-nums">
              {selectedPriceLabel}
            </p>
          </div>
          <div className="rounded-[1rem] border border-[#f0e2db] bg-[#fff8f5] px-4 py-3">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#a26c73]">
              اللمسة الحالية
            </p>
            <p className="mt-1 text-sm font-black text-[#3d2a2f]">
              {selectedSortLabel}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isDistrictMarket) {
    return (
      <div className="rounded-[1.4rem] border border-[#eddcd0] bg-[linear-gradient(180deg,#fffdfa,#fff6ef)] p-4 shadow-[0_22px_60px_-52px_rgba(61,37,25,0.3)]">
        <span className="inline-flex rounded-full border border-[#f0ddd0] bg-white px-3 py-1 text-[11px] font-black tracking-[0.22em] text-[#a65a2a]">
          فلترة ذكية
        </span>
        <p className="mt-3 text-sm leading-7 text-[#6e5849]">
          ابدأ بالبحث أو القسم ثم ضيّق السعر حتى تبقى الرفوف أوضح وأسهل في القرار.
        </p>
      </div>
    );
  }

  return null;
};

export default FiltersThemedHero;
