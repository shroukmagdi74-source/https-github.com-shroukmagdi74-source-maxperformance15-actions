export interface DuplicateOrderSettingsData {
  enabled: boolean;
  criteria: 'phone' | 'phone_amount' | 'phone_items';
  activeStatuses: string[];
  windowEnabled: boolean;
  windowMinutes: number;
  action: 'record_visible' | 'record_hidden' | 'block';
  alertTeam: boolean;
  includeStoreOrders: boolean;
  reportTreatment: 'separate' | 'cancelled';
  exemptPhones: string[];
}

export interface StatusOption {
  code: string;
  label: string;
  dot: string;
}

export interface TimeWindowPreset {
  minutes: number;
  label: string;
}

export interface DuplicateCriteriaOption {
  id: 'phone' | 'phone_amount' | 'phone_items';
  title: string;
  desc: string;
}

export interface DuplicateActionOption {
  id: 'record_visible' | 'record_hidden' | 'block';
  title: string;
  desc: string;
}
