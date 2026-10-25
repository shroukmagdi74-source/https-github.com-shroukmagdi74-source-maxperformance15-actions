import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import i18n from "../../../i18n";
import { tToast } from "../../../utils/i18n-toast";
import { apiClient } from "../../../services/apiClient";
import { useAuth } from "../../../hooks/useAuthSimple";
import {
  createStorageKey,
  getWithExpiry,
  setWithExpiry,
} from "../../../utils/storage";
import { DashboardResponse, DashboardTab } from "./types";
import { CACHE_TTL_MS } from "./helpers";

export const useMyCompaniesDashboardController = () => {
  const navigate = useNavigate();
  const { switchCompany, user } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [dashboardData, setDashboardData] = useState<
    DashboardResponse["data"] | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const cacheKey = useMemo(() => {
    try {
      const rawUser = localStorage.getItem("user");
      const parsedUser = rawUser ? JSON.parse(rawUser) : null;
      const userId = parsedUser?.id || parsedUser?.userId || "unknown";
      return createStorageKey("owner-dashboard", userId);
    } catch {
      return createStorageKey("owner-dashboard", "unknown");
    }
  }, []);

  const [currentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1,
  );
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const userRole = user?.role;

  const fetchDashboard = useCallback(
    async ({
      signal,
      background = false,
    }: { signal?: AbortSignal; background?: boolean } = {}) => {
      try {
        if (!background) {
          setIsLoading(true);
          setError(null);
        }

        if (userRole !== "OWNER" && userRole !== "SUPER_ADMIN") {
          if (!background) {
            setError("هذه الصفحة متاحة لأصحاب الشركات فقط");
          }
          return;
        }

        const response = await apiClient.get("owner/dashboard", { signal });
        if (response.data.success) {
          setDashboardData(response.data.data);
          setWithExpiry(cacheKey, response.data.data, CACHE_TTL_MS);
        } else {
          const message =
            response.data.message ||
            i18n.t("MyCompaniesDashboard.failed_load_ff88");
          if (!background) {
            setError(message);
            toast.error(message);
          }
        }
      } catch (err) {
        console.error("Failed to fetch dashboard", err);
        if (!background) {
          setError("فشل تحميل لوحة التحكم");
          tToast.error("MyCompaniesDashboard.failed_load_5e4a");
        }
      } finally {
        if (!background) {
          setIsLoading(false);
        }
      }
    },
    [cacheKey, userRole],
  );

  useEffect(() => {
    const controller = new AbortController();
    const cached = getWithExpiry<DashboardResponse["data"]>(cacheKey);

    if (cached) {
      setDashboardData(cached);
      setIsLoading(false);
      fetchDashboard({ signal: controller.signal, background: true });
    } else {
      fetchDashboard({ signal: controller.signal });
    }

    return () => controller.abort();
  }, [cacheKey, fetchDashboard]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      tToast.success("MyCompaniesDashboard.msg_e43b");
    } catch {
      tToast.error("MyCompaniesDashboard.msg_0952");
    } finally {
      setIsExporting(false);
    }
  };

  const switchToCompany = async (companyId: string) => {
    try {
      const switched = await switchCompany(companyId);
      if (switched) {
        navigate("/company-dashboard");
        return;
      }
      tToast.error("MyCompaniesDashboard.msg_5853");
    } catch (err) {
      console.error("Error switching company:", err);
      tToast.error("MyCompaniesDashboard.msg_5853");
    }
  };

  const handleSetDefaultCompany = async (
    companyId: string,
    companyName: string,
  ) => {
    try {
      const response = await apiClient.post(
        `/auth/set-default-company/${companyId}`,
      );
      if (response.data.success) {
        toast.success(`تم تعيين ${companyName} كشركة افتراضية`);
        fetchDashboard({ background: true });
      } else {
        toast.error(
          response.data.message || i18n.t("MyCompaniesDashboard.msg_d0f3"),
        );
      }
    } catch (err) {
      console.error("Error setting default company:", err);
      tToast.error("MyCompaniesDashboard.msg_d0f3");
    }
  };

  const goToReports = () => navigate("/my-companies/reports");

  return {
    activeTab,
    setActiveTab,
    isLoading,
    isExporting,
    dashboardData,
    error,
    isCreateModalOpen,
    setIsCreateModalOpen,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    fetchDashboard,
    handleExport,
    switchToCompany,
    handleSetDefaultCompany,
    goToReports,
  };
};
