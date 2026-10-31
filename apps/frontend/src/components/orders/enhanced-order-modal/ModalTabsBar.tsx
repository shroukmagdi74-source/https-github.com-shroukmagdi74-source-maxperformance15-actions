import React from "react";
import {
  UserCircleIcon,
  PencilSquareIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { ModalTabKey } from "./types";

export interface ModalTabsBarProps {
  activeTab: ModalTabKey;
  onTabChange: (tab: ModalTabKey) => void;
}

const TAB_CONFIG = [
  { key: "details" as const, icon: UserCircleIcon },
  { key: "update" as const, icon: PencilSquareIcon },
  { key: "history" as const, icon: ClipboardDocumentListIcon },
];

export const ModalTabsBar: React.FC<ModalTabsBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { t } = useTranslation();

  return (
    <div
      role="tablist"
      aria-label={t("orders.detailTabs.update")}
      className="flex items-center gap-0.5 rounded-xl border border-border/60 bg-card/40 p-0.5 backdrop-blur-sm"
    >
      {TAB_CONFIG.map(({ key, icon: Icon }) => {
        const isActive = activeTab === key;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`tab-panel-${key}`}
            onClick={() => onTabChange(key)}
            className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background hover:text-foreground"
            }`}
          >
            <Icon className="h-3 w-3" />
            {t(`orders.detailTabs.${key}`)}
          </button>
        );
      })}
    </div>
  );
};

export default ModalTabsBar;
