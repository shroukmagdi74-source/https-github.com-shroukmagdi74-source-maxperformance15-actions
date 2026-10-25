import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Eye, Plus, Save, Sparkles } from "lucide-react";
import { buildMessagingPreset, CADENCE_OPTIONS } from "../catalog";
import { WorkReportField, WorkReportTemplateDraft } from "../types";

export const BuilderBadge: React.FC<{ label: string; tone?: string }> = ({
  label,
  tone = "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300",
}) => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${tone}`}
  >
    {label}
  </span>
);

interface WorkReportFormHeaderProps {
  isEditing: boolean;
  formId?: string;
  title: string;
  saving: boolean;
  onApplyPreset: (draft: WorkReportTemplateDraft) => void;
  onSave: () => void;
}

export const WorkReportFormHeader: React.FC<WorkReportFormHeaderProps> = ({
  isEditing,
  formId,
  title,
  saving,
  onApplyPreset,
  onSave,
}) => {
  return (
    <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-3">
        <Link
          to="/hr/reporting/forms"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          العودة لفورمات التقارير
        </Link>
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {isEditing ? "تعديل فورم" : "إنشاء فورم جديد"}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            {isEditing ? title || "تعديل الفورم" : "بناء فورم التقرير"}
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            حدّد بيانات تُسحب من النظام، وبيانات يكتبها الموظف، وأخرى تتحسب
            تلقائيًا. النتيجة النهائية ستظهر في شاشة التعبئة وسجلات التحليل.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => onApplyPreset(buildMessagingPreset())}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700"
        >
          <Sparkles className="h-4 w-4" />
          تحميل قالب فريق الرد
        </button>
        {isEditing && formId ? (
          <Link
            to={`/hr/reporting/forms/${formId}/preview`}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700"
          >
            <Eye className="h-4 w-4" />
            معاينة
          </Link>
        ) : null}
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
        >
          <Save className="h-4 w-4" />
          {saving ? "جاري الحفظ..." : "حفظ الفورم"}
        </button>
      </div>
    </div>
  );
};

interface WorkReportMetadataCardProps {
  formState: WorkReportTemplateDraft;
  onChange: React.Dispatch<React.SetStateAction<WorkReportTemplateDraft>>;
  onAddField: (sourceType: WorkReportField["sourceType"]) => void;
}

export const WorkReportMetadataCard: React.FC<WorkReportMetadataCardProps> = ({
  formState,
  onChange,
  onAddField,
}) => {
  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              اسم الفورم
            </label>
            <input
              value={formState.title}
              onChange={(event) =>
                onChange((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-500"
              placeholder="مثال: تقرير يومي - فريق خدمة العملاء"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              دورة التقرير
            </label>
            <select
              value={formState.cadence}
              onChange={(event) =>
                onChange((current) => ({
                  ...current,
                  cadence: event.target
                    .value as WorkReportTemplateDraft["cadence"],
                }))
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-500"
            >
              {CADENCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            وصف مختصر
          </label>
          <textarea
            value={formState.description}
            onChange={(event) =>
              onChange((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-500"
            placeholder="اشرح الغرض من التقرير ومن الذي سيستخدمه."
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-6">
          <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={formState.isActive}
              onChange={(event) =>
                onChange((current) => ({
                  ...current,
                  isActive: event.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-slate-300"
            />
            الفورم مفعل
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={formState.allowMultipleSubmissions}
              onChange={(event) =>
                onChange((current) => ({
                  ...current,
                  allowMultipleSubmissions: event.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-slate-300"
            />
            السماح بأكثر من إرسال لنفس الفترة
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => onAddField("MANUAL")}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700"
        >
          <Plus className="h-4 w-4" />
          إضافة حقل يدوي
        </button>
        <button
          type="button"
          onClick={() => onAddField("SYSTEM")}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700"
        >
          <Plus className="h-4 w-4" />
          إضافة حقل من النظام
        </button>
        <button
          type="button"
          onClick={() => onAddField("CALCULATED")}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700"
        >
          <Plus className="h-4 w-4" />
          إضافة حقل حسابي
        </button>
      </div>
    </>
  );
};
