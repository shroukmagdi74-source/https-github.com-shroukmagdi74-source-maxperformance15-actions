import React from "react";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MetaTemplateTableEmptyStateProps {
  selectedSessionId: string;
  onOpenCreate: () => void;
  onOpenLibrary: () => void;
}

export const MetaTemplateTableEmptyState: React.FC<
  MetaTemplateTableEmptyStateProps
> = ({ selectedSessionId, onOpenCreate, onOpenLibrary }) => {
  return (
    <div className="flex flex-col items-center gap-5 py-16 text-center">
      <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-inner dark:from-emerald-950/40 dark:to-emerald-900/20">
        <FileText className="size-10 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div className="space-y-1">
        <p className="text-base font-semibold text-[color:var(--color-foreground)]">
          {selectedSessionId ? "لا توجد قوالب بعد" : "اختر جلسة أولاً"}
        </p>
        <p className="mx-auto max-w-sm text-xs leading-relaxed text-[color:var(--color-muted-foreground)]">
          {selectedSessionId
            ? "القوالب هي رسائل معتمدة من Meta تقدر تبعت بيها حملات واتساب. ابدأ بإنشاء أول قالب أو اختار من المكتبة الجاهزة."
            : "اختر جلسة واتساب من القائمة أعلاه لعرض القوالب المسجلة في Meta Cloud API."}
        </p>
      </div>
      {selectedSessionId ? (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <Button
            onClick={onOpenCreate}
            className="h-10 rounded-full px-5 text-sm font-semibold shadow-sm hover:shadow-md"
          >
            <Plus className="size-4" /> أنشئ أول قالب
          </Button>
          <Button
            variant="outline"
            onClick={onOpenLibrary}
            className="h-10 rounded-full"
          >
            <FileText className="size-4" /> تصفّح المكتبة الجاهزة
          </Button>
        </div>
      ) : null}
    </div>
  );
};
