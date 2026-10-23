import React from "react";
import {
  CheckCircle,
  Clock,
  Cloud,
  Edit,
  ExternalLink,
  Eye,
  FileText,
  Send,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChannelBadge } from "./ChannelBadge";
import { TemplateMetric } from "./TemplateMetric";
import {
  Template,
  categoryBadgeClasses,
  EVENT_TRIGGERS,
} from "./types";

interface TemplateCardsGridProps {
  templates: Template[];
  eventLabels: Record<string, string>;
  categoryLabels: Record<string, string>;
  selectedMetaSession: string;
  publishingId: string | null;
  onPublishToMeta: (id: string) => void;
  onEditTemplate: (template: Template) => void;
  onOpenStatusTemplates: () => void;
  onResetFilters: () => void;
  isArabic: boolean;
}

export const TemplateCardsGrid: React.FC<TemplateCardsGridProps> = ({
  templates,
  eventLabels,
  categoryLabels,
  selectedMetaSession,
  publishingId,
  onPublishToMeta,
  onEditTemplate,
  onOpenStatusTemplates,
  onResetFilters,
  isArabic,
}) => {
  if (templates.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-[color:var(--shell-control-border)] bg-[color:var(--color-muted)] px-6 py-12 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-[color:var(--color-primary)]">
          <FileText className="size-7" />
        </div>
        <div className="mt-4 space-y-2">
          <h3 className="text-lg font-semibold text-[color:var(--color-foreground)]">
            {isArabic ? "لا توجد قوالب مطابقة" : "No matching templates"}
          </h3>
          <p className="text-sm text-[color:var(--color-muted-foreground)]">
            {isArabic
              ? "جرّب تغيير كلمة البحث أو إعادة ضبط التصنيف الحالي."
              : "Try adjusting the search term or clearing the active category filter."}
          </p>
          <Button
            variant="outline"
            className="mt-2 rounded-full border-[color:var(--shell-control-border)] bg-[color:var(--color-card)] hover:brightness-95"
            onClick={onResetFilters}
          >
            {isArabic ? "إعادة ضبط الفلاتر" : "Reset filters"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
      {templates.map((template) => {
        const itemKey = template.id ?? template.eventType;
        const eventTitle =
          template.name ||
          eventLabels[template.eventType] ||
          template.eventType;
        const categoryLabel =
          categoryLabels[template.category] || template.category;
        const triggerText = EVENT_TRIGGERS[template.eventType];

        return (
          <div
            key={itemKey}
            className="flex h-full flex-col rounded-3xl border border-[color:var(--shell-control-border)] bg-[color:var(--color-card)] p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <h3 className="text-base font-semibold leading-7 text-[color:var(--color-foreground)]">
                  {eventTitle}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className={
                      categoryBadgeClasses[template.category] ||
                      categoryBadgeClasses.SYSTEM
                    }
                  >
                    {categoryLabel}
                  </Badge>
                  <ChannelBadge channel={template.channel} isArabic={isArabic} />
                  {template.isDefault && !template.id ? (
                    <Badge
                      variant="outline"
                      className="rounded-full border-dashed border-[color:var(--shell-control-border)] bg-[color:var(--color-muted)] text-[color:var(--color-muted-foreground)]"
                    >
                      {isArabic ? "نظامي" : "System"}
                    </Badge>
                  ) : null}
                  <Badge
                    variant="outline"
                    className={
                      template.isActive !== false
                        ? "border-emerald-300/70 bg-emerald-500/10 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/[0.08] dark:text-emerald-200"
                        : "border-slate-300/70 bg-slate-500/10 text-slate-700 dark:border-slate-500/40 dark:bg-slate-500/[0.08] dark:text-slate-300"
                    }
                  >
                    {template.isActive !== false
                      ? isArabic
                        ? "نشط"
                        : "Active"
                      : isArabic
                        ? "معطل"
                        : "Disabled"}
                  </Badge>
                </div>
                {triggerText ? (
                  <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-[color:var(--color-muted)] px-2.5 py-1 text-xs text-[color:var(--color-muted-foreground)]">
                    <Clock className="size-3.5 shrink-0 text-amber-500" />
                    <span className="font-medium text-[color:var(--color-foreground)]">
                      {isArabic ? "التشغيل:" : "Trigger:"}
                    </span>
                    <span className="truncate">{triggerText}</span>
                  </div>
                ) : null}
              </div>

              <div className="flex gap-1 shrink-0">
                {template.metaTemplateName ? (
                  <Badge
                    variant="outline"
                    className={
                      template.metaTemplateStatus === "APPROVED"
                        ? "border-emerald-300/70 bg-emerald-500/10 text-emerald-800"
                        : template.metaTemplateStatus === "REJECTED"
                          ? "border-red-300/70 bg-red-500/10 text-red-800"
                          : "border-amber-300/70 bg-amber-500/10 text-amber-800"
                    }
                  >
                    <Cloud className="size-3 me-1" />
                    {template.metaTemplateStatus === "APPROVED"
                      ? isArabic
                        ? "على ميتا"
                        : "On Meta"
                      : template.metaTemplateStatus === "REJECTED"
                        ? isArabic
                          ? "مرفوض"
                          : "Rejected"
                        : template.metaTemplateStatus === "PENDING"
                          ? isArabic
                            ? "قيد المراجعة"
                            : "Pending"
                          : template.metaTemplateStatus ||
                            (isArabic ? "منشور" : "Published")}
                  </Badge>
                ) : null}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full bg-primary/6 text-[color:var(--color-primary)] hover:bg-primary/12"
                  onClick={() => onEditTemplate(template)}
                  aria-label={isArabic ? "تعديل القالب" : "Edit template"}
                >
                  <Edit className="size-4" />
                </Button>
              </div>
            </div>

            {template.category === "ORDERS" ? (
              <div className="mt-3 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 text-xs text-sky-700 border-sky-300/70 hover:bg-sky-50 dark:text-sky-300 dark:border-sky-500/40"
                  onClick={onOpenStatusTemplates}
                >
                  <ExternalLink className="size-3" />
                  {isArabic ? "فتح في قوالب الحالات" : "Manage in status templates"}
                </Button>
              </div>
            ) : template.metaTemplateName &&
              template.metaTemplateStatus !== "APPROVED" ? null : (
              <div className="mt-3 flex items-center gap-2">
                {!selectedMetaSession ? (
                  <p className="text-xs text-muted-foreground">
                    {isArabic
                      ? "لا توجد جلسة ميتا متاحة"
                      : "No Meta session available"}
                  </p>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    disabled={publishingId === template.id}
                    onClick={() => {
                      if (template.id) {
                        onPublishToMeta(template.id);
                      }
                    }}
                  >
                    <Cloud className="size-3" />
                    {publishingId === template.id
                      ? isArabic
                        ? "جاري النشر..."
                        : "Publishing..."
                      : template.metaTemplateName
                        ? isArabic
                          ? "إعادة النشر"
                          : "Re-publish"
                        : isArabic
                          ? "نشر على ميتا"
                          : "Publish to Meta"}
                  </Button>
                )}
              </div>
            )}

            <div className="mt-4 rounded-2xl border border-emerald-200/80 bg-emerald-500/10 px-4 py-4 dark:border-emerald-500/40 dark:bg-emerald-500/[0.08]">
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-emerald-800 dark:text-emerald-200">
                {isArabic ? "محتوى الرسالة" : "Message preview"}
              </p>
              <p className="line-clamp-5 whitespace-pre-wrap text-sm leading-7 text-emerald-950 dark:text-emerald-100">
                {template.content}
              </p>
            </div>

            <div className="mt-4 flex items-center rounded-xl border border-[color:var(--shell-control-border)] bg-[color:color-mix(in_srgb,var(--color-background)_86%,white)] px-2 py-2">
              <TemplateMetric
                icon={Send}
                label={isArabic ? "مرسل" : "Sent"}
                value={
                  template.sentCount != null && template.sentCount > 0
                    ? template.sentCount
                    : "—"
                }
                colorClass="text-[color:var(--color-muted-foreground)]"
              />
              <Separator orientation="vertical" className="mx-1 h-6" />
              <TemplateMetric
                icon={CheckCircle}
                label={isArabic ? "مستلم" : "Delivered"}
                value={
                  template.deliveredCount != null && template.deliveredCount > 0
                    ? template.deliveredCount
                    : "—"
                }
                colorClass="text-emerald-600 dark:text-emerald-400"
              />
              <Separator orientation="vertical" className="mx-1 h-6" />
              <TemplateMetric
                icon={Eye}
                label={isArabic ? "مقروء" : "Read"}
                value={
                  template.readCount != null && template.readCount > 0
                    ? template.readCount
                    : "—"
                }
                colorClass="text-sky-600 dark:text-sky-400"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
