import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Eye, Pencil, Trash2, Users, FileCheck2 } from 'lucide-react';
import { Occasion, RECURRENCE_LABEL, STATUS_META } from './types';

interface CustomerOccasionsCardProps {
  occasion: Occasion;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const CustomerOccasionsCard: React.FC<CustomerOccasionsCardProps> = ({
  occasion: o,
  onView,
  onEdit,
  onDelete,
}) => {
  const status = STATUS_META[o.status] || STATUS_META.draft;
  const isUpcoming = new Date(o.scheduledAt).getTime() > Date.now();

  return (
    <div className="group flex flex-col justify-between rounded-lg border border-border/50 bg-card p-4 transition-colors hover:border-border">
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground line-clamp-1">{o.name}</h3>
          <Badge variant="outline" className={`shrink-0 text-[10px] font-medium px-2 py-0.5 ${status.cls}`}>
            {status.label}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span className="tabular-nums font-mono">
              {new Date(o.scheduledAt).toLocaleDateString('ar-EG', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            {isUpcoming && <span className="text-primary font-medium">· قادمة</span>}
          </span>
          <span className="text-muted-foreground/80">{RECURRENCE_LABEL[o.recurrence] || o.recurrence}</span>
          {o.metaTemplateName && (
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <FileCheck2 className="h-3 w-3" />
              قالب معتمد
            </span>
          )}
        </div>

        <p className="line-clamp-2 min-h-[2.5rem] text-xs text-muted-foreground leading-relaxed">
          {o.message}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-border/40 pt-3 mt-3">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span className="tabular-nums font-mono">{(o.totalSent || 0).toLocaleString('ar-EG')}</span>
          <span>رسالة مرسلة</span>
        </span>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onView}
            className="h-7 w-7 rounded-md"
            aria-label="عرض تفاصيل الرسالة"
            title="عرض التفاصيل"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="h-7 w-7 rounded-md"
            aria-label="تعديل المناسبة"
            title="تعديل"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-7 w-7 rounded-md text-destructive hover:bg-destructive/10 hover:text-destructive"
            aria-label="حذف المناسبة"
            title="حذف"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
