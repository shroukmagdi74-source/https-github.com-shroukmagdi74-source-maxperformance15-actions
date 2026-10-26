import { useEffect } from "react";
import { Message, Conversation } from "./types";

interface UseTelegramSocketOptions {
  socket: any;
  isConnected: boolean;
  companyId?: string;
  selectedConversationId: string | null;
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setIsTyping: (typing: boolean) => void;
  scrollToBottom: () => void;
}

export function useTelegramSocket({
  socket,
  isConnected,
  companyId,
  selectedConversationId,
  setConversations,
  setMessages,
  setIsTyping,
  scrollToBottom,
}: UseTelegramSocketOptions) {
  useEffect(() => {
    if (!socket || !isConnected || !companyId) return;

    socket.emit("join_company_room", { companyId });

    const handleNewMessage = (data: any) => {
      const isTelegram =
        data.platform === "telegram" || data.channel === "TELEGRAM";
      if (!isTelegram || String(data.companyId) !== String(companyId)) return;

      setConversations((prev) => {
        const exists = prev.find((c) => c.id === data.conversationId);
        if (exists) {
          return prev.map((c) =>
            c.id === data.conversationId
              ? {
                  ...c,
                  lastMessage: data.content,
                  lastMessageTime: new Date(),
                  unreadCount:
                    data.conversationId === selectedConversationId
                      ? 0
                      : c.unreadCount + 1,
                }
              : c,
          );
        }
        return prev;
      });

      if (selectedConversationId === data.conversationId) {
        const newMsg: Message = {
          id: data.id || Date.now().toString(),
          content: data.content,
          senderId: data.senderId,
          senderName: data.senderName,
          timestamp: new Date(data.timestamp || Date.now()),
          type: (data.type || "text").toLowerCase(),
          isFromCustomer: data.isFromCustomer,
          status: "delivered",
          conversationId: data.conversationId,
          fileUrl:
            data.fileUrl ||
            (data.metadata
              ? (typeof data.metadata === "string"
                  ? JSON.parse(data.metadata)
                  : data.metadata
                ).fileUrl
              : undefined),
          fileName:
            data.fileName ||
            (data.metadata
              ? (typeof data.metadata === "string"
                  ? JSON.parse(data.metadata)
                  : data.metadata
                ).fileName
              : undefined),
          location:
            data.location ||
            (data.metadata
              ? (typeof data.metadata === "string"
                  ? JSON.parse(data.metadata)
                  : data.metadata
                ).location
              : undefined),
          duration:
            data.duration ||
            (data.metadata
              ? (typeof data.metadata === "string"
                  ? JSON.parse(data.metadata)
                  : data.metadata
                ).duration
              : undefined),
        };

        setMessages((prev) => {
          const existsById = prev.some((msg) => msg.id === newMsg.id);
          if (existsById) return prev;

          const tempMessageIndex = prev.findIndex(
            (msg) =>
              msg.id.startsWith("temp_") &&
              msg.content === newMsg.content &&
              !msg.isFromCustomer === !newMsg.isFromCustomer &&
              Math.abs(
                new Date(msg.timestamp).getTime() -
                  new Date(newMsg.timestamp).getTime(),
              ) < 5000,
          );

          if (tempMessageIndex !== -1) {
            const updated = [...prev];
            updated[tempMessageIndex] = newMsg;
            return updated.sort(
              (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime(),
            );
          }

          const updated = [...prev, newMsg];
          return updated.sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
          );
        });
        setTimeout(scrollToBottom, 100);
      }
    };

    const handleTyping = (data: any) => {
      if (
        data.conversationId === selectedConversationId &&
        data.isFromCustomer
      ) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("typing", handleTyping);
    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("typing", handleTyping);
    };
  }, [
    socket,
    isConnected,
    selectedConversationId,
    companyId,
    setConversations,
    setMessages,
    setIsTyping,
    scrollToBottom,
  ]);
}
