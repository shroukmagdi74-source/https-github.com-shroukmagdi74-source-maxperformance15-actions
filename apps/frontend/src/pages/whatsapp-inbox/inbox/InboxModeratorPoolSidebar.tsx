import React from 'react';
import { Users } from 'lucide-react';
import type { ModeratorPoolItem } from './types';

interface InboxModeratorPoolSidebarProps {
  moderatorPool: ModeratorPoolItem[];
  eyebrow: string;
  title: string;
  emptyLabel: string;
  onlineLabel: string;
  offlineLabel: string;
  noDepartmentLabel: string;
  activeLabel: string;
  pendingLabel: string;
}

export const InboxModeratorPoolSidebar: React.FC<InboxModeratorPoolSidebarProps> = ({
  moderatorPool,
  eyebrow,
  title,
  emptyLabel,
  onlineLabel,
  offlineLabel,
  noDepartmentLabel,
  activeLabel,
  pendingLabel,
}) => {
  return (
    <aside className="hidden min-h-0 w-80 flex-col border-l border-border/50 bg-card/60 xl:flex rtl:border-l-0 rtl:border-r">
      <div className="border-b border-border/50 px-4 py-3.5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {eyebrow}
        </div>
        <div className="mt-1 flex items-center gap-2 text-base font-bold text-foreground">
          <Users className="size-4 text-primary" />
          <span>{title}</span>
        </div>
      </div>

      <div className="wa-slim-scroll min-h-0 flex-1 overflow-y-auto p-3 space-y-2">
        {moderatorPool.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted/40 text-muted-foreground mb-2">
              <Users className="size-5 text-muted-foreground/60" />
            </div>
            <div className="text-xs text-muted-foreground">{emptyLabel}</div>
          </div>
        ) : (
          moderatorPool.map((moderator) => (
            <div
              key={moderator.id}
              className="rounded-lg border border-border/50 bg-background/60 p-3 shadow-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-xs md:text-sm font-semibold text-foreground">
                    {moderator.name}
                  </div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {moderator.department || noDepartmentLabel}
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    moderator.online
                      ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'border border-border/40 bg-muted/50 text-muted-foreground'
                  }`}
                >
                  {moderator.online ? onlineLabel : offlineLabel}
                </span>
              </div>

              <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md border border-border/40 bg-muted/30 px-2.5 py-1.5">
                  <div className="text-[10px] font-medium text-muted-foreground">
                    {activeLabel}
                  </div>
                  <div className="mt-0.5 text-sm md:text-base font-bold font-mono tabular-nums text-foreground">
                    {moderator.workload.active}
                  </div>
                </div>
                <div className="rounded-md border border-border/40 bg-muted/30 px-2.5 py-1.5">
                  <div className="text-[10px] font-medium text-muted-foreground">
                    {pendingLabel}
                  </div>
                  <div className="mt-0.5 text-sm md:text-base font-bold font-mono tabular-nums text-foreground">
                    {moderator.workload.pending}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};
