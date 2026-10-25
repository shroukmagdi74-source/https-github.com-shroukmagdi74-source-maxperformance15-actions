export type JobPostingType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "INTERNSHIP";

export type JobExperienceLevel =
  | "ENTRY"
  | "JUNIOR"
  | "MID"
  | "SENIOR"
  | "LEAD";

export type JobPostingStatus = "DRAFT" | "ACTIVE" | "CLOSED" | "ON_HOLD";

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: JobPostingType;
  experienceLevel: JobExperienceLevel;
  salaryMin?: number;
  salaryMax?: number;
  description: string;
  requirements: string[] | string;
  responsibilities: string[] | string;
  status: JobPostingStatus;
  applicantsCount: number;
  postedDate: string;
  closingDate?: string;
}

export interface NewJobForm {
  title: string;
  department: string;
  location: string;
  type: JobPostingType;
  experienceLevel: JobExperienceLevel;
  salaryMin: string;
  salaryMax: string;
  description: string;
  requirements: string;
  responsibilities: string;
  closingDate: string;
}
