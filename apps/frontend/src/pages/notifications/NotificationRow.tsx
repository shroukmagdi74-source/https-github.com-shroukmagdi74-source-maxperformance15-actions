import React from "react";
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Info,
  ShieldAlert,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import { Button } from "../../components/ui/button";
import {
  NotificationItem,
  formatNotificationTime,
  getTypeBadge,
  resolveTargetUrl,
} from "./types";

interface NotificationRowProps {
  notification: NotificationItem;
  onClick: (notification: NotificationItem) => void;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const getNotificationIcon = (type: string) => {
  const normalized = type.toLowerCase();
  if (normalized.includes("order")) {
    return <ShoppingBag className="size-4 text-emerald-600 dark:text-emerald-400" />;
  }
  if (normalized.includes("error")) {
    return <AlertCircle className="size-4 text-rose-500" />;
  }
  if (normalized.includes("warning")) {
    return <AlertTriangle className="size-4 text-amber-500" />;
  }
  if (normalized.includes("success")) {
    return <CheckCircle2 className="size-4 text-emerald-500" />;
  }
  if (normalized.includes("incident") || normalized.includes("stoppage")) {
    return <ShieldAlert className="size-4 text-rose-500" />;
  }
  return <Info className="size-4 text-sky-500" />;
};

export const NotificationRow: React.FC<NotificationRowProps> = ({
  notification,
  onClick,
  onMarkAsRead,
  onDelete,
}) => {
  const targetUrl = resolveTargetUrl(notification);
  const badge = getTypeBadge(notification.type);
  const isClickable = Boolean(targetUrl);

  return (
    <div
      onClick={() => onClick(notification)}
      className={`group relative p-3.5 sm:p-4 flex items-start gap-3 transition-colors ${
        isClickable ? "cursor-pointer" : ""
      } ${
        !notification.isRead
          ? "bg-primary/[0.03] hover:bg-primary/[0.06]"
          : "hover:bg-muted/30"
      }`}
    >
      {/* Visual Unread Accent Indicator */}
      {!notification.isRead && (
        <div className="absolute top-0 bottom-0 right-0 w-1 bg-primary" />
      )}

      {/* Icon Bubble */}
      <div className="size-8.5 rounded-lg bg-muted/60 border border-border/60 flex items-center justify-center shrink-0 mt-0.5">
        {getNotificationIcon(notification.type)}
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <h2
              className={`text-xs sm:text-sm font-semibold leading-snug truncate ${
                !notification.isRead
                  ? "text-foreground font-bold"
                  : "text-foreground/80"
              }`}
            >
              {notification.title}
            </h2>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] border ${badge.className}`}
            >
              {badge.label}
            </span>
          </div>

          {/* Micro Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {!notification.isRead && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification.id);
                }}
                className="size-7 text-muted-foreground hover:text-primary rounded-md"
                title="تحديد كمقروء"
                aria-label="تحديد كمقروء"
              >
                <Eye className="size-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification.id);
              }}
              className="size-7 text-muted-foreground hover:text-rose-600 rounded-md"
              title="حذف الإشعار"
              aria-label="حذف الإشعار"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Message Body */}
        <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed mb-2">
          {notification.message}
        </p>

        {/* Footer Details: Time + Target Link */}
        <div className="flex items-center justify-between gap-2 text-[10.5px] text-muted-foreground pt-1.5 border-t border-border/40">
          <div className="flex items-center gap-1.5 font-mono">
            <Clock className="size-3 text-muted-foreground/70 shrink-0" />
            <span title={notification.timestamp.toLocaleString("ar-EG")}>
              {formatNotificationTime(notification.timestamp)}
            </span>
            {notification.isRead && (
              <span className="inline-flex items-center gap-1 text-muted-foreground/70 mr-1.5">
                <Check className="size-2.5 text-emerald-500" />
                <span>مقروء</span>
              </span>
            )}
          </div>

          {targetUrl && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary group-hover:underline">
              <span>عرض التفاصيل</span>
              <ExternalLink className="size-3 shrink-0" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
