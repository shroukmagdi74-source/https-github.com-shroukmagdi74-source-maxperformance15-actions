import type {
  Message,
  Conversation,
  SavedReply,
  CustomerProfile as CustomerProfileType,
} from "../../../services/apiService";

export type ConversationFilter =
  | "all"
  | "new"
  | "active"
  | "archived"
  | "important";

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "mock-conversation-1",
    customerId: "mock-customer-1",
    customerName: "أحمد محمد",
    lastMessage: "مرحبا، أحتاج مساعدة",
    lastMessageTime: new Date(),
    status: "active",
    unreadCount: 2,
    platform: "facebook",
    messages: [],
  },
  {
    id: "mock-conversation-2",
    customerId: "mock-customer-2",
    customerName: "فاطمة علي",
    lastMessage: "شكرا لكم",
    lastMessageTime: new Date(),
    status: "active",
    unreadCount: 0,
    platform: "facebook",
    messages: [],
  },
];

export const MOCK_SAVED_REPLIES: SavedReply[] = [
  {
    id: "1",
    title: "ترحيب",
    content: "مرحباً بك! كيف يمكنني مساعدتك اليوم؟",
    category: "welcome",
    createdAt: new Date(),
  },
  {
    id: "2",
    title: "شكر",
    content: "شكراً لتواصلك معنا. نقدر ثقتك بنا.",
    category: "thanks",
    createdAt: new Date(),
  },
  {
    id: "3",
    title: "اعتذار",
    content: "نعتذر عن أي إزعاج. سنعمل على حل المشكلة فوراً.",
    category: "apology",
    createdAt: new Date(),
  },
];

export const buildMockMessages = (conversation: Conversation): Message[] => [
  {
    id: `${conversation.id}-incoming`,
    content: conversation.lastMessage,
    senderId: "customer",
    senderName: conversation.customerName,
    timestamp: new Date(),
    type: "text",
    isFromCustomer: true,
    status: "read",
    conversationId: conversation.id,
  },
];

export const buildMockCustomerProfile = (
  customerId: string,
  customerName: string,
): CustomerProfileType => ({
  id: customerId,
  name: customerName || "عميل",
  email: "customer@example.com",
  phone: "+201234567890",
  avatar: undefined,
  totalOrders: 0,
  lastOrder: undefined,
  customerSince: new Date(),
  notes: "ملف تجريبي لعرض الصفحة عند عدم توفر بيانات حقيقية.",
  rating: "B",
});

export const isMockConversation = (
  conversation: Conversation | null,
): boolean =>
  Boolean(
    conversation &&
      (conversation.id.startsWith("mock-") ||
        conversation.customerId?.startsWith("mock-")),
  );

export type { Message, Conversation, SavedReply, CustomerProfileType };
