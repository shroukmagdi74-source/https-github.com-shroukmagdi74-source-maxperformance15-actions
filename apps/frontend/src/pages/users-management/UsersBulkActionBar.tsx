import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface UsersBulkActionBarProps {
  selectedCount: number;
  onActivate: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
  onClear: () => void;
}

export const UsersBulkActionBar: React.FC<UsersBulkActionBarProps> = ({
  selectedCount,
  onActivate,
  onDeactivate,
  onDelete,
  onClear,
}) => {
  const { t } = useTranslation();

  if (selectedCount === 0) return null;

  return (
    <Card className="border-border/80 dark:border-border/60 bg-muted/20">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm font-semibold">
          {t("users.selectedUsers", { count: selectedCount }) ||
            `تم تحديد ${selectedCount} مستخدم`}
        </CardTitle>
        <CardDescription className="text-xs">
          {t("users.bulkActionsDescription", "تطبيق إجراء جماعي على الحسابات المحددة.")}
        </CardDescription>
      </CardHeader>
      <CardContent className="py-2 px-4">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs h-8"
            onClick={onActivate}
          >
            {t("users.activate", "تفعيل")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs h-8"
            onClick={onDeactivate}
          >
            {t("users.deactivate", "تعطيل")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="text-xs h-8 gap-1.5"
            onClick={onDelete}
          >
            <Trash2 className="size-3.5" />
            {t("users.deleteSelected", "حذف المحدد")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs h-8"
            onClick={onClear}
          >
            {t("users.clearSelection", "إلغاء التحديد")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
