import { useState, useEffect, useRef, useMemo } from "react";
import { toast } from "sonner";
import { tToast } from "../../../utils/i18n-toast";
import { companyAwareApi } from "../../../services/companyAwareApi";
import { Message, Conversation } from "./types";
import { useTelegramSocket } from "./useTelegramSocket";

interface UseTelegramMessagesOptions {
  selectedConversationId: string | null;
  activeConversation?: Conversation;
  companyId?: string;
  userId?: string;
  socket: any;
  isConnected: boolean;
  isRTL: boolean;
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
}

export function useTelegramMessages({
  selectedConversationId,
  activeConversation,
  companyId,
  userId,
  socket,
  isConnected,
  isRTL,
  setConversations,
}: UseTelegramMessagesOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [isInfoOpen, setIsInfoOpen] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [showFileMenu, setShowFileMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load Messages for selected conversation
  useEffect(() => {
    if (!selectedConversationId) return;

    const fetchMessages = async () => {
      try {
        const response = await companyAwareApi.get(
          `/conversations/${selectedConversationId}/messages`,
        );
        const data = response.data.data || [];

        const loadedMessages: Message[] = data.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          senderId: msg.senderId || "unknown",
          senderName: msg.isFromCustomer ? "Customer" : "Agent",
          timestamp: new Date(msg.createdAt || Date.now()),
          type: (msg.type || "text").toLowerCase(),
          isFromCustomer: msg.isFromCustomer,
          status: "read",
          conversationId: selectedConversationId,
          fileUrl:
            msg.fileUrl ||
            (msg.metadata
              ? JSON.parse(msg.metadata || "{}").fileUrl
              : undefined),
          fileName:
            msg.fileName ||
            (msg.metadata
              ? JSON.parse(msg.metadata || "{}").fileName
              : undefined),
          fileSize:
            msg.fileSize ||
            (msg.metadata
              ? JSON.parse(msg.metadata || "{}").fileSize
              : undefined),
          location:
            msg.location ||
            (msg.metadata
              ? JSON.parse(msg.metadata || "{}").location
              : undefined),
          duration:
            msg.duration ||
            (msg.metadata
              ? JSON.parse(msg.metadata || "{}").duration
              : undefined),
        }));

        const sortedMessages = loadedMessages.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        );

        setMessages(sortedMessages);
        setTimeout(scrollToBottom, 100);
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    };

    fetchMessages();
  }, [selectedConversationId]);

  // Realtime Socket listener
  useTelegramSocket({
    socket,
    isConnected,
    companyId,
    selectedConversationId,
    setConversations,
    setMessages,
    setIsTyping,
    scrollToBottom,
  });

  const handleSendMessage = async () => {
    if (!selectedConversationId || !inputText.trim()) return;

    const messageContent = inputText.trim();
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tempMsg: Message = {
      id: tempId,
      content: messageContent,
      senderId: userId || "me",
      senderName: "Me",
      timestamp: new Date(),
      type: "text",
      isFromCustomer: false,
      status: "sending",
      conversationId: selectedConversationId,
      replyToMessageId: replyingTo?.id,
    };

    setMessages((prev) => {
      const updated = [...prev, tempMsg];
      return updated.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
    });
    setInputText("");
    setReplyingTo(null);
    setTimeout(scrollToBottom, 100);

    try {
      const response = await companyAwareApi.post(
        `/conversations/${selectedConversationId}/messages`,
        {
          message: messageContent,
          type: "text",
          replyToMessageId: replyingTo?.id,
        },
      );

      if (response.data.success && response.data.data) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId
              ? { ...msg, id: response.data.data.id, status: "sent" }
              : msg,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to send:", error);
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    }
  };

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "video" | "audio" | "document",
  ) => {
    if (!e.target.files || !e.target.files[0] || !selectedConversationId)
      return;

    const file = e.target.files[0];
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const tempMsg: Message = {
      id: tempId,
      content: `[${type}]`,
      senderId: userId || "me",
      senderName: "Me",
      timestamp: new Date(),
      type: type,
      isFromCustomer: false,
      status: "sending",
      conversationId: selectedConversationId,
      fileName: file.name,
      fileSize: file.size,
    };

    setMessages((prev) => {
      const updated = [...prev, tempMsg];
      return updated.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
    });
    setTimeout(scrollToBottom, 100);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    try {
      const response = await companyAwareApi.post(
        `/conversations/${selectedConversationId}/messages/media`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (response.data.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId
              ? { ...msg, id: response.data.data.id, status: "sent" }
              : msg,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to upload file:", error);
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      alert(isRTL ? "فشل رفع الملف" : "Failed to upload file");
    }
  };

  const handleSendLocation = async () => {
    if (!selectedConversationId) return;

    if (!navigator.geolocation) {
      alert(
        isRTL ? "المتصفح لا يدعم تحديد الموقع" : "Geolocation not supported",
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const response = await companyAwareApi.post(
          `/conversations/${selectedConversationId}/messages`,
          {
            type: "location",
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        );

        if (response.data.success) {
          const newMsg: Message = {
            id: response.data.data.id || Date.now().toString(),
            content: "",
            senderId: userId || "me",
            senderName: "Me",
            timestamp: new Date(),
            type: "location",
            isFromCustomer: false,
            status: "sent",
            conversationId: selectedConversationId,
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          };
          setMessages((prev) => [...prev, newMsg]);
          setTimeout(scrollToBottom, 100);
        }
      } catch (error) {
        console.error("Failed to send location:", error);
      }
    });
  };

  const handleEditMessage = async (message: Message) => {
    if (!inputText.trim() || !selectedConversationId) return;

    try {
      await companyAwareApi.put(
        `/conversations/${selectedConversationId}/messages/${message.id}`,
        {
          content: inputText,
        },
      );

      setMessages((prev) =>
        prev.map((m) =>
          m.id === message.id ? { ...m, content: inputText } : m,
        ),
      );
      setEditingMessage(null);
      setInputText("");
    } catch (error) {
      console.error("Failed to edit message:", error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm(isRTL ? "هل تريد حذف هذه الرسالة؟" : "Delete this message?"))
      return;
    if (!selectedConversationId) return;

    try {
      await companyAwareApi.delete(
        `/conversations/${selectedConversationId}/messages/${messageId}`,
      );
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const handleForwardMessage = async () => {
    alert(isRTL ? "ميزة إعادة التوجيه قريباً" : "Forward feature coming soon");
  };

  const handleToggleAi = async () => {
    if (!selectedConversationId || !activeConversation) return;
    const newStatus = activeConversation.aiEnabled === false;
    try {
      await companyAwareApi.put(`/conversations/${selectedConversationId}`, {
        aiEnabled: newStatus,
      });
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversationId
            ? { ...c, aiEnabled: newStatus }
            : c,
        ),
      );
      toast.success(newStatus ? "تم تفعيل الرد الآلي" : "تم إيقاف الرد الآلي");
    } catch (err) {
      console.error(err);
      tToast.error("TelegramConversationsPro.failed_update_status_ffd1");
    }
  };

  const filteredMessages = useMemo(() => {
    return chatSearchQuery
      ? messages.filter((m) =>
          m.content.toLowerCase().includes(chatSearchQuery.toLowerCase()),
        )
      : messages;
  }, [messages, chatSearchQuery]);

  const mediaMessages = useMemo(() => {
    return messages.filter((m) =>
      ["image", "video", "document"].includes(m.type),
    );
  }, [messages]);

  return {
    messages,
    setMessages,
    inputText,
    setInputText,
    chatSearchQuery,
    setChatSearchQuery,
    isInfoOpen,
    setIsInfoOpen,
    isTyping,
    showMediaGallery,
    setShowMediaGallery,
    replyingTo,
    setReplyingTo,
    editingMessage,
    setEditingMessage,
    showFileMenu,
    setShowFileMenu,
    messagesEndRef,
    fileInputRef,
    videoInputRef,
    audioInputRef,
    documentInputRef,
    scrollToBottom,
    handleSendMessage,
    handleFileSelect,
    handleSendLocation,
    handleEditMessage,
    handleDeleteMessage,
    handleForwardMessage,
    handleToggleAi,
    filteredMessages,
    mediaMessages,
  };
}
