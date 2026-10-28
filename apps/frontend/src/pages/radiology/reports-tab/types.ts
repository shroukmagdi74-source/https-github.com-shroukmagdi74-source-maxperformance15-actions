import { RadiologyReport, RadiologyStudy } from "../shared";

export type ActionKind = "review" | "sign" | "deliver";

export interface ReportRow extends RadiologyStudy {
  report?: RadiologyReport;
}

export interface ReportStudy extends RadiologyStudy {
  billingType?: string;
}

export interface Counters {
  total: number;
  awaitingReview: number;
  awaitingSign: number;
  deliveredToday: number;
  critical: number;
}

export type CounterKey = keyof Counters;

export interface ReportFilters {
  search: string;
  studySearch: string;
  statusFilter: string;
  criticalFilter: string;
  dateFrom: string;
  dateTo: string;
}

export interface RadiologyReportModalProps {
  studyId: string;
  onClose: () => void;
  onSaved: () => void;
}
