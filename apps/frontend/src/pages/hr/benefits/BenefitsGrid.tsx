import React from "react";
import { Gift, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Benefit, PaginationState } from "./types";
import { BenefitCard } from "./BenefitCard";

interface BenefitsGridProps {
  benefits: Benefit[];
  loading: boolean;
  pagination: PaginationState;
  page: number;
  setPage: (page: number | ((p: number) => number)) => void;
  onSelectBenefit: (id: string) => void;
  onEditBenefit: (benefit: Benefit) => void;
  onDeleteBenefit: (e: React.MouseEvent, id: string) => void;
  onAddNew: () => void;
}

export const BenefitsGrid: React.FC<BenefitsGridProps> = ({
  benefits,
  loading,
  pagination,
  page,
  setPage,
  onSelectBenefit,
  onEditBenefit,
  onDeleteBenefit,
  onAddNew,
}) => {
  if (benefits.length === 0 && !loading) {
    return (
      <Card className="border-dashed border-2 bg-transparent">
        <CardContent className="p-20 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Gift className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">لا توجد مزايا مسجلة</h3>
          <p className="text-muted-foreground mb-8 max-w-sm">
            لم تقم بإضافة أي مزايا موظفين حتى الآن. ابدأ بإضافة التأمين الصحي أو
            برامج التقاعد.
          </p>
          <Button
            variant="outline"
            onClick={onAddNew}
            className="h-11 rounded-full px-8"
          >
            <Plus className="h-4 w-4 ml-2" />
            أضف أول ميزة
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefits.map((benefit: Benefit) => (
          <BenefitCard
            key={benefit.id}
            benefit={benefit}
            onClick={() => onSelectBenefit(benefit.id)}
            onEdit={onEditBenefit}
            onDelete={onDeleteBenefit}
          />
        ))}
      </div>

      {/* Pagination Section */}
      {pagination?.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <p className="text-sm text-muted-foreground font-mono tabular-nums">
            عرض {benefits.length} من {pagination?.total || 0} ميزة
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-9 w-9 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1 mx-2">
              {[...Array(pagination?.totalPages || 0)].map((_, i) => (
                <Button
                  key={i}
                  variant={page === i + 1 ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setPage(i + 1)}
                  className="h-9 w-9 p-0 font-mono tabular-nums"
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((p) => Math.min(pagination?.totalPages || 1, p + 1))
              }
              disabled={page === pagination?.totalPages}
              className="h-9 w-9 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
