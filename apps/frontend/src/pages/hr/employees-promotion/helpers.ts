import { Promotion, PromotionStats } from "./types";

export const getStatusLabel = (
  status: string,
): { label: string; color: string } => {
  const statusMap: Record<string, { label: string; color: string }> = {
    PENDING: {
      label: "قيد المراجعة",
      color: "bg-yellow-100 text-yellow-800",
    },
    APPROVED: { label: "موافق عليها", color: "bg-green-100 text-green-800" },
    REJECTED: { label: "مرفوضة", color: "bg-red-100 text-red-800" },
    COMPLETED: { label: "مكتملة", color: "bg-blue-100 text-blue-800" },
  };
  return (
    statusMap[status] || { label: status, color: "bg-gray-100 text-gray-800" }
  );
};

export const computePromotionStats = (
  promotions: Promotion[],
): PromotionStats => ({
  total: promotions.length,
  pending: promotions.filter((p) => p.status === "PENDING").length,
  approved: promotions.filter((p) => p.status === "APPROVED").length,
  rejected: promotions.filter((p) => p.status === "REJECTED").length,
  completed: promotions.filter((p) => p.status === "COMPLETED").length,
});

export const filterAndSortPromotions = ({
  promotions,
  searchTerm,
  statusFilter,
  sortBy,
}: {
  promotions: Promotion[];
  searchTerm: string;
  statusFilter: string;
  sortBy: string;
}): Promotion[] => {
  if (!Array.isArray(promotions)) return [];

  let filtered = [...promotions];

  if (searchTerm) {
    const query = searchTerm.toLowerCase();
    filtered = filtered.filter((promotion) => {
      const userObj = promotion?.user || promotion?.employee;
      const firstName = userObj?.firstName || "";
      const lastName = userObj?.lastName || "";
      const employeeName = `${firstName} ${lastName}`.trim().toLowerCase();
      const fromPos = promotion.fromPositionName?.toLowerCase() || "";
      const toPos = promotion.toPositionName?.toLowerCase() || "";
      const reason = promotion.reason?.toLowerCase() || "";

      return (
        employeeName.includes(query) ||
        fromPos.includes(query) ||
        toPos.includes(query) ||
        reason.includes(query)
      );
    });
  }

  if (statusFilter !== "all") {
    filtered = filtered.filter(
      (promotion) => promotion.status === statusFilter,
    );
  }

  filtered.sort((a, b) => {
    const userA = a?.user || a?.employee;
    const userB = b?.user || b?.employee;

    switch (sortBy) {
      case "promotionDate":
        return (
          new Date(b.promotionDate).getTime() -
          new Date(a.promotionDate).getTime()
        );
      case "employeeName": {
        const nameA = `${userA?.firstName || ""} ${userA?.lastName || ""}`
          .trim()
          .toLowerCase();
        const nameB = `${userB?.firstName || ""} ${userB?.lastName || ""}`
          .trim()
          .toLowerCase();
        return nameA.localeCompare(nameB);
      }
      case "toPosition":
        return (a.toPositionName || "").localeCompare(b.toPositionName || "");
      default:
        return 0;
    }
  });

  return filtered;
};
