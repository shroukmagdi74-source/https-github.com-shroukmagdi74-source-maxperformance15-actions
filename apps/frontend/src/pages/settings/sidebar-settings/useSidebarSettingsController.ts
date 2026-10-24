import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getSidebarConfig } from "../../../config/sidebar";
import { useAuth } from "../../../hooks/useAuthSimple";
import { useSidebarSettings } from "../../../contexts/SidebarSettingsContext";
import type {
  SidebarItem,
  SidebarItemSettings,
  SidebarManagementData,
  SidebarSection,
  SidebarSectionSettings,
} from "../../../types/layout";
import { CATEGORY_MAP } from "./constants";
import type { FlatSearchResultItem } from "./SidebarFlatSearchResults";

export function useSidebarSettingsController() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    settings,
    isLoading,
    updateSettings,
    refreshSettings,
    userLayout,
    setUserLayout,
  } = useSidebarSettings();

  const [localSections, setLocalSections] = useState<
    Record<string, SidebarSectionSettings>
  >({});
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [expandedItemRoles, setExpandedItemRoles] = useState<
    Record<string, boolean>
  >({});
  const [viewMode, setViewMode] = useState<"categories" | "flat">("categories");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const userKey = user ? `${user.id || ""}-${user.role || ""}-${JSON.stringify(user.activeApps || [])}` : "";

  const sidebarSections = useMemo(() => {
    try {
      return getSidebarConfig(t, user ?? {});
    } catch {
      return [];
    }
  }, [t, userKey]);

  const visibleSectionIds = useMemo(() => {
    return new Set(sidebarSections.filter((s) => !s.hidden).map((s) => s.id));
  }, [sidebarSections]);

  const visibleSectionIdsKey = useMemo(() => {
    return Array.from(visibleSectionIds).sort().join(",");
  }, [visibleSectionIds]);

  const settingsSectionsKey = settings?.sections ? JSON.stringify(settings.sections) : "";

  useEffect(() => {
    if (settings && settings.sections) {
      const filtered: Record<string, SidebarSectionSettings> = {};
      for (const [sectionId, section] of Object.entries(settings.sections)) {
        if (visibleSectionIds.has(sectionId)) {
          filtered[sectionId] = section;
        }
      }
      setLocalSections(filtered);
    } else if (sidebarSections.length > 0 && !settings) {
      const defaults: Record<string, SidebarSectionSettings> = {};
      for (const section of sidebarSections) {
        if (section.hidden) continue;
        const sectionItems: Record<string, SidebarItemSettings> = {};
        for (const item of section.items) {
          const itemId = item.itemId || item.to.replace(/[^a-zA-Z0-9]/g, "_");
          sectionItems[itemId] = {
            visible: !item.hidden,
            enabled: true,
            order: section.items.indexOf(item),
            requiredRoles: item.requiredRoles || [],
            requiredApps: item.requiredApps || [],
          };
        }
        defaults[section.id] = {
          visible: !section.hidden,
          order: sidebarSections.indexOf(section),
          requiredRoles: section.requiredRoles || [],
          requiredApps: section.requiredApps || [],
          items: sectionItems,
        };
      }
      setLocalSections(defaults);
    }
  }, [settingsSectionsKey, sidebarSections.length, visibleSectionIdsKey]);

  const performSave = useCallback(
    async (sectionsToSave: Record<string, SidebarSectionSettings>) => {
      setSaveStatus("saving");
      const success = await updateSettings({
        sections: sectionsToSave,
      } as Partial<SidebarManagementData>);
      setSaveStatus(success ? "saved" : "error");
      if (success) {
        setTimeout(() => setSaveStatus("idle"), 2000);
      }
    },
    [updateSettings]
  );

  const scheduleSave = useCallback(
    (nextSections: Record<string, SidebarSectionSettings>) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setSaveStatus("idle");
      saveTimerRef.current = setTimeout(() => {
        performSave(nextSections);
      }, 800);
    },
    [performSave]
  );

  const setItemVisibility = useCallback(
    (sectionId: string, itemId: string, visible: boolean) => {
      setLocalSections((prev) => {
        const section = prev[sectionId];
        if (!section?.items[itemId]) return prev;
        const next = {
          ...prev,
          [sectionId]: {
            ...section,
            items: {
              ...section.items,
              [itemId]: { ...section.items[itemId], visible },
            },
          },
        };
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave]
  );

  const setSectionVisibility = useCallback(
    (sectionId: string, visible: boolean) => {
      setLocalSections((prev) => {
        const section = prev[sectionId];
        if (!section) return prev;
        const items = { ...section.items };
        for (const key of Object.keys(items)) {
          items[key] = { ...items[key], visible };
        }
        const next = { ...prev, [sectionId]: { ...section, visible, items } };
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave]
  );

  const moveItem = useCallback(
    (sectionId: string, itemId: string, direction: "up" | "down") => {
      setLocalSections((prev) => {
        const section = prev[sectionId];
        if (!section) return prev;
        const entries = Object.entries(section.items);
        const idx = entries.findIndex(([id]) => id === itemId);
        if (idx === -1) return prev;
        if (direction === "up" && idx === 0) return prev;
        if (direction === "down" && idx === entries.length - 1) return prev;
        const swapIdx = direction === "up" ? idx - 1 : idx + 1;
        [entries[idx], entries[swapIdx]] = [entries[swapIdx], entries[idx]];
        const newItems: Record<string, SidebarItemSettings> = {};
        entries.forEach(([id, item], i) => {
          newItems[id] = { ...item, order: i };
        });
        const next = { ...prev, [sectionId]: { ...section, items: newItems } };
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave]
  );

  const moveSection = useCallback(
    (sectionId: string, direction: "up" | "down") => {
      setLocalSections((prev) => {
        const entries = Object.entries(prev);
        const idx = entries.findIndex(([id]) => id === sectionId);
        if (idx === -1) return prev;
        if (direction === "up" && idx === 0) return prev;
        if (direction === "down" && idx === entries.length - 1) return prev;
        const swapIdx = direction === "up" ? idx - 1 : idx + 1;
        [entries[idx], entries[swapIdx]] = [entries[swapIdx], entries[idx]];
        const result: Record<string, SidebarSectionSettings> = {};
        entries.forEach(([id, section], i) => {
          result[id] = { ...section, order: i };
        });
        scheduleSave(result);
        return result;
      });
    },
    [scheduleSave]
  );

  const toggleRoleForSection = useCallback(
    (sectionId: string, role: string) => {
      setLocalSections((prev) => {
        const section = prev[sectionId];
        if (!section) return prev;
        const roles = section.requiredRoles?.includes(role)
          ? section.requiredRoles.filter((r) => r !== role)
          : [...(section.requiredRoles || []), role];
        const next = { ...prev, [sectionId]: { ...section, requiredRoles: roles } };
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave]
  );

  const toggleRoleForItem = useCallback(
    (sectionId: string, itemId: string, role: string) => {
      setLocalSections((prev) => {
        const section = prev[sectionId];
        if (!section?.items[itemId]) return prev;
        const currentRoles = section.items[itemId].requiredRoles || [];
        const roles = currentRoles.includes(role)
          ? currentRoles.filter((r) => r !== role)
          : [...currentRoles, role];
        const next = {
          ...prev,
          [sectionId]: {
            ...section,
            items: {
              ...section.items,
              [itemId]: { ...section.items[itemId], requiredRoles: roles },
            },
          },
        };
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave]
  );

  const toggleExpand = useCallback((sectionId: string) => {
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  }, []);

  const toggleRoleExpand = useCallback((key: string) => {
    setExpandedItemRoles((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const categorizedSections = useMemo(() => {
    const groups: Record<
      string,
      Array<{ sectionId: string; section: SidebarSectionSettings }>
    > = {};
    const categoryOrder = [
      "main",
      "communication",
      "sales",
      "analytics",
      "customers",
      "marketing",
      "procurement",
      "inventory",
      "employees",
      "operations",
      "management",
      "finance",
      "support",
      "system",
    ];

    for (const [sectionId, section] of Object.entries(localSections)) {
      if (!visibleSectionIds.has(sectionId)) continue;
      const cat = CATEGORY_MAP[sectionId] || "system";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push({ sectionId, section });
    }

    return Object.entries(groups)
      .sort(([a], [b]) => {
        const ai = categoryOrder.indexOf(a);
        const bi = categoryOrder.indexOf(b);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      })
      .map(([category, sections]) => ({
        category,
        sections: sections.sort(
          (a, b) => (a.section.order ?? 0) - (b.section.order ?? 0)
        ),
      }));
  }, [localSections, visibleSectionIds]);

  const flatItems = useMemo<FlatSearchResultItem[] | null>(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    const results: FlatSearchResultItem[] = [];
    for (const [sectionId, section] of Object.entries(localSections)) {
      if (!visibleSectionIds.has(sectionId)) continue;
      const sectionDef = sidebarSections.find((s) => s.id === sectionId);
      const sectionTitle = sectionDef?.title || sectionId;
      for (const [itemId, item] of Object.entries(section.items)) {
        const itemDef = sectionDef?.items.find(
          (i) => (i.itemId || i.to.replace(/[^a-zA-Z0-9]/g, "_")) === itemId
        );
        const label = item.label || itemDef?.label || itemId;
        if (
          label.toLowerCase().includes(q) ||
          sectionTitle.toLowerCase().includes(q)
        ) {
          results.push({ sectionId, sectionTitle, itemId, item });
        }
      }
    }
    return results;
  }, [searchQuery, localSections, sidebarSections, visibleSectionIds]);

  const visibleCount = useMemo(() => {
    let count = 0;
    for (const [sectionId, section] of Object.entries(localSections)) {
      if (!visibleSectionIds.has(sectionId)) continue;
      if (section.visible) {
        for (const item of Object.values(section.items)) {
          if (item.visible) count++;
        }
      }
    }
    return count;
  }, [localSections, visibleSectionIds]);

  const totalCount = useMemo(() => {
    let count = 0;
    for (const [sectionId, section] of Object.entries(localSections)) {
      if (!visibleSectionIds.has(sectionId)) continue;
      count += Object.keys(section.items).length;
    }
    return count;
  }, [localSections, visibleSectionIds]);

  const handleRefresh = useCallback(() => {
    refreshSettings();
    setSaveStatus("idle");
  }, [refreshSettings]);

  return {
    t,
    isLoading,
    userLayout,
    setUserLayout,
    localSections,
    visibleSectionIds,
    sidebarSections,
    searchQuery,
    setSearchQuery,
    expandedSections,
    saveStatus,
    expandedItemRoles,
    viewMode,
    setViewMode,
    categorizedSections,
    flatItems,
    visibleCount,
    totalCount,
    setItemVisibility,
    setSectionVisibility,
    moveItem,
    moveSection,
    toggleRoleForSection,
    toggleRoleForItem,
    toggleExpand,
    toggleRoleExpand,
    handleRefresh,
  };
}
