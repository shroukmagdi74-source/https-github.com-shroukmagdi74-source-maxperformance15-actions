import { useState, useCallback, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import { tToast } from "../../../../utils/i18n-toast";
import type { HRSettingsData } from "../types/hrSettingsTypes";
import { calculateDistance } from "./hrSettingsHelpers";

export function useHRGeofenceActions(
  settings: HRSettingsData,
  setSettings: Dispatch<SetStateAction<HRSettingsData>>,
) {
  const [gettingLocation, setGettingLocation] = useState(false);
  const [testingLocation, setTestingLocation] = useState(false);
  const [locationTestResult, setLocationTestResult] = useState<{
    distance: number;
    isWithinRange: boolean;
  } | null>(null);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      tToast.error("hrSettings.msg_0d63");
      return;
    }

    setGettingLocation(true);
    setLocationTestResult(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setSettings((previous) => ({
          ...previous,
          officeLatitude: latitude.toFixed(6),
          officeLongitude: longitude.toFixed(6),
        }));
        setGettingLocation(false);
        toast.success("تم الحصول على الموقع الحالي بنجاح");
      },
      (error) => {
        setGettingLocation(false);
        let errorMessage = "فشل الحصول على الموقع";
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = "تم رفض الإذن للوصول إلى الموقع";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = "الموقع غير متاح";
        } else if (error.code === error.TIMEOUT) {
          errorMessage = "انتهت مهلة الحصول على الموقع";
        }
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }, [setSettings]);

  const testCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      tToast.error("hrSettings.msg_0d63");
      return;
    }

    const officeLat = parseFloat(settings.officeLatitude);
    const officeLng = parseFloat(settings.officeLongitude);

    if (isNaN(officeLat) || isNaN(officeLng)) {
      tToast.error("hrSettings.msg_7cfc");
      return;
    }

    setTestingLocation(true);
    setLocationTestResult(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const distance = calculateDistance(
          officeLat,
          officeLng,
          latitude,
          longitude,
        );
        const isWithinRange = distance <= settings.geofenceRadius;

        setLocationTestResult({
          distance: Math.round(distance),
          isWithinRange,
        });
        setTestingLocation(false);

        if (isWithinRange) {
          toast.success(`أنت داخل النطاق! المسافة: ${Math.round(distance)} متر`);
        } else {
          toast.warning(`أنت خارج النطاق! المسافة: ${Math.round(distance)} متر`);
        }
      },
      (error) => {
        setTestingLocation(false);
        let errorMessage = "فشل الحصول على الموقع";
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = "تم رفض الإذن للوصول إلى الموقع";
        }
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }, [
    settings.geofenceRadius,
    settings.officeLatitude,
    settings.officeLongitude,
  ]);

  const openInGoogleMaps = useCallback(() => {
    const lat = parseFloat(settings.officeLatitude);
    const lng = parseFloat(settings.officeLongitude);

    if (isNaN(lat) || isNaN(lng)) {
      tToast.error("hrSettings.msg_4dae");
      return;
    }

    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  }, [settings.officeLatitude, settings.officeLongitude]);

  return {
    gettingLocation,
    testingLocation,
    locationTestResult,
    getCurrentLocation,
    testCurrentLocation,
    openInGoogleMaps,
  };
}
