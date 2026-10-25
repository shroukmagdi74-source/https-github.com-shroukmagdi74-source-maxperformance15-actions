import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../../services/api";
import {
  EmployeeMonitorDetailsProps,
  EmployeeMonitorTimelineData,
  MonitorDetailsTabId,
} from "./types";
import {
  calculateActivityLagMinutes,
  formatMonitorTimeAr,
} from "./helpers";

export const useEmployeeMonitorDetailsController = ({
  employeeIdProp,
  onBackProp,
  teamMembersProp = [],
  onSelectEmployeeProp,
}: EmployeeMonitorDetailsProps) => {
  const params = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const currentEmployeeId = employeeIdProp || params.employeeId;

  const [activeTab, setActiveTab] = useState<MonitorDetailsTabId>("tasks");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<EmployeeMonitorTimelineData>({
    activities: [],
    apps: [],
    websites: [],
  });

  const fetchDetails = useCallback(async () => {
    if (!currentEmployeeId) return;
    setLoading(true);
    try {
      const res: any = await api.get(
        `/employee-monitor/timeline/${currentEmployeeId}?date=${selectedDate}`,
      );
      if (res?.data?.data) {
        setData({
          summary: res.data.data.summary,
          employee: res.data.data.employee,
          taskPerformance: res.data.data.taskPerformance,
          breaksSummary: res.data.data.breaksSummary,
          activities: res.data.data.activities || [],
          apps: res.data.data.apps || [],
          websites: res.data.data.websites || [],
        });
      }
    } catch (err) {
      console.warn("[EmployeeMonitorDetails] Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [currentEmployeeId, selectedDate]);

  useEffect(() => {
    void fetchDetails();
  }, [fetchDetails]);

  const handleDateStep = (daysOffset: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + daysOffset);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (current <= today) {
      setSelectedDate(current.toISOString().split("T")[0]);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const isToday = selectedDate === todayStr;
  const yesterdayStr = new Date(Date.now() - 86400000)
    .toISOString()
    .split("T")[0];

  const currentMemberIndex = teamMembersProp.findIndex(
    (m) => m.employeeId === currentEmployeeId,
  );
  const hasPrevMember = currentMemberIndex > 0;
  const hasNextMember =
    currentMemberIndex >= 0 && currentMemberIndex < teamMembersProp.length - 1;

  const handleSwitchEmployee = (targetId: string) => {
    if (onSelectEmployeeProp) {
      onSelectEmployeeProp(targetId);
    } else {
      navigate(`/hr/monitor/${targetId}`);
    }
  };

  const handleBack = () => {
    if (onBackProp) {
      onBackProp();
    } else {
      navigate("/hr/monitor");
    }
  };

  const employeeName = data.employee?.firstName
    ? `${data.employee.firstName} ${data.employee.lastName || ""}`.trim()
    : "الموظف";

  const departmentName = data.employee?.department?.name || "الإدارة العامة";
  const jobTitle = data.employee?.position?.title || "موظف";

  const totalActive = data.summary?.totalActiveSeconds || 0;
  const totalIdle = data.summary?.totalIdleSeconds || 0;
  const prodScore = Math.round(data.summary?.productivityScore || 0);

  const clockInStr = formatMonitorTimeAr(data.summary?.clockInTime);
  const firstActivityStr = formatMonitorTimeAr(data.summary?.firstActivityTime);
  const activityLagMinutes = calculateActivityLagMinutes(
    data.summary?.clockInTime,
    data.summary?.firstActivityTime,
  );

  return {
    activeTab,
    setActiveTab,
    selectedDate,
    setSelectedDate,
    loading,
    data,
    fetchDetails,
    handleDateStep,
    todayStr,
    isToday,
    yesterdayStr,
    teamMembersProp,
    currentMemberIndex,
    hasPrevMember,
    hasNextMember,
    handleSwitchEmployee,
    handleBack,
    employeeName,
    departmentName,
    jobTitle,
    totalActive,
    totalIdle,
    prodScore,
    clockInStr,
    firstActivityStr,
    activityLagMinutes,
  };
};
