export type AICapabilityStatus = "available" | "coming_soon";

export interface AICapability {
  id: string;
  label: string;
  status: AICapabilityStatus;
}

export const AI_CAPABILITIES = [
  { id: "section-suggestions", label: "اقتراح أقسام جاهزة", status: "available" },
  { id: "copy-templates", label: "قوالب نصوص جاهزة للعربي", status: "available" },
  { id: "image-generation", label: "توليد صور", status: "coming_soon" },
  { id: "auto-layout", label: "تصميم تلقائي للصفحة", status: "coming_soon" },
  { id: "content-rewrite", label: "إعادة صياغة المحتوى", status: "coming_soon" },
] as const;

export type AICapabilityId = (typeof AI_CAPABILITIES)[number]["id"];

export const COMING_SOON_NOTICE = "مش متاحة دلوقتي — بنشتغل عليها";

export const isCapabilityAvailable = (status: AICapabilityStatus | string): boolean => {
  return status === "available";
};
