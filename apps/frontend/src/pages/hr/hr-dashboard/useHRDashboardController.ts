import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import api from "../../../services/api";
import { toast } from "sonner";
import { useAuth } from "../../../hooks/useAuthSimple";
import {
  createStorageKey,
  getWithExpiry,
  setWithExpiry,
} from "../../../utils/storage";
import { DashboardData } from "./types";
import { getErrorMessage } from "./helpers";

const CACHE_TTL_MS = 60_000;

export const useHRDashboardController = () => {
  const { t } = useTranslation();
  const tRef = useRef(t);
  tRef.current = t;

  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = useMemo(() => {
    const authCompanyId = user?.companyId || user?.company?.id;
    if (authCompanyId) {
      return createStorageKey("hr-dashboard", authCompanyId);
    }

    try {
      const rawUser = localStorage.getItem("user");
      const parsedUser = rawUser ? JSON.parse(rawUser) : null;
      const companyId =
        parsedUser?.companyId ||
        parsedUser?.company?.id ||
        parsedUser?.id ||
        "unknown";
      return createStorageKey("hr-dashboard", companyId);
    } catch {
      return createStorageKey("hr-dashboard", "unknown");
    }
  }, [user?.company?.id, user?.companyId]);

  const fetchDashboard = useCallback(
    async ({ signal, background = false }: { signal?: AbortSignal; background?: boolean } = {}) => {
      try {
        if (!background) {
          setLoading(true);
          setError(null);
        }
        const response = await api.get("/hr/dashboard", { signal });
        if (response.data?.dashboard) {
          setData(response.data.dashboard);
          setWithExpiry(cacheKey, response.data.dashboard, CACHE_TTL_MS);
        } else if (!background) {
          setError(
            tRef.current("hrDashboard.errors.fetchFailed") || "فشل تحميل لوحة التحكم",
          );
        }
      } catch (err) {
        console.error("Error fetching HR dashboard:", err);
        if (!background) {
          setError(
            tRef.current("hrDashboard.errors.fetchFailed") || "فشل تحميل لوحة التحكم",
          );
        }
      } finally {
        if (!background) {
          setLoading(false);
        }
      }
    },
    [cacheKey],
  );

  useEffect(() => {
    const controller = new AbortController();
    const cached = getWithExpiry<DashboardData>(cacheKey);

    if (cached) {
      setData(cached);
      setLoading(false);
      fetchDashboard({ signal: controller.signal, background: true });
    } else {
      fetchDashboard({ signal: controller.signal });
    }

    return () => controller.abort();
  }, [cacheKey, fetchDashboard]);

  const handleLeaveAction = async (id: string, action: "approve" | "reject") => {
    try {
      const response = await api.post(`/hr/leaves/${id}/${action}`, {
        reason: action === "reject" ? "Action from dashboard" : undefined,
      });
      if (response.data.success) {
        toast.success(
          action === "approve" ? "تمت الموافقة بنجاح" : "تم الرفض بنجاح",
        );
        fetchDashboard({ background: true });
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "حدث خطأ"));
    }
  };

  const handlePermissionAction = async (
    id: string,
    action: "approve" | "reject",
  ) => {
    try {
      const response = await api.post(`/hr/permissions/${id}/${action}`, {
        reason: action === "reject" ? "رفض من لوحة التحكم" : undefined,
      });
      if (response.data.success) {
        toast.success(
          action === "approve" ? "تمت الموافقة بنجاح" : "تم الرفض بنجاح",
        );
        fetchDashboard({ background: true });
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "حدث خطأ"));
    }
  };

  const handleAdvanceAction = async (
    id: string,
    action: "approve" | "reject",
  ) => {
    try {
      const response = await api.post(`/hr/advances/${id}/${action}`, {
        rejectionReason:
          action === "reject" ? "Action from dashboard" : undefined,
      });
      if (response.data.success) {
        toast.success(
          action === "approve" ? "تمت الموافقة بنجاح" : "تم الرفض بنجاح",
        );
        fetchDashboard({ background: true });
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "حدث خطأ"));
    }
  };

  const attendanceRate = data?.attendance?.totalEmployees
    ? Math.round(
        (data.attendance.present / data.attendance.totalEmployees) * 100,
      )
    : 0;

  return {
    loading,
    data,
    error,
    attendanceRate,
    fetchDashboard,
    handleLeaveAction,
    handlePermissionAction,
    handleAdvanceAction,
  };
};
