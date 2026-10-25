import React from "react";
import { Search, Plus } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";

interface ShiftsEmptyStateProps {
  searchTerm: string;
  onClearSearch: () => void;
  onCreateNew: () => void;
}

export const ShiftsEmptyState: React.FC<ShiftsEmptyStateProps> = ({
  searchTerm,
  onClearSearch,
  onCreateNew,
}) => {
  return (
    <Card className="border-dashed bg-white/50 dark:bg-gray-800/40">
      <CardContent className="p-12 text-center flex flex-col items-center">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-full mb-4">
          <Search className="h-8 w-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
          {searchTerm ? "لا توجد نتائج مطابقة" : "لا توجد مناوبات"}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-sm text-sm">
          {searchTerm
            ? `لم يتم العثور على أي مناوبات تطابق "${searchTerm}". جرب مصطلحات بحث مختلفة.`
            : "قم بإنشاء أول مناوبة عمل لتنظيم جدول الموظفين."}
        </p>
        {searchTerm ? (
          <Button
            type="button"
            variant="outline"
            onClick={onClearSearch}
            className="text-sm font-medium"
          >
            مسح البحث
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onCreateNew}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-sm"
          >
            <Plus className="h-4 w-4 ml-2" />
            <span>إنشاء مناوبة الآن</span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
