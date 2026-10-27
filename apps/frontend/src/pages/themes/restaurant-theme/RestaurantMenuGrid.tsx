import React from 'react';
import { categoryName, DemoProduct, DISPLAY_FONT, formatCurrency } from './types';

interface RestaurantMenuGridProps {
  isLoading: boolean;
  hasCatalogProducts: boolean;
  filteredProducts: DemoProduct[];
  onAddToCart: (product: DemoProduct) => void;
}

export const RestaurantMenuGrid: React.FC<RestaurantMenuGridProps> = ({
  isLoading,
  hasCatalogProducts,
  filteredProducts,
  onAddToCart,
}) => {
  return (
    <section id="menu" className="mx-auto max-w-6xl 2xl:max-w-7xl px-6 py-20 md:px-12">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.45em] text-orange-500">
            المنيو
          </div>
          <h3
            className="mt-3 text-5xl font-black uppercase italic tracking-tighter text-[#171717] md:text-6xl"
            style={DISPLAY_FONT}
          >
            جاهز يتطلب بسرعة.
          </h3>
        </div>
        <p className="max-w-xl text-sm font-medium leading-7 text-[#5f5f5f] md:text-right">
          كومبوهات وبرجر وإضافات معمولين عشان تختار بسرعة وتكمّل الطلب من غير لفة طويلة.
        </p>
      </div>

      {isLoading && !hasCatalogProducts ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-20 text-center text-2xl font-bold uppercase italic text-gray-400">
          مفيش منتجات في القسم ده دلوقتي.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <article key={product.id} className="group flex flex-col items-center text-center">
              <div className="relative mb-6 aspect-square w-full overflow-hidden rounded-[3rem] bg-orange-50 transition-colors duration-500 group-hover:bg-red-600">
                <div className="absolute left-6 top-6 z-10 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-red-600 shadow-md">
                    {product.badge || 'BiteRush'}
                  </span>
                  <span className="rounded-full bg-[#171717] px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-white shadow-md tabular-nums">
                    {product.eta || '20-30 دقيقة'}
                  </span>
                </div>
                <img
                  src={product.images?.[0] || 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&q=80'}
                  className="h-full w-full object-cover transition-all duration-700 group-hover:-rotate-6 group-hover:scale-110"
                  alt={product.name}
                />
                <div className="absolute inset-x-0 bottom-0 hidden translate-y-full p-6 transition-transform duration-500 group-hover:translate-y-0 md:block">
                  <button
                    type="button"
                    onClick={() => onAddToCart(product)}
                    className="w-full rounded-2xl bg-white py-4 text-xs font-black uppercase tracking-widest text-red-600 shadow-xl transition-colors hover:bg-orange-50"
                  >
                    أضف للسلة
                  </button>
                </div>
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
                {categoryName(product.category?.name)}
              </div>
              <h4
                className="mt-2 text-3xl font-black uppercase italic tracking-tighter text-[#171717]"
                style={DISPLAY_FONT}
              >
                {product.name}
              </h4>
              <p className="mt-2 max-w-xs text-sm font-medium leading-6 text-[#666666]">
                {product.description}
              </p>
              <div className="mt-4 flex items-center gap-3">
                <p className="text-2xl font-black italic text-orange-500 tabular-nums" style={DISPLAY_FONT}>
                  {formatCurrency(product.price)}
                </p>
                {typeof product.comparePrice === 'number' && product.comparePrice > product.price && (
                  <p className="text-sm font-bold italic text-gray-400 line-through tabular-nums">
                    {formatCurrency(product.comparePrice)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onAddToCart(product)}
                className="mt-5 w-full rounded-2xl bg-white py-4 text-xs font-black uppercase tracking-widest text-red-600 shadow-xl transition-colors hover:bg-orange-50 md:hidden"
              >
                أضف للسلة
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
