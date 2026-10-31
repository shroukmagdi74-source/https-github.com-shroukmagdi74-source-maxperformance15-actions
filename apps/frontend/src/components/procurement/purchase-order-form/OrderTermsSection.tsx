import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PurchaseOrderFormData } from "./types";

interface OrderTermsSectionProps {
  formData: PurchaseOrderFormData;
  setFormData: React.Dispatch<React.SetStateAction<PurchaseOrderFormData>>;
}

export const OrderTermsSection: React.FC<OrderTermsSectionProps> = ({
  formData,
  setFormData,
}) => {
  const { t } = useTranslation();

  return (
    <Card className="border border-border/70 shadow-2xs relative z-10 bg-card" size="sm">
      <CardContent className="p-4 sm:p-5 space-y-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">
            {t("procurement.purchaseOrderForm.paymentTermsLabel", "شروط الدفع والتسليم")}
          </Label>
          <Textarea
            rows={2}
            placeholder="مثال: دفع 50% مقدماً والباقي عند الاستلام والفحص..."
            value={formData.paymentTerms}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, paymentTerms: e.target.value }))
            }
            className="rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">
            {t("procurement.purchaseOrderForm.notesLabel", "ملاحظات إضافية")}
          </Label>
          <Textarea
            rows={3}
            placeholder="أي تعليمات خاصة بالشحن، رقم عرض السعر، أو تفاصيل الفحص الفني..."
            value={formData.notes}
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            className="rounded-xl"
          />
        </div>
      </CardContent>
    </Card>
  );
};
