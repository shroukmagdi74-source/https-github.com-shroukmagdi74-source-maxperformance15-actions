export const REVIEW_FEEDBACK_TYPES = ["PEER", "MANAGER", "SUBORDINATE"];

export const isReviewFeedbackType = (type: string): boolean => {
  return REVIEW_FEEDBACK_TYPES.includes(type);
};

export const FEEDBACK_GUIDELINES: { step: number; text: string }[] = [
  { step: 1, text: "كن محدداً في ملاحظاتك واذكر أمثلة واقعية." },
  { step: 2, text: "ركز على السلوكيات والأداء وليس الشخصية." },
  { step: 3, text: "قدم نصائح عملية للتحسين المستقبلي." },
];
