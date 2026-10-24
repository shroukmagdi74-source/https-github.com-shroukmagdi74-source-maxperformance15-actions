import React from "react";
import { CartItem } from "./types";

interface CafeCartDrawerProps {
  isOpen: boolean;
  cart: CartItem[];
  subTotal: number;
  onClose: () => void;
  onUpdateQuantity: (id: number, options: string | undefined, delta: number) => void;
  onRemoveItem: (id: number, options: string | undefined) => void;
  onProceedToCheckout: () => void;
}

export const CafeCartDrawer: React.FC<CafeCartDrawerProps> = ({
  isOpen,
  cart,
  subTotal,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-[380px] max-w-full bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-[#FCFBF8]">
          <h3
            className="text-2xl text-gray-800"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Your Order
          </h3>
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-800 rounded-full hover:bg-gray-100 transition-colors"
            onClick={onClose}
            aria-label="Close cart"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <svg
                className="w-16 h-16 opacity-20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <p style={{ fontFamily: "'Playfair Display', serif" }}>
                Your cart is empty.
              </p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div
                key={`${item.id}-${item.options || idx}`}
                className="flex items-center gap-4 bg-[#FDFBF7] p-3 rounded-2xl border border-gray-50 relative group"
              >
                <button
                  type="button"
                  className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onRemoveItem(item.id, item.options)}
                  aria-label="Remove item"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-xs">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4
                    className="font-bold text-gray-800"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {item.title}
                  </h4>
                  {item.options && (
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                      {item.options}
                    </p>
                  )}
                  <p className="text-[#947771] text-sm font-bold mt-1">
                    ${item.price.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-full p-1 border border-gray-100 shadow-xs">
                  <button
                    type="button"
                    className="w-6 h-6 flex items-center justify-center bg-gray-50 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
                    onClick={() => onUpdateQuantity(item.id, item.options, -1)}
                  >
                    -
                  </button>
                  <span className="text-xs font-bold w-3 text-center">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    className="w-6 h-6 flex items-center justify-center bg-gray-50 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
                    onClick={() => onUpdateQuantity(item.id, item.options, 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-[#FCFBF8] space-y-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center text-gray-600 mb-2">
              <span>Subtotal</span>
              <span className="font-bold">${subTotal.toFixed(2)}</span>
            </div>
            <button
              type="button"
              className="w-full bg-[#947771] text-white py-4 rounded-full font-bold tracking-widest uppercase text-xs hover:bg-[#7A5A54] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              onClick={onProceedToCheckout}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
