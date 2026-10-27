import React from "react";
import { Target, Search, AlertCircle } from "lucide-react";
import type { PostPurchaseOfferConfig } from "../../../types/postPurchaseOffer";
import { CatalogItem } from "./types";

interface PostPurchaseOfferTriggerConditionCardProps {
  offer: PostPurchaseOfferConfig;
  catalog: CatalogItem[];
  catalogLoading: boolean;
  triggerProductSearch: string;
  filteredTriggerProducts: CatalogItem[];
  setOffer: React.Dispatch<React.SetStateAction<PostPurchaseOfferConfig>>;
  setTriggerProductSearch: (query: string) => void;
  onToggleTriggerProduct: (productId: string) => void;
  onSelectAllTriggerProducts: () => void;
  onClearTriggerProducts: () => void;
}

export const PostPurchaseOfferTriggerConditionCard: React.FC<
  PostPurchaseOfferTriggerConditionCardProps
> = ({
  offer,
  catalog,
  catalogLoading,
  triggerProductSearch,
  filteredTriggerProducts,
  setOffer,
  setTriggerProductSearch,
  onToggleTriggerProduct,
  onSelectAllTriggerProducts,
  onClearTriggerProducts,
}) => {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
      <div>
        <h3 className="font-bold text-base text-foreground flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          إمتى يظهر العرض للمشتري؟
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          حدد ما إذا كان العرض يظهر بعد شراء أي منتج أو بعد شراء منتجات محددة فقط
        </p>
      </div>

      {/* Condition Radio Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <label
          onClick={() =>
            setOffer((prev) => ({ ...prev, triggerCondition: "all" }))
          }
          className={`p-3.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
            offer.triggerCondition !== "specific_products"
              ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary/20 shadow-sm"
              : "border-border hover:bg-muted/30 text-muted-foreground"
          }`}
        >
          <input
            type="radio"
            name="triggerCondition"
            checked={offer.triggerCondition !== "specific_products"}
            onChange={() =>
              setOffer((prev) => ({ ...prev, triggerCondition: "all" }))
            }
            className="mt-0.5 text-primary focus:ring-primary"
          />
          <div>
            <span className="font-bold text-foreground block">
              كل الأوردرات (افتراضي وموصى به)
            </span>
            <span className="text-[11px] text-muted-foreground block mt-0.5 leading-relaxed">
              يظهر العرض تلقائيًا بعد أي طلب شراء مكتمل في المتجر لتعظيم متوسط قيمة الطلب (AOV).
            </span>
          </div>
        </label>

        <label
          onClick={() =>
            setOffer((prev) => ({ ...prev, triggerCondition: "specific_products" }))
          }
          className={`p-3.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
            offer.triggerCondition === "specific_products"
              ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary/20 shadow-sm"
              : "border-border hover:bg-muted/30 text-muted-foreground"
          }`}
        >
          <input
            type="radio"
            name="triggerCondition"
            checked={offer.triggerCondition === "specific_products"}
            onChange={() =>
              setOffer((prev) => ({
                ...prev,
                triggerCondition: "specific_products",
              }))
            }
            className="mt-0.5 text-primary focus:ring-primary"
          />
          <div>
            <span className="font-bold text-foreground block">
              منتجات معينة فقط
            </span>
            <span className="text-[11px] text-muted-foreground block mt-0.5 leading-relaxed">
              يظهر العرض فقط إذا تضمن طلب المشتري واحدًا من المنتجات المحددة في القائمة أدناه.
            </span>
          </div>
        </label>
      </div>

      {/* Specific Products Multi-Select Sub-Panel */}
      {offer.triggerCondition === "specific_products" && (
        <div className="space-y-3 pt-2 border-t border-border/60">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <span>المنتجات المفعلة للعرض:</span>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-black tabular-nums">
                {Array.isArray(offer.triggerProductIds)
                  ? offer.triggerProductIds.length
                  : 0}{" "}
                محددة
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <button
                type="button"
                onClick={onSelectAllTriggerProducts}
                className="text-primary hover:underline font-bold cursor-pointer"
              >
                تحديد الكل
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={onClearTriggerProducts}
                className="text-muted-foreground hover:text-rose-600 font-medium cursor-pointer"
              >
                مسح التحديد
              </button>
            </div>
          </div>

          {/* Search in Trigger Products */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute top-2.5 start-3 text-muted-foreground" />
            <input
              type="text"
              value={triggerProductSearch}
              onChange={(e) => setTriggerProductSearch(e.target.value)}
              placeholder="ابحث بالاسم لتحديد منتجات الشرط..."
              className="w-full ps-8 pe-3 py-1.5 text-xs rounded-lg border border-border bg-background"
            />
          </div>

          {/* Selected Trigger Products Chips */}
          {Array.isArray(offer.triggerProductIds) &&
            offer.triggerProductIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 rounded-lg bg-muted/20 border border-border/40">
                {offer.triggerProductIds.map((id) => {
                  const matchedItem = catalog.find((c) => c.id === id);
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] bg-background border border-border text-foreground font-medium shadow-xs"
                    >
                      <span className="truncate max-w-[120px]">
                        {matchedItem?.name || id}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleTriggerProduct(id);
                        }}
                        className="text-muted-foreground hover:text-rose-600 cursor-pointer"
                      >
                        ✕
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

          {/* Products List with Checkboxes */}
          <div className="max-h-52 overflow-y-auto divide-y divide-border/60 rounded-xl border border-border bg-muted/10">
            {catalogLoading ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                جارٍ تحميل المنتجات...
              </div>
            ) : filteredTriggerProducts.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                لا توجد منتجات مطابقة للبحث
              </div>
            ) : (
              filteredTriggerProducts.map((p) => {
                const isSelected =
                  Array.isArray(offer.triggerProductIds) &&
                  offer.triggerProductIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => onToggleTriggerProduct(p.id)}
                    className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? "bg-primary/5" : "hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleTriggerProduct(p.id)}
                        className="rounded border-border text-primary focus:ring-primary cursor-pointer"
                      />
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt=""
                          className="w-8 h-8 rounded object-cover border"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-[10px]">
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
                    <span
                      className={`text-[11px] font-bold ${
                        isSelected ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {isSelected ? "محدد ✓" : "+ إضافة"}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {(!offer.triggerProductIds ||
            offer.triggerProductIds.length === 0) && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              يرجى تحديد منتج واحد على الأقل لتفعيل شرط الظهور.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
