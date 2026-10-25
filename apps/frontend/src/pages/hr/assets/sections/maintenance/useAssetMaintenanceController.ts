import { useEffect, useState } from "react";
import { format } from "date-fns";
import { companyAwareApi } from "../../../../../services/companyAwareApi";
import { useCurrency } from "../../../../../hooks/useCurrency";
import { tToast } from "../../../../../utils/i18n-toast";
import {
  MaintenanceAlertsData,
  MaintenanceRecord,
  NewMaintenanceRecordFormState,
} from "./types";

export const useAssetMaintenanceController = () => {
  const [alerts, setAlerts] = useState<MaintenanceAlertsData>({
    expiringWarranties: [],
    upcomingMaintenance: [],
  });
  const [history, setHistory] = useState<MaintenanceRecord[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const { formatPrice } = useCurrency();

  const [newRecord, setNewRecord] = useState<NewMaintenanceRecordFormState>({
    assetId: "",
    type: "صيانة دورية",
    description: "",
    cost: "",
    status: "COMPLETED",
    startDate: format(new Date(), "yyyy-MM-dd"),
    performedBy: "",
    notes: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const assetsRes = await companyAwareApi.get("/hr/assets");
      if (assetsRes.data.success) {
        setAssets(assetsRes.data.data || []);
      }

      try {
        const alertsRes = await companyAwareApi.get("/hr/assets/alerts");
        if (alertsRes.data.success) setAlerts(alertsRes.data.data);
      } catch (e) {
        console.error("Error fetching alerts:", e);
      }

      try {
        const historyRes = await companyAwareApi.get("/hr/assets/maintenance");
        if (historyRes.data.success) setHistory(historyRes.data.data || []);
      } catch (e) {
        console.error("Error fetching maintenance history:", e);
      }
    } catch (error) {
      console.error("Error in main maintenance fetch:", error);
      tToast.error("AssetMaintenanceSection.error_error_85aa");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const handleAddMaintenance = async () => {
    if (!newRecord.assetId || !newRecord.description) {
      tToast.error("AssetMaintenanceSection.msg_b270");
      return;
    }

    try {
      const response = await companyAwareApi.post(
        `/hr/assets/${newRecord.assetId}/maintenance`,
        newRecord,
      );
      if (response.data.success) {
        tToast.success("AssetMaintenanceSection.success_login_record_39c0");
        setShowAddModal(false);
        void fetchData();
      }
    } catch {
      tToast.error("AssetMaintenanceSection.failed_save_efc0");
    }
  };

  return {
    alerts,
    history,
    assets,
    loading,
    showAddModal,
    setShowAddModal,
    formatPrice,
    newRecord,
    setNewRecord,
    fetchData,
    handleAddMaintenance,
  };
};
