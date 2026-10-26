import React from "react";
import type { Ticket, AttachmentFile, Message } from "../../../services/supportService";

export type { Ticket, AttachmentFile, Message };

export const getStatusText = (status: string) => {
  switch (status) {
    case "open":
      return "مفتوح";
    case "in_progress":
      return "قيد المعالجة";
    case "closed":
      return "مغلق";
    default:
      return status;
  }
};

export const getCategoryText = (category: string) => {
  const categories: { [key: string]: string } = {
    technical: "تقني",
    billing: "فواتير",
    inquiry: "استفسار",
    suggestion: "اقتراح",
    complaint: "شكوى",
  };
  return categories[category] || category;
};

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
