import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays, Plus, Search } from 'lucide-react';
import { Occasion } from './types';
import { CustomerOccasionsCard } from './CustomerOccasionsCard';

interface CustomerOccasionsListProps {
  loading: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  filtered: Occasion[];
  onCreate: () => void;
  onView: (o: Occasion) => void;
  onEdit: (o: Occasion) => void;
  onDelete: (o: Occasion) => void;
}

export const CustomerOccasionsList: React.FC<CustomerOccasionsListProps> = ({
  loading,
  search,
  onSearchChange,
  filtered,
  onCreate,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ابحث باسم المناسبة..."
          className="h-8 rounded-lg pr-8 text-xs"
        />
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 p-12 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CalendarDays className="h-5 w-5" />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-foreground">لا توجد مناسبات مسجلة</h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            أنشئ مناسبة سنوية أو موسمية، وحدد نص الرسالة ليتم إرسالها لعملائك تلقائياً
          </p>
          <Button
            size="sm"
            onClick={onCreate}
            className="mt-4 h-8 gap-1.5 rounded-lg text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            إنشاء مناسبة جديدة
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((o) => (
            <CustomerOccasionsCard
              key={o.id}
              occasion={o}
              onView={() => onView(o)}
              onEdit={() => onEdit(o)}
              onDelete={() => onDelete(o)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
