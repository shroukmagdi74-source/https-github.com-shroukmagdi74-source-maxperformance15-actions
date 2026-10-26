export interface MapNode {
  id: string;
  parentId?: string;
  stepOrder: number;
  title: string;
  subtitle: string;
  category: "calc" | "creative" | "store" | "ads" | "chat" | "ops" | "finance" | "growth" | "training";
  badge: string;
  x: number;
  y: number;
  color: string;
  iconName: string;
  hasVideo?: boolean;
  liveRoute?: string;
  requiredAppSlug?: string;
  liveMetric?: { label: string; value: string; color: string };
}

export interface WorkflowStage {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  color: string;
  accentBorder: string;
  bgGradient: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type MindMapMode = "plan" | "train" | "exec";
export type MindMapViewMode = "canvas" | "timeline";
