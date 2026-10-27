export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  type: "text" | "image" | "file";
  isFromCustomer: boolean;
  status: "sent" | "delivered" | "read";
  metadata?: any;
}

export type Platform = "facebook" | "whatsapp" | "telegram" | "unknown";

export interface Conversation {
  id: string;
  customerName: string;
  customerAvatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
  platform: Platform;
  messages: Message[];
  pageName?: string | null;
  pageId?: string | null;
}
