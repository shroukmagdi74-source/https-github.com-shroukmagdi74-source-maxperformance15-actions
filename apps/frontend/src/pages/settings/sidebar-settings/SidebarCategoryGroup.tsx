import React from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeftIcon, Squares2X2Icon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { Switch } from "../../../components/ui/switch";
import type {
  SidebarItem,
  SidebarSection,
  SidebarSectionSettings,
} from "../../../types/layout";
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
} from "./constants";

export interface SidebarCategoryGroupProps {
  category: string;
  sections: Array<{ sectionId: string; section: SidebarSectionSettings }>;
  sidebarSections: SidebarSection[];
  expandedSections: Record<string, boolean>;
  onToggleExpand: (id: string) => void;
  onSetSectionVisibility: (id: string, visible: boolean) => void;
  onSetItemVisibility: (sectionId: string, itemId: string, visible: boolean) => void;
}

export const SidebarCategoryGroup = React.memo<SidebarCategoryGroupProps>(
  function SidebarCategoryGroup({
    category,
    sections,
    sidebarSections,
    expandedSections,
    onToggleExpand,
    onSetSectionVisibility,
    onSetItemVisibility,
  }) {
    const { t } = useTranslation();
    const CatIcon = CATEGORY_ICONS[category] || Squares2X2Icon;
    const categoryColor =
      CATEGORY_COLORS[category] ||
      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 ring-gray-200 dark:ring-gray-700";
    const allSectionsVisible = sections.every(({ section }) => section.visible);

    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-l from-gray-50/70 to-white px-4 py-3 dark:border-gray-800 dark:from-gray-800/60 dark:to-gray-900">
          <div className="flex items-center gap-2">
            <span className={`rounded-xl p-1.5 ring-1 ${categoryColor}`}>
              <CatIcon className="h-4 w-4" />
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {t(
                `sidebar.category${category.charAt(0).toUpperCase()}${category.slice(1)}`
              )}
            </span>
            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-mono tabular-nums text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              {t("sidebar.sidebarSectionsCount", { count: sections.length })}
            </span>
          </div>
          <Switch
            checked={allSectionsVisible}
            onCheckedChange={(checked) => {
              sections.forEach(({ sectionId }) =>
                onSetSectionVisibility(sectionId, checked)
              );
            }}
            size="sm"
          />
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {sections.map(({ sectionId, section }) => {
            const sectionDef = sidebarSections.find(
              (s: SidebarSection) => s.id === sectionId
            );
            const sectionTitle = sectionDef?.title || sectionId;
            const isExpanded = expandedSections[sectionId] ?? true;
            const entries = Object.entries(section.items);

            return (
              <div key={sectionId}>
                <button
                  type="button"
                  onClick={() => onToggleExpand(sectionId)}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-right transition hover:bg-gray-50/60 dark:hover:bg-gray-800/40"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <ChevronLeftIcon
                      className={`h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform duration-200 ${
                        isExpanded ? "" : "-rotate-90"
                      }`}
                    />
                    <span className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                      {sectionTitle}
                    </span>
                    <span className="shrink-0 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-mono tabular-nums text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                      {entries.length}
                    </span>
                  </div>
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Switch
                      checked={section.visible}
                      onCheckedChange={(checked) =>
                        onSetSectionVisibility(sectionId, checked)
                      }
                      size="sm"
                    />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-gray-100 dark:border-gray-800">
                        {entries.map(([itemId, item]) => {
                          const itemDef = sectionDef?.items.find(
                            (i: SidebarItem) =>
                              (i.itemId || i.to.replace(/[^a-zA-Z0-9]/g, "_")) === itemId
                          );
                          return (
                            <div
                              key={itemId}
                              className="flex items-center justify-between px-6 py-2 transition hover:bg-gray-50/50 dark:hover:bg-gray-800/20"
                            >
                              <div className="ml-2 min-w-0 flex-1">
                                <p
                                  className={`truncate text-xs font-medium ${
                                    item.visible
                                      ? "text-gray-700 dark:text-gray-300"
                                      : "text-gray-400 line-through dark:text-gray-500"
                                  }`}
                                >
                                  {item.label || itemDef?.label || itemId}
                                </p>
                              </div>
                              <Switch
                                checked={item.visible}
                                onCheckedChange={(checked) =>
                                  onSetItemVisibility(sectionId, itemId, checked)
                                }
                                size="sm"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
