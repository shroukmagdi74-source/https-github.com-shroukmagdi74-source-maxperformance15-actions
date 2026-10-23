import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../../services/apiClient';
import { socketService } from '../../../services/socketService';
import { getWhatsAppInboxWorkspaceCopy } from '../workspaceCopy';
import type {
  Conversation,
  ConversationsApiResponse,
  HeroMetric,
  ModeratorPoolItem,
  QueueCounters,
  QueueFilter,
  Session,
  SessionsApiResponse,
  WhatsAppInboxProps,
} from './types';

export const getSessionTone = (status: string) =>
  String(status || '').toUpperCase() === 'CONNECTED'
    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
    : 'bg-muted text-muted-foreground border border-border/40';

export function useWhatsAppInboxController({ companyId, superAdminMode = false }: WhatsAppInboxProps) {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const copy = useMemo(() => getWhatsAppInboxWorkspaceCopy(i18n.language), [i18n.language]);

  const apiBase = useMemo(
    () => (superAdminMode ? '/api/v1/admin/whatsapp-inbox' : '/api/v1/whatsapp-inbox'),
    [superAdminMode],
  );

  const apiParams = useMemo(
    () => (superAdminMode && companyId ? { params: { companyId } } : undefined),
    [superAdminMode, companyId],
  );

  const queueTabs = useMemo<Array<{ key: QueueFilter; label: string; metricKey?: keyof QueueCounters }>>(
    () => [
      { key: '', label: copy.inbox.queueTabs.all, metricKey: 'total' },
      { key: 'WAITING_QUEUE', label: copy.inbox.queueTabs.waiting, metricKey: 'waiting' },
      { key: 'ASSIGNED_QUEUE', label: copy.inbox.queueTabs.assigned, metricKey: 'assigned' },
      { key: 'PENDING_QUEUE', label: copy.inbox.queueTabs.pending, metricKey: 'pending' },
      { key: 'CLOSED_QUEUE', label: copy.inbox.queueTabs.closed, metricKey: 'closed' },
      { key: 'ESCALATED_QUEUE', label: copy.inbox.queueTabs.escalated, metricKey: 'escalated' },
      { key: 'MISSED_QUEUE', label: copy.inbox.queueTabs.missed, metricKey: 'missedChats' },
    ],
    [copy],
  );

  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(sessionId || null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [queueCounters, setQueueCounters] = useState<QueueCounters | null>(null);
  const [moderatorPool, setModeratorPool] = useState<ModeratorPoolItem[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [queueFilter, setQueueFilter] = useState<QueueFilter>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSessionsError = copy.isArabic
    ? 'تعذر تحميل أرقام واتساب الآن.'
    : 'We could not load WhatsApp numbers right now.';
  const loadConversationsError = copy.isArabic
    ? 'تعذر تحميل المحادثات الآن.'
    : 'We could not load inbox conversations right now.';

  const formatSessionStatus = useCallback(
    (status: string) =>
      String(status || '').toUpperCase() === 'CONNECTED' ? copy.common.online : copy.common.offline,
    [copy],
  );

  const formatMessageTime = useCallback(
    (value?: string | null) => {
      if (!value) return null;
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return null;

      const now = new Date();
      const sameDay = now.toDateString() === date.toDateString();
      return new Intl.DateTimeFormat(copy.locale, sameDay
        ? { hour: 'numeric', minute: '2-digit' }
        : { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(date);
    },
    [copy.locale],
  );

  const loadSessions = useCallback(async () => {
    try {
      const response = await apiClient.get<SessionsApiResponse>(`${apiBase}/sessions`, apiParams);
      if (response.data?.success) {
        const nextSessions = response.data.sessions || [];
        setSessions(nextSessions);
        setError(null);
        if (!activeSession && nextSessions.length > 0) {
          setActiveSession(nextSessions[0]!.id);
        }
      }
    } catch (requestError) {
      console.error('Failed to load WhatsApp sessions:', requestError);
      setError(loadSessionsError);
    }
  }, [activeSession, apiBase, apiParams, loadSessionsError]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const loadConversations = useCallback(async () => {
    if (!activeSession) {
      setConversations([]);
      setQueueCounters(null);
      setModeratorPool([]);
      return;
    }

    try {
      const params = {
        limit: 100,
        search: debouncedSearch || undefined,
        queue: queueFilter || undefined,
        ...(superAdminMode && companyId ? { companyId } : {}),
      };
      const response = await apiClient.get<ConversationsApiResponse>(
        `${apiBase}/sessions/${activeSession}/conversations`,
        { params },
      );

      if (response.data?.success) {
        setConversations(response.data.conversations || []);
        setQueueCounters(response.data.summary?.queueCounters || null);
        setModeratorPool(response.data.summary?.moderatorPool || []);
        setError(null);
      }
    } catch (requestError) {
      console.error('Failed to load WhatsApp inbox conversations:', requestError);
      setError(loadConversationsError);
    }
  }, [activeSession, apiBase, companyId, debouncedSearch, loadConversationsError, queueFilter, superAdminMode]);

  useEffect(() => {
    setActiveSession(sessionId || null);
  }, [sessionId]);

  useEffect(() => {
    const run = async () => {
      try {
        await loadSessions();
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [loadSessions]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleRefresh = () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
      refreshTimer = setTimeout(() => {
        refreshTimer = null;
        void loadConversations();
      }, 800);
    };

    socketService.on('conversation:updated', scheduleRefresh);
    socketService.on('conversation:assignment', scheduleRefresh);
    socketService.on('whatsapp:message:new', scheduleRefresh);
    socketService.on('whatsapp:message:sent', scheduleRefresh);

    return () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
        refreshTimer = null;
      }
      socketService.off('conversation:updated', scheduleRefresh);
      socketService.off('conversation:assignment', scheduleRefresh);
      socketService.off('whatsapp:message:new', scheduleRefresh);
      socketService.off('whatsapp:message:sent', scheduleRefresh);
    };
  }, [loadConversations]);

  const selectSession = useCallback(
    (nextSessionId: string) => {
      setActiveSession(nextSessionId);
      if (superAdminMode && companyId) {
        navigate(`/super-admin/whatsapp/companies/${companyId}/routing/${nextSessionId}`);
      } else {
        navigate(`/whatsapp/routing/${nextSessionId}`);
      }
    },
    [companyId, navigate, superAdminMode],
  );

  const navigateToChat = useCallback(
    (conversationId: string) => {
      if (superAdminMode && companyId) {
        navigate(`/super-admin/whatsapp/companies/${companyId}/chat/${conversationId}`);
      } else {
        navigate(`/whatsapp-chat/${conversationId}`);
      }
    },
    [companyId, navigate, superAdminMode],
  );

  const navigateToDashboard = useCallback(() => {
    if (superAdminMode && companyId) {
      navigate(`/super-admin/whatsapp/companies/${companyId}/moderator-dashboard`);
    } else {
      navigate('/moderator-dashboard');
    }
  }, [companyId, navigate, superAdminMode]);

  const selectedSession = useMemo(
    () => sessions.find((item) => item.id === activeSession) || null,
    [sessions, activeSession],
  );

  const heroMetrics = useMemo<HeroMetric[]>(
    () => [
      { label: copy.inbox.metrics.waiting, value: queueCounters?.waiting || 0 },
      { label: copy.inbox.metrics.assigned, value: queueCounters?.assigned || 0 },
      { label: copy.inbox.metrics.pending, value: queueCounters?.pending || 0 },
      { label: copy.inbox.metrics.slaBreached, value: queueCounters?.slaBreached || 0 },
      { label: copy.inbox.metrics.missed, value: queueCounters?.missedChats || 0 },
      { label: copy.inbox.metrics.escalated, value: queueCounters?.escalated || 0 },
    ],
    [copy, queueCounters],
  );

  return {
    copy,
    sessions,
    activeSession,
    selectedSession,
    conversations,
    queueCounters,
    moderatorPool,
    search,
    setSearch,
    queueFilter,
    setQueueFilter,
    queueTabs,
    heroMetrics,
    loading,
    error,
    formatSessionStatus,
    formatMessageTime,
    selectSession,
    navigateToChat,
    navigateToDashboard,
    loadConversations,
  };
}
