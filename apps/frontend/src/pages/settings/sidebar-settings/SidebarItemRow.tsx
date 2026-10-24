import React from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  Bars3Icon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { Switch } from "../../../components/ui/switch";
import type { SidebarItem, SidebarItemSettings } from "../../../types/layout";
import { ALL_ROLES, ROLE_COLORS, getRoleLabel } from "./constants";

export interface SidebarItemRowProps {
  sectionId: string;
  itemId: string;
  item: SidebarItemSettings;
  itemDef?: SidebarItem;
  itemIdx: number;
  totalItems: number;
  isRolesExpanded: boolean;
  onMoveItem: (sectionId: string, itemId: string, direction: "up" | "down") => void;
  onSetItemVisibility: (sectionId: string, itemId: string, visible: boolean) => void;
  onToggleRoleExpand: (key: string) => void;
  onToggleRoleForItem: (sectionId: string, itemId: string, role: string) => void;
}

export function SidebarItemRow({
  sectionId,
  itemId,
  item,
  itemDef,
  itemIdx,
  totalItems,
  isRolesExpanded,
  onMoveItem,
  onSetItemVisibility,
  onToggleRoleExpand,
  onToggleRoleForItem,
}: SidebarItemRowProps) {
  const { t } = useTranslation();
  const itemRoles = item.requiredRoles || [];
  const itemKey = `${sectionId}-${itemId}`;

  return (
    <div className="group px-4 py-2.5 transition hover:bg-gray-50/70 dark:hover:bg-gray-800/40">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <Bars3Icon className="h-4 w-4 shrink-0 text-gray-300 transition group-hover:text-gray-500 dark:text-gray-600" />
          <div className="min-w-0 flex-1">
            <p
              className={`truncate text-sm font-medium ${
                item.visible
                  ? "text-gray-900 dark:text-gray-100"
                  : "text-gray-400 line-through dark:text-gray-500"
              }`}
            >
              {item.label || itemDef?.label || itemId}
            </p>
            <p className="truncate text-xs text-gray-400 dark:text-gray-500 font-mono">
              {itemDef?.to || itemId}
            </p>
          </div>
          {itemRoles.length > 0 && (
            <div className="hidden items-center gap-1 lg:flex">
              {itemRoles.slice(0, 2).map((role) => (
                <span
                  key={role}
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
                    ROLE_COLORS[role] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {getRoleLabel(t, role)}
                </span>
              ))}
              {itemRoles.length > 2 && (
                <span className="text-[10px] font-mono tabular-nums text-gray-400">
                  +{itemRoles.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMoveItem(sectionId, itemId, "up")}
            disabled={itemIdx === 0}
            className="rounded-lg p-1 text-gray-400 opacity-0 transition hover:bg-gray-200 hover:text-gray-600 group-hover:opacity-100 disabled:opacity-0 dark:hover:bg-gray-700"
            title={t("sidebar.sidebarMoveUp")}
          >
            <ArrowUpIcon className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => onMoveItem(sectionId, itemId, "down")}
            disabled={itemIdx === totalItems - 1}
            className="rounded-lg p-1 text-gray-400 opacity-0 transition hover:bg-gray-200 hover:text-gray-600 group-hover:opacity-100 disabled:opacity-0 dark:hover:bg-gray-700"
            title={t("sidebar.sidebarMoveDown")}
          >
            <ArrowDownIcon className="h-3 w-3" />
          </button>

          <Switch
            checked={item.visible}
            onCheckedChange={(checked) => onSetItemVisibility(sectionId, itemId, checked)}
            size="sm"
          />

          <button
            type="button"
            onClick={() => onToggleRoleExpand(itemKey)}
            className={`rounded-lg p-1.5 transition ${
              isRolesExpanded || itemRoles.length > 0
                ? "text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                : "text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            title={t("sidebar.sidebarRolePermissions")}
          >
            <ShieldCheckIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isRolesExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="mb-2 mt-3 mr-9 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 dark:border-indigo-900/30 dark:bg-indigo-950/20">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                  {t("sidebar.sidebarRoleFor", {
                    label: item.label || itemDef?.label || itemId,
                  })}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ALL_ROLES.map((role) => {
                  const isSelected = itemRoles.includes(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => onToggleRoleForItem(sectionId, itemId, role)}
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
              {itemRoles.length === 0 && (
                <p className="mt-1.5 text-[10px] text-indigo-400">
                  {t("sidebar.sidebarRoleNoRestriction")}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
