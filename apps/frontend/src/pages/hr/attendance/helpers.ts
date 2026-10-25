import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Timer,
  Calendar,
  Monitor,
} from "lucide-react";
import api from "../../../services/api";
import {
  AutoCloseReviewStatus,
  AttendanceRecord,
  ManualAttendanceForm,
  ManualOverrides,
} from "./types";

export const CAIRO_TIMEZONE = "Africa/Cairo";

export const statusConfig: Record<
  string,
  { label: string; color: string; icon: any }
> = {
  PRESENT: {
    label: "حاضر",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  ABSENT: { label: "غائب", color: "bg-red-100 text-red-800", icon: XCircle },
  LATE: {
    label: "متأخر",
    color: "bg-yellow-100 text-yellow-800",
    icon: AlertCircle,
  },
  HALF_DAY: {
    label: "نصف يوم",
    color: "bg-blue-100 text-blue-800",
    icon: Timer,
  },
  ON_LEAVE: {
    label: "إجازة",
    color: "bg-purple-100 text-purple-800",
    icon: Calendar,
  },
  HOLIDAY: {
    label: "عطلة",
    color: "bg-gray-100 text-gray-800",
    icon: Calendar,
  },
  WEEKEND: {
    label: "عطلة أسبوعية",
    color: "bg-gray-100 text-gray-800",
    icon: Calendar,
  },
  REMOTE: {
    label: "عن بُعد",
    color: "bg-indigo-100 text-indigo-800",
    icon: Monitor,
  },
  OVERTIME: {
    label: "إضافي (يوم راحة)",
    color: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
    icon: Timer,
  },
};

export const autoCloseReviewConfig: Record<
  AutoCloseReviewStatus,
  { label: string; color: string }
> = {
  PENDING: {
    label: "بانتظار المراجعة",
    color: "bg-amber-100 text-amber-800",
  },
  REVIEWED: {
    label: "تمت المراجعة",
    color: "bg-sky-100 text-sky-800",
  },
  ADJUSTED: {
    label: "تم التعديل",
    color: "bg-emerald-100 text-emerald-800",
  },
  DISMISSED: {
    label: "اعتماد كما هو",
    color: "bg-slate-100 text-slate-800",
  },
};

export const getLocalDateString = (
  date = new Date(),
  timezone = CAIRO_TIMEZONE,
) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
};

export const getLocalTimeString = (
  date = new Date(),
  timezone = CAIRO_TIMEZONE,
) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";

  return `${hour}:${minute}`;
};

export const parseDateAtCairoMidday = (dateValue: string) => {
  if (!dateValue) return null;

  const dateMatch = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateMatch) {
    const [, year, month, day] = dateMatch;
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 12, 0, 0));
  }

  const parsedDate = new Date(dateValue);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

export const formatAttendanceDate = (
  dateValue: string,
  options: Intl.DateTimeFormatOptions,
  fallback = "-",
  timezone = CAIRO_TIMEZONE,
) => {
  const parsedDate = parseDateAtCairoMidday(dateValue);

  if (!parsedDate) {
    return fallback;
  }

  return parsedDate.toLocaleDateString("ar-EG", {
    ...options,
    timeZone: timezone,
  });
};

export const getAutoCloseReasonLabel = (reason: string | null | undefined) => {
  switch (reason) {
    case "OVERNIGHT_SHIFT_SCHEDULED_END":
      return "نهاية شيفت ليلي";
    case "DAY_ROLLOVER_FORGOTTEN_CHECKOUT":
      return "نسيان بصمة الانصراف";
    default:
      return "إغلاق تلقائي";
  }
};

export const parseLocation = (locationStr: string | null) => {
  if (!locationStr) return null;
  try {
    return JSON.parse(locationStr);
  } catch {
    return null;
  }
};

