import React from "react";

export interface OrderConfirmationCallCycleCardProps {
  maxCallsNoAnswer: number;
  intervalMinutes: number;
  onChangeMaxCalls: (val: number) => void;
  onChangeIntervalMinutes: (val: number) => void;
}

export function OrderConfirmationCallCycleCard({
  maxCallsNoAnswer,
  intervalMinutes,
  onChangeMaxCalls,
  onChangeIntervalMinutes,
}: OrderConfirmationCallCycleCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 space-y-4">
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white">دورة مكالمات التأكيد</h3>
        <p className="text-xs text-gray-500">
          تحكم في عدد محاولات الاتصال والوقت بين المحاولات لطلبات "لا يوجد رد".
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
            أقصى عدد محاولات بدون رد
          </label>
          <input
            type="number"
            min={0}
            value={maxCallsNoAnswer}
            onChange={(e) => onChangeMaxCalls(Math.max(0, Math.floor(Number(e.target.value))))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm font-mono tabular-nums"
          />
          <p className="mt-1 text-xs text-gray-500">
            بعد هذا العدد يتوقف عرض زر "لا رد" لهذا الطلب. صفر = غير محدود.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
            الوقت بين محاولات الاتصال (بالدقائق)
          </label>
          <input
            type="number"
            min={0}
            value={intervalMinutes}
            onChange={(e) => onChangeIntervalMinutes(Math.max(0, Math.floor(Number(e.target.value))))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm font-mono tabular-nums"
          />
          <p className="mt-1 text-xs text-gray-500">
            يمنع تسجيل محاولة جديدة قبل مرور هذه المدة. صفر = بدون انتظار.
          </p>
        </div>
      </div>
    </div>
  );
}