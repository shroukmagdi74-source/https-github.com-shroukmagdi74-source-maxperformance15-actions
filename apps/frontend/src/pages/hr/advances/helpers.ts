import type { AdvanceRequest, AdvanceInstallment } from "./types";

export const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: {
    label: "بانتظار الموافقة",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  APPROVED: {
    label: "معتمد",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  REJECTED: {
    label: "مرفوض",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
  COMPLETED: {
    label: "مكتمل",
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const calculatePaidAmount = (
  installments?: AdvanceInstallment[] | null,
): number => {
  if (!installments || !Array.isArray(installments)) return 0;
  return installments
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + parseFloat(i.amount.toString()), 0);
};

export const calculateProgress = (request: AdvanceRequest): number => {
  if (!request.installments || !Array.isArray(request.installments)) return 0;
  const paid = calculatePaidAmount(request.installments);
  const total = parseFloat(request.amount.toString());
  if (total <= 0) return 0;
  return (paid / total) * 100;
};

export const calculateRemaining = (request: AdvanceRequest): number => {
  const total = parseFloat(request.amount.toString());
  const paid = calculatePaidAmount(request.installments || []);
  const remaining = request.remainingBalance ?? total - paid;
  return remaining;
};

export const isRequestPaid = (request: AdvanceRequest): boolean => {
  return Boolean(request.isPaidOff) || calculateRemaining(request) <= 0;
};
