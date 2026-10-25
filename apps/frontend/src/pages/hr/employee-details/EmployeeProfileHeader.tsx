import React from "react";
import { ArrowRight, Edit } from "lucide-react";
import { Button } from "../../../components/ui/button";

interface EmployeeProfileHeaderProps {
  id: string;
  onBack: () => void;
  onEdit: () => void;
}

export const EmployeeProfileHeader: React.FC<EmployeeProfileHeaderProps> = ({
  onBack,
  onEdit,
}) => {
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" onClick={onBack} title="العودة">
        <ArrowRight className="h-4 w-4" />
      </Button>
      <div className="flex-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          ملف الموظف
        </h1>
      </div>
      <Button variant="outline" onClick={onEdit}>
        <Edit className="h-4 w-4 ml-2" />
        تعديل
      </Button>
    </div>
  );
};
