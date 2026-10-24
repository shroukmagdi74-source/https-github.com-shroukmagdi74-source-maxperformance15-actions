import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../../../services/apiClient";
import { useAuth } from "../../../hooks/useAuthSimple";
import { tToast } from "../../../utils/i18n-toast";
import {
  DEFAULT_SETTINGS,
  FALLBACK_HANDOFF_STATUSES,
  FALLBACK_PREPARATION_STATUSES,
  buildSettingsState,
  normalizeStatuses,
  type PreparationQcChecks,
  type PreparationSettingsState,
  type PreparationSlipDocumentSettings,
  type StatusOption,
  type WarehouseOption,
} from "./types";

export function useOrderPreparationSettingsController() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<PreparationSettingsState>(DEFAULT_SETTINGS);
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [preparationStatuses, setPreparationStatuses] = useState<StatusOption[]>(FALLBACK_PREPARATION_STATUSES);
  const [handoffStatuses, setHandoffStatuses] = useState<StatusOption[]>(FALLBACK_HANDOFF_STATUSES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("pipeline");

  const companyId = user?.companyId || "";

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      if (!companyId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [companyRes, warehousesRes, preparationStatusesRes, shippingRes] = await Promise.all([
          apiClient.get("/companies/current"),
          apiClient.get("/warehouses"),
          apiClient.get("/order-status?statusType=preparation"),
          apiClient.get("/order-status?statusType=shipping"),
        ]);

        if (!active) return;

        const companySettings = companyRes.data?.data?.settings || {};
        setSettings(buildSettingsState(companySettings?.orderPreparation || undefined));

        const warehousesPayload: Array<{ id?: string | number; name?: string | null }> =
          Array.isArray(warehousesRes.data?.data) ? warehousesRes.data.data : [];
        setWarehouses(warehousesPayload.map((w) => ({ id: String(w.id), name: w.name || "مخزن غير مسمى" })));

        const nextPrep = normalizeStatuses(preparationStatusesRes.data?.data);
        if (nextPrep.length > 0) setPreparationStatuses(nextPrep);

        const nextShip = normalizeStatuses(shippingRes.data?.data);
        const ready = nextShip.filter((s) => s.code === "READY_TO_SHIP");
        if (ready.length > 0) setHandoffStatuses(ready);
      } catch {
        tToast.error("OrderPreparationSettings.unable_load_d994");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadData();
    return () => {
      active = false;
    };
  }, [companyId]);

  const defaultWarehouseName = useMemo(
    () => warehouses.find((w) => w.id === settings.defaultWarehouseId)?.name || "بدون مخزن افتراضي",
    [settings.defaultWarehouseId, warehouses],
  );

  const updateSetting = <K extends keyof PreparationSettingsState>(
    key: K,
    value: PreparationSettingsState[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateQcCheck = (key: keyof PreparationQcChecks, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      qcChecks: { ...prev.qcChecks, [key]: value },
    }));
  };

  const updateSlip = <K extends keyof PreparationSlipDocumentSettings>(
    key: K,
    value: PreparationSlipDocumentSettings[K],
  ) => {
    setSettings((prev) => ({
      ...prev,
      slipDocument: { ...prev.slipDocument, [key]: value },
    }));
  };

  const handleSave = async () => {
    if (!companyId) {
      tToast.error("OrderPreparationSettings.msg_775a");
      return;
    }
    try {
      setSaving(true);
      await apiClient.put(`/companies/${companyId}`, {
        settings: { orderPreparation: settings },
      });
      tToast.success("OrderPreparationSettings.success_save_1e4d");
    } catch {
      tToast.error("OrderPreparationSettings.failed_save_8951");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(buildSettingsState(DEFAULT_SETTINGS));
    tToast.success("OrderPreparationSettings.msg_a1d9");
  };

  return {
    settings,
    warehouses,
    preparationStatuses,
    handoffStatuses,
    loading,
    saving,
    activeTab,
    setActiveTab,
    defaultWarehouseName,
    updateSetting,
    updateQcCheck,
    updateSlip,
    handleSave,
    handleReset,
  };
}
