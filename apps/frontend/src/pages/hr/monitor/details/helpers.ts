export const formatMonitorSeconds = (sec: number = 0): string => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${h} س ${m} د`;
};

export const getCheckInMethodLabel = (method?: string | null): string => {
  switch (method) {
    case "FINGERPRINT":
      return "بصمة جهاز";
    case "MANUAL":
      return "تسجيل يدوي";
    case "GPS":
      return "موقع جغرافي";
    case "MOBILE_APP":
      return "تطبيق هاتف";
    case "SYSTEM":
      return "نظامي";
    default:
      return "حضور رسمي";
  }
};

export const getOperationalSignalClassName = (signalType?: string): string => {
  switch (signalType) {
    case "TASK_OVERLOAD":
      return "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 ring-1 ring-inset ring-indigo-500/30";
    case "DISTRACTION":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-1 ring-inset ring-amber-500/30";
    case "NEGLECT":
      return "bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-1 ring-inset ring-rose-500/30";
    case "STEADY_PERFORMANCE":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-500/30";
    default:
      return "bg-sky-500/15 text-sky-700 dark:text-sky-300 ring-1 ring-inset ring-sky-500/30";
  }
};

export const formatMonitorTimeAr = (isoTime?: string | null): string | null => {
  if (!isoTime) return null;
  return new Date(isoTime).toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const calculateActivityLagMinutes = (
  clockInTime?: string | null,
  firstActivityTime?: string | null,
): number | null => {
  if (!clockInTime || !firstActivityTime) return null;
  const diffMs =
    new Date(firstActivityTime).getTime() - new Date(clockInTime).getTime();
  return Math.round(diffMs / 60000);
};
