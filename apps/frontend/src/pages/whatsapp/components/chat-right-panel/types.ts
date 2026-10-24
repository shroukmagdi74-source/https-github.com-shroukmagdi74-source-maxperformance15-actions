import type { Contact } from '../../../../hooks/useWhatsAppQueries';

export type RightPanelTab = 'info' | 'orders' | 'activity';

export interface ChatRightPanelProps {
  contact: Contact | null;
  onOpenOrder: () => void;
  onOpenServiceOrder?: () => void;
  onOpenTasks: () => void;
  onClose?: () => void;
  onOpenLabels?: () => void;
  labels?: { id: string; name: string; color: string }[];
  refreshToken?: number;
  onContactUpdated?: (updatedContact: Contact) => void;
}

export interface ActiveCustomerJourney {
  id: string;
  status: string;
  currentStep: number;
  totalSteps: number;
  flowName: string;
  lastSentAt?: string;
  nextSendAt?: string;
}

export interface OrderContextMenuState {
  mouseX: number;
  mouseY: number;
  orderNumber: string;
}
