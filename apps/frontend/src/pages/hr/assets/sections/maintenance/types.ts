export interface MaintenanceRecord {
  id: string;
  assetId: string;
  type: string;
  description: string;
  cost: number;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  startDate: string;
  completionDate?: string;
  performedBy?: string;
  notes?: string;
  asset?: {
    name: string;
    code: string;
  };
}

export interface MaintenanceAlert {
  assetId?: string;
  maintenanceId?: string;
  name: string;
  code: string;
  endDate?: string;
  scheduledDate?: string;
  maintenanceType?: string;
  type: "WARRANTY" | "MAINTENANCE";
}

export interface MaintenanceAlertsData {
  expiringWarranties: MaintenanceAlert[];
  upcomingMaintenance: MaintenanceAlert[];
}

export interface NewMaintenanceRecordFormState {
  assetId: string;
  type: string;
  description: string;
  cost: string;
  status: string;
  startDate: string;
  performedBy: string;
  notes: string;
}