export const createDefaultManualForm = (
  timezone = CAIRO_TIMEZONE,
): ManualAttendanceForm => ({
  employeeId: "",
  date: getLocalDateString(new Date(), timezone),
  checkIn: "09:00",
  checkOut: "",
  status: "PRESENT",
  notes: "",
  workMode: "OFFICE",
  lateHours: 0,
  lateMins: 0,
  earlyHours: 0,
  earlyMins: 0,
});

export const createDefaultOverrides = (): ManualOverrides => ({
  status: false,
  late: false,
  early: false,
});

export const recordToManualForm = (
  record: AttendanceRecord,
  timezone = CAIRO_TIMEZONE,
): ManualAttendanceForm => ({
  employeeId: record.employee.id,
  date: record.date.split("T")[0] ?? getLocalDateString(new Date(), timezone),
  checkIn: record.checkIn
    ? new Date(record.checkIn).toLocaleTimeString("en-GB", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : "09:00",
  checkOut: record.checkOut
    ? new Date(record.checkOut).toLocaleTimeString("en-GB", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : "",
  status: record.status,
  notes: record.notes || "",
  workMode: record.workMode || "OFFICE",
  lateHours: Math.floor((record.lateMinutes || 0) / 60),
  lateMins: (record.lateMinutes || 0) % 60,
  earlyHours: Math.floor((record.earlyLeaveMinutes || 0) / 60),
  earlyMins: (record.earlyLeaveMinutes || 0) % 60,
});

export const buildAttendancePayload = (
  manualForm: ManualAttendanceForm,
  manualOverrides: ManualOverrides,
  isEditMode: boolean,
  manualBaseline: ManualAttendanceForm | null,
) => {
  const metricsInputsChanged =
    isEditMode &&
    manualBaseline &&
    (
      manualForm.employeeId !== manualBaseline.employeeId ||
      manualForm.date !== manualBaseline.date ||
      manualForm.checkIn !== manualBaseline.checkIn ||
      manualForm.checkOut !== manualBaseline.checkOut
    );
  const preserveExistingMetrics = isEditMode && !metricsInputsChanged;

  const payload: Record<string, string | number> = {
    employeeId: manualForm.employeeId,
    date: manualForm.date,
    checkIn: manualForm.checkIn,
    checkOut: manualForm.checkOut,
    notes: manualForm.notes,
    workMode: manualForm.workMode,
  };

  if (manualOverrides.status || preserveExistingMetrics) {
    payload["status"] = manualForm.status;
  }

  if (manualOverrides.late || preserveExistingMetrics) {
    payload["lateMinutes"] = manualForm.lateHours * 60 + manualForm.lateMins;
  }

  if (manualOverrides.early || preserveExistingMetrics) {
    payload["earlyLeaveMinutes"] =
      manualForm.earlyHours * 60 + manualForm.earlyMins;
  }

  return payload;
};

export const exportAttendanceRecords = async (paramsObj: {
  selectedDate: string;
  endDate: string;
  useDateRange: boolean;
  statusFilter: string;
  employeeId: string;
  autoClosedOnly: boolean;
  autoCloseReviewStatus: string;
}) => {
  const actualEndDate = paramsObj.useDateRange ? paramsObj.endDate : paramsObj.selectedDate;
  const params = new URLSearchParams({
    startDate: paramsObj.selectedDate || "",
    endDate: actualEndDate || "",
  });

  if (paramsObj.statusFilter && paramsObj.statusFilter !== "ALL") {
    params.append("status", paramsObj.statusFilter);
  }
  if (paramsObj.employeeId) {
    params.append("employeeId", paramsObj.employeeId);
  }
  if (paramsObj.autoClosedOnly) {
    params.append("autoClosedOnly", "true");
  }
  if (paramsObj.autoCloseReviewStatus !== "ALL") {
    params.append("autoCloseReviewStatus", paramsObj.autoCloseReviewStatus);
  }

  const response = await api.get(`/hr/attendance/export?${params}`, { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  const fileName = paramsObj.useDateRange && actualEndDate
    ? `attendance-${paramsObj.selectedDate}-to-${actualEndDate}.xlsx`
    : `attendance-${paramsObj.selectedDate}.xlsx`;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
