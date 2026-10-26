export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  staffId: string;
  staffName: string;
  title: string;
  description: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
  type: string;
  location: string;
  meetingLink?: string;
  notes: string;
  createdAt: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  duration: number;
  available: boolean;
}

export interface AppointmentFilters {
  status: string;
  staffId: string;
  type: string;
  dateFrom: string;
  dateTo: string;
}

export interface NewAppointmentPayload {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  staffId: string;
  staffName: string;
  title: string;
  description: string;
  appointmentDate: string;
  startTime: string;
  type: string;
  location: string;
  meetingLink: string;
  notes: string;
}
