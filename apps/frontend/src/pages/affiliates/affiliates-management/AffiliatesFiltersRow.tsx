import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { getStatusLabel } from "./helpers";

interface AffiliatesFiltersRowProps {
  isDark: boolean;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
}

export const AffiliatesFiltersRow: React.FC<AffiliatesFiltersRowProps> = ({
  isDark,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
      <div className="flex-1 relative">
        <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="بحث بالاسم، البريد، أو الهاتف..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full pr-10 pl-4 py-2.5 sm:py-3 text-sm rounded-xl border ${
            isDark
              ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              : "bg-white border-gray-200 text-gray-900 shadow-sm"
          } outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
        />
      </div>
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
        {["ALL", "PENDING", "ACTIVE", "SUSPENDED"].map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilterStatus(status)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
              filterStatus === status
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                : `${
                    isDark
                      ? "bg-gray-800 text-gray-400 border-gray-700 hover:text-white"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  } border`
            }`}
          >
            {status === "ALL" ? "الكل" : getStatusLabel(status)}
          </button>
        ))}
      </div>
    </div>
  );
};
