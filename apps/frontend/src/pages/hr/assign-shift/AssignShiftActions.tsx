import React from "react";
import { Button } from "../../../components/ui/button";

interface AssignShiftActionsProps {
  selectedCount: number;
  submitting: boolean;
  disabled: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

export const AssignShiftActions: React.FC<AssignShiftActionsProps> = ({
  selectedCount,
  submitting,
  disabled,
  onSubmit,
  onCancel,
}) => {
  return (
    <div className="pt-4 flex gap-3">
      <Button
        onClick={onSubmit}
        disabled={disabled}
        className="flex-1 h-12 text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
      >
        {submitting
          ? "جاري الحفظ..."
          : `تأكيد التعيين (${selectedCount})`}
      </Button>
      <Button
        variant="outline"
        onClick={onCancel}
        className="h-12 border-gray-200 dark:border-gray-800"
      >
        إلغاء
      </Button>
    </div>
  );
};
