import { useEffect, useRef, useCallback } from "react";
import { Product } from "./types";

interface UsePosShortcutsOptions {
  products: Product[];
  onAddToCart: (p: Product) => void;
  onSearchQuery: (sku: string) => void;
  searchRef: React.RefObject<HTMLInputElement | null>;
  cartLength: number;
  total: number;
  onOpenPayment: () => void;
  onCloseModals: () => void;
  t: (key: string) => string;
}

export function usePosShortcuts({
  products,
  onAddToCart,
  onSearchQuery,
  searchRef,
  cartLength,
  total,
  onOpenPayment,
  onCloseModals,
  t,
}: UsePosShortcutsOptions) {
  const barcodeBuffer = useRef("");
  const barcodeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleBarcode = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "Enter" && barcodeBuffer.current) {
        const sku = barcodeBuffer.current;
        const p = products.find((x) => x.sku === sku || x.id === sku);
        if (p) {
          if (p.trackInventory !== false && p.stock <= 0) {
            alert(t("posPage.notAvailable"));
          } else {
            onAddToCart(p);
          }
        } else {
          onSearchQuery(sku);
        }
        barcodeBuffer.current = "";
        if (barcodeTimeout.current) clearTimeout(barcodeTimeout.current);
      } else if (e.key.length === 1 && !e.ctrlKey) {
        barcodeBuffer.current += e.key;
        if (barcodeTimeout.current) clearTimeout(barcodeTimeout.current);
        barcodeTimeout.current = setTimeout(() => {
          barcodeBuffer.current = "";
        }, 500);
      }
    },
    [products, onAddToCart, onSearchQuery, t],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleBarcode);
    return () => window.removeEventListener("keydown", handleBarcode);
  }, [handleBarcode]);

  useEffect(() => {
    const shortcuts = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "F4" && cartLength > 0) {
        e.preventDefault();
        onOpenPayment();
      }
      if (e.key === "Escape") {
        onCloseModals();
      }
    };
    window.addEventListener("keydown", shortcuts);
    return () => window.removeEventListener("keydown", shortcuts);
  }, [cartLength, total, onOpenPayment, onCloseModals, searchRef]);
}
