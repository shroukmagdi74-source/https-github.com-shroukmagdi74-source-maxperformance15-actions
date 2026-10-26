import React from "react";

interface QuickAddBasicFieldsProps {
  name: string;
  setName: (val: string) => void;
  price: string;
  setPrice: (val: string) => void;
  comparePrice: string;
  setComparePrice: (val: string) => void;
  displayCurrency: string;
  fieldErrors: { [key: string]: string };
  setFieldErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
}

export const QuickAddBasicFields: React.FC<QuickAddBasicFieldsProps> = ({
  name,
  setName,
  price,
  setPrice,
  comparePrice,
  setComparePrice,
  displayCurrency,
  fieldErrors,
  setFieldErrors,
}) => {
  return (
    <>
      {/* 1. Name */}
      <div>
        <label className="block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
          اسم المنتج <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: "" }));
          }}
          placeholder="مثال: تيشرت قطن أوفر سايز"
          className={`w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
            fieldErrors.name
              ? "border-rose-400 dark:border-rose-600"
              : "border-slate-200 dark:border-slate-700"
          }`}
        />
        {fieldErrors.name && (
          <p className="mt-1 text-xs text-rose-500">{fieldErrors.name}</p>
        )}
      </div>

      {/* 2. Pricing Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Sale Price */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
            سعر البيع ({displayCurrency}) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
              if (fieldErrors.price) setFieldErrors((p) => ({ ...p, price: "" }));
            }}
            placeholder="0.00"
            className={`w-full px-3.5 py-2.5 text-sm tabular-nums bg-white dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
              fieldErrors.price
                ? "border-rose-400 dark:border-rose-600"
                : "border-slate-200 dark:border-slate-700"
            }`}
          />
          {fieldErrors.price && (
            <p className="mt-1 text-xs text-rose-500">{fieldErrors.price}</p>
          )}
        </div>

        {/* Compare Price (Optional) */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
            السعر قبل الخصم ({displayCurrency})
            <span className="text-[11px] font-normal text-slate-400 mr-1.5">(اختياري للخصومات)</span>
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={comparePrice}
            onChange={(e) => {
              setComparePrice(e.target.value);
              if (fieldErrors.comparePrice) setFieldErrors((p) => ({ ...p, comparePrice: "" }));
            }}
            placeholder="0.00"
            className={`w-full px-3.5 py-2.5 text-sm tabular-nums bg-white dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
              fieldErrors.comparePrice
                ? "border-rose-400 dark:border-rose-600"
                : "border-slate-200 dark:border-slate-700"
            }`}
          />
          {fieldErrors.comparePrice && (
            <p className="mt-1 text-xs text-rose-500">{fieldErrors.comparePrice}</p>
          )}
        </div>
      </div>
    </>
  );
};
