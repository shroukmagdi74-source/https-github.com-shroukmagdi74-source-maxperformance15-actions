import React from "react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

export const TurboTicketEmptyState: React.FC = () => {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-zinc-50/50 dark:bg-zinc-950/40 relative">
      <div className="max-w-md w-full space-y-4">
        <div className="size-12 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs text-foreground mx-auto flex items-center justify-center">
          <DocumentTextIcon className="size-6 text-zinc-500" />
        </div>
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-2">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span>Turbo Sync Connected</span>
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            مركز تذاكر ومحادثات الشحن
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mt-1">
            اختر تذكرة من القائمة الجانبية لمتابعة تفاصيل الشحنة والمحادثة الحية مع عمليات شركة تربو، أو اضغط لفتح تذكرة جديدة.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
          <span className="font-mono text-[11px] px-2 py-1 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 shadow-2xs">
            شكاوى الشحنات
          </span>
          <span className="font-mono text-[11px] px-2 py-1 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 shadow-2xs">
            المعاملات المالية
          </span>
          <span className="font-mono text-[11px] px-2 py-1 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 shadow-2xs">
            استفسارات عامة
          </span>
        </div>
      </div>
    </main>
  );
};
