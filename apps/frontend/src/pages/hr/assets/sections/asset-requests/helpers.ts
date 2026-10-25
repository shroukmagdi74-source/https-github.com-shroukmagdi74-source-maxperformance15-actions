import { AssetRequestRecord, AssetRequestStatus } from "./types";

export const ASSET_REQUEST_TYPES = [
  "حاسوب محمول (Laptop)",
  "هاتف ذكي (Mobile)",
  "شاشة (Monitor)",
  "كرسي مكتبي",
  "أدوات قرطاسية",
] as const;

export const ASSET_REQUEST_PRIORITIES = [
  { key: "NORMAL", label: "عادية" },
  { key: "HIGH", label: "عالية" },
  { key: "URGENT", label: "عاجل" },
] as const;

export const getAssetRequestStatusColor = (
  status: AssetRequestStatus,
): string => {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "APPROVED":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "REJECTED":
      return "bg-red-100 text-red-700 border-red-200";
    case "FULFILLED":
      return "bg-green-100 text-green-700 border-green-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

export const getAssetRequestStatusText = (
  status: AssetRequestStatus,
): string => {
  switch (status) {
    case "PENDING":
      return "قيد الانتظار";
    case "APPROVED":
      return "تمت الموافقة";
    case "REJECTED":
      return "مرفوض";
    case "FULFILLED":
      return "تم التسليم";
    case "CANCELLED":
      return "ملغى";
  }
};

export const enrichAssetRequestRecord = (
  req: AssetRequestRecord,
): AssetRequestRecord => ({
  ...req,
  requesterName:
    req.requester?.firstName || req.requester?.lastName
      ? `${req.requester?.firstName || ""} ${req.requester?.lastName || ""}`.trim()
      : req.requester?.employeeNumber || req.requestedBy,
});
