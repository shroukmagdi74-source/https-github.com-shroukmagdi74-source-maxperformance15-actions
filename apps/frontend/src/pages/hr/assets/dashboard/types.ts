import React from "react";

export type AssetDashboardSectionId =
  | "overview"
  | "why"
  | "benefits"
  | "how"
  | "kpis"
  | "compliance"
  | "manage"
  | "categories"
  | "suppliers"
  | "custody"
  | "documents"
  | "receipts"
  | "requests"
  | "maintenance"
  | "reports";

export interface AssetDashboardSection {
  id: AssetDashboardSectionId;
  title: string;
  icon: React.ElementType;
  color: string;
}

export interface AssetReportCardConfig {
  reportType: string;
  title: string;
  description: string;
  icon: React.ElementType;
  borderClass: string;
  iconWrapperClass: string;
  iconClass: string;
}
