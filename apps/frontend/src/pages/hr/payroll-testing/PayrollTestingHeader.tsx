import React from "react";
import { Calculator } from "lucide-react";

export const PayrollTestingHeader: React.FC = () => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold mb-2 flex items-center gap-2 text-slate-900 dark:text-white">
        <Calculator className="h-6 w-6 text-indigo-600" />
        وحدة اختبار الرواتب الشاملة
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        هذه الوحدة تسمح لمسؤولي الموارد البشرية بإجراء اختبارات شاملة لنظام حساب
        الرواتب باستخدام بيانات الموظفين الفعلية.
      </p>
    </div>
  );
};
