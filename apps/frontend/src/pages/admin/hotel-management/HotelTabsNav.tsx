import React from "react";
import { Search } from "lucide-react";
import { HotelProperty } from "../hotel/shared";
import { TabId, TABS } from "./types";

interface HotelTabsNavProps {
  tab: TabId;
  properties: HotelProperty[];
  selectedProperty: string;
  search: string;
  setTab: (tab: TabId) => void;
  setSelectedProperty: (propertyId: string) => void;
  setSearch: (search: string) => void;
}

export const HotelTabsNav: React.FC<HotelTabsNavProps> = ({
  tab,
  properties,
  selectedProperty,
  search,
  setTab,
  setSelectedProperty,
  setSearch,
}) => {
  return (
    <div className="p-2 sm:p-2.5 border-b border-border/60 bg-muted/20 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
      {/* Tab Buttons */}
      <div className="flex items-center p-0.5 rounded-lg bg-muted/60 border border-border/40 text-xs shrink-0 overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all shrink-0 cursor-pointer ${
                tab === t.id
                  ? "bg-card text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Quick Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <select
          className="h-8 border border-border rounded-lg px-2.5 text-xs bg-card text-foreground outline-none font-medium"
          value={selectedProperty}
          onChange={(e) => setSelectedProperty(e.target.value)}
          aria-label="اختيار الفندق"
        >
          <option value="">كل الفنادق</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <div className="relative w-full sm:w-48">
          <Search className="size-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full h-8 border border-border rounded-lg pr-8 pl-2.5 text-xs bg-card text-foreground placeholder:text-muted-foreground outline-none"
            placeholder="بحث..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
