import React, { FormEvent } from 'react';
import { DemoCartItem, DISPLAY_FONT, formatCurrency, RestaurantCheckoutForm } from './types';

interface RestaurantCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: RestaurantCheckoutForm;
  setForm: React.Dispatch<React.SetStateAction<RestaurantCheckoutForm>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  cartItems: DemoCartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export const RestaurantCheckoutModal: React.FC<RestaurantCheckoutModalProps> = ({
  isOpen,
  onClose,
  form,
  setForm,
  onSubmit,
  cartItems,
  subtotal,
  deliveryFee,
  total,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-gray-900/70 px-4 py-6 backdrop-blur-sm">
      <div className="grid max-h-full w-full max-w-6xl overflow-hidden rounded-[2.5rem] bg-white shadow-[0_30px_90px_rgba(0,0,0,0.35)] lg:grid-cols-[1.05fr_0.95fr]">
        <form className="overflow-y-auto bg-[#FFF9F4] px-6 py-6 md:px-8 md:py-8" onSubmit={onSubmit}>
          <div className="flex items-start justify-between gap-4 border-b-4 border-orange-100 pb-5">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.45em] text-orange-500">
                تأكيد الطلب
              </div>
              <h3
                className="mt-2 text-5xl font-black uppercase italic tracking-tighter text-[#171717]"
                style={DISPLAY_FONT}
              >
                كمّل بيانات الطلب
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold uppercase tracking-[0.25em] text-red-600"
            >
              كمل تصفح
            </button>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="text-sm font-bold text-[#171717]">
              الاسم الكامل
              <input
                required
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="mt-2 w-full rounded-[1.5rem] border-2 border-orange-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400"
                placeholder="اسم المستلم"
              />
            </label>
            <label className="text-sm font-bold text-[#171717]">
              رقم الموبايل
              <input
                required
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                className="mt-2 w-full rounded-[1.5rem] border-2 border-orange-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400"
                placeholder="0100 000 0000"
              />
            </label>
          </div>

          <label className="mt-5 block text-sm font-bold text-[#171717]">
            العنوان
            <input
              required
              value={form.address}
              onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
              className="mt-2 w-full rounded-[1.5rem] border-2 border-orange-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400"
              placeholder="الشارع، العمارة، المنطقة"
            />
          </label>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <label className="text-sm font-bold text-[#171717]">
              طريقة الدفع
              <select
                value={form.paymentMethod}
                onChange={(event) => setForm((current) => ({ ...current, paymentMethod: event.target.value }))}
                className="mt-2 w-full rounded-[1.5rem] border-2 border-orange-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400"
              >
                <option>الدفع عند الاستلام</option>
                <option>بطاقة عند الاستلام</option>
                <option>محفظة إلكترونية</option>
              </select>
            </label>
            <label className="text-sm font-bold text-[#171717]">
              وقت التوصيل
              <select
                value={form.eta}
                onChange={(event) => setForm((current) => ({ ...current, eta: event.target.value }))}
                className="mt-2 w-full rounded-[1.5rem] border-2 border-orange-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400"
              >
                <option>20-30 دقيقة</option>
                <option>30-40 دقيقة</option>
                <option>45-55 دقيقة</option>
              </select>
            </label>
          </div>

          <button
            type="submit"
            className="mt-8 w-full rounded-[2rem] bg-red-600 py-5 text-lg font-black uppercase italic text-white shadow-2xl shadow-red-600/30 transition hover:scale-[1.01]"
          >
            أكد الطلب الآن
          </button>
        </form>

        <aside className="overflow-y-auto bg-[#171717] px-6 py-6 text-white md:px-8 md:py-8">
          <div className="text-[10px] font-black uppercase tracking-[0.45em] text-orange-300">
            ملخص الطلب
          </div>
          <h3 className="mt-2 text-5xl font-black uppercase italic tracking-tighter" style={DISPLAY_FONT}>
            طلبك جاهز للتأكيد.
          </h3>
          <p className="mt-4 max-w-md text-sm font-medium leading-6 text-white/70">
            راجع الأصناف والمجموع قبل ما نبدأ التحضير.
          </p>

          <div className="mt-8 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-4"
              >
                <div>
                  <div className="text-lg font-black uppercase italic tracking-tight" style={DISPLAY_FONT}>
                    {item.name}
                  </div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                    الكمية <span className="tabular-nums">{item.quantity}</span>
                  </div>
                </div>
                <div className="text-lg font-black italic text-orange-300 tabular-nums" style={DISPLAY_FONT}>
                  {formatCurrency(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between text-sm font-semibold text-white/70">
              <span>المجموع</span>
              <span className="tabular-nums">{formatCurrency(subtotal)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm font-semibold text-white/70">
              <span>التوصيل</span>
              <span className="tabular-nums">{deliveryFee === 0 ? 'مجاني' : formatCurrency(deliveryFee)}</span>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-4xl font-black italic tracking-tighter">
              <span style={DISPLAY_FONT}>الإجمالي</span>
              <span className="text-orange-300 tabular-nums" style={DISPLAY_FONT}>
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
