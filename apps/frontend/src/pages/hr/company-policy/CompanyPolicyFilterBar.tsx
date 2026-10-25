import React from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Search } from "lucide-react";
import { categories } from "./helpers";

interface CompanyPolicyFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CompanyPolicyFilterBar: React.FC<CompanyPolicyFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <Card className="border-none shadow-sm bg-white dark:bg-gray-900">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            <Input
              placeholder="بحث في السياسات..."
              className="pr-10 w-full"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <Select
              value={selectedCategory}
              onValueChange={onCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="تصفية حسب الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
