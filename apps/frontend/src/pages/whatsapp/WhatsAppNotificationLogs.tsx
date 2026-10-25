import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, ClipboardList, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { WhatsAppPageShell } from './components/WhatsAppPageShell';
import {
  NotificationLogDetailsDialog,
  NotificationLogsFilterBar,
  NotificationLogsPagination,
  NotificationLogsTable,
  useWhatsAppNotificationLogsController,
} from './notification-logs';

interface WhatsAppNotificationLogsProps {
  companyId?: string;
  companyName?: string;
  superAdminMode?: boolean;
}

const WhatsAppNotificationLogs: React.FC<WhatsAppNotificationLogsProps> = ({
  companyId,
  companyName,
  superAdminMode = false,
}) => {
  const { t, i18n } = useTranslation();

  const pageTitle = companyName
    ? `${t('whatsappNotificationLogs.title')} · ${companyName}`
    : t('whatsappNotificationLogs.title');
  const backHref = '/whatsapp/notifications';

  const {
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
  } = useWhatsAppNotificationLogsController({ companyId });

  if (loading && logs.length === 0) {
    return (
      <WhatsAppPageShell
        title={pageTitle}
        description={t('whatsappNotificationLogs.description')}
        icon={ClipboardList}
        backHref={backHref}
        backLabel={(t('common.back') as string) || 'رجوع'}

      >
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      </WhatsAppPageShell>
    );
  }

  return (
    <WhatsAppPageShell
      title={pageTitle}
      description={t('whatsappNotificationLogs.description')}
      icon={ClipboardList}
      backHref={backHref}
      backLabel={(t('common.back') as string) || 'رجوع'}
      eyebrow={eyebrow}
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="h-8 gap-1.5 rounded-lg text-xs"
        >
          <RefreshCw className={cn('size-3.5', refreshing && 'animate-spin')} />
          {t('common.refresh') || 'تحديث'}
        </Button>
      }
    >
      <div className="space-y-3.5">
        {/* Filters Toolbar */}
        <NotificationLogsFilterBar
          search={search}
          onSearchChange={(v) => {
            setPage(0);
            setSearch(v);
          }}
          statusFilter={statusFilter}
          onStatusChange={(v) => {
            setPage(0);
            setStatusFilter(v);
          }}
          messageTypeFilter={messageTypeFilter}
          onMessageTypeChange={(v) => {
            setPage(0);
            setMessageTypeFilter(v);
          }}
          eventTypeFilter={eventTypeFilter}
          onEventTypeChange={(v) => {
            setPage(0);
            setEventTypeFilter(v);
          }}
          sessionFilter={sessionFilter}
          onSessionChange={(v) => {
            setPage(0);
            setSessionFilter(v);
          }}
          sessions={sessions}
        />

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Logs Table */}
        <NotificationLogsTable
          logs={visibleLogs}
          formatDate={formatDate}
          onSelectLog={setSelectedLog}
        />

        {/* Pagination Bar */}
        <NotificationLogsPagination
          from={from}
          to={to}
          total={total}
          page={page}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={(n) => {
            setRowsPerPage(n);
            setPage(0);
          }}
        />

        {/* Detail Dialog */}
        <NotificationLogDetailsDialog
          log={selectedLog}
          formatDate={formatDate}
          onClose={() => setSelectedLog(null)}
        />
      </div>
    </WhatsAppPageShell>
  );
};

export default WhatsAppNotificationLogs;
