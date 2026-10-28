import type { TimeEntry } from "./types";

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}س ${mins}د`;
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return "—";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatTime = (dateString: string): string => {
  if (!dateString) return "—";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const exportToCSV = (
  entries: TimeEntry[],
  startDate: string,
  endDate: string,
): void => {
  const headers = [
    "المهمة",
    "المشروع",
    "المستخدم",
    "تاريخ البدء",
    "وقت البدء",
    "المدة (دقائق)",
    "الوصف",
  ];
  const rows = entries.map((entry) => [
    entry.taskTitle,
    entry.projectName || "غير محدد",
    entry.userName,
    formatDate(entry.startTime),
    formatTime(entry.startTime),
    entry.duration?.toString() || "0",
    entry.description || "",
  ]);

  const csvContent =
    "\uFEFF" + [headers, ...rows].map((row) => row.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `time_report_${startDate}_${endDate}.csv`;
  link.click();
};
