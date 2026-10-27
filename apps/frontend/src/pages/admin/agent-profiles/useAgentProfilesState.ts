import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { type AgentProfileResponse } from "../ai-agent-sandbox/services/sandboxApi";
import { AgentItem, AgentProfilesTab, FILES_EQUAL } from "./types";
import { useAgentProfileLoaders } from "./useAgentProfileLoaders";
import { useAgentMutations } from "./useAgentMutations";

export function useIsMobile(breakpoint = 1024) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < breakpoint,
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsMobile(e.matches);
    handler(mq);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}

export function useAgentProfilesState() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const agentIdFromUrl = searchParams.get("agent");
  const isMobile = useIsMobile(1024);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const companyId = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}").companyId || "";
    } catch {
      return "";
    }
  }, []);

  const [selectedId, setSelectedId] = useState<string | null>(agentIdFromUrl);
  const [searchQuery, setSearchQuery] = useState("");
  const [agentsListTab, setAgentsListTab] = useState<"active" | "archived">(
    "active",
  );

  const [tab, setTab] = useState<AgentProfilesTab>("settings");
  const [profile, setProfile] = useState<AgentProfileResponse | null>(null);

  const [actionConfirm, setActionConfirm] = useState<"archive" | "delete" | null>(
    null,
  );
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftIcon, setDraftIcon] = useState("🤖");
  const [draftDescription, setDraftDescription] = useState("");
  const [draftFiles, setDraftFiles] = useState<Record<string, string>>({});
  const [draftConfig, setDraftConfig] = useState<Record<string, string>>({});
  const [createOpen, setCreateOpen] = useState(false);

  const loaders = useAgentProfileLoaders({
    initialAgentId: agentIdFromUrl,
    agentsListTab,
    setAgentsListTab,
    selectedId,
    setSelectedId,
    createOpen,
    setProfile,
    setEditing,
    setDraftName,
    setDraftIcon,
    setDraftDescription,
    setDraftFiles,
    setDraftConfig,
  });

  const mutations = useAgentMutations({
    selectedId,
    setSelectedId,
    profile,
    setProfile,
    agents: loaders.agents,
    setAgents: loaders.setAgents,
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
    setProfileError: loaders.setProfileError,
    actionConfirm,
    setActionConfirm,
    loadAgents: loaders.loadAgents,
    setSearchParams,
  });

  /* ── Unsaved changes calculation ── */
  const hasUnsavedChanges = useMemo(() => {
    if (!profile) return false;
    return (
      draftName !== (profile.agent.name || "") ||
      draftIcon !== (profile.agent.icon || "🤖") ||
      draftDescription !== (profile.agent.description || "") ||
      JSON.stringify(draftConfig) !==
        JSON.stringify(
          (profile.agent as { config?: Record<string, string> }).config || {},
        ) ||
      !FILES_EQUAL(draftFiles, profile.files)
    );
  }, [profile, draftName, draftIcon, draftDescription, draftConfig, draftFiles]);

  const orderedAgents = useMemo(() => {
    const ceo = loaders.agents.find((a) => a.role === "CEO");
    if (!ceo) return loaders.agents;
    return [ceo, ...loaders.agents.filter((a) => a.id !== ceo.id)];
  }, [loaders.agents]);

  useEffect(() => {
    if (!selectedId) {
      setProfile(null);
      if (searchParams.has("agent")) {
        const next = new URLSearchParams(searchParams);
        next.delete("agent");
        setSearchParams(next, { replace: true });
      }
      return;
    }
    if (searchParams.get("agent") !== selectedId) {
      const next = new URLSearchParams(searchParams);
      next.set("agent", selectedId);
      setSearchParams(next, { replace: true });
    }
  }, [selectedId, searchParams, setSearchParams]);

  /* ── beforeunload warning ── */
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);

  const selectedAgent = useMemo(() => {
    const found = loaders.agents.find((a) => a.id === selectedId);
    if (found) return found;
    if (profile?.agent && profile.agent.id === selectedId) {
      return {
        id: profile.agent.id,
        name: profile.agent.name || "",
        role: profile.agent.role || "",
        icon: profile.agent.icon,
        status: profile.agent.status,
        allowedChannels: profile.agent.allowedChannels,
        templateSlug: profile.agent.templateSlug,
        description: profile.agent.description,
      } as AgentItem;
    }
    return undefined;
  }, [loaders.agents, selectedId, profile]);

  /* ── Dynamic Page Title ── */
  useEffect(() => {
    if (selectedAgent?.name) {
      document.title = `${selectedAgent.name} — ${t("agentProfiles.sidebar.title", "فريق الايجنت")}`;
    }
  }, [selectedAgent?.name, t]);

  /* ── Channels computation ── */
  const channels = useMemo(() => {
    if (
      selectedAgent?.allowedChannels &&
      selectedAgent.allowedChannels.length > 0
    ) {
      return selectedAgent.allowedChannels;
    }
    const text = [
      profile?.agent.role,
      profile?.agent.templateSlug,
      profile?.agent.description,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const chs: string[] = [];
    if (text.includes("facebook") || text.includes("messenger"))
      chs.push("facebook");
    if (text.includes("whatsapp")) chs.push("whatsapp");
    return chs.length > 0 ? chs : ["whatsapp"];
  }, [selectedAgent, profile]);

  const filteredAgents = useMemo(() => {
    return orderedAgents.filter((a) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        (a.role && a.role.toLowerCase().includes(q))
      );
    });
  }, [orderedAgents, searchQuery]);

  return {
    t,
    isMobile,
    mobileDrawerOpen,
    setMobileDrawerOpen,
    companyId,
    agents: loaders.agents,
    agentsLoading: loaders.agentsLoading,
    selectedId,
    setSelectedId,
    searchQuery,
    setSearchQuery,
    agentsListTab,
    setAgentsListTab,
    tab,
    setTab,
    profile,
    setProfile,
    profileLoading: loaders.profileLoading,
    profileError: loaders.profileError,
    setProfileError: loaders.setProfileError,
    statusSaving: mutations.statusSaving,
    actionConfirm,
    setActionConfirm,
    deleting: mutations.deleting,
    editing,
    setEditing,
    draftName,
    setDraftName,
    draftIcon,
    setDraftIcon,
    draftDescription,
    setDraftDescription,
    draftFiles,
    setDraftFiles,
    draftConfig,
    setDraftConfig,
    profileSaving: mutations.profileSaving,
    createOpen,
    setCreateOpen,
    templates: loaders.templates,
    templatesLoading: loaders.templatesLoading,
    hasUnsavedChanges,
    selectedAgent,
    channels,
    filteredAgents,
    loadAgents: loaders.loadAgents,
    loadProfileData: loaders.loadProfileData,
    toggleStatus: mutations.toggleStatus,
    saveProfile: mutations.saveProfile,
    discardChanges: mutations.discardChanges,
    handleArchiveAgent: mutations.handleArchiveAgent,
    handleDeleteAgent: mutations.handleDeleteAgent,
    setSearchParams,
  };
}
