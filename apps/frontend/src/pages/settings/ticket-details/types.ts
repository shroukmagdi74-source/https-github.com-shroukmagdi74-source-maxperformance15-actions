export interface TicketSender {
  id: number;
  first_name: string;
  last_name: string;
  role_name: string;
}

export interface TicketUser {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  role: {
    name: string;
  };
}

export interface TicketMessage {
  id: number;
  ticket_id: number;
  message: string;
  content: string;
  sender_name: string;
  created_at: string;
  is_client_message: number;
  is_comment: number;
  sender?: TicketSender;
  user?: TicketUser;
}

export interface TicketLog {
  id?: number;
  description?: string | { ar?: string };
  created_at: string;
  user?: {
    full_name?: string;
  };
}

export interface TicketDetailsData {
  id: number;
  description: string;
  content: string;
  status: number;
  rate?: number | null;
  created_at: string;
  messages: TicketMessage[];
  logs?: TicketLog[];
}

export const getStatusText = (status: number): string => {
  switch (status) {
    case 0:
      return "جديد";
    case 1:
      return "قيد المعالجة";
    case 2:
      return "مغلق";
    default:
      return "غير معروف";
  }
};

export const getStatusColor = (status: number): string => {
  switch (status) {
    case 0:
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    case 1:
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case 2:
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  }
};

export const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};
