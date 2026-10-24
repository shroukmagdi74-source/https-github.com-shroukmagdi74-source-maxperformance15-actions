export interface RatingSettings {
  excellentThreshold: number;
  goodThreshold: number;
  averageThreshold: number;
  minOrdersForRating: number;
  autoApproveExcellent: boolean;
  autoRejectBad: boolean;
}

export const defaultRatingSettings = (): RatingSettings => ({
  excellentThreshold: 90,
  goodThreshold: 75,
  averageThreshold: 50,
  minOrdersForRating: 3,
  autoApproveExcellent: false,
  autoRejectBad: false,
});
