import React from 'react';

interface RestaurantCategoryBarProps {
  categories: string[];
  activeCat: string;
  onSelectCategory: (cat: string) => void;
  hasProducts: boolean;
}

export const RestaurantCategoryBar: React.FC<RestaurantCategoryBarProps> = ({
  categories,
  activeCat,
  onSelectCategory,
  hasProducts,
}) => {
  return (
    <>
      <section className="sticky top-[78px] z-[90] border-y border-gray-100 bg-white/85 py-6 shadow-sm backdrop-blur-md">
        <div className="mx-auto max-w-6xl 2xl:max-w-7xl overflow-x-auto px-6 md:px-12">
          <div className="flex justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => onSelectCategory(category)}
                className={`flex-shrink-0 rounded-full border-2 px-8 py-3 text-xs font-black uppercase tracking-wider transition-all ${
                  activeCat === category
                    ? 'border-[#ff6b2c] bg-[#ff6b2c] text-white shadow-lg shadow-orange-500/30'
                    : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pt-8 md:px-12">
        <div className="mx-auto max-w-6xl 2xl:max-w-7xl rounded-[2rem] border border-orange-100 bg-white px-5 py-4 shadow-sm">
          <p className="text-sm font-semibold text-[#5f5f5f]">
            {hasProducts
              ? 'المنيو محدث تلقائيًا بأحدث المنتجات المتاحة الآن.'
              : 'ابدأ بالكومبو المناسب وكمل طلبك بإضافة ومشروب على مزاجك.'}
          </p>
        </div>
      </section>
    </>
  );
};
