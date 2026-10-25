export interface AuditLogActor {
  avatar?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface AuditLog {
  id: string;
  action: "APPROVE" | "REJECT" | "UPDATE" | "CREATE" | "DELETE" | string;
  entityType:
    | "LEAVE"
    | "ADVANCE"
    | "RESIGNATION"
    | "EMPLOYEE"
    | "DEPARTMENT"
    | string;
  entityId: string;
  actorId: string;
  actorName: string;
  details: any;
  ipAddress?: string;
  createdAt: string;
  actor?: AuditLogActor;
}

export interface AuditStats {
  totalLogs: number;
  actionStats: { action: string; count: number }[];
  entityStats: { entityType: string; count: number }[];
}

export interface AuditFilters {
  entityType: string;
  action: string;
  startDate: string;
  endDate: string;
  search: string;
}

export interface AuditPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
