export type HRApiTab = "keys" | "webhooks" | "docs";

export interface ApiKeyItem {
  id: string;
  name: string;
  description?: string;
  keyPrefix: string;
  scopes: string;
  isActive: boolean;
  lastUsedAt?: string;
  createdAt: string;
}

export interface WebhookItem {
  id: string;
  name: string;
  targetUrl: string;
  subscribedEvents: string;
  isActive: boolean;
  lastTriggeredAt?: string;
}

export interface HRApiScopeOption {
  value: string;
  label: string;
}
