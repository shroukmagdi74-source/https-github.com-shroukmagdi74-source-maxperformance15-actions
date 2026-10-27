import {
  FactoryPortalAssignment,
  FactoryPortalContext,
} from '../../manufacturingApi';

export type FactoryPortalStatusTab = 'ALL' | 'ACTIVE' | 'PENDING_REVIEW' | 'COMPLETED';

export type FactoryPortalModalType = 'UPDATE' | 'MEDIA' | 'APPROVAL' | 'ISSUE';

export interface FactoryPortalActiveModal {
  type: FactoryPortalModalType;
  assignment: FactoryPortalAssignment;
}

export interface FactoryPortalStats {
  all: number;
  active: number;
  pendingReview: number;
  completed: number;
}
