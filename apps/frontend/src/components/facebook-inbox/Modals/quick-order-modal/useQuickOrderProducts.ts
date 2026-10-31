import { useState, useEffect, useCallback, useRef } from "react";
import { config } from "../../../../config";
import { authService } from "../../../../services/authService";
import { getPrimaryImageUrl } from "../../../../utils/imageUrl";
import { tToast } from "../../../../utils/i18n-toast";
import { Product, ProductVariant } from "./types";

export const useQuickOrderProducts = (isOpen: boolean) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productPage, setProductPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(false);
  const [loadingMoreProducts, setLoadingMoreProducts] = useState(false);
  const productListRef = useRef<HTMLDivElement>(null);
  const skipNextSearchRef = useRef(false);

  const fetchProducts = useCallback(
    async (query: string = "", targetPage: number = 1, append = false) => {
      try {
        if (append) setLoadingMoreProducts(true);
        else setLoadingProducts(true);
        const token = authService.getAccessToken();
        const headers: HeadersInit = {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        };

        const params = new URLSearchParams({
          page: String(targetPage),
          limit: "30",
        });
        if (query.trim()) {
          params.set("search", query.trim());
        }

        const response = await fetch(
          `${config.apiUrl}/products?${params.toString()}`,
          { headers },
        );
        const data = await response.json();

        if (data.success && data.data) {
          const mappedProducts: Product[] = data.data.map(
            (p: Record<string, unknown>) => ({
              id: String(p.id),
              name: String(p.name),
              price: Number(p.price),
              stock: Number(p.stock),
              sku: String(p.sku || ""),
              trackInventory: p.trackInventory as boolean | undefined,
              image: getPrimaryImageUrl(p.mainImage, p.image, p.images),
              variants: (
                (p.variants || p.productVariants || []) as Record<
                  string,
                  unknown
                >[]
              ).map((v) => ({
                ...v,
                image: getPrimaryImageUrl(v.image, v.images),
                trackInventory: v.trackInventory as boolean | undefined,
              })) as unknown as ProductVariant[],
            }),
          );

          setProducts((prev) =>
            append ? [...prev, ...mappedProducts] : mappedProducts,
          );

          const total = data.pagination?.total ?? mappedProducts.length;
          const totalPages =
            data.pagination?.totalPages ?? Math.max(1, Math.ceil(total / 30));
          setHasMoreProducts(
            targetPage < totalPages && mappedProducts.length > 0,
          );
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        tToast.error("QuickOrderModal.failed_fetch_fdd8");
      } finally {
        setLoadingProducts(false);
        setLoadingMoreProducts(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (isOpen) {
      skipNextSearchRef.current = true;
      setSearchQuery("");
      setProductPage(1);
      setHasMoreProducts(false);
      fetchProducts("", 1);
    }
  }, [isOpen, fetchProducts]);

  useEffect(() => {
    if (!isOpen) return;
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }
    const timeoutId = setTimeout(() => {
      setProductPage(1);
      if (productListRef.current) {
        productListRef.current.scrollTop = 0;
      }
      fetchProducts(searchQuery, 1);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchProducts, isOpen]);

  const loadMoreProducts = useCallback(() => {
    if (loadingProducts || loadingMoreProducts || !hasMoreProducts) return;
    const nextPage = productPage + 1;
    setProductPage(nextPage);
    fetchProducts(searchQuery, nextPage, true);
  }, [
    loadingProducts,
    loadingMoreProducts,
    hasMoreProducts,
    productPage,
    searchQuery,
    fetchProducts,
  ]);

  const handleProductListScroll = useCallback(() => {
    const el = productListRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 150) {
      loadMoreProducts();
    }
  }, [loadMoreProducts]);

  return {
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    products,
    loadingProducts,
    hasMoreProducts,
    loadingMoreProducts,
    productListRef,
    loadMoreProducts,
    handleProductListScroll,
  };
};
