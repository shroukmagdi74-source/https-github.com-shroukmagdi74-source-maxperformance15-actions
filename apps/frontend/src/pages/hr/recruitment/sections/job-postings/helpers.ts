import {
  JobExperienceLevel,
  JobPostingStatus,
  JobPostingType,
  NewJobForm,
} from "./types";

export const createInitialJobForm = (): NewJobForm => ({
  title: "",
  department: "",
  location: "",
  type: "FULL_TIME",
  experienceLevel: "MID",
  salaryMin: "",
  salaryMax: "",
  description: "",
  requirements: "",
  responsibilities: "",
  closingDate: "",
});

export const getJobStatusBadge = (
  status: JobPostingStatus,
): { bg: string; text: string } => {
  const badges: Record<JobPostingStatus, { bg: string; text: string }> = {
    DRAFT: {
      bg: "bg-gray-100 text-gray-700 border-gray-300",
      text: "مسودة",
    },
    ACTIVE: {
      bg: "bg-green-100 text-green-700 border-green-300",
      text: "نشط",
    },
    CLOSED: {
      bg: "bg-red-100 text-red-700 border-red-300",
      text: "مغلق",
    },
    ON_HOLD: {
      bg: "bg-amber-100 text-amber-700 border-amber-300",
      text: "معلق",
    },
  };
  return badges[status] || badges.DRAFT;
};

export const getJobTypeLabel = (type: JobPostingType): string => {
  const labels: Record<JobPostingType, string> = {
    FULL_TIME: "دوام كامل",
    PART_TIME: "دوام جزئي",
    CONTRACT: "عقد",
    INTERNSHIP: "تدريب",
  };
  return labels[type] || type;
};

export const getJobExperienceLabel = (level: JobExperienceLevel): string => {
  const labels: Record<JobExperienceLevel, string> = {
    ENTRY: "مبتدئ",
    JUNIOR: "Junior",
    MID: "Mid-Level",
    SENIOR: "Senior",
    LEAD: "Lead",
  };
  return labels[level] || level;
};

export const normalizeTextList = (value: string[] | string | undefined): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return [];
};
