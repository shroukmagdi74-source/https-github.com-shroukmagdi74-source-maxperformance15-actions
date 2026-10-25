export const getAssetRequestBadgeClassName = (status: string): string => {
  const badges: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-blue-100 text-blue-800",
    REJECTED: "bg-red-100 text-red-800",
    FULFILLED: "bg-green-100 text-green-800",
    CANCELLED: "bg-gray-100 text-gray-800",
  };
  return badges[status] || badges.PENDING;
};

export const getAssetRequestStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    PENDING: "قيد الانتظار",
    APPROVED: "موافق عليه",
    REJECTED: "مرفوض",
    FULFILLED: "تم التنفيذ",
    CANCELLED: "ملغي",
  };
  return texts[status] || status;
};

export const getAssetRequestPriorityBadge = (priority: string): string => {
  const badges: Record<string, string> = {
    LOW: "bg-gray-100 text-gray-800",
    NORMAL: "bg-blue-100 text-blue-800",
    HIGH: "bg-orange-100 text-orange-800",
    URGENT: "bg-red-100 text-red-800",
  };
  return badges[priority] || badges.NORMAL;
};
