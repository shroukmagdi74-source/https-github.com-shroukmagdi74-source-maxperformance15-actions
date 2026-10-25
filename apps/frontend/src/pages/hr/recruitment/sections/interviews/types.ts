export type InterviewType = "IN_PERSON" | "VIDEO" | "PHONE";
export type InterviewStatus =
  | "SCHEDULED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface Interview {
  id: string;
  applicantName: string;
  applicantId: string;
  jobTitle: string;
  jobId: string;
  date: string;
  time: string;
  type: InterviewType;
  location?: string;
  interviewers: string[] | string;
  status: InterviewStatus;
  notes?: string;
}

export interface InterviewApplicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  jobId: string;
  jobTitle?: string;
}

export interface InterviewJob {
  id: string;
  title: string;
  department: string;
}

export interface NewInterviewForm {
  applicantId: string;
  jobId: string;
  date: string;
  time: string;
  type: InterviewType;
  location: string;
  interviewers: string[];
  notes: string;
}
