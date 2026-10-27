import { useEffect } from "react";
import { socketService } from "../../../services/socketService";
import { Conversation } from "./types";

interface UseConversationsSocketParams {
  selectedConversation: Conversation | null;
  setSelectedConversation: React.Dispatch<React.SetStateAction<Conversation | null>>;
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
}

export const useConversationsSocket = ({
  selectedConversation,
  setSelectedConversation,
  setConversations,
}: UseConversationsSocketParams) => {
  useEffect(() => {
    if (!socketService.isConnected()) {
      socketService.connect();
    }

    const handleNewMessage = (message: any) => {
      if (selectedConversation?.id === message.conversationId) {
        setSelectedConversation((prev: Conversation | null) => {
          if (!prev) return null;
          return {
            ...prev,
            messages: [...prev.messages, message],
          };
        });
      }

      setConversations((prev: Conversation[]) =>
        prev.map((conv: Conversation) => {
          if (conv.id === message.conversationId) {
            return {
              ...conv,
              lastMessage: message.content,
              lastMessageTime: new Date(message.timestamp),
              unreadCount: conv.unreadCount + (message.isFromCustomer ? 1 : 0),
            };
          }
          return conv;
        }),
      );
    };

    const handleNewConversation = (conversation: any) => {
      setConversations((prev: Conversation[]) => {
        const exists = prev.some((conv) => conv.id === conversation.id);
        if (exists) {
          return prev.map((conv) =>
            conv.id === conversation.id ? { ...conv, ...conversation } : conv,
          );
        }
        return [conversation, ...prev];
      });
    };

    const handleConversationUpdated = (conversation: any) => {
      setConversations((prev: Conversation[]) =>
        prev.map((conv) =>
          conv.id === conversation.id ? { ...conv, ...conversation } : conv,
        ),
      );
    };

    socketService.onMessage(handleNewMessage);
    socketService.onConversationUpdated(handleConversationUpdated);
    socketService.onNewConversation(handleNewConversation);

    return () => {
      socketService.off("new_message", handleNewMessage);
      socketService.off("conversation:updated", handleConversationUpdated);
      socketService.off("conversation:new", handleNewConversation);
    };
  }, [selectedConversation, setSelectedConversation, setConversations]);
};
