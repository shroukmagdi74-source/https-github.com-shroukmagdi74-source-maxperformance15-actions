import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import apiService, {
  Message,
  Conversation,
  SavedReply,
  CustomerProfile as CustomerProfileType,
} from "../../../services/apiService";
import { config } from "../../../config";
import { tokenManager } from "../../../utils/tokenManager";
import {
  ConversationFilter,
  MOCK_CONVERSATIONS,
  MOCK_SAVED_REPLIES,
  buildMockMessages,
  buildMockCustomerProfile,
  isMockConversation,
} from "./types";

export function useMessengerChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSavedReplies, setShowSavedReplies] = useState(false);
  const [showCustomerProfile, setShowCustomerProfile] = useState(false);
  const [customerProfile, setCustomerProfile] =
    useState<CustomerProfileType | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [conversationToDelete, setConversationToDelete] =
    useState<Conversation | null>(null);
  const [conversationFilter, setConversationFilter] =
    useState<ConversationFilter>("all");
  const [savedReplies, setSavedReplies] = useState<SavedReply[]>([]);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(
    new Set(),
  );
  const [usingMockConversations, setUsingMockConversations] = useState(false);

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const realMessages = await apiService.getMessages(conversationId);
      const formattedMessages: Message[] = realMessages.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        senderId: msg.sender?.id || (msg.isFromCustomer ? "customer" : "agent"),
        senderName:
          msg.sender?.name || (msg.isFromCustomer ? "العميل" : "المندوب"),
        timestamp: new Date(msg.timestamp),
        status: "read",
        type: msg.type || "text",
        conversationId: conversationId,
        isFromCustomer: msg.isFromCustomer,
        repliedBy: msg.isFromCustomer
          ? undefined
          : msg.sender?.name || "المندوب",
        attachments: msg.attachments || [],
        isFacebookReply: msg.isFacebookReply || false,
        facebookMessageId: msg.facebookMessageId || null,
      }));
      setMessages(formattedMessages);
    } catch {
      setMessages([]);
    }
  }, []);

  const loadSavedReplies = useCallback(async () => {
    try {
      const fetchedReplies = await apiService.getSavedReplies();
      if (Array.isArray(fetchedReplies) && fetchedReplies.length > 0) {
        setSavedReplies(fetchedReplies);
      } else {
        setSavedReplies(MOCK_SAVED_REPLIES);
      }
    } catch {
      setSavedReplies(MOCK_SAVED_REPLIES);
    }
  }, []);

  const loadCustomerProfile = useCallback(
    async (customerId: string, fallbackName?: string) => {
      try {
        const profile = await apiService.getCustomerProfile(customerId);
        setCustomerProfile(
          profile ||
            buildMockCustomerProfile(customerId, fallbackName || "عميل"),
        );
      } catch {
        setCustomerProfile(
          buildMockCustomerProfile(customerId, fallbackName || "عميل"),
        );
      }
    },
    [],
  );

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedConversations = await apiService.getConversations();
      if (Array.isArray(fetchedConversations)) {
        setConversations(fetchedConversations);
        setUsingMockConversations(false);
        if (fetchedConversations.length > 0) {
          setSelectedConversation(fetchedConversations[0]);
        }
      } else {
        setUsingMockConversations(true);
        setConversations(MOCK_CONVERSATIONS);
        setSelectedConversation(MOCK_CONVERSATIONS[0]);
      }
    } catch {
      setUsingMockConversations(true);
      setConversations(MOCK_CONVERSATIONS);
      setSelectedConversation(MOCK_CONVERSATIONS[0]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
    loadSavedReplies();
  }, [loadConversations, loadSavedReplies]);

  // Load messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      if (usingMockConversations || isMockConversation(selectedConversation)) {
        setMessages(buildMockMessages(selectedConversation));
        setCustomerProfile(
          buildMockCustomerProfile(
            selectedConversation.customerId,
            selectedConversation.customerName,
          ),
        );
        return;
      }

      loadMessages(selectedConversation.id);
      if (selectedConversation.customerId) {
        loadCustomerProfile(
          selectedConversation.customerId,
          selectedConversation.customerName,
        );
      }
    }
  }, [selectedConversation, usingMockConversations, loadMessages, loadCustomerProfile]);

  // Auto-refresh messages every 5 seconds for the selected conversation
  useEffect(() => {
    if (selectedConversation && !usingMockConversations) {
      const interval = setInterval(() => {
        loadMessages(selectedConversation.id);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [selectedConversation, usingMockConversations, loadMessages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleToggleAi = async () => {
    if (!selectedConversation) return;
    const newStatus = selectedConversation.aiEnabled === false;
    try {
      await apiService.updateConversation(selectedConversation.id, {
        aiEnabled: newStatus,
      });
      setSelectedConversation((prev) =>
        prev ? { ...prev, aiEnabled: newStatus } : null,
      );
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === selectedConversation.id) {
            return { ...c, aiEnabled: newStatus };
          }
          return c;
        }),
      );
    } catch (error) {
      console.error("Failed to toggle AI status:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const tempMessageId = Date.now().toString();
    const messageContent = newMessage.trim();

    try {
      setSending(true);

      const messageToSend: Omit<Message, "id" | "timestamp" | "status"> = {
        content: messageContent,
        senderId: "agent1",
        senderName: "أنت",
        type: "text",
        isFromCustomer: false,
        conversationId: selectedConversation.id,
      };

      const tempMessage: Message = {
        ...messageToSend,
        id: tempMessageId,
        timestamp: new Date(),
        status: "sending",
      };

      setMessages((prev) => [...prev, tempMessage]);
      setNewMessage("");

      if (usingMockConversations) {
        const mockSavedMessage: Message = {
          ...tempMessage,
          status: "sent",
        };

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempMessageId ? mockSavedMessage : msg,
          ),
        );
        return;
      }

      const token = tokenManager.getAccessToken();
      const response = await fetch(
        `${config.apiUrl}/conversations/${selectedConversation.id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: messageContent }),
        },
      );

      if (response.ok) {
        const payload = await response.json().catch(() => null);
        const savedMessage = payload?.data ?? payload;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempMessageId
              ? {
                  ...msg,
                  ...savedMessage,
                  content: savedMessage?.content ?? messageContent,
                  status: "sent",
                }
              : msg,
          ),
        );
      } else {
        throw new Error("فشل في إرسال الرسالة");
      }
    } catch (error) {
      console.error("خطأ في إرسال الرسالة:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessageId ? { ...msg, status: "error" } : msg,
        ),
      );
    } finally {
      setSending(false);
    }
  };

  const handleDeleteConversation = async (conversation: Conversation) => {
    try {
      await apiService.deleteConversation(conversation.id);
      setConversations((prev) =>
        prev.filter((conv) => conv.id !== conversation.id),
      );
      if (selectedConversation?.id === conversation.id) {
        setSelectedConversation(null);
        setMessages([]);
      }
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const useSavedReply = (reply: SavedReply) => {
    setNewMessage(reply.content);
    setShowSavedReplies(false);
  };

  const handleFileUpload = async (file: File) => {
    if (!selectedConversation) return;

    try {
      const fileUrl = URL.createObjectURL(file);
      const messageToSend: Partial<Message> = {
        content: file.name,
        senderId: "currentUserId",
        senderName: "أنت",
        timestamp: new Date(),
        status: "sent",
        type: "image",
        conversationId: selectedConversation.id,
        isFromCustomer: false,
        repliedBy: "أنت",
        fileUrl: fileUrl,
        fileName: file.name,
        fileSize: file.size,
      };

      setMessages((prev) => [...prev, messageToSend as Message]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const toggleMessageExpansion = (messageId: string) => {
    setExpandedMessages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const filteredConversations = useMemo(() => {
    if (!Array.isArray(conversations)) return [];
    return conversations.filter((conv: Conversation) => {
      const matchesSearch =
        conv.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        conversationFilter === "all" || conv.status === conversationFilter;
      return matchesSearch && matchesFilter;
    });
  }, [conversations, searchQuery, conversationFilter]);

  return {
    conversations,
    filteredConversations,
    messages,
    selectedConversation,
    setSelectedConversation,
    newMessage,
    setNewMessage,
    loading,
    searchQuery,
    setSearchQuery,
    sending,
    typingUsers,
    setTypingUsers,
    messagesEndRef,
    messagesContainerRef,
    fileInputRef,
    showSavedReplies,
    setShowSavedReplies,
    showCustomerProfile,
    setShowCustomerProfile,
    customerProfile,
    showDeleteModal,
    setShowDeleteModal,
    conversationToDelete,
    setConversationToDelete,
    conversationFilter,
    setConversationFilter,
    savedReplies,
    expandedMessages,
    usingMockConversations,
    loadConversations,
    loadMessages,
    handleToggleAi,
    handleSendMessage,
    handleDeleteConversation,
    handleSelectConversation,
    useSavedReply,
    handleFileUpload,
    toggleMessageExpansion,
  };
}
