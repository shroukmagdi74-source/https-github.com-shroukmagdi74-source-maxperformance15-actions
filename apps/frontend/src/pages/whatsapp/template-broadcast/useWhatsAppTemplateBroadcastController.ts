import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { tToast } from '../../../utils/i18n-toast';
import { apiClient, type ApiRequestConfig } from '../../../services/apiClient';
import { broadcastService } from '../../../services/broadcastService';
import { customerService } from '../../../services/customerService';
import {
  BroadcastResult,
  Campaign,
  CustomerList,
  LeadCategory,
  MetaTemplate,
  Session,
} from './types';

interface UseWhatsAppTemplateBroadcastProps {
  companyId?: string;
  companyName?: string;
  superAdminMode?: boolean;
}

export function useWhatsAppTemplateBroadcastController({
  companyId,
}: UseWhatsAppTemplateBroadcastProps) {
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState('create');

  // Session & Template
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [templates, setTemplates] = useState<MetaTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [languageCode, setLanguageCode] = useState('en');

  // Header media for Meta templates with an IMAGE header
  const [waHeaderMedia, setWaHeaderMedia] = useState('');
  const [headerMediaName, setHeaderMediaName] = useState('');
  const [headerUploading, setHeaderUploading] = useState(false);

  // Campaign creation
  const [campaignName, setCampaignName] = useState('');
  const [customerLists, setCustomerLists] = useState<CustomerList[]>([]);
  const [selectedListId, setSelectedListId] = useState('');
  const [leadCategories, setLeadCategories] = useState<LeadCategory[]>([]);
  const [selectedLeadCategoryId, setSelectedLeadCategoryId] = useState('');
  const [recipientsText, setRecipientsText] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<{ name: string; count: number }[]>([]);
  const [selectedTag, setSelectedTag] = useState('');

  // Customer lists tab state
  const [listsSearch, setListsSearch] = useState('');
  const [listsFilter, setListsFilter] = useState<'all' | 'custom' | 'default'>('all');
  const [listToDelete, setListToDelete] = useState<CustomerList | null>(null);
  const [deletingList, setDeletingList] = useState(false);
  const [refreshingListId, setRefreshingListId] = useState<string | null>(null);

  const [scheduleAt, setScheduleAt] = useState('');
  const [templateVars] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<BroadcastResult | null>(null);
  const [sendProgress, setSendProgress] = useState<{ current: number; total: number; status: string } | null>(null);

  // Campaigns history
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);

  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null);
  const [expandedListId, setExpandedListId] = useState<string | null>(null);
  const [listMembers, setListMembers] = useState<Record<string, any[]>>({});
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [importingCategoryId, setImportingCategoryId] = useState<string | null>(null);

  const withCompanyConfig = useCallback(
    (config: ApiRequestConfig = {}) => (companyId ? { ...config, _companyId: companyId } : config),
    [companyId]
  );

  const fetchSessions = useCallback(async () => {
    try {
      const res = await apiClient.get('/whatsapp/sessions', withCompanyConfig());
      const metaSessions = ((res as any).data?.sessions || []).filter(
        (s: any) => s.provider === 'META_CLOUD' || s.metaWabaId
      );
      setSessions(metaSessions);
      if (metaSessions.length > 0 && !selectedSessionId) setSelectedSessionId(metaSessions[0].id);
    } catch {
      // Graceful fallback
    }
  }, [withCompanyConfig, selectedSessionId]);

  const fetchTemplates = useCallback(async () => {
    if (!selectedSessionId) {
      setTemplates([]);
      setSelectedTemplate('');
      return;
    }
    try {
      setTemplates([]);
      setSelectedTemplate('');
      const res = await apiClient.get(
        `/whatsapp-templates/templates?sessionId=${selectedSessionId}`,
        withCompanyConfig()
      );
      const approved = ((res as any).data?.templates || []).filter(
        (t: MetaTemplate) => t.status === 'APPROVED'
      );
      setTemplates(approved);
    } catch {
      setTemplates([]);
      setSelectedTemplate('');
    }
  }, [selectedSessionId, withCompanyConfig]);

  const fetchCustomerLists = useCallback(async () => {
    try {
      const res = await broadcastService.getCustomerLists();
      const lists = Array.isArray(res) ? res : (res as any)?.data || [];
      setCustomerLists(lists);
    } catch {
      // Graceful fallback
    }
  }, []);

  const filteredCustomerLists = useMemo(() => {
    let out = customerLists;
    if (listsFilter === 'custom') out = out.filter((l) => !l.isDefault);
    if (listsFilter === 'default') out = out.filter((l) => l.isDefault);
    if (listsSearch.trim()) {
      const q = listsSearch.trim().toLowerCase();
      out = out.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          (l.description || '').toLowerCase().includes(q)
      );
    }
    return out;
  }, [customerLists, listsFilter, listsSearch]);

  const reloadLists = useCallback(async () => {
    await fetchCustomerLists();
  }, [fetchCustomerLists]);

  const handleDeleteList = useCallback(async () => {
    if (!listToDelete) return;
    setDeletingList(true);
    try {
      await broadcastService.deleteCustomerList(listToDelete.id);
      toast.success('تم حذف القائمة');
      setListToDelete(null);
      await reloadLists();
    } catch (err: any) {
      toast.error(err?.message || 'فشل في حذف القائمة');
    } finally {
      setDeletingList(false);
    }
  }, [listToDelete, reloadLists]);

  const handleDuplicateList = useCallback(
    async (list: CustomerList) => {
      try {
        const criteria =
          typeof list.criteria === 'string'
            ? (() => {
                try {
                  return JSON.parse(list.criteria);
                } catch {
                  return {};
                }
              })()
            : list.criteria || {};
        await broadcastService.createCustomerList({
          name: `${list.name} (نسخة)`,
          description: list.description || '',
          criteria,
        });
        toast.success('تم إنشاء نسخة من القائمة');
        await reloadLists();
      } catch (err: any) {
        toast.error(err?.message || 'فشل في نسخ القائمة');
      }
    },
    [reloadLists]
  );

  const handleRefreshListCount = useCallback(
    async (list: CustomerList) => {
      if (list.isDefault) return;
      setRefreshingListId(list.id);
      try {
        await broadcastService.refreshCustomerListCount(list.id);
        toast.success('تم تحديث عدد العملاء');
        await reloadLists();
      } catch (err: any) {
        toast.error(err?.message || 'فشل في تحديث العدد');
      } finally {
        setRefreshingListId(null);
      }
    },
    [reloadLists]
  );

  const fetchLeadCategories = useCallback(async () => {
    try {
      const res = await apiClient.get('/whatsapp/lead-categories', withCompanyConfig());
      setLeadCategories((res as any).data?.data || []);
    } catch {
      // Graceful fallback
    }
  }, [withCompanyConfig]);

  const fetchDistinctTags = useCallback(async () => {
    try {
      const res = await customerService.getDistinctTags();
      setAvailableTags(res);
    } catch {
      // Graceful fallback
    }
  }, []);

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoadingCampaigns(true);
      const res = await broadcastService.getCampaigns({ channel: 'whatsapp' }, { limit: 50 });
      const list = Array.isArray(res) ? res : res?.campaigns || [];
      setCampaigns(list.filter((c: Campaign) => c.channel === 'whatsapp' || !c.channel));
    } catch {
      // Graceful fallback
    } finally {
      setLoadingCampaigns(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    fetchCustomerLists();
    fetchCampaigns();
    fetchLeadCategories();
    fetchDistinctTags();
  }, [fetchSessions, fetchCustomerLists, fetchCampaigns, fetchLeadCategories, fetchDistinctTags]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const addRecipients = useCallback(() => {
    const phones = recipientsText
      .split(/[\n,;]+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    const unique = [...new Set([...recipients, ...phones])];
    setRecipients(unique);
    setRecipientsText('');
  }, [recipientsText, recipients]);

  const removeRecipient = useCallback((phone: string) => {
    setRecipients((prev) => prev.filter((p) => p !== phone));
  }, []);

  const fetchAllListPhones = useCallback(async (listId: string): Promise<string[]> => {
    const phones: string[] = [];
    const pageSize = 200;
    let page = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const res = await broadcastService.getCustomersInListPaginated(listId, page, pageSize);
      const customers = (res as any)?.data || [];
      customers.forEach((c: any) => {
        if (c?.phone) phones.push(c.phone);
      });
      const total = (res as any)?.total ?? customers.length;
      if (!customers.length || page * pageSize >= total) break;
      page += 1;
    }
    return phones;
  }, []);

  const handleSelectList = useCallback(
    async (listId: string) => {
      setSelectedListId(listId);
      if (listId === 'manual') return;
      try {
        const phones = await fetchAllListPhones(listId);
        if (phones.length === 0) {
          toast.warning('لا يوجد أرقام هواتف في هذه القائمة');
          return;
        }
        setRecipients((prev) => [...new Set([...prev, ...phones])]);
        toast.success(`تم تحميل ${phones.length} عميل من القائمة`);
      } catch {
        tToast.error('WhatsAppTemplateBroadcast.failed_load_914a');
      }
    },
    [fetchAllListPhones]
  );

  const handleListSelectForSend = useCallback(
    async (list: CustomerList) => {
      setActiveTab('create');
      await handleSelectList(list.id);
      toast.success(`تم تحميل "${list.name}" (${list.count} عميل)`);
    },
    [handleSelectList]
  );

  useEffect(() => {
    const urlListId = searchParams.get('listId');
    if (!urlListId || urlListId === 'manual') return;
    let cancelled = false;
    const apply = async () => {
      const res = await broadcastService.getCustomerLists();
      const lists = Array.isArray(res) ? res : (res as any)?.data || [];
      const found = lists.find((l: any) => l.id === urlListId);
      if (cancelled) return;
      if (found) {
        setActiveTab('create');
        await handleSelectList(found.id);
        toast.success(`تم تحميل القائمة "${found.name}" (${found.count} عميل)`);
      } else {
        toast.error('القائمة المحددة غير موجودة');
      }
    };
    void apply();
    return () => {
      cancelled = true;
    };
  }, [searchParams, handleSelectList]);

  const handleSelectTag = useCallback(async (tagName: string) => {
    setSelectedTag(tagName);
    if (!tagName || tagName === 'none') return;
    try {
      const res = await customerService.getCustomers({ tag: tagName, limit: 1000 });
      const customers = res.data || [];
      const phones = customers.map((c: any) => c.phone).filter(Boolean);
      setRecipients((prev) => [...new Set([...prev, ...phones])]);
      toast.success(`تم تحميل ${phones.length} عميل يحمل الوسم: ${tagName}`);
    } catch {
      tToast.error('WhatsAppTemplateBroadcast.failed_load_914a');
    }
  }, []);

  const handleImportFromCategory = useCallback(
    async (categoryId: string, categoryName: string) => {
      setImportingCategoryId(categoryId);
      try {
        const res = await apiClient.get(
          `/whatsapp/lead-categories/${categoryId}/contacts`,
          withCompanyConfig()
        );
        const contacts = (res as any).data?.data || [];
        const phones = contacts.map((c: any) => c.phoneNumber).filter(Boolean);
        if (phones.length === 0) {
          toast.warning(`لا يوجد جهات اتصال في تصنيف "${categoryName}"`);
          return;
        }
        setRecipients((prev) => [...new Set([...prev, ...phones])]);
        toast.success(`تم استيراد ${phones.length} جهة اتصال من "${categoryName}"`);
        setActiveTab('create');
      } catch {
        tToast.error('WhatsAppTemplateBroadcast.msg_e35f');
      } finally {
        setImportingCategoryId(null);
      }
    },
    [withCompanyConfig]
  );

  const handleCreateCampaign = useCallback(async () => {
    if (!campaignName || !selectedTemplate || recipients.length === 0) {
      tToast.error('WhatsAppTemplateBroadcast.msg_03ea');
      return;
    }

    const currentTpl = templates.find((t) => t.name === selectedTemplate);
    const headerComp = currentTpl?.components?.find((c: any) => (c.type || '').toUpperCase() === 'HEADER');
    const headerRequiresMedia = headerComp && headerComp.format && headerComp.format !== 'TEXT';

    if (headerRequiresMedia && !waHeaderMedia) {
      toast.error(`القالب "${selectedTemplate}" يتطلب صورة أو وسيط (${headerComp.format}) في الترويسة (Header). يُرجى اختيار صورة أولاً`);
      return;
    }

    try {
      setSending(true);
      setResult(null);

      setSendProgress({ current: 0, total: recipients.length, status: 'sending' });

      const body = {
        name: campaignName,
        channel: 'whatsapp',
        message: `WhatsApp broadcast: ${selectedTemplate}${
          templateVars.length ? ` | vars: ${templateVars.join(',')}` : ''
        }`,
        targetAudience: selectedListId || 'manual',
        waTemplateName: selectedTemplate,
        waLanguageCode: languageCode,
        waHeaderMedia: waHeaderMedia || undefined,
        whatsAppSessionId: selectedSessionId,
        manualPhones: JSON.stringify(recipients),
        sendNow: scheduleAt ? 'false' : 'true',
        scheduledAt: scheduleAt || undefined,
      };

      const campaignRes = await broadcastService.createCampaign(
        Object.entries(body).reduce((fd, [k, v]) => {
          if (v !== undefined) fd.append(k, String(v));
          return fd;
        }, new FormData())
      );
      const campaignId = (campaignRes as any)?.data?.id || (campaignRes as any)?.id;

      setSendProgress({ current: 0, total: recipients.length, status: 'sending' });
      if (scheduleAt) {
        setResult({ scheduled: true, scheduledAt: scheduleAt });
        tToast.success('WhatsAppTemplateBroadcast.msg_be37');
        setSending(false);
        setSendProgress(null);
        return;
      }

      const sendRes = await broadcastService.sendCampaign(campaignId, recipients);
      setResult(sendRes);
      if (sendRes.sentCount > 0) {
        toast.success(`تم إرسال ${sendRes.sentCount} رسالة بنجاح`);
      } else {
        const errorMsg =
          (sendRes as any).failureReason ||
          sendRes.details?.[0]?.error ||
          (sendRes as any).message ||
          'فشل إرسال الحملة';
        toast.error(`فشل إرسال الحملة: ${errorMsg}`);
      }
      setActiveTab('campaigns');
      fetchCampaigns();
    } catch (err: any) {
      toast.error(err?.message || 'فشل');
      setResult({ sent: 0, failed: 0, errors: [{ error: err?.message }] });
      setSendProgress(null);
    } finally {
      if (!scheduleAt) {
        setSending(false);
        setSendProgress(null);
      }
    }
  }, [
    campaignName,
    selectedTemplate,
    templates,
    languageCode,
    recipients,
    selectedListId,
    templateVars,
    scheduleAt,
    selectedSessionId,
    fetchCampaigns,
    waHeaderMedia,
  ]);

  const handleUploadHeaderMedia = useCallback(
    async (file: File) => {
      if (!selectedSessionId) {
        tToast.error('WhatsAppTemplateBroadcast.msg_03ea');
        return;
      }
      setHeaderUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('sessionId', selectedSessionId);
        formData.append('purpose', 'broadcast');
        const res = await apiClient.post<{
          success?: boolean;
          mediaId?: string;
          fileName?: string;
          error?: string;
        }>('/whatsapp-templates/templates/upload-media', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          ...withCompanyConfig(),
        });
        const data = res.data;
        if (data?.success && data.mediaId) {
          setWaHeaderMedia(data.mediaId);
          setHeaderMediaName(data.fileName || file.name);
          toast.success('تم رفع صورة الرأس — سترسل في هيدر القالب لكل عميل');
        } else {
          toast.error(data?.error || 'فشل رفع الصورة');
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.error || 'فشل رفع الصورة إلى ميتا');
      } finally {
        setHeaderUploading(false);
      }
    },
    [selectedSessionId, withCompanyConfig]
  );

  const openRate = (c: Campaign) =>
    c.sentCount > 0 ? Math.round((c.openedCount / c.sentCount) * 100) : 0;
  const clickRate = (c: Campaign) =>
    c.sentCount > 0 ? Math.round((c.clickedCount / c.sentCount) * 100) : 0;
  const deliveryRate = (c: Campaign) =>
    c.recipientCount > 0 ? Math.round((c.deliveredCount / c.recipientCount) * 100) : 0;
  const replyRate = (c: Campaign) =>
    c.sentCount > 0 ? Math.round((((c as any).repliedCount || 0) / c.sentCount) * 100) : 0;

  return {
    activeTab,
    setActiveTab,
    sessions,
    selectedSessionId,
    setSelectedSessionId,
    templates,
    selectedTemplate,
    setSelectedTemplate,
    languageCode,
    setLanguageCode,
    waHeaderMedia,
    setWaHeaderMedia,
    headerMediaName,
    setHeaderMediaName,
    headerUploading,
    campaignName,
    setCampaignName,
    customerLists,
    selectedListId,
    setSelectedListId,
    leadCategories,
    selectedLeadCategoryId,
    setSelectedLeadCategoryId,
    recipientsText,
    setRecipientsText,
    recipients,
    availableTags,
    selectedTag,
    listsSearch,
    setListsSearch,
    listsFilter,
    setListsFilter,
    listToDelete,
    setListToDelete,
    deletingList,
    refreshingListId,
    scheduleAt,
    setScheduleAt,
    sending,
    result,
    sendProgress,
    campaigns,
    loadingCampaigns,
    expandedCampaignId,
    setExpandedCampaignId,
    expandedListId,
    setExpandedListId,
    listMembers,
    setListMembers,
    loadingMembers,
    setLoadingMembers,
    importingCategoryId,
    filteredCustomerLists,
    addRecipients,
    removeRecipient,
    handleSelectList,
    handleListSelectForSend,
    handleSelectTag,
    handleImportFromCategory,
    handleCreateCampaign,
    handleUploadHeaderMedia,
    handleDeleteList,
    handleDuplicateList,
    handleRefreshListCount,
    openRate,
    clickRate,
    deliveryRate,
    replyRate,
    fetchCampaigns,
    withCompanyConfig,
  };
}
