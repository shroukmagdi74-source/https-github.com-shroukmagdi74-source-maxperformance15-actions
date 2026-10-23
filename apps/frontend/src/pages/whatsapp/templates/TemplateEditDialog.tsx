import React from "react";
import { Clock, Cloud, Edit, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  CATEGORY_EVENT_MAP,
  TemplateFormState,
  VariableItem,
  EVENT_TRIGGERS,
} from "./types";

interface TemplateEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  saving: boolean;
  templateForm: TemplateFormState;
  setTemplateForm: React.Dispatch<React.SetStateAction<TemplateFormState>>;
  availableCategoryEntries: [string, string][];
  dialogEventEntries: [string, string][];
  activeCategoryVars: VariableItem[];
  superAdminMode: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  insertVariable: (varText: string) => void;
  onSave: () => void;
  onOpenMetaPicker: () => void;
  isArabic: boolean;
}

export const TemplateEditDialog: React.FC<TemplateEditDialogProps> = ({
  open,
  onOpenChange,
  isEditing,
  saving,
  templateForm,
  setTemplateForm,
  availableCategoryEntries,
  dialogEventEntries,
  activeCategoryVars,
  superAdminMode,
  textareaRef,
  insertVariable,
  onSave,
  onOpenMetaPicker,
  isArabic,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 p-0 sm:rounded-3xl">
        <div className="px-6 pb-4 pt-8 sm:px-8">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-[color:var(--color-primary)]">
                <Edit className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-xl">
                  {isEditing
                    ? isArabic
                      ? "تعديل القالب"
                      : "Edit Template"
                    : isArabic
                      ? "قالب جديد"
                      : "New Template"}
                </DialogTitle>
                <DialogDescription className="mt-1.5 text-base">
                  {isArabic
                    ? "قم بتخصيص محتوى الرسالة التي سيتم إرسالها للعملاء."
                    : "Customize the message content that will be sent to customers."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-6 sm:px-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-semibold">
                {isArabic ? "اسم القالب (اختياري)" : "Template name (Optional)"}
              </Label>
              <Input
                value={templateForm.name}
                onChange={(e) =>
                  setTemplateForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder={
                  isArabic
                    ? "مثال: ترحيب بالعملاء الجدد"
                    : "e.g., New customer welcome"
                }
                className="h-12 bg-[color:var(--color-muted)]"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  {isArabic ? "التصنيف" : "Category"}
                </Label>
                <Select
                  value={templateForm.category}
                  onValueChange={(val) => {
                    const newCat = val ?? "";
                    const defaultEv = CATEGORY_EVENT_MAP[newCat]?.[0] || "";
                    setTemplateForm((prev) => ({
                      ...prev,
                      category: newCat,
                      eventType: defaultEv || prev.eventType,
                    }));
                  }}
                  disabled={superAdminMode}
                >
                  <SelectTrigger className="h-11 bg-[color:var(--color-muted)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategoryEntries.map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  {isArabic ? "الحدث (Event)" : "Event type"}
                </Label>
                <Select
                  value={templateForm.eventType}
                  onValueChange={(val) =>
                    setTemplateForm((prev) => ({ ...prev, eventType: val ?? "" }))
                  }
                >
                  <SelectTrigger className="h-11 bg-[color:var(--color-muted)]">
                    <SelectValue
                      placeholder={
                        isArabic ? "اختر الحدث..." : "Select event..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {dialogEventEntries.map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  {isArabic ? "مسار القناة" : "Channel"}
                </Label>
                <Select
                  value={templateForm.channel}
                  onValueChange={(val) =>
                    setTemplateForm((prev) => ({
                      ...prev,
                      channel: (val as "AUTO" | "BAILEYS" | "META_CLOUD") || "AUTO",
                    }))
                  }
                >
                  <SelectTrigger className="h-11 bg-[color:var(--color-muted)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AUTO">
                      {isArabic ? "توجيه ذكي (AUTO)" : "Auto"}
                    </SelectItem>
                    <SelectItem value="BAILEYS">
                      {isArabic ? "واتساب ويب (Baileys)" : "Baileys"}
                    </SelectItem>
                    <SelectItem value="META_CLOUD">
                      {isArabic ? "ميتا كلاود (Meta Cloud)" : "Meta Cloud"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {EVENT_TRIGGERS[templateForm.eventType] ? (
              <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
                <Clock className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span className="font-semibold">
                  {isArabic ? "طبيعة التشغيل التلقائي:" : "Automation trigger:"}
                </span>
                <span>{EVENT_TRIGGERS[templateForm.eventType]}</span>
              </div>
            ) : null}

            {templateForm.metaTemplateName ? (
              <div className="flex items-center justify-between rounded-xl border border-sky-300/60 bg-sky-500/10 px-3 py-2 text-xs text-sky-800 dark:border-sky-500/40 dark:text-sky-200">
                <div className="flex items-center gap-2">
                  <Cloud className="size-4" />
                  <span>
                    {isArabic
                      ? "مرتبط بقالب ميتا معتمد:"
                      : "Linked to Meta Template:"}{" "}
                    <strong>{templateForm.metaTemplateName}</strong>
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-sky-700 hover:text-sky-900 dark:text-sky-300"
                  onClick={() =>
                    setTemplateForm((p) => ({ ...p, metaTemplateName: "" }))
                  }
                >
                  {isArabic ? "إلغاء الربط" : "Unlink"}
                </Button>
              </div>
            ) : null}

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label className="text-sm font-semibold">
                  {isArabic ? "محتوى الرسالة" : "Message content"}
                </Label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 rounded-full border-sky-300/80 bg-sky-500/5 text-xs text-sky-700 hover:bg-sky-500/10 dark:border-sky-500/40 dark:text-sky-300"
                    onClick={onOpenMetaPicker}
                  >
                    <Cloud className="size-3" />
                    {isArabic
                      ? "استيراد من قوالب ميتا المعتمدة"
                      : "Import from Meta"}
                  </Button>
                  <div className="flex items-center gap-2 text-sm text-[color:var(--color-muted-foreground)]">
                    <span>{isArabic ? "تفعيل" : "Active"}</span>
                    <Switch
                      checked={templateForm.isActive}
                      onCheckedChange={(checked) =>
                        setTemplateForm((prev) => ({ ...prev, isActive: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Clickable Variable Chips */}
              {activeCategoryVars.length > 0 && (
                <div className="space-y-1.5 rounded-2xl border border-[color:var(--shell-control-border)] bg-[color:var(--color-card)] p-3">
                  <p className="text-xs font-medium text-[color:var(--color-muted-foreground)]">
                    {isArabic
                      ? "المتغيرات المتاحة لهذا الحدث (اضغط للإدراج عند المؤشر):"
                      : "Available variables (click to insert at cursor):"}
                  </p>
                  <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
                    {activeCategoryVars.map((v) => (
                      <button
                        key={v.var}
                        type="button"
                        onClick={() => insertVariable(v.var)}
                        title={v.desc}
                        className="inline-flex items-center gap-1 rounded-lg border border-[color:var(--shell-control-border)] bg-[color:var(--color-muted)] px-2 py-1 text-xs font-medium text-[color:var(--color-foreground)] transition hover:border-[color:var(--color-primary)] hover:bg-primary/5 active:scale-95"
                      >
                        <span className="font-mono font-semibold text-[color:var(--color-primary)]">
                          {v.var}
                        </span>
                        <span className="text-[10px] text-[color:var(--color-muted-foreground)]">
                          ({v.label})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Textarea
                ref={textareaRef}
                value={templateForm.content}
                onChange={(e) =>
                  setTemplateForm((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder={
                  isArabic
                    ? "اكتب رسالتك هنا...\nيمكنك استخدام المتغيرات مثل {customerName}"
                    : "Type your message here...\nYou can use variables like {customerName}"
                }
                className="min-h-[180px] resize-y bg-[color:var(--color-muted)] p-4 leading-7"
                dir="auto"
              />
              <p className="text-xs text-[color:var(--color-muted-foreground)]">
                {isArabic
                  ? "المتغيرات بين الأقواس المعقوفة {variable} سيتم استبدالها تلقائياً ببيانات العميل أو الطلب الحقيقية عند الإرسال."
                  : "Variables in brackets {variable} will be automatically substituted with real customer/order data on dispatch."}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-[color:var(--shell-control-border)] bg-[color:var(--color-card)] px-6 py-5 sm:rounded-b-3xl sm:px-8">
          <DialogFooter className="gap-3 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-full"
            >
              {isArabic ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              onClick={onSave}
              disabled={saving}
              className="rounded-full"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {isArabic ? "جاري الحفظ..." : "Saving..."}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="size-4" />
                  {isArabic ? "حفظ القالب" : "Save template"}
                </span>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
