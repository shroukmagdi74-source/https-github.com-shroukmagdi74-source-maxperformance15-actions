import React from "react";
import { AlertCircle, Calendar, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import type { TFunction } from "i18next";

export const statusConfig: Record<
  string,
  {
    labelKey: string;
    color: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  PRESENT: {
    labelKey: "employee.attendance.statusPresent",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  ABSENT: {
    labelKey: "employee.attendance.statusAbsent",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
  LATE: {
    labelKey: "employee.attendance.statusLate",
    color: "bg-yellow-100 text-yellow-800",
    icon: AlertCircle,
  },
  ON_LEAVE: {
    labelKey: "employee.attendance.statusOnLeave",
    color: "bg-purple-100 text-purple-800",
    icon: Calendar,
  },
};

export const getApiError = (error: unknown) =>
  error as {
    response?: {
      status?: number;
      data?: {
        error?: string;
        geofenceData?: {
          distance: number;
          allowedRadius: number;
          requiresLocation?: boolean;
        };
      };
    };
  };

export const getLocationPayload = async () => {
  if (!navigator.geolocation) {
    return null;
  }

  const getPosition = (
    enableHighAccuracy: boolean,
    timeout: number,
  ): Promise<GeolocationPosition> =>
    new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy,
        timeout,
        maximumAge: 60000,
      });
    });

  try {
    let position: GeolocationPosition;
    try {
      position = await getPosition(true, 12000);
    } catch {
      position = await getPosition(false, 10000);
    }

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
    };
  } catch {
    return null;
  }
};

export const handleAttendanceActionError = (
  error: unknown,
  t: TFunction,
  mode: "checkin" | "checkout",
) => {
  const apiError = getApiError(error);

  if (
    apiError.response?.status === 403 &&
    apiError.response?.data?.geofenceData
  ) {
    if (apiError.response.data.geofenceData.requiresLocation) {
      toast.error(t("employee.attendance.locationRequired"), {
        description: t("employee.attendance.locationRequiredDesc"),
        duration: 8000,
      });
      return;
    }
    const { distance, allowedRadius } = apiError.response.data.geofenceData;
    const distanceToMove = Math.round(distance - allowedRadius);
    toast.error(t("employee.attendance.geofenceError"), {
      description: t("employee.attendance.geofenceDetail", {
        distance: Math.round(distance),
        allowed: allowedRadius,
        toMove: distanceToMove,
      }),
      duration: 8000,
    });
    return;
  }

  if (apiError.response?.status === 400) {
    toast.error(t("employee.attendance.dataError"), {
      description:
        apiError.response?.data?.error ||
        (mode === "checkout"
          ? t("employee.attendance.notCheckedInYet")
          : t("employee.attendance.dataErrorDesc")),
    });
    return;
  }

  if (apiError.response?.status === 401) {
    toast.error(t("employee.attendance.sessionExpired"), {
      description: t("employee.attendance.sessionExpiredDesc"),
    });
    return;
  }

  if (!navigator.onLine) {
    toast.error(t("employee.attendance.noInternet"), {
      description: t("employee.attendance.noInternetDesc"),
    });
    return;
  }

  toast.error(
    mode === "checkout"
      ? t("employee.attendance.checkoutFailed")
      : t("employee.attendance.checkinFailed"),
    {
      description:
        apiError.response?.data?.error ||
        t("employee.attendance.unexpectedError"),
    },
  );
};

export const formatTime = (date: Date) =>
  date.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

export const formatDate = (date: Date) =>
  date.toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const isSameDayTZ = (a: Date, b: Date, timezone: string) =>
  a.toLocaleDateString("en-CA", { timeZone: timezone }) ===
  b.toLocaleDateString("en-CA", { timeZone: timezone });

export const formatDateWithTZ = (date: string | Date, timezone: string) =>
  new Date(date).toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: timezone,
  });

export const formatTimeWithTZ = (date: string | Date, timezone: string) =>
  new Date(date).toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
  });

export const parseLocationJson = (
  locationStr: string | null,
): { latitude: number; longitude: number } | null => {
  if (!locationStr) return null;
  try {
    return JSON.parse(locationStr);
  } catch {
    return null;
  }
};
