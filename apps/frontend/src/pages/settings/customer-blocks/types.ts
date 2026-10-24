import type {
  CustomerBlockAction,
  CustomerBlockReasonCode,
  CustomerBlockRule,
  CustomerBlockSettings as CustomerBlockSettingsShape,
} from '../../../services/customerBlocklistService';

export interface CustomerBlockReasonOption {
  value: CustomerBlockReasonCode;
  label: string;
}

export interface CustomerBlockActionOption {
  value: CustomerBlockAction;
  label: string;
}

export interface NewRuleState {
  phone: string;
  email: string;
  reasonCode: CustomerBlockReasonCode;
  reasonNote: string;
  action: CustomerBlockAction;
  expiresAt: string;
}

export interface FeedbackState {
  type: 'success' | 'error';
  message: string;
}

export type { CustomerBlockAction, CustomerBlockReasonCode, CustomerBlockRule, CustomerBlockSettingsShape };
