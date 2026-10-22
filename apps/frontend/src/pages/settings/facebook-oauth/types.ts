export interface FacebookPageAccount {
  id: string;
  facebookUserId: string | null;
  name: string | null;
  email: string | null;
  status: string;
}

export interface FacebookPage {
  id: string;
  pageId: string;
  pageName: string;
  status: string;
  connectedAt: string;
  disconnectedAt?: string | null;
  lastActivity: string;
  tokenHealth?: string;
  tokenSource?: string | null;
  needsReconnect?: boolean;
  canReconnect?: boolean;
  healthMessage?: string | null;
  attribution?: "ok" | "stale" | "unattributed";
  account?: FacebookPageAccount | null;
}

export interface FacebookAccountSummary {
  id: string;
  facebookUserId: string | null;
  name: string | null;
  email: string | null;
  status: string;
  pagesCount: number;
  connectedPagesCount: number;
}

export interface FacebookUser {
  id: string;
  name: string;
  picture?: string | null;
}

export interface OAuthStatus {
  connected: boolean;
  pagesCount: number;
  connectedPagesCount?: number;
  disconnectedPagesCount?: number;
  needsAttention?: boolean;
  unhealthyPagesCount?: number;
  pages: FacebookPage[];
  accounts?: FacebookAccountSummary[];
  facebookUser?: FacebookUser | null;
}

export interface SkippedPage {
  pageId: string;
  pageName: string;
  reason: string;
}

export interface FacebookDebugPage {
  pageId: string;
  pageName: string;
  status: string;
}

export interface AccountGroup {
  key: string;
  label: string;
  items: FacebookPage[];
}

export interface AffectedCompany {
  companyName: string;
  pages: string[];
}
