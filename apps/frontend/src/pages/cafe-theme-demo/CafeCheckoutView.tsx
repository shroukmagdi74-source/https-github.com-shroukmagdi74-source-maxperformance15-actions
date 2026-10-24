import React from "react";
import { CartItem } from "./types";

interface CafeCheckoutViewProps {
  cart: CartItem[];
  subTotal: number;
  shippingFee: number;
  taxAmount: number;
  grandTotal: number;
  isSuccessModalOpen: boolean;
  onReturnToStore: () => void;
  onPlaceOrder: () => void;
  onSuccessModalClose: () => void;
}

export const CafeCheckoutView: React.FC<CafeCheckoutViewProps> = ({
  cart,
  subTotal,
  shippingFee,
  taxAmount,
  grandTotal,
  isSuccessModalOpen,
  onReturnToStore,
  onPlaceOrder,
  onSuccessModalClose,
}) => {
  return (
    <div
      className="min-h-screen bg-[#FCFBF8] text-gray-800 flex flex-col font-sans"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Minimal Sticky Navbar for Checkout */}
      <nav className="bg-white border-b border-gray-100 py-6 sticky top-0 z-50 shadow-xs">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div
            className="flex items-center gap-4 cursor-pointer text-gray-500 hover:text-gray-900 transition-colors"
            onClick={onReturnToStore}
            role="button"
            aria-label="Return to Store"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="text-sm font-semibold tracking-wider uppercase">
              Return to Store
            </span>
          </div>
          <div
            className="text-3xl text-[#947771] tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Coffee
          </div>
          <div className="opacity-0 hidden md:block">Placeholder</div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12 flex-1">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* LEFT COLUMN: User Details Form */}
          <div className="lg:w-3/5 space-y-12 animate-in slide-in-from-left duration-500">
            <div>
              <h1
                className="text-4xl md:text-5xl text-gray-900 mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Secure Checkout
              </h1>
              <p className="text-gray-500 text-sm">
                Please finalize your details to get your daily brew.
              </p>
            </div>

            {/* Contact Info */}
            <div className="bg-white p-8 rounded-3xl shadow-xs border border-gray-50">
              <h3
                className="text-xl font-bold mb-6 text-gray-800 border-b border-gray-100 pb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                1. Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-gray-50 focus:bg-white border border-gray-200 focus:border-[#947771] focus:ring-4 focus:ring-[#947771]/10 rounded-xl px-4 py-3 outline-hidden transition-all"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-gray-50 focus:bg-white border border-gray-200 focus:border-[#947771] focus:ring-4 focus:ring-[#947771]/10 rounded-xl px-4 py-3 outline-hidden transition-all"
                    placeholder="Doe"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full bg-gray-50 focus:bg-white border border-gray-200 focus:border-[#947771] focus:ring-4 focus:ring-[#947771]/10 rounded-xl px-4 py-3 outline-hidden transition-all"
                    placeholder="hello@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white p-8 rounded-3xl shadow-xs border border-gray-50">
              <h3
                className="text-xl font-bold mb-6 text-gray-800 border-b border-gray-100 pb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                2. Delivery Address
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    className="w-full bg-gray-50 focus:bg-white border border-gray-200 focus:border-[#947771] focus:ring-4 focus:ring-[#947771]/10 rounded-xl px-4 py-3 outline-hidden transition-all"
                    placeholder="123 Coffee Lane"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      className="w-full bg-gray-50 focus:bg-white border border-gray-200 focus:border-[#947771] focus:ring-4 focus:ring-[#947771]/10 rounded-xl px-4 py-3 outline-hidden transition-all"
                      placeholder="Cairo"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full bg-gray-50 focus:bg-white border border-gray-200 focus:border-[#947771] focus:ring-4 focus:ring-[#947771]/10 rounded-xl px-4 py-3 outline-hidden transition-all"
                      placeholder="+20 100 000 0000"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-8 rounded-3xl shadow-xs border border-gray-50">
              <h3
                className="text-xl font-bold mb-6 text-gray-800 border-b border-gray-100 pb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                3. Payment Method
              </h3>
              <div className="space-y-4">
                <label className="flex items-center p-4 border-2 border-[#947771] bg-[#947771]/5 rounded-2xl cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    className="w-5 h-5 text-[#947771] focus:ring-[#947771] border-gray-300"
                    defaultChecked
                  />
                  <span className="ml-4 font-semibold text-gray-800">
                    Credit or Debit Card
                  </span>
                  <div className="ml-auto flex gap-2">
                    <div className="px-2 py-1 bg-white border rounded shadow-2xs text-[10px] font-bold">
                      VISA
                    </div>
                    <div className="px-2 py-1 bg-white border rounded shadow-2xs text-[10px] font-bold">
                      MASTER
                    </div>
                  </div>
                </label>
                <label className="flex items-center p-4 border border-gray-200 hover:border-gray-300 rounded-2xl cursor-pointer transition-colors opacity-70 hover:opacity-100">
                  <input
                    type="radio"
                    name="payment"
                    className="w-5 h-5 text-[#947771] focus:ring-[#947771] border-gray-300"
                  />
                  <span className="ml-4 font-semibold text-gray-800">
                    Cash on Delivery (COD)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary */}
          <div className="lg:w-2/5 animate-in slide-in-from-right duration-500">
            <div className="bg-white p-8 rounded-[32px] shadow-xl border border-gray-50 sticky top-32">
              <h3
                className="text-2xl font-bold mb-8 text-gray-900"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Order Summary
              </h3>

              <div className="space-y-4 mb-8">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={item.img}
                          alt={item.title}
                          className="w-14 h-14 rounded-xl object-cover border border-gray-100"
                        />
                        <span className="absolute -top-2 -right-2 bg-gray-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold">
                          {item.quantity}
                        </span>
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-800 text-sm">
                          {item.title}
                        </h5>
                        {item.options && (
                          <p className="text-[10px] text-gray-400 uppercase">
                            {item.options}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="font-semibold text-gray-800 font-mono tabular-nums">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-sm text-gray-500 border-t border-gray-100 pt-6 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-gray-800 font-medium font-mono tabular-nums">
                    ${subTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-gray-800 font-medium font-mono tabular-nums">
                    ${shippingFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Taxes (14%)</span>
                  <span className="text-gray-800 font-medium font-mono tabular-nums">
                    ${taxAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xl font-bold text-gray-900 border-t border-gray-900 pt-6 mb-10">
                <span>Total</span>
                <span className="font-mono tabular-nums">
                  ${grandTotal.toFixed(2)}
                </span>
              </div>

              <button
                type="button"
                className="w-full bg-[#947771] text-white py-4 rounded-full font-bold tracking-widest uppercase text-xs hover:bg-[#7A5A54] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-[1.02]"
                onClick={onPlaceOrder}
              >
                Place Full Order
              </button>
              <p className="text-center text-[11px] text-gray-400 mt-4 flex items-center justify-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Secure SSL Encrypted Checkout
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final Order Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#947771]/60 backdrop-blur-md"
            onClick={onSuccessModalClose}
          />
          <div className="relative bg-white rounded-[40px] p-12 max-w-md w-full text-center shadow-2xl animate-in zoom-in-50 duration-500 transform">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-8 ring-green-50/50">
              <svg
                className="w-12 h-12 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3
              className="text-4xl text-gray-900 mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Thank You!
            </h3>
            <p className="text-gray-500 text-sm mb-10 leading-relaxed font-medium">
              Your order <strong className="text-gray-900">#MAX-8842</strong> has
              been placed successfully. We'll send an email confirmation shortly!
            </p>
            <button
              type="button"
              className="w-full border-2 border-[#947771] text-[#947771] hover:bg-[#947771] hover:text-white py-4 rounded-full font-bold tracking-widest text-xs transition-colors uppercase"
              onClick={onSuccessModalClose}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
