import React from "react";
import { useTranslation } from "react-i18next";
import { FileText, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import { Switch } from "../../../../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import type { TemplateFormState, Template } from "../types";

interface TemplateEditDialogProps {
  open: boolean;
  editingTemplate: Template | null;
  templateForm: TemplateFormState;
  saving: boolean;
  superAdminMode?: boolean;
  onOpenChange: (open: boolean) => void;
  onFormChange: (form: TemplateFormState) => void;
  onSave: () => void;
}

export const TemplateEditDialog: React.FC<TemplateEditDialogProps> = ({
  open,
  editingTemplate,
  templateForm,
  saving,
  superAdminMode,
  onOpenChange,
  onFormChange,
  onSave,
}) => {
  const { t } = useTranslation();

  const categories = superAdminMode
    ? [
        { value: "CUSTOMER", label: "العملاء" },
        { value: "SYSTEM", label: "النظام" },
      ]
    : [
        { value: "PRODUCTS", label: "المنتجات" },
        { value: "MARKETING", label: "التسويق" },
        { value: "ABANDONED_CART", label: "السلات المتروكة" },
        { value: "HR", label: "الموارد البشرية" },
        { value: "TASKS", label: "المهام" },
      ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <DialogTitle className="text-base font-semibold">
              {editingTemplate?.id
                ? t("whatsappNotifications.templates.edit", "تعديل قالب الرسالة")
                : t("whatsappNotifications.templates.new", "إنشاء قالب إشعار جديد")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {t(
              "whatsappNotifications.templates.desc",
              "صياغة محتوى الرسالة التلقائية مع إمكانية استخدام المتغيرات الديناميكية مثل {customer_name}.",
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Name */}
          <div className="space-y-1">
            <Label className="text-xs font-medium">اسم القالب</Label>
            <Input
              value={templateForm.name}
              onChange={(e) =>
                onFormChange({ ...templateForm, name: e.target.value })
              }
              placeholder="مثال: رسالة استعادة السلة بعد ساعة"
              className="h-8 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Category */}
            <div className="space-y-1">
              <Label className="text-xs font-medium">القسم</Label>
              <Select
                value={templateForm.category}
                onValueChange={(val) =>
                  onFormChange({ ...templateForm, category: val })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value} className="text-xs">
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active switch */}
            <div className="flex flex-col justify-end">
              <div className="flex items-center justify-between rounded-md border border-border/50 p-2">
                <Label className="text-xs font-medium">تفعيل القالب</Label>
                <Switch
                  checked={templateForm.isActive}
                  onCheckedChange={(checked) =>
                    onFormChange({ ...templateForm, isActive: checked })
                  }
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-1">
            <Label className="text-xs font-medium">نص الرسالة</Label>
            <Textarea
              rows={4}
              value={templateForm.content}
              onChange={(e) =>
                onFormChange({ ...templateForm, content: e.target.value })
              }
              placeholder="أهلاً بك {customer_name}، لقد لاحظنا أنك تركت بعض المنتجات في سلتك..."
              className="text-xs resize-none leading-relaxed"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs font-medium"
          >
            {t("common.cancel", "إلغاء")}
          </Button>
          <Button
            size="sm"
            onClick={onSave}
            disabled={saving || !templateForm.content.trim()}
            className="h-8 gap-1.5 bg-emerald-600 text-xs font-medium text-white hover:bg-emerald-700"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? t("common.saving", "جاري الحفظ...") : t("common.save", "حفظ القالب")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
