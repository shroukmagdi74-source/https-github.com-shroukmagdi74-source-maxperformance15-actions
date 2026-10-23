import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { apiClient } from '../../../services/apiClient';
import { socketService } from '../../../services/socketService';
import { getWhatsAppInboxWorkspaceCopy } from '../workspaceCopy';
import type {
  ConversationApiResponse,
  ConversationDetail,
  CustomerOrder,
  WhatsAppChatProps,
} from './types';

export function useWhatsAppChatController({ companyId, superAdminMode }: WhatsAppChatProps) {
  const { conversationId } = useParams();
  const apiBase = superAdminMode ? '/api/v1/admin/whatsapp-inbox' : '/api/v1/whatsapp-inbox';
  const apiParams = useMemo(
    () => (superAdminMode && companyId ? { params: { companyId } } : undefined),
    [superAdminMode, companyId],
  );
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const copy = useMemo(() => getWhatsAppInboxWorkspaceCopy(i18n.language), [i18n.language]);

  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [noteDraft, setNoteDraft] = useState('');
  const [transferTarget, setTransferTarget] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [selectedMentionIds, setSelectedMentionIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showServiceOrderModal, setShowServiceOrderModal] = useState(false);
  const [showQuickCreateTaskModal, setShowQuickCreateTaskModal] = useState(false);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [correctionText, setCorrectionText] = useState('');
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const currentRole = useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return String(user.role || '').toUpperCase();
    } catch {
      return '';
    }
  }, []);

  const navigateToInbox = useCallback(() => {
    if (superAdminMode && companyId) {
      navigate(`/super-admin/whatsapp/companies/${companyId}/routing`);
    } else {
      navigate('/whatsapp/routing');
    }
  }, [companyId, navigate, superAdminMode]);

  const loadConversation = useCallback(async () => {
    if (!conversationId) return;

    try {
      const response = await apiClient.get<ConversationApiResponse>(
        `${apiBase}/conversations/${conversationId}`,
        apiParams,
      );
      if (response.data?.success) {
        setConversation(response.data.conversation);
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number } } | undefined;
      if (axiosError?.response?.status === 403 || axiosError?.response?.status === 404) {
        navigateToInbox();
      }
    } finally {
      setLoading(false);
    }
  }, [conversationId, navigateToInbox, apiBase, apiParams]);

  const fetchCustomerOrders = useCallback(async (customerId: string) => {
    if (!customerId) return;
    setLoadingOrders(true);
    try {
      const response = await apiClient.get(`/customers/${customerId}/orders`);
      if ((response as any).data?.success) {
        setCustomerOrders((response as any).data.data || []);
      }
    } catch {
      setCustomerOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  useEffect(() => {
    if (conversation?.customer?.id) {
      fetchCustomerOrders(conversation.customer.id);
    }
  }, [conversation?.customer?.id, fetchCustomerOrders]);

  useEffect(() => {
    if (!conversationId) return;

    socketService.joinConversation(conversationId);

    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    const scheduleRefresh = () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        refreshTimer = null;
        void loadConversation();
      }, 800);
    };

    socketService.on('conversation:updated', scheduleRefresh);
    socketService.on('conversation:assignment', scheduleRefresh);
    socketService.on('whatsapp:message:new', scheduleRefresh);
    socketService.on('whatsapp:message:sent', scheduleRefresh);

    return () => {
      socketService.leaveConversation(conversationId);
      if (refreshTimer) {
        clearTimeout(refreshTimer);
        refreshTimer = null;
      }
      socketService.off('conversation:updated', scheduleRefresh);
      socketService.off('conversation:assignment', scheduleRefresh);
      socketService.off('whatsapp:message:new', scheduleRefresh);
      socketService.off('whatsapp:message:sent', scheduleRefresh);
    };
  }, [conversationId, loadConversation]);

  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation?.messages]);

  const sendMessage = async () => {
    if (!draft.trim() || !conversationId) return;
    setSaving(true);
    try {
      await apiClient.post(
        `${apiBase}/conversations/${conversationId}/messages${superAdminMode && companyId ? `?companyId=${companyId}` : ''}`,
        {
          content: draft,
          type: 'TEXT',
        },
      );
      setDraft('');
      await loadConversation();
    } finally {
      setSaving(false);
    }
  };

  const sendSms = async () => {
    if (!draft.trim() || !conversationId) return;
    setSaving(true);
    try {
      await apiClient.post(
        `${apiBase}/conversations/${conversationId}/send-sms${superAdminMode && companyId ? `?companyId=${companyId}` : ''}`,
        {
          content: draft,
        },
      );
      setDraft('');
      await loadConversation();
      toast.success(copy.isArabic ? 'تم إرسال رسالة SMS للعميل بنجاح' : 'SMS sent successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.message || 'فشل إرسال رسالة SMS');
    } finally {
      setSaving(false);
    }
  };

  const sendProductImages = async (
    product: { id: string; name: string; price: number | string },
    images: Array<{ url: string; filename: string }>,
    includeDetails: boolean,
  ) => {
    if (!conversationId || images.length === 0) return;
    setSaving(true);
    setShowProductPicker(false);
    try {
      if (includeDetails) {
        await apiClient.post(
          `${apiBase}/conversations/${conversationId}/messages${superAdminMode && companyId ? `?companyId=${companyId}` : ''}`,
          {
            content: `${product.name}\nالسعر: ${product.price} ج.م`,
            type: 'TEXT',
          },
        );
      }
      for (const image of images) {
        await apiClient.post(
          `${apiBase}/conversations/${conversationId}/send-existing-image${superAdminMode && companyId ? `?companyId=${companyId}` : ''}`,
          {
            imageUrl: image.url,
            filename: image.filename,
          },
        );
        if (images.length > 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
      await loadConversation();
    } catch (error: any) {
      alert(error.response?.data?.error || error.message || 'فشل إرسال صور المنتج');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectImageFromGallery = async (imageUrl: string, filename: string) => {
    if (!conversationId) return;
    setSaving(true);
    setShowImageGallery(false);
    try {
      await apiClient.post(
        `${apiBase}/conversations/${conversationId}/send-existing-image${superAdminMode && companyId ? `?companyId=${companyId}` : ''}`,
        {
          imageUrl,
          filename,
        },
      );
      await loadConversation();
      toast.success(copy.isArabic ? 'تم إرسال الصورة بنجاح' : 'Image sent successfully');
    } catch (error: any) {
      alert(error.response?.data?.error || error.message || 'فشل إرسال الصورة');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectMultipleImagesFromGallery = async (images: Array<{ url: string; filename: string }>) => {
    if (!conversationId || images.length === 0) return;
    setSaving(true);
    setShowImageGallery(false);
    try {
      for (const image of images) {
        await apiClient.post(
          `${apiBase}/conversations/${conversationId}/send-existing-image${superAdminMode && companyId ? `?companyId=${companyId}` : ''}`,
          {
            imageUrl: image.url,
            filename: image.filename,
          },
        );
        if (images.length > 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
      await loadConversation();
      toast.success(copy.isArabic ? `تم إرسال ${images.length} صورة بنجاح` : `Sent ${images.length} images`);
    } catch (error: any) {
      alert(error.response?.data?.error || error.message || 'فشل إرسال الصور');
    } finally {
      setSaving(false);
    }
  };

  const submitCorrection = async (messageId: string) => {
    if (!correctionText.trim() || !conversationId) return;
    setSaving(true);
    try {
      await apiClient.post(
        `${apiBase}/conversations/${conversationId}/messages/${messageId}/correct${superAdminMode && companyId ? `?companyId=${companyId}` : ''}`,
        {
          correction: correctionText.trim(),
        },
      );
      setEditingMessageId(null);
      setCorrectionText('');
      await loadConversation();
    } catch (error: any) {
      alert(error.response?.data?.error || error.message || 'فشل إرسال التصحيح');
    } finally {
      setSaving(false);
    }
  };

  const addNote = async (requestAssistance = false) => {
    if (!noteDraft.trim() || !conversationId) return;
    setSaving(true);
    try {
      await apiClient.post('/api/v1/internal-notes', {
        conversationId,
        content: noteDraft,
        mentionUserIds: selectedMentionIds,
        requestAssistance,
        isInternal: true,
      });
      setNoteDraft('');
      setSelectedMentionIds([]);
      await loadConversation();
    } finally {
      setSaving(false);
    }
  };

  const addTag = async () => {
    if (!tagInput.trim() || !conversationId) return;
    await apiClient.post('/api/v1/internal-notes/tags', {
      conversationId,
      tag: tagInput.trim(),
    });
    setTagInput('');
    await loadConversation();
  };

  const removeTag = async (tagId: string) => {
    await apiClient.delete(`/api/v1/internal-notes/tags/${tagId}`);
    await loadConversation();
  };

  const updateStatus = async (status: string) => {
    if (!conversationId) return;
    await apiClient.patch(
      `${apiBase}/conversations/${conversationId}/status${superAdminMode && companyId ? `?companyId=${companyId}` : ''}`,
      { status },
    );
    await loadConversation();
  };

  const transferConversation = async () => {
    if (!conversationId || !transferTarget) return;
    await apiClient.post(
      `${apiBase}/conversations/${conversationId}/transfer${superAdminMode && companyId ? `?companyId=${companyId}` : ''}`,
      {
        toUserId: transferTarget,
        note: noteDraft || undefined,
      },
    );
    setTransferTarget('');
    setNoteDraft('');
    await loadConversation();
  };

  const toggleMention = (userId: string) => {
    setSelectedMentionIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  const canTransfer =
    Boolean(conversation?.canTransfer) &&
    ['SUPER_ADMIN', 'COMPANY_ADMIN', 'MANAGER', 'TEAM_LEADER'].includes(currentRole || '');

  return {
    conversationId,
    conversation,
    loading,
    saving,
    draft,
    setDraft,
    noteDraft,
    setNoteDraft,
    transferTarget,
    setTransferTarget,
    tagInput,
    setTagInput,
    selectedMentionIds,
    toggleMention,
    editingMessageId,
    setEditingMessageId,
    correctionText,
    setCorrectionText,
    showDetailsPanel,
    setShowDetailsPanel,
    showOrderModal,
    setShowOrderModal,
    showServiceOrderModal,
    setShowServiceOrderModal,
    showQuickCreateTaskModal,
    setShowQuickCreateTaskModal,
    showProductPicker,
    setShowProductPicker,
    showImageGallery,
    setShowImageGallery,
    customerOrders,
    loadingOrders,
    messagesEndRef,
    copy,
    canTransfer,
    navigateToInbox,
    sendMessage,
    sendSms,
    sendProductImages,
    handleSelectImageFromGallery,
    handleSelectMultipleImagesFromGallery,
    submitCorrection,
    addNote,
    addTag,
    removeTag,
    updateStatus,
    transferConversation,
    loadConversation,
  };
}
