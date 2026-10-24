import type {
  Contact,
  Session as WhatsAppSession,
  WhatsAppSidebarFilter,
  WhatsAppConversationCounts,
} from '../../../../hooks/useWhatsAppQueries';

export interface WhatsAppStatus {
  id: string;
  remoteJid: string;
  content?: string;
  mediaUrl?: string;
  timestamp: Date;
  type: string;
}

export interface ChatSidebarProps {
  className?: string;
  sessions: WhatsAppSession[];
  conversations: Contact[];
  statuses: WhatsAppStatus[];
  selectedSession: string;
  selectedContact: Contact | null;
  currentUserProfile: {
    name?: string;
    status?: string;
    profilePicUrl?: string;
  } | null;
  isLoadingConversations: boolean;
  isLoadingMoreConversations: boolean;
  hasMoreConversations: boolean;
  isLoadingStatuses: boolean;
  onSelectSession: (sessionId: string) => void;
  onSelectContact: (contact: Contact) => void;
  onOpenProfile: () => void;
  onOpenNewChat: () => void;
  onOpenNewGroup: () => void;
  onOpenPrivacySettings: () => void;
  onOpenBusinessProfile: () => void;
  onSyncHistory: () => void;
  isSyncingHistory?: boolean;
  onPinChat: (contact: Contact) => void;
  onArchiveChat: (contact: Contact) => void;
  onDeleteChat: (contact: Contact) => void;
  onBlockContact: (contact: Contact) => void;
  onMuteChat: (contact: Contact) => void;
  onMarkAsRead: (contact: Contact) => void;
  onLoadMore: () => void;
  onAddStatus: () => void;
  onOpenBroadcast: () => void;
  onOpenCheckNumber: () => void;
  onOpenLabels: () => void;
  conversationsError?: boolean;
  onRetryConversations?: () => void;
  onBulkDelete?: (jids: string[], sessionId: string) => void;
  onDeleteAll?: (sessionId?: string) => void;
  labels?: { id: string; name: string; color: string }[];
  filterType: WhatsAppSidebarFilter;
  onFilterTypeChange: (filter: WhatsAppSidebarFilter) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showArchived: boolean;
  onToggleArchived: (archived: boolean) => void;
  counts?: WhatsAppConversationCounts;
}

export interface ContextMenuState {
  mouseX: number;
  mouseY: number;
  contact: Contact;
}
