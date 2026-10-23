import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../../../services/apiClient';
import {
  Occasion,
  OccasionAudience,
  OccasionFormData,
  OccasionSession,
  emptyOccasionForm,
} from './types';

export function useCustomerOccasionsController() {
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [sessions, setSessions] = useState<OccasionSession[]>([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [audience, setAudience] = useState<OccasionAudience>('withOrders');
  const [audienceCount, setAudienceCount] = useState<number | null>(null);
  const [delayMs, setDelayMs] = useState(1500);

  const [form, setForm] = useState<OccasionFormData>(emptyOccasionForm);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendingNow, setSendingNow] = useState(false);

  const [viewOccasion, setViewOccasion] = useState<Occasion | null>(null);
  const [metaModalOpen, setMetaModalOpen] = useState(false);
  const [deleting, setDeleting] = useState<Occasion | null>(null);

  const loadOccasions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/customers/whatsapp-notify/occasions');
      setOccasions(res.data?.data || []);
    } catch {
      // Empty state handles UI feedback
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSessions = useCallback(async () => {
    try {
      const res = await apiClient.get(`/customers/whatsapp-notify/sessions?t=${Date.now()}`);
      const list: OccasionSession[] = res.data?.sessions || [];
      setSessions(list);
      const connected = list.filter((s) => s.isConnected);
      setSelectedSession((prev) => (prev && connected.some((s) => s.sessionId === prev) ? prev : connected[0]?.sessionId || ''));
    } catch {
      // Graceful fallback
    }
  }, []);

  useEffect(() => {
    loadOccasions();
    loadSessions();
  }, [loadOccasions, loadSessions]);

  useEffect(() => {
    let alive = true;
    apiClient
      .get('/customers/whatsapp-notify/preview-audience', { params: { audience, newDays: 7 } })
      .then((res) => {
        if (alive) setAudienceCount(res.data?.count ?? null);
      })
      .catch(() => {
        if (alive) setAudienceCount(null);
      });
    return () => {
      alive = false;
    };
  }, [audience]);

  const openCreate = useCallback(() => {
    setForm({
      ...emptyOccasionForm,
      scheduledAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    });
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((o: Occasion) => {
    setForm({
      id: o.id,
      name: o.name,
      message: o.message,
      mediaUrl: o.mediaUrl || '',
      scheduledAt: new Date(o.scheduledAt).toISOString().slice(0, 16),
      recurrence: o.recurrence,
      sendLimit: o.sendLimit || 0,
      templateId: o.templateId || '',
    });
    setFormOpen(true);
  }, []);

  const sendNow = useCallback(async () => {
    if (!form.message.trim()) return;
    setSendingNow(true);
    try {
      await apiClient.post('/customers/whatsapp-notify/smart-send', {
        audience,
        message: form.message.trim(),
        mediaUrl: form.mediaUrl.trim() || undefined,
        sessionId: selectedSession || undefined,
        delayMs: 1500,
        occasionName: form.name.trim() || 'مناسبة خاصة',
        eventType: 'PROMOTIONAL',
      });
      toast.success('تم إرسال الحملة الفورية بنجاح وتعمل في الخلفية');
      setFormOpen(false);
      loadOccasions();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'فشل الإرسال الفوري';
      toast.error(msg);
    } finally {
      setSendingNow(false);
    }
  }, [form.message, form.mediaUrl, form.name, audience, selectedSession, loadOccasions]);

  const save = useCallback(async () => {
    if (!form.name.trim() || !form.message.trim() || !form.scheduledAt) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        message: form.message.trim(),
        mediaUrl: form.mediaUrl.trim() || null,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        recurrence: form.recurrence,
        sendLimit: Number(form.sendLimit) || 0,
        customerListIds: [],
        templateId: form.templateId || null,
      };
      if (form.id) {
        await apiClient.put(`/customers/whatsapp-notify/occasions/${form.id}`, payload);
      } else {
        await apiClient.post('/customers/whatsapp-notify/occasions', payload);
      }
      toast.success(form.id ? 'تم حفظ التعديلات بنجاح' : 'تمت جدولة المناسبة بنجاح');
      setFormOpen(false);
      loadOccasions();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'فشل الحفظ';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }, [form, loadOccasions]);

  const confirmDelete = useCallback(async () => {
    if (!deleting) return;
    try {
      await apiClient.delete(`/customers/whatsapp-notify/occasions/${deleting.id}`);
      toast.success('تم حذف المناسبة');
      setDeleting(null);
      loadOccasions();
    } catch {
      toast.error('تعذر حذف المناسبة');
    }
  }, [deleting, loadOccasions]);

  const filtered = useMemo(() => {
    const q = search.trim();
    if (!q) return occasions;
    return occasions.filter((o) => o.name.toLowerCase().includes(q.toLowerCase()));
  }, [occasions, search]);

  const connectedSessions = useMemo(() => sessions.filter((s) => s.isConnected), [sessions]);
  const hasBaileys = connectedSessions.length > 0;

  return {
    occasions,
    loading,
    search,
    setSearch,
    sessions,
    selectedSession,
    setSelectedSession,
    audience,
    setAudience,
    audienceCount,
    delayMs,
    setDelayMs,
    form,
    setForm,
    formOpen,
    setFormOpen,
    saving,
    sendingNow,
    viewOccasion,
    setViewOccasion,
    metaModalOpen,
    setMetaModalOpen,
    deleting,
    setDeleting,
    loadOccasions,
    loadSessions,
    openCreate,
    openEdit,
    sendNow,
    save,
    confirmDelete,
    filtered,
    connectedSessions,
    hasBaileys,
  };
}
