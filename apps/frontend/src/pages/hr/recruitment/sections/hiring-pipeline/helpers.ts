import { PipelineStage, StageApplicant } from "./types";

export const DEFAULT_PIPELINE_STAGES: PipelineStage[] = [
  { id: "NEW", name: "جديد", count: 0, color: "blue" },
  { id: "REVIEWING", name: "قيد المراجعة", count: 0, color: "amber" },
  {
    id: "INTERVIEW_SCHEDULED",
    name: "مقابلة مجدولة",
    count: 0,
    color: "purple",
  },
  { id: "INTERVIEWED", name: "تمت المقابلة", count: 0, color: "indigo" },
  { id: "OFFERED", name: "تم العرض", count: 0, color: "green" },
  { id: "HIRED", name: "تم التوظيف", count: 0, color: "emerald" },
  { id: "REJECTED", name: "مرفوض", count: 0, color: "red" },
];

export const normalizeStageApplicant = (applicant: any): StageApplicant => ({
  ...applicant,
  id: applicant?.id || "",
  name: applicant?.name || "بدون اسم",
  email: applicant?.email || "بدون بريد",
  phone: applicant?.phone || "",
  status: applicant?.status || "NEW",
  createdAt: applicant?.createdAt,
  jobTitle: applicant?.jobTitle || applicant?.job?.title || "بدون وظيفة",
  job: applicant?.job || null,
});

export const getPipelineStageColorClasses = (color: string): string => {
  const colors: Record<string, string> = {
    blue: "bg-blue-100 border-blue-300 text-blue-700",
    amber: "bg-amber-100 border-amber-300 text-amber-700",
    purple: "bg-purple-100 border-purple-300 text-purple-700",
    indigo: "bg-indigo-100 border-indigo-300 text-indigo-700",
    green: "bg-green-100 border-green-300 text-green-700",
    emerald: "bg-emerald-100 border-emerald-300 text-emerald-700",
    red: "bg-red-100 border-red-300 text-red-700",
  };

  return colors[color] || colors.blue;
};
