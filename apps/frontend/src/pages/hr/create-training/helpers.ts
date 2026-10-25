import { TrainingStatusOption, TrainingTypeOption } from "./types";

export const TRAINING_TYPES: TrainingTypeOption[] = [
  { value: "technical", label: "تقني / فني" },
  { value: "soft-skills", label: "مهارات ناعمة / تواصل" },
  { value: "management", label: "إداري / قيادي" },
  { value: "safety", label: "صحة وسلامة مهنية" },
  { value: "language", label: "لغات" },
  { value: "compliance", label: "امتثال وقوانين" },
  { value: "other", label: "أخرى" },
];

export const TRAINING_STATUS_OPTIONS: TrainingStatusOption[] = [
  {
    value: "PLANNED",
    label: "مخطط",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    value: "ONGOING",
    label: "قيد التنفيذ",
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
  {
    value: "COMPLETED",
    label: "مكتمل",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  {
    value: "CANCELLED",
    label: "ملغي",
    color: "bg-rose-100 text-rose-700 border-rose-200",
  },
];
