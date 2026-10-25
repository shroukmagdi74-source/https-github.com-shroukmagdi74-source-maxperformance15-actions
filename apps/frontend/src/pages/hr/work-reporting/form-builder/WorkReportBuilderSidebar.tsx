import React from "react";
import { SYSTEM_FIELD_OPTIONS } from "../catalog";
import { BuilderBadge } from "./WorkReportFormHeaderAndMeta";

interface WorkReportBuilderSidebarProps {
  totalFields: number;
  visibleCounts: {
    SYSTEM: number;
    MANUAL: number;
    CALCULATED: number;
  };
}

export const WorkReportBuilderSidebar: React.FC<
  WorkReportBuilderSidebarProps
> = ({ totalFields, visibleCounts }) => {
  return (
    <aside className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-semibold">ملخص سريع</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-950">
            <span className="text-slate-500 dark:text-slate-400">
              إجمالي الحقول
            </span>
            <strong className="font-mono tabular-nums">{totalFields}</strong>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-950">
            <span className="text-slate-500 dark:text-slate-400">
              من النظام
            </span>
            <strong className="font-mono tabular-nums">
              {visibleCounts.SYSTEM}
            </strong>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-950">
            <span className="text-slate-500 dark:text-slate-400">يدوي</span>
            <strong className="font-mono tabular-nums">
              {visibleCounts.MANUAL}
            </strong>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-950">
            <span className="text-slate-500 dark:text-slate-400">حسابي</span>
            <strong className="font-mono tabular-nums">
              {visibleCounts.CALCULATED}
            </strong>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-semibold">مصادر جاهزة من النظام</h2>
        <div className="space-y-3">
          {SYSTEM_FIELD_OPTIONS.map((option) => (
            <div
              key={option.key}
              className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <strong className="text-sm">{option.label}</strong>
                <BuilderBadge label={option.dataType} />
              </div>
              <p className="text-xs leading-6 text-slate-500 dark:text-slate-400">
                {option.description}
              </p>
              <p className="mt-2 text-[11px] font-mono text-slate-400 dark:text-slate-500">
                {option.key}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-lg font-semibold">ملاحظات مهمة</h2>
        <ul className="space-y-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
          <li>
            الحقول المخفية يمكن استخدامها في التحليل حتى لو لم تظهر للموظف.
          </li>
          <li>المعادلات الحسابية تعتمد على مفاتيح الحقول وليس على العنوان.</li>
          <li>الحقول الرقمية أسهل بكثير في التحليل وعرض الرسوم لاحقًا.</li>
        </ul>
      </div>
    </aside>
  );
};
