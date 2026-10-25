export type QuestionType =
  | "TEXT"
  | "TEXTAREA"
  | "SELECT"
  | "RADIO"
  | "CHECKBOX"
  | "FILE";

export type ResponseFilter = "all" | "contacted" | "notContacted";

export interface Question {
  id?: string;
  questionText: string;
  questionType: QuestionType;
  options: string[];
  isRequired: boolean;
  orderIndex: number;
}

export interface ApplicationForm {
  id: string;
  title: string;
  slug?: string;
  description?: string;
  jobId?: string;
  jobTitle?: string;
  isActive: boolean;
  questionsCount: number;
  responsesCount: number;
  createdAt: string;
  questions?: Question[];
}

export interface FormResponse {
  id: string;
  respondentName: string;
  respondentEmail: string;
  respondentPhone?: string;
  isContacted: boolean;
  contactedAt?: string | null;
  submittedAt: string;
  applicant?: {
    id: string;
    status: string;
    createdAt?: string;
  } | null;
  form?: {
    title: string;
    jobId?: string | null;
    job?: {
      title?: string;
    } | null;
  };
  answers: {
    id: string;
    answerText?: string;
    answerFile?: string;
    question: {
      questionText: string;
      questionType: string;
    };
  }[];
}

export interface JobOption {
  id: string;
  title: string;
}

export interface NewFormDraft {
  title: string;
  slug: string;
  description: string;
  jobId: string;
  isActive: boolean;
  questions: Question[];
}
