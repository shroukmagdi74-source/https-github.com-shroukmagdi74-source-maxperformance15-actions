import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Appointment } from "./types";
import {
  getStatusColor,
  getStatusIcon,
  getStatusText,
  getTypeText,
} from "./helpers";

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  formatDate: (date: string) => string;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
}

export const AppointmentDetailsModal: React.FC<
  AppointmentDetailsModalProps
> = ({ isOpen, appointment, formatDate, onClose, onUpdateStatus }) => {
  if (!isOpen || !appointment) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-black dark:bg-opacity-70 transition-opacity"
          onClick={onClose}
        />
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full border border-gray-200 dark:border-gray-700">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                تفاصيل الموعد
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  العنوان
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {appointment.title}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  الوصف
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {appointment.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    العميل
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {appointment.customerName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {appointment.customerEmail}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {appointment.customerPhone}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    الموظف
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {appointment.staffName}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    التاريخ
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {formatDate(appointment.appointmentDate)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    الوقت
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 tabular-nums">
                    {appointment.startTime} - {appointment.endTime}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    النوع
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {getTypeText(appointment.type)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    الحالة
                  </label>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}
                  >
                    {getStatusIcon(appointment.status)}
                    <span className="mr-1">
                      {getStatusText(appointment.status)}
                    </span>
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  المكان
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {appointment.location}
                </p>
              </div>
              {appointment.meetingLink && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    رابط الاجتماع
                  </label>
                  <a
                    href={appointment.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {appointment.meetingLink}
                  </a>
                </div>
              )}
              {appointment.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    ملاحظات
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {appointment.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
            {appointment.status === "pending" && (
              <button
                onClick={() => {
                  onUpdateStatus(appointment.id, "confirmed");
                  onClose();
                }}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 dark:bg-green-500 text-base font-medium text-white hover:bg-green-700 dark:hover:bg-green-600 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
              >
                تأكيد الموعد
              </button>
            )}
            {appointment.status === "confirmed" && (
              <button
                onClick={() => {
                  onUpdateStatus(appointment.id, "completed");
                  onClose();
                }}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 dark:bg-blue-500 text-base font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-600 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
              >
                إكمال الموعد
              </button>
            )}
            {(appointment.status === "pending" ||
              appointment.status === "confirmed") && (
              <button
                onClick={() => {
                  onUpdateStatus(appointment.id, "cancelled");
                  onClose();
                }}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 dark:bg-red-500 text-base font-medium text-white hover:bg-red-700 dark:hover:bg-red-600 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
              >
                إلغاء الموعد
              </button>
            )}
            <button
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
