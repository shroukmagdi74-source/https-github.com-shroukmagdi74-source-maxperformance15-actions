import React from "react";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { Button } from "../../../components/ui/button";

interface CreateWarningHeaderProps {
  onBack: () => void;
}

export const CreateWarningHeader: React.FC<CreateWarningHeaderProps> = ({
  onBack,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full hover:bg-muted"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-foreground">
            <ShieldAlert className="h-8 w-8 text-red-500" />
            إصدار مخالفة إدارية
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            توثيق إجراء تأديبي أو مخالفة وفقاً للوائح الشركة
          </p>
        </div>
      </div>
    </div>
  );
};
