import React from 'react';
import { DISPLAY_FONT, zones } from './types';

export const RestaurantDeliveryZones: React.FC = () => {
  return (
    <section id="zones" className="relative overflow-hidden bg-[#171717] px-6 py-16 text-white md:px-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,107,44,0.24),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(220,38,38,0.18),_transparent_32%)]" />
      <div className="relative mx-auto max-w-6xl 2xl:max-w-7xl">
        <div className="max-w-2xl">
          <div className="text-[10px] font-black uppercase tracking-[0.45em] text-orange-300">
            مناطق التوصيل
          </div>
          <h3
            className="mt-3 text-5xl font-black uppercase italic tracking-tighter md:text-6xl"
            style={DISPLAY_FONT}
          >
            بنوصل لحد بابك.
          </h3>
          <p className="mt-4 text-base font-medium leading-7 text-white/70">
            اختار منطقتك واعرف وقت الوصول المتوقع قبل ما تأكد الطلب.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {zones.map((zone) => (
            <article
              key={zone.name}
              className="rounded-[2.5rem] border border-white/10 bg-white/5 px-6 py-6 shadow-xl backdrop-blur"
            >
              <div className="text-[10px] font-black uppercase tracking-[0.35em] text-orange-300 tabular-nums">
                {zone.eta}
              </div>
              <h4 className="mt-3 text-4xl font-black uppercase italic" style={DISPLAY_FONT}>
                {zone.name}
              </h4>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
