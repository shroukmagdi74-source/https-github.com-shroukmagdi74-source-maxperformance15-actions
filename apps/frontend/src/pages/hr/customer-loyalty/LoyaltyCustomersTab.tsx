import React from "react";
import { Users, Search, Filter, Star, Eye, Edit } from "lucide-react";
import type { CustomerLoyaltyRecord } from "./types";
import {
  getProgramIcon,
  getTierIcon,
  getStatusColor,
  getStatusLabel,
} from "./helpers";

interface LoyaltyCustomersTabProps {
  customers: CustomerLoyaltyRecord[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  rawCustomersCount: number;
}

export const LoyaltyCustomersTab: React.FC<LoyaltyCustomersTabProps> = ({
  customers,
  searchQuery,
  onSearchChange,
  rawCustomersCount,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="البحث عن عميل..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <button
          type="button"
          className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
        >
          <Filter className="w-4 h-4" />
          <span>فلترة</span>
        </button>
      </div>

      {rawCustomersCount === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            لا يوجد عملاء مشتركون
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            سيظهر هنا العملاء المشتركون في برامج الولاء
          </p>
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            لا توجد نتائج مطابقة
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            جرب البحث باستخدام اسم أو بريد أو هاتف مختلف
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-right">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  العميل
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  البرنامج
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  النقاط الحالية
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  المستوى
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  آخر نشاط
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              {customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {customer.customer.firstName}{" "}
                        {customer.customer.lastName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {customer.customer.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getProgramIcon(customer.program.type)}
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {customer.program.nameAr || customer.program.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="font-bold text-gray-900 dark:text-white font-mono tabular-nums">
                        {customer.currentPoints.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {customer.tier ? (
                      <div className="flex items-center gap-2">
                        {getTierIcon(customer.tier.icon)}
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {customer.tier.nameAr || customer.tier.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(
                        customer.status,
                      )}`}
                    >
                      {getStatusLabel(customer.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono tabular-nums">
                    {new Date(customer.lastActivity).toLocaleDateString(
                      "ar-EG",
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        aria-label="عرض تفاصيل العميل"
                        className="p-1 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="تعديل العميل"
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
