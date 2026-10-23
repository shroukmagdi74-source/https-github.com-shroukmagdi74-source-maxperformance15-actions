import React from 'react';
import { AlertCircle, LayoutDashboard, RotateCcw, Search } from 'lucide-react';
import type { QueueCounters, QueueFilter } from './types';

interface QueueTabItem {
  key: QueueFilter;
  label: string;
  metricKey?: keyof QueueCounters;
}

interface InboxFilterBarProps {
  error: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  onOpenDashboard: () => void;
  searchPlaceholder: string;
  refreshLabel: string;
  openDashboardLabel: string;
  queueFilter: QueueFilter;
  onSelectQueueFilter: (filter: QueueFilter) => void;
  queueTabs: QueueTabItem[];
  queueCounters: QueueCounters | null;
}

export const InboxFilterBar: React.FC<InboxFilterBarProps> = ({
  error,
  search,
  onSearchChange,
  onRefresh,
  onOpenDashboard,
  searchPlaceholder,
  refreshLabel,
  openDashboardLabel,
  queueFilter,
  onSelectQueueFilter,
  queueTabs,
  queueCounters,
}) => {
  return (
    <div className="border-b border-border/50 bg-card/40 px-4 py-3 md:px-5">
      {error && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs md:text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground rtl:left-auto rtl:right-3" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onRefresh();
                }
              }}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border border-border/50 bg-background py-1.5 pl-9 pr-3 text-sm text-foreground outline-none transition focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rtl:pl-3 rtl:pr-9"
            />
          </div>
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-card px-3 py-1.5 text-xs md:text-sm font-medium text-foreground transition hover:bg-muted/60 active:scale-95"
          >
            <RotateCcw className="size-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">{refreshLabel}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenDashboard}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border/50 bg-card px-3 py-1.5 text-xs md:text-sm font-medium text-foreground transition hover:bg-muted/60 active:scale-95"
        >
          <LayoutDashboard className="size-3.5 text-primary" />
          <span>{openDashboardLabel}</span>
        </button>
      </div>

      <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-1 wa-slim-scroll">
        {queueTabs.map((tab) => {
          const isActive = queueFilter === tab.key;
          const count = tab.metricKey && queueCounters?.[tab.metricKey] ? queueCounters[tab.metricKey] : 0;

          return (
            <button
              key={tab.key || 'all'}
              type="button"
              onClick={() => onSelectQueueFilter(tab.key)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition active:scale-95 ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground'
              }`}
            >
              <span>{tab.label}</span>
              {count > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0 text-[10px] font-mono tabular-nums font-semibold ${
                    isActive
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-background text-muted-foreground border border-border/40'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
