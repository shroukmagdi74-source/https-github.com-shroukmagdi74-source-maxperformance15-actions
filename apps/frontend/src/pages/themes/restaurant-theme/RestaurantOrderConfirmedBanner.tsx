import React from 'react';
import { DISPLAY_FONT, formatCurrency, OrderSummary, scrollToSection } from './types';

interface RestaurantOrderConfirmedBannerProps {
  orderSummary: OrderSummary;
}

export const RestaurantOrderConfirmedBanner: React.FC<RestaurantOrderConfirmedBannerProps> = ({
  orderSummary,
}) => {
  return (
    <section className="relative overflow-hidden bg-[#171717] px-6 py-6 text-white md:px-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,107,44,0.35),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(220,38,38,0.25),_transparent_35%)]" />
      <div className="relative mx-auto flex max-w-6xl 2xl:max-w-7xl flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1 text-[10px] font-black uppercase tracking-[0.45em] text-orange-200">
            تم تأكيد الطلب
          </div>
          <h2
            className="mt-4 text-5xl font-black uppercase italic tracking-tighter text-white md:text-6xl"
            style={DISPLAY_FONT}
          >
            {orderSummary.customerName}، طلبك اتحرك.
          </h2>
          <p className="mt-3 max-w-2xl text-sm font-medium text-white/75 md:text-base">
            طلب رقم <span className="font-mono tabular-nums">{orderSummary.orderId}</span> اتأكد وفيه{' '}
            <span className="tabular-nums">{orderSummary.itemCount}</span> منتج. وقت الوصول المتوقع{' '}
            <span className="tabular-nums">{orderSummary.eta}</span>.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="rounded-[2rem] border border-white/10 bg-white/10 px-6 py-4">
            <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-orange-200">
              الإجمالي
            </div>
            <div className="mt-2 text-4xl font-black italic text-white tabular-nums" style={DISPLAY_FONT}>
              {formatCurrency(orderSummary.total)}
            </div>
          </div>
          <button
            type="button"
            onClick={() => scrollToSection('menu')}
            className="rounded-full bg-white px-6 py-4 text-sm font-black uppercase tracking-[0.25em] text-red-600 shadow-xl transition hover:scale-[1.02]"
          >
            اطلب مرة تانية
          </button>
        </div>
      </div>
    </section>
  );
};
