export type ApplicantStatus =
  | "NEW"
  | "REVIEWING"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEWED"
  | "OFFERED"
  | "HIRED"
  | "REJECTED";

export interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  jobId: string;
  appliedDate: string;
  status: ApplicantStatus;
  resumeUrl?: string;
  coverLetter?: string;
  experience: number;
  education: string;
  skills: string[];
  rating?: number;
  notes?: string;
  createdAt?: string;
  job?: {
    title?: string | null;
  } | null;
}

export interface NewApplicantForm {
  name: string;
  email: string;
  phone: string;
  jobId: string;
  experience: number;
  education: string;
  skills: string;
  coverLetter: string;
  resumeUrl: string;
}
