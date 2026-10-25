import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../../../../services/api";
import { tToast } from "../../../../utils/i18n-toast";
import { useAuth } from "../../../../hooks/useAuthSimple";
import {
  defaultHRSettings,
  type HRSettingsData,
  type NotificationHealth,
  type NotificationRecipientEmployeeOption,
} from "../types/hrSettingsTypes";
import {
  computeNotificationDeliverySummary,
  normalizeRecipientEmployees,
  parseLoadedHRSettings,
  validateHRSettingsData,
} from "./hrSettingsHelpers";
import { useHRGeofenceActions } from "./useHRGeofenceActions";

export function useHRSettingsData() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<HRSettingsData>(defaultHRSettings);
  const [originalSettings, setOriginalSettings] =
    useState<HRSettingsData>(defaultHRSettings);
  const [activeTab, setActiveTab] = useState("working-hours");
  const [searchQuery, setSearchQuery] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null,
  );

  const [availableRecipientEmployees, setAvailableRecipientEmployees] =
    useState<NotificationRecipientEmployeeOption[]>([]);
  const [loadingRecipientEmployees, setLoadingRecipientEmployees] =
    useState(false);
  const [notificationHealth, setNotificationHealth] =
    useState<NotificationHealth | null>(null);
  const [selectedRecipientEmployeeId, setSelectedRecipientEmployeeId] =
    useState("");

  const {
    gettingLocation,
    testingLocation,
    locationTestResult,
    getCurrentLocation,
    testCurrentLocation,
    openInGoogleMaps,
  } = useHRGeofenceActions(settings, setSettings);

  const hasUnsavedChanges = useRef(false);

  const hasUnsavedChangesValue =
    JSON.stringify(settings) !== JSON.stringify(originalSettings);

  useEffect(() => {
    hasUnsavedChanges.current = hasUnsavedChangesValue;
  }, [hasUnsavedChangesValue]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, []);

  const fetchRecipientEmployees = useCallback(async () => {
    try {
      setLoadingRecipientEmployees(true);
      const response = await api.get("/hr/employees?limit=1000&status=ACTIVE");
      const normalizedEmployees = normalizeRecipientEmployees(
        response.data?.employees,
      );
      setAvailableRecipientEmployees(normalizedEmployees);
    } catch (error) {
      console.error("Error fetching recipient employees:", error);
      tToast.error("hrSettings.unable_load_6108");
    } finally {
      setLoadingRecipientEmployees(false);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setErrors({});
      const response = await api.get("/v1/hr/settings");

      if (response.data.settings) {
        const loadedSettings = parseLoadedHRSettings(response.data.settings);
        setSettings(loadedSettings);
        setOriginalSettings(loadedSettings);
        setNotificationHealth(response.data.notificationHealth || null);
        hasUnsavedChanges.current = false;
      }
    } catch (error: any) {
      console.error("Error fetching settings:", error);
      const errorMessage =
        error.response?.data?.error || "حدث خطأ أثناء تحميل الإعدادات";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const userRole = user?.role;
  const userId = user?.id;

  useEffect(() => {
    if (
      userRole &&
      !["SUPER_ADMIN", "COMPANY_ADMIN", "MANAGER", "OWNER"].includes(userRole)
    ) {
      tToast.error("hrSettings.msg_9d30");
      navigate("/");
      return;
    }
    void fetchSettings();
    void fetchRecipientEmployees();
  }, [userId, userRole, navigate, fetchSettings, fetchRecipientEmployees]);

  const addSelectedRecipientEmployee = useCallback(() => {
    if (!selectedRecipientEmployeeId) {
      tToast.error("hrSettings.msg_ea7d");
      return;
    }

    const selectedEmployee = availableRecipientEmployees.find(
      (employee) => employee.id === selectedRecipientEmployeeId,
    );

    if (!selectedEmployee) {
      tToast.error("hrSettings.msg_0101");
      return;
    }

    if (!selectedEmployee.phone) {
      tToast.error("hrSettings.msg_fca0");
      return;
    }

    const isAlreadyAdded = settings.notificationRecipients.some(
      (recipient) =>
        recipient.employeeId === selectedEmployee.id ||
        recipient.phone === selectedEmployee.phone,
    );

    if (isAlreadyAdded) {
      tToast.error("hrSettings.msg_092a");
      return;
    }

    setSettings((previous) => ({
      ...previous,
      notificationRecipients: [
        ...previous.notificationRecipients,
        {
          employeeId: selectedEmployee.id,
          name: selectedEmployee.name,
          phone: selectedEmployee.phone,
          types: ["ALL"],
        },
      ],
    }));
    setSelectedRecipientEmployeeId("");
  }, [
    availableRecipientEmployees,
    selectedRecipientEmployeeId,
    settings.notificationRecipients,
  ]);

  const removeNotificationRecipient = useCallback((index: number) => {
    setSettings((previous) => ({
      ...previous,
      notificationRecipients: previous.notificationRecipients.filter(
        (_, i) => i !== index,
      ),
    }));
  }, []);

  const validateSettings = useCallback((): boolean => {
    const newErrors = validateHRSettingsData(settings);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [settings]);

  const handleSave = useCallback(async () => {
    if (!validateSettings()) {
      tToast.error("hrSettings.msg_ff3c");
      return;
    }

    try {
      setSaving(true);
      const response = await api.put("/v1/hr/settings", settings);

      if (response.data && response.data.settings) {
        const updatedSettings = parseLoadedHRSettings(response.data.settings);
        setSettings(updatedSettings);
        setOriginalSettings(updatedSettings);
        setNotificationHealth(response.data.notificationHealth || null);
      } else {
        setOriginalSettings(settings);
      }

      hasUnsavedChanges.current = false;
      toast.success("تم حفظ الإعدادات بنجاح");
    } catch (error: any) {
      console.error("Save failed:", error);
      const errorMessage =
        error.response?.data?.error || "حدث خطأ أثناء حفظ الإعدادات";
      toast.error(errorMessage, {
        description: error.response?.data?.details || "يرجى المحاولة مرة أخرى",
      });
    } finally {
      setSaving(false);
    }
  }, [settings, validateSettings]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (!saving && hasUnsavedChangesValue) {
          void handleSave();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saving, hasUnsavedChangesValue, handleSave]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleTabChange = useCallback(
    (tabId: string) => {
      if (hasUnsavedChangesValue) {
        setPendingNavigation(tabId);
        setShowUnsavedDialog(true);
      } else {
        setActiveTab(tabId);
      }
    },
    [hasUnsavedChangesValue],
  );

  const confirmNavigation = useCallback(() => {
    if (pendingNavigation) {
      setActiveTab(pendingNavigation);
      setPendingNavigation(null);
    }
    setShowUnsavedDialog(false);
  }, [pendingNavigation]);

  const cancelNavigation = useCallback(() => {
    setPendingNavigation(null);
    setShowUnsavedDialog(false);
  }, []);

  const toggleWorkingDay = useCallback((day: string) => {
    setSettings((previous) => {
      const newWorkingDays = previous.workingDays.includes(day)
        ? previous.workingDays.filter((d) => d !== day)
        : [...previous.workingDays, day];
      return {
        ...previous,
        workingDays: newWorkingDays,
      };
    });

    setErrors((previous) => {
      if (previous.workingDays) {
        const next = { ...previous };
        delete next.workingDays;
        return next;
      }
      return previous;
    });
  }, []);

  const deliverySummary = computeNotificationDeliverySummary(
    settings,
    notificationHealth,
  );

  return {
    loading,
    saving,
    settings,
    setSettings,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    errors,
    setErrors,
    showUnsavedDialog,
    hasUnsavedChangesValue,
    notificationHealth,
    availableRecipientEmployees,
    loadingRecipientEmployees,
    selectedRecipientEmployeeId,
    setSelectedRecipientEmployeeId,
    gettingLocation,
    testingLocation,
    locationTestResult,
    ...deliverySummary,
    fetchSettings,
    handleSave,
    handleTabChange,
    confirmNavigation,
    cancelNavigation,
    toggleWorkingDay,
    addSelectedRecipientEmployee,
    removeNotificationRecipient,
    getCurrentLocation,
    testCurrentLocation,
    openInGoogleMaps,
  };
}

export type UseHRSettingsDataReturn = ReturnType<typeof useHRSettingsData>;
