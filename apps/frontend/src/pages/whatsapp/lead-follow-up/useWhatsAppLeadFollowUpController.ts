import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  Layers,
  MessageSquare,
  Users,
  Zap,
} from "lucide-react";

import { apiClient, type ApiRequestConfig } from "../../../services/apiClient";
import {
  apiBase,
  lfBase,
  type CategoryStatItem,
  type Flow,
  type FlowStep,
  type Journey,
  type LeadCategory,
  type LegacyEnrollment,
  type Settings,
  type StatCardItem,
  type Stats,
} from "./types";

interface UseWhatsAppLeadFollowUpControllerOptions {
  companyId?: string;
}

export const useWhatsAppLeadFollowUpController = ({
  companyId,
}: UseWhatsAppLeadFollowUpControllerOptions = {}) => {
  const { t } = useTranslation();
  const ns = "whatsappLeadFollowup";
  const tx = useCallback((k: string) => t(`${ns}.${k}`), [t, ns]);

  const wc = useCallback(
    (c: ApiRequestConfig = {}) => (companyId ? { ...c, _companyId: companyId } : c),
    [companyId]
  );

  const [flows, setFlows] = useState<Flow[]>([]);
  const [categories, setCategories] = useState<LeadCategory[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStatItem[]>([]);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [enrollments, setEnrollments] = useState<LegacyEnrollment[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [expandedFlow, setExpandedFlow] = useState<string | null>(null);
  const [editingStep, setEditingStep] = useState<{ flowId: string; step: FlowStep } | null>(null);
  const [activeTab, setActiveTab] = useState("flows");
  const [monFilter, setMonFilter] = useState({ status: "", flowId: "" });
  const [newFlowName, setNewFlowName] = useState("");
  const [newFlowScope, setNewFlowScope] = useState<"TARGETED" | "GENERAL">("TARGETED");
  const [newFlowCategoryIds, setNewFlowCategoryIds] = useState<string[]>([]);
  const [showNewFlow, setShowNewFlow] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      const r = await apiClient.get("/whatsapp/lead-categories", wc());
      setCategories((r as any).data?.data || []);
    } catch {
      // ignore
    }
  }, [wc]);

  const loadSettings = useCallback(async () => {
    try {
      const r = await apiClient.get(`${lfBase}/settings`, wc());
      setSettings((r as any).data?.data || null);
    } catch {
      // ignore
    }
  }, [wc]);

  const loadFlows = useCallback(async () => {
    try {
      const r = await apiClient.get(`${apiBase}/flows`, wc());
      setFlows((r as any).data?.data || []);
    } catch {
      // ignore
    }
  }, [wc]);

  const loadStats = useCallback(async () => {
    try {
      const r = await apiClient.get(`${lfBase}/stats`, wc());
      setStats((r as any).data?.data || null);
    } catch {
      // ignore
    }
  }, [wc]);

  const loadCategoryStats = useCallback(async () => {
    try {
      const r = await apiClient.get(`${lfBase}/category-stats`, wc());
      setCategoryStats((r as any).data?.data || []);
    } catch {
      // ignore
    }
  }, [wc]);

  const loadJourneys = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (monFilter.status) params.status = monFilter.status;
      if (monFilter.flowId) params.flowId = monFilter.flowId;
      const r = await apiClient.get(`${apiBase}/journeys`, wc({ params }));
      setJourneys((r as any).data?.data || []);
    } catch {
      // ignore
    }
  }, [wc, monFilter]);

  const loadEnrollments = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (monFilter.status) params.status = monFilter.status;
      const r = await apiClient.get(`${lfBase}/enrollments`, wc({ params }));
      setEnrollments((r as any).data?.data || []);
    } catch {
      // ignore
    }
  }, [wc, monFilter.status]);

  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      loadFlows(),
      loadStats(),
      loadCategories(),
      loadSettings(),
      loadCategoryStats(),
    ]);
    setLoading(false);
  }, [loadFlows, loadStats, loadCategories, loadSettings, loadCategoryStats]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (activeTab === "monitoring") {
      loadJourneys();
      loadEnrollments();
    }
  }, [activeTab, loadJourneys, loadEnrollments]);

  const loadSteps = useCallback(
    async (flowId: string): Promise<FlowStep[]> => {
      try {
        const r = await apiClient.get(`${apiBase}/flows/${flowId}/steps`, wc());
        return (r as any).data?.data || [];
      } catch {
        return [];
      }
    },
    [wc]
  );

  const toggleFlow = async (flow: Flow) => {
    try {
      await apiClient.put(`${apiBase}/flows/${flow.id}`, { isEnabled: !flow.isEnabled }, wc());
      setFlows((prev) =>
        prev.map((f) => (f.id === flow.id ? { ...f, isEnabled: !f.isEnabled } : f))
      );
    } catch {
      // ignore
    }
  };

  const createFlow = async () => {
    if (!newFlowName.trim()) return;
    setSaving("create");
    try {
      const r = await apiClient.post(
        `${apiBase}/flows`,
        {
          name: newFlowName.trim(),
          isGeneral: newFlowScope === "GENERAL",
        },
        wc()
      );
      setFlows((prev) => [(r as any).data.data, ...prev]);
      setNewFlowName("");
      setNewFlowScope("TARGETED");
      setNewFlowCategoryIds([]);
      setShowNewFlow(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      if (msg) alert(msg);
    } finally {
      setSaving(null);
    }
  };

  const createPresetFlow = async () => {
    try {
      await apiClient.post(`${apiBase}/flows/preset`, {}, wc());
      await loadFlows();
    } catch {
      // ignore
    }
  };

  const deleteFlow = async (id: string) => {
    try {
      await apiClient.delete(`${apiBase}/flows/${id}`, wc());
      setFlows((prev) => prev.filter((f) => f.id !== id));
      setDeleteConfirm(null);
    } catch {
      // ignore
    }
  };

  const expandFlow = async (flowId: string) => {
    if (expandedFlow === flowId) {
      setExpandedFlow(null);
      return;
    }
    const flow = flows.find((f) => f.id === flowId);
    if (flow && !flow.steps) {
      const steps = await loadSteps(flowId);
      setFlows((prev) => prev.map((f) => (f.id === flowId ? { ...f, steps } : f)));
    }
    setExpandedFlow(flowId);
  };

  const saveStep = async (flowId: string, step: FlowStep) => {
    setSaving(`step-${flowId}`);
    try {
      await apiClient.post(`${apiBase}/flows/${flowId}/steps`, step, wc());
      const steps = await loadSteps(flowId);
      setFlows((prev) => prev.map((f) => (f.id === flowId ? { ...f, steps } : f)));
      setEditingStep(null);
    } catch {
      // ignore
    } finally {
      setSaving(null);
    }
  };

  const deleteStep = async (stepId: string, flowId: string) => {
    try {
      await apiClient.delete(`${apiBase}/steps/${stepId}`, wc());
      const steps = await loadSteps(flowId);
      setFlows((prev) => prev.map((f) => (f.id === flowId ? { ...f, steps } : f)));
    } catch {
      // ignore
    }
  };

  const setFlowScope = async (flowId: string, isGeneral: boolean) => {
    try {
      await apiClient.put(`${apiBase}/flows/${flowId}`, { isGeneral }, wc());
      setFlows((prev) => prev.map((f) => (f.id === flowId ? { ...f, isGeneral } : f)));
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      if (msg) alert(msg);
    }
  };

  const toggleCategory = async (catId: string, autoFollowUp: boolean) => {
    try {
      await apiClient.put(`/whatsapp/lead-categories/${catId}`, { autoFollowUp }, wc());
      setCategories((prev) => prev.map((c) => (c.id === catId ? { ...c, autoFollowUp } : c)));
    } catch {
      // ignore
    }
  };

  const bindCategoryFlow = async (catId: string, triggerFlowId: string | null) => {
    try {
      await apiClient.put(`/whatsapp/lead-categories/${catId}`, { triggerFlowId }, wc());
      setCategories((prev) =>
        prev.map((c) => (c.id === catId ? { ...c, triggerFlowId: triggerFlowId || undefined } : c))
      );
    } catch {
      // ignore
    }
  };

  const linkCategoryToFlow = async (catId: string, isLinked: boolean, flowId: string) => {
    try {
      await apiClient.put(
        `/whatsapp/lead-categories/${catId}`,
        {
          triggerFlowId: isLinked ? null : flowId,
        },
        wc()
      );
      await loadFlows();
      await loadCategories();
    } catch {
      // ignore
    }
  };

  const cancelEnrollment = async (id: string) => {
    try {
      await apiClient.put(`${lfBase}/enrollments/${id}/cancel`, {}, wc());
      setEnrollments((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: "CANCELLED" } : e))
      );
    } catch {
      // ignore
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    setSaving("settings");
    try {
      await apiClient.put(`${lfBase}/settings`, settings, wc());
      const r = await apiClient.get(`${lfBase}/stats`, wc());
      setStats((r as any).data?.data || null);
    } catch {
      // ignore
    } finally {
      setSaving(null);
    }
  };

  const statCards: StatCardItem[] = useMemo(() => {
    if (!stats) return [];
    return [
      {
        label: tx("stats.activeEnrollments"),
        value: stats.active,
        icon: Users,
        tone: "primary",
      },
      {
        label: tx("stats.totalSent"),
        value: stats.totalSent,
        icon: MessageSquare,
        tone: "info",
      },
      {
        label: tx("stats.replyRate"),
        value: `${stats.replyRate}%`,
        hint: tx("stats.replyRateHint")
          .replace("{{replied}}", String(stats.replied))
          .replace("{{total}}", String(stats.totalSent)),
        icon: CheckCircle2,
        tone: "success",
      },
      {
        label: tx("stats.completionRate"),
        value: `${stats.completionRate}%`,
        icon: Zap,
        tone: "primary",
      },
      {
        label: tx("stats.totalEnrollments"),
        value: stats.total,
        icon: Layers,
        tone: "info",
      },
    ];
  }, [stats, tx]);

  const formatDate = useCallback((d: string) => {
    return d ? new Date(d).toLocaleString() : "-";
  }, []);

  return {
    t,
    tx,
    flows,
    categories,
    stats,
    categoryStats,
    journeys,
    enrollments,
    settings,
    setSettings,
    loading,
    saving,
    expandedFlow,
    editingStep,
    setEditingStep,
    activeTab,
    setActiveTab,
    monFilter,
    setMonFilter,
    newFlowName,
    setNewFlowName,
    newFlowScope,
    setNewFlowScope,
    newFlowCategoryIds,
    setNewFlowCategoryIds,
    showNewFlow,
    setShowNewFlow,
    deleteConfirm,
    setDeleteConfirm,
    loadData,
    toggleFlow,
    createFlow,
    createPresetFlow,
    deleteFlow,
    expandFlow,
    saveStep,
    deleteStep,
    setFlowScope,
    toggleCategory,
    bindCategoryFlow,
    linkCategoryToFlow,
    cancelEnrollment,
    saveSettings,
    statCards,
    formatDate,
  };
};

export type WhatsAppLeadFollowUpController = ReturnType<typeof useWhatsAppLeadFollowUpController>;
