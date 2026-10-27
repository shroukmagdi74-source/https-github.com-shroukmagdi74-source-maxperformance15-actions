import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import api from "../../../services/api";
import { apiClient } from "../../../services/apiClient";
import { useAuth } from "../../../hooks/useAuthSimple";
import { saveDefaultPagePreference } from "../../../utils/postAuthRouting";
import {
  Employee,
  CustodyAsset,
  WarningRecord,
  ProfileFormData,
  MerchantUserExtras,
} from "./types";
import { getApiErrorMessage } from "./helpers";

const initialFormData: ProfileFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "",
  maritalStatus: "",
  gender: "",
  dateOfBirth: "",
  nationalId: "",
  emergencyContactName: "",
  emergencyContactRelation: "",
  emergencyContactPhone: "",
};

export const useProfileData = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");
  const [myCustody, setMyCustody] = useState<CustodyAsset[]>([]);
  const [warnings, setWarnings] = useState<WarningRecord[]>([]);
  const [defaultPage, setDefaultPage] = useState("/apps");
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>(initialFormData);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isMerchantUser = user?.role === "MERCHANT";
  const isAffiliateUser = user?.role === "AFFILIATE";
  const activeApps: string[] = (user as any)?.company?.activeApps ?? [];
  const hasAffiliatePro = activeApps.some((a) => a.toLowerCase() === "affiliate-pro");
  const hasHrBasic = activeApps.some((a) => a.toLowerCase() === "hr-basic");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const fetchMyCustody = useCallback(async (employeeId: string) => {
    try {
      const response = await api.get(`/hr/assets?assignedTo=${employeeId}`);
      setMyCustody((response.data as any)?.assets || []);
    } catch {
      // Optional HR widgets should not block the profile shell.
    }
  }, []);

  const fetchMyWarnings = useCallback(async () => {
    try {
      const response = await api.get("/hr/warnings/my-history");
      setWarnings((response.data as any)?.warnings || []);
    } catch {
      // Optional HR widgets should not block the profile shell.
    }
  }, []);

  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      if (user?.role === "MERCHANT" || user?.role === "AFFILIATE") {
        const merchantUser = user as typeof user & MerchantUserExtras;
        setEmployee(null);
        setFormData((prev) => ({
          ...prev,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          phone: merchantUser?.phone || "",
        }));
        return;
      }
      try {
        const response = await api.get("/hr/employees/me");
        const empData = (response.data as any)?.employee;
        if (!empData) return;
        setEmployee(empData);
        setFormData({
          firstName: empData.firstName || user?.firstName || "",
          lastName: empData.lastName || user?.lastName || "",
          email: empData.email || user?.email || "",
          phone: empData.phone || "",
          address: empData.address || "",
          city: empData.city || "",
          country: empData.country || "",
          maritalStatus: empData.maritalStatus || "",
          gender: empData.gender || "",
          dateOfBirth: empData.dateOfBirth ? empData.dateOfBirth.split("T")[0] : "",
          nationalId: empData.nationalId || "",
          emergencyContactName: empData.emergencyContactName || "",
          emergencyContactRelation: empData.emergencyContactRelation || "",
          emergencyContactPhone: empData.emergencyContactPhone || "",
        });
        if (empData.id) {
          fetchMyCustody(empData.id);
          fetchMyWarnings();
        }
      } catch {
        setFormData((prev) => ({
          ...prev,
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          email: user?.email || "",
        }));
      }
    } finally {
      setLoading(false);
    }
  }, [fetchMyCustody, fetchMyWarnings, user]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    fetchProfileData();
    return () => clearTimeout(timer);
  }, [fetchProfileData]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setSettingsLoading(true);
        const res = await apiClient.get<any>("/user/settings", { _skipErrorToast: true } as Record<string, unknown>);
        const data = res.data;
        if (data?.success && data?.data?.defaultPage) {
          setDefaultPage(data.data.defaultPage);
        }
      } catch {
        // silent
      } finally {
        setSettingsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleDefaultPageChange = async (page: string) => {
    setDefaultPage(page);
    saveDefaultPagePreference(user, page);
    try {
      await apiClient.put("/user/settings", { settings: { defaultPage: page } });
    } catch {
      // silent
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await api.put("/hr/employees/me", formData);
      if ((response.data as any)?.success) {
        toast.success(t("employee.profile.saveSuccess"));
        setIsEditing(false);
        fetchProfileData();
      }
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, t("employee.profile.saveError")));
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(t("employee.profile.invalidImage"));
      return;
    }
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("image", file);
      const res = await api.post("/user/image-gallery/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = res.data as any;
      if (data?.success) {
        if (employee?.id) {
          await api.put(`/hr/employees/${employee.id}`, { avatar: data.image?.url });
        }
        toast.success(t("employee.profile.avatarUpdated"));
        fetchProfileData();
      }
    } catch {
      toast.error(t("employee.profile.avatarFailed"));
    } finally {
      setUploading(false);
    }
  };

  const field = (key: keyof ProfileFormData) => ({
    value: formData[key],
    onChange: (v: string) => setFormData((p) => ({ ...p, [key]: v })),
  });

  return {
    t,
    user,
    employee,
    formData,
    setFormData,
    loading,
    saving,
    uploading,
    isEditing,
    setIsEditing,
    activeTab,
    setActiveTab,
    myCustody,
    warnings,
    defaultPage,
    settingsLoading,
    fileInputRef,
    isMerchantUser,
    isAffiliateUser,
    hasAffiliatePro,
    hasHrBasic,
    handleSave,
    handleAvatarClick,
    handleFileChange,
    handleDefaultPageChange,
    fetchMyWarnings,
    fetchProfileData,
    field,
  };
};
