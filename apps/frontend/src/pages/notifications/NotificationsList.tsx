import React from "react";
import { Bell, RefreshCw } from "lucide-react";

import { Button } from "../../components/ui/button";
import { NotificationItem, NotificationReadFilter } from "./types";
import { NotificationRow } from "./NotificationRow";

interface NotificationsListProps {
  notifications: NotificationItem[];
  filter: NotificationReadFilter;
  onRefresh: () => void;
  onNotificationClick: (notification: NotificationItem) => void;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export const NotificationsList: React.FC<NotificationsListProps> = ({
  notifications,
  filter,
  onRefresh,
  onNotificationClick,
  onMarkAsRead,
  onDelete,
}) => {
  if (notifications.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="size-12 rounded-xl bg-muted/50 text-muted-foreground mx-auto mb-3 flex items-center justify-center">
          <Bell className="size-6" />
        </div>
        <h3 className="text-sm font-semibold text-foreground mb-1">
          لا توجد إشعارات تطابق التصفية
        </h3>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto mb-4">
          {filter === "unread"
            ? "رائع! لقد قرأت جميع الإشعارات المتاحة."
            : "ستظهر هنا أي تنبيهات أو طلبات جديدة فور وصولها."}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="h-8 text-xs font-medium gap-1.5"
        >
          <RefreshCw className="size-3" />
          <span>إعادة التحقق</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/60">
      {notifications.map((notification) => (
        <NotificationRow
          key={notification.id}
          notification={notification}
          onClick={onNotificationClick}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
