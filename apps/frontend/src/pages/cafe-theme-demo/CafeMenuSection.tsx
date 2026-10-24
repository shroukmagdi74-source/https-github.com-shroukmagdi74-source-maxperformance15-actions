import React from "react";
import { CafeProductCard } from "../../storefront/components/CafeProductCard";
import { CATEGORIES, CafeProduct } from "./types";

interface CafeMenuSectionProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  products: CafeProduct[];
  onProductClick: (product: CafeProduct) => void;
}

export const CafeMenuSection: React.FC<CafeMenuSectionProps> = ({
  activeCategory,
  onSelectCategory,
  products,
  onProductClick,
}) => {
  return (
    <section id="menu" className="container mx-auto px-6 pb-28 pt-20">
      <div className="text-center mb-10">
        <h2
          className="text-5xl text-gray-800 mb-4"
          style={{ fontFamily: "'Great Vibes', cursive" }}
        >
          Our Menu
        </h2>
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-[#947771] text-white shadow-md"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14 justify-items-center max-w-6xl mx-auto mt-12 transition-all">
        {products.map((product) => (
          <CafeProductCard
            key={product.id}
            id={product.id}
            title={product.title}
            subtitleCursive={product.cursive}
            subtitlePrefix={product.prefix}
            subtitleSuffix={product.suffix}
            imageUrl={product.img}
            bgColorClass={product.bg}
            price={product.price}
            onAddToCart={() => onProductClick(product)}
            className="animate-in fade-in zoom-in-95 duration-500"
          />
        ))}
      </div>
    </section>
  );
};
