import React from 'react';
import { Building2, RotateCw } from 'lucide-react';
import { FactoryPortalContext } from '../../manufacturingApi';

interface FactoryPortalHeaderProps {
  context: FactoryPortalContext | null;
  loading: boolean;
  onRefresh: () => void;
}

export const FactoryPortalHeader: React.FC<FactoryPortalHeaderProps> = ({
  context,
  loading,
  onRefresh,
}) => {
  const factoryName =
    (context as any)?.factory?.name || context?.name || 'المصنع الشريك';
  const factoryCode =
    (context as any)?.factory?.code || context?.code;
  const specialty =
    (context as any)?.factory?.specialty ||
    context?.specialty ||
    'بوابة التكليفات وتحديث مراحل التشغيل';

  return (
    <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b border-border/70 px-4 py-3 shadow-sm">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm sm:text-base text-foreground flex items-center gap-1.5">
              <span>{factoryName}</span>
              {factoryCode && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {factoryCode}
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">{specialty}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
          title="تحديث البيانات"
        >
          <RotateCw
            className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : ''}`}
          />
        </button>
      </div>
    </header>
  );
};
