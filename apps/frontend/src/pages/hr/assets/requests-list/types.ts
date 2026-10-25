export interface AssetRequestAdminRecord {
  id: string;
  assetType: string;
  category?: string;
  reason: string;
  priority: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "FULFILLED" | "CANCELLED";
  requestedBy: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  fulfilledBy?: string;
  fulfilledAt?: string;
  notes?: string;
  createdAt: string;
  asset?: {
    id: string;
    name: string;
    code: string;
    status: string;
  };
}
