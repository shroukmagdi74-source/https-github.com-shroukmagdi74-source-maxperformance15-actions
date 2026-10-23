import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient, type ApiRequestConfig } from '../../../services/apiClient';
import { LogEntry } from './types';

interface UseWhatsAppNotificationLogsControllerProps {
  companyId?: string;
}

export function useWhatsAppNotificationLogsController({
  companyId,
}: UseWhatsAppNotificationLogsControllerProps) {
  const { i18n } = useTranslation();

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [statusFilter, setStatusFilter] = useState('');
  const [messageTypeFilter, setMessageTypeFilter] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [sessionFilter, setSessionFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  const [sessions, setSessions] = useState<{ id: string; name: string }[]>([]);

  const withCompanyConfig = useCallback(
    (config: ApiRequestConfig = {}) => (companyId ? { ...config, _companyId: companyId } : config),
    [companyId]
  );

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(
        '/whatsapp-notifications/logs',
        withCompanyConfig({
          params: {
            page: page + 1,
            limit: rowsPerPage,
            status: statusFilter || undefined,
            eventType: eventTypeFilter || undefined,
            search: search || undefined,
          },
        })
      );
      setLogs((response as any).data?.logs || []);
      setTotal((response as any).data?.pagination?.total || 0);
    } catch (loadError: any) {
      setError(
        loadError?.response?.data?.error ||
          loadError?.message ||
          'حدث خطأ أثناء جلب السجلات'
      );
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, statusFilter, eventTypeFilter, search, withCompanyConfig]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchLogs();
    } finally {
      setRefreshing(false);
    }
  }, [fetchLogs]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiClient.get('/whatsapp-notifications/settings', withCompanyConfig({}));
        if (mounted) {
          const sessionList = (res as any).data?.sessions || [];
          setSessions(
            sessionList.map((s: any) => ({
              id: s.id,
              name: s.name || s.phoneNumber || s.id,
            }))
          );
        }
      } catch {
        // Optional
      }
    })();
    return () => {
      mounted = false;
    };
  }, [withCompanyConfig]);

  const visibleLogs = useMemo(() => {
    if (!sessionFilter) return logs;
    return logs.filter(
      (l) => l.sessionId === sessionFilter || l.sessionName === sessionFilter
    );
  }, [logs, sessionFilter]);

  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  const from = total === 0 ? 0 : page * rowsPerPage + 1;
  const to = total === 0 ? 0 : Math.min(total, (page + 1) * rowsPerPage);

  const formatDate = useCallback(
    (value?: string | null) => {
      if (!value) return '—';
      try {
        return new Date(value).toLocaleString(
          i18n.language === 'ar' ? 'ar-EG' : 'en-US',
          {
            dateStyle: 'short',
            timeStyle: 'short',
          }
        );
      } catch {
        return value;
      }
    },
    [i18n.language]
  );

  return {
    logs,
    visibleLogs,
    total,
    loading,
    error,
    refreshing,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    statusFilter,
    setStatusFilter,
    messageTypeFilter,
    setMessageTypeFilter,
    eventTypeFilter,
    setEventTypeFilter,
    sessionFilter,
    setSessionFilter,
    search,
    setSearch,
    selectedLog,
    setSelectedLog,
    sessions,
    totalPages,
    from,
    to,
    formatDate,
    handleRefresh,
  };
}
