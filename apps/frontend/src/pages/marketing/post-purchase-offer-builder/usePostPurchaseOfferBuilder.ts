import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { apiClient } from "../../../services/apiClient";
import type { PostPurchaseOfferConfig } from "../../../types/postPurchaseOffer";
import { DEFAULT_POST_PURCHASE_OFFER } from "../../../types/postPurchaseOffer";
import { CatalogItem } from "./types";

export const usePostPurchaseOfferBuilder = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<"builder" | "analytics">("builder");

  const [offer, setOffer] = useState<PostPurchaseOfferConfig>(DEFAULT_POST_PURCHASE_OFFER);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [triggerProductSearch, setTriggerProductSearch] = useState("");
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">("mobile");

  const loadOffer = useCallback(async () => {
    try {
      setLoading(true);
      const res = (await apiClient.get("/post-purchase-offer")) as {
        data?: { data?: PostPurchaseOfferConfig };
      };
      if (res?.data?.data) {
        setOffer((prev) => ({ ...prev, ...res.data!.data }));
      }
    } catch (err) {
      console.warn("Could not load post-purchase offer:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCatalog = useCallback(async () => {
    try {
      setCatalogLoading(true);
      const res = (await apiClient.get("/products?limit=250&status=active")) as {
        data?: { data?: any[] } | any[];
      };
      const list = Array.isArray((res?.data as any)?.data)
        ? (res?.data as any).data
        : Array.isArray(res?.data)
          ? res?.data
          : [];

      const normalized: CatalogItem[] = list.map((p: any) => {
        let imageUrl: string | undefined;
        if (typeof p.imageUrl === "string" && p.imageUrl.trim()) {
          imageUrl = p.imageUrl.trim();
        } else if (typeof p.mainImage === "string" && p.mainImage.trim()) {
          imageUrl = p.mainImage.trim();
        } else if (Array.isArray(p.images) && p.images.length > 0) {
          const first = p.images[0];
          imageUrl = typeof first === "string" ? first : first?.url;
        }
        return {
          id: String(p.id || ""),
          name: String(p.name || "منتج بدون اسم"),
          price: Number(p.price) || 0,
          comparePrice: Number(p.comparePrice) || null,
          sku: String(p.sku || ""),
          categoryName: p.category?.name || "",
          imageUrl,
        };
      });
      setCatalog(normalized);
    } catch (err) {
      console.error("Failed to load catalog products:", err);
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOffer();
    void loadCatalog();
  }, [loadOffer, loadCatalog]);

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return catalog.slice(0, 40);
    const query = productSearch.toLowerCase();
    return catalog
      .filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.sku?.toLowerCase().includes(query),
      )
      .slice(0, 40);
  }, [catalog, productSearch]);

  const filteredTriggerProducts = useMemo(() => {
    if (!triggerProductSearch.trim()) return catalog;
    const query = triggerProductSearch.toLowerCase().trim();
    return catalog.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.sku && p.sku.toLowerCase().includes(query)),
    );
  }, [catalog, triggerProductSearch]);

  const handleToggleTriggerProduct = useCallback((productId: string) => {
    setOffer((prev) => {
      const current = Array.isArray(prev.triggerProductIds)
        ? prev.triggerProductIds
        : [];
      const exists = current.includes(productId);
      const next = exists
        ? current.filter((id) => id !== productId)
        : [...current, productId];
      return { ...prev, triggerProductIds: next };
    });
  }, []);

  const handleSelectAllTriggerProducts = useCallback(() => {
    setOffer((prev) => ({
      ...prev,
      triggerProductIds: catalog.map((p) => p.id),
    }));
  }, [catalog]);

  const handleClearTriggerProducts = useCallback(() => {
    setOffer((prev) => ({
      ...prev,
      triggerProductIds: [],
    }));
  }, []);

  const selectedProduct = useMemo(() => {
    return catalog.find((p) => p.id === offer.productId) || null;
  }, [catalog, offer.productId]);

  const calculatedOfferPrice = useMemo(() => {
    const base =
      Number(offer.originalPrice) || Number(selectedProduct?.price) || 0;
    if (offer.discountType === "percentage") {
      const discount = (base * (Number(offer.discountValue) || 0)) / 100;
      return Math.max(0, Number((base - discount).toFixed(2)));
    }
    return Math.max(0, Number(Number(offer.discountValue || 0).toFixed(2)));
  }, [offer.discountType, offer.discountValue, offer.originalPrice, selectedProduct]);

  const calculatedSavings = useMemo(() => {
    const base =
      Number(offer.originalPrice) || Number(selectedProduct?.price) || 0;
    return Math.max(0, base - calculatedOfferPrice);
  }, [offer.originalPrice, selectedProduct, calculatedOfferPrice]);

  const calculatedSavingsPercent = useMemo(() => {
    const base =
      Number(offer.originalPrice) || Number(selectedProduct?.price) || 0;
    if (base <= 0) return 0;
    return Math.round((calculatedSavings / base) * 100);
  }, [offer.originalPrice, selectedProduct, calculatedSavings]);

  const handleSave = useCallback(async () => {
    if (offer.triggerCondition === "specific_products") {
      const selectedCount = Array.isArray(offer.triggerProductIds)
        ? offer.triggerProductIds.length
        : 0;
      if (selectedCount === 0) {
        toast.error(
          "يرجى اختيار منتج واحد على الأقل عند تفعيل خيار 'منتجات معينة فقط'",
        );
        return;
      }
    }

    try {
      setSaving(true);
      const payload: PostPurchaseOfferConfig = {
        ...offer,
        offerPrice: calculatedOfferPrice,
      };

      const res = (await apiClient.put("/post-purchase-offer", payload)) as {
        data?: { success?: boolean; message?: string };
      };

      if (res?.data?.success !== false) {
        toast.success("تم حفظ إعدادات العرض بنجاح!");
        setLastSavedAt(new Date());
      } else {
        throw new Error(res?.data?.message || "فشل الحفظ");
      }
    } catch (err: any) {
      console.error("Save failed:", err);
      toast.error(err?.message || "حدث خطأ أثناء حفظ إعدادات العرض");
    } finally {
      setSaving(false);
    }
  }, [offer, calculatedOfferPrice]);

  const handleSelectProduct = useCallback((p: CatalogItem) => {
    setOffer((prev) => ({
      ...prev,
      productId: p.id,
      productName: p.name,
      originalPrice: p.price || 0,
      productImage: p.imageUrl || prev.productImage,
    }));
    setIsProductPickerOpen(false);
  }, []);

  const handleAddFeature = useCallback(() => {
    if (offer.features.length >= 6) {
      toast.error("الحد الأقصى هو 6 ميزات لضمان سرعة التحويل");
      return;
    }
    setOffer((prev) => ({
      ...prev,
      features: [...prev.features, "ميزة إضافية للعرض"],
    }));
  }, [offer.features.length]);

  const handleRemoveFeature = useCallback((index: number) => {
    setOffer((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  }, []);

  const handleUpdateFeature = useCallback((index: number, val: string) => {
    setOffer((prev) => {
      const next = [...prev.features];
      next[index] = val;
      return { ...prev, features: next };
    });
  }, []);

  return {
    loading,
    saving,
    lastSavedAt,
    activeTab,
    offer,
    catalog,
    catalogLoading,
    productSearch,
    isProductPickerOpen,
    triggerProductSearch,
    previewDevice,
    filteredProducts,
    filteredTriggerProducts,
    selectedProduct,
    calculatedOfferPrice,
    calculatedSavings,
    calculatedSavingsPercent,
    setActiveTab,
    setOffer,
    setProductSearch,
    setIsProductPickerOpen,
    setTriggerProductSearch,
    setPreviewDevice,
    handleSave,
    handleSelectProduct,
    handleToggleTriggerProduct,
    handleSelectAllTriggerProducts,
    handleClearTriggerProducts,
    handleAddFeature,
    handleRemoveFeature,
    handleUpdateFeature,
  };
};
