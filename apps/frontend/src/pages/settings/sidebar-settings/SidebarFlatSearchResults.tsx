import React from "react";
import { useTranslation } from "react-i18next";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Switch } from "../../../components/ui/switch";
import type { SidebarItem, SidebarItemSettings, SidebarSection } from "../../../types/layout";

export interface FlatSearchResultItem {
  sectionId: string;
  sectionTitle: string;
  itemId: string;
  item: SidebarItemSettings;
}

export interface SidebarFlatSearchResultsProps {
  flatItems: FlatSearchResultItem[];
  sidebarSections: SidebarSection[];
  onSetItemVisibility: (sectionId: string, itemId: string, visible: boolean) => void;
  onClearSearch: () => void;
}

export function SidebarFlatSearchResults({
  flatItems,
  sidebarSections,
  onSetItemVisibility,
  onClearSearch,
}: SidebarFlatSearchResultsProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <h3 className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
        {t("sidebar.sidebarSearchResults", { count: flatItems.length })}
      </h3>
      {flatItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-12 text-gray-400 dark:border-gray-800">
          <MagnifyingGlassIcon className="mb-3 h-10 w-10 opacity-40" />
          <p className="text-sm">{t("sidebar.sidebarNoSearchResults")}</p>
          <button
            type="button"
            onClick={onClearSearch}
            className="mt-2 text-xs font-medium text-indigo-500 transition hover:underline"
          >
            {t("sidebar.sidebarClearSearch")}
          </button>
        </div>
      ) : (
        flatItems.map(({ sectionId, sectionTitle, itemId, item }) => {
          const sectionDef = sidebarSections.find((s) => s.id === sectionId);
          const itemDef = sectionDef?.items.find(
            (i: SidebarItem) =>
              (i.itemId || i.to.replace(/[^a-zA-Z0-9]/g, "_")) === itemId
          );

          return (
            <div
              key={`${sectionId}-${itemId}`}
              className="flex items-center justify-between rounded-xl border border-gray-200/80 bg-white p-3 shadow-xs dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="ml-3 min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                  {item.label || itemDef?.label || itemId}
                </p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {sectionTitle}
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
        })
      )}
    </div>
  );
}
