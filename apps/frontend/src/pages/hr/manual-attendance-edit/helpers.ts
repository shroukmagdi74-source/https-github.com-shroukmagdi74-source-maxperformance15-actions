import { tToast } from "../../../utils/i18n-toast";
import { statusOptions } from "./types";

export const calculateWorkHours = (checkIn: string, checkOut: string): number => {
  if (!checkIn || !checkOut) return 0;
  try {
    const checkInTime = new Date(`2000-01-01T${checkIn}:00`);
    const checkOutTime = new Date(`2000-01-01T${checkOut}:00`);
    if (isNaN(checkInTime.getTime()) || isNaN(checkOutTime.getTime())) {
      return 0;
    }
    const diffMs = checkOutTime.getTime() - checkInTime.getTime();
    return Math.max(0, diffMs / (1000 * 60 * 60));
  } catch (error) {
    console.error("Error calculating work hours:", error);
    return 0;
  }
};

export const validateTimes = (checkIn: string, checkOut: string): boolean => {
  if (!checkIn) {
    tToast.error("manualAttendance.msg_eb5f");
    return false;
  }

  try {
    const checkInTime = new Date(`2000-01-01T${checkIn}:00`);
    if (isNaN(checkInTime.getTime())) {
      tToast.error("manualAttendance.msg_a1db");
      return false;
    }

    if (checkOut) {
      const checkOutTime = new Date(`2000-01-01T${checkOut}:00`);

      if (isNaN(checkOutTime.getTime())) {
        tToast.error("manualAttendance.msg_c4bf");
        return false;
      }

      if (checkOutTime <= checkInTime) {
        tToast.error("manualAttendance.msg_95b8");
        return false;
      }

      const workHours = calculateWorkHours(checkIn, checkOut);
      if (workHours > 24) {
        tToast.error("manualAttendance.msg_8aad");
        return false;
      }
    }

    return true;
  } catch (error) {
    tToast.error("manualAttendance.msg_dafe");
    return false;
  }
};

export const getStatusColor = (status: string): string => {
  return (
    statusOptions.find((s) => s.value === status)?.color ||
    "bg-gray-100 text-gray-800"
  );
};

export const getStatusLabel = (status: string): string => {
  return statusOptions.find((s) => s.value === status)?.label || status;
};
