import React from 'react';
import { FileText, Plus, ShieldCheck } from 'lucide-react';

interface StorePagesEmptyStateProps {
  hasTotalPages: boolean;
  onGeneratePolicies: () => void;
  onNewPage: () => void;
  translate: (key: string) => string;
}

export const StorePagesEmptyState: React.FC<StorePagesEmptyStateProps> = ({
  hasTotalPages,
  onGeneratePolicies,
  onNewPage,
  translate,
}) => {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-border/50 bg-muted/40 text-muted-foreground mb-4">
        <FileText className="size-7 text-muted-foreground/60" />
      </div>
      <h3 className="text-base font-bold text-foreground">
        {hasTotalPages ? 'لا توجد صفحات مطابقة للبحث' : translate('storePages.noPagesTitle')}
      </h3>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">
        {hasTotalPages ? 'جرب تغيير كلمة البحث أو نوع الصفحة.' : translate('storePages.noPagesDesc')}
      </p>

      {!hasTotalPages && (
        <div className="mt-5 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={onGeneratePolicies}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted/60 transition active:scale-95"
          >
            <ShieldCheck className="size-4 text-emerald-500" />
            <span>{translate('storePages.generatePolicies')}</span>
          </button>
          <button
            type="button"
            onClick={onNewPage}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition active:scale-95"
          >
            <Plus className="size-4" />
            <span>{translate('storePages.createCustomPage')}</span>
          </button>
        </div>
      )}
    </div>
  );
};
