import React from "react";
import { ArrowLeft, Receipt, Printer, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface InvoiceHeaderProps {
  isEdit: boolean;
  showAdvancedItemColumns: boolean;
  setShowAdvancedItemColumns: React.Dispatch<React.SetStateAction<boolean>>;
  onBack: () => void;
  t: (key: string, fallback: string) => string;
}

export const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({
  isEdit,
  showAdvancedItemColumns,
  setShowAdvancedItemColumns,
  onBack,
  t,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onBack}
          aria-label={t("common.back", "العودة")}
          className="rounded-full active:scale-[0.98] transition-transform duration-100"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Receipt className="size-6 text-primary" />
            {isEdit
              ? t("procurement.purchaseInvoiceForm.editTitle", "تعديل فاتورة مشتريات")
              : t("procurement.purchaseInvoiceForm.createTitle", "إنشاء فاتورة مشتريات جديدة")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            تسجيل سريع لفاتورة التوريد مع إمكانية السداد الفوري وتحديث الحسابات آلياً
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isEdit && (
          <Button
            type="button"
            variant="outline"
            onClick={() => window.print()}
            className="gap-2"
          >
            <Printer className="size-4" />
            {t("procurement.purchaseInvoiceForm.print", "طباعة")}
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowAdvancedItemColumns((prev) => !prev)}
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
