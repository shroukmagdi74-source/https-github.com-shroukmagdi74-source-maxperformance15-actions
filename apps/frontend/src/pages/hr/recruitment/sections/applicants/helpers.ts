import { Applicant, ApplicantStatus } from "./types";

export const APPLICANT_STATUS_VALUES = new Set<ApplicantStatus>([
  "NEW",
  "REVIEWING",
  "INTERVIEW_SCHEDULED",
  "INTERVIEWED",
  "OFFERED",
  "HIRED",
  "REJECTED",
]);

export const normalizeSkills = (skills: unknown): string[] => {
  if (Array.isArray(skills)) {
    return skills.map((skill) => String(skill).trim()).filter(Boolean);
  }

  if (typeof skills === "string") {
    return skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  return [];
};

export const normalizeApplicant = (applicant: any): Applicant => {
  const rawStatus = applicant?.status;
  const status: ApplicantStatus = APPLICANT_STATUS_VALUES.has(rawStatus)
    ? rawStatus
    : "NEW";

  return {
    ...applicant,
    id: applicant?.id || "",
    name: applicant?.name || "بدون اسم",
    email: applicant?.email || "بدون بريد",
    phone: applicant?.phone || "بدون هاتف",
    jobTitle: applicant?.jobTitle || applicant?.job?.title || "بدون وظيفة",
    jobId: applicant?.jobId || "",
    appliedDate: applicant?.appliedDate || applicant?.createdAt || "",
    status,
    experience: Number.isFinite(Number(applicant?.experience))
      ? Number(applicant.experience)
      : 0,
    education: applicant?.education || "غير محدد",
    skills: normalizeSkills(applicant?.skills),
  };
};

export const getStatusBadge = (
  status: Applicant["status"]
): { bg: string; text: string } => {
  const badges: Record<ApplicantStatus, { bg: string; text: string }> = {
    NEW: { bg: "bg-blue-100 text-blue-700 border-blue-300", text: "جديد" },
    REVIEWING: {
      bg: "bg-amber-100 text-amber-700 border-amber-300",
      text: "قيد المراجعة",
    },
    INTERVIEW_SCHEDULED: {
      bg: "bg-purple-100 text-purple-700 border-purple-300",
      text: "مقابلة مجدولة",
    },
    INTERVIEWED: {
      bg: "bg-indigo-100 text-indigo-700 border-indigo-300",
      text: "تمت المقابلة",
    },
    OFFERED: {
      bg: "bg-green-100 text-green-700 border-green-300",
      text: "تم العرض",
    },
    HIRED: {
      bg: "bg-emerald-100 text-emerald-700 border-emerald-300",
      text: "تم التوظيف",
    },
    REJECTED: {
      bg: "bg-red-100 text-red-700 border-red-300",
      text: "مرفوض",
    },
  };
  return badges[status] || badges.NEW;
};

export const filterApplicantsList = (
  applicants: Applicant[],
  searchTerm: string,
  filterStatus: string
): Applicant[] => {
  const normalizedSearchTerm = searchTerm.toLowerCase();
  return applicants.filter((applicant) => {
    const searchableText = [
      applicant.name,
      applicant.email,
      applicant.phone,
      applicant.jobTitle,
    ]
      .join(" ")
      .toLowerCase();
    const matchesSearch = searchableText.includes(normalizedSearchTerm);
    const matchesFilter =
      filterStatus === "all" || applicant.status === filterStatus;
    return matchesSearch && matchesFilter;
  });
};
