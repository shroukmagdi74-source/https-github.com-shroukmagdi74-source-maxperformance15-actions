import { SalaryIncreaseStats } from "./types";

export const calculateSalaryIncrease = (
  fromSalary?: number,
  toSalary?: number
): SalaryIncreaseStats | null => {
  if (!fromSalary || !toSalary) return null;
  const diff = Number(toSalary) - Number(fromSalary);
  const percent = (diff / Number(fromSalary)) * 100;
  return { diff, percent };
};
