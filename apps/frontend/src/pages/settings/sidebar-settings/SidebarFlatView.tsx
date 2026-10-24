import React from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { Switch } from "../../../components/ui/switch";
import type {
  SidebarItem,
  SidebarSection,
  SidebarSectionSettings,
} from "../../../types/layout";
import { ALL_ROLES, ROLE_COLORS, getRoleLabel } from "./constants";
import { SidebarItemRow } from "./SidebarItemRow";

export interface SidebarFlatViewProps {
  localSections: Record<string, SidebarSectionSettings>;
  visibleSectionIds: Set<string>;
  sidebarSections: SidebarSection[];
  expandedSections: Record<string, boolean>;
  expandedItemRoles: Record<string, boolean>;
  onToggleExpand: (sectionId: string) => void;
  onSetSectionVisibility: (sectionId: string, visible: boolean) => void;
  onSetItemVisibility: (sectionId: string, itemId: string, visible: boolean) => void;
  onMoveSection: (sectionId: string, direction: "up" | "down") => void;
  onMoveItem: (sectionId: string, itemId: string, direction: "up" | "down") => void;
  onToggleRoleForSection: (sectionId: string, role: string) => void;
  onToggleRoleForItem: (sectionId: string, itemId: string, role: string) => void;
  onToggleRoleExpand: (key: string) => void;
}

export function SidebarFlatView({
  localSections,
  visibleSectionIds,
  sidebarSections,
  expandedSections,
  expandedItemRoles,
  onToggleExpand,
  onSetSectionVisibility,
  onSetItemVisibility,
  onMoveSection,
  onMoveItem,
  onToggleRoleForSection,
  onToggleRoleForItem,
  onToggleRoleExpand,
}: SidebarFlatViewProps) {
  const { t } = useTranslation();
  const visibleEntries = Object.entries(localSections).filter(([sectionId]) =>
    visibleSectionIds.has(sectionId)
  );

  return (
    <div className="space-y-4">
      {visibleEntries.map(([sectionId, section], sectionIdx) => {
        const sectionDef = sidebarSections.find((s) => s.id === sectionId);
        const sectionTitle = sectionDef?.title || sectionId;
        const isExpanded = expandedSections[sectionId] ?? true;
        const roles = section.requiredRoles || [];
        const entries = Object.entries(section.items);

        return (
          <div
            key={sectionId}
            className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/60">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <button
                  type="button"
                  onClick={() => onToggleExpand(sectionId)}
                  className="flex items-center gap-2 text-right"
                >
                  <ChevronLeftIcon
                    className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                      isExpanded ? "" : "-rotate-90"
                    }`}
                  />
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {sectionTitle}
                  </span>
                  <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-mono tabular-nums text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    {entries.length}
                  </span>
                </button>
                {roles.length > 0 && (
                  <div className="hidden items-center gap-1 sm:flex">
                    {roles.map((role) => (
                      <span
                        key={role}
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
                          ROLE_COLORS[role] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {getRoleLabel(t, role)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onMoveSection(sectionId, "up")}
                  disabled={sectionIdx === 0}
                  className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-200 hover:text-gray-600 disabled:opacity-30 dark:hover:bg-gray-700"
                  title={t("sidebar.sidebarMoveUp")}
                >
                  <ArrowUpIcon className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onMoveSection(sectionId, "down")}
                  disabled={sectionIdx === visibleEntries.length - 1}
                  className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-200 hover:text-gray-600 disabled:opacity-30 dark:hover:bg-gray-700"
                  title={t("sidebar.sidebarMoveDown")}
                >
                  <ArrowDownIcon className="h-3.5 w-3.5" />
                </button>
                <div className="mx-1 h-5 w-px bg-gray-200 dark:bg-gray-700" />
                <Switch
                  checked={section.visible}
                  onCheckedChange={(checked) =>
                    onSetSectionVisibility(sectionId, checked)
                  }
                  size="sm"
                />
              </div>
            </div>

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {entries.map(([itemId, item], itemIdx) => {
                      const itemDef = sectionDef?.items.find(
                        (i: SidebarItem) =>
                          (i.itemId || i.to.replace(/[^a-zA-Z0-9]/g, "_")) === itemId
                      );
                      const itemKey = `${sectionId}-${itemId}`;
                      const isRolesExpanded = expandedItemRoles[itemKey] ?? false;

                      return (
                        <SidebarItemRow
                          key={itemId}
                          sectionId={sectionId}
                          itemId={itemId}
                          item={item}
                          itemDef={itemDef}
                          itemIdx={itemIdx}
                          totalItems={entries.length}
                          isRolesExpanded={isRolesExpanded}
                          onMoveItem={onMoveItem}
                          onSetItemVisibility={onSetItemVisibility}
                          onToggleRoleExpand={onToggleRoleExpand}
                          onToggleRoleForItem={onToggleRoleForItem}
                        />
                      );
                    })}

                    <div className="bg-gray-50/50 px-4 py-2.5 dark:bg-gray-800/30">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          <ShieldCheckIcon className="ml-1 inline h-3.5 w-3.5" />
                          {t("sidebar.sidebarSectionRoles")}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleRoleSectionExpand(sectionId, onToggleRoleExpand)}
                          className="text-xs font-medium text-indigo-500 transition hover:text-indigo-700 dark:text-indigo-400"
                        >
                          {expandedItemRoles[`section-${sectionId}`]
                            ? t("sidebar.sidebarHideRoles")
                            : t("sidebar.sidebarEditRoles")}
                        </button>
                      </div>
                      <AnimatePresence>
                        {expandedItemRoles[`section-${sectionId}`] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {ALL_ROLES.map((role) => {
                                const isSelected = roles.includes(role);
                                return (
                                  <button
                                    key={role}
                                    type="button"
                                    onClick={() => onToggleRoleForSection(sectionId, role)}
                                    className={`rounded-lg px-2 py-1 text-xs font-medium transition ${
                                      isSelected
                                        ? "bg-indigo-500 text-white shadow-xs"
                                        : "bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-indigo-300 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700"
                                    }`}
                                  >
                                    {getRoleLabel(t, role)}
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function toggleRoleSectionExpand(
  sectionId: string,
  onToggleRoleExpand: (key: string) => void
) {
  onToggleRoleExpand(`section-${sectionId}`);
}
