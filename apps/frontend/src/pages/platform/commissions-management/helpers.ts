export const getPayoutStatusColor = (status: string, isDark: boolean): string => {
  switch (status) {
    case "PROCESSED":
    case "PAID":
      return isDark
        ? "bg-green-900/50 text-green-300"
        : "bg-green-100 text-green-800";
    case "CANCELLED":
    case "FAILED":
      return isDark
        ? "bg-red-900/50 text-red-300"
        : "bg-red-100 text-red-800";
    default:
      return isDark
        ? "bg-yellow-900/50 text-yellow-300"
        : "bg-yellow-100 text-yellow-800";
  }
};

export const getPayoutStatusText = (status: string): string => {
  switch (status) {
    case "PROCESSED":
    case "PAID":
      return "تم التحويل";
    case "CANCELLED":
      return "ملغي";
    case "FAILED":
      return "فشل";
    default:
      return "قيد الانتظار";
  }
};

export const getCommissionTypeColor = (type: string, isDark: boolean): string => {
  switch (type) {
    case "AFFILIATE":
      return isDark
        ? "bg-green-900/50 text-green-300"
        : "bg-green-100 text-green-800";
    case "MERCHANT":
      return isDark
        ? "bg-purple-900/50 text-purple-300"
        : "bg-purple-100 text-purple-800";
    default:
      return isDark
        ? "bg-orange-900/50 text-orange-300"
        : "bg-orange-100 text-orange-800";
  }
};

export const getCommissionTypeText = (type: string): string => {
  switch (type) {
    case "AFFILIATE":
      return "مسوق";
    case "MERCHANT":
      return "تاجر";
    default:
      return "منصة";
  }
};

export const getCommissionStatusColor = (status: string, isDark: boolean): string => {
  switch (status) {
    case "PAID":
      return isDark
        ? "bg-green-900/50 text-green-300"
        : "bg-green-100 text-green-800";
    case "CONFIRMED":
      return isDark
        ? "bg-blue-900/50 text-blue-300"
        : "bg-blue-100 text-blue-800";
    case "CANCELLED":
      return isDark
        ? "bg-red-900/50 text-red-300"
        : "bg-red-100 text-red-800";
    default:
      return isDark
        ? "bg-yellow-900/50 text-yellow-300"
        : "bg-yellow-100 text-yellow-800";
  }
};

export const getCommissionStatusText = (status: string): string => {
  switch (status) {
    case "PAID":
      return "مدفوع";
    case "CONFIRMED":
      return "مؤكد";
    case "CANCELLED":
      return "ملغي";
    default:
      return "معلق";
  }
};
