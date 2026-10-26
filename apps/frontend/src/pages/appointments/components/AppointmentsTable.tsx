import React from "react";
import {
  CalendarDaysIcon,
  EyeIcon,
  UserIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { Appointment } from "./types";
import {
  getStatusColor,
  getStatusIcon,
  getStatusText,
  getTypeText,
} from "./helpers";

interface AppointmentsTableProps {
  appointments: Appointment[];
  formatDate: (date: string) => string;
  onViewAppointment: (appointment: Appointment) => void;
  onUpdateStatus: (id: string, status: string) => void;
}

export const AppointmentsTable: React.FC<AppointmentsTableProps> = ({
  appointments,
  formatDate,
  onViewAppointment,
  onUpdateStatus,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                العنوان
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                العميل
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                الموظف
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                التاريخ والوقت
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                النوع
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                الحالة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                المكان
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {appointments.map((appointment) => (
              <tr
                key={appointment.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {appointment.title}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {appointment.description?.substring(0, 50) || ""}...
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <UserIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {appointment.customerName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {appointment.customerPhone}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {appointment.staffName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {formatDate(appointment.appointmentDate)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 tabular-nums">
                    {appointment.startTime} - {appointment.endTime}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                    {getTypeText(appointment.type)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}
                  >
                    {getStatusIcon(appointment.status)}
                    <span className="mr-1">
                      {getStatusText(appointment.status)}
                    </span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900 dark:text-gray-100">
                    <MapPinIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-1" />
                    {appointment.location}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2 space-x-reverse">
                    <button
                      onClick={() => onViewAppointment(appointment)}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors"
                      title="عرض التفاصيل"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    {appointment.status === "pending" && (
                      <button
                        onClick={() =>
                          onUpdateStatus(appointment.id, "confirmed")
                        }
                        className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 transition-colors"
                      >
                        تأكيد
                      </button>
                    )}
                    {appointment.status === "confirmed" && (
                      <button
                        onClick={() =>
                          onUpdateStatus(appointment.id, "completed")
                        }
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                      >
                        إكمال
                      </button>
                    )}
                    {(appointment.status === "pending" ||
                      appointment.status === "confirmed") && (
                      <button
                        onClick={() =>
                          onUpdateStatus(appointment.id, "cancelled")
                        }
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                      >
                        إلغاء
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {appointments.length === 0 && (
        <div className="text-center py-12">
          <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            لا توجد مواعيد
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            لم يتم العثور على مواعيد تطابق المعايير المحددة.
          </p>
        </div>
      )}
    </div>
  );
};
