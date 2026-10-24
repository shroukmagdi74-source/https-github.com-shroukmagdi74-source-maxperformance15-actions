import React from "react";
import { Activity, X, LayoutGrid, Network as HierarchyIcon } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { motion } from "framer-motion";

interface DepartmentFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterStatus: "all" | "active" | "inactive";
  setFilterStatus: (val: "all" | "active" | "inactive") => void;
  viewMode: "grid" | "hierarchy";
  setViewMode: (val: "grid" | "hierarchy") => void;
}

export const DepartmentFilters: React.FC<DepartmentFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  viewMode,
  setViewMode,
}) => {
  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <Input
              placeholder="ابحث عن قسم بالاسم أو الوصف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 h-12 bg-gray-50/50 dark:bg-gray-800/50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium"
            />
            <Activity className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
          </div>
          <div className="flex gap-2">
            <Select
              value={filterStatus}
              onValueChange={(value: any) => setFilterStatus(value)}
            >
              <SelectTrigger className="w-full md:w-56 h-12 bg-gray-50/50 dark:bg-gray-800/50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20">
                <SelectValue placeholder="حالة الأقسام" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-gray-100 dark:border-gray-800">
                <SelectItem value="all">جميع الأقسام</SelectItem>
                <SelectItem value="active">النشطة والفعالة</SelectItem>
                <SelectItem value="inactive">المؤرشفة (غير نشطة)</SelectItem>
              </SelectContent>
            </Select>
            {(searchQuery || filterStatus !== "all") && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery("");
                  setFilterStatus("all");
                }}
                className="h-12 px-6 rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <X className="h-4 w-4 ml-2" />
                تصفير
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* View Toggle */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-2 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="rounded-lg gap-2"
          >
            <LayoutGrid className="h-4 w-4" />
            عرض الشبكة
          </Button>
          <Button
            variant={viewMode === "hierarchy" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("hierarchy")}
            className="rounded-lg gap-2"
          >
            <HierarchyIcon className="h-4 w-4" />
            الهيكل التنظيمي
          </Button>
        </div>
      </div>
    </div>
  );
};
