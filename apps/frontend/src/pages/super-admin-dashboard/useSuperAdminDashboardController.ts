import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuthSimple";
import tokenManager from "../../utils/tokenManager";
import { buildApiUrl } from "../../utils/urlHelper";
import { DashboardData } from "./types";

export const useSuperAdminDashboardController = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showActiveUsers, setShowActiveUsers] = useState(false);
  const hasDataRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    hasDataRef.current = Boolean(data);
  }, [data]);

  const fetchDashboard = useCallback(async (force = false) => {
    if (hasDataRef.current) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    if (force && hasDataRef.current) {
      try {
        const token = tokenManager.getAccessToken();
        const response = await fetch(buildApiUrl("admin/dashboard/aggregated"), {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const res = await response.json().catch(() => null);
        if (res?.success) setData(res.data);
      } catch {
        // Ignored
      }
      setIsRefreshing(false);
      setLoading(false);
      return;
    }

    if (hasDataRef.current) return;

    try {
      const token = tokenManager.getAccessToken();
      const response = await fetch(buildApiUrl("admin/dashboard/aggregated"), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const res = await response.json().catch(() => null);
      if (res?.success) setData(res.data);
    } catch {
      // Ignored
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboard();
    intervalRef.current = setInterval(() => void fetchDashboard(true), 60000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") void fetchDashboard(true);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [fetchDashboard]);

  return {
    user,
    data,
    loading,
    isRefreshing,
    showActiveUsers,
    setShowActiveUsers,
    fetchDashboard,
  };
};

export type SuperAdminDashboardController = ReturnType<
  typeof useSuperAdminDashboardController
>;
