import React from "react";
import { CafeProduct } from "./types";

interface CafeQuickViewModalProps {
  product: CafeProduct | null;
  milkOption: string;
  onMilkOptionChange: (option: string) => void;
  onAddToCart: (product: CafeProduct, options?: string) => void;
  onClose: () => void;
}

export const CafeQuickViewModal: React.FC<CafeQuickViewModalProps> = ({
  product,
  milkOption,
  onMilkOptionChange,
  onAddToCart,
  onClose,
}) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-[32px] overflow-hidden max-w-3xl w-full shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
        <button
          type="button"
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-black/10 rounded-full text-gray-600 hover:bg-black/20"
          onClick={onClose}
          aria-label="Close modal"
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

        <div
          className={`w-full md:w-1/2 p-10 ${product.bg} flex items-center justify-center`}
        >
          <img
            src={product.img}
            alt={product.title}
            className="w-[80%] h-auto rounded-full drop-shadow-2xl max-h-[300px] object-cover"
          />
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
          <p className="text-pink-500 text-xs font-bold tracking-widest mb-2 uppercase">
            {product.category}
          </p>
          <h3
            className="text-4xl text-gray-900 mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {product.title}
          </h3>
          <p
            className="text-3xl text-gray-500 mb-6"
            style={{ fontFamily: "'Great Vibes', cursive" }}
          >
            {product.cursive}
          </p>

          <div className="mb-8">
            <p className="text-sm font-bold text-gray-700 mb-3">
              Choice of Preparation:
            </p>
            <div className="flex flex-wrap gap-2 text-sm">
              {["Regular", "Almond Milk (+$1)", "Extra Sugar"].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onMilkOptionChange(opt)}
                  className={`px-4 py-2 border rounded-xl transition-all ${
                    milkOption === opt
                      ? "border-[#947771] bg-[#947771]/5 text-[#947771] font-semibold"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-auto">
            <span className="text-2xl font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            <button
              type="button"
              className="bg-[#947771] hover:bg-[#7A5A54] text-white px-8 py-3.5 rounded-full font-bold tracking-widest text-xs transition-transform hover:-translate-y-1 shadow-xl"
              onClick={() => onAddToCart(product, milkOption)}
            >
              ADD TO CART
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
