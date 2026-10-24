import React from 'react';
import { Clock3, Pencil, Star, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { DeliveryOption } from './types';

interface DeliveryOptionCardProps {
  option: DeliveryOption;
  togglingId: string | null;
  onToggle: (id: string) => void;
  onEdit: (option: DeliveryOption) => void;
  onDelete: (id: string) => void;
}

export const DeliveryOptionCard: React.FC<DeliveryOptionCardProps> = ({
  option,
  togglingId,
  onToggle,
  onEdit,
  onDelete,
}) => {
  return (
    <section className="rounded-[24px] border border-border/70 bg-card p-5 shadow-sm shadow-border/10">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-foreground">{option.name}</h2>
            {option.isDefault && (
              <Badge
                variant="outline"
                className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-300 gap-1"
              >
                <Star className="size-3.5 fill-current" />
                الافتراضي
              </Badge>
            )}
            <Badge
              variant="outline"
              className={cn(
                option.isActive
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'border-border bg-muted text-muted-foreground',
              )}
            >
              {option.isActive ? 'نشط' : 'معطل'}
            </Badge>
          </div>

          <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
            {option.description?.trim()
              ? option.description
              : 'لا يوجد وصف مختصر لهذا الخيار حتى الآن.'}
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                وقت التوصيل
              </p>
              <div className="mt-2 flex items-center gap-2 text-sm font-bold text-foreground">
                <Clock3 className="size-4 text-muted-foreground" />
                <span>{option.deliveryTime}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                السعر
              </p>
              <div className="mt-2 text-sm font-bold text-foreground font-mono tabular-nums">
                {option.price} جنيه
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                ترتيب العرض
              </p>
              <div className="mt-2 text-sm font-bold text-foreground font-mono tabular-nums">
                #{option.sortOrder}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 xl:min-w-[250px]">
          <div className="rounded-[22px] border border-border/70 bg-muted/30 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-foreground">تفعيل هذا الخيار</p>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">
                  أوقفه مؤقتًا بدون حذف البيانات أو إعادة الترتيب.
                </p>
              </div>
              <Switch
                aria-label={`تفعيل ${option.name}`}
                checked={option.isActive}
                onCheckedChange={() => onToggle(option.id)}
                disabled={togglingId === option.id}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-2xl gap-1.5"
              onClick={() => onEdit(option)}
            >
              <Pencil className="size-4" />
              تعديل
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-2xl gap-1.5"
              onClick={() => onDelete(option.id)}
              aria-label={`حذف ${option.name}`}
            >
              <Trash2 className="size-4" />
              حذف
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
