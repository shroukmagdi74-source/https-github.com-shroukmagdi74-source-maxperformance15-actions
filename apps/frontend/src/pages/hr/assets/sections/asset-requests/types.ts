export type AssetRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "FULFILLED"
  | "CANCELLED";

export type AssetRequestsViewMode = "employee" | "hr";

export interface AssetRequestRecord {
  id: string;
  requestedBy: string;
  assetType: string;
  category?: string;
  reason: string;
  priority: string;
  status: AssetRequestStatus;
  createdAt: string;
  requester?: {
    firstName: string;
    lastName: string;
    employeeNumber: string;
  };
  requesterName?: string;
  rejectionReason?: string;
  assetId?: string;
}

export interface NewAssetRequestFormState {
  assetType: string;
  reason: string;
  priority: string;
}
