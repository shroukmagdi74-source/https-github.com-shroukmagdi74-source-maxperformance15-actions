export interface ChatInputPeer {
  className: string;
  peerType?: string;
  id?: string;
  userId?: string;
  chatId?: string;
  channelId?: string;
  accessHash?: string | null;
}

export interface Chat {
  id: string;
  legacyId?: string;
  peerType?: string;
  accessHash?: string | null;
  inputPeer?: ChatInputPeer | null;
  name: string;
  unreadCount: number;
  lastMessage: string;
  date: number;
  isGroup: boolean;
  isUser: boolean;
  isChannel: boolean;
}

export interface MessageMedia {
  type: string;
  [key: string]: any;
}

export interface Message {
  id: number | string;
  text: string;
  date: number;
  senderId: string | null;
  senderName?: string;
  isOut: boolean;
  media: MessageMedia | null | boolean;
}

export interface UserbotSummary {
  id: string;
  label?: string;
  clientPhone?: string;
  sessionString?: string | null;
  [key: string]: any;
}

export interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
  requiresReauth?: boolean;
}

export type TelegramStep = "SELECT" | "LOGIN" | "VERIFY" | "CHATS";
