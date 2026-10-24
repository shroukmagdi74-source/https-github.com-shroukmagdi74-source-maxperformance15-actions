import React from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCheck, RefreshCw, Settings } from "lucide-react";

import { Button } from "../../components/ui/button";

interface NotificationsHeaderProps {
  unreadCount: number;
  refreshing: boolean;
  onMarkAllAsRead: () => void;
  onRefresh: () => void;
}

export const NotificationsHeader: React.FC<NotificationsHeaderProps> = ({
  unreadCount,
  refreshing,
  onMarkAllAsRead,
  onRefresh,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-lg border border-border/80 bg-card flex items-center justify-center text-foreground shadow-2xs">
          <Bell className="size-4.5 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">مركز التنبيهات</h1>
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-primary/10 text-primary border border-primary/20">
                {unreadCount} غير مقروء
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            متابعة فورية للأحداث التشغيلية، ومبيعات المتاجر، والتنبيهات النظامية
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 self-end sm:self-auto">
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onMarkAllAsRead}
            className="h-8 text-xs font-medium gap-1.5 shadow-2xs active:scale-[0.98] transition-transform"
          >
            <CheckCheck className="size-3.5 text-primary" />
            <span>قراءة الكل</span>
          </Button>
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          disabled={refreshing}
          className="size-8 rounded-lg shadow-2xs active:scale-[0.98] transition-transform"
          title="تحديث القائمة"
        >
          <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
        </Button>

        <Link
          to="/notification-settings"
          className="inline-flex items-center justify-center size-8 rounded-lg border border-border/80 bg-card hover:bg-muted/80 text-muted-foreground hover:text-foreground shadow-2xs active:scale-[0.98] transition-transform"
          title="إعدادات الإشعارات"
        >
          <Settings className="size-3.5" />
        </Link>
      </div>
    </div>
  );
};
