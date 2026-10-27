import React from "react";
import {
  MerchantProfileFormData,
  ShippingCompanyOption,
  WarehouseOption,
} from "./types";

interface MerchantProfileFormProps {
  isDark: boolean;
  isEditMode: boolean;
  formData: MerchantProfileFormData;
  setFormData: React.Dispatch<React.SetStateAction<MerchantProfileFormData>>;
  warehouses: WarehouseOption[];
  shippingCompanies: ShippingCompanyOption[];
  optionsLoading: boolean;
  saving: boolean;
  merchantId: string;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const MerchantProfileForm: React.FC<MerchantProfileFormProps> = ({
  isDark,
  isEditMode,
  formData,
  setFormData,
  warehouses,
  shippingCompanies,
  optionsLoading,
  saving,
  onSubmit,
  onCancel,
}) => {
  const cardClass = isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
  const inputClass = `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition ${
    isDark
      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
      : "bg-white border-gray-300 text-gray-900"
  }`;

  return (
    <div className={`rounded-lg border shadow-sm p-6 ${cardClass}`}>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              اسم التاجر
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={inputClass}
              disabled={!isEditMode}
              required
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={inputClass}
              disabled={!isEditMode}
              required
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              الهاتف
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={`${inputClass} tabular-nums`}
              disabled={!isEditMode}
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              نسبة العمولة (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.commissionRate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  commissionRate: Number(e.target.value),
                })
              }
              className={`${inputClass} tabular-nums`}
              disabled={!isEditMode}
              required
            />
          </div>
        </div>

        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            العنوان
          </label>
          <textarea
            rows={3}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className={inputClass}
            disabled={!isEditMode}
          />
        </div>

        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Webhook URL
          </label>
          <input
            type="url"
            value={formData.webhookUrl}
            onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
            className={inputClass}
            disabled={!isEditMode}
          />
        </div>

        <div
          className={`rounded-lg border p-4 ${
            isDark
              ? "border-amber-700 bg-amber-900/20"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          <h3
            className={`font-semibold ${isDark ? "text-amber-200" : "text-amber-900"}`}
          >
            إعدادات التشغيل داخل نظام الأفليت
          </h3>
          <p
            className={`mt-1 text-sm ${isDark ? "text-amber-100/80" : "text-amber-800"}`}
          >
            هذه القيم ملك الشركة: تحدد من أين يخرج الطلب، وأي شركة شحن
            تستخدم، وهل حساب التاجر مفعل أم قيد المراجعة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              طريقة تنفيذ الطلبات
            </label>
            <select
              value={formData.fulfillmentMode}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  fulfillmentMode: e.target.value,
                  defaultWarehouseId:
                    e.target.value === "COMPANY_WAREHOUSE"
                      ? formData.defaultWarehouseId
                      : "",
                })
              }
              className={inputClass}
              disabled={!isEditMode}
            >
              <option value="MERCHANT">التاجر يشحن من مخزونه</option>
              <option value="COMPANY_WAREHOUSE">
                الشركة تنفذ من مخزنها
              </option>
            </select>
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              المخزن الافتراضي
            </label>
            <select
              value={formData.defaultWarehouseId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  defaultWarehouseId: e.target.value,
                })
              }
              className={inputClass}
              disabled={
                !isEditMode ||
                optionsLoading ||
                formData.fulfillmentMode !== "COMPANY_WAREHOUSE"
              }
            >
              <option value="">
                {formData.fulfillmentMode === "COMPANY_WAREHOUSE"
                  ? "اختر مخزن الشركة"
                  : "غير مطلوب عند شحن التاجر"}
              </option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                  {warehouse.location ? ` - ${warehouse.location}` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            شركة الشحن الافتراضية
          </label>
          <select
            value={formData.defaultShippingCompanyId}
            onChange={(e) =>
              setFormData({
                ...formData,
                defaultShippingCompanyId: e.target.value,
              })
            }
            className={inputClass}
            disabled={!isEditMode || optionsLoading}
          >
            <option value="">بدون شركة شحن افتراضية</option>
            {shippingCompanies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <label className="inline-flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.autoFulfill}
              onChange={(e) =>
                setFormData({ ...formData, autoFulfill: e.target.checked })
              }
              disabled={!isEditMode}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className={isDark ? "text-gray-300" : "text-gray-700"}>
              تفعيل الوفاء التلقائي للطلبات
            </span>
          </label>

          <label className="inline-flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              disabled={!isEditMode}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className={isDark ? "text-gray-300" : "text-gray-700"}>
              التاجر نشط
            </span>
          </label>
        </div>

        {isEditMode && (
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
            >
              {saving ? "جارٍ الحفظ..." : "حفظ التعديلات"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className={`px-6 py-3 border rounded-lg transition font-medium ${
                isDark
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              إلغاء
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
