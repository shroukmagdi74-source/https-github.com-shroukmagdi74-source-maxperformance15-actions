import { useState, useEffect, useCallback } from "react";
import i18n from "../../../i18n";
import { buildApiUrl } from "../../../utils/urlHelper";
import tokenManager from "../../../utils/tokenManager";
import {
  Appointment,
  TimeSlot,
  AppointmentFilters,
  NewAppointmentPayload,
} from "./types";

const INITIAL_FILTERS: AppointmentFilters = {
  status: "",
  staffId: "",
  type: "",
  dateFrom: "",
  dateTo: "",
};

const INITIAL_NEW_APPOINTMENT: NewAppointmentPayload = {
  customerId: "",
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  staffId: "",
  staffName: "",
  title: "",
  description: "",
  appointmentDate: "",
  startTime: "",
  type: "consultation",
  location: "المكتب الرئيسي",
  meetingLink: "",
  notes: "",
};

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [filters, setFilters] = useState<AppointmentFilters>(INITIAL_FILTERS);
  const [newAppointment, setNewAppointment] =
    useState<NewAppointmentPayload>(INITIAL_NEW_APPOINTMENT);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      const token = tokenManager.getAccessToken();
      if (!token) {
        console.error("No access token found");
        setLoading(false);
        return;
      }

      const response = await fetch(
        buildApiUrl(`appointments?${queryParams.toString()}`),
        {
          headers: tokenManager.createAuthHeaders({ "Content-Type": "application/json" }),
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          console.error("Unauthorized - please login again");
          return;
        }
        if (response.status === 404) {
          console.error("Appointments endpoint not found");
          setAppointments([]);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setAppointments(data.data || []);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchAvailableSlots = useCallback(async () => {
    try {
      if (!newAppointment.staffId || !newAppointment.appointmentDate) {
        setAvailableSlots([]);
        return;
      }

      const token = tokenManager.getAccessToken();
      if (!token) {
        console.error("No access token found");
        setAvailableSlots([]);
        return;
      }

      const response = await fetch(
        buildApiUrl(
          `appointments/available-slots?staffId=${newAppointment.staffId}&date=${newAppointment.appointmentDate}`,
        ),
        {
          headers: tokenManager.createAuthHeaders({ "Content-Type": "application/json" }),
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          console.error("Unauthorized - please login again");
          setAvailableSlots([]);
          return;
        }
        if (response.status === 404) {
          console.error("Available slots endpoint not found");
          setAvailableSlots([]);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        setAvailableSlots(Array.isArray(data.data) ? data.data : []);
      } else {
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
      setAvailableSlots([]);
    }
  }, [newAppointment.staffId, newAppointment.appointmentDate]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    if (newAppointment.staffId && newAppointment.appointmentDate) {
      fetchAvailableSlots();
    }
  }, [newAppointment.staffId, newAppointment.appointmentDate, fetchAvailableSlots]);

  const createAppointment = async () => {
    try {
      if (
        !newAppointment.title ||
        !newAppointment.appointmentDate ||
        !newAppointment.startTime ||
        !newAppointment.staffId
      ) {
        alert(
          "يرجى ملء جميع الحقول المطلوبة (العنوان، التاريخ، الوقت، الموظف)",
        );
        return;
      }

      if (!newAppointment.customerName) {
        alert(i18n.t("Appointments.please_name_4ff9"));
        return;
      }

      const token = tokenManager.getAccessToken();
      if (!token) {
        alert(i18n.t("Appointments.msg_6355"));
        return;
      }

      // Prepare appointment data - remove empty customerId
      const appointmentData = {
        ...newAppointment,
        customerId:
          newAppointment.customerId &&
          newAppointment.customerId.trim() !== "" &&
          newAppointment.customerId !== "1" &&
          newAppointment.customerId !== "0"
            ? newAppointment.customerId
            : undefined,
        staffId: newAppointment.staffId || undefined,
      };

      // Remove undefined values
      Object.keys(appointmentData).forEach((key) => {
        if (
          (appointmentData as any)[key] === undefined ||
          (appointmentData as any)[key] === ""
        ) {
          delete (appointmentData as any)[key];
        }
      });

      const response = await fetch(buildApiUrl("appointments"), {
        method: "POST",
        headers: tokenManager.createAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert(i18n.t("Appointments.msg_54f2"));
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }

      const data = await response.json();
      if (data.success) {
        fetchAppointments();
        setShowCreateModal(false);
        setAvailableSlots([]);
        setNewAppointment(INITIAL_NEW_APPOINTMENT);
        alert(i18n.t("Appointments.msg_9ec8"));
      } else {
        alert(data.error || data.message || i18n.t("Appointments.msg_0e7d"));
      }
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      alert(error.message || "فشل في حجز الموعد");
    }
  };

  const updateAppointmentStatus = async (
    appointmentId: string,
    status: string,
    notes = "",
  ) => {
    try {
      const token = tokenManager.getAccessToken();
      if (!token) {
        alert(i18n.t("Appointments.msg_6355"));
        return;
      }

      const response = await fetch(
        buildApiUrl(`appointments/${appointmentId}/status`),
        {
          method: "PUT",
          headers: tokenManager.createAuthHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ status, notes }),
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          alert(i18n.t("Appointments.msg_54f2"));
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }

      const data = await response.json();
      if (data.success) {
        fetchAppointments();
        if (selectedAppointment && selectedAppointment.id === appointmentId) {
          setSelectedAppointment(data.data);
        }
        alert(i18n.t("Appointments.success_update_status_c132"));
      } else {
        alert(
          data.error || data.message || i18n.t("Appointments.failed_update_fa54"),
        );
      }
    } catch (error: any) {
      console.error("Error updating appointment status:", error);
      alert(error.message || "فشل في تحديث حالة الموعد");
    }
  };

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  return {
    appointments,
    loading,
    filters,
    setFilters,
    resetFilters,
    selectedAppointment,
    setSelectedAppointment,
    showAppointmentModal,
    setShowAppointmentModal,
    showCreateModal,
    setShowCreateModal,
    availableSlots,
    newAppointment,
    setNewAppointment,
    fetchAppointments,
    createAppointment,
    updateAppointmentStatus,
  };
};
