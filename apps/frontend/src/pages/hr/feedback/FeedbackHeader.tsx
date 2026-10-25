import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface FeedbackHeaderProps {
  onNewFeedback: () => void;
}

export const FeedbackHeader: React.FC<FeedbackHeaderProps> = ({
  onNewFeedback,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-2">
          التغذية الراجعة 360°
        </h1>
        <p className="text-lg text-muted-foreground">
          نظرة شاملة على الأداء والتفاعل في الشركة
        </p>
      </div>
      <Button
        onClick={onNewFeedback}
        size="lg"
        className="shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <Plus className="h-5 w-5 ml-2" />
        تغذية راجعة جديدة
      </Button>
    </div>
  );
};
