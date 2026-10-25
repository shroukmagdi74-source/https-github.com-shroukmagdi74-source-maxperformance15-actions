import { AttendanceCellStyle, AttendanceSheetData } from "./types";

export const ATTENDANCE_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

export const FALLBACK_ATTENDANCE_CELL: AttendanceCellStyle = {
  label: "حاضر",
  cell: "bg-emerald-50 border-emerald-200",
  dot: "bg-emerald-500",
  timeColor: "text-emerald-700",
};

export const ATTENDANCE_STATUS_CONFIG: Record<string, AttendanceCellStyle> = {
  PRESENT: {
    label: "حاضر",
    cell: "bg-emerald-50 border-emerald-200",
    dot: "bg-emerald-500",
    timeColor: "text-emerald-700",
  },
  LATE: {
    label: "متأخر",
    cell: "bg-amber-50 border-amber-300",
    dot: "bg-amber-500",
    timeColor: "text-amber-700",
  },
  REMOTE: {
    label: "عن بعد",
    cell: "bg-sky-50 border-sky-200",
    dot: "bg-sky-500",
    timeColor: "text-sky-700",
  },
  ABSENT: {
    label: "غائب",
    cell: "bg-rose-50 border-rose-200",
    dot: "bg-rose-500",
    timeColor: "text-rose-700",
  },
  LEAVE: {
    label: "إجازة",
    cell: "bg-blue-50 border-blue-200",
    dot: "bg-blue-500",
    timeColor: "text-blue-700",
  },
  WEEKEND: {
    label: "عطلة",
    cell: "bg-gray-100/70 border-gray-200",
    dot: "bg-gray-300",
    timeColor: "text-gray-400",
  },
  HOLIDAY: {
    label: "عطلة رسمية",
    cell: "bg-purple-50 border-purple-200",
    dot: "bg-purple-500",
    timeColor: "text-purple-700",
  },
  BEFORE_HIRE: {
    label: "—",
    cell: "bg-gray-50 border-gray-100",
    dot: "bg-gray-200",
    timeColor: "text-gray-300",
  },
};

export const calculateAttendanceRate = (totals: {
  present: number;
  late: number;
  absent: number;
  leave: number;
}): string => {
  const attended = totals.present + totals.late;
  const working = attended + totals.absent;
  return working > 0 ? ((attended / working) * 100).toFixed(1) : "0";
};

export const buildAttendanceSheetCsv = (report: AttendanceSheetData): string => {
  const headers = [
    "الموظف",
    "رقم الموظف",
    "القسم",
    "حاضر",
    "متأخر",
    "غائب",
    "إجازة",
    ...report.days.map((d) => `${d.day}/${report.month}`),
  ];

  const rows = report.employees.map((emp) => [
    emp.name,
    emp.employeeNumber,
    emp.department,
    emp.totals.present,
    emp.totals.late,
    emp.totals.absent,
    emp.totals.leave,
    ...emp.cells.map((c) => {
      const cfg = ATTENDANCE_STATUS_CONFIG[c.status] ?? FALLBACK_ATTENDANCE_CELL;
      if (c.checkIn) {
        return `${cfg.label} ${c.checkIn}${c.checkOut ? `-${c.checkOut}` : ""}`;
      }
      return cfg.label;
    }),
  ]);

  return [
    headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(","),
    ...rows.map((r) =>
      r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
    ),
  ].join("\n");
};
