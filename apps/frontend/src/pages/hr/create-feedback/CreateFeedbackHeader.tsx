import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "../../../components/ui/button";

interface CreateFeedbackHeaderProps {
  isEdit: boolean;
  isPersonal: boolean;
  onBack: () => void;
}

export const CreateFeedbackHeader: React.FC<CreateFeedbackHeaderProps> = ({
  isEdit,
  isPersonal,
  onBack,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full shadow-sm hover:bg-muted"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            {isEdit ? "تعديل الرسالة" : "إرسال شكوى أو اقتراح"}
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            {isEdit
              ? "قم بتحديث تفاصيل رسالتك المرسلة"
              : isPersonal
                ? "تعبيرك عن رأيك يساعدنا على تحسين بيئة العمل"
                : "تواصل مع الإدارة أو شارك تقييمك لزملائك بكل شفافية"}
          </p>
        </div>
      </div>
    </div>
  );
};
