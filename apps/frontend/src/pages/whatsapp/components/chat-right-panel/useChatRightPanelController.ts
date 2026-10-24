import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useCustomerProfile } from '../../../../hooks/inbox/useCustomerProfile';
import { apiClient } from '../../../../services/apiClient';
import { customerService } from '../../../../services/customerService';
import { returnService, type ReturnRequest } from '../../../../services/returnService';
import {
  formatContactPhoneNumber,
  getBestContactDisplayName,
  getContactPhoneNumber,
} from '../../whatsappContactDisplay';
import type { Contact } from '../../../../hooks/useWhatsAppQueries';
import type {
  ActiveCustomerJourney,
  ChatRightPanelProps,
  OrderContextMenuState,
  RightPanelTab,
} from './types';

export function useChatRightPanelController({
  contact,
  refreshToken = 0,
  onContactUpdated,
}: Pick<ChatRightPanelProps, 'contact' | 'refreshToken' | 'onContactUpdated'>) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<RightPanelTab>('info');
  const [leadCategories, setLeadCategories] = useState<any[]>([]);
  const [updatingCategory, setUpdatingCategory] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [orderMenu, setOrderMenu] = useState<OrderContextMenuState | null>(null);
  const [previewOrder, setPreviewOrder] = useState<any | null>(null);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
  const [orderStatuses, setOrderStatuses] = useState<
    Array<{ code: string; name: string; color?: string }>
  >([]);
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);

  // Phone states
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneDraft, setPhoneDraft] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneUpdateMessage, setPhoneUpdateMessage] = useState<string | null>(null);

  const [editingPhone2, setEditingPhone2] = useState(false);
  const [phone2Draft, setPhone2Draft] = useState('');
  const [savingPhone2, setSavingPhone2] = useState(false);

  // Tags
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isAddingTag, setIsAddingTag] = useState(false);

  // Journey
  const [activeJourney, setActiveJourney] = useState<ActiveCustomerJourney | null>(null);
  const [journeyLoading, setJourneyLoading] = useState(false);
  const [reEnrolling, setReEnrolling] = useState(false);

  const {
    customer,
    orders,
    activities,
    loading,
    loadCustomerData,
    resetCustomer,
    updateCustomerPhone,
    updateCustomerPhone2,
    calculateLTV,
  } = useCustomerProfile();

  const customerId = contact?.customer?.id;
  const isLinkedCustomer = Boolean(customerId && customer?.id === customerId);
  const isGroup = Boolean(contact?.isGroup || contact?.jid?.endsWith('@g.us'));
  const cleanContactPhone = contact ? getContactPhoneNumber(contact) : '';
  const rawDisplayPhone = (isLinkedCustomer ? customer?.phone : null) || cleanContactPhone || '';
  const displayPhone = formatContactPhoneNumber(rawDisplayPhone);

  const phone2FromMeta = isLinkedCustomer
    ? (() => {
        try {
          const meta =
            typeof customer?.metadata === 'string'
              ? JSON.parse(customer.metadata)
              : customer?.metadata || {};
          return meta?.phone2 || '';
        } catch {
          return '';
        }
      })()
    : '';
  const displayPhone2 = isLinkedCustomer ? phone2FromMeta || customer?.phone2 || '' : '';

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get<{ success: boolean; data: any[] }>('/order-status')
      .then((res) => {
        if (!cancelled && res.data?.success) {
          setOrderStatuses(res.data.data || []);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setSelectedCategoryId(contact?.leadCategoryId || 'none');
  }, [contact?.leadCategoryId]);

  useEffect(() => {
    if (isLinkedCustomer && customer?.tags) {
      try {
        const parsed =
          typeof customer.tags === 'string' ? JSON.parse(customer.tags) : customer.tags;
        setTags(Array.isArray(parsed) ? parsed : []);
      } catch {
        setTags([]);
      }
    } else {
      setTags([]);
    }
  }, [customer?.tags, isLinkedCustomer]);

  useEffect(() => {
    if (customerId) {
      loadCustomerData(customerId);
    } else {
      resetCustomer();
    }
  }, [customerId, refreshToken]);

  useEffect(() => {
    if (!customerId) {
      setActiveJourney(null);
      return;
    }
    setJourneyLoading(true);
    apiClient
      .get('/whatsapp/automation/journeys', { params: { customerId, status: 'ACTIVE' } })
      .then((r: any) => {
        const data = r.data?.data || [];
        if (data.length > 0) {
          const j = data[0];
          setActiveJourney({
            id: j.id,
            status: j.status,
            currentStep: j.currentStep || 0,
            totalSteps: j.flow?.steps?.length || 0,
            flowName: j.flow?.name || '',
            lastSentAt: j.lastSentAt,
            nextSendAt: j.nextSendAt,
          });
        } else {
          setActiveJourney(null);
        }
      })
      .catch(() => setActiveJourney(null))
      .finally(() => setJourneyLoading(false));
  }, [customerId]);

  useEffect(() => {
    apiClient
      .get('/whatsapp/lead-categories')
      .then((r: any) => setLeadCategories(r.data?.data || []))
      .catch(() => {});

    customerService
      .getDistinctTags()
      .then((res) => {
        const distinctNames = res.map((t) => t.name);
        const merged = Array.from(
          new Set([...distinctNames, ...customerService.getTagSuggestions()]),
        );
        setAvailableTags(merged);
      })
      .catch(() => {});
  }, []);

  const handleSavePhone = async () => {
    const phone = phoneDraft.trim();
    if (!phone) {
      setPhoneUpdateMessage('يرجى إدخال رقم الهاتف');
      return;
    }
    setSavingPhone(true);
    setPhoneUpdateMessage(null);

    let contactUpdatedData: any = null;
    let isMerged = false;

    try {
      if (contact?.id) {
        const res: any = await apiClient.put(`/whatsapp/contacts/${contact.id}`, {
          phoneNumber: phone,
        });
        contactUpdatedData = res.data?.data;
        if (res.data?.mergedPhoneJid) isMerged = true;
      }

      if (customer?.id) {
        await updateCustomerPhone(phone);
        loadCustomerData(customer.id);
      }

      setSavingPhone(false);
      setEditingPhone(false);
      setPhoneUpdateMessage(
        isMerged ? 'تم ربط رقم الهاتف ودمج المحادثة بنجاح' : 'تم حفظ رقم الهاتف',
      );
      setTimeout(() => setPhoneUpdateMessage(null), 4000);

      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'conversations'] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'contacts'] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'messages'] });

      if (contactUpdatedData && onContactUpdated) {
        onContactUpdated(contactUpdatedData);
      }
    } catch (err: any) {
      setSavingPhone(false);
      setPhoneUpdateMessage(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'فشل تحديث رقم الهاتف',
      );
      setTimeout(() => setPhoneUpdateMessage(null), 5000);
    }
  };

  const handleSavePhone2 = async () => {
    const phone2 = phone2Draft.trim();
    if (!phone2) {
      setEditingPhone2(false);
      return;
    }
    setSavingPhone2(true);
    const result = await updateCustomerPhone2(phone2);
    setSavingPhone2(false);
    setEditingPhone2(false);
    if (result.success) {
      toast.success('تم تحديث الرقم الإضافي');
      if (customer?.id) loadCustomerData(customer.id);
    } else {
      toast.error('فشل تحديث الرقم الإضافي');
    }
  };

  const handleCategoryChange = async (categoryId: string) => {
    if (!contact) return;
    setUpdatingCategory(true);
    const prevCategoryId = selectedCategoryId;
    setSelectedCategoryId(categoryId);
    const actualCategoryId = categoryId === 'none' ? null : categoryId;
    try {
      await apiClient.put(`/whatsapp/contacts/${contact.id}`, {
        leadCategoryId: actualCategoryId,
      });
      toast.success('تم تحديث تصنيف العميل');
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'conversations'] });
    } catch {
      setSelectedCategoryId(prevCategoryId);
      toast.error('فشل تحديث التصنيف');
    } finally {
      setUpdatingCategory(false);
    }
  };

  const handleAddTag = async (tagName: string) => {
    if (!customerId) return;
    const trimmed = tagName.trim();
    if (!trimmed || tags.includes(trimmed)) return;

    const updatedTags = [...tags, trimmed];
    setIsAddingTag(true);
    try {
      await customerService.updateCustomerTags(customerId, updatedTags);
      setTags(updatedTags);
      setNewTagInput('');
      if (!availableTags.includes(trimmed)) {
        setAvailableTags((prev) => [...prev, trimmed]);
      }
    } catch (error) {
      console.error('Failed to add tag:', error);
    } finally {
      setIsAddingTag(false);
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    if (!customerId) return;
    const updatedTags = tags.filter((t) => t !== tagToRemove);
    try {
      await customerService.updateCustomerTags(customerId, updatedTags);
      setTags(updatedTags);
    } catch (error) {
      console.error('Failed to remove tag:', error);
    }
  };

  const handleReEnroll = async () => {
    if (!customerId || !contact?.leadCategoryId) return;
    setReEnrolling(true);
    try {
      await apiClient.post('/whatsapp/automation/journeys/re-enroll', {
        customerId,
        contactId: contact.id,
        categoryId: contact.leadCategoryId,
      });
      const r: any = await apiClient.get('/whatsapp/automation/journeys', {
        params: { customerId, status: 'ACTIVE' },
      });
      const data = r.data?.data || [];
      if (data.length > 0) {
        const j = data[0];
        setActiveJourney({
          id: j.id,
          status: j.status,
          currentStep: j.currentStep || 0,
          totalSteps: j.flow?.steps?.length || 0,
          flowName: j.flow?.name || '',
          lastSentAt: j.lastSentAt,
          nextSendAt: j.nextSendAt,
        });
      }
    } catch {
      // Handled
    } finally {
      setReEnrolling(false);
    }
  };

  const handleViewOrderDetails = async (orderNumber: string) => {
    setOrderDetailsLoading(true);
    try {
      const response = await apiClient.get<any>(
        `/orders-new/simple/${encodeURIComponent(orderNumber)}`,
      );
      if (response.data?.success && response.data?.data) {
        setPreviewOrder(response.data.data);
        return;
      }
    } catch (err) {
      console.error('Failed to load order details:', err);
    } finally {
      setOrderDetailsLoading(false);
    }
    window.open(`/orders/${encodeURIComponent(orderNumber)}`, '_blank');
  };

  const handleOpenReturnReason = async (orderNumber: string) => {
    let req: ReturnRequest | null = null;
    try {
      const res = await returnService.getRequests({ search: orderNumber, limit: 1 });
      req = res.data?.data?.[0] || null;
    } catch {}
    if (req) {
      setSelectedReturn(req);
    } else {
      toast.error('هذا الطلب ليس له طلب مرتجع مسجل');
    }
  };

  const contactName = contact ? getBestContactDisplayName(contact) : '';
  const ltv = calculateLTV(orders);

  return {
    activeTab,
    setActiveTab,
    leadCategories,
    updatingCategory,
    selectedCategoryId,
    orderMenu,
    setOrderMenu,
    previewOrder,
    setPreviewOrder,
    orderDetailsLoading,
    orderStatuses,
    selectedReturn,
    setSelectedReturn,
    editingPhone,
    setEditingPhone,
    phoneDraft,
    setPhoneDraft,
    savingPhone,
    phoneUpdateMessage,
    setPhoneUpdateMessage,
    editingPhone2,
    setEditingPhone2,
    phone2Draft,
    setPhone2Draft,
    savingPhone2,
    tags,
    newTagInput,
    setNewTagInput,
    availableTags,
    isAddingTag,
    activeJourney,
    journeyLoading,
    reEnrolling,
    customer,
    orders,
    activities,
    loading,
    customerId,
    isLinkedCustomer,
    isGroup,
    rawDisplayPhone,
    displayPhone,
    displayPhone2,
    contactName,
    ltv,
    handleSavePhone,
    handleSavePhone2,
    handleCategoryChange,
    handleAddTag,
    handleRemoveTag,
    handleReEnroll,
    handleViewOrderDetails,
    handleOpenReturnReason,
  };
}
