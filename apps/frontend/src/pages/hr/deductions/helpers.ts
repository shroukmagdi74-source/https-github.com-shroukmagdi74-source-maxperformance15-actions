import { CreateDeductionForm } from "./types";

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
  }).format(amount);
};

export const formatDateWithDay = (dateString?: string) => {
  if (!dateString) return "-";

  const parsedDate = new Date(dateString);
  if (Number.isNaN(parsedDate.getTime())) return dateString;

  const datePart = parsedDate.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const dayPart = parsedDate.toLocaleDateString("ar-EG", {
    weekday: "long",
  });

  return `${datePart} - ${dayPart}`;
};

export const createDefaultDeductionForm = (): CreateDeductionForm => ({
  employeeId: "",
  type: "OTHER",
  category: "",
  amount: "",
  reason: "",
  description: "",
  date: new Date().toISOString().split("T")[0],
  effectiveMonth: new Date().getMonth() + 1,
  effectiveYear: new Date().getFullYear(),
  notes: "",
});
