export interface CheckoutFormProps {
  section?: {
    variant?: string;
    [key: string]: unknown;
  };
  settings?: {
    title?: string;
    subtitle?: string;
    contactTitle?: string;
    contactDescription?: string;
    shippingTitle?: string;
    shippingDescription?: string;
    notesTitle?: string;
    notesDescription?: string;
    showNotesSection?: string | boolean;
    notesOptionalLabel?: string;
    fullNameLabel?: string;
    fullNamePlaceholder?: string;
    emailLabel?: string;
    emailPlaceholder?: string;
    phoneLabel?: string;
    phonePlaceholder?: string;
    addressLabel?: string;
    addressPlaceholder?: string;
    cityLabel?: string;
    cityPlaceholder?: string;
    governorateLabel?: string;
    governoratePlaceholder?: string;
    notesPlaceholder?: string;
    autoDetectHint?: string;
    autoDetectSuccessText?: string;
    assuranceBadge?: string;
    assuranceTitle?: string;
    assuranceItems?: string[] | string;
    [key: string]: unknown;
  };
}

export type CheckoutFormVariant =
  | 'standard'
  | 'split'
  | 'compact'
  | 'market-checkout'
  | 'nature-checkout'
  | 'safe-adventure'
  | 'soft-flow'
  | 'command-checkout'
  | 'fitting-room-checkout';

export interface GovernorateOption {
  value: string;
  label: string;
}
