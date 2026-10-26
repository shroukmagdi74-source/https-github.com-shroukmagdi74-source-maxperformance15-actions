import { useState, useEffect, useMemo } from "react";
import { companyAwareApi } from "../../../services/companyAwareApi";
import { Conversation } from "./types";

interface UseTelegramConversationsOptions {
  isAuthenticated: boolean;
  companyId?: string;
}

export function useTelegramConversations({
  isAuthenticated,
  companyId,
}: UseTelegramConversationsOptions) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isAuthenticated || !companyId) return;

    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await companyAwareApi.getConversations({
          page: 1,
          limit: 50,
          platform: "telegram",
        });

        if (response.data && response.data.data) {
          const formatted = response.data.data.map((c: any) => ({
            id: c.id,
            customerId: c.customerId,
            customerName: c.customerName || "Telegram User",
            lastMessage: c.lastMessage || "",
            lastMessageTime: new Date(c.lastMessageTime || Date.now()),
            unreadCount: c.unreadCount || 0,
            platform: "telegram",
            isOnline: false,
            messages: [],
            aiEnabled: c.aiEnabled !== false,
          }));
          setConversations(formatted);
        }
      } catch (error) {
        console.error("Failed to load Telegram conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [isAuthenticated, companyId]);

  const filteredConversations = useMemo(() => {
    return conversations.filter(
      (c) =>
        c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [conversations, searchQuery]);

  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === selectedConversationId);
  }, [conversations, selectedConversationId]);

  return {
    conversations,
    setConversations,
    selectedConversationId,
    setSelectedConversationId,
    loading,
    searchQuery,
    setSearchQuery,
    filteredConversations,
    activeConversation,
  };
}
