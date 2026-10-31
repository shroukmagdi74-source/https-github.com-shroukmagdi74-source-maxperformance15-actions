import { InboxConversation } from "../../../types/inbox.types";

export interface CustomerProfileProps {
  conversation: InboxConversation;
  className?: string;
  onTagsChange: (tags: string[]) => void;
  updatingTags: boolean;
  currentStatus?: string;
  onStatusChange?: (status: string) => void;
  currentAssignee?: string | null;
  currentAssigneeName?: string | null;
  onAssign?: (userId: string | null) => void;
  disabled?: boolean;
  // Open Conversation Callback
  onOpenConversation?: (conversationId: string) => void;
  // Block Customer Props
  isBlocked?: boolean;
  checkingBlockStatus?: boolean;
  blocking?: boolean;
  showBlockModal?: boolean;
  blockReason?: string;
  onBlockClick?: () => void;
  onUnblockClick?: () => void;
  onBlockReasonChange?: (reason: string) => void;
  onBlockConfirm?: () => void;
  onBlockCancel?: () => void;
  // Sound & Notifications Props
  soundEnabled?: boolean;
  notificationsEnabled?: boolean;
  onSoundToggle?: () => void;
  onNotificationsToggle?: () => void;
  // Copy Conversation Link
  onCopyConversationLink?: (conversationId: string) => void;
  // Quick Order
  onCreateOrder?: () => void;
  compactHeader?: boolean;
}

export type Tab = "info" | "orders" | "timeline";

export interface ApiErrorLike {
  response?: {
    data?: {
      message?: string;
      error?: string;
      info?: string;
    };
  };
  message?: string;
}
