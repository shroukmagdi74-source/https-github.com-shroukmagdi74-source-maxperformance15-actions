import React from "react";
import { Button } from "../../../components/ui/button";
import { Plus } from "lucide-react";

interface WarningsHeaderProps {
  onNewWarning: () => void;
}

export const WarningsHeader: React.FC<WarningsHeaderProps> = ({
  onNewWarning,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          الإنذارات والمخالفات
        </h1>
        <p className="text-muted-foreground mt-1">
          إدارة ومتابعة المخالفات الإدارية والإجراءات التأديبية
        </p>
      </div>
      <Button
        onClick={onNewWarning}
        className="shadow-lg hover:shadow-xl transition-all"
      >
        <Plus className="h-5 w-5 ml-2" />
        تسجيل مخالفة جديدة
      </Button>
    </div>
  );
};
