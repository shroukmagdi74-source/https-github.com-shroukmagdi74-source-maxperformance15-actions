import React from "react";
import { ArrowLeft, Banknote, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentHeaderProps {
  isEditing: boolean;
  paymentNumber?: string;
  onBack: () => void;
}

export const PaymentHeader: React.FC<PaymentHeaderProps> = ({
  isEditing,
  paymentNumber,
  onBack,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          aria-label="العودة لقائمة المدفوعات"
          className="rounded-full active:scale-[0.98] transition-transform duration-100"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            {isEditing ? (
              <Pencil className="size-6 text-primary" />
            ) : (
              <Banknote className="size-6 text-primary" />
            )}
            {isEditing
              ? `تعديل سند الصرف (${paymentNumber || ""})`
              : "تسجيل سند صرف / دفعة جديدة للمورد"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isEditing
              ? "تعديل تفاصيل السداد والمبلغ والبيانات البنكية للسند"
              : "صرف نقدية أو تحويل بنكي للمورد وخصمها فورياً من رصيده المالي أو ربطها بفاتورة معينة"}
          </p>
        </div>
      </div>
    </div>
  );
};
