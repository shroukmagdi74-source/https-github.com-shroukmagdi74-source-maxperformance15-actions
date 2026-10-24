import React from "react";
import { useTranslation } from "react-i18next";
import { PaintBrushIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import type { SidebarLayoutType } from "../../../types/layout";

export interface SidebarLayoutPickerProps {
  userLayout: SidebarLayoutType | null;
  onSelectLayout: (layout: SidebarLayoutType | null) => void;
}

export function SidebarLayoutPicker({
  userLayout,
  onSelectLayout,
}: SidebarLayoutPickerProps) {
  const { t } = useTranslation();

  const options: Array<{
    id: SidebarLayoutType;
    label: string;
    desc: string;
  }> = [
    {
      id: "classic",
      label: t("sidebar.sidebarLayoutClassic"),
      desc: t("sidebar.sidebarLayoutClassicDesc"),
    },
    {
      id: "three-tier",
      label: t("sidebar.sidebarLayoutThreeTier"),
      desc: t("sidebar.sidebarLayoutThreeTierDesc"),
    },
    {
      id: "horizontal",
      label: t("sidebar.sidebarLayoutHorizontal"),
      desc: t("sidebar.sidebarLayoutHorizontalDesc"),
    },
    {
      id: "floating",
      label: t("sidebar.sidebarLayoutFloating"),
      desc: t("sidebar.sidebarLayoutFloatingDesc"),
    },
    {
      id: "minimal",
      label: t("sidebar.sidebarLayoutMinimal"),
      desc: t("sidebar.sidebarLayoutMinimalDesc"),
    },
  ];

  return (
    <div className="mb-6 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
        <PaintBrushIcon className="h-4 w-4 text-indigo-500" />
        {t("sidebar.sidebarLayout")}
      </h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {options.map((opt) => {
          const isSelected = userLayout === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectLayout(isSelected ? null : opt.id)}
              className={`relative rounded-xl border p-3 text-right transition-all duration-150 ${
                isSelected
                  ? "border-indigo-500 bg-indigo-50/70 shadow-xs dark:border-indigo-500 dark:bg-indigo-950/40"
                  : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-800/60 dark:hover:border-gray-700"
              }`}
            >
              <div
                className={`text-xs font-semibold ${
                  isSelected
                    ? "text-indigo-700 dark:text-indigo-300"
                    : "text-gray-900 dark:text-gray-100"
                }`}
              >
                {opt.label}
              </div>
              <div className="mt-0.5 text-[10px] leading-relaxed text-gray-500 dark:text-gray-400">
                {opt.desc}
              </div>
              {isSelected && (
                <CheckCircleIcon className="absolute left-1.5 top-1.5 h-3.5 w-3.5 text-indigo-500" />
              )}
            </button>
          );
        })}
        {userLayout && (
          <button
            type="button"
            onClick={() => onSelectLayout(null)}
            className="col-span-full mt-1 text-xs text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-300"
          >
            {t("sidebar.sidebarResetLayout")}
          </button>
        )}
      </div>
    </div>
  );
}
