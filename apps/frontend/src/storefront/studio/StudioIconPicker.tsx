import React, { useState, useMemo } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  STOREFRONT_ICONS,
  STOREFRONT_ICON_LIST,
  type StudioIconDefinition,
} from "./utils/storefrontIcons";

export { STOREFRONT_ICONS, STOREFRONT_ICON_LIST, type StudioIconDefinition };

export interface StudioIconPickerProps {
  selectedIcon?: string;
  onSelectIcon: (iconId: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const StudioIconPicker: React.FC<StudioIconPickerProps> = ({
  selectedIcon,
  onSelectIcon,
  isOpen = true,
  onClose,
}) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "الكل" },
    { id: "commerce", label: "تجارة ومبيعات" },
    { id: "trust", label: "ثقة وضمان" },
    { id: "social", label: "تواصل اجتماعي" },
    { id: "actions", label: "إجراءات" },
    { id: "ui", label: "واجهة عامة" },
  ];

  const filteredIcons = useMemo(() => {
    const q = search.trim().toLowerCase();
    return STOREFRONT_ICON_LIST.filter((icon) => {
      const matchesCategory =
        selectedCategory === "all" || icon.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;

      const inId = icon.id.toLowerCase().includes(q);
      const inAr = icon.labelAr.toLowerCase().includes(q);
      const inEn = icon.labelEn.toLowerCase().includes(q);
      const inTags = icon.tags.some((t) => t.toLowerCase().includes(q));

      return inId || inAr || inEn || inTags;
    });
  }, [search, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div
      data-testid="studio-icon-picker"
      className="flex flex-col h-full w-full bg-[#17181c] text-[#e8eaee] select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#202226] p-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">مكتبة الأيقونات</span>
          <span className="text-xs rounded-full bg-[#202226] px-2 py-0.5 text-[#9ba0a8]">
            {filteredIcons.length}
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[#9ba0a8] hover:bg-[#202226] hover:text-white"
            aria-label="إغلاق"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-[#202226]">
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748b]" />
          <input
            type="text"
            data-testid="studio-icon-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو الوسم (عربي / English)..."
            className="w-full rounded-lg border border-[#26282e] bg-[#0c0d0f] py-1.5 ps-9 pe-3 text-xs text-white placeholder-[#64748b] focus:border-[#2b6cf6] focus:outline-none"
          />
        </div>

        {/* Categories Bar */}
        <div className="mt-2.5 flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 rounded-md px-2 py-1 text-[11px] transition-colors ${
                selectedCategory === cat.id
                  ? "bg-[#2b6cf6] text-white font-medium"
                  : "bg-[#202226] text-[#9ba0a8] hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Icons Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {filteredIcons.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center text-xs text-[#64748b]">
            <p>لا توجد أيقونة تطابق البحث "{search}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {filteredIcons.map((icon) => {
              const isSelected = selectedIcon === icon.id;
              const SvgIcon = icon.svg;
              return (
                <button
                  key={icon.id}
                  type="button"
                  data-testid={`icon-item-${icon.id}`}
                  onClick={() => onSelectIcon(icon.id)}
                  title={`${icon.labelAr} (${icon.labelEn})`}
                  className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border transition-all ${
                    isSelected
                      ? "border-[#2b6cf6] bg-[#2b6cf6]/15 text-[#2b6cf6] ring-1 ring-[#2b6cf6]"
                      : "border-[#202226] bg-[#0c0d0f] text-[#9ba0a8] hover:border-[#383b42] hover:text-white hover:bg-[#1a1c22]"
                  }`}
                >
                  <SvgIcon className="w-5 h-5 shrink-0" />
                  <span className="text-[10px] truncate max-w-full text-center">
                    {icon.labelAr}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudioIconPicker;
