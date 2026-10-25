import React from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Briefcase, Plus } from "lucide-react";

interface PositionsEmptyStateProps {
  searchTerm: string;
  onNewPosition: () => void;
}

export const PositionsEmptyState: React.FC<PositionsEmptyStateProps> = ({
  searchTerm,
  onNewPosition,
}) => {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <Briefcase className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500 mb-4">
          {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد مناصب"}
        </p>
        {!searchTerm && (
          <Button variant="outline" onClick={onNewPosition}>
            <Plus className="h-4 w-4 ml-2" />
            إضافة منصب جديد
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
