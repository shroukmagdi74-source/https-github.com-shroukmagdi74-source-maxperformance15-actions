import React from "react";
import { Button } from "../../../components/ui/button";
import { Plus } from "lucide-react";

interface CompanyPolicyHeaderProps {
  onNewPolicy: () => void;
}

export const CompanyPolicyHeader: React.FC<CompanyPolicyHeaderProps> = ({
  onNewPolicy,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          سياسات الشركة
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          الدليل الشامل للوائح والقوانين التنظيمية
        </p>
      </div>
      <Button
        onClick={onNewPolicy}
        className="bg-blue-600 hover:bg-blue-700"
      >
        <Plus className="h-4 w-4 ml-2" />
        إضافة سياسة جديدة
      </Button>
    </div>
  );
};
