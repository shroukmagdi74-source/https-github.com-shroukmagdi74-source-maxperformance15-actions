export type MessageUser = {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
};

export type ChatMessage = {
  id: string;
  content: string;
  type: string;
  isFromCustomer: boolean;
  createdAt: string;
  user: MessageUser | null;
};

export type ChatNote = {
  id: string;
  content: string;
  type: string;
  createdAt: string;
  author: MessageUser;
};

export type ChatTag = {
  id: string;
  tag: string;
  color: string;
};

export type AvailableModerator = {
  id: string;
  name: string;
  online: boolean;
  department: string | null;
  workload: {
    active: number;
    pending: number;
    waitingCustomer: number;
    unread: number;
    totalWeighted: number;
  };
};

export type ConversationDetail = {
  id: string;
  status: string;
  aiEnabled?: boolean;
  queueKey?: string | null;
  customer: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    avatar: string | null;
    status: string | null;
  };
  messages: ChatMessage[];
  notes: ChatNote[];
  conversationTags: ChatTag[];
  assignedUser: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    department: string | null;
  } | null;
  availableModerators: AvailableModerator[];
  flags: {
    detectedLanguage: string | null;
    detectedCountry: string | null;
    detectedDepartment: string | null;
    ownerLock: {
      lockExpiresAt?: string;
    };
    sla: {
      firstResponseDeadlineAt?: string;
      maxWaitingDeadlineAt?: string;
      firstResponseAt?: string | null;
    };
  };
  canTransfer: boolean;
  window: {
    isOpen: boolean;
    remainingSeconds: number;
    remainingLabel: string;
    windowExpiresAt: string | null;
  };
};

export type ConversationApiResponse = {
  success: boolean;
  conversation: ConversationDetail;
};

export type CustomerOrder = {
  id: string;
  orderNumber?: string;
  status?: string;
  createdAt?: string;
  items?: unknown[];
  total?: number;
};

export interface WhatsAppChatProps {
  companyId?: string;
  superAdminMode?: boolean;
}
