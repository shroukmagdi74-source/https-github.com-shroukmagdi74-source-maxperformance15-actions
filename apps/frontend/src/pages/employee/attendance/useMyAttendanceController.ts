import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import api from "../../../services/api";
import { useAuth } from "../../../hooks/useAuthSimple";
import {
  AttendanceStats,
  SelectedMapLocation,
  STALE_SHIFT_HOURS,
  TodayAttendance,
  TodayGoal,
} from "./types";
import {
  formatDateWithTZ,
  formatTimeWithTZ,
  getApiError,
  getLocationPayload,
  handleAttendanceActionError,
  isSameDayTZ,
} from "./helpers";

export const useMyAttendanceController = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const timezone = user?.timezone || "Africa/Cairo";
  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] =
    useState<TodayAttendance | null>(null);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [recentAttendance, setRecentAttendance] = useState<TodayAttendance[]>(
    [],
  );
  const [hasMoreRecent, setHasMoreRecent] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [duration, setDuration] = useState<string>("00:00:00");
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedMapLocation | null>(null);
  const [workMode, setWorkMode] = useState<"OFFICE" | "HOME">("OFFICE");
  const [todayGoals, setTodayGoals] = useState<TodayGoal[]>([]);
  const [goalProgressDrafts, setGoalProgressDrafts] = useState<
    Record<string, string>
  >({});
  const [showGoalsReviewDialog, setShowGoalsReviewDialog] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [recentPage, setRecentPage] = useState(1);
  const dayKeyRef = useRef(
    new Date().toLocaleDateString("en-CA", { timeZone: timezone }),
  );

  const setErrorKey = (key: string, message: string) => {
    setErrors((prev) => ({ ...prev, [key]: message }));
  };

  const clearErrorKey = (key: string) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
    return true;
  };

  const syncGoalDrafts = (goals: TodayGoal[]) => {
    setGoalProgressDrafts(
      Object.fromEntries(
        goals.map((goal) => [goal.id, String(Number(goal.currentValue || 0))]),
      ),
    );
  };

  useEffect(() => {
    if (todayAttendance?.checkIn && !todayAttendance.checkOut) {
      const startTime = new Date(todayAttendance.checkIn).getTime();

      const interval = setInterval(() => {
        const now = new Date().getTime();
        const diff = now - startTime;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setDuration(
          `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
        );
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [todayAttendance]);

  useEffect(() => {
    void fetchTodayAttendance();
    void fetchStats();
    void fetchTodayGoals();
    dayKeyRef.current = new Date().toLocaleDateString("en-CA", {
      timeZone: timezone,
    });

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      const nextDayKey = now.toLocaleDateString("en-CA", {
        timeZone: timezone,
      });

      if (dayKeyRef.current !== nextDayKey) {
        dayKeyRef.current = nextDayKey;
        setDuration("00:00:00");
        void fetchTodayAttendance();
        void fetchStats();
        void fetchTodayGoals();

        if (selectedMonth === nextDayKey.slice(0, 7)) {
          setRecentPage(1);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, timezone]);

  useEffect(() => {
    void fetchRecentAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, recentPage]);

  const fetchTodayAttendance = async () => {
    try {
      setLoading(true);
      const response = await api.get("/hr/attendance/my-today");
      setTodayAttendance(response.data.attendance);
      clearErrorKey("today");
    } catch (error: unknown) {
      const apiError = getApiError(error);
      console.error("Error fetching today attendance:", error);
      const errorMessage =
        apiError.response?.data?.error ||
        t("employee.attendance.errorFetchToday");
      setErrorKey("today", errorMessage);
      toast.error(errorMessage, {
        description: t("employee.attendance.errorFetchTodayDesc"),
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/hr/attendance/my-stats");
      setStats(response.data.stats);
      clearErrorKey("stats");
    } catch (error: unknown) {
      const apiError = getApiError(error);
      console.error("Error fetching stats:", error);
      const errorMessage =
        apiError.response?.data?.error ||
        t("employee.attendance.errorFetchStats");
      setErrorKey("stats", errorMessage);
      toast.error(errorMessage, {
        description: t("employee.attendance.errorFetchStatsDesc"),
      });
    }
  };

  const fetchTodayGoals = async () => {
    try {
      const response = await api.get("/tasks/goals/today");
      const goals = (response.data?.goals || []) as TodayGoal[];
      setTodayGoals(goals);
      syncGoalDrafts(goals);
      clearErrorKey("goals");
    } catch (error: unknown) {
      console.error("Error fetching today goals:", error);
      setTodayGoals([]);
      syncGoalDrafts([]);
    }
  };

  const fetchRecentAttendance = async () => {
    try {
      const [year, month] = selectedMonth.split("-");
      const startDate = `${year}-${month}-01`;
      const endDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      const endDate = `${year}-${month}-${String(endDay).padStart(2, "0")}`;
      const response = await api.get(
        `/hr/attendance/my-recent?limit=15&page=${recentPage}&startDate=${startDate}&endDate=${endDate}`,
      );
      setRecentAttendance(response.data.attendance || []);
      setHasMoreRecent(Boolean(response.data.pagination?.hasMore));
      clearErrorKey("recent");
    } catch (error: unknown) {
      const apiError = getApiError(error);
      console.error("Error fetching recent attendance:", error);
      const errorMessage =
        apiError.response?.data?.error ||
        t("employee.attendance.errorFetchLog");
      setErrorKey("recent", errorMessage);
      setHasMoreRecent(false);
      toast.error(errorMessage, {
        description: t("employee.attendance.errorFetchLogDesc"),
      });
    }
  };

  const openLocationInMap = (
    latitude: number,
    longitude: number,
    type: string,
  ) => {
    setSelectedLocation({ latitude, longitude, type });
    setShowMapModal(true);
  };

  const finalizeCheckOut = async () => {
    try {
      setCheckingOut(true);
      const location = await getLocationPayload();

      await api.post("/hr/attendance/check-out", {
        method: "self_service",
        workMode,
        location: location ? JSON.stringify(location) : null,
      });

      toast.success(t("employee.attendance.checkoutSuccess"));
      await fetchTodayAttendance();
      await fetchStats();
      await fetchTodayGoals();
      setRecentPage(1);
      await fetchRecentAttendance();
      setShowGoalsReviewDialog(false);
    } catch (error: unknown) {
      handleAttendanceActionError(error, t, "checkout");
    } finally {
      setCheckingOut(false);
    }
  };

  const submitGoalUpdatesAndCheckOut = async () => {
    try {
      setCheckingOut(true);

      for (const goal of todayGoals) {
        const nextValue = Number.parseFloat(goalProgressDrafts[goal.id] || "0");

        if (!Number.isFinite(nextValue) || nextValue < 0) {
          toast.error(
            t("employee.attendance.invalidGoalValue", { title: goal.title }),
          );
          setCheckingOut(false);
          return;
        }

        if (nextValue === Number(goal.currentValue || 0)) {
          continue;
        }

        await api.post(`/tasks/goals/${goal.id}/progress`, {
          currentValue: nextValue,
        });
      }
    } catch (error: unknown) {
      const apiError = getApiError(error);
      console.error("Error updating today goals:", error);
      toast.error(
        apiError.response?.data?.error ||
          t("employee.attendance.goalsUpdateFailed"),
      );
      setCheckingOut(false);
      return;
    }

    setCheckingOut(false);
    await finalizeCheckOut();
  };

  const handleCheckIn = async () => {
    try {
      setCheckingIn(true);
      const location = await getLocationPayload();

      await api.post("/hr/attendance/check-in", {
        method: "self_service",
        workMode,
        location: location ? JSON.stringify(location) : null,
      });

      toast.success(t("employee.attendance.checkinSuccess"), {
        description: t(
          "employee.attendance.desktopPrompt",
          "تذكير: يرجى التأكد من تشغيل تطبيق سطح المكتب MaxP Workspace لتوثيق فترات النشاط وساعات العمل بدقة.",
        ),
        duration: 7000,
      });
      await fetchTodayAttendance();
      await fetchStats();
      await fetchTodayGoals();
      setRecentPage(1);
      await fetchRecentAttendance();
    } catch (error: unknown) {
      handleAttendanceActionError(error, t, "checkin");
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    if (todayGoals.length > 0) {
      syncGoalDrafts(todayGoals);
      setShowGoalsReviewDialog(true);
      return;
    }

    await finalizeCheckOut();
  };

  const canCheckIn = !todayAttendance?.checkIn;
  const canCheckOut = Boolean(
    todayAttendance?.checkIn && !todayAttendance?.checkOut,
  );
  const errorMessages = Object.values(errors);

  const checkInDate = todayAttendance?.checkIn
    ? new Date(todayAttendance.checkIn)
    : null;
  const checkOutDate = todayAttendance?.checkOut
    ? new Date(todayAttendance.checkOut)
    : null;

  const hasOpenShift = Boolean(
    todayAttendance?.checkIn && !todayAttendance?.checkOut,
  );
  const isCrossDay = Boolean(
    checkInDate && !isSameDayTZ(checkInDate, new Date(), timezone),
  );
  const isStaleShift = Boolean(
    hasOpenShift &&
      checkInDate &&
      (Date.now() - checkInDate.getTime()) / (1000 * 60 * 60) >=
        STALE_SHIFT_HOURS,
  );
  const showOvernightWarning = Boolean(isCrossDay || isStaleShift);

  const recordDateLabel = todayAttendance?.date
    ? formatDateWithTZ(todayAttendance.date, timezone)
    : "";

  const formattedCheckIn = checkInDate
    ? `${formatTimeWithTZ(checkInDate, timezone)}${
        isCrossDay ? ` • ${formatDateWithTZ(checkInDate, timezone)}` : ""
      }`
    : "-";

  const formattedCheckOut = checkOutDate
    ? `${formatTimeWithTZ(checkOutDate, timezone)}${
        checkOutDate && !isSameDayTZ(checkOutDate, new Date(), timezone)
          ? ` • ${formatDateWithTZ(checkOutDate, timezone)}`
          : ""
      }`
    : "-";

  const staleHours = isStaleShift
    ? Math.floor(
        (Date.now() - (checkInDate?.getTime() || 0)) / (1000 * 60 * 60),
      )
    : null;

  return {
    t,
    user,
    timezone,
    loading,
    todayAttendance,
    stats,
    recentAttendance,
    hasMoreRecent,
    currentTime,
    checkingIn,
    checkingOut,
    errorMessages,
    duration,
    showMapModal,
    setShowMapModal,
    selectedLocation,
    workMode,
    setWorkMode,
    todayGoals,
    goalProgressDrafts,
    setGoalProgressDrafts,
    showGoalsReviewDialog,
    setShowGoalsReviewDialog,
    selectedMonth,
    setSelectedMonth,
    recentPage,
    setRecentPage,
    openLocationInMap,
    handleCheckIn,
    handleCheckOut,
    submitGoalUpdatesAndCheckOut,
    canCheckIn,
    canCheckOut,
    checkInDate,
    showOvernightWarning,
    recordDateLabel,
    formattedCheckIn,
    formattedCheckOut,
    staleHours,
  };
};
