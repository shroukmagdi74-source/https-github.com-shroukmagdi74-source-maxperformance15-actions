import React from "react";
import { AffiliateSettingsData, parseNumberInput } from "./types";

interface AffiliateCommissionSectionProps {
  settings: AffiliateSettingsData;
  setSettings: React.Dispatch<React.SetStateAction<AffiliateSettingsData>>;
  isDark: boolean;
}

export const AffiliateCommissionSection: React.FC<
  AffiliateCommissionSectionProps
> = ({ settings, setSettings, isDark }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2
          className={`text-xl font-semibold border-b pb-2 ${
            isDark
              ? "text-white border-gray-700"
              : "text-gray-900 border-gray-200"
          }`}
        >
          إعدادات العمولة الافتراضية
        </h2>
        <p
          className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
        >
          هذه الإعدادات ستطبق تلقائياً على أي مسوق جديد يقوم بالتسجيل. يمكنك
          تعديل عمولة كل مسوق لاحقاً بشكل فردي.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              className={`block text-sm font-medium ${
                isDark ? "text-gray-300" : "text-gray-700"
              } mb-2`}
            >
              نوع العمولة للمسوق
            </label>
            <select
              value={settings.commissionType}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  commissionType: e.target.value,
                })
              }
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="PERCENTAGE">نسبة مئوية (%)</option>
              <option value="MARKUP">هامش ربح ثابت</option>
              <option value="FIXED">مبلغ ثابت لكل طلب</option>
              <option value="FIXED_PER_ITEM">مبلغ ثابت لكل قطعة</option>
            </select>
          </div>

          <div>
            <label
              className={`block text-sm font-medium ${
                isDark ? "text-gray-300" : "text-gray-700"
              } mb-2`}
            >
              {settings.commissionType === "PERCENTAGE"
                ? "النسبة للافتراضية للمسوق (%)"
                : "المبلغ الثابت الافتراضي للمسوق"}
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max={
                settings.commissionType === "PERCENTAGE"
                  ? 100
                  : 1000000
              }
              value={settings.commissionRate}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  commissionRate: parseNumberInput(
                    e.target.value,
                    settings.commissionRate,
                  ),
                })
              }
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />
          </div>
        </div>
      </div>

      {/* حالة احتساب العمولة */}
      <div
        className={`rounded-2xl border p-6 ${
          isDark
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-100"
        } shadow-sm`}
      >
        <h2
          className={`text-xl font-semibold ${
            isDark ? "text-white" : "text-gray-900"
          } mb-2`}
        >
          حالة احتساب العمولة
        </h2>
        <p
          className={`text-sm mb-6 ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
        >
          حدد في أي مرحلة من الطلب تتحسب عمولة المسوق تلقائياً.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              className={`block text-sm font-medium ${
                isDark ? "text-gray-300" : "text-gray-700"
              } mb-2`}
            >
              تحتسب العمولة عند
            </label>
            <select
              value={settings.commissionOnStatus}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  commissionOnStatus: e.target.value,
                })
              }
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="PENDING">فور إنشاء الطلب (PENDING)</option>
              <option value="CONFIRMED">تأكيد الطلب (CONFIRMED)</option>
              <option value="PROCESSING">جاري التجهيز (PROCESSING)</option>
              <option value="SHIPPED">تم الشحن (SHIPPED)</option>
              <option value="DELIVERED">تم التسليم (DELIVERED)</option>
            </select>
          </div>
          <div className="flex items-center">
            <p
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {settings.commissionOnStatus === "PENDING" &&
                "⚡ تتحسب العمولة فور إنشاء الطلب — مناسبة للمسوقين الموثوقين."}
              {settings.commissionOnStatus === "CONFIRMED" &&
                "🟢 تتحسب العمولة فور تأكيد الطلب — مناسبة للطلبات المدفوعة مسبقاً."}
              {settings.commissionOnStatus === "PROCESSING" &&
                "🔵 تتحسب العمولة عند بدء تجهيز الطلب."}
              {settings.commissionOnStatus === "SHIPPED" &&
                "📦 تتحسب العمولة عند شحن الطلب."}
              {settings.commissionOnStatus === "DELIVERED" &&
                "🚚 تتحسب العمولة عند تسليم الطلب للعميل — الخيار الأكثر أماناً."}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2
          className={`text-xl font-semibold border-b pb-2 pt-2 ${
            isDark
              ? "text-white border-gray-700"
              : "text-gray-900 border-gray-200"
          }`}
        >
          هامش ربح المنصة (بين التاجر والمسوق)
        </h2>
        <p
          className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
        >
          هذا الهامش سيتم إضافته تلقائياً على سعر التاجر ليكون هو "سعر
          التكلفة" الذي يراه المسوق.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              className={`block text-sm font-medium ${
                isDark ? "text-gray-300" : "text-gray-700"
              } mb-2`}
            >
              نوع ربح المنصة
            </label>
            <select
              value={settings.platformMarginType || "FIXED"}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  platformMarginType: e.target.value,
                })
              }
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="FIXED">مبلغ ثابت لكل قطعة</option>
              <option value="PERCENTAGE">
                نسبة مئوية من سعر التاجر (%)
              </option>
            </select>
          </div>

          <div>
            <label
              className={`block text-sm font-medium ${
                isDark ? "text-gray-300" : "text-gray-700"
              } mb-2`}
            >
              قيمة ربح المنصة
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max={
                settings.platformMarginType === "PERCENTAGE"
                  ? 1000
                  : 1000000
              }
              value={settings.platformMarginValue || 0}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  platformMarginValue: parseNumberInput(
                    e.target.value,
                    settings.platformMarginValue,
                  ),
                })
              }
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />
          </div>
        </div>

        <div>
          <label
            className={`block text-sm font-medium ${
              isDark ? "text-gray-300" : "text-gray-700"
            } mb-2`}
          >
            مدة الكوكيز (أيام)
          </label>
          <input
            type="number"
            min="1"
            max="365"
            value={settings.cookieDuration}
            onChange={(e) =>
              setSettings({
                ...settings,
                cookieDuration: parseNumberInput(
                  e.target.value,
                  settings.cookieDuration,
                ),
              })
            }
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              isDark
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          />
          <p
            className={`text-xs mt-1 ${
              isDark ? "text-gray-500" : "text-gray-500"
            }`}
          >
            الفترة التي يتم فيها احتساب العمولة للمسوق بعد زيارة العميل
            للرابط (الافتراضي 30 يوم).
          </p>
        </div>
      </div>
    </div>
  );
};
