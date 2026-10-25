import React from "react";
import { BarChart3, ArrowRight, Plus } from "lucide-react";
import { Button } from "../../../components/ui/button";

interface CreatePerformanceReviewHeaderProps {
  isEditing: boolean;
  onBack: () => void;
}

export const CreatePerformanceReviewHeader: React.FC<
  CreatePerformanceReviewHeaderProps
> = ({ isEditing, onBack }) => {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full bg-white dark:bg-gray-800 shadow-sm border"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            {isEditing ? (
              <BarChart3 className="h-8 w-8 text-primary" />
            ) : (
              <Plus className="h-8 w-8 text-primary" />
            )}
            {isEditing ? "تعديل تقييم الأداء" : "إنشاء تقييم جديد"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? "قم بتحديث بيانات تقييم الأداء الحالي"
              : "قم بإعداد نموذج تقييم أداء جديد للموظف"}
          </p>
        </div>
      </div>
    </div>
  );
};
