import { PolicyCategory } from "./types";

export const categories: PolicyCategory[] = [
  { value: "attendance", label: "الحضور والانصراف" },
  { value: "leaves", label: "الإجازات" },
  { value: "conduct", label: "السلوك المهني" },
  { value: "compensation", label: "التعويضات والمزايا" },
  { value: "safety", label: "الصحة والسلامة" },
  { value: "it", label: "تكنولوجيا المعلومات" },
  { value: "general", label: "سياسات عامة" },
];

export const getCategoryLabel = (value: string): string => {
  return categories.find((c) => c.value === value)?.label || value;
};
