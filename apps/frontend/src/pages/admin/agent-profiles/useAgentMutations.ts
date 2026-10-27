import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { type AgentProfileResponse } from "../ai-agent-sandbox/services/sandboxApi";
import { AgentItem, tryApiFetch } from "./types";

interface UseAgentMutationsProps {
  selectedId: string | null;
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  profile: AgentProfileResponse | null;
  setProfile: React.Dispatch<React.SetStateAction<AgentProfileResponse | null>>;
  agents: AgentItem[];
  setAgents: React.Dispatch<React.SetStateAction<AgentItem[]>>;
  agentsListTab: "active" | "archived";
  setAgentsListTab: (tab: "active" | "archived") => void;
  draftName: string;
  setDraftName: (name: string) => void;
  draftIcon: string;
  setDraftIcon: (icon: string) => void;
  draftDescription: string;
  setDraftDescription: (desc: string) => void;
  draftConfig: Record<string, string>;
  setDraftConfig: (config: Record<string, string>) => void;
  draftFiles: Record<string, string>;
  setDraftFiles: (files: Record<string, string>) => void;
  setEditing: (editing: boolean) => void;
  setProfileError: (error: string | null) => void;
  actionConfirm: "archive" | "delete" | null;
  setActionConfirm: (action: "archive" | "delete" | null) => void;
  loadAgents: () => Promise<void>;
  setSearchParams: (params: Record<string, string>, opts?: { replace?: boolean }) => void;
}

export function useAgentMutations({
  selectedId,
  setSelectedId,
  profile,
  setProfile,
  agents,
  setAgents,
  agentsListTab,
  setAgentsListTab,
  draftName,
  setDraftName,
  draftIcon,
  setDraftIcon,
  draftDescription,
  setDraftDescription,
  draftConfig,
  setDraftConfig,
  draftFiles,
  setDraftFiles,
  setEditing,
  setProfileError,
  actionConfirm,
  setActionConfirm,
  loadAgents,
  setSearchParams,
}: UseAgentMutationsProps) {
  const { t } = useTranslation();
  const [statusSaving, setStatusSaving] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* ── Toggle Status ── */
  const toggleStatus = async (nextActive: boolean) => {
    if (!selectedId || !profile) return;
    setStatusSaving(true);
    const data = await tryApiFetch<{
      success: boolean;
      agent: { status: string };
    }>(`/agent/agents/${selectedId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: nextActive ? "ACTIVE" : "PAUSED" }),
    });
    if (data?.agent?.status) {
      const nextStatus = data.agent.status;
      setProfile((prev) =>
        prev
          ? { ...prev, agent: { ...prev.agent, status: nextStatus } }
          : prev,
      );
      setAgents((prev) =>
        prev.map((a) =>
          a.id === selectedId ? { ...a, status: nextStatus } : a,
        ),
      );
      if (agentsListTab === "archived" && nextActive) {
        setAgentsListTab("active");
      }
      toast.success(
        nextActive
          ? t(
              "agentProfiles.header.status.active_toggle",
              "تم تفعيل الوكيل",
            )
          : t(
              "agentProfiles.header.status.paused_toggle",
              "تم إيقاف الوكيل",
            ),
      );
    }
    setStatusSaving(false);
  };

  /* ── Save Profile ── */
  const saveProfile = async () => {
    if (!selectedId || !profile) return;
    setProfileSaving(true);
    setProfileError(null);

    const body: Record<string, unknown> = {
      name: draftName || profile.agent.name,
      description: draftDescription,
      role: profile.agent.role,
      icon: draftIcon,
      config: draftConfig,
      files: draftFiles,
    };

    const data = await tryApiFetch<
      { success: boolean } & Record<string, unknown>
    >(`/agent/agents/${selectedId}/files`, {
      method: "PUT",
      body: JSON.stringify(body),
    });

    if (data) {
      setProfile((prev) =>
        prev
          ? ({
              ...prev,
              agent: {
                ...prev.agent,
                name: draftName || prev.agent.name,
                description: draftDescription,
                icon: draftIcon,
                config: draftConfig,
              },
              files: { ...draftFiles },
            } as typeof prev)
          : prev,
      );
      setAgents((prev) =>
        prev.map((a) =>
          a.id === selectedId
            ? {
                ...a,
                name: draftName || a.name,
                icon: draftIcon,
                description: draftDescription,
              }
            : a,
        ),
      );
      setEditing(false);
      toast.success(
        t("agentProfiles.toast.saveSuccess", "تم حفظ التغييرات بنجاح"),
      );
    } else {
      setProfileError(
        t("agentProfiles.toast.saveFailed", "فشل حفظ التغييرات"),
      );
    }
    setProfileSaving(false);
  };

  /* ── Discard Changes ── */
  const discardChanges = () => {
    if (!profile) return;
    setEditing(false);
    setDraftName(profile.agent.name || "");
    setDraftIcon(profile.agent.icon || "🤖");
    setDraftDescription(profile.agent.description || "");
    setDraftFiles({ ...(profile.files || {}) });
    setDraftConfig({
      ...((profile.agent as { config?: Record<string, string> }).config || {}),
    });
  };

  /* ── Archive Agent ── */
  const handleArchiveAgent = async () => {
    if (!actionConfirm || !selectedId) return;
    setDeleting(true);
    const data = await tryApiFetch<{ success: boolean }>(
      `/agent/agents/${selectedId}?archive=true`,
      { method: "DELETE" },
    );
    if (data) {
      setActionConfirm(null);
      const remaining = agents.filter((a) => a.id !== selectedId);
      setAgents(remaining);
      if (remaining.length > 0) {
        setSelectedId(remaining[0].id);
        setSearchParams({ agent: remaining[0].id }, { replace: true });
      } else {
        setSelectedId(null);
        setProfile(null);
        setSearchParams({}, { replace: true });
      }
      toast.success(
        t("agentProfiles.toast.archiveSuccess", "تمت أرشفة الوكيل بنجاح"),
      );
      loadAgents();
    } else {
      toast.error(t("agentProfiles.toast.archiveFailed", "فشل أرشفة الوكيل"));
    }
    setDeleting(false);
  };

  /* ── Permanent Delete Agent ── */
  const handleDeleteAgent = async () => {
    if (!actionConfirm || !selectedId) return;
    setDeleting(true);
    const data = await tryApiFetch<{ success: boolean }>(
      `/agent/agents/${selectedId}?permanent=true`,
      { method: "DELETE" },
    );
    if (data) {
      setActionConfirm(null);
      const remaining = agents.filter((a) => a.id !== selectedId);
      setAgents(remaining);
      if (remaining.length > 0) {
        setSelectedId(remaining[0].id);
        setSearchParams({ agent: remaining[0].id }, { replace: true });
      } else {
        setSelectedId(null);
        setProfile(null);
        setSearchParams({}, { replace: true });
      }
      toast.success(
        t("agentProfiles.toast.deleteSuccess", "تم حذف الوكيل نهائياً"),
      );
      loadAgents();
    } else {
      toast.error(t("agentProfiles.toast.deleteFailed", "فشل حذف الوكيل"));
    }
    setDeleting(false);
  };

  return {
    statusSaving,
    profileSaving,
    deleting,
    toggleStatus,
    saveProfile,
    discardChanges,
    handleArchiveAgent,
    handleDeleteAgent,
  };
}
