import React from "react";
import {
  ComputerDesktopIcon,
  Squares2X2Icon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { AssetDashboardSectionId } from "./types";
import {
  ASSET_DASHBOARD_SECTIONS,
  getAssetSectionColorClasses,
  getAssetSectionTitle,
} from "./helpers";

interface AssetsOverviewSidebarAndHeaderProps {
  activeSection: AssetDashboardSectionId;
  onSelectSection: (sectionId: AssetDashboardSectionId) => void;
}

export const AssetsOverviewSidebar: React.FC<
  AssetsOverviewSidebarAndHeaderProps
> = ({ activeSection, onSelectSection }) => {
  return (
    <aside className="w-72 bg-gradient-to-b from-indigo-800 to-violet-900 dark:from-[#2a1860] dark:via-[#1e1248] dark:to-[#160e38] min-h-screen sticky top-0 overflow-y-auto shadow-2xl relative">
      {/* Decorative Pattern */}
      <div className="absolute inset-0 opacity-10 dark:opacity-5 pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-indigo-400 to-fuchsia-500 rounded-full blur-3xl" />
      </div>

      {/* Sidebar Header */}
      <div className="p-5 border-b border-violet-700/30 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg shadow-violet-500/30">
            <ComputerDesktopIcon className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">
              إدارة الأصول والعهدة
            </h1>
            <p className="text-xs text-violet-300/60">
              نظام شامل لحماية وتتبع أصول الشركة
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="p-4 space-y-2 pb-6 relative z-10">
        {ASSET_DASHBOARD_SECTIONS.map((section) => {
          const SectionIcon = section.icon;
          const isActive = activeSection === section.id;
          const colors = getAssetSectionColorClasses(section.color);

          return (
            <button
              key={section.id}
              onClick={() => onSelectSection(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                isActive
                  ? `${colors?.activeBg || "bg-violet-600"} text-white shadow-lg shadow-violet-500/20`
                  : "text-violet-200/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <div
                className={`p-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-white/20"
                    : "bg-white/5 group-hover:bg-white/10"
                }`}
              >
                <SectionIcon
                  className={`h-5 w-5 ${
                    isActive
                      ? "text-white"
                      : `${colors?.icon || "text-slate-400"} group-hover:text-white`
                  }`}
                />
              </div>
              <span className="flex-1 text-right">{section.title}</span>
              {isActive && (
                <div className="w-2 h-2 rounded-full bg-white animate-pulse shadow-lg shadow-white/50" />
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export const AssetsOverviewTopHeader: React.FC<
  AssetsOverviewSidebarAndHeaderProps
> = ({ activeSection, onSelectSection }) => {
  return (
    <div className="sticky top-0 z-40 bg-white/90 dark:bg-[#1a1040]/90 backdrop-blur-xl shadow-lg border-b border-violet-200/30 dark:border-violet-700/30">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-6 w-1 bg-gradient-to-b from-violet-600 to-indigo-500 rounded-full" />
          <h2 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
            {getAssetSectionTitle(activeSection)}
          </h2>
        </div>

        {/* Quick Navigation Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2.5 bg-white/60 dark:bg-white/5 border border-violet-200/50 dark:border-white/10 rounded-xl hover:bg-violet-50 dark:hover:bg-white/10 transition-all duration-200 shadow-sm group">
            <Squares2X2Icon className="h-5 w-5 text-violet-500 dark:text-violet-400 group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 hidden sm:inline">
              الوصول السريع
            </span>
            <ChevronDownIcon className="h-4 w-4 text-gray-400 group-hover:translate-y-0.5 transition-transform" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-72 p-2 shadow-2xl shadow-violet-500/10 rounded-2xl"
          >
            <div className="px-3 py-2 border-b border-violet-100/50 dark:border-white/5 mb-1">
              <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                التنقل عبر الأقسام
              </p>
            </div>
            <div className="max-h-80 overflow-y-auto space-y-0.5">
              {ASSET_DASHBOARD_SECTIONS.map((section) => {
                const SectionIcon = section.icon;
                const isCurrentSection = activeSection === section.id;
                return (
                  <DropdownMenuItem
                    key={section.id}
                    onSelect={() => onSelectSection(section.id)}
                    className={`${
                      isCurrentSection
                        ? "bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-200 focus:bg-violet-100 dark:focus:bg-violet-500/20"
                        : "text-gray-600 dark:text-gray-300 focus:bg-violet-50 dark:focus:bg-white/10 focus:text-violet-600 dark:focus:text-white"
                    } group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-150`}
                  >
                    <div
                      className={`p-2 rounded-lg transition-colors ${
                        isCurrentSection
                          ? "bg-violet-200/60 dark:bg-violet-500/30"
                          : "bg-violet-50/50 dark:bg-white/5"
                      }`}
                    >
                      <SectionIcon
                        className={`h-4 w-4 ${
                          isCurrentSection
                            ? "text-violet-600 dark:text-violet-300"
                            : "text-violet-400"
                        }`}
                      />
                    </div>
                    <span className="flex-1 text-right font-medium">
                      {section.title}
                    </span>
                    {isCurrentSection && (
                      <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
