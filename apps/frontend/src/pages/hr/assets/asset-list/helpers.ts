export const ASSET_STATUS_STYLES: Record<string, string> = {
  AVAILABLE:
    "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-200 dark:border-green-800/50",
  IN_USE:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50",
  MAINTENANCE:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800/50",
  RETIRED:
    "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600",
  LOST: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800/50",
  RESERVED:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50",
};

export const ASSET_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "متاح",
  IN_USE: "في الاستخدام",
  MAINTENANCE: "في الصيانة",
  RETIRED: "تالف/مكهن",
  LOST: "مفقود",
  RESERVED: "محجوز",
};

export const BULK_STATUS_OPTIONS = [
  { key: "AVAILABLE", label: "متاح", dot: "bg-green-400" },
  { key: "MAINTENANCE", label: "صيانة", dot: "bg-yellow-400" },
  { key: "RETIRED", label: "تكهين", dot: "bg-gray-400" },
  { key: "LOST", label: "مفقود", dot: "bg-red-400" },
] as const;

export const getAssetStatusClassName = (status: string): string =>
  ASSET_STATUS_STYLES[status] || "bg-gray-100";

export const getAssetStatusLabel = (status: string): string =>
  ASSET_STATUS_LABELS[status] || status;
