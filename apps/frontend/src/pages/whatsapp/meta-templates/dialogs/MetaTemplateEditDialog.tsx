import React from "react";
import { AlertTriangle, CheckCircle, Shield, XCircle } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { HeaderMediaUploadField } from "./HeaderMediaUploadField";
import {
  CATEGORIES,
  ComplianceResult,
  TemplateFormState,
} from "../types";

interface MetaTemplateEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editForm: TemplateFormState | null;
  setEditForm: React.Dispatch<React.SetStateAction<TemplateFormState | null>>;
  editSending: boolean;
  editComplianceResults: ComplianceResult[];
  editShowCompliance: boolean;
  onToggleShowCompliance: () => void;
  uploadingHeader: boolean;
  onUploadHeaderMedia: (
    file: File,
    apply: (handle: string, name: string) => void,
  ) => void;
  onSave: () => void;
}

export const MetaTemplateEditDialog: React.FC<MetaTemplateEditDialogProps> = ({
  open,
  onOpenChange,
  editForm,
  setEditForm,
  editSending,
  editComplianceResults,
  editShowCompliance,
  onToggleShowCompliance,
  uploadingHeader,
  onUploadHeaderMedia,
  onSave,
}) => {
  if (!editForm) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto max-w-xl sm:rounded-3xl">
        <DialogHeader>
          <DialogTitle>تعديل القالب</DialogTitle>
          <DialogDescription>
            تعديل قالب "{editForm.name}". بعد التعديل، يمر القالب بمراجعة جديدة
            من ميتا.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>التصنيف</Label>
            <Select
              value={editForm.category}
              onValueChange={(v) =>
                setEditForm((p) => (p ? { ...p, category: v ?? "" } : null))
              }
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>اللغة</Label>
            <Select
              value={editForm.language}
              onValueChange={(v) =>
                setEditForm((p) => (p ? { ...p, language: v ?? "" } : null))
              }
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="tr">Türkçe</SelectItem>
                <SelectItem value="ur">اردو</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>رأس الرسالة (اختياري)</Label>
            <div className="flex gap-2">
              <Select
                value={editForm.headerFormat}
                onValueChange={(v) =>
                  setEditForm((p) =>
                    p ? { ...p, headerFormat: v ?? "" } : null,
                  )
                }
              >
                <SelectTrigger className="h-11 w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEXT">TEXT</SelectItem>
                  <SelectItem value="IMAGE">IMAGE</SelectItem>
                  <SelectItem value="VIDEO">VIDEO</SelectItem>
                  <SelectItem value="DOCUMENT">DOCUMENT</SelectItem>
                </SelectContent>
              </Select>
              {editForm.headerFormat === "TEXT" ? (
                <Input
                  value={editForm.headerText}
                  onChange={(e) =>
                    setEditForm((p) =>
                      p ? { ...p, headerText: e.target.value } : null,
                    )
                  }
                  placeholder="نص الرأس"
                  className="h-11 flex-1"
                />
              ) : (
                <HeaderMediaUploadField
                  handle={editForm.headerMediaHandle}
                  fileName={editForm.headerMediaName}
                  format={editForm.headerFormat}
                  uploading={uploadingHeader}
                  onUpload={(file) =>
                    onUploadHeaderMedia(file, (handle, name) =>
                      setEditForm((p) =>
                        p
                          ? {
                              ...p,
                              headerMediaHandle: handle,
                              headerMediaName: name,
                            }
                          : null,
                      ),
                    )
                  }
                  onRemove={() =>
                    setEditForm((p) =>
                      p
                        ? { ...p, headerMediaHandle: "", headerMediaName: "" }
                        : null,
                    )
                  }
                />
              )}
            </div>
            {editForm.headerFormat !== "TEXT" &&
              !editForm.headerMediaHandle && (
                <p className="text-[11px] text-amber-500 dark:text-amber-400">
                  ارفع وسيطاً للهيدر — ميتا تتطلب sample media
                </p>
              )}
          </div>

          <div className="space-y-2">
            <Label>محتوى الرسالة *</Label>
            <Textarea
              value={editForm.bodyText}
              onChange={(e) =>
                setEditForm((p) =>
                  p ? { ...p, bodyText: e.target.value } : null,
                )
              }
              className="min-h-[120px]"
            />
          </div>

          <div className="space-y-2">
            <Label>تذييل الرسالة (اختياري)</Label>
            <Input
              value={editForm.footerText}
              onChange={(e) =>
                setEditForm((p) =>
                  p ? { ...p, footerText: e.target.value } : null,
                )
              }
              placeholder="شكراً"
              className="h-11"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>نص الزر (اختياري)</Label>
              <Input
                value={editForm.buttonText}
                onChange={(e) =>
                  setEditForm((p) =>
                    p ? { ...p, buttonText: e.target.value } : null,
                  )
                }
                placeholder="تتبع الطلب"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>رابط الزر (اختياري)</Label>
              <Input
                value={editForm.buttonUrl}
                onChange={(e) =>
                  setEditForm((p) =>
                    p ? { ...p, buttonUrl: e.target.value } : null,
                  )
                }
                placeholder="https://example.com"
                className="h-11"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-medium text-amber-800 dark:text-amber-200">
                التحقق من التوافق مع سياسات Meta
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={onToggleShowCompliance}
            >
              {editShowCompliance ? "إخفاء" : "تشغيل الفحص"}
            </Button>
          </div>
          {editShowCompliance && (
            <div className="mt-2 space-y-1">
              {editComplianceResults.length === 0 ? (
                <p className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="size-3.5" /> لا توجد مشاكل توافق —
                  القالب جاهز للإرسال
                </p>
              ) : (
                editComplianceResults.map((r) => (
                  <p
                    key={r.id}
                    className={`flex items-start gap-1.5 text-[11px] ${
                      r.severity === "error"
                        ? "text-red-600 dark:text-red-400"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {r.severity === "error" ? (
                      <XCircle className="size-3.5 mt-0.5 shrink-0" />
                    ) : (
                      <AlertTriangle className="size-3.5 mt-0.5 shrink-0" />
                    )}
                    <span>{r.message}</span>
                  </p>
                ))
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-95"
          >
            إلغاء
          </Button>
          <Button
            onClick={onSave}
            disabled={editSending}
            className="rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow-md"
          >
            {editSending ? "جاري التحديث..." : "تحديث القالب"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
