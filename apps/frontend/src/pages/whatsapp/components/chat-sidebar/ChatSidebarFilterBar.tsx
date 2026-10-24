import React from 'react';
import { Filter, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { WhatsAppSidebarFilter } from '../../../../hooks/useWhatsAppQueries';

interface FilterPillProps {
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
}

const FilterPill: React.FC<FilterPillProps> = ({ active, label, count, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-6 min-w-0 items-center justify-center gap-1 rounded-full border px-2 text-[10px] font-medium transition-colors',
        active
          ? 'border-[color:var(--color-primary)] bg-primary/10 text-[color:var(--color-primary)]'
          : 'border-[color:var(--shell-control-border)] bg-[var(--whatsapp-surface)] text-[color:var(--color-muted-foreground)] hover:bg-[var(--whatsapp-surface-hover)] hover:text-[color:var(--color-foreground)]',
      )}
    >
      <span className="truncate">{label}</span>
      {typeof count === 'number' && count > 0 && (
        <span
          className={cn(
            'inline-flex h-3.5 min-w-3.5 shrink-0 items-center justify-center rounded-full px-0.5 text-[8px] font-mono font-semibold tabular-nums leading-none',
            active
              ? 'bg-[color:var(--color-primary)]/12 text-[color:var(--color-primary)]'
              : 'bg-[var(--whatsapp-surface-muted)] text-[color:var(--color-muted-foreground)]',
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
};

interface ChatSidebarFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterType: WhatsAppSidebarFilter;
  onFilterTypeChange: (filter: WhatsAppSidebarFilter) => void;
  showArchived: boolean;
  onToggleArchived: (archived: boolean) => void;
  allCount: number;
  unrepliedCount: number;
  unreadCount: number;
  groupCount: number;
  archivedCount: number;
  statusesCount: number;
  translate: (key: string) => string;
}

export const ChatSidebarFilterBar: React.FC<ChatSidebarFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  showArchived,
  onToggleArchived,
  allCount,
  unrepliedCount,
  unreadCount,
  groupCount,
  archivedCount,
  statusesCount,
  translate,
}) => {
  return (
    <div className="wa-glass-search-bar border-b border-[color:color-mix(in_srgb,var(--shell-control-border)_76%,transparent)] px-2 py-2 space-y-2 shrink-0">
      <div className="relative w-full">
        <Search className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[color:var(--color-muted-foreground)]" />
        <Input
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={translate('whatsapp.sidebar.searchPlaceholder')}
          aria-label={translate('whatsapp.sidebar.searchPlaceholder')}
          className="whatsapp-search-input h-8 w-full rounded-lg bg-[var(--whatsapp-surface)] ps-8 pe-8 text-[11px]"
        />
        {searchTerm ? (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onSearchChange('')}
            className="absolute end-1 top-1/2 -translate-y-1/2 size-6 rounded-md text-[color:var(--color-muted-foreground)] hover:bg-[var(--whatsapp-surface-hover)]"
          >
            <X className="size-3" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onFilterTypeChange(filterType === 'unread' ? 'all' : 'unread')}
            className={cn(
              'absolute end-1 top-1/2 -translate-y-1/2 size-6 rounded-md',
              filterType === 'unread'
                ? 'bg-primary/10 text-[color:var(--color-primary)] hover:bg-primary/12'
                : 'text-[color:var(--color-muted-foreground)] hover:bg-[var(--whatsapp-surface-hover)]',
            )}
            title={translate('whatsapp.sidebar.unread')}
          >
            <Filter className="size-3.5" />
          </Button>
        )}
      </div>

      <div className="wa-filter-strip flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
        <FilterPill
          active={filterType === 'all' && !showArchived}
          label={translate('whatsapp.sidebar.all')}
          count={allCount}
          onClick={() => {
            onFilterTypeChange('all');
            onToggleArchived(false);
          }}
        />
        <FilterPill
          active={filterType === 'unreplied'}
          label={translate('whatsapp.sidebar.unreplied')}
          count={unrepliedCount}
          onClick={() => {
            onFilterTypeChange('unreplied');
            onToggleArchived(false);
          }}
        />
        <FilterPill
          active={filterType === 'unread'}
          label={translate('whatsapp.sidebar.unread')}
          count={unreadCount}
          onClick={() => {
            onFilterTypeChange('unread');
            onToggleArchived(false);
          }}
        />
        <FilterPill
          active={filterType === 'groups'}
          label={translate('whatsapp.sidebar.groups')}
          count={groupCount}
          onClick={() => {
            onFilterTypeChange('groups');
            onToggleArchived(false);
          }}
        />
        <FilterPill
          active={showArchived}
          label={translate('whatsapp.sidebar.archive') || 'الأرشيف'}
          count={archivedCount}
          onClick={() => {
            onToggleArchived(true);
            if (filterType === 'statuses') onFilterTypeChange('all');
          }}
        />
        <FilterPill
          active={filterType === 'statuses'}
          label={translate('whatsapp.sidebar.statuses')}
          count={statusesCount}
          onClick={() => {
            onFilterTypeChange('statuses');
            onToggleArchived(false);
          }}
        />
      </div>
    </div>
  );
};
