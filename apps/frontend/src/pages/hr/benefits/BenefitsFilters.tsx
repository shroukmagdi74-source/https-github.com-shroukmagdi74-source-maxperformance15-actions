import React from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BenefitsFiltersProps {
  search: string;
  setSearch: (search: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
}

export const BenefitsFilters: React.FC<BenefitsFiltersProps> = ({
  search,
  setSearch,
  typeFilter,
  setTypeFilter,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div className="md:col-span-8 relative group">
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
        </div>
        <Input
          placeholder="ابحث عن ميزة بالاسم أو الوصف..."
          className="w-full pr-12 h-14 rounded-2xl border-none bg-white dark:bg-gray-900 shadow-sm shadow-gray-200/50 dark:shadow-none focus:ring-2 focus:ring-primary/20 text-lg transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="md:col-span-4 h-14">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-full rounded-2xl border-none bg-white dark:bg-gray-900 shadow-sm shadow-gray-200/50 dark:shadow-none focus:ring-2 focus:ring-primary/20 font-bold transition-all">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              <SelectValue placeholder="تصفية حسب النوع" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-none shadow-2xl">
            <SelectItem value="all" className="rounded-xl m-1">
              كل الأنواع
            </SelectItem>
            <SelectItem value="health_insurance" className="rounded-xl m-1">
              تأمين صحي
            </SelectItem>
            <SelectItem value="life_insurance" className="rounded-xl m-1">
              تأمين على الحياة
            </SelectItem>
            <SelectItem value="retirement" className="rounded-xl m-1">
              تقاعد
            </SelectItem>
            <SelectItem value="transportation" className="rounded-xl m-1">
              بدل انتقال
            </SelectItem>
            <SelectItem value="housing" className="rounded-xl m-1">
              بدل سكن
            </SelectItem>
            <SelectItem value="other" className="rounded-xl m-1">
              أخرى
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
