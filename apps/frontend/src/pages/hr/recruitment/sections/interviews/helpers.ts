import { NewInterviewForm } from "./types";

export const createInitialInterviewForm = (): NewInterviewForm => ({
  applicantId: "",
  jobId: "",
  date: "",
  time: "",
  type: "VIDEO",
  location: "",
  interviewers: [],
  notes: "",
});

export const getInterviewStatusBadge = (
  status: string,
): { text: string; bg: string } => {
  switch (status) {
    case "SCHEDULED":
      return {
        text: "مجدولة",
        bg: "bg-blue-100 text-blue-700 border-blue-200",
      };
    case "COMPLETED":
      return {
        text: "مكتملة",
        bg: "bg-green-100 text-green-700 border-green-200",
      };
    case "CANCELLED":
      return {
        text: "ملغاة",
        bg: "bg-red-100 text-red-700 border-red-200",
      };
    case "NO_SHOW":
      return {
        text: "لم يحضر",
        bg: "bg-gray-100 text-gray-700 border-gray-200",
      };
    default:
      return { text: status, bg: "bg-gray-100 text-gray-700" };
  }
};

export const getInterviewTypeText = (type: string): string => {
  switch (type) {
    case "VIDEO":
      return "مكالمة فيديو";
    case "PHONE":
      return "مكالمة هاتفية";
    case "IN_PERSON":
      return "في الشركة";
    default:
      return type;
  }
};

export const normalizeInterviewersList = (
  interviewers: string[] | string | undefined,
): string[] => {
  if (!interviewers) return [];
  if (typeof interviewers === "string") {
    return interviewers
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return interviewers;
};
