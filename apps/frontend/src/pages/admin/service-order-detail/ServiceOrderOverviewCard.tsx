import React from "react";
import { FileText } from "lucide-react";

interface ServiceOrderOverviewCardProps {
  order: any;
}

export const ServiceOrderOverviewCard: React.FC<ServiceOrderOverviewCardProps> = ({
  order,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-700/60">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 flex items-center justify-center text-2xl font-bold">
            {order.service?.icon || "📋"}
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              {order.service?.name || "خدمة مخصصة"}
            </h2>
            <p className="text-xs text-gray-400">
              تصنيف الخدمة: {order.service?.category || "عام"}
            </p>
          </div>
        </div>

        <div className="text-left">
          <span className="text-xs text-gray-400 block">السعر الإجمالي</span>
          <span className="text-base sm:text-lg font-bold text-primary-600 dark:text-primary-400 tabular-nums">
            {order.payment?.totalAmount || order.service?.price || 0} ج.م
          </span>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          متطلبات ووصف العميل للخدمة:
        </h3>
        {order.description ? (
          <div className="p-3.5 bg-gray-50 dark:bg-gray-900/40 rounded-xl text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap border border-gray-100 dark:border-gray-800">
            {order.description}
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">
            لم يقم العميل بإدخال وصف إضافي.
          </p>
        )}
      </div>
    </div>
  );
};
