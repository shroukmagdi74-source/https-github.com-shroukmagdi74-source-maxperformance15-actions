export type Session = {
  id: string;
  name: string;
  phoneNumber: string;
  status: string;
};

export type QueueCounters = {
  total: number;
  waiting: number;
  assigned: number;
  pending: number;
  closed: number;
  escalated: number;
  slaBreached: number;
  missedChats: number;
};

export type ModeratorPoolItem = {
  id: string;
  name: string;
  department: string | null;
  online: boolean;
  workload: {
    active: number;
    pending: number;
    waitingCustomer: number;
    unread: number;
    totalWeighted: number;
  };
};

export type Conversation = {
  id: string;
  status: string;
  queueKey?: string | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unreadCount: number;
  isRead: boolean;
  customer: {
    id: string;
    name: string;
    phone: string;
    avatar: string | null;
    status: string | null;
  };
  assignedUser: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    department: string | null;
  } | null;
  flags: {
    detectedLanguage: string | null;
    detectedCountry: string | null;
    detectedDepartment: string | null;
  };
  window: {
    isOpen: boolean;
    remainingSeconds: number;
    remainingLabel: string;
    windowExpiresAt: string | null;
  };
};

export type SessionsApiResponse = {
  success: boolean;
  sessions: Session[];
};

export type ConversationsApiResponse = {
  success: boolean;
  conversations: Conversation[];
  summary?: {
    queueCounters?: QueueCounters | null;
    moderatorPool?: ModeratorPoolItem[];
  };
};

export type QueueFilter =
  | ''
  | 'WAITING_QUEUE'
  | 'ASSIGNED_QUEUE'
  | 'PENDING_QUEUE'
  | 'CLOSED_QUEUE'
  | 'ESCALATED_QUEUE'
  | 'MISSED_QUEUE';

export interface WhatsAppInboxProps {
  companyId?: string;
  superAdminMode?: boolean;
}

export interface HeroMetric {
  label: string;
  value: number;
}
