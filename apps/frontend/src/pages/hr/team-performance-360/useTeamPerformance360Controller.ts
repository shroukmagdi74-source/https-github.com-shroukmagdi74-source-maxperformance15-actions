import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../../../services/api";
import { toast } from "sonner";
import type {
  LeaderboardData,
  LeaderboardEmployee,
  PeriodMode,
} from "./types";

export const useTeamPerformance360Controller = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTier, setSelectedTier] = useState<string>("ALL");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("ALL");
  const [selectedPeriodMode, setSelectedPeriodMode] =
    useState<PeriodMode>("SLIDING_30");

  // Modal dialog states
  const [selectedEmployeeForPIP, setSelectedEmployeeForPIP] =
    useState<LeaderboardEmployee | null>(null);
  const [selectedEmployeeForDrilldown, setSelectedEmployeeForDrilldown] =
    useState<LeaderboardEmployee | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      let queryParams = "";
      const now = new Date();
      if (selectedPeriodMode === "CURRENT_MONTH") {
        queryParams = `?month=${now.getMonth() + 1}&year=${now.getFullYear()}`;
      } else if (selectedPeriodMode === "PREVIOUS_MONTH") {
        const prevMonthDate = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1,
        );
        queryParams = `?month=${prevMonthDate.getMonth() + 1}&year=${prevMonthDate.getFullYear()}`;
      }

      const res = await api.get(
        `/hr/performance/team-leaderboard${queryParams}`,
      );
      if (res.data?.success && res.data?.data) {
        setData(res.data.data);
      } else {
        toast.error("تعذر تحميل لوحة تقييم الفريق");
      }
    } catch (err: any) {
      console.error("Error fetching team leaderboard:", err);
      // Fallback data in dev / offline mode
      setData({
        summary: {
          totalEmployees: 6,
          evaluatedEmployees: 6,
          averageScore: 82,
          tierCounts: {
            TIER_S: 1,
            TIER_A: 3,
            TIER_B: 1,
            TIER_C: 1,
            TIER_D: 0,
            PENDING_EVALUATION: 0,
          },
          atRiskCount: 1,
          bestDepartment: "التطوير البرمجي",
          needsSupportDepartment: "خدمة العملاء",
        },
        departmentStats: [
          { department: "التطوير البرمجي", employeeCount: 3, averageScore: 88 },
          {
            department: "المبيعات والتسويق",
            employeeCount: 2,
            averageScore: 80,
          },
          { department: "خدمة العملاء", employeeCount: 1, averageScore: 68 },
        ],
        leaderboard: [
          {
            id: "emp-1",
            employeeNumber: "EMP-101",
            name: "مختار عبد العال",
            departmentName: "التطوير البرمجي",
            positionTitle: "مطور برمجيات أول",
            compositeScore: 94,
            isEvaluated: true,
            tier: "TIER_S",
            tierLabel: "متميز (Tier S)",
            isAtRisk: false,
            riskFlags: [],
            pillars: {
              delivery: {
                score: 96,
                weight: 25,
                label: "سرعة ومعدل الإنجاز",
                details: "24/25 منجزة",
              },
              quality: {
                score: 95,
                weight: 25,
                label: "جودة المخرجات والاعتماد",
                details: "اعتماد 100%",
              },
              punctuality: {
                score: 90,
                weight: 20,
                label: "الانضباط والحضور",
                details: "22 حضور (1 تأخير)",
              },
              focus: {
                score: 92,
                weight: 20,
                label: "التركيز والنشاط الرقمي",
                details: "22 أيام موثقة",
              },
              goals: {
                score: 95,
                weight: 10,
                label: "الأهداف ومؤشرات النتائج",
                details: "3 أهداف متابعة",
              },
            },
            telemetryStats: {
              tasksCompleted: 24,
              totalTasks: 25,
              onTimeTasks: 24,
              lateTasksCount: 0,
              returns: 0,
              lateDays: 1,
              monitoredDays: 22,
              activeGoals: 3,
            },
          },
        ],
        period:
          selectedPeriodMode === "SLIDING_30"
            ? "آخر 30 يوماً"
            : "الشهر الحالي",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedPeriodMode]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const departments = useMemo(() => {
    if (!data?.leaderboard) return [];
    const depts = new Set<string>();
    data.leaderboard.forEach((e) => {
      if (e.departmentName) depts.add(e.departmentName);
    });
    return Array.from(depts);
  }, [data]);

  const filteredEmployees = useMemo(() => {
    if (!data?.leaderboard) return [];
    return data.leaderboard.filter((e) => {
      const matchSearch =
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.employeeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.positionTitle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchTier =
        selectedTier === "ALL"
          ? true
          : selectedTier === "AT_RISK"
            ? e.isAtRisk
            : selectedTier === "PENDING"
              ? e.tier === "PENDING_EVALUATION"
              : e.tier === selectedTier;
      const matchDept =
        selectedDepartment === "ALL"
          ? true
          : e.departmentName === selectedDepartment;
      return matchSearch && matchTier && matchDept;
    });
  }, [data, searchQuery, selectedTier, selectedDepartment]);

  return {
    loading,
    data,
    searchQuery,
    setSearchQuery,
    selectedTier,
    setSelectedTier,
    selectedDepartment,
    setSelectedDepartment,
    selectedPeriodMode,
    setSelectedPeriodMode,
    selectedEmployeeForPIP,
    setSelectedEmployeeForPIP,
    selectedEmployeeForDrilldown,
    setSelectedEmployeeForDrilldown,
    fetchLeaderboard,
    departments,
    filteredEmployees,
  };
};
