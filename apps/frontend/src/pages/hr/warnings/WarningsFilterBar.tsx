import React from "react";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Search, Filter } from "lucide-react";

interface WarningsFilterBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  severityFilter: string;
  onSeverityChange: (severity: string) => void;
}

export const WarningsFilterBar: React.FC<WarningsFilterBarProps> = ({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  severityFilter,
  onSeverityChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4">
      <Tabs
        value={activeTab}
        className="w-full md:w-auto"
        onValueChange={onTabChange}
      >
        <TabsList className="bg-muted/50 w-full md:w-auto p-1">
          <TabsTrigger value="all" className="flex-1 md:flex-none">
            الكل
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex-1 md:flex-none">
            قيد الانتظار
          </TabsTrigger>
          <TabsTrigger value="acknowledged" className="flex-1 md:flex-none">
            مكتملة
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-2 w-full md:w-auto">
        <div className="relative flex-1 md:flex-none md:w-64">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث باسم الموظف أو المخالفة..."
            className="pr-9 bg-background/50 border-muted"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Select value={severityFilter} onValueChange={onSeverityChange}>
          <SelectTrigger className="w-[140px] bg-background/50 border-muted">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="الشدة" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل المستويات</SelectItem>
            <SelectItem value="minor">بسيطة</SelectItem>
            <SelectItem value="moderate">متوسطة</SelectItem>
            <SelectItem value="severe">جسيمة</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
