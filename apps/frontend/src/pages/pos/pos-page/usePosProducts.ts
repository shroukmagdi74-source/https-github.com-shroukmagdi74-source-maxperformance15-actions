import { useState, useEffect, useMemo } from "react";
import { config } from "../../../config";
import { authService } from "../../../services/authService";
import { getImageCandidates } from "../../../utils/imageUrl";
import { Product, PosApiProduct } from "./types";

interface UsePosProductsOptions {
  t: (key: string) => string;
}

export function usePosProducts({ t }: UsePosProductsOptions) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(t("posPage.all"));
  const [categories, setCategories] = useState<string[]>([t("posPage.all")]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const token = authService.getAccessToken();
        const headers: HeadersInit = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = "Bearer " + token;
        const params = new URLSearchParams({
          page: "1",
          limit: "200",
        });
        const res = await fetch(
          `${config.apiUrl}/products?${params.toString()}`,
          { headers },
        );
        const data: { success?: boolean; data?: PosApiProduct[] } =
          await res.json();
        if (data.success && data.data) {
          const prods = data.data.map((p) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            sku: p.sku || "",
            category: p.category?.name || t("posPage.notSpecified"),
            images: getImageCandidates(p.mainImage, p.image, p.images),
            stock: Number(p.stock || 0),
            trackInventory: p.trackInventory !== false,
          }));
          setProducts(prods);
          setCategories([
            t("posPage.all"),
            ...(Array.from(
              new Set(prods.map((product) => product.category)),
            ) as string[]),
          ]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [t]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return products.filter((p) => {
      return (
        (p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)) &&
        (selectedCategory === t("posPage.all") || p.category === selectedCategory)
      );
    });
  }, [products, searchQuery, selectedCategory, t]);

  return {
    products,
    loading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
    filtered,
  };
}
