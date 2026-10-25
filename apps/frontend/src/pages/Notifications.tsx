import React from "react";
import {
  NotificationsFilterBar,
  NotificationsHeader,
  NotificationsList,
  NotificationsSkeleton,
  NotificationsTelemetry,
  useNotificationsController,
} from "./notifications/index";

export type { NotificationItem } from "./notifications/types";

const Notifications: React.FC = () => {
  const {
    notifications,
    filteredNotifications,
    loading,
    refreshing,
    filter,
    setFilter,
    typeFilter,
    setTypeFilter,
    unreadCount,
    incidentsCount,
    todayCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    handleNotificationClick,
  } = useNotificationsController();

  if (loading) {
    return <NotificationsSkeleton />;
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-6xl mx-auto">
      <NotificationsHeader
        unreadCount={unreadCount}
        refreshing={refreshing}
        onMarkAllAsRead={markAllAsRead}
        onRefresh={() => fetchNotifications(false)}
      />

      <NotificationsTelemetry
        totalCount={notifications.length}
        unreadCount={unreadCount}
        incidentsCount={incidentsCount}
        todayCount={todayCount}
      />

      <div className="rounded-xl border border-border/80 dark:border-border/60 bg-card shadow-2xs overflow-hidden">
        <NotificationsFilterBar
          filter={filter}
          onFilterChange={setFilter}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          totalCount={notifications.length}
          unreadCount={unreadCount}
        />

        <NotificationsList
          notifications={filteredNotifications}
          filter={filter}
          onRefresh={() => fetchNotifications(false)}
          onNotificationClick={handleNotificationClick}
          onMarkAsRead={markAsRead}
          onDelete={deleteNotification}
        />
      </div>
    </div>
  );
};

export default Notifications;
