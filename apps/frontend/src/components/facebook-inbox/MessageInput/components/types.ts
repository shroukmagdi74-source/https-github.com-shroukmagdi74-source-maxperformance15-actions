import { QuickReply } from "../QuickReplyDropdown/QuickReplyDropdown";

export interface MessageInputProps {
  onSendMessage?: (content: string) => void;
  onSendFile?: (file: File) => void;
  onSendFiles?: (files: File[]) => void;
  sending?: boolean;
  uploadingFile?: boolean;
  conversation?: any;
  user?: any;
  replyTo?: any;
  onCancelReply?: () => void;
  onOpenTextGallery?: () => void;
  onOpenImageGallery?: () => void;
  onOpenProductPicker?: () => void;
  // Compatibility with other inbox pages
  onSend?: (content: string) => void;
  isSending?: boolean;
  platform?: string;
  draftMessage?: string;
  onDraftMessageHandled?: () => void;
  onSendQuickReply?: (reply: QuickReply) => void;
  // Rich platform actions (e.g. WhatsApp)
  onOpenOrder?: () => void;
  onOpenServiceOrder?: () => void;
  onOpenTasks?: () => void;
  onOpenInteractive?: () => void;
  onOpenPoll?: () => void;
  onOpenButtons?: () => void;
  onOpenList?: () => void;
  onOpenCatalog?: () => void;
  onOpenLocation?: () => void;
  onOpenTemplate?: () => void;
  disabled?: boolean;
  disabledReason?: string;
  fileAccept?: string;
}
