import React from "react";
import { Package, Plus, Search, Truck } from "lucide-react";
import { getDirection } from "../../../i18n";
import type { PostPurchaseOfferConfig } from "../../../types/postPurchaseOffer";
import { CatalogItem } from "./types";

interface PostPurchaseOfferProductPricingCardProps {
  offer: PostPurchaseOfferConfig;
  selectedProduct: CatalogItem | null;
  isProductPickerOpen: boolean;
  productSearch: string;
  catalogLoading: boolean;
  filteredProducts: CatalogItem[];
  calculatedOfferPrice: number;
  calculatedSavings: number;
  calculatedSavingsPercent: number;
  setOffer: React.Dispatch<React.SetStateAction<PostPurchaseOfferConfig>>;
  setIsProductPickerOpen: (open: boolean) => void;
  setProductSearch: (query: string) => void;
  onSelectProduct: (product: CatalogItem) => void;
}

export const PostPurchaseOfferProductPricingCard: React.FC<
  PostPurchaseOfferProductPricingCardProps
> = ({
  offer,
  selectedProduct,
  isProductPickerOpen,
  productSearch,
  catalogLoading,
  filteredProducts,
  calculatedOfferPrice,
  calculatedSavings,
  calculatedSavingsPercent,
  setOffer,
  setIsProductPickerOpen,
  setProductSearch,
  onSelectProduct,
}) => {
  const isRtl = getDirection() === "rtl";

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-5">
      <h3 className="font-bold text-base text-foreground flex items-center gap-2">
        <Package className="w-4 h-4 text-primary" />
        منتج العرض والتسعير
      </h3>

      {/* Selected Product Banner */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-foreground">المنتج المعروض:</label>

        {offer.productId ? (
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-muted/30">
            <div className="flex items-center gap-3">
              {offer.productImage ? (
                <img
                  src={offer.productImage}
                  alt="Product"
                  className="w-14 h-14 object-cover rounded-lg border border-border"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
                  لا توجد صورة
                </div>
              )}
              <div>
                <p className="font-bold text-sm text-foreground leading-tight">
                  {offer.productName || selectedProduct?.name || "منتج محدد"}
                </p>
                <p className="text-xs text-muted-foreground mt-1 tabular-nums">
                  السعر الأصلي: {offer.originalPrice} ج.م
                  {selectedProduct?.sku ? ` • كود: ${selectedProduct.sku}` : ""}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsProductPickerOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-border text-xs font-bold hover:bg-muted transition-colors cursor-pointer"
            >
              تغيير المنتج
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsProductPickerOpen(true)}
            className="w-full p-4 rounded-xl border-2 border-dashed border-border/80 hover:border-primary/60 hover:bg-primary/5 transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-primary"
          >
            <Plus className="w-5 h-5" />
            <span className="font-bold text-sm">اختر منتج العرض من الكتالوج</span>
          </button>
        )}
      </div>

      {/* Product Picker Modal / Dropdown */}
      {isProductPickerOpen && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs">اختر المنتج من القائمة:</span>
            <button
              type="button"
              onClick={() => setIsProductPickerOpen(false)}
              className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              إغلاق ✕
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute top-2.5 start-3 text-muted-foreground" />
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="ابحث بالاسم أو الباركود..."
              className="w-full ps-9 pe-3 py-2 text-xs rounded-lg border border-border bg-background"
            />
          </div>

          <div className="max-h-56 overflow-y-auto divide-y divide-border/60">
            {catalogLoading ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                جارٍ تحميل المنتجات...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                لا توجد منتجات مطابقة
              </div>
            ) : (
              filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectProduct(p)}
                  className="p-2.5 hover:bg-muted/50 rounded-lg flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt=""
                        className="w-9 h-9 rounded object-cover border"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded bg-muted flex items-center justify-center text-[10px]">
                        📦
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-foreground line-clamp-1">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground tabular-nums">
                        {p.price || 0} ج.م
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-primary">اختيار</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Discount & Pricing Config */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/60">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">نوع الخصم:</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() =>
                setOffer((prev) => ({ ...prev, discountType: "percentage" }))
              }
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                offer.discountType === "percentage"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground"
              }`}
            >
              نسبة مئوية (%)
            </button>
            <button
              type="button"
              onClick={() =>
                setOffer((prev) => ({ ...prev, discountType: "fixed_price" }))
              }
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                offer.discountType === "fixed_price"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground"
              }`}
            >
              سعر محدد (ج.م)
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">
            {offer.discountType === "percentage"
              ? "نسبة الخصم (%):"
              : "السعر المعروض للعميل (ج.م):"}
          </label>
          <input
            type="number"
            min="0"
            max={offer.discountType === "percentage" ? 100 : 99999}
            value={offer.discountValue}
            onChange={(e) =>
              setOffer((prev) => ({
                ...prev,
                discountValue: Math.max(0, Number(e.target.value) || 0),
              }))
            }
            className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-background font-bold tabular-nums"
          />
        </div>
      </div>

      {/* Live Pricing Summary Box */}
      <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-500/10 text-xs space-y-1 text-emerald-950 dark:text-emerald-200">
        <div className="flex justify-between items-center font-bold">
          <span>السعر النهائي في العرض:</span>
          <span className="text-sm font-black tabular-nums">
            {calculatedOfferPrice} ج.م
          </span>
        </div>
        <div className="flex justify-between items-center text-muted-foreground text-[11px]">
          <span>مقدار التوفير للعميل:</span>
          <span className="tabular-nums font-bold text-emerald-700 dark:text-emerald-300">
            وفر {calculatedSavings} ج.م ({calculatedSavingsPercent}% خصم)
          </span>
        </div>
      </div>

      {/* Free Shipping Toggle */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-emerald-600" />
            شحن مجاني للعرض
          </p>
          <p className="text-[11px] text-muted-foreground">
            يُشحن في نفس طرد الطلب الأصلي دون إضافة أي تكاليف شحن
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={offer.freeShipping}
          onClick={() =>
            setOffer((prev) => ({
              ...prev,
              freeShipping: !prev.freeShipping,
            }))
          }
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
            offer.freeShipping ? "bg-emerald-600" : "bg-gray-300 dark:bg-gray-700"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
              offer.freeShipping
                ? isRtl
                  ? "-translate-x-6"
                  : "translate-x-6"
                : isRtl
                  ? "-translate-x-1"
                  : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
};
