import React from "react";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  getPromotionStatusLabel,
  getPromotionStatusVariant,
} from "./helpers";

interface EditPromotionHeaderProps {
  status?: string;
  onBack: () => void;
}

export const EditPromotionHeader: React.FC<EditPromotionHeaderProps> = ({
  status,
  onBack,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full hover:bg-gray-100"
        >
          <ArrowRight className="h-6 w-6 text-gray-600" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            تعديل ترقية
          </h1>
          <p className="text-gray-500 mt-1">
            تحديث بيانات الترقية وتعديل الحالة
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge
          variant={getPromotionStatusVariant(status)}
          className="text-lg px-4 py-1"
        >
          {getPromotionStatusLabel(status)}
        </Badge>
      </div>
    </div>
  );
};
