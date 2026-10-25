import React from "react";
import {
  AssetFormCategoryOption,
  AssetFormData,
  AssetFormEmployeeOption,
} from "./types";

interface AssetFormBasicAndLocationSectionProps {
  formData: AssetFormData;
  onFormDataChange: (data: AssetFormData) => void;
  categories: AssetFormCategoryOption[];
  employees: AssetFormEmployeeOption[];
  loadingEmployees: boolean;
}

export const AssetFormBasicAndLocationSection: React.FC<
  AssetFormBasicAndLocationSectionProps
> = ({
  formData,
  onFormDataChange,
  categories,
  employees,
  loadingEmployees,
}) => {
  return (
    <>
      {/* Section 1: Basic Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-gray-700 flex items-center">
          <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 w-8 h-8 rounded-lg inline-flex items-center justify-center mr-2 ml-2 font-mono tabular-nums">
            1
          </span>
          البيانات الأساسية للأصل
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              اسم الأصل <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2.5 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition"
              value={formData.name}
              onChange={(e) =>
                onFormDataChange({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              التصنيف
            </label>
            <select
              className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2.5 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition"
              value={formData.categoryId}
              onChange={(e) =>
                onFormDataChange({ ...formData, categoryId: e.target.value })
              }
            >
              <option value="">اختر التصنيف</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              كود الأصل (Tag ID)
            </label>
            <input
              type="text"
              className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2.5 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition font-mono tabular-nums"
              value={formData.code}
              onChange={(e) =>
                onFormDataChange({ ...formData, code: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              الرقم التسلسلي (S/N)
            </label>
            <input
              type="text"
              className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2.5 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition font-mono tabular-nums"
              value={formData.serialNumber}
              onChange={(e) =>
                onFormDataChange({ ...formData, serialNumber: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              الموديل
            </label>
            <input
              type="text"
              className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2.5 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition"
              value={formData.model}
              onChange={(e) =>
                onFormDataChange({ ...formData, model: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              الماركة (Brand)
            </label>
            <input
              type="text"
              className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2.5 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition"
              value={formData.brand}
              onChange={(e) =>
                onFormDataChange({ ...formData, brand: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* Section 2: Status & Location */}
      <div className="bg-white dark:bg-gray-800 rounded-lg">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-gray-700 flex items-center">
          <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 w-8 h-8 rounded-lg inline-flex items-center justify-center mr-2 ml-2 font-mono tabular-nums">
            2
          </span>
          الحالة والموقع
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              الحالة الفيزيائية
            </label>
            <select
              className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2.5 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition"
              value={formData.condition}
              onChange={(e) =>
                onFormDataChange({ ...formData, condition: e.target.value })
              }
            >
              <option value="NEW">جديد</option>
              <option value="GOOD">جيد</option>
              <option value="FAIR">مقبول</option>
              <option value="POOR">سيء</option>
              <option value="DAMAGED">تالف</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              الموقع الحالي
            </label>
            <input
              type="text"
              className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2.5 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition"
              value={formData.location}
              onChange={(e) =>
                onFormDataChange({ ...formData, location: e.target.value })
              }
              placeholder="مثال: المكتب الرئيسي"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              تخصيص لموظف (اختياري)
            </label>
            <select
              className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2.5 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition"
              value={formData.assignedToId}
              onChange={(e) =>
                onFormDataChange({ ...formData, assignedToId: e.target.value })
              }
              disabled={loadingEmployees}
            >
              <option value="">
                {loadingEmployees
                  ? "جاري تحميل الموظفين..."
                  : "--- غير مخصص لموظف حالياً ---"}
              </option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} (
                  {emp.employeeNumber || "بدون رقم"})
                </option>
              ))}
            </select>
            {!loadingEmployees && employees.length === 0 && (
              <p className="mt-1 text-xs text-amber-500">
                لم يتم العثور على موظفين في سجلات النظام
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
