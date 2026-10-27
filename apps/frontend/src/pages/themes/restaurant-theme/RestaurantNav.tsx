import React from 'react';
import { DISPLAY_FONT, scrollToSection } from './types';

interface RestaurantNavProps {
  totalItems: number;
  onOpenCart: () => void;
}

export const RestaurantNav: React.FC<RestaurantNavProps> = ({
  totalItems,
  onOpenCart,
}) => {
  return (
    <nav className="sticky top-0 z-[100] border-b-4 border-orange-500 bg-white/95 px-6 py-4 shadow-lg backdrop-blur md:px-12">
      <div className="mx-auto flex max-w-6xl 2xl:max-w-7xl items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3 text-right"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-red-600 shadow-xl transition-transform hover:rotate-12">
            <span className="text-xl font-black italic leading-none text-white">B</span>
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.45em] text-orange-500">
              طلب سريع
            </div>
            <h1
              className="text-3xl font-black uppercase italic tracking-tighter text-red-600"
              style={DISPLAY_FONT}
            >
              Bite<span className="text-orange-500">Rush</span>
            </h1>
          </div>
        </button>

        <div className="hidden items-center gap-10 text-xs font-black uppercase tracking-widest md:flex">
          <button
            type="button"
            onClick={() => scrollToSection('menu')}
            className="underline decoration-orange-500 decoration-2 underline-offset-4 transition hover:text-red-600"
          >
            المنيو
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('deals')}
            className="transition hover:text-red-600"
          >
            العروض
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('zones')}
            className="transition hover:text-red-600"
          >
            مناطق التوصيل
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenCart}
          className="flex items-center gap-3 rounded-full bg-gray-900 px-7 py-3 text-xs font-black uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 hover:bg-red-600"
        >
          <span>سلة الطلب</span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] text-white tabular-nums">
            {totalItems}
          </span>
        </button>
      </div>
    </nav>
  );
};
