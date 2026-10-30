import React from "react";
import type { FactoryAgreement } from "./types";

export interface AgreementTermsTabProps {
  agreement: FactoryAgreement;
}

export const AgreementTermsTab: React.FC<AgreementTermsTabProps> = ({
  agreement,
}) => {
  return (
    <div className="space-y-3">
      <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20">
        <span className="text-[11px] font-bold text-primary block mb-1">
          1. نطاق العمليات (Scope of Operations)
        </span>
        <p className="text-xs text-foreground whitespace-pre-line leading-relaxed">
          {agreement.scopeOfOperations || "لم يتم تحديد شروط تفصيلية"}
        </p>
      </div>

      <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20">
        <span className="text-[11px] font-bold text-primary block mb-1">
          2. وصف المنتجات (Products Description)
        </span>
        <p className="text-xs text-foreground whitespace-pre-line leading-relaxed">
          {agreement.productsDesc || "لم يتم تحديد شروط تفصيلية"}
        </p>
      </div>

      <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20">
        <span className="text-[11px] font-bold text-primary block mb-1">
          3. ملاحظات الكميات والتشغيل (Quantities Notes)
        </span>
        <p className="text-xs text-foreground whitespace-pre-line leading-relaxed">
          {agreement.quantitiesNotes || "لم يتم تحديد شروط تفصيلية"}
        </p>
      </div>

      <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20">
        <span className="text-[11px] font-bold text-primary block mb-1">
          4. شروط ومعايير الجودة ومستوى الفحص (Quality Terms)
        </span>
        <p className="text-xs text-foreground whitespace-pre-line leading-relaxed">
          {agreement.qualityTerms || "لم يتم تحديد شروط تفصيلية"}
        </p>
      </div>

      <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20">
        <span className="text-[11px] font-bold text-primary block mb-1">
          5. ملكية الخامات والتوريدات (Material Ownership)
        </span>
        <p className="text-xs text-foreground whitespace-pre-line leading-relaxed">
          {agreement.materialOwnership ||
            "الخامات المسلمة للمصنع ملكية حصرية للشركة"}
        </p>
      </div>

      <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20">
        <span className="text-[11px] font-bold text-primary block mb-1">
          6. سياسة الهالك ونسب التفاوت المسموحة (Waste Policy)
        </span>
        <p className="text-xs text-foreground whitespace-pre-line leading-relaxed">
          {agreement.wastePolicy ||
            "نسبة الهالك حسب المعيار الفني وما زاد يتحمله المصنع"}
        </p>
      </div>

      <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20">
        <span className="text-[11px] font-bold text-primary block mb-1">
          7. شروط ومواعيد التسليم (Delivery Terms)
        </span>
        <p className="text-xs text-foreground whitespace-pre-line leading-relaxed">
          {agreement.deliveryTerms ||
            "التسليم في مخازن الشركة بعد الفحص النهائي"}
        </p>
      </div>

      <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20">
        <span className="text-[11px] font-bold text-primary block mb-1">
          8. سياسة إعادة التشغيل والإصلاح (Rework Policy)
        </span>
        <p className="text-xs text-foreground whitespace-pre-line leading-relaxed">
          {agreement.reworkPolicy || "إعادة تشغيل العيوب على نفقة المصنع الشريك"}
        </p>
      </div>

      <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20">
        <span className="text-[11px] font-bold text-primary block mb-1">
          9. ملاحظات عامة وإضافية (General Notes)
        </span>
        <p className="text-xs text-foreground whitespace-pre-line leading-relaxed">
          {agreement.notes || "لا توجد ملاحظات إضافية"}
        </p>
      </div>
    </div>
  );
};
