import React from "react";
import ActiveUsersMonitor from "../components/ActiveUsersMonitor";
import { PlatformOperationsPulse } from "./super-admin/dashboard/PlatformOperationsPulse";
import {
  SuperAdminAlertsPanel,
  SuperAdminDashboardHeader,
  SuperAdminRecentActivity,
  SuperAdminSkeleton,
  SuperAdminSystemHealth,
  SuperAdminSystemServices,
  SuperAdminTelemetry,
  SuperAdminTrendChart,
  useSuperAdminDashboardController,
} from "./super-admin-dashboard/index";

export { DashboardData } from "./super-admin-dashboard/types";

const SuperAdminDashboard: React.FC = () => {
  const {
    user,
    data,
    loading,
    isRefreshing,
    showActiveUsers,
    setShowActiveUsers,
    fetchDashboard,
  } = useSuperAdminDashboardController();

  if (loading && !data) {
    return <SuperAdminSkeleton />;
  }

  return (
    <div className="w-full space-y-4" dir="rtl">
      <SuperAdminDashboardHeader
        user={user}
        isRefreshing={isRefreshing}
        onOpenActiveUsers={() => setShowActiveUsers(true)}
        onRefresh={() => fetchDashboard(true)}
      />

      <PlatformOperationsPulse />

      {data?.health && <SuperAdminSystemHealth health={data.health} />}

      <SuperAdminTelemetry
        overview={data?.overview}
        comparison={data?.comparison}
      />

      <SuperAdminRecentActivity
        recentActivity={data?.recentActivity}
        comparison={data?.comparison}
      />

      {data?.trends && data.trends.length > 0 && (
        <SuperAdminTrendChart data={data.trends} />
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {data?.systems && data.systems.length > 0 && (
            <SuperAdminSystemServices systems={data.systems} />
          )}
        </div>
        <div>
          {data?.alerts && data.alerts.length > 0 && (
            <SuperAdminAlertsPanel alerts={data.alerts} />
          )}
        </div>
      </div>

      <ActiveUsersMonitor
        isOpen={showActiveUsers}
        onClose={() => setShowActiveUsers(false)}
      />
    </div>
  );
};

export default SuperAdminDashboard;
