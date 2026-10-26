import React from "react";
import { useDateFormat } from "../../hooks/useDateFormat";
import {
  useAppointments,
  AppointmentsHeader,
  AppointmentsFilters,
  AppointmentsTable,
  AppointmentDetailsModal,
  CreateAppointmentModal,
} from "./components";

export * from "./components";

export const Appointments: React.FC = () => {
  const { formatDate } = useDateFormat();
  const {
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
    createAppointment,
    updateAppointmentStatus,
  } = useAppointments();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400" />
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 bg-white dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <AppointmentsHeader
        onOpenCreateModal={() => setShowCreateModal(true)}
      />

      {/* Filters */}
      <AppointmentsFilters
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={resetFilters}
      />

      {/* Appointments Table */}
      <AppointmentsTable
        appointments={appointments}
        formatDate={formatDate}
        onViewAppointment={(appointment) => {
          setSelectedAppointment(appointment);
          setShowAppointmentModal(true);
        }}
        onUpdateStatus={updateAppointmentStatus}
      />

      {/* Appointment Details Modal */}
      <AppointmentDetailsModal
        isOpen={showAppointmentModal}
        appointment={selectedAppointment}
        formatDate={formatDate}
        onClose={() => setShowAppointmentModal(false)}
        onUpdateStatus={updateAppointmentStatus}
      />

      {/* Create Appointment Modal */}
      <CreateAppointmentModal
        isOpen={showCreateModal}
        newAppointment={newAppointment}
        availableSlots={availableSlots}
        onAppointmentChange={setNewAppointment}
        onSubmit={createAppointment}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

export default Appointments;
