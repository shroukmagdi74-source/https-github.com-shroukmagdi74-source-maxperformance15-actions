import React from 'react';
import { FactoryPortalStats, FactoryPortalStatusTab } from './types';

interface FactoryPortalFilterTabsProps {
  statusTab: FactoryPortalStatusTab;
  setStatusTab: (tab: FactoryPortalStatusTab) => void;
  stats: FactoryPortalStats;
}

export const FactoryPortalFilterTabs: React.FC<FactoryPortalFilterTabsProps> = ({
  statusTab,
  setStatusTab,
  stats,
}) => {
  const tabs: Array<{ id: FactoryPortalStatusTab; label: string; count: number }> = [
    { id: 'ALL', label: 'كافة التكليفات', count: stats.all },
    { id: 'ACTIVE', label: 'جارية بالتشغيل', count: stats.active },
    { id: 'PENDING_REVIEW', label: 'بانتظار الاعتماد', count: stats.pendingReview },
    { id: 'COMPLETED', label: 'مكتملة', count: stats.completed },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
      {tabs.map((tab) => {
        const isActive = statusTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatusTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card border border-border/70 text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums ${
                isActive
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
