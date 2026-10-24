import React from 'react';
import { Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DeliveryOptionsEmptyStateProps {
  onOpenCreateDialog: () => void;
}

export const DeliveryOptionsEmptyState: React.FC<DeliveryOptionsEmptyStateProps> = ({
  onOpenCreateDialog,
}) => {
  return (
    <div className="rounded-[28px] border border-dashed border-border bg-card/60 px-6 py-14 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-background text-foreground ring-1 ring-border">
        <Package className="size-8" />
      </div>
      <h2 className="mt-5 text-xl font-bold text-foreground">
        لا توجد خيارات توصيل حتى الآن
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-muted-foreground">
        أضف أول خيار ليظهر للعميل في صفحة الدفع، مثل التوصيل العادي أو
        السريع أو الاستلام خلال نفس اليوم.
      </p>
      <Button
        type="button"
        onClick={onOpenCreateDialog}
        className="mt-6 rounded-2xl bg-foreground text-background hover:bg-foreground/90 font-semibold gap-2"
      >
        <Plus className="size-4" />
        إضافة أول خيار
      </Button>
    </div>
  );
};
