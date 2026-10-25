import { Feedback, MyFeedbackStats } from "./types";

export const getFeedbackTypeKey = (type: string): string => {
  const typeMap: Record<string, string> = {
    SUGGESTION: "employee.feedback.typeSuggestion",
    COMPLAINT: "employee.feedback.typeComplaint",
    INQUIRY: "employee.feedback.typeInquiry",
    PEER: "employee.feedback.typePeerReview",
    MANAGER: "employee.feedback.typeManagerReview",
    SUBORDINATE: "employee.feedback.typeSubordinateReview",
    OTHER: "employee.feedback.typeOther",
  };
  return typeMap[type] || "employee.feedback.typeOther";
};

export const calculateMyFeedbackStats = (
  feedback: Feedback[],
  userId?: string
): MyFeedbackStats => {
  const receivedCount = feedback.filter((f) => f.toUserId === userId).length;
  const sentCount = feedback.filter((f) => f.fromUserId === userId).length;
  const rated = feedback.filter((f) => f.toUserId === userId && f.rating);
  const avgRating =
    rated.length === 0
      ? "0.0"
      : (
          rated.reduce((acc, curr) => acc + (curr.rating || 0), 0) /
          rated.length
        ).toFixed(1);

  return {
    receivedCount,
    sentCount,
    avgRating,
  };
};

export const filterMyFeedback = (
  feedback: Feedback[],
  currentUserId: string | undefined,
  activeTab: string,
  searchQuery: string,
  generalManagementLabel: string
): Feedback[] => {
  return feedback.filter((item) => {
    if (currentUserId) {
      if (activeTab === "received") {
        if (item.toUserId !== currentUserId) return false;
      } else if (activeTab === "sent") {
        if (item.fromUserId !== currentUserId) return false;
      }
    }

    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      const contentMatch = (item.content || "").toLowerCase().includes(search);
      const fromName = item.fromEmployee
        ? `${item.fromEmployee.firstName} ${item.fromEmployee.lastName}`
        : "";
      const toName = item.toEmployee
        ? `${item.toEmployee.firstName} ${item.toEmployee.lastName}`
        : item.toUserId
          ? ""
          : generalManagementLabel;

      return (
        contentMatch ||
        fromName.toLowerCase().includes(search) ||
        toName.toLowerCase().includes(search)
      );
    }

    return true;
  });
};
