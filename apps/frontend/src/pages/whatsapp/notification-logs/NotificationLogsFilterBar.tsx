import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  EVENT_LABELS,
  MESSAGE_TYPE_LABELS,
  STATUS_LABELS,
} from './types';

interface NotificationLogsFilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  messageTypeFilter: string;
  onMessageTypeChange: (v: string) => void;
  eventTypeFilter: string;
  onEventTypeChange: (v: string) => void;
  sessionFilter: string;
  onSessionChange: (v: string) => void;
  sessions: { id: string; name: string }[];
}

export const NotificationLogsFilterBar: React.FC<NotificationLogsFilterBarProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  messageTypeFilter,
  onMessageTypeChange,
  eventTypeFilter,
  onEventTypeChange,
  sessionFilter,
  onSessionChange,
  sessions,
}) => {
  return (
    <div className="grid gap-2.5 rounded-lg border border-border/50 bg-card p-3 sm:grid-cols-2 lg:grid-cols-5">
      <div className="relative">
        <Search className="absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ابحث بالاسم أو رقم الهاتف..."
          className="h-8 rounded-lg pr-8 text-xs"
        />
      </div>

      <Select
        value={statusFilter || '__all__'}
        onValueChange={(v) => onStatusChange(v === '__all__' ? '' : v ?? '')}
      >
        <SelectTrigger className="h-8 rounded-lg text-xs">
          <SelectValue placeholder="حالة الإرسال" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__" className="text-xs">الكل (جميع الحالات)</SelectItem>
          {Object.entries(STATUS_LABELS).map(([k, label]) => (
            <SelectItem key={k} value={k} className="text-xs">
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={messageTypeFilter || '__all__'}
        onValueChange={(v) => onMessageTypeChange(v === '__all__' ? '' : v ?? '')}
      >
        <SelectTrigger className="h-8 rounded-lg text-xs">
          <SelectValue placeholder="نوع الرسالة" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__" className="text-xs">الكل (جميع الأنواع)</SelectItem>
          {Object.entries(MESSAGE_TYPE_LABELS).map(([k, label]) => (
            <SelectItem key={k} value={k} className="text-xs">
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={eventTypeFilter || '__all__'}
        onValueChange={(v) => onEventTypeChange(v === '__all__' ? '' : v ?? '')}
      >
        <SelectTrigger className="h-8 rounded-lg text-xs">
          <SelectValue placeholder="نوع الحدث" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__" className="text-xs">الكل (جميع الأحداث)</SelectItem>
          {Object.entries(EVENT_LABELS).map(([k, label]) => (
            <SelectItem key={k} value={k} className="text-xs">
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={sessionFilter || '__all__'}
        onValueChange={(v) => onSessionChange(v === '__all__' ? '' : v ?? '')}
      >
        <SelectTrigger className="h-8 rounded-lg text-xs font-mono">
          <SelectValue placeholder="الجلسة" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__" className="text-xs">الكل (جميع الجلسات)</SelectItem>
          {sessions.map((s) => (
            <SelectItem key={s.id} value={s.id} className="text-xs font-mono">
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
