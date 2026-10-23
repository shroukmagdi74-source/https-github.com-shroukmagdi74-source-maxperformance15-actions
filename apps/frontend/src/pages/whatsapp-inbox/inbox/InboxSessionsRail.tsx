import React from 'react';
import type { Session } from './types';
import { getSessionTone } from './useWhatsAppInboxController';
import { Smartphone } from 'lucide-react';

interface InboxSessionsRailProps {
  sessions: Session[];
  activeSession: string | null;
  onSelectSession: (id: string) => void;
  railEyebrow: string;
  railTitle: string;
  formatSessionStatus: (status: string) => string;
}

export const InboxSessionsRailDesktop: React.FC<InboxSessionsRailProps> = ({
  sessions,
  activeSession,
  onSelectSession,
  railEyebrow,
  railTitle,
  formatSessionStatus,
}) => {
  return (
    <aside className="hidden w-72 flex-col border-r border-border/50 bg-card lg:flex">
      <div className="border-b border-border/50 px-4 py-3.5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {railEyebrow}
        </div>
        <div className="mt-1 text-base font-bold text-foreground flex items-center gap-2">
          <Smartphone className="size-4 text-primary" />
          <span>{railTitle}</span>
        </div>
      </div>
      <div className="wa-slim-scroll flex-1 overflow-y-auto p-2 space-y-1">
        {sessions.map((item) => {
          const active = item.id === activeSession;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectSession(item.id)}
              className={`w-full rounded-lg border px-3 py-2.5 text-left transition ${
                active
                  ? 'border-primary/40 bg-primary/10 shadow-sm'
                  : 'border-border/40 bg-card/60 hover:border-border hover:bg-muted/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-foreground">
                    {item.name || item.phoneNumber}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground font-mono tabular-nums">
                    {item.phoneNumber}
                  </div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getSessionTone(item.status)}`}>
                  {formatSessionStatus(item.status)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export const InboxSessionsRailMobile: React.FC<InboxSessionsRailProps> = ({
  sessions,
  activeSession,
  onSelectSession,
  railEyebrow,
  formatSessionStatus,
}) => {
  return (
    <div className="mt-2.5 lg:hidden">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {railEyebrow}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 wa-slim-scroll">
        {sessions.map((item) => {
          const active = item.id === activeSession;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectSession(item.id)}
              className={`min-w-[190px] shrink-0 rounded-lg border px-3 py-2 text-left transition ${
                active
                  ? 'border-primary/40 bg-primary/10 shadow-sm'
                  : 'border-border/40 bg-card/60 hover:bg-muted/40'
              }`}
            >
              <div className="truncate text-sm font-semibold text-foreground">
                {item.name || item.phoneNumber}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground font-mono tabular-nums">
                {item.phoneNumber}
              </div>
              <div className="mt-1.5">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getSessionTone(item.status)}`}>
                  {formatSessionStatus(item.status)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
