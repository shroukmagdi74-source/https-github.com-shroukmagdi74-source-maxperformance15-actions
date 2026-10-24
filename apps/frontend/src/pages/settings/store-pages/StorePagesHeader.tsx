import React from 'react';
import { FileText, Plus, ShieldCheck } from 'lucide-react';

interface StorePagesHeaderProps {
  badgeLabel: string;
  pageTitle: string;
  pageSubtitle: string;
  generatePoliciesLabel: string;
  newPageLabel: string;
  showGenerateButton: boolean;
  onGeneratePolicies: () => void;
  onNewPage: () => void;
}

export const StorePagesHeader: React.FC<StorePagesHeaderProps> = ({
  badgeLabel,
  pageTitle,
  pageSubtitle,
  generatePoliciesLabel,
  newPageLabel,
  showGenerateButton,
  onGeneratePolicies,
  onNewPage,
}) => {
  return (
    <div className="flex flex-col gap-4 border-b border-border/50 bg-card/60 px-4 py-4 md:px-6 md:py-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
          <FileText className="size-3.5" />
          <span>{badgeLabel}</span>
        </div>
        <h1 className="mt-2 text-xl md:text-2xl font-bold tracking-tight text-foreground">
          {pageTitle}
        </h1>
        <p className="mt-1 text-xs md:text-sm text-muted-foreground max-w-2xl">
          {pageSubtitle}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
        {showGenerateButton && (
          <button
            type="button"
            onClick={onGeneratePolicies}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card px-3.5 py-2 text-xs md:text-sm font-semibold text-foreground transition hover:bg-muted/60 active:scale-95"
          >
            <ShieldCheck className="size-4 text-emerald-500" />
            <span>{generatePoliciesLabel}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onNewPage}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs md:text-sm font-semibold text-primary-foreground shadow-xs transition hover:bg-primary/90 active:scale-95"
        >
          <Plus className="size-4" />
          <span>{newPageLabel}</span>
        </button>
      </div>
    </div>
  );
};
