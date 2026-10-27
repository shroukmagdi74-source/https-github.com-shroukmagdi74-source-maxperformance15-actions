import React from "react";

export type ReportType =
  | "sales"
  | "customers"
  | "conversations"
  | "products"
  | "performance"
  | "moderators";

export interface ReportData {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  period: string;
  data: any[];
  lastUpdated: string;
}

export interface PresetRange {
  id: string;
  label: string;
  range: {
    start: string;
    end: string;
  };
}

export interface SummaryCardItem {
  id: string;
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export interface TopProductItem {
  name: string;
  label: string;
  sortValue: number;
}
