import React from "react";
import {
  CalendarDaysIcon,
  BellAlertIcon,
  ChartBarIcon,
  ShieldExclamationIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { MaintenanceAlertsData, MaintenanceRecord } from "./types";

interface MaintenanceAlertsAndHistoryTableProps {
  alerts: MaintenanceAlertsData;
  history: MaintenanceRecord[];
  formatPrice: (val: number | string) => string;
}

export const MaintenanceAlertsAndHistoryTable: React.FC<
  MaintenanceAlertsAndHistoryTableProps
> = ({ alerts, history, formatPrice }) => {
  return (
    <>
      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Due Warranties */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-red-100 dark:border-red-900/20 overflow-hidden shadow-sm">
          <div className="bg-red-50 dark:bg-red-900/10 px-6 py-4 border-b border-red-100 dark:border-red-900/20 flex items-center gap-3">
            <ShieldExclamationIcon className="h-5 w-5 text-red-600" />
            <h3 className="font-black text-red-900 dark:text-red-400">
              تنبيهات انتهاء الضمان (خلال 30 يوم)
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {alerts.expiringWarranties.length === 0 ? (
              <p className="text-center py-8 text-gray-400 italic text-sm">
                لا توجد ضمانات قاربت على الانتهاء
              </p>
            ) : (
              alerts.expiringWarranties.map((alert, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-red-50/30 dark:bg-red-900/5 rounded-2xl border border-red-50 dark:border-red-900/10 transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
                      <BellAlertIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                        {alert.name}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-mono tabular-nums">
                        {alert.code}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] text-gray-400 block mb-1">
                      تاريخ الانتهاء
                    </span>
                    <span className="text-xs font-black text-red-600 font-mono tabular-nums">
                      {alert.endDate
                        ? format(new Date(alert.endDate), "yyyy/MM/dd")
                        : "-"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Maintenance */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-amber-100 dark:border-amber-900/20 overflow-hidden shadow-sm">
          <div className="bg-amber-50 dark:bg-amber-900/10 px-6 py-4 border-b border-amber-100 dark:border-amber-900/20 flex items-center gap-3">
            <CalendarDaysIcon className="h-5 w-5 text-amber-600" />
            <h3 className="font-black text-amber-900 dark:text-amber-400">
              مواعيد الصيانة القادمة
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {alerts.upcomingMaintenance.length === 0 ? (
              <p className="text-center py-8 text-gray-400 italic text-sm">
                لا توجد صيانات مجدولة حالياً
              </p>
            ) : (
              alerts.upcomingMaintenance.map((alert, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-amber-50/30 dark:bg-amber-900/5 rounded-2xl border border-amber-50 dark:border-amber-900/10 transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                      <ClockIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                        {alert.name}
                      </h4>
                      <p className="text-[10px] font-bold text-amber-600 uppercase">
                        {alert.maintenanceType}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] text-gray-400 block mb-1">
                      تاريخ الصيانة
                    </span>
                    <span className="text-xs font-black text-gray-900 dark:text-white font-mono tabular-nums">
                      {alert.scheduledDate
                        ? format(new Date(alert.scheduledDate), "yyyy/MM/dd")
                        : "-"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Maintenance History Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
            <ChartBarIcon className="h-6 w-6 text-indigo-600" />
            سجل العمليات الأخير
          </h3>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-5">الأصل</th>
                <th className="px-6 py-5">النوع</th>
                <th className="px-6 py-5">التكلفة</th>
                <th className="px-6 py-5">التاريخ</th>
                <th className="px-6 py-5">الحالة</th>
                <th className="px-6 py-5">بواسطة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {history.map((rec) => (
                <tr
                  key={rec.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group"
                >
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 dark:text-white text-sm">
                        {rec.asset?.name}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono tabular-nums">
                        {rec.asset?.code}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                        {rec.type}
                      </span>
                      <p className="text-[10px] text-gray-400 italic truncate max-w-[150px]">
                        {rec.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="font-black text-sm text-gray-900 dark:text-white font-mono tabular-nums">
                      {formatPrice(rec.cost)}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs font-bold text-gray-500 font-mono tabular-nums">
                      {format(new Date(rec.startDate), "yyyy/MM/dd")}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={`px-3 py-1 rounded-lg text-[10px] font-black border ${
                        rec.status === "COMPLETED"
                          ? "bg-green-100 text-green-700 border-green-200"
                          : rec.status === "SCHEDULED"
                            ? "bg-blue-100 text-blue-700 border-blue-200"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                      }`}
                    >
                      {rec.status === "COMPLETED" ? "مكتمل" : "مجدول"}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-500">
                    {rec.performedBy || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
