import React from "react";
import { Button } from "../../../components/ui/button";
import { FileText, Plus } from "lucide-react";

interface WarningsEmptyStateProps {
  onNewWarning?: () => void;
  showAddButton?: boolean;
}

export const WarningsEmptyState: React.FC<WarningsEmptyStateProps> = ({
  onNewWarning,
  showAddButton = false,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
      <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
        <FileText className="h-8 w-8 opacity-50" />
      </div>
      <h3 className="text-lg font-medium text-foreground">
        لا توجد مخالفات مطابقة
      </h3>
      <p className="max-w-xs mx-auto mt-2">
        لم يتم العثور على أي سجلات تطابق معايير البحث الخاصة بك. حاول تغيير
        الفلاتر.
      </p>
      {showAddButton && onNewWarning && (
        <Button
          variant="outline"
          className="mt-6"
          onClick={onNewWarning}
        >
          <Plus className="h-4 w-4 ml-2" />
          إضافة مخالفة جديدة
        </Button>
      )}
    </div>
  );
};
