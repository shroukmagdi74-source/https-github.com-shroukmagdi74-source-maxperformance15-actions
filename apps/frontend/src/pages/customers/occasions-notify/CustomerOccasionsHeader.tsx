import React from 'react';
import { Button } from '@/components/ui/button';
import { CalendarDays, Plus, RefreshCw } from 'lucide-react';

interface CustomerOccasionsHeaderProps {
  loading: boolean;
  onRefresh: () => void;
  onCreate: () => void;
}

export const CustomerOccasionsHeader: React.FC<CustomerOccasionsHeaderProps> = ({
  loading,
  onRefresh,
  onCreate,
}) => {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
          <CalendarDays className="h-5 w-5 text-primary" />
          مناسبات العملاء
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          رسائل مجدولة للمناسبات والأعياد لعملائك عبر قوالب معتمدة أو رسائل مخصصة
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="h-8 gap-1.5 rounded-lg text-xs"
          disabled={loading}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
        <Button
          size="sm"
          onClick={onCreate}
          className="h-8 gap-1.5 rounded-lg text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          مناسبة جديدة
        </Button>
      </div>
    </header>
  );
};
