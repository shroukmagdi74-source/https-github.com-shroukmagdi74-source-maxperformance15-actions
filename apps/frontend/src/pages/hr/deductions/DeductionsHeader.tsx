import React from "react";
import { DollarSign, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeductionsHeaderProps {
  onAddNew: () => void;
}

export const DeductionsHeader: React.FC<DeductionsHeaderProps> = ({
  onAddNew,
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400 ml-3" />
          إدارة الخصومات
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          إدارة الخصومات اليدوية للموظفين
        </p>
      </div>
      <Button
        onClick={onAddNew}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center transition-all active:scale-95"
      >
        <Plus className="h-5 w-5 ml-2" />
        إضافة خصم جديد
      </Button>
    </div>
  );
};
