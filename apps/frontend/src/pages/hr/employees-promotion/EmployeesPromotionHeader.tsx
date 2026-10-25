import React from "react";
import { Plus } from "lucide-react";
import { Button } from "../../../components/ui/button";

interface EmployeesPromotionHeaderProps {
  onNewPromotion: () => void;
}

export const EmployeesPromotionHeader: React.FC<
  EmployeesPromotionHeaderProps
> = ({ onNewPromotion }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">ترقيات الموظفين</h1>
        <p className="text-gray-500 mt-1">
          إدارة ترقيات الموظفين والترقي الوظيفي
        </p>
      </div>
      <Button onClick={onNewPromotion}>
        <Plus className="h-4 w-4 ml-2" />
        ترقية جديدة
      </Button>
    </div>
  );
};
