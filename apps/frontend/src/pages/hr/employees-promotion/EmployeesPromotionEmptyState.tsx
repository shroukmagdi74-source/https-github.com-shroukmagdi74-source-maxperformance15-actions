import React from "react";
import { Plus, TrendingUp } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";

interface EmployeesPromotionEmptyStateProps {
  hasAnyPromotions: boolean;
  onNewPromotion: () => void;
}

export const EmployeesPromotionEmptyState: React.FC<
  EmployeesPromotionEmptyStateProps
> = ({ hasAnyPromotions, onNewPromotion }) => {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500 mb-4">
          {!hasAnyPromotions
            ? "لا توجد ترقيات"
            : "لا توجد ترقيات تطابق البحث"}
        </p>
        <Button variant="outline" onClick={onNewPromotion}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة ترقية جديدة
        </Button>
      </CardContent>
    </Card>
  );
};
