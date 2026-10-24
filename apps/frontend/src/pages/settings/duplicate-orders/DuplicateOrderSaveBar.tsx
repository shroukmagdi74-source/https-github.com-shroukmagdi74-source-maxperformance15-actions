import React from 'react';
import { Check, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DuplicateOrderSaveBarProps {
  saving: boolean;
  onSave: () => Promise<void>;
  onReload: () => Promise<void>;
}

export const DuplicateOrderSaveBar: React.FC<DuplicateOrderSaveBarProps> = ({
  saving,
  onSave,
  onReload,
}) => {
  return (
    <div className="flex items-center gap-3 pt-2">
      <Button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="gap-2 font-semibold text-xs"
      >
        {saving ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Check className="size-4" />
        )}
        {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onReload}
        disabled={saving}
        className="gap-2 font-semibold text-xs"
      >
        <RefreshCw className="size-4" />
        إعادة تحميل
      </Button>
    </div>
  );
};
