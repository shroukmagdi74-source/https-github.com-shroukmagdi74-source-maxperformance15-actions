import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "../../../hooks/useAuthSimple";
import api from "../../../services/api";
import {
  createStorageKey,
  getWithExpiry,
  setWithExpiry,
} from "../../../utils/storage";
import {
  AdvanceRequest,
  DASHBOARD_CACHE_TTL_MS,
  DashboardCachePayload,
  EmployeeInfo,
  HR_APP_SLUGS,
  LastPayroll,
  PermissionRequest,
  RecentLeave,
  Reward,
  TodayAttendance,
  Warning,
} from "./types";

export const useMyDashboardController = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const activeApps: string[] = (user as any)?.company?.activeApps ?? [];
  const hasHrActive = activeApps.some((a) => HR_APP_SLUGS.has(a.toLowerCase()));
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [employee, setEmployee] = useState<EmployeeInfo | null>(null);
  const [employeeErrorStatus, setEmployeeErrorStatus] = useState<number | null>(
    null,
  );
  const [todayAttendance, setTodayAttendance] =
    useState<TodayAttendance | null>(null);
  const [recentLeaves, setRecentLeaves] = useState<RecentLeave[]>([]);
  const [permissions, setPermissions] = useState<PermissionRequest[]>([]);
  const [advances, setAdvances] = useState<AdvanceRequest[]>([]);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [lastPayroll, setLastPayroll] = useState<LastPayroll | null>(null);

  const cacheKey = useMemo(
    () => createStorageKey("dashboard", `employee:${user?.id || "anon"}`),
    [user?.id],
  );

  const applyDashboardPayload = useCallback(
    (payload: DashboardCachePayload) => {
      if (!payload) return;
      setEmployee(payload.employee ?? null);
      setTodayAttendance(payload.todayAttendance ?? null);
      setRecentLeaves(payload.recentLeaves ?? []);
      setPermissions(payload.permissions ?? []);
      setAdvances(payload.advances ?? []);
      setWarnings(payload.warnings ?? []);
      setRewards(payload.rewards ?? []);
      setLastPayroll(payload.lastPayroll ?? null);
    },
    [],
  );

  const fetchDashboardData = useCallback(
    async ({
      signal,
      background = false,
    }: { signal?: AbortSignal; background?: boolean } = {}) => {
      if (!background) {
        setLoading(true);
      }

      try {
        const [
          empRes,
          attRes,
          leavesRes,
          permissionsRes,
          advancesRes,
          warningsRes,
          rewardsRes,
          payrollRes,
        ] = await Promise.allSettled([
          api.get("/hr/employees/me", { signal }),
          api.get("/hr/attendance/my-today", { signal }),
          api.get("/hr/leaves/my-recent", { params: { limit: 5 }, signal }),
          api.get("/hr/permissions", {
            params: { mine: true, limit: 5 },
            signal,
          }),
          api.get("/hr/advances/my", { params: { limit: 5 }, signal }),
          api.get("/hr/warnings/my-history", { params: { limit: 5 }, signal }),
          api.get("/hr/rewards/my-rewards", { params: { limit: 5 }, signal }),
          api.get("/hr/payroll/my-last", { signal }),
        ]);

        if (empRes.status === "rejected") {
          const status = empRes.reason?.response?.status;
          if (status) {
            setEmployeeErrorStatus(status);
          }
        } else {
          setEmployeeErrorStatus(null);
        }

        const empData: any =
          empRes.status === "fulfilled" ? empRes.value.data : null;
        const attData: any =
          attRes.status === "fulfilled" ? attRes.value.data : null;
        const leavesData: any =
          leavesRes.status === "fulfilled" ? leavesRes.value.data : null;
        const permissionsData: any =
          permissionsRes.status === "fulfilled"
            ? permissionsRes.value.data
            : null;
        const advancesData: any =
          advancesRes.status === "fulfilled" ? advancesRes.value.data : null;
        const warningsData: any =
          warningsRes.status === "fulfilled" ? warningsRes.value.data : null;
        const rewardsData: any =
          rewardsRes.status === "fulfilled" ? rewardsRes.value.data : null;
        const payrollData: any =
          payrollRes.status === "fulfilled" ? payrollRes.value.data : null;

        const payload: DashboardCachePayload = {
          employee: empData?.employee ?? null,
          todayAttendance: attData?.attendance ?? null,
          recentLeaves: leavesData?.leaves || [],
          permissions: permissionsData?.requests || [],
          advances: advancesData?.data || [],
          warnings: warningsData?.warnings || [],
          rewards: rewardsData?.data || [],
          lastPayroll: payrollData?.payroll ?? null,
        };

        applyDashboardPayload(payload);
        if (payload.employee) {
          setWithExpiry(cacheKey, payload, DASHBOARD_CACHE_TTL_MS);
        }
      } catch (error: any) {
        if (
          error?.name === "CanceledError" ||
          error?.code === "ERR_CANCELED"
        ) {
          return;
        }
        console.error("Error fetching dashboard data:", error);
        if (!background) {
          toast.error(t("employee.dashboard.fetchError"));
        }
      } finally {
        if (!background) {
          setLoading(false);
        }
      }
    },
    [applyDashboardPayload, cacheKey, t],
  );

  useEffect(() => {
    if (!hasHrActive) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const cached = getWithExpiry<DashboardCachePayload>(cacheKey);

    if (cached) {
      applyDashboardPayload(cached);
      setLoading(false);
      void fetchDashboardData({ signal: controller.signal, background: true });
    } else {
      void fetchDashboardData({ signal: controller.signal });
    }

    return () => controller.abort();
  }, [cacheKey, fetchDashboardData, applyDashboardPayload, hasHrActive]);

  const canCheckIn = !todayAttendance?.checkIn;
  const canCheckOut = Boolean(
    todayAttendance?.checkIn && !todayAttendance?.checkOut,
  );

  const pendingRequestsCount = [
    ...recentLeaves.filter((l) => l.status === "PENDING"),
    ...permissions.filter((p) => p.status === "PENDING"),
    ...advances.filter((a) => a.status === "PENDING"),
  ].length;

  return {
    navigate,
    t,
    hasHrActive,
    loading,
    activeTab,
    setActiveTab,
    employee,
    employeeErrorStatus,
    todayAttendance,
    recentLeaves,
    permissions,
    advances,
    warnings,
    rewards,
    lastPayroll,
    canCheckIn,
    canCheckOut,
    pendingRequestsCount,
  };
};
