import React from 'react';
import type { HeroMetric, Session } from './types';
import { InboxSessionsRailMobile } from './InboxSessionsRail';

interface InboxHeroHeaderProps {
  selectedSession: Session | null;
  sessions: Session[];
  activeSession: string | null;
  onSelectSession: (id: string) => void;
  heroFallbackTitle: string;
  heroMetrics: HeroMetric[];
  railEyebrow: string;
  railTitle: string;
  formatSessionStatus: (status: string) => string;
}

export const InboxHeroHeader: React.FC<InboxHeroHeaderProps> = ({
  selectedSession,
  sessions,
  activeSession,
  onSelectSession,
  heroFallbackTitle,
  heroMetrics,
  railEyebrow,
  railTitle,
  formatSessionStatus,
}) => {
  return (
    <section className="border-b border-border/50 bg-card/60 px-4 py-3 md:px-5">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-lg md:text-xl font-bold text-foreground">
            {selectedSession?.name || selectedSession?.phoneNumber || heroFallbackTitle}
          </h1>
          {selectedSession?.phoneNumber && (
            <span className="text-xs font-mono tabular-nums text-muted-foreground self-start sm:self-auto">
              {selectedSession.phoneNumber}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 md:gap-2">
          {heroMetrics.map((metric) => (
            <div
              key={metric.label}
              className="inline-flex items-baseline gap-1.5 rounded-md border border-border/40 bg-muted/30 px-2.5 py-1"
            >
              <span className="text-sm md:text-base font-bold tabular-nums font-mono text-foreground">
                {metric.value}
              </span>
              <span className="text-[11px] text-muted-foreground">{metric.label}</span>
            </div>
          ))}
        </div>
      </div>

      <InboxSessionsRailMobile
        sessions={sessions}
        activeSession={activeSession}
        onSelectSession={onSelectSession}
        railEyebrow={railEyebrow}
        railTitle={railTitle}
        formatSessionStatus={formatSessionStatus}
      />
    </section>
  );
};
