import type { TurboTicketItem, TurboMessage } from "../types";

export interface TurboTicketChatPanelProps {
  ticket: TurboTicketItem | null;
  loading: boolean;
  onRefreshTicket: () => void;
  onBackToList?: () => void;
  onOpenLogs: () => void;
}

export interface MatchedOrderItem {
  id: string;
  productName: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface MatchedOrderCustomer {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  governorate?: string;
}

export interface MatchedOrderFinancials {
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
}

export interface MatchedOrderData {
  id: string;
  orderNumber: string;
  status: string;
  turboStatus?: string;
  turboTrackingNumber?: string;
  turboShipmentId?: string;
  turboCaptainName?: string;
  turboCaptainPhone?: string;
  customer?: MatchedOrderCustomer;
  items?: MatchedOrderItem[];
  financials?: MatchedOrderFinancials;
}

export interface StatusBadgeInfo {
  label: string;
  className: string;
}
