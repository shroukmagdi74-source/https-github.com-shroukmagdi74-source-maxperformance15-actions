import React from "react";
import { Button } from "@/components/ui/button";
import { Inbox } from "lucide-react";

interface FeedbackEmptyStateProps {
  onResetFilters: () => void;
}

export const FeedbackEmptyState: React.FC<FeedbackEmptyStateProps> = ({
  onResetFilters,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-muted/20">
      <div className="bg-muted p-6 rounded-full mb-4">
        <Inbox className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold text-foreground">
        لا توجد تغذية راجعة
      </h3>
      <p className="text-muted-foreground mt-2 mb-6 max-w-xs text-center">
        لم نجد أي بيانات مطابقة لفلاتر البحث الحالية
      </p>
      <Button variant="outline" onClick={onResetFilters}>
        إعادة ضبط الفلاتر
      </Button>
    </div>
  );
};
