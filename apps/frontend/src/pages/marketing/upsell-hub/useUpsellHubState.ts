import { useState, useEffect, useMemo, useCallback } from "react";
import { apiClient } from "../../../services/apiClient";
import { tToast } from "../../../utils/i18n-toast";
import {
  type ManagedMarketplaceAppSlug,
} from "../../settings/storeConversionSettingsConfig";
import {
  useConversionTools,
  isAppOperational,
} from "../../settings/useConversionTools";
import {
  CatalogProduct,
  ManagedRelationType,
  RelationBuckets,
  isRecord,
  normalizeProduct,
} from "./types";

export const useUpsellHubState = () => {
  // Conversion Suite App State for toggling placements
  const conversionAppSlugs = useMemo<ManagedMarketplaceAppSlug[]>(
    () => ["conversion-suite"],
    [],
  );
  const {
    loading: conversionLoading,
    managedApps,
    handleToolToggle,
  } = useConversionTools(conversionAppSlugs);

  const conversionState = managedApps["conversion-suite"];
  const isConversionInstalled = Boolean(
    conversionState?.app && isAppOperational(conversionState.app),
  );

  const modulesSettings = useMemo(() => {
    if (!conversionState?.settings) return {};
    const modules = conversionState.settings["modules"];
    return isRecord(modules) ? modules : {};
  }, [conversionState]);

  const pdpCrossSellActive = Boolean(modulesSettings["crossSell"]);
  const pdpBoughtTogetherActive = Boolean(modulesSettings["boughtTogether"]);
  const pdpActive = pdpCrossSellActive || pdpBoughtTogetherActive;
  const cartUpsellActive = Boolean(
    modulesSettings["cartUpsell"] ?? modulesSettings["quickAdd"] ?? true,
  );
  const postPurchaseActive = Boolean(
    modulesSettings["postPurchaseUpsell"] ?? true,
  );

  // Catalog Products
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "with_offers" | "without_offers"
  >("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Edit Relations Drawer / Modal State
  const [selectedProduct, setSelectedProduct] =
    useState<CatalogProduct | null>(null);
  const [activeTab, setActiveTab] = useState<ManagedRelationType>("upsell");
  const [editRelations, setEditRelations] = useState<RelationBuckets>({
    upsell: [],
    crossSell: [],
    related: [],
  });
  const [relationSearch, setRelationSearch] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch Catalog
  const loadCatalog = useCallback(async () => {
    try {
      setCatalogLoading(true);
      const response = await apiClient.get("/products?limit=500&status=all");
      const list = Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.data)
          ? response.data
          : [];
      setCatalog(list.map(normalizeProduct));
    } catch (error) {
      console.error("Failed to load catalog products:", error);
      tToast.error("فشل في تحميل قائمة المنتجات");
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  // Categories extraction
  const categories = useMemo(() => {
    const set = new Set<string>();
    catalog.forEach((p) => {
      if (p.categoryName) set.add(p.categoryName);
    });
    return Array.from(set).sort();
  }, [catalog]);

  // KPIs
  const stats = useMemo(() => {
    const total = catalog.length;
    let withOffers = 0;
    let totalUpsells = 0;
    let totalCrossSells = 0;

    catalog.forEach((p) => {
      const hasAny =
        p.relations.upsell.length > 0 ||
        p.relations.crossSell.length > 0 ||
        p.relations.related.length > 0;
      if (hasAny) withOffers++;
      totalUpsells += p.relations.upsell.length;
      totalCrossSells += p.relations.crossSell.length;
    });

    const coverage = total > 0 ? Math.round((withOffers / total) * 100) : 0;
    let activePlacements = 0;
    if (pdpActive) activePlacements++;
    if (cartUpsellActive) activePlacements++;
    if (postPurchaseActive) activePlacements++;

    return {
      total,
      withOffers,
      coverage,
      totalUpsells,
      totalCrossSells,
      activePlacements,
    };
  }, [catalog, pdpActive, cartUpsellActive, postPurchaseActive]);

  // Filtered Catalog
  const filteredCatalog = useMemo(() => {
    return catalog.filter((product) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.categoryName.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (categoryFilter !== "all" && product.categoryName !== categoryFilter) {
        return false;
      }

      const hasOffers =
        product.relations.upsell.length > 0 ||
        product.relations.crossSell.length > 0 ||
        product.relations.related.length > 0;

      if (filterType === "with_offers") return hasOffers;
      if (filterType === "without_offers") return !hasOffers;

      return true;
    });
  }, [catalog, searchQuery, filterType, categoryFilter]);

  // Open Edit Modal
  const openEditModal = useCallback((product: CatalogProduct) => {
    setSelectedProduct(product);
    setEditRelations({
      upsell: [...product.relations.upsell],
      crossSell: [...product.relations.crossSell],
      related: [...product.relations.related],
    });
    setRelationSearch("");
    setActiveTab("upsell");
  }, []);

  const closeEditModal = useCallback(() => {
    setSelectedProduct(null);
    setRelationSearch("");
  }, []);

  // Add / Remove from Active Relation
  const handleAddRelation = useCallback(
    (targetId: string) => {
      if (!selectedProduct || targetId === selectedProduct.id) return;
      const currentList = editRelations[activeTab];
      if (currentList.includes(targetId)) return;

      setEditRelations((prev) => ({
        ...prev,
        [activeTab]: [...prev[activeTab], targetId],
      }));
    },
    [selectedProduct, editRelations, activeTab],
  );

  const handleRemoveRelation = useCallback(
    (targetId: string) => {
      setEditRelations((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab].filter((id) => id !== targetId),
      }));
    },
    [activeTab],
  );

  const handleMoveRelation = useCallback(
    (targetId: string, direction: "up" | "down") => {
      const list = [...editRelations[activeTab]];
      const index = list.indexOf(targetId);
      if (index === -1) return;
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= list.length) return;

      const [item] = list.splice(index, 1);
      list.splice(nextIndex, 0, item);

      setEditRelations((prev) => ({
        ...prev,
        [activeTab]: list,
      }));
    },
    [editRelations, activeTab],
  );

  // Save Relations
  const handleSaveRelations = useCallback(async () => {
    if (!selectedProduct) return;

    try {
      setSaving(true);
      const nextMetadata = {
        ...selectedProduct.metadata,
        upsellProducts: editRelations.upsell,
        crossSellProducts: editRelations.crossSell,
        relatedProducts: editRelations.related,
      };

      await apiClient.patch(`/products/${selectedProduct.id}`, {
        metadata: nextMetadata,
      });

      setCatalog((prev) =>
        prev.map((p) =>
          p.id === selectedProduct.id
            ? {
                ...p,
                metadata: nextMetadata,
                relations: { ...editRelations },
              }
            : p,
        ),
      );

      tToast.success("تم حفظ عروض وروابط المنتج بنجاح");
      closeEditModal();
    } catch (error) {
      console.error("Failed to save product relations:", error);
      tToast.error("حدث خطأ أثناء حفظ الروابط");
    } finally {
      setSaving(false);
    }
  }, [selectedProduct, editRelations, closeEditModal]);

  // Products available to add in modal
  const candidatesToAdd = useMemo(() => {
    if (!selectedProduct) return [];
    const currentIds = new Set(editRelations[activeTab]);
    const query = relationSearch.trim().toLowerCase();

    return catalog
      .filter((p) => p.id !== selectedProduct.id && !currentIds.has(p.id))
      .filter((p) => {
        if (!query) return true;
        return (
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          p.categoryName.toLowerCase().includes(query)
        );
      })
      .slice(0, 15);
  }, [catalog, selectedProduct, editRelations, activeTab, relationSearch]);

  // Catalog Map for lookup
  const catalogMap = useMemo(() => {
    const map = new Map<string, CatalogProduct>();
    catalog.forEach((p) => map.set(p.id, p));
    return map;
  }, [catalog]);

  // Toggle Placement Modules
  const toggleModule = useCallback(
    async (moduleKey: string, currentValue: boolean) => {
      const toolConfig = {
        key: moduleKey,
        label: moduleKey,
        description: "",
        appSlug: "conversion-suite" as ManagedMarketplaceAppSlug,
        readPaths: ["general.enabled", `modules.${moduleKey}`],
        writePathsOn: ["general.enabled", `modules.${moduleKey}`],
        writePathsOff: [`modules.${moduleKey}`],
      };
      await handleToolToggle(toolConfig, !currentValue);
    },
    [handleToolToggle],
  );

  return {
    conversionLoading,
    isConversionInstalled,
    pdpCrossSellActive,
    cartUpsellActive,
    postPurchaseActive,
    catalog,
    catalogLoading,
    searchQuery,
    filterType,
    categoryFilter,
    categories,
    stats,
    filteredCatalog,
    selectedProduct,
    activeTab,
    editRelations,
    relationSearch,
    saving,
    candidatesToAdd,
    catalogMap,
    setSearchQuery,
    setFilterType,
    setCategoryFilter,
    setActiveTab,
    setRelationSearch,
    openEditModal,
    closeEditModal,
    handleAddRelation,
    handleRemoveRelation,
    handleMoveRelation,
    handleSaveRelations,
    toggleModule,
  };
};
