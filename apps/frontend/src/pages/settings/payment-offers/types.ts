export type PaymentOffersFormState = {
  discountEnabled: boolean;
  discountPercent: number;
  showDiscountBadge: boolean;
  walletEnabled: boolean;
  walletNumber: string;
  recipientName: string;
  instructions: string;
  cardEnabled: boolean;
  hasGatewayConfig: boolean;
};

export type WalletPaymentSettingsShape = {
  enabled?: boolean;
  walletNumber?: string;
  recipientName?: string;
  instructions?: string;
  discountEnabled?: boolean;
  discountPercent?: number;
  showDiscountBadge?: boolean;
};
