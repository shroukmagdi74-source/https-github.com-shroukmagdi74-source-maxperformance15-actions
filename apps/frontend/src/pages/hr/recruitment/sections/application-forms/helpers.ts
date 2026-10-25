import { FormResponse, NewFormDraft, Question, QuestionType } from "./types";

export const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "TEXT", label: "نص قصير" },
  { value: "TEXTAREA", label: "نص طويل" },
  { value: "SELECT", label: "قائمة منسدلة" },
  { value: "RADIO", label: "اختيار واحد" },
  { value: "CHECKBOX", label: "اختيار متعدد" },
  { value: "FILE", label: "رفع ملف" },
];

export const getApplicantStatusLabel = (status?: string): string => {
  const statusLabels: Record<string, string> = {
    NEW: "جديد",
    REVIEWING: "قيد المراجعة",
    INTERVIEW_SCHEDULED: "مقابلة مجدولة",
    INTERVIEWED: "تمت المقابلة",
    OFFERED: "تم العرض",
    HIRED: "تم التوظيف",
    REJECTED: "مرفوض",
  };

  return statusLabels[status || ""] || "داخل المسار";
};

export const getApplicantStatusBadgeClasses = (status?: string): string => {
  const classes: Record<string, string> = {
    NEW: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    REVIEWING:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    INTERVIEW_SCHEDULED:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    INTERVIEWED:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    OFFERED:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    HIRED:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };

  return (
    classes[status || ""] ||
    "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
  );
};

export const createEmptyFormDraft = (): NewFormDraft => ({
  title: "",
  slug: "",
  description: "",
  jobId: "",
  isActive: true,
  questions: [],
});

export const createEmptyQuestionDraft = (): Question => ({
  questionText: "",
  questionType: "TEXT",
  options: [],
  isRequired: false,
  orderIndex: 0,
});

export const reorderQuestions = (
  questions: Question[],
  index: number,
  direction: "up" | "down"
): Question[] => {
  const newQuestions = [...questions];
  const newIndex = direction === "up" ? index - 1 : index + 1;
  if (newIndex < 0 || newIndex >= newQuestions.length) return questions;

  [newQuestions[index], newQuestions[newIndex]] = [
    newQuestions[newIndex],
    newQuestions[index],
  ];
  return newQuestions.map((q, i) => ({ ...q, orderIndex: i }));
};

export const patchResponseInList = (
  list: FormResponse[],
  responseId: string,
  patch: Partial<FormResponse>
): FormResponse[] =>
  list.map((item) => (item.id === responseId ? { ...item, ...patch } : item));
