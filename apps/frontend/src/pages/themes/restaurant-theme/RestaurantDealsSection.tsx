import React from 'react';
import { DISPLAY_FONT, lanes, scrollToSection } from './types';

interface RestaurantDealsSectionProps {
  onSelectCategory: (cat: string) => void;
}

export const RestaurantDealsSection: React.FC<RestaurantDealsSectionProps> = ({
  onSelectCategory,
}) => {
  return (
    <section id="deals" className="bg-[#FFF4EC] px-6 py-16 md:px-12">
      <div className="mx-auto max-w-6xl 2xl:max-w-7xl">
        <div className="max-w-2xl">
          <div className="inline-flex rounded-full bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.45em] text-red-600 shadow-md">
            عروض اليوم
          </div>
          <h3
            className="mt-5 text-5xl font-black uppercase italic tracking-tighter text-[#171717] md:text-6xl"
            style={DISPLAY_FONT}
          >
            3 طرق سريعة للطلب.
          </h3>
          <p className="mt-4 text-base font-medium leading-7 text-[#5f5f5f]">
            اختَر المسار اللي يناسب مزاجك وكمّل الطلب في أقل وقت.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {lanes.map((lane, index) => (
            <article
              key={lane.title}
              className={`rounded-[2.5rem] border-4 border-orange-100 px-6 py-7 shadow-xl transition-transform hover:-translate-y-1 ${lane.accent}`}
            >
              <div className="text-[10px] font-black uppercase tracking-[0.45em] opacity-70 tabular-nums">
                0{index + 1}
              </div>
              <h4
                className="mt-3 text-4xl font-black uppercase italic tracking-tighter"
                style={DISPLAY_FONT}
              >
                {lane.title}
              </h4>
              <p className="mt-4 text-sm font-medium leading-6 opacity-80">{lane.description}</p>
              <button
                type="button"
                onClick={() => {
                  onSelectCategory(lane.category);
                  scrollToSection('menu');
                }}
                className={`mt-8 rounded-full px-6 py-3 text-xs font-black uppercase tracking-[0.28em] transition ${
                  lane.accent.includes('bg-white')
                    ? 'bg-[#171717] text-white hover:bg-red-600'
                    : 'bg-white text-red-600 hover:bg-orange-100'
                }`}
              >
                افتح المسار
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
