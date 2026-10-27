import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon, PencilIcon } from "@heroicons/react/24/outline";

interface MerchantProfileHeaderProps {
  isDark: boolean;
  isEditMode: boolean;
  merchantName: string;
  merchantId: string;
  onBack: () => void;
}

export const MerchantProfileHeader: React.FC<MerchantProfileHeaderProps> = ({
  isDark,
  isEditMode,
  merchantName,
  merchantId,
  onBack,
}) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <button
          type="button"
          onClick={onBack}
          className={`inline-flex items-center gap-2 mb-3 text-sm ${
            isDark ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <ArrowLeftIcon className="h-4 w-4" />
          العودة إلى قائمة التجار
        </button>
        <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
          {isEditMode ? "تعديل بيانات التاجر" : merchantName}
        </h1>
        <p className={`mt-2 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
          {isEditMode
            ? "حدّث بيانات التاجر وإعدادات الدروب شيبنج المرتبطة به."
            : "عرض بيانات التاجر والمنتجات المرتبطة به."}
        </p>
      </div>

      {!isEditMode && (
        <div className="flex flex-wrap gap-2">
          {[
            ["/orders", "الطلبات الموحدة"],
            ["/inventory", "المخزون الموحد"],
            ["/products", "المنتجات"],
          ].map(([to, label]) => (
            <Link
              key={to}
              to={to}
              className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-bold transition ${
                isDark
                  ? "bg-gray-800 text-gray-100 hover:bg-gray-700"
                  : "bg-white text-gray-800 shadow-sm hover:bg-gray-50"
              }`}
            >
              {label}
            </Link>
          ))}
          <Link
            to={`/merchants/${merchantId}/edit`}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <PencilIcon className="h-5 w-5" />
            تعديل
          </Link>
        </div>
      )}
    </div>
  );
};
