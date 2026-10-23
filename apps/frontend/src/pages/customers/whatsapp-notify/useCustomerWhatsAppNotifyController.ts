import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../../services/apiClient';
import type {
  Audience,
  Session,
  Product,
  CampaignStatus,
  DelayUnit,
  DelayMode,
} from './types';

const campaignStorageKey = 'active_general_campaign_id';

export function useCustomerWhatsAppNotifyController() {
  const { t } = useTranslation();

  // Sessions
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [sessionsLoading, setSessionsLoading] = useState(true);

  // Audience
  const [audience, setAudience] = useState<Audience>('withOrders');
  const [newDays, setNewDays] = useState(7);
  const [audienceCount, setAudienceCount] = useState<number | null>(null);
  const [audienceLoading, setAudienceLoading] = useState(false);

  // Message & Media
  const [message, setMessage] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');

  // Product Picker
  const [showProducts, setShowProducts] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Delay settings
  const [delayValue, setDelayValue] = useState(1.5);
  const [delayUnit, setDelayUnit] = useState<DelayUnit>('seconds');
  const [delayMode, setDelayMode] = useState<DelayMode>('perMessage');

  // Campaign State
  const [sending, setSending] = useState(false);
  const [campaignId, setCampaignId] = useState<string | null>(() =>
    localStorage.getItem(campaignStorageKey),
  );
  const [campaign, setCampaign] = useState<CampaignStatus | null>(null);
  const [sendError, setSendError] = useState('');

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 1. Load Sessions
  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const res = await apiClient.get(
        `/customers/whatsapp-notify/sessions?t=${Date.now()}`,
      );
      const list: Session[] = res.data?.sessions || [];
      setSessions(list);
      const active = list.find((s) => s.isConnected);
      if (active) setSelectedSession(active.sessionId);
      else if (list.length > 0) setSelectedSession(list[0].sessionId);
    } catch {
      // silent
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  // 2. Preview Audience Count
  const previewAudience = useCallback(async (aud: Audience, days: number) => {
    setAudienceLoading(true);
    setAudienceCount(null);
    try {
      const params: Record<string, string> = { audience: aud };
      if (aud === 'newCustomers') params.newDays = String(days);
      const res = await apiClient.get(
        '/customers/whatsapp-notify/preview-audience',
        { params },
      );
      setAudienceCount(res.data?.count ?? 0);
    } catch {
      setAudienceCount(null);
    } finally {
      setAudienceLoading(false);
    }
  }, []);

  useEffect(() => {
    void previewAudience(audience, newDays);
  }, [audience, newDays, previewAudience]);

  // 3. Load Products
  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const res = await apiClient.get(
        '/customers/whatsapp-notify/products?limit=60',
      );
      setProducts(res.data?.data || []);
    } catch {
      // silent
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showProducts) void loadProducts();
  }, [showProducts, loadProducts]);

  // 4. Poll Campaign Status
  useEffect(() => {
    if (!campaignId) return;

    pollRef.current = setInterval(async () => {
      try {
        const res = await apiClient.get(
          `/customers/whatsapp-notify/campaign/${campaignId}`,
        );
        const data = res.data as CampaignStatus;
        setCampaign(data);

        if (data.status === 'completed' || data.status === 'cancelled') {
          if (pollRef.current) clearInterval(pollRef.current);
          setSending(false);
          localStorage.removeItem(campaignStorageKey);
        }
      } catch (err: unknown) {
        const status =
          typeof err === 'object' && err !== null && 'response' in err
            ? (err as { response?: { status?: number } }).response?.status
            : undefined;
        if (status === 404) {
          if (pollRef.current) clearInterval(pollRef.current);
          setSending(false);
          setCampaign(null);
          setCampaignId(null);
          localStorage.removeItem(campaignStorageKey);
        }
      }
    }, 2000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [campaignId]);

  // 5. Insert Product
  const insertProduct = useCallback(
    (product: Product) => {
      const imgUrl =
        Array.isArray(product.images) && product.images.length > 0
          ? product.images[0]
          : '';
      setMessage((prev) =>
        prev
          .replace(/{productName}/g, product.name)
          .replace(/{price}/g, String(product.price)),
      );
      if (imgUrl && !mediaUrl) setMediaUrl(imgUrl);
      setSelectedProduct(product);
      setShowProducts(false);
    },
    [mediaUrl],
  );

  // 6. Send Campaign
  const handleSend = useCallback(async () => {
    if (!message.trim()) {
      setSendError(t('whatsappNotify.writeMessageFirst', 'يرجى كتابة نص الرسالة أولاً'));
      return;
    }
    if (!Number.isFinite(delayValue) || delayValue <= 0) {
      setSendError(t('whatsappNotify.invalidDelay', 'فاصل زمني غير صالح'));
      return;
    }

    const connectedSession = sessions.find((s) => s.isConnected);
    if (!connectedSession) {
      setSendError(
        t('whatsappNotify.noConnectedSessionError', 'لا توجد جلسة واتساب متصلة حالياً'),
      );
      return;
    }

    setSendError('');
    setSending(true);
    setCampaign(null);
    setCampaignId(null);
    localStorage.removeItem(campaignStorageKey);

    try {
      const payload: Record<string, unknown> = {
        audience,
        message: message.trim(),
        sessionId: selectedSession || connectedSession.sessionId,
        delayValue,
        delayUnit,
        delayMode,
      };
      if (audience === 'newCustomers') payload.newDays = newDays;
      if (mediaUrl.trim()) payload.mediaUrl = mediaUrl.trim();

      const res = await apiClient.post(
        '/customers/whatsapp-notify/smart-send',
        payload,
      );
      if (res.data?.success) {
        const newId = res.data.campaignId;
        setCampaignId(newId);
        localStorage.setItem(campaignStorageKey, newId);
        setCampaign({
          status: 'running',
          sent: 0,
          failed: 0,
          total: res.data.total,
          progress: 0,
          startedAt: new Date().toISOString(),
          errors: [],
        });
      } else {
        setSendError(res.data?.message || t('whatsappNotify.errorGeneric', 'حدث خطأ أثناء البدء'));
        setSending(false);
      }
    } catch (err: unknown) {
      const msg =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      setSendError(msg || t('whatsappNotify.failed', 'فشل في إرسال الحملة'));
      setSending(false);
    }
  }, [
    audience,
    delayMode,
    delayUnit,
    delayValue,
    mediaUrl,
    message,
    newDays,
    selectedSession,
    sessions,
    t,
  ]);

  // 7. Stop Campaign
  const handleStop = useCallback(async () => {
    if (!campaignId) return;
    try {
      await apiClient.delete(`/customers/whatsapp-notify/campaign/${campaignId}`);
    } catch (err) {
      console.error('Stop failed:', err);
    }
  }, [campaignId]);

  const connectedSession = sessions.find((s) => s.isConnected);

  return {
    t,
    sessions,
    selectedSession,
    setSelectedSession,
    connectedSession,
    sessionsLoading,
    loadSessions,
    audience,
    setAudience,
    newDays,
    setNewDays,
    audienceCount,
    audienceLoading,
    message,
    setMessage,
    mediaUrl,
    setMediaUrl,
    showProducts,
    setShowProducts,
    productSearch,
    setProductSearch,
    products,
    productsLoading,
    selectedProduct,
    insertProduct,
    delayValue,
    setDelayValue,
    delayUnit,
    setDelayUnit,
    delayMode,
    setDelayMode,
    sending,
    campaign,
    sendError,
    setSendError,
    handleSend,
    handleStop,
  };
}
