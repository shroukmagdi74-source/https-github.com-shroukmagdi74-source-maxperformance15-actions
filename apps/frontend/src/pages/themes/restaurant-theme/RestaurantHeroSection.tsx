import React from 'react';
import { DISPLAY_FONT, heroStats, scrollToSection } from './types';

interface RestaurantHeroSectionProps {
  onJumpToDeal: () => void;
}

export const RestaurantHeroSection: React.FC<RestaurantHeroSectionProps> = ({
  onJumpToDeal,
}) => {
  return (
    <section className="relative overflow-hidden bg-orange-500 py-24 md:py-32">
      <div className="absolute left-[-100px] top-[-100px] h-96 w-96 rounded-full bg-red-600 opacity-40 blur-[120px]" />
      <div className="absolute bottom-[-100px] right-[-100px] h-96 w-96 rounded-full bg-yellow-400 opacity-40 blur-[120px]" />

      <div className="relative z-10 mx-auto flex max-w-6xl 2xl:max-w-7xl flex-col items-center gap-16 px-6 md:flex-row md:px-12">
        <div className="text-center text-white md:w-1/2 md:text-right">
          <div className="inline-block animate-bounce rounded-full bg-white px-4 py-1 text-xs font-black uppercase tracking-widest text-red-600 shadow-md">
            عرض محدود
          </div>
          <h2
            className="mb-6 mt-6 text-7xl font-black uppercase italic leading-[0.8] tracking-tighter text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.2)] md:text-9xl"
            style={DISPLAY_FONT}
          >
            سماش.
            <br />
            نار.
            <br />
            كرنش.
          </h2>
          <p className="mx-auto mb-10 max-w-md text-lg font-bold text-white/90 md:mx-0">
            برجر طازج يوميًا، نار واضحة، وطعم يوصل سخن من أول لقمة.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:justify-end">
            <button
              type="button"
              onClick={onJumpToDeal}
              className="rounded-full bg-white px-12 py-5 text-xl font-black uppercase italic text-red-600 shadow-2xl transition hover:scale-105"
            >
              اطلب العرض
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('zones')}
              className="rounded-full border-2 border-white/30 bg-[#171717]/15 px-8 py-5 text-sm font-black uppercase tracking-[0.3em] text-white transition hover:bg-[#171717]/30"
            >
              شوف مناطق التوصيل
            </button>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {heroStats.map(([label, value]) => (
              <div
                key={label}
                className="rounded-[2rem] border border-white/20 bg-white/10 px-5 py-4 text-right shadow-xl backdrop-blur"
              >
                <div className="text-[10px] font-black uppercase tracking-[0.35em] text-white/70">
                  {label}
                </div>
                <div className="mt-2 text-3xl font-black italic text-white tabular-nums" style={DISPLAY_FONT}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center md:w-1/2">
          <div className="relative">
            <div className="absolute -left-4 top-10 rotate-[-8deg] rounded-[2rem] bg-white px-5 py-4 shadow-2xl">
              <div className="text-[10px] font-black uppercase tracking-[0.35em] text-red-600">
                راش كومبو
              </div>
              <div className="mt-1 text-3xl font-black italic text-[#171717]" style={DISPLAY_FONT}>
                أفضل عرض
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 rotate-[6deg] rounded-[2rem] bg-[#171717] px-5 py-4 text-white shadow-2xl">
              <div className="text-[10px] font-black uppercase tracking-[0.35em] text-orange-300">
                لسه سخن
              </div>
              <div className="mt-1 text-3xl font-black italic tabular-nums" style={DISPLAY_FONT}>
                20-30 دقيقة
              </div>
            </div>
            <img
              src="https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80"
              className="w-full max-w-lg rounded-full border-[10px] border-white/20 object-cover drop-shadow-[0_50px_50px_rgba(0,0,0,0.4)] transition duration-500 hover:scale-110"
              alt="برجر BiteRush"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
