export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  type:
    | "text"
    | "image"
    | "video"
    | "audio"
    | "document"
    | "location"
    | "contact"
    | "voice";
  isFromCustomer: boolean;
  status: "sent" | "delivered" | "read" | "failed" | "sending";
  conversationId: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  isAiGenerated?: boolean;
  replyToMessageId?: string;
  location?: { latitude: number; longitude: number };
  duration?: number;
}

export interface Conversation {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  platform: "telegram";
  isOnline: boolean;
  messages: Message[];
  telegramBotId?: string;
  aiEnabled?: boolean;
}
