import React from "react";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { Product } from "./types";
import { PosProductImage } from "./PosProductImage";

interface PosProductsGridProps {
  products: Product[];
  loading: boolean;
  onAddToCart: (product: Product) => void;
  t: (key: string) => string;
}

export const PosProductsGrid: React.FC<PosProductsGridProps> = ({
  products,
  loading,
  onAddToCart,
  t,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      {loading ? (
        <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
          <Loader2 className="size-6 text-primary animate-spin" />
          <p className="text-xs">جاري تحميل المنتجات...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground py-16">
          <ImageIcon className="size-10 text-muted-foreground/30" />
          <p className="text-sm font-medium">لا توجد منتجات مطابقة للبحث</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {products.map((p, index) => {
            const isOutOfStock = p.trackInventory !== false && p.stock <= 0;
            const isLowStock =
              p.trackInventory !== false && p.stock < 5 && p.stock > 0;

            return (
              <div
                key={p.id}
                onClick={() => onAddToCart(p)}
                className={`rounded-xl border border-border/80 dark:border-border/60 bg-card/60 backdrop-blur-xs cursor-pointer hover:border-foreground/30 hover:shadow-2xs transition-all active:scale-[0.98] flex flex-col justify-between overflow-hidden ${
                  isOutOfStock ? "opacity-50" : ""
                }`}
              >
                <div className="h-28 bg-muted/30 relative flex items-center justify-center overflow-hidden">
                  {p.images.length ? (
                    <PosProductImage
                      candidates={p.images}
                      alt={p.name}
                      className="h-full w-full object-cover"
                      requestedWidth={320}
                      responsiveWidths={[160, 240, 320]}
                      responsiveSizes="(min-width: 1280px) 18vw, (min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
                      imageQuality={70}
                      loading={index < 8 ? "eager" : "lazy"}
                      fetchPriority={index < 8 ? "high" : "low"}
                      fallback={
                        <ImageIcon className="size-8 text-muted-foreground/30" />
                      }
                    />
                  ) : (
                    <ImageIcon className="size-8 text-muted-foreground/30" />
                  )}

                  {/* Monospace Micro-Stock Pill */}
                  <span
                    className={`absolute top-2 right-2 font-mono text-[10px] px-1.5 py-0.5 rounded tabular-nums border shadow-2xs ${
                      isOutOfStock
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-bold"
                        : isLowStock
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-semibold"
                        : "bg-background/90 text-foreground border-border/80 font-medium"
                    }`}
                  >
                    {isOutOfStock ? t("posPage.outOfStock") : p.stock}
                  </span>
                </div>

                <div className="p-2.5 space-y-1">
                  <h3 className="text-xs font-semibold truncate text-foreground">
                    {p.name}
                  </h3>
                  <p className="font-mono text-xs font-bold tabular-nums text-foreground">
                    {p.price.toLocaleString("en-US")}{" "}
                    <span className="text-[10px] font-normal text-muted-foreground">
                      EGP
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
