import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { DeviceFilterType } from "./types";

interface AuthorizedDevicesFilterToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterType: DeviceFilterType;
  onFilterChange: (type: DeviceFilterType) => void;
}

const FILTER_OPTIONS: { id: DeviceFilterType; label: string }[] = [
  { id: "ALL", label: "الكل" },
  { id: "OFFICE", label: "أجهزة المكتب" },
  { id: "PERSONAL", label: "الأجهزة الشخصية" },
];

export const AuthorizedDevicesFilterToolbar: React.FC<AuthorizedDevicesFilterToolbarProps> = ({
  search,
  onSearchChange,
  filterType,
  onFilterChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="بحث بالموظف أو اسم الجهاز أو البصمة…"
          className="pr-9 h-9 text-xs"
        />
      </div>

      <div className="flex items-center gap-1.5 self-end sm:self-auto bg-muted/60 p-1 rounded-md border border-border">
        {FILTER_OPTIONS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onFilterChange(tab.id)}
            className={`px-3 py-1 text-xs rounded transition-colors font-medium ${
              filterType === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};
