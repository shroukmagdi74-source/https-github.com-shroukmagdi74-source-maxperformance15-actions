import React from 'react';
import { cn } from '../../../lib/utils';
import { TaskTabKey } from './types';

interface TabItem {
  id: TaskTabKey;
  label: string;
  count: number;
}

interface TaskTabsBarProps {
  activeTab: TaskTabKey;
  setActiveTab: (tab: TaskTabKey) => void;
  tabItems: TabItem[];
}

export const TaskTabsBar: React.FC<TaskTabsBarProps> = ({
  activeTab,
  setActiveTab,
  tabItems,
}) => {
  return (
    <section className="rounded-[24px] border border-border/65 bg-card/64 p-2.5 shadow-[0_18px_54px_-48px_rgba(15,27,45,0.22)]">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabItems.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "border-primary/20 bg-primary/8 text-primary shadow-sm"
                : "border-border/70 bg-background/75 text-muted-foreground hover:bg-background hover:text-foreground",
            )}
          >
            <span>{tab.label}</span>
            {tab.count > 0 ? (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                  activeTab === tab.id
                    ? "bg-primary/12 text-primary"
                    : "bg-primary/8 text-primary/90",
                )}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </section>
  );
};
