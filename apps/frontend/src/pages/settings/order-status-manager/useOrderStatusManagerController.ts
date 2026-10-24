import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import i18n from "../../../i18n";
import { tToast } from "../../../utils/i18n-toast";
import tokenManager from "../../../utils/tokenManager";
import type { OrderStatus, OrderStatusType, NewStatusInput } from "./types";

const getAuthHeaders = (additionalHeaders: Record<string, string> = {}) =>
  tokenManager.createAuthHeaders(additionalHeaders);

export function useOrderStatusManagerController() {
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<OrderStatusType>("order");
  const [editingStatus, setEditingStatus] = useState<OrderStatus | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const initialNewStatus: NewStatusInput = {
    code: "",
    name: "",
    nameEn: "",
    description: "",
    color: "#6B7280",
    icon: "Tag",
    statusType: "order",
    mapsToSystem: "",
    wooCommerceStatus: "",
    notifyCustomer: false,
    notifyAdmin: false,
    allowStatusEdit: true,
  };

  const [newStatus, setNewStatus] = useState<NewStatusInput>(initialNewStatus);

  const fetchStatuses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/v1/order-status", {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        setStatuses(data.data || []);
      } else {
        toast.error(data.message || i18n.t("orderStatusManager.error_fetch_fe2a"));
      }
    } catch (error) {
      tToast.error("orderStatusManager.error_fetch_fe2a");
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaults = async () => {
    try {
      setSyncing(true);
      const response = await fetch("/api/v1/order-status/initialize", {
        method: "POST",
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message || i18n.t("orderStatusManager.msg_8149"));
        fetchStatuses();
      } else {
        toast.error(data.message || i18n.t("orderStatusManager.msg_e0af"));
      }
    } catch (error) {
      tToast.error("orderStatusManager.msg_d864");
    } finally {
      setSyncing(false);
    }
  };

  const createStatus = async () => {
    if (!newStatus.code || !newStatus.name) {
      tToast.error("orderStatusManager.msg_e1a9");
      return;
    }

    try {
      const response = await fetch("/api/v1/order-status", {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(newStatus),
      });
      const data = await response.json();
      if (data.success) {
        tToast.success("orderStatusManager.success_create_67d7");
        setShowAddModal(false);
        setNewStatus({
          ...initialNewStatus,
          statusType: activeTab,
        });
        fetchStatuses();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      tToast.error("orderStatusManager.error_create_9567");
    }
  };

  const updateStatus = async (status: OrderStatus) => {
    try {
      const response = await fetch(`/api/v1/order-status/${status.id}`, {
        method: "PUT",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(status),
      });
      const data = await response.json();
      if (data.success) {
        tToast.success("orderStatusManager.success_update_dfad");
        setEditingStatus(null);
        fetchStatuses();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      tToast.error("orderStatusManager.error_update_f3e8");
    }
  };

  const deleteStatus = (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmDeleteStatus = async () => {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    try {
      const response = await fetch(`/api/v1/order-status/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        tToast.success("orderStatusManager.success_delete_f86e");
        fetchStatuses();
      } else {
        toast.error(data.message || i18n.t("orderStatusManager.msg_8f8d"));
      }
    } catch (error) {
      tToast.error("orderStatusManager.error_delete_e809");
    }
  };

  const handleToggleAllowEdit = async (status: OrderStatus) => {
    await updateStatus({ ...status, allowStatusEdit: !status.allowStatusEdit });
  };

  const moveStatus = async (index: number, direction: "up" | "down") => {
    const items = [...filteredStatuses];
    const newIndex = direction === "up" ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= items.length) return;

    const current = items[index];
    const target = items[newIndex];
    if (!current || !target) return;

    items[index] = target;
    items[newIndex] = current;

    const newStatuses = statuses.map((s) => {
      const newIdx = items.findIndex((i) => i.id === s.id);
      if (newIdx !== -1) {
        return { ...s, sortOrder: newIdx + 1 };
      }
      return s;
    });
    setStatuses(newStatuses);

    try {
      await fetch("/api/v1/order-status/reorder", {
        method: "PUT",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ statusIds: items.map((i) => i.id) }),
      });
    } catch (error) {
      tToast.error("orderStatusManager.error_save_9d9b");
      fetchStatuses();
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  const filteredStatuses = useMemo(() => {
    return statuses
      .filter((s) => {
        if (!s.isActive) return false;
        if (s.statusType === activeTab) return true;
        if (String(s.statusType) === "" && activeTab === "order") return true;
        if (s.statusType === "preparation" && activeTab === "preparation") return true;
        return false;
      })
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [statuses, activeTab]);

  const tabCounts = useMemo(() => {
    const counts: Partial<Record<OrderStatusType, number>> = {
      order: 0,
      payment: 0,
      shipping: 0,
      preparation: 0,
    };
    statuses.forEach((s) => {
      if (!s.isActive) return;
      const type = (s.statusType || "order") as OrderStatusType;
      if (counts[type] !== undefined) {
        counts[type] = (counts[type] || 0) + 1;
      }
    });
    return counts;
  }, [statuses]);

  return {
    statuses,
    loading,
    syncing,
    activeTab,
    setActiveTab,
    editingStatus,
    setEditingStatus,
    showAddModal,
    setShowAddModal,
    confirmDeleteId,
    setConfirmDeleteId,
    newStatus,
    setNewStatus,
    filteredStatuses,
    tabCounts,
    fetchStatuses,
    initializeDefaults,
    createStatus,
    updateStatus,
    deleteStatus,
    confirmDeleteStatus,
    moveStatus,
    handleToggleAllowEdit,
  };
}