import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  LogEntry,
  MESSAGE_TYPE_LABELS,
  MESSAGE_TYPE_STYLES,
  STATUS_LABELS,
  STATUS_STYLES,
} from './types';

interface NotificationLogDetailsDialogProps {
  log: LogEntry | null;
  formatDate: (val?: string | null) => string;
  onClose: () => void;
}

export const NotificationLogDetailsDialog: React.FC<NotificationLogDetailsDialogProps> = ({
  log,
  formatDate,
  onClose,
}) => {
  return (
    <Dialog open={!!log} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl rounded-xl p-5">
        <DialogHeader className="border-b border-border/40 pb-3">
          <DialogTitle className="text-base font-bold">تفاصيل الإشعار المرسل</DialogTitle>
          <DialogDescription className="text-xs font-mono tabular-nums text-muted-foreground">
            {log ? formatDate(log.createdAt) : ''}
          </DialogDescription>
        </DialogHeader>

        {log && (
          <div className="space-y-3.5 py-1">
            <div className="grid gap-2.5 sm:grid-cols-2">
              <div className="rounded-lg border border-border/40 bg-card p-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  المستلم
                </span>
                <p className="mt-1 text-xs font-bold text-foreground">
                  {log.recipientName || 'مستلم غير محدد'}
                </p>
                <p className="text-xs font-mono tabular-nums text-muted-foreground" dir="ltr">
                  {log.recipientPhone}
                </p>
              </div>

              <div className="rounded-lg border border-border/40 bg-card p-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  الجلسة المستخدمة
                </span>
                <p className="mt-1 text-xs font-bold text-foreground">
                  {log.sessionName || '—'}
                </p>
                <p className="text-xs font-mono tabular-nums text-muted-foreground" dir="ltr">
                  {log.sessionPhone || ''}{' '}
                  {log.sessionProvider ? `· ${log.sessionProvider}` : ''}
                </p>
              </div>

              <div className="rounded-lg border border-border/40 bg-card p-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  نوع الرسالة
                </span>
                <div className="mt-1.5 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      'rounded-md text-[10px] font-mono px-2 py-0.5',
                      MESSAGE_TYPE_STYLES[log.messageType] || MESSAGE_TYPE_STYLES.TEXT
                    )}
                  >
                    {MESSAGE_TYPE_LABELS[log.messageType] || log.messageType || '—'}
                  </Badge>
                </div>
              </div>

              <div className="rounded-lg border border-border/40 bg-card p-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  حالة الإرسال
                </span>
                <div className="mt-1.5 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      'rounded-md text-[10px] font-medium px-2 py-0.5',
                      STATUS_STYLES[log.status] || STATUS_STYLES.CANCELLED
                    )}
                  >
                    {STATUS_LABELS[log.status] || log.status}
                  </Badge>
                </div>
              </div>
            </div>

            {(log.templateName || log.metaTemplateName) && (
              <div className="rounded-lg border border-border/40 bg-card p-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  القالب المستخدم
                </span>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <span className="font-medium text-foreground">{log.templateName || '—'}</span>
                  {log.metaTemplateName && (
                    <span
                      className="rounded bg-indigo-50 px-1.5 py-0.5 text-[11px] font-mono font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                      dir="ltr"
                    >
                      {log.metaTemplateName}
                    </span>
                  )}
                </div>
              </div>
            )}

            {log.failureReason && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-destructive">
                  سبب فشل الإرسال
                </span>
                <p className="mt-1 text-xs text-destructive font-mono leading-relaxed">
                  {log.failureReason}
                </p>
                {log.errorCode && (
                  <p className="mt-1 text-[11px] font-mono text-destructive/80" dir="ltr">
                    كود الخطأ: {log.errorCode}
                  </p>
                )}
              </div>
            )}

            {log.content && (
              <div className="rounded-lg border border-border/40 bg-card p-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  محتوى الرسالة
                </span>
                <pre className="mt-1.5 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-md bg-muted/40 p-2.5 text-xs font-mono leading-relaxed text-foreground">
                  {log.content}
                </pre>
              </div>
            )}

            <div className="grid gap-2.5 sm:grid-cols-2">
              {log.orderNumber && (
                <div className="rounded-lg border border-border/40 bg-card p-2.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    رقم الطلب
                  </span>
                  <p className="mt-0.5 text-xs font-mono font-bold text-foreground" dir="ltr">
                    {log.orderNumber}
                  </p>
                </div>
              )}
              {log.whatsappMessageId && (
                <div className="rounded-lg border border-border/40 bg-card p-2.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    معرّف الرسالة (Message ID)
                  </span>
                  <p className="mt-0.5 truncate text-xs font-mono text-muted-foreground" dir="ltr">
                    {log.whatsappMessageId}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
