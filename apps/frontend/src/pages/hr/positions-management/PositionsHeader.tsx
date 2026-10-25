import React from "react";
import { Button } from "../../../components/ui/button";
import { Briefcase, Plus, ArrowRight } from "lucide-react";

interface PositionsHeaderProps {
  onBack: () => void;
  onNewPosition: () => void;
}

export const PositionsHeader: React.FC<PositionsHeaderProps> = ({
  onBack,
  onNewPosition,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowRight className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-blue-500" />
            إدارة المناصب
          </h1>
          <p className="text-gray-500 mt-1">
            إضافة وتعديل وحذف المناصب الوظيفية
          </p>
        </div>
      </div>
      <Button onClick={onNewPosition}>
        <Plus className="h-4 w-4 ml-2" />
        منصب جديد
      </Button>
    </div>
  );
};
