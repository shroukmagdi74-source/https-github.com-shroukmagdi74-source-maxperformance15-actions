import React from 'react';
import {
  Archive,
  Check,
  Megaphone,
  MessageSquarePlus,
  MoreVertical,
  RefreshCw,
  Search,
  Shield,
  Store,
  Tags,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { getInboxExternalImageUrl } from '@/utils/imageUrl';
import { getContactInitials } from '../../whatsappContactDisplay';
import type { Contact, Session as WhatsAppSession } from '../../../../hooks/useWhatsAppQueries';

interface ChatSidebarHeaderProps {
  multiSelectMode: boolean;
  selectedJids: Set<string>;
  conversations: Contact[];
  onExitMultiSelect: () => void;
  onToggleSelectAll: () => void;
  onBulkDelete?: (jids: string[], sessionId: string) => void;
  currentUserProfile: {
    name?: string;
    status?: string;
    profilePicUrl?: string;
  } | null;
  onOpenProfile: () => void;
  isSelectedSessionConnected: boolean;
  showArchived: boolean;
  sessionOptions: WhatsAppSession[];
  resolvedSessionValue: string;
  onSelectSession: (sessionId: string) => void;
  onOpenNewChat: () => void;
  onOpenNewGroup: () => void;
  onSyncHistory: () => void;
  isSyncingHistory: boolean;
  selectedSession: string;
  onOpenBroadcast: () => void;
  onOpenLabels: () => void;
  onEnterMultiSelect: () => void;
  onDeleteAll?: () => void;
  onOpenBusinessProfile: () => void;
  onOpenPrivacySettings: () => void;
  onOpenCheckNumber: () => void;
  onToggleArchived: (archived: boolean) => void;
  translate: (key: string) => string;
  isRtl: boolean;
}

export const ChatSidebarHeader: React.FC<ChatSidebarHeaderProps> = ({
  multiSelectMode,
  selectedJids,
  conversations,
  onExitMultiSelect,
  onToggleSelectAll,
  onBulkDelete,
  currentUserProfile,
  onOpenProfile,
  isSelectedSessionConnected,
  showArchived,
  sessionOptions,
  resolvedSessionValue,
  onSelectSession,
  onOpenNewChat,
  onOpenNewGroup,
  onSyncHistory,
  isSyncingHistory,
  selectedSession,
  onOpenBroadcast,
  onOpenLabels,
  onEnterMultiSelect,
  onDeleteAll,
  onOpenBusinessProfile,
  onOpenPrivacySettings,
  onOpenCheckNumber,
  onToggleArchived,
  translate,
  isRtl,
}) => {
  if (multiSelectMode) {
    return (
      <div className="flex h-12 w-full items-center justify-between border-b border-[color:color-mix(in_srgb,var(--shell-control-border)_76%,transparent)] bg-[color:var(--color-muted)] px-3 shrink-0">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onExitMultiSelect}
            className="size-8 rounded-full text-[color:var(--color-muted-foreground)] hover:bg-[var(--whatsapp-surface-hover)]"
            title="إلغاء"
          >
            <X className="size-4" />
          </Button>
          <span className="text-xs font-semibold font-mono tabular-nums text-[color:var(--color-foreground)]">
            {selectedJids.size > 0 ? `محدد ${selectedJids.size}` : 'اختر المحادثات'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSelectAll}
            className="h-7 rounded-lg px-2 text-[11px] text-[color:var(--color-muted-foreground)] hover:bg-[var(--whatsapp-surface-hover)]"
          >
            {selectedJids.size === conversations.length ? 'إلغاء الكل' : 'تحديد الكل'}
          </Button>
          {selectedJids.size > 0 && onBulkDelete ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const sessionId =
                  selectedSession && selectedSession !== 'all'
                    ? selectedSession
                    : sessionOptions.find((s) => s.id !== 'all')?.id || '';
                if (sessionId) {
                  onBulkDelete(Array.from(selectedJids), sessionId);
                  onExitMultiSelect();
                }
              }}
              className="h-7 rounded-lg px-2 text-[11px] text-rose-600 hover:bg-rose-500/10"
            >
              <Trash2 className="size-3.5 mr-1" />
              حذف
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-12 items-center justify-between border-b border-[color:color-mix(in_srgb,var(--shell-control-border)_76%,transparent)] bg-[color:var(--color-muted)] px-3 shrink-0">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenProfile}
          className="relative rounded-full transition-transform hover:scale-[1.02]"
        >
          <Avatar className="size-8">
            <AvatarImage
              src={getInboxExternalImageUrl(currentUserProfile?.profilePicUrl) || undefined}
            />
            <AvatarFallback className="bg-gradient-to-br from-[color:color-mix(in_srgb,var(--color-primary)_16%,transparent)] to-[color:color-mix(in_srgb,var(--color-primary)_4%,transparent)] text-[10px] font-semibold text-[color:var(--color-primary)]">
              {getContactInitials(currentUserProfile?.name || 'WA')}
            </AvatarFallback>
          </Avatar>
          <span
            className={cn(
              'absolute -bottom-0.5 -end-0.5 size-2.5 rounded-full border-2 border-[color:var(--color-muted)]',
              isSelectedSessionConnected ? 'bg-emerald-500' : 'bg-amber-500',
            )}
            title={isSelectedSessionConnected ? 'متاح' : 'يتطلب اتصال'}
          />
        </button>

        {showArchived && (
          <Badge
            variant="outline"
            className="border-[color:var(--shell-control-border)] bg-[var(--whatsapp-surface-overlay)] text-[9px] uppercase tracking-[0.16em] text-[color:var(--color-muted-foreground)] px-1.5 py-0"
          >
            الأرشيف
          </Badge>
        )}

        {sessionOptions.length > 1 && (
          <Select
            value={resolvedSessionValue}
            onValueChange={(v) => v && onSelectSession(v)}
          >
            <SelectTrigger className="h-7 min-w-0 max-w-[9rem] rounded-lg bg-[var(--whatsapp-surface)] text-[10px] px-2 gap-1">
              <span className="truncate font-medium text-[color:var(--color-foreground)]">
                {resolvedSessionValue === 'all'
                  ? translate('whatsapp.sidebar.all')
                  : sessionOptions.find((s) => s.id === resolvedSessionValue)?.name ||
                    resolvedSessionValue}
              </span>
            </SelectTrigger>
            <SelectContent align={isRtl ? 'start' : 'end'}>
              <SelectItem value="all">{translate('whatsapp.sidebar.all')}</SelectItem>
              {sessionOptions.map((session) => (
                <SelectItem key={session.id} value={session.id}>
                  {session.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onOpenNewChat}
          className="size-8 rounded-full text-[color:var(--color-muted-foreground)] hover:bg-[var(--whatsapp-surface-hover)]"
          title="محادثة جديدة"
        >
          <MessageSquarePlus className="size-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-8 rounded-full text-[color:var(--color-muted-foreground)] hover:bg-[var(--whatsapp-surface-hover)]"
              title="المزيد"
              aria-label="المزيد"
            >
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isRtl ? 'start' : 'end'} className="w-52">
            <DropdownMenuItem onClick={onOpenNewGroup}>
              <Users className="size-4" />
              <span>{translate('whatsapp.sidebar.newGroup')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onSyncHistory}
              disabled={!selectedSession || selectedSession === 'all' || isSyncingHistory}
            >
              <RefreshCw className={cn('size-4', isSyncingHistory && 'animate-spin')} />
              <span>{isSyncingHistory ? 'جاري طلب المزامنة' : 'مزامنة الرسائل'}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onOpenBroadcast}>
              <Megaphone className="size-4" />
              <span>إرسال بث</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onOpenLabels}>
              <Tags className="size-4" />
              <span>التصنيفات</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onEnterMultiSelect}>
              <Trash2 className="size-4" />
              <span>حذف متعدد</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDeleteAll?.()}>
              <Trash2 className="size-4 text-rose-600" />
              <span className="text-rose-600">حذف كل المحادثات</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onOpenProfile}>
              <User className="size-4" />
              <span>{translate('whatsapp.sidebar.profile')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onOpenBusinessProfile}>
              <Store className="size-4" />
              <span>{translate('whatsapp.sidebar.settings')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onOpenPrivacySettings}>
              <Shield className="size-4" />
              <span>{translate('whatsapp.sidebar.settings')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onOpenCheckNumber}>
              <Search className="size-4" />
              <span>فحص الرقم</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={showArchived}
              onCheckedChange={(checked) => onToggleArchived(Boolean(checked))}
            >
              {showArchived
                ? translate('whatsapp.sidebar.all')
                : translate('whatsapp.sidebar.archive')}
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
