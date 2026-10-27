import React from 'react';
import { DemoCartItem, DISPLAY_FONT, formatCurrency, scrollToSection } from './types';

interface RestaurantCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: DemoCartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, qty: number) => void;
  onStartCheckout: () => void;
}

export const RestaurantCartDrawer: React.FC<RestaurantCartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  subtotal,
  deliveryFee,
  total,
  onRemoveItem,
  onUpdateQuantity,
  onStartCheckout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="اقفل السلة"
      />
      <aside
        className="relative flex h-full w-full max-w-md flex-col bg-white px-8 py-8 shadow-2xl md:px-10"
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.45em] text-orange-500">
              سلة الطلب
            </div>
            <h3
              className="mt-2 text-5xl font-black uppercase italic tracking-tighter"
              style={DISPLAY_FONT}
            >
              سلة الطلب
            </h3>
          </div>
          <button
            type="button"
            className="text-xs font-bold uppercase tracking-[0.25em] text-red-600"
            onClick={onClose}
          >
            إغلاق
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto pr-1">
          {cartItems.length === 0 ? (
            <div className="rounded-[2.5rem] border-2 border-dashed border-orange-100 px-6 py-14 text-center">
              <div className="text-[10px] font-black uppercase tracking-[0.45em] text-orange-500">
                السلة فاضية
              </div>
              <h4
                className="mt-4 text-4xl font-black uppercase italic tracking-tighter text-[#171717]"
                style={DISPLAY_FONT}
              >
                لسه ما ضفتش حاجة.
              </h4>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  scrollToSection('menu');
                }}
                className="mt-8 rounded-full bg-red-600 px-6 py-3 text-xs font-black uppercase tracking-[0.25em] text-white shadow-xl"
              >
                ارجع للمنيو
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <article key={item.id} className="items-start rounded-[2rem] border border-orange-100 bg-orange-50/40 p-4">
                <div className="flex gap-4">
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80'}
                    className="h-24 w-24 rounded-[1.75rem] object-cover bg-gray-50"
                    alt={item.name}
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-3xl font-black uppercase italic tracking-tighter" style={DISPLAY_FONT}>
                          {item.name}
                        </h4>
                        <p className="mt-1 text-sm font-semibold text-orange-500 tabular-nums">
                          {formatCurrency(item.price)} للوحدة
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="text-[11px] font-black uppercase tracking-[0.25em] text-red-600 transition hover:opacity-75"
                      >
                        احذف
                      </button>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <div className="inline-flex items-center rounded-full border-2 border-orange-100 bg-white p-1 shadow-sm">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="h-10 w-10 rounded-full text-lg font-black text-[#171717]"
                          aria-label={`تقليل كمية ${item.name}`}
                        >
                          -
                        </button>
                        <span className="min-w-10 text-center text-sm font-black text-[#171717] tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="h-10 w-10 rounded-full text-lg font-black text-[#171717]"
                          aria-label={`زيادة كمية ${item.name}`}
                        >
                          +
                        </button>
                      </div>
                      <div className="text-3xl font-black italic text-red-600 tabular-nums" style={DISPLAY_FONT}>
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="mt-8 border-t-8 border-orange-100 pt-8">
          <div className="space-y-3 text-sm font-semibold text-[#5f5f5f]">
            <div className="flex items-center justify-between">
              <span>المجموع</span>
              <span className="tabular-nums">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>التوصيل</span>
              <span className="tabular-nums">{deliveryFee === 0 ? 'مجاني' : formatCurrency(deliveryFee)}</span>
            </div>
            {subtotal > 0 && subtotal < 450 && (
              <p className="text-red-600">
                ضيف <span className="tabular-nums">{formatCurrency(450 - subtotal)}</span> كمان وخد التوصيل مجانًا.
              </p>
            )}
          </div>
          <div className="mt-6 flex items-center justify-between text-4xl font-black italic tracking-tighter">
            <span style={DISPLAY_FONT}>الإجمالي</span>
            <span className="text-red-600 tabular-nums" style={DISPLAY_FONT}>
              {formatCurrency(total)}
            </span>
          </div>
          <button
            type="button"
            onClick={onStartCheckout}
            disabled={cartItems.length === 0}
            className="mt-8 w-full rounded-[2rem] bg-red-600 py-5 text-xl font-black uppercase italic text-white shadow-2xl shadow-red-600/30 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-red-200 disabled:shadow-none"
          >
            كمّل الطلب
          </button>
        </div>
      </aside>
    </div>
  );
};
