import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { sandboxApi, type AgentProfileResponse } from "../ai-agent-sandbox/services/sandboxApi";
import { AgentItem, AgentTemplateItem, tryApiFetch } from "./types";

interface UseAgentProfileLoadersProps {
  initialAgentId: string | null;
  agentsListTab: "active" | "archived";
  setAgentsListTab: (tab: "active" | "archived") => void;
  selectedId: string | null;
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  createOpen: boolean;
  setProfile: React.Dispatch<React.SetStateAction<AgentProfileResponse | null>>;
  setEditing: (editing: boolean) => void;
  setDraftName: (name: string) => void;
  setDraftIcon: (icon: string) => void;
  setDraftDescription: (desc: string) => void;
  setDraftFiles: (files: Record<string, string>) => void;
  setDraftConfig: (config: Record<string, string>) => void;
}

export function useAgentProfileLoaders({
  initialAgentId,
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
}: UseAgentProfileLoadersProps) {
  const { t } = useTranslation();
  const initialAgentIdRef = useRef<string | null>(initialAgentId);
  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<AgentTemplateItem[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);

  const loadAgents = useCallback(async () => {
    setAgentsLoading(true);
    setProfileError(null);
    const initialTargetId = initialAgentIdRef.current;
    initialAgentIdRef.current = null;

    try {
      if (agentsListTab === "archived") {
        const res = await tryApiFetch<{ success: boolean; agents: AgentItem[] }>(
          "/agent/agents?status=ARCHIVED",
        );
        const list = res?.agents || [];
        setAgents(list);
        if (list.length > 0) {
          setSelectedId((prev) =>
            list.some((a) => a.id === prev) ? prev : list[0].id,
          );
        } else {
          setSelectedId(null);
          setProfile(null);
        }
      } else {
        let list: AgentItem[] = [];
        try {
          const res = await sandboxApi.getAgents(initialTargetId || undefined);
          list = (res.agents || []) as AgentItem[];
        } catch (apiErr) {
          console.warn(
            "[AgentProfiles] sandboxApi.getAgents failed, falling back to /agent/agents:",
            apiErr,
          );
          const fallbackRes = await tryApiFetch<{
            success: boolean;
            agents: AgentItem[];
          }>("/agent/agents");
          list = fallbackRes?.agents || [];
        }

        if (list.length === 0) {
          const fallbackRes = await tryApiFetch<{
            success: boolean;
            agents: AgentItem[];
          }>("/agent/agents");
          if (fallbackRes?.agents && fallbackRes.agents.length > 0) {
            list = fallbackRes.agents;
          }
        }

        if (initialTargetId && !list.some((a) => a.id === initialTargetId)) {
          const archRes = await tryApiFetch<{
            success: boolean;
            agents: AgentItem[];
          }>("/agent/agents?status=ARCHIVED");
          const archList = archRes?.agents || [];
          if (archList.some((a) => a.id === initialTargetId)) {
            setAgents(archList);
            setSelectedId(initialTargetId);
            setAgentsListTab("archived");
            return;
          }
        }

        setAgents(list);
        if (initialTargetId && list.some((a) => a.id === initialTargetId)) {
          setSelectedId(initialTargetId);
        } else if (list.length > 0) {
          setSelectedId((prev) =>
            list.some((a) => a.id === prev) ? prev : list[0].id,
          );
        } else {
          setSelectedId(null);
          setProfile(null);
        }
      }
    } catch {
      setProfileError(
        t("agentProfiles.sidebar.loadError", "فشل تحميل الوكلاء"),
      );
    } finally {
      setAgentsLoading(false);
    }
  }, [agentsListTab, t, setSelectedId, setProfile, setAgentsListTab]);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  /* ── Load templates for Create Agent ── */
  useEffect(() => {
    if (!createOpen) return;
    setTemplatesLoading(true);
    tryApiFetch<{
      profiles: AgentTemplateItem[];
    }>("/agent-manager/profiles")
      .then((data) => {
        setTemplates(data?.profiles || []);
      })
      .catch(() => setTemplates([]))
      .finally(() => setTemplatesLoading(false));
  }, [createOpen]);

  /* ── Load selected agent profile ── */
  const loadProfileData = useCallback(
    async (id: string) => {
      setProfileLoading(true);
      setProfileError(null);
      setProfile(null);
      setEditing(false);

      try {
        const data = await sandboxApi.getAgentProfile(id);
        setProfile(data);
        setDraftName(data.agent.name || "");
        setDraftIcon(data.agent.icon || "🤖");
        setDraftDescription(data.agent.description || "");
        setDraftFiles({ ...(data.files || {}) });
        setDraftConfig({
          ...((data.agent as { config?: Record<string, string> }).config || {}),
        });
      } catch (err: unknown) {
        try {
          const fallback = await tryApiFetch<{
            success: boolean;
            agent?: {
              id: string;
              name?: string;
              role?: string;
              icon?: string;
              description?: string;
              model?: string | null;
              status?: string;
              templateSlug?: string | null;
              config?: Record<string, string>;
            };
            files?: Record<string, string>;
            allowedTools?: string[];
            skills?: AgentProfileResponse["skills"];
            skillIds?: string[];
          }>(`/agent/agents/${id}/files`);
          if (fallback?.agent) {
            const fullAgent: AgentProfileResponse = {
              success: true,
              agent: {
                id: fallback.agent.id || id,
                name: fallback.agent.name || "",
                role: fallback.agent.role || "",
                icon: fallback.agent.icon || "🤖",
                description: fallback.agent.description || "",
                model: fallback.agent.model || null,
                status: fallback.agent.status || "ACTIVE",
                templateSlug: fallback.agent.templateSlug || null,
                config: fallback.agent.config || {},
              },
              files: {
                "SOUL.md": fallback.files?.["SOUL.md"] || "",
                "AGENTS.md": fallback.files?.["AGENTS.md"] || "",
                "TOOLS.md": fallback.files?.["TOOLS.md"] || "",
                "PERSONA.md": fallback.files?.["PERSONA.md"] || "",
              },
              allowedTools: fallback.allowedTools || [],
              skills: fallback.skills || [],
              skillIds: fallback.skillIds || [],
              modelPolicy: null,
            };
            setProfile(fullAgent);
            setDraftName(fullAgent.agent.name || "");
            setDraftIcon(fullAgent.agent.icon || "🤖");
            setDraftDescription(fullAgent.agent.description || "");
            setDraftFiles({ ...(fullAgent.files || {}) });
            setDraftConfig({ ...(fullAgent.agent.config || {}) });
            return;
          }
        } catch {
          // ignore fallback error
        }
        const errorMsg =
          err instanceof Error ? err.message : "Failed to load profile";
        setProfileError(errorMsg);
      } finally {
        setProfileLoading(false);
      }
    },
    [
      setProfile,
      setEditing,
      setDraftName,
      setDraftIcon,
      setDraftDescription,
      setDraftFiles,
      setDraftConfig,
    ],
  );

  useEffect(() => {
    if (!selectedId) return;
    loadProfileData(selectedId);
  }, [selectedId, loadProfileData]);

  return {
    agents,
    setAgents,
    agentsLoading,
    profileLoading,
    profileError,
    setProfileError,
    templates,
    templatesLoading,
    loadAgents,
    loadProfileData,
  };
}
