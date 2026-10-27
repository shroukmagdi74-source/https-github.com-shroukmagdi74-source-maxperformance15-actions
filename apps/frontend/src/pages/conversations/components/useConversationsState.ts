import { useState, useEffect, useRef, useCallback } from "react";
import i18n from "../../../i18n";
import { buildApiUrl } from "../../../utils/urlHelper";
import { useDateFormat } from "../../../hooks/useDateFormat";
import { Conversation } from "./types";
import { useConversationsSocket } from "./useConversationsSocket";

export const useConversationsState = () => {
  const { formatDate } = useDateFormat();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAutoUpdating, setIsAutoUpdating] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isConnected = false;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  }, []);

  const handleTypingStart = useCallback(() => {
    if (!isUserTyping) setIsUserTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsUserTyping(false);
    }, 2000);
  }, [isUserTyping]);

  const loadConversations = useCallback(
    async (showAutoUpdateIndicator = false) => {
      try {
        const now = Date.now();
        if (showAutoUpdateIndicator && now - lastUpdateTime < 2000) return;

        if (showAutoUpdateIndicator) {
          setIsAutoUpdating(true);
          setLastUpdateTime(now);
        } else {
          setLoading(true);
        }

        const response = await fetch(buildApiUrl("conversations"));
        const data = await response.json();

        if (data.success) {
          const formatted: Conversation[] = data.data.map((conv: any) => ({
            id: conv.id,
            customerName: conv.customerName || "عميل غير معروف",
            lastMessage: conv.lastMessage || "لا توجد رسائل",
            lastMessageTime: new Date(conv.lastMessageTime || Date.now()),
            unreadCount: conv.unreadCount || 0,
            platform: conv.platform || "unknown",
            isOnline: false,
            messages: [],
            pageName: conv.pageName || null,
            pageId: conv.pageId || null,
          }));
          setConversations(formatted);
        }
      } catch (error) {
        console.error("Error loading conversations:", error);
      } finally {
        setLoading(false);
        setIsAutoUpdating(false);
      }
    },
    [lastUpdateTime],
  );

  const loadMessages = useCallback(
    async (conversationId: string, silent = false) => {
      try {
        const response = await fetch(
          buildApiUrl(`conversations/${conversationId}/messages`),
        );
        const data = await response.json();

        if (data.success) {
          const currentMessages = selectedConversation?.messages || [];
          const hasNew =
            currentMessages.length !== data.data.length ||
            data.data.some(
              (msg: any, index: number) =>
                !currentMessages[index] || currentMessages[index].id !== msg.id,
            );

          if (hasNew) {
            setConversations((prev) =>
              prev.map((c) =>
                c.id === conversationId ? { ...c, messages: data.data } : c,
              ),
            );

            if (selectedConversation?.id === conversationId) {
              setSelectedConversation((prev) =>
                prev ? { ...prev, messages: data.data } : null,
              );
            }

            if (silent && data.data.length > currentMessages.length) {
              const latestMsg = data.data[data.data.length - 1];
              if (latestMsg?.isFromCustomer) {
                setHasNewMessages(true);
                if (typeof document !== "undefined") {
                  document.title = "🔔 رسالة جديدة - منصة التواصل";
                }
                try {
                  const audio = new Audio(
                    "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT",
                  );
                  audio.volume = 0.3;
                  audio.play().catch(() => {});
                } catch {}
              }
            }
          }
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    },
    [selectedConversation],
  );

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const messageContent = newMessage;
    setNewMessage("");

    try {
      const url = buildApiUrl(`conversations/${selectedConversation.id}/messages`);
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageContent }),
      });

      const data = await response.json();
      if (data.success) {
        await loadMessages(selectedConversation.id, true);
        setTimeout(scrollToBottom, 300);

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === selectedConversation.id
              ? {
                  ...conv,
                  lastMessage: messageContent,
                  lastMessageTime: new Date(),
                }
              : conv,
          ),
        );
      } else {
        alert("فشل في إرسال الرسالة: " + data.message);
        setNewMessage(messageContent);
      }
    } catch {
      alert(i18n.t("Conversations.error_error_e429"));
      setNewMessage(messageContent);
    }
  }, [newMessage, selectedConversation, loadMessages, scrollToBottom]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage],
  );

  const formatTime = useCallback(
    (date: Date | string) => {
      const now = new Date();
      const dateObj = typeof date === "string" ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return "غير محدد";

      const diff = now.getTime() - dateObj.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return "الآن";
      if (minutes < 60) return `منذ ${minutes} دقيقة`;
      if (hours < 24) return `منذ ${hours} ساعة`;
      if (days < 7) return `منذ ${days} يوم`;
      return formatDate(dateObj);
    },
    [formatDate],
  );

  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      const response = await fetch(buildApiUrl(`conversations/${conversationId}/read`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.success) {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv,
          ),
        );
      }
    } catch (error) {
      console.error("Error marking conversation as read:", error);
    }
  }, []);

  const handleSelectConversation = useCallback(
    (conversation: Conversation) => {
      if (selectedConversation?.id === conversation.id) return;

      setSelectedConversation(conversation);
      setHasNewMessages(false);
      if (typeof document !== "undefined") document.title = "منصة التواصل";

      loadMessages(conversation.id);
      if (conversation.unreadCount > 0) {
        markAsRead(conversation.id);
      }
    },
    [selectedConversation?.id, loadMessages, markAsRead],
  );

  const handleManualRefresh = useCallback(() => {
    loadConversations(true);
    if (selectedConversation) loadMessages(selectedConversation.id);
  }, [loadConversations, loadMessages, selectedConversation]);

  // Hook socket listeners
  useConversationsSocket({
    selectedConversation,
    setSelectedConversation,
    setConversations,
  });

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isUserTyping) loadConversations(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [isUserTyping, loadConversations]);

  useEffect(() => {
    if (!selectedConversation) return;
    const interval = setInterval(() => {
      if (!isUserTyping) loadMessages(selectedConversation.id, true);
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedConversation?.id, isUserTyping, loadMessages]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (
      selectedConversation &&
      (!selectedConversation.messages || selectedConversation.messages.length === 0)
    ) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation, loadMessages]);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    if (selectedConversation) {
      document.body.classList.add("app-shell-chat-active");
    } else {
      document.body.classList.remove("app-shell-chat-active");
    }
    return () => {
      document.body.classList.remove("app-shell-chat-active");
    };
  }, [selectedConversation]);

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return {
    conversations,
    filteredConversations,
    loading,
    selectedConversation,
    newMessage,
    searchQuery,
    isAutoUpdating,
    isUserTyping,
    hasNewMessages,
    showScrollButton,
    isConnected,
    messagesEndRef,
    messagesContainerRef,
    setNewMessage,
    setSearchQuery,
    setSelectedConversation,
    handleScroll,
    handleTypingStart,
    handleSendMessage,
    handleKeyPress,
    handleSelectConversation,
    handleManualRefresh,
    scrollToBottom,
    formatTime,
  };
};
