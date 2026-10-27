export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }

  return fallback;
};

export const getDocumentStatusLabel = (status?: string | null): string => {
  switch (status) {
    case "APPROVED":
      return "المستند معتمد";
    case "REJECTED":
      return "المستند مرفوض";
    case "PENDING_REVIEW":
      return "المستند قيد المراجعة";
    case "NOT_SUBMITTED":
    default:
      return "لا يوجد مستند";
  }
};

export const getDocumentStatusStyle = (status?: string | null): string => {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800";
    case "REJECTED":
      return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
    case "PENDING_REVIEW":
      return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
    case "NOT_SUBMITTED":
    default:
      return "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
  }
};

export const getDocumentSourceLabel = (source?: string | null): string => {
  switch (source) {
    case "RESUBMISSION":
      return "إعادة رفع";
    case "REGISTRATION":
      default:
      return "التسجيل الأول";
  }
};

export const getStatusStyle = (status: string): string => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "PENDING":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    case "SUSPENDED":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  }
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case "ACTIVE":
      return "نشط";
    case "PENDING":
      return "قيد المراجعة";
    case "SUSPENDED":
      return "موقوف";
    default:
      return status;
  }
};
