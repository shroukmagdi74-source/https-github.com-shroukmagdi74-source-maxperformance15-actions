import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import tokenManager from "../../../utils/tokenManager";
import { useAuth } from "../../../hooks/useAuthSimple";
import type {
  Connection,
  Request,
  InternalProduct,
  InternalOrder,
  InternalView,
  InternalTab,
} from "./types";

export function useInternalIntegrations() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [view, setView] = useState<InternalView>("main");
  const [activeTab, setActiveTab] = useState<InternalTab>("connections");
  const [connections, setConnections] = useState<Connection[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [consumers, setConsumers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchId, setSearchId] = useState("");
  const [searching, setSearching] = useState(false);
  const [copied, setCopied] = useState(false);

  // Pull Products State
  const [selectedProvider, setSelectedProvider] = useState<Connection | null>(null);
  const [providerProducts, setProviderProducts] = useState<InternalProduct[]>([]);
  const [selectedProductIndexes, setSelectedProductIndexes] = useState<Set<number>>(new Set());
  const [fetchingProducts, setFetchingProducts] = useState(false);
  const [importing, setImporting] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState("");

  // Response Loading State
  const [respondingIds, setRespondingIds] = useState<Set<string>>(new Set());

  // Pull Orders State
  const [availableOrders, setAvailableOrders] = useState<InternalOrder[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [fetchingOrders, setFetchingOrders] = useState(false);
  const [importingOrders, setImportingOrders] = useState(false);

  const getAuthHeaders = (additional: Record<string, string> = {}) =>
    tokenManager.createAuthHeaders(additional);

  const fetchActiveConnections = useCallback(async () => {
    try {
      const resp = await fetch("/api/v1/company-connections/active", {
        headers: getAuthHeaders(),
      });
      const data = await resp.json();
      if (data.success) setConnections(data.data);
    } catch {
      toast.error(t("platform.k_7"));
    }
  }, [t]);

  const fetchConsumers = useCallback(async () => {
    try {
      const resp = await fetch("/api/v1/company-connections/consumers", {
        headers: getAuthHeaders(),
      });
      const data = await resp.json();
      if (data.success) setConsumers(data.data);
    } catch {
      toast.error(t("platform.k_8"));
    }
  }, [t]);

  const fetchReceivedRequests = useCallback(async () => {
    try {
      const resp = await fetch("/api/v1/company-connections/requests/received", {
        headers: getAuthHeaders(),
      });
      const data = await resp.json();
      if (data.success) setRequests(data.data);
    } catch {
      toast.error(t("platform.k_9"));
    }
  }, [t]);

  useEffect(() => {
    void fetchActiveConnections();
    void fetchReceivedRequests();
    void fetchConsumers();
  }, [fetchActiveConnections, fetchReceivedRequests, fetchConsumers]);

  const updatePermission = async (connectionId: string, permissions: any) => {
    try {
      const resp = await fetch(
        `/api/v1/company-connections/${connectionId}/permissions`,
        {
          method: "PUT",
          headers: getAuthHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(permissions),
        }
      );
      const data = await resp.json();
      if (data.success) {
        toast.success(data.message || t("platform.k_10"));
        void fetchConsumers();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error(t("platform.k_11"));
    }
  };

  const handleRespond = async (id: string, status: "APPROVED" | "REJECTED") => {
    if (respondingIds.has(id)) return;
    setRespondingIds((prev) => new Set(prev).add(id));
    try {
      const resp = await fetch(
        `/api/v1/company-connections/requests/${id}/respond`,
        {
          method: "PUT",
          headers: getAuthHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ status }),
        }
      );
      const data = await resp.json();
      if (data.success) {
        toast.success(data.message);
        void fetchReceivedRequests();
        void fetchActiveConnections();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error(t("platform.k_12"));
    } finally {
      setRespondingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const sendRequest = async () => {
    if (!searchId.trim()) return;
    setSearching(true);
    try {
      const resp = await fetch("/api/v1/company-connections/requests", {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          receiverId: searchId.trim(),
          message: t("platform.k_13"),
        }),
      });
      const data = await resp.json();
      if (data.success) {
        toast.success(data.message);
        setSearchId("");
        setActiveTab("connections");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error(t("platform.k_14"));
    } finally {
      setSearching(false);
    }
  };

  const startPulling = async (conn: Connection) => {
    setSelectedProvider(conn);
    setFetchingProducts(true);
    setView("pull-products");
    try {
      const resp = await fetch(
        `/api/v1/company-connections/${conn.providerId}/products`,
        { headers: getAuthHeaders() }
      );
      const data = await resp.json();
      if (data.success) {
        setProviderProducts(data.data.products);
        setSelectedProductIndexes(
          new Set(data.data.products.map((_: any, i: number) => i))
        );
      } else {
        toast.error(data.message);
        setView("main");
      }
    } catch {
      toast.error(t("platform.k_15"));
      setView("main");
    } finally {
      setFetchingProducts(false);
    }
  };

  const startPullingOrders = async (conn: Connection) => {
    setSelectedProvider(conn);
    setFetchingOrders(true);
    setView("pull-orders");
    try {
      const resp = await fetch(
        `/api/v1/affiliates/import/available-orders/${conn.providerId}`,
        { headers: getAuthHeaders() }
      );
      const data = await resp.json();
      if (data.success) {
        setAvailableOrders(data.data);
        setSelectedOrderIds(new Set(data.data.map((o: any) => o.id)));
      } else {
        toast.error(data.message);
        setView("main");
      }
    } catch {
      toast.error(t("platform.k_16"));
      setView("main");
    } finally {
      setFetchingOrders(false);
    }
  };

  const deleteConnection = async (connectionId: string) => {
    if (!window.confirm(t("platform.k_17"))) return;
    try {
      const resp = await fetch(`/api/v1/company-connections/${connectionId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await resp.json();
      if (data.success) {
        toast.success(data.message || t("platform.k_18"));
        void fetchActiveConnections();
        void fetchConsumers();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error(t("platform.k_19"));
    }
  };

  const toggleProduct = (index: number) => {
    setSelectedProductIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleOrder = (orderId: string) => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const handleImport = async () => {
    if (selectedProductIndexes.size === 0 || !selectedProvider) return;
    setImporting(true);
    try {
      const productsToImport = Array.from(selectedProductIndexes).map(
        (idx) => providerProducts[idx]
      );
      const resp = await fetch(
        `/api/v1/company-connections/${selectedProvider.providerId}/import`,
        {
          method: "POST",
          headers: getAuthHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ products: productsToImport }),
        }
      );
      const data = await resp.json();
      if (data.success) {
        toast.success(data.message);
        setView("main");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error(t("platform.k_20"));
    } finally {
      setImporting(false);
    }
  };

  const handleImportOrders = async () => {
    if (selectedOrderIds.size === 0 || !selectedProvider) return;
    setImportingOrders(true);
    try {
      const ordersToImport = availableOrders.filter((o) =>
        selectedOrderIds.has(o.id)
      );
      const resp = await fetch(
        `/api/v1/affiliates/import/orders/${selectedProvider.providerId}`,
        {
          method: "POST",
          headers: getAuthHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ orders: ordersToImport }),
        }
      );
      const data = await resp.json();
      if (data.success) {
        toast.success(data.message);
        setView("main");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error(t("platform.k_21"));
    } finally {
      setImportingOrders(false);
    }
  };

  const totalProviderVariants = useMemo(() => {
    return providerProducts.reduce(
      (sum, product) => sum + (product.variants?.length || 0),
      0
    );
  }, [providerProducts]);

  const filteredProducts = useMemo(() => {
    if (!productSearchQuery) return providerProducts;
    const q = productSearchQuery.toLowerCase();
    return providerProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.sku || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q)
    );
  }, [providerProducts, productSearchQuery]);

  const handleSelectAll = () => {
    const filteredIndexes = filteredProducts.map((p) =>
      providerProducts.indexOf(p)
    );
    setSelectedProductIndexes(new Set(filteredIndexes));
  };

  const handleDeselectAll = () => {
    setSelectedProductIndexes(new Set());
  };

  const handleCopyCompanyId = () => {
    if (user?.companyId) {
      navigator.clipboard.writeText(user.companyId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return {
    t,
    user,
    view,
    setView,
    activeTab,
    setActiveTab,
    connections,
    requests,
    consumers,
    loading,
    searchId,
    setSearchId,
    searching,
    copied,
    selectedProvider,
    providerProducts,
    selectedProductIndexes,
    fetchingProducts,
    importing,
    productSearchQuery,
    setProductSearchQuery,
    respondingIds,
    availableOrders,
    selectedOrderIds,
    fetchingOrders,
    importingOrders,
    totalProviderVariants,
    filteredProducts,
    handleRespond,
    sendRequest,
    updatePermission,
    deleteConnection,
    startPulling,
    startPullingOrders,
    toggleProduct,
    toggleOrder,
    handleImport,
    handleImportOrders,
    handleSelectAll,
    handleDeselectAll,
    handleCopyCompanyId,
  };
}
