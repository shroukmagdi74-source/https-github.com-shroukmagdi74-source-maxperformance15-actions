import React from "react";
import {
  AlertTriangle,
  CheckCircle,
  File,
  Image,
  MessageSquare,
  Plus,
  Shield,
  Video,
  XCircle,
} from "lucide-react";
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

interface MetaTemplateCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  createStep: 1 | 2 | 3;
  setCreateStep: (step: 1 | 2 | 3) => void;
  form: TemplateFormState;
  setForm: React.Dispatch<React.SetStateAction<TemplateFormState>>;
  sanitizedName: string;
  nameValid: boolean;
  headerVarsOk: boolean;
  bodyVarsOk: boolean;
  buttonUrlOk: boolean;
  bodyVars: string[];
  varValues: Record<string, string>;
  setVarValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  previewText: string;
  complianceResults: ComplianceResult[];
  showCompliance: boolean;
  setShowCompliance: (show: boolean) => void;
  uploadingHeader: boolean;
  onUploadHeaderMedia: (
    file: File,
    apply: (handle: string, name: string) => void,
  ) => void;
  insertBodyVariable: () => void;
  sending: boolean;
  onCreate: () => void;
  onClose: () => void;
}

export const MetaTemplateCreateDialog: React.FC<MetaTemplateCreateDialogProps> = ({
  open,
  onOpenChange,
  createStep,
  setCreateStep,
  form,
  setForm,
  sanitizedName,
  nameValid,
  headerVarsOk,
  bodyVarsOk,
  buttonUrlOk,
  bodyVars,
  varValues,
  setVarValues,
  previewText,
  complianceResults,
  showCompliance,
  setShowCompliance,
  uploadingHeader,
  onUploadHeaderMedia,
  insertBodyVariable,
  sending,
  onCreate,
  onClose,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto max-w-xl sm:rounded-3xl">
        <DialogHeader>
          <DialogTitle>قالب جديد</DialogTitle>
          <DialogDescription>
            أنشئ قالب رسالة جديد في Meta Cloud API. بعد الإنشاء، يمر القالب
            بمراجعة من ميتا.
          </DialogDescription>
        </DialogHeader>

        {/* Stepper Progress Bar */}
        <div
          className="mb-6 flex items-center gap-2"
          role="group"
          aria-label="مراحل إنشاء القالب"
        >
          {[
            { step: 1, label: "المعلومات الأساسية" },
            { step: 2, label: "المحتوى" },
            { step: 3, label: "المراجعة" },
          ].map((s, i) => (
            <React.Fragment key={s.step}>
              {i > 0 && (
                <div
                  className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
                    createStep >= s.step
                      ? "bg-[color:var(--color-primary)]"
                      : "bg-[color:var(--shell-control-border)]"
                  }`}
                />
              )}
              <button
                type="button"
                onClick={() => setCreateStep(s.step as 1 | 2 | 3)}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-[1.03] active:scale-95 ${
                  createStep === s.step
                    ? "bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] shadow-sm"
                    : "bg-[var(--color-muted)] text-[color:var(--color-muted-foreground)] hover:bg-[var(--shell-overlay-bg)]"
                }`}
              >
                <span
                  className={`flex size-5 items-center justify-center rounded-full text-[10px] font-bold transition-transform duration-200 ${
                    createStep === s.step
                      ? "bg-white/20 scale-110"
                      : "bg-[var(--color-muted-foreground)]/10"
                  }`}
                >
                  {createStep > s.step ? "✓" : s.step}
                </span>
                {s.label}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {createStep === 1 && (
          <div className="space-y-4 animate-[fadeIn_0.25s_ease-out]">
            <div className="space-y-2">
              <Label>اسم القالب</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="مثال: payment_request"
                className="h-11 font-mono"
                dir="ltr"
              />
              {form.name && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[color:var(--color-muted-foreground)]">
                    الاسم في Meta:
                  </span>
                  <code
                    className={`rounded-md px-2 py-0.5 font-mono ${
                      nameValid
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : "bg-red-500/10 text-red-700 dark:text-red-300"
                    }`}
                  >
                    {sanitizedName || "(غير صالح)"}
                  </code>
                </div>
              )}
              <p className="text-[11px] text-[color:var(--color-muted-foreground)]">
                أحرف إنجليزية صغيرة وأرقام و _ فقط. الأحرف العربية والمسافات
                تُحوَّل تلقائياً.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>اللغة</Label>
                <Select
                  value={form.language}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, language: v ?? "" }))
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
                <Label>التصنيف</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, category: v ?? "" }))
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
            </div>
            <div className="space-y-2">
              <Label>رأس الرسالة (اختياري)</Label>
              {form.category === "AUTHENTICATION" ? (
                <div className="rounded-xl border border-violet-200 bg-violet-50/70 p-3 text-xs text-violet-800 dark:border-violet-900/40 dark:bg-violet-950/20 dark:text-violet-300">
                  قوالب المصادقة الأمنيّة (AUTHENTICATION) تتبع معيار Meta
                  الموحد: لا تدعم رأس الرسالة المخصص.
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <Select
                      value={form.headerFormat}
                      onValueChange={(v) =>
                        setForm((p) => ({ ...p, headerFormat: v ?? "" }))
                      }
                    >
                      <SelectTrigger className="h-11 w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TEXT">
                          <MessageSquare className="ml-1 size-3.5 inline" /> TEXT
                        </SelectItem>
                        <SelectItem value="IMAGE">
                          <Image className="ml-1 size-3.5 inline" /> IMAGE
                        </SelectItem>
                        <SelectItem value="VIDEO">
                          <Video className="ml-1 size-3.5 inline" /> VIDEO
                        </SelectItem>
                        <SelectItem value="DOCUMENT">
                          <File className="ml-1 size-3.5 inline" /> DOCUMENT
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {form.headerFormat === "TEXT" && (
                      <Input
                        value={form.headerText}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, headerText: e.target.value }))
                        }
                        placeholder="السلام عليكم يا {{1}}"
                        maxLength={60}
                        className="h-11 flex-1"
                      />
                    )}
                    {form.headerFormat !== "TEXT" && (
                      <HeaderMediaUploadField
                        handle={form.headerMediaHandle}
                        fileName={form.headerMediaName}
                        format={form.headerFormat}
                        uploading={uploadingHeader}
                        onUpload={(file) =>
                          onUploadHeaderMedia(file, (handle, name) =>
                            setForm((p) => ({
                              ...p,
                              headerMediaHandle: handle,
                              headerMediaName: name,
                            })),
                          )
                        }
                        onRemove={() =>
                          setForm((p) => ({
                            ...p,
                            headerMediaHandle: "",
                            headerMediaName: "",
                          }))
                        }
                      />
                    )}
                  </div>
                  {form.headerFormat !== "TEXT" && !form.headerMediaHandle && (
                    <p className="text-[11px] text-amber-500 dark:text-amber-400">
                      ارفع وسيطاً (صورة/فيديو/مستند) — ميتا تتطلب sample media
                      في الهيدر لاعتماد القالب
                    </p>
                  )}
                  {form.headerText && !headerVarsOk && (
                    <p className="text-[11px] text-red-500 dark:text-red-400">
                      استخدم متغيرات مرقمة: {"{{1}}"} بدلاً من {"{{name}}"}.
                      Meta لا يقبل أسماء متغيرات.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Content */}
        {createStep === 2 && (
          <div className="space-y-4 animate-[fadeIn_0.25s_ease-out]">
            {form.category === "AUTHENTICATION" ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-violet-200 bg-violet-50/80 p-4 text-xs text-violet-900 dark:border-violet-800 dark:bg-violet-950/30 dark:text-violet-200">
                  <p className="font-semibold text-sm flex items-center gap-1.5 mb-1.5">
                    <Shield className="size-4" /> مواصفات قوالب التحقق
                    والمصادقة (Meta Standard OTP):
                  </p>
                  <ul className="space-y-1.5 text-xs leading-5 list-disc list-inside">
                    <li>
                      يتم توليد محتوى الرسالة وتوصيات الأمان تلقائياً بواسطة
                      Meta لمنع التلاعب وتأمين الحسابات.
                    </li>
                    <li>
                      صلاحية الرمز محددة بـ <strong>10 دقائق</strong> ويتم
                      توضيحها للمستخدم داخل الرسالة.
                    </li>
                    <li>
                      الزر من نوع <strong>نسخ الرمز (Copy Code)</strong> بنقرة
                      واحدة لسهولة إدخاله في التطبيق.
                    </li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <Label>نص زر نسخ الكود (OTP Button Label)</Label>
                  <Input
                    value={form.buttonText}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, buttonText: e.target.value }))
                    }
                    placeholder={
                      form.language === "ar" ? "نسخ الرمز" : "Copy Code"
                    }
                    className="h-11"
                  />
                  <p className="text-[11px] text-[color:var(--color-muted-foreground)]">
                    اتركه فارغاً للاستخدام الافتراضي المعتمد (
                    {form.language === "ar" ? "نسخ الرمز" : "Copy Code"}).
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label>محتوى الرسالة *</Label>
                    <span
                      className={`text-[11px] tabular-nums font-mono ${
                        form.bodyText.length > 1024
                          ? "text-red-500"
                          : "text-[color:var(--color-muted-foreground)]"
                      }`}
                    >
                      {form.bodyText.length}/1024
                    </span>
                  </div>
                  <Textarea
                    value={form.bodyText}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, bodyText: e.target.value }))
                    }
                    placeholder={"مرحباً {{1}}\nطلبك رقم {{2}} جاهز للاستلام."}
                    maxLength={1024}
                    className="min-h-[140px]"
                  />
                  {form.bodyText && !bodyVarsOk && (
                    <p className="text-[11px] text-red-500 dark:text-red-400">
                      استخدم متغيرات مرقمة: {"{{1}}"}, {"{{2}}"} بدلاً من
                      أسماء. Meta يتطلب ترقيم المتغيرات.
                    </p>
                  )}
                </div>

                {/* Variable chips */}
                <div className="space-y-2 rounded-2xl border border-[color:var(--shell-control-border)] bg-[var(--color-muted)] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[color:var(--color-foreground)]">
                        المتغيرات
                      </p>
                      <p className="text-[11px] text-[color:var(--color-muted-foreground)]">
                        كل {"{{n}}"} بيتحوّل لقيمة العميل وقت الإرسال.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 shrink-0 rounded-full text-xs"
                      onClick={insertBodyVariable}
                    >
                      <Plus className="ml-1 size-3.5" /> إضافة متغير
                    </Button>
                  </div>

                  {bodyVars.length === 0 ? (
                    <p className="text-[11px] text-[color:var(--color-muted-foreground)]">
                      مفيش متغيرات لحد دلوقتي — اضغط «إضافة متغير» لإدراج{" "}
                      {"{{1}}"} ثم {"{{2}}"} … حسب ترتيب الظهور.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="space-y-1.5">
                        {bodyVars.map((v) => {
                          const key = v.replace(/\D/g, "");
                          return (
                            <div key={key} className="flex items-center gap-2">
                              <code className="w-12 shrink-0 rounded-md bg-[var(--shell-overlay-bg)] px-1.5 py-0.5 text-center font-mono text-[11px] text-[color:var(--color-muted-foreground)]">
                                {v}
                              </code>
                              <Input
                                value={varValues[key] || ""}
                                onChange={(e) =>
                                  setVarValues((p) => ({
                                    ...p,
                                    [key]: e.target.value,
                                  }))
                                }
                                placeholder="قيمة تجريبية (تظهر لمراجعة ميتا)"
                                className="h-8 flex-1 text-xs"
                              />
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-[11px] text-[color:var(--color-muted-foreground)]">
                        القيم دي للمراجعة فقط — القيم الحقيقية بتتحدد وقت
                        الإرسال.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label>تذييل الرسالة (اختياري)</Label>
                    <span
                      className={`text-[11px] tabular-nums font-mono ${
                        form.footerText.length > 60
                          ? "text-red-500"
                          : "text-[color:var(--color-muted-foreground)]"
                      }`}
                    >
                      {form.footerText.length}/60
                    </span>
                  </div>
                  <Input
                    value={form.footerText}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, footerText: e.target.value }))
                    }
                    placeholder="شكراً لاختيارك متجرنا"
                    maxLength={60}
                    className="h-11"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>نص الزر (اختياري)</Label>
                    <Input
                      value={form.buttonText}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, buttonText: e.target.value }))
                      }
                      placeholder="تتبع الطلب"
                      maxLength={25}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>رابط الزر (اختياري)</Label>
                    <Input
                      value={form.buttonUrl}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, buttonUrl: e.target.value }))
                      }
                      placeholder="https://example.com/track"
                      className="h-11"
                      dir="ltr"
                    />
                    {form.buttonUrl && !buttonUrlOk && (
                      <p className="text-[11px] text-red-500 dark:text-red-400">
                        الرابط يجب أن يبدأ بـ https://
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 3: Review */}
        {createStep === 3 && (
          <div className="space-y-4 animate-[fadeIn_0.25s_ease-out]">
            <div className="rounded-2xl border border-[color:var(--shell-control-border)] bg-[var(--whatsapp-surface-muted)] p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[color:var(--color-muted-foreground)]">
                معاينة حية
              </p>
              <div className="wa-bubble rounded-2xl bg-[#d9fdd3] px-4 py-3 shadow-sm dark:bg-[var(--whatsapp-message-outgoing)]">
                <p className="whitespace-pre-wrap text-[0.95rem] leading-7 text-[color:var(--color-foreground)]">
                  {previewText || "(لا يوجد محتوى)"}
                </p>
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
                  onClick={() => setShowCompliance(!showCompliance)}
                >
                  {showCompliance ? "إخفاء" : "تشغيل الفحص"}
                </Button>
              </div>
              {showCompliance && (
                <div className="mt-2 space-y-1">
                  {complianceResults.length === 0 ? (
                    <p className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                      <CheckCircle className="size-3.5" /> لا توجد مشاكل توافق —
                      القالب جاهز للإرسال
                    </p>
                  ) : (
                    complianceResults.map((r) => (
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
          </div>
        )}

        <DialogFooter className="gap-2">
          {createStep > 1 && (
            <Button
              variant="outline"
              onClick={() => setCreateStep((createStep - 1) as 1 | 2 | 3)}
              className="rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-95"
            >
              السابق
            </Button>
          )}
          <div className="flex-1" />
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-95"
          >
            إلغاء
          </Button>
          {createStep < 3 ? (
            <Button
              onClick={() => setCreateStep((createStep + 1) as 1 | 2 | 3)}
              className="rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow-md"
            >
              التالي
            </Button>
          ) : (
            <Button
              onClick={onCreate}
              disabled={sending}
              className="rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow-md"
            >
              {sending ? "جاري الإنشاء..." : "إنشاء القالب"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
