import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../services/api";
import { tToast } from "../../../utils/i18n-toast";
import { Warning, WarningStats } from "./types";

export function useWarningsController() {
  const { employeeId } = useParams<{ employeeId?: string }>();
  const navigate = useNavigate();

  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [stats, setStats] = useState<WarningStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // all, pending, acknowledged
  const [severityFilter, setSeverityFilter] = useState("all");
  const [selectedWarning, setSelectedWarning] = useState<Warning | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const url = employeeId
        ? `/hr/warnings/employee/${employeeId}`
        : "/hr/warnings";

      const statsUrl = `/hr/warnings/stats${employeeId ? `?employeeId=${employeeId}` : ""}`;

      const warningsRes = await api.get(url);
      setWarnings(warningsRes.data?.warnings || []);

      try {
        const statsRes = await api.get(statsUrl);
        setStats(statsRes.data?.stats || null);
      } catch (statsErr: any) {
        console.error(
          "❌ [FETCH-STATS-ERROR]",
          statsErr.response?.data || statsErr.message,
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      tToast.error("Warnings.failed_fetch_a188");
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm("هل أنت متأكد من حذف هذا الإنذار؟")) return;
      try {
        await api.delete(`/hr/warnings/${id}`);
        tToast.success("Warnings.success_delete_8ccd");
        fetchData();
      } catch (error) {
        tToast.error("Warnings.failed_delete_e465");
      }
    },
    [fetchData],
  );

  const handleAdminAcknowledge = useCallback(
    async (id: string) => {
      if (
        !window.confirm(
          "هل تريد تسجيل إقرار إداري لهذا الإنذار؟ (يستخدم في حال توقيع الموظف ورقياً)",
        )
      )
        return;
      try {
        await api.post(`/hr/warnings/${id}/admin-acknowledge`);
        tToast.success("Warnings.success_login_0831");
        fetchData();
      } catch (error) {
        tToast.error("Warnings.failed_login_4439");
      }
    },
    [fetchData],
  );

  const filteredWarnings = useMemo(() => {
    return warnings.filter((item) => {
      const searchLower = searchQuery.toLowerCase();
      const searchMatch =
        item.title?.toLowerCase().includes(searchLower) ||
        item.employee?.firstName?.toLowerCase().includes(searchLower) ||
        item.employee?.lastName?.toLowerCase().includes(searchLower);

      if (!searchMatch) return false;

      if (activeTab === "pending" && item.acknowledgedAt) return false;
      if (activeTab === "acknowledged" && !item.acknowledgedAt) return false;

      if (severityFilter !== "all" && item.severity !== severityFilter)
        return false;

      return true;
    });
  }, [warnings, searchQuery, activeTab, severityFilter]);

  const handleNavigateNew = useCallback(() => {
    navigate("/hr/warnings/new");
  }, [navigate]);

  const handleNavigateDetails = useCallback(
    (id: string) => {
      navigate(`/hr/warnings/${id}`);
    },
    [navigate],
  );

  const handleNavigateEdit = useCallback(
    (id: string) => {
      navigate(`/hr/warnings/${id}/edit`);
    },
    [navigate],
  );

  return {
    warnings,
    stats,
    loading,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    severityFilter,
    setSeverityFilter,
    selectedWarning,
    setSelectedWarning,
    filteredWarnings,
    handleDelete,
    handleAdminAcknowledge,
    handleNavigateNew,
    handleNavigateDetails,
    handleNavigateEdit,
    refetchData: fetchData,
  };
}
