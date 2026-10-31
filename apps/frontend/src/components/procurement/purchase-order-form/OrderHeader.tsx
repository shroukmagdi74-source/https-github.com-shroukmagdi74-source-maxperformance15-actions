import React from "react";
import { ArrowLeft, ShoppingCart, Printer, SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface OrderHeaderProps {
  isEdit: boolean;
  showAdvancedItemColumns: boolean;
  onBack: () => void;
  onToggleAdvancedColumns: () => void;
}

export const OrderHeader: React.FC<OrderHeaderProps> = ({
  isEdit,
  showAdvancedItemColumns,
  onBack,
  onToggleAdvancedColumns,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          aria-label="العودة لأوامر الشراء"
          className="rounded-full active:scale-[0.98] transition-transform duration-100"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShoppingCart className="size-6 text-primary" />
            {isEdit
              ? t("procurement.purchaseOrderForm.editTitle", "تعديل أمر شراء")
              : t("procurement.purchaseOrderForm.createTitle", "إنشاء أمر شراء جديد")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            طلب توريد أصناف وخامات من المورد مع متابعة التسليم وشروط الدفع
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isEdit && (
          <Button variant="outline" onClick={() => window.print()} className="gap-2">
            <Printer className="size-4" />
            {t("procurement.purchaseOrderForm.print", "طباعة")}
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onToggleAdvancedColumns}
          className="text-xs gap-1.5 rounded-lg h-9"
        >
          <SlidersHorizontal className="size-3.5" />
          {showAdvancedItemColumns
            ? "إخفاء الضرائب والخصومات الفرعية"
            : "إظهار الضريبة والخصم لكل بند"}
        </Button>
      </div>
    </div>
  );
};
