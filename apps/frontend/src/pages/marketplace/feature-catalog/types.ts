// Copy baseline: every feature key used by the live marketplace catalog has an Arabic
// entry here (417 keys) plus 64 app positioning rows. Add new keys next to their peers.
export type JsonRecord = Record<string, unknown>;

export type FeatureAccessKind = "FREE" | "PAID" | "PAY_PER_USE";
export type PositioningFieldKey = "audience" | "surface" | "outcome";

export interface FeatureDisplayItem {
  key: string;
  name: string;
  description: string;
  access: FeatureAccessKind;
}

export interface PositioningDisplayItem {
  audience: string;
  surface: string;
  outcome: string;
}

export interface FeatureCatalogEntry {
  name: string;
  description: string;
}

export interface RawFeatureItem {
  key: string;
  name?: string;
  description?: string;
  access?: FeatureAccessKind | string;
}

export interface MarketplaceFeatureCarrier {
  slug?: string;
  pricingModel?: string;
  features?: unknown;
}

export interface MarketplacePositioningCarrier {
  slug?: string;
  positioning?: unknown;
}
