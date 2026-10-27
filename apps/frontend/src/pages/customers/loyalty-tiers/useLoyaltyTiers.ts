import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../../../services/apiClient";
import { type CustomerLoyaltyTier, type LoyaltyProgram, parseTierFromApi } from "./types";

export function useLoyaltyTiers() {
  const [tiers, setTiers] = useState<CustomerLoyaltyTier[]>([]);
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // تفعيل نظام المستويات (مستقل عن الخصم التلقائي عبر loyalty-config)
  const [tiersEnabled, setTiersEnabled] = useState<boolean>(false);
  const [tiersToggleSaving, setTiersToggleSaving] = useState(false);
  const [tiersToggleMsg, setTiersToggleMsg] = useState("");

  useEffect(() => {
    apiClient
      .get("/hr/customer-loyalty/loyalty-config")
      .then((res) => {
        setTiersEnabled(res.data?.data?.tiers?.enabled === true);
      })
      .catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [tiersRes, programsRes] = await Promise.all([
        apiClient.get("/hr/customer-loyalty/tiers"),
        apiClient.get("/hr/customer-loyalty/programs"),
      ]);
      setTiers((tiersRes.data?.data || []).map(parseTierFromApi));
      setPrograms(
        (programsRes.data?.data || []).filter(
          (p: any) => p.status === "ACTIVE" || p.type === "TIERS" || p.type === "POINTS"
        )
      );
    } catch (error) {
      console.error("Error fetching loyalty tiers and programs:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTiers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get("/hr/customer-loyalty/tiers");
      setTiers((res.data?.data || []).map(parseTierFromApi));
    } catch (error) {
      console.error("Error fetching tiers:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleTiersEnabled = async (next: boolean) => {
    if (
      !window.confirm(
        next
          ? "هل تريد تفعيل نظام المستويات؟"
          : "هل تريد إيقاف تفعيل نظام المستويات؟"
      )
    ) {
      return;
    }
    setTiersToggleSaving(true);
    setTiersToggleMsg("");
    try {
      const res = await apiClient.put("/hr/customer-loyalty/loyalty-config", {
        tiersEnabled: next,
      });
      setTiersEnabled(res.data?.data?.tiers?.enabled === true);
      setTiersToggleMsg(
        next ? "تم تفعيل نظام المستويات ✓" : "تم إيقاف تفعيل نظام المستويات ✓"
      );
    } catch (e: any) {
      setTiersToggleMsg(e?.response?.data?.error || "فشل حفظ التفعيل");
    } finally {
      setTiersToggleSaving(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("هل أنت متأكد من حذف هذا المستوى؟")) return;
    try {
      await apiClient.delete(`/hr/customer-loyalty/tiers/${id}`);
      fetchTiers();
    } catch (error: any) {
      console.error("Error deleting tier:", error);
      alert(
        error.response?.data?.error ||
          "لا يمكن حذف المستوى لوجود عملاء مرتبطين به أو حدث خطأ"
      );
    }
  };

  return {
    tiers,
    programs,
    isLoading,
    fetchTiers,
    tiersEnabled,
    tiersToggleSaving,
    tiersToggleMsg,
    toggleTiersEnabled,
    handleDelete,
  };
}
