import React from 'react';
import { formatCurrency } from './types';

interface RestaurantFloatingCartBarProps {
  totalItems: number;
  total: number;
  onOpenCart: () => void;
  onStartCheckout: () => void;
}

export const RestaurantFloatingCartBar: React.FC<RestaurantFloatingCartBarProps> = ({
  totalItems,
  total,
  onOpenCart,
  onStartCheckout,
}) => {
  if (totalItems <= 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[140] mx-auto max-w-3xl rounded-[2rem] border-4 border-orange-100 bg-white px-5 py-4 shadow-[0_25px_55px_rgba(0,0,0,0.15)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm font-semibold text-[#4f4f4f]">
          <span className="tabular-nums">{totalItems}</span> منتج جاهز. الإجمالي{' '}
          <span className="tabular-nums">{formatCurrency(total)}</span>.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onOpenCart}
            className="rounded-full border-2 border-gray-100 px-5 py-3 text-xs font-black uppercase tracking-[0.25em] text-[#171717] transition hover:border-orange-200 hover:text-red-600"
          >
            راجع السلة
          </button>
          <button
            type="button"
            onClick={onStartCheckout}
            className="rounded-full bg-red-600 px-5 py-3 text-xs font-black uppercase tracking-[0.25em] text-white shadow-xl transition hover:scale-[1.02]"
          >
            كمّل الطلب
          </button>
        </div>
      </div>
    </div>
  );
};
