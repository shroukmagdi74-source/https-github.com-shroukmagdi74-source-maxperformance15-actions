import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../../../services/apiClient";
import type {
  CustomerLoyaltyProgram,
  CustomerLoyaltyTier,
  CustomerLoyaltyRecord,
  CashbackSettings,
  CashbackDraft,
  WalletStats,
  LoyaltyTabKey,
} from "./types";

export const useCustomerLoyaltyController = () => {
  const [activeTab, setActiveTab] = useState<LoyaltyTabKey>("programs");
  const [programs, setPrograms] = useState<CustomerLoyaltyProgram[]>([]);
  const [customers, setCustomers] = useState<CustomerLoyaltyRecord[]>([]);
  const [tiers, setTiers] = useState<CustomerLoyaltyTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [cashbackSettings, setCashbackSettings] =
    useState<CashbackSettings | null>(null);
  const [cashbackDraft, setCashbackDraft] = useState<CashbackDraft | null>(null);
  const [isSavingCashback, setIsSavingCashback] = useState(false);
  const [walletStats, setWalletStats] = useState<WalletStats | null>(null);

  const fetchLoyaltyData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [programsRes, customersRes, tiersRes, cashbackRes, statsRes] =
        await Promise.all([
          apiClient.get("/hr/customer-loyalty/programs"),
          apiClient.get("/hr/customer-loyalty/customers"),
          apiClient.get("/hr/customer-loyalty/tiers"),
          apiClient.get("/hr/customer-loyalty/cashback/settings"),
          apiClient.get("/wallet/stats"),
        ]);

      setPrograms(programsRes?.data?.data || []);
      setCustomers(customersRes?.data?.data || []);
      setTiers(tiersRes?.data?.data || []);
      setWalletStats(statsRes?.data?.data || null);

      const cs: CashbackSettings | null = cashbackRes?.data?.data || null;
      setCashbackSettings(cs);
      if (cs) {
        setCashbackDraft({
          cashbackPercent: cs.rules.cashbackPercent,
          base: cs.rules.base,
          status: cs.status,
          maxPerOrder: cs.rules.maxPerOrder || 0,
          tierOverrides: cs.rules.tierOverrides || {},
        });
      } else {
        setCashbackDraft(null);
      }
    } catch (error) {
      console.error("Error fetching loyalty data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoyaltyData();
  }, [fetchLoyaltyData]);

  const saveCashbackSettings = async () => {
    if (!cashbackDraft) return;

    try {
      setIsSavingCashback(true);
      const res = await apiClient.put(
        "/hr/customer-loyalty/cashback/settings",
        {
          cashbackPercent: cashbackDraft.cashbackPercent,
          base: cashbackDraft.base,
          status: cashbackDraft.status,
          maxPerOrder: cashbackDraft.maxPerOrder,
          tierOverrides: cashbackDraft.tierOverrides,
        },
      );

      const cs: CashbackSettings | null = res?.data?.data || null;
      setCashbackSettings(cs);
      if (cs) {
        setCashbackDraft({
          cashbackPercent: cs.rules.cashbackPercent,
          base: cs.rules.base,
          status: cs.status,
          maxPerOrder: cs.rules.maxPerOrder || 0,
          tierOverrides: cs.rules.tierOverrides || {},
        });
      }
    } catch (error) {
      console.error("Error saving cashback settings:", error);
    } finally {
      setIsSavingCashback(false);
    }
  };

  const updateCashbackField = <K extends keyof CashbackDraft>(
    key: K,
    value: CashbackDraft[K],
  ) => {
    if (!cashbackDraft) return;
    setCashbackDraft({
      ...cashbackDraft,
      [key]: value,
    });
  };

  const updateTierOverride = (tierId: string, val: string) => {
    if (!cashbackDraft) return;
    const newOverrides = { ...cashbackDraft.tierOverrides };
    if (val === "") {
      delete newOverrides[tierId];
    } else {
      newOverrides[tierId] = Number(val);
    }
    setCashbackDraft({
      ...cashbackDraft,
      tierOverrides: newOverrides,
    });
  };

  const filteredCustomers = customers.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const fullName = `${c.customer.firstName} ${c.customer.lastName}`.toLowerCase();
    const email = (c.customer.email || "").toLowerCase();
    const phone = (c.customer.phone || "").toLowerCase();
    return fullName.includes(q) || email.includes(q) || phone.includes(q);
  });

  return {
    activeTab,
    setActiveTab,
    programs,
    customers: filteredCustomers,
    rawCustomersCount: customers.length,
    tiers,
    isLoading,
    searchQuery,
    setSearchQuery,
    showCreateForm,
    setShowCreateForm,
    cashbackSettings,
    cashbackDraft,
    isSavingCashback,
    walletStats,
    fetchLoyaltyData,
    saveCashbackSettings,
    updateCashbackField,
    updateTierOverride,
  };
};
