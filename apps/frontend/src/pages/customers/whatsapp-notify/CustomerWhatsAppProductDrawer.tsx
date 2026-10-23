import React from "react";
import { useTranslation } from "react-i18next";
import { ShoppingBag, Search, X } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { formatCurrency } from "../../../utils/currency";
import type { Product } from "./types";

interface CustomerWhatsAppProductDrawerProps {
  products: Product[];
  productSearch: string;
  productsLoading: boolean;
  onSearchChange: (val: string) => void;
  onSelectProduct: (product: Product) => void;
  onClose: () => void;
}

export const CustomerWhatsAppProductDrawer: React.FC<CustomerWhatsAppProductDrawerProps> = ({
  products,
  productSearch,
  productsLoading,
  onSearchChange,
  onSelectProduct,
  onClose,
}) => {
  const { t } = useTranslation();

  const filtered = products.filter(
    (p) =>
      !productSearch ||
      p.name.toLowerCase().includes(productSearch.toLowerCase()),
  );

  return (
    <div className="rounded-lg border border-border/80 bg-muted/20 p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t("whatsappNotify.searchProduct", "بحث في كتالوج المنتجات...")}
            value={productSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 pr-8 text-xs"
          />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-muted-foreground hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {productsLoading ? (
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-muted/60 rounded-md animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-xs text-muted-foreground py-4">
          لا توجد منتجات مطابقة للبحث
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto no-scrollbar">
          {filtered.map((product) => {
            const hasImg =
              Array.isArray(product.images) && product.images.length > 0;
            const price =
              typeof product.price === "string"
                ? parseFloat(product.price)
                : product.price;

            return (
              <button
                key={product.id}
                type="button"
                onClick={() => onSelectProduct(product)}
                className="flex items-center gap-2 rounded-md border border-border/50 bg-card p-2 text-start hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-colors"
              >
                {hasImg ? (
                  <img
                    src={product.images[0]}
                    alt=""
                    className="h-9 w-9 rounded object-cover shrink-0 border border-border"
                  />
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-foreground">
                    {product.name}
                  </p>
                  <p className="font-mono text-[10px] tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(price)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
