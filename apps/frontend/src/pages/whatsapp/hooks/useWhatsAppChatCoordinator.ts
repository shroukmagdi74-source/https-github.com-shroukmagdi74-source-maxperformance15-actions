import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuthSimple';
import useSocket from '@/hooks/useSocket';
import type { Contact } from '@/hooks/useWhatsAppQueries';
import { useMarkAsRead } from '@/hooks/useWhatsAppMutations';

import { useWhatsAppChatData } from './useWhatsAppChatData';
import { useWhatsAppChatDialogs } from './useWhatsAppChatDialogs';
import { useWhatsAppChatNavigation } from './useWhatsAppChatNavigation';
import { useWhatsAppChatActions } from './useWhatsAppChatActions';
import { useWhatsAppChatSocket } from './useWhatsAppChatSocket';
import {
  getBestContactDisplayName,
  getContactPhoneNumber,
} from '../whatsappContactDisplay';

export const useWhatsAppChatCoordinator = () => {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const markAsReadMutation = useMarkAsRead();
  const markAsReadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Modular Hooks
  const chatData = useWhatsAppChatData();
  const dialogs = useWhatsAppChatDialogs();

  const normalizeContactJid = useCallback((jid: string) => {
    if (!jid) return '';
    const parts = jid.split('@')[0];
    const bareJid = parts?.split(':')[0] || '';
    return bareJid.replace(/\D/g, '');
  }, []);

  const getContactName = useCallback((contact: Contact) => {
    return getBestContactDisplayName(contact);
  }, []);

  const getParticipantName = useCallback((participantJid: string) => {
    return participantJid ? normalizeContactJid(participantJid) : '';
  }, [normalizeContactJid]);

  // Actions Hook
  const chatActions = useWhatsAppChatActions({
    selectedContact: chatData.selectedContact,
    setSelectedContact: chatData.setSelectedContact,
    selectedSession: chatData.selectedSession,
    activeSessionId: chatData.activeSessionId,
    targetSessionId: chatData.targetSessionId,
    user,
    visibleMessages: chatData.visibleMessages,
    newMessage,
    setNewMessage,
    replyingTo: dialogs.replyingTo,
    setReplyingTo: dialogs.setReplyingTo,
    fileInputRef,
    setOrdersRefreshToken: dialogs.setOrdersRefreshToken,
    setShowImageGallery: dialogs.setShowImageGallery,
  });

  // Socket Hook
  useWhatsAppChatSocket({
    socket,
    selectedContact: chatData.selectedContact,
    setSelectedContact: chatData.setSelectedContact,
    selectedSession: chatData.selectedSession,
    setSelectedSession: chatData.setSelectedSession,
    conversations: chatData.conversations,
    normalizeContactJid,
    setTypingUsers,
    markAsReadMutation,
  });

  const markAsReadRef = useRef(markAsReadMutation);
  useEffect(() => {
    markAsReadRef.current = markAsReadMutation;
  }, [markAsReadMutation]);

  // Automatically mark conversation as read when opened/selected
  useEffect(() => {
    if (!chatData.selectedContact) return;
    const contact = chatData.selectedContact;
    if ((contact.unreadCount || 0) <= 0) return;

    const targetSessionId =
      contact.sessionId ||
      (chatData.selectedSession === 'all' ? null : chatData.selectedSession) ||
      chatData.activeSessionId;

    if (!targetSessionId || !contact.jid) return;

    if (markAsReadTimeoutRef.current) {
      clearTimeout(markAsReadTimeoutRef.current);
      markAsReadTimeoutRef.current = null;
    }

    markAsReadTimeoutRef.current = setTimeout(() => {
      markAsReadRef.current.mutate({
        sessionId: targetSessionId,
        remoteJid: contact.jid,
      });

      chatData.setSelectedContact((prev) =>
        prev && prev.jid === contact.jid ? { ...prev, unreadCount: 0 } : prev,
      );
    }, 200);

    return () => {
      if (markAsReadTimeoutRef.current) {
        clearTimeout(markAsReadTimeoutRef.current);
        markAsReadTimeoutRef.current = null;
      }
    };
  }, [
    chatData.selectedContact?.jid,
    chatData.selectedContact?.sessionId,
    chatData.selectedContact?.unreadCount,
    chatData.selectedSession,
    chatData.activeSessionId,
    chatData.setSelectedContact,
  ]);

  // Navigation Hook
  const chatNav = useWhatsAppChatNavigation({
    selectedContact: chatData.selectedContact,
    setSelectedContact: chatData.setSelectedContact,
    selectedSession: chatData.selectedSession,
    setSelectedSession: chatData.setSelectedSession,
    loadingSessions: chatData.loadingSessions,
    conversations: chatData.conversations,
    setNewMessage,
    normalizeContactJid,
  });

  const selectedContactPhoneNumber = chatData.selectedContact
    ? getContactPhoneNumber(chatData.selectedContact)
    : null;

  return {
    user,
    authLoading,
    isAuthenticated,
    queryClient,
    t,
    fileInputRef,
    newMessage,
    setNewMessage,
    typingUsers,
    chatData,
    dialogs,
    chatActions,
    chatNav,
    getContactName,
    getParticipantName,
    selectedContactPhoneNumber,
  };
};

export type WhatsAppChatCoordinator = ReturnType<typeof useWhatsAppChatCoordinator>;
