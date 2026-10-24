import { LeaveFormData, EditLeaveFormData } from "./types";

export const DEFAULT_WORKING_DAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
];

export const initialLeaveFormData: LeaveFormData = {
  employeeId: "",
  type: "ANNUAL",
  startDate: "",
  endDate: "",
  reason: "",
  isHalfDay: false,
  halfDayPeriod: "",
  isPaid: true,
};

export const initialEditLeaveFormData: EditLeaveFormData = {
  type: "",
  startDate: "",
  endDate: "",
  reason: "",
  isHalfDay: false,
  halfDayPeriod: "",
  isPaid: true,
};

export const buildLeaveQueryParams = (
  pagination: { page: number; limit: number },
  activeTab: string,
  statusFilter: string,
  typeFilter: string,
): URLSearchParams => {
  const params = new URLSearchParams({
    page: pagination.page.toString(),
    limit: pagination.limit.toString(),
  });

  if (activeTab === "pending") {
    params.append("status", "PENDING");
  } else if (statusFilter && statusFilter !== "all") {
    params.append("status", statusFilter);
  }

  if (typeFilter && typeFilter !== "all") {
    params.append("type", typeFilter);
  }

  return params;
};

export const calculateTotalDays = (
  start: string,
  end: string,
  workingDays: string[],
): number => {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (endDate < startDate) return -1;

  const dayNameToNumber: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  const workingDaysNumbers = workingDays.map((d) => dayNameToNumber[d]);

  let days = 0;
  const current = new Date(startDate);
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (workingDaysNumbers.includes(dayOfWeek)) {
      days++;
    }
    current.setDate(current.getDate() + 1);
  }
  return days;
};
