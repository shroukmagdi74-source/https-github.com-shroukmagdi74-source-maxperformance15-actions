import { PerformanceReviewFormData } from "./types";

export const createInitialPerformanceReviewFormData = (): PerformanceReviewFormData => {
  const today = new Date().toISOString().split("T")[0];
  return {
    employeeId: "",
    reviewerId: "",
    reviewPeriod: "",
    periodStart: today,
    periodEnd: today,
    overallRating: 5.0,
    strengths: "",
    improvements: "",
    reviewerComments: "",
    status: "DRAFT",
  };
};

export const RATING_SCALE_LABELS = [
  "ضعيف (1)",
  "مقبول (2)",
  "جيد (3)",
  "ممتاز (4)",
  "استثنائي (5)",
];
