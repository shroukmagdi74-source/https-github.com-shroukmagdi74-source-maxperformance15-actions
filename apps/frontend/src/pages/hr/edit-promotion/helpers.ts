import { SalaryIncreaseStats } from "./types";

export const calculateSalaryIncrease = (
  fromSalary?: number,
  toSalary?: number,
): SalaryIncreaseStats | null => {
  if (!fromSalary || !toSalary) return null;
  const diff = Number(toSalary) - Number(fromSalary);
  const percent = (diff / Number(fromSalary)) * 100;
  return { diff, percent };
};

export const getPromotionStatusVariant = (
  status?: string,
): "default" | "destructive" | "secondary" => {
  if (status === "APPROVED") return "default";
  if (status === "REJECTED") return "destructive";
  return "secondary";
};

export const getPromotionStatusLabel = (status?: string): string => {
  if (status === "APPROVED") return "تمت الموافقة";
  if (status === "REJECTED") return "مرفوضة";
  return "قيد المراجعة";
};
