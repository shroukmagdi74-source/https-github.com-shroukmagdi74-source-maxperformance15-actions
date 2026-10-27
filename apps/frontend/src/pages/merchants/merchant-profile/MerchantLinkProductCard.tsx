import React from "react";
import { MerchantLinkFormState, ProductOption } from "./types";

interface MerchantLinkProductCardProps {
  isDark: boolean;
  linkForm: MerchantLinkFormState;
  setLinkForm: React.Dispatch<React.SetStateAction<MerchantLinkFormState>>;
  availableProducts: ProductOption[];
  linkedProductIds: Set<string>;
  productsLoading: boolean;
  linkingProduct: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const MerchantLinkProductCard: React.FC<
  MerchantLinkProductCardProps
> = ({
  isDark,
  linkForm,
  setLinkForm,
  availableProducts,
  linkedProductIds,
  productsLoading,
  linkingProduct,
  onSubmit,
}) => {
  const cardClass = isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
  const textMutedClass = isDark ? "text-gray-400" : "text-gray-500";
  const inputClass = `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition ${
    isDark
      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
      : "bg-white border-gray-300 text-gray-900"
  }`;

  return (
    <div className={`rounded-lg border shadow-sm p-6 ${cardClass}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2
            className={`text-xl font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            ربط منتج بالتاجر
          </h2>
          <p className={`mt-2 text-sm ${textMutedClass}`}>
            اختر منتجًا من منتجات الشركة وحدد سعر التاجر والمخزون الحالي.
          </p>
        </div>
        <span
          className={`text-xs px-3 py-1 rounded-full tabular-nums ${
            productsLoading
              ? isDark
                ? "bg-gray-700 text-gray-200"
                : "bg-gray-100 text-gray-700"
              : isDark
                ? "bg-emerald-500/15 text-emerald-300"
                : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {productsLoading ? "جارٍ تحميل المنتجات" : `${availableProducts.length} منتج`}
        </span>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            المنتج
          </label>
          <select
            value={linkForm.productId}
            onChange={(e) =>
              setLinkForm({ ...linkForm, productId: e.target.value })
            }
            className={inputClass}
            disabled={productsLoading || linkingProduct}
          >
            <option value="">اختر منتجًا لربطه</option>
            {availableProducts.map((productOption) => (
              <option key={productOption.id} value={productOption.id}>
                {productOption.name}
                {linkedProductIds.has(productOption.id) ? " - مرتبط حاليًا" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              سعر التاجر
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={linkForm.merchantPrice}
              onChange={(e) =>
                setLinkForm({
                  ...linkForm,
                  merchantPrice: e.target.value,
                })
              }
              className={`${inputClass} tabular-nums`}
              placeholder="مثال: 150"
              disabled={linkingProduct}
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              المخزون الحالي
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={linkForm.stock}
              onChange={(e) =>
                setLinkForm({
                  ...linkForm,
                  stock: e.target.value,
                })
              }
              className={`${inputClass} tabular-nums`}
              placeholder="0"
              disabled={linkingProduct}
            />
          </div>
        </div>

        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Merchant SKU
          </label>
          <input
            type="text"
            value={linkForm.merchantSku}
            onChange={(e) =>
              setLinkForm({ ...linkForm, merchantSku: e.target.value })
            }
            className={inputClass}
            placeholder="اختياري"
            disabled={linkingProduct}
          />
        </div>

        <label className="inline-flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={linkForm.syncEnabled}
            onChange={(e) =>
              setLinkForm({
                ...linkForm,
                syncEnabled: e.target.checked,
              })
            }
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            disabled={linkingProduct}
          />
          <span className={isDark ? "text-gray-300" : "text-gray-700"}>
            تفعيل المزامنة لهذا المنتج
          </span>
        </label>

        <button
          type="submit"
          disabled={linkingProduct || productsLoading}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
        >
          {linkingProduct ? "جارٍ الربط..." : "ربط المنتج بالتاجر"}
        </button>
      </form>
    </div>
  );
};
