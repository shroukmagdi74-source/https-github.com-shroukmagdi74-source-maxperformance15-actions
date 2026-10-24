import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { apiClient } from "../../../services/apiClient";
import type { UserDevice, DeviceFilterType } from "./types";

export function useAuthorizedDevicesController() {
  const [devices, setDevices] = useState<UserDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<DeviceFilterType>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (search.trim()) params.search = search.trim();
      if (filterType !== "ALL") params.deviceType = filterType;

      const res = await apiClient.get<UserDevice[]>("/v1/devices", { params });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setDevices(res.data.data);
      } else {
        setDevices([]);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "تعذر تحميل قائمة الأجهزة");
    } finally {
      setLoading(false);
    }
  }, [search, filterType]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const handleToggleDeviceType = async (device: UserDevice) => {
    const nextType = device.deviceType === "OFFICE" ? "PERSONAL" : "OFFICE";
    setUpdatingId(device.id);

    try {
      const res = await apiClient.patch(`/v1/devices/${device.id}/type`, {
        deviceType: nextType,
      });

      if (res.data?.success) {
        setDevices((prev) =>
          prev.map((d) => (d.id === device.id ? { ...d, deviceType: nextType } : d))
        );
        toast.success(
          nextType === "OFFICE"
            ? `تم تحويل الجهاز (${device.deviceName}) إلى جهاز مكتب معتمد`
            : `تم تحويل الجهاز (${device.deviceName}) إلى جهاز شخصي مقيّد`
        );
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "فشل تغيير نوع الجهاز");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleApproval = async (device: UserDevice) => {
    const nextApproved = !device.isApproved;
    setUpdatingId(device.id);

    try {
      const res = await apiClient.patch(`/v1/devices/${device.id}/type`, {
        isApproved: nextApproved,
      });

      if (res.data?.success) {
        setDevices((prev) =>
          prev.map((d) => (d.id === device.id ? { ...d, isApproved: nextApproved } : d))
        );
        toast.success(nextApproved ? "تم تفعيل الجهاز بنجاح" : "تم حظر الجهاز فورياً");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "فشل تحديث حالة الجهاز");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteDevice = async (device: UserDevice) => {
    if (!window.confirm(`هل أنت متأكد من حذف الجهاز "${device.deviceName}"؟`)) {
      return;
    }

    try {
      await apiClient.delete(`/v1/devices/${device.id}`);
      setDevices((prev) => prev.filter((d) => d.id !== device.id));
      toast.success("تم حذف الجهاز من السجل بنجاح");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "فشل حذف الجهاز");
    }
  };

  const handleCopyFingerprint = (fp: string, id: string) => {
    navigator.clipboard.writeText(fp);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("تم نسخ بصمة الجهاز");
  };

  return {
    devices,
    loading,
    search,
    setSearch,
    filterType,
    setFilterType,
    updatingId,
    copiedId,
    fetchDevices,
    handleToggleDeviceType,
    handleToggleApproval,
    handleDeleteDevice,
    handleCopyFingerprint,
  };
}
