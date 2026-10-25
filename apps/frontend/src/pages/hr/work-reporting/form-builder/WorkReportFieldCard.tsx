import React from "react";
import {
  ChevronDown,
  ChevronUp,
  CopyPlus,
  GripVertical,
  Trash2,
} from "lucide-react";
import {
  DATA_TYPE_OPTIONS,
  FIELD_SOURCE_OPTIONS,
  SYSTEM_FIELD_OPTIONS,
} from "../catalog";
import { slugifyFieldKey } from "../utils";
import { WorkReportField, WorkReportFieldDataType } from "../types";
import { BuilderBadge } from "./WorkReportFormHeaderAndMeta";
import { WorkReportFieldSourceDetails } from "./WorkReportFieldSourceDetails";

interface WorkReportFieldCardProps {
  field: WorkReportField;
  index: number;
  onUpdateField: (
    index: number,
    updater: (field: WorkReportField) => WorkReportField
  ) => void;
  onMoveField: (index: number, direction: -1 | 1) => void;
  onDuplicateField: (index: number) => void;
  onRemoveField: (index: number) => void;
}

export const WorkReportFieldCard: React.FC<WorkReportFieldCardProps> = ({
  field,
  index,
  onUpdateField,
  onMoveField,
  onDuplicateField,
  onRemoveField,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <GripVertical className="h-4 w-4" />
          </span>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-medium">
                {field.label || `حقل ${index + 1}`}
              </h3>
              <BuilderBadge
                label={
                  FIELD_SOURCE_OPTIONS.find(
                    (item) => item.value === field.sourceType
                  )?.label || field.sourceType
                }
              />
              <BuilderBadge
                label={
                  DATA_TYPE_OPTIONS.find(
                    (item) => item.value === field.dataType
                  )?.label || field.dataType
                }
              />
              {!field.isVisible ? (
                <BuilderBadge
                  label="مخفي"
                  tone="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300"
                />
              ) : null}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              المفتاح البرمجي:{" "}
              <span className="font-mono">{field.key || "—"}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onMoveField(index, -1)}
            aria-label="تحريك لأعلى"
            className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600"
            title="تحريك لأعلى"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onMoveField(index, 1)}
            aria-label="تحريك لأسفل"
            className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600"
            title="تحريك لأسفل"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDuplicateField(index)}
            aria-label="نسخ الحقل"
            className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600"
            title="نسخ الحقل"
          >
            <CopyPlus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onRemoveField(index)}
            aria-label="حذف الحقل"
            className="rounded-xl border border-rose-200 p-2 text-rose-700 transition hover:border-rose-300 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/30"
            title="حذف الحقل"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            اسم الحقل
          </label>
          <input
            value={field.label}
            onChange={(event) =>
              onUpdateField(index, (current) => ({
                ...current,
                label: event.target.value,
                key:
                  !current.key || current.key.startsWith("field_")
                    ? slugifyFieldKey(event.target.value) || current.key
                    : current.key,
              }))
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-500"
            placeholder="مثال: عدد الرسائل"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            المفتاح البرمجي
          </label>
          <input
            value={field.key}
            onChange={(event) =>
              onUpdateField(index, (current) => ({
                ...current,
                key: slugifyFieldKey(event.target.value),
              }))
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-mono outline-none transition focus:border-slate-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-500"
            placeholder="orders_count"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            نوع المصدر
          </label>
          <select
            value={field.sourceType}
            onChange={(event) =>
              onUpdateField(index, (current) => {
                const nextSource = event.target
                  .value as WorkReportField["sourceType"];
                const nextState: WorkReportField = {
                  ...current,
                  sourceType: nextSource,
                };

                if (nextSource === "SYSTEM") {
                  const defaultSystem = SYSTEM_FIELD_OPTIONS[0];
                  nextState.systemKey = defaultSystem?.key || null;
                  nextState.dataType = defaultSystem?.dataType || "TEXT";
                  nextState.formula = null;
                } else if (nextSource === "CALCULATED") {
                  nextState.systemKey = null;
                  nextState.formula = current.formula || "";
                  nextState.dataType =
                    current.dataType === "TEXT" ||
                    current.dataType === "LONG_TEXT"
                      ? "NUMBER"
                      : current.dataType;
                } else {
                  nextState.systemKey = null;
                  nextState.formula = null;
                }

                return nextState;
              })
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-500"
          >
            {FIELD_SOURCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            نوع البيانات
          </label>
          <select
            value={field.dataType}
            disabled={field.sourceType === "SYSTEM"}
            onChange={(event) =>
              onUpdateField(index, (current) => ({
                ...current,
                dataType: event.target.value as WorkReportFieldDataType,
                options:
                  event.target.value === "SELECT" ? current.options : [],
              }))
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-500"
          >
            {DATA_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            وصف أو ملاحظة مساعدة
          </label>
          <input
            value={field.helpText || ""}
            onChange={(event) =>
              onUpdateField(index, (current) => ({
                ...current,
                helpText: event.target.value,
              }))
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-500"
            placeholder="نص مساعد يظهر للموظف أو المدير."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Placeholder
          </label>
          <input
            value={field.placeholder || ""}
            onChange={(event) =>
              onUpdateField(index, (current) => ({
                ...current,
                placeholder: event.target.value,
              }))
            }
            disabled={field.sourceType !== "MANUAL"}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-500"
            placeholder="نص يظهر داخل الحقل للموظف."
          />
        </div>
      </div>

      <WorkReportFieldSourceDetails
        field={field}
        index={index}
        onUpdateField={onUpdateField}
      />
    </div>
  );
};
