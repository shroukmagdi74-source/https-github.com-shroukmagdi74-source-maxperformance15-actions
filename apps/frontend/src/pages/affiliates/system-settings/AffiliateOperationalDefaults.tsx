import React from "react";
import { AffiliateSettingsData, parseNumberInput } from "./types";

interface AffiliateOperationalDefaultsProps {
  settings: AffiliateSettingsData;
  setSettings: React.Dispatch<React.SetStateAction<AffiliateSettingsData>>;
  isDark: boolean;
}

export const AffiliateOperationalDefaults: React.FC<
  AffiliateOperationalDefaultsProps
> = ({ settings, setSettings, isDark }) => {
  return (
    <div className="space-y-4">
      <h2
        className={`text-xl font-semibold border-b pb-2 ${
          isDark
            ? "text-white border-gray-700"
            : "text-gray-900 border-gray-200"
        }`}
      >
        الضوابط الافتراضية للمسوق الجديد
      </h2>
      <p
        className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
      >
        هذه السياسات تطبق على أي مسوق جديد وقت التسجيل، ويمكن تعديلها لاحقًا
        لكل مسوق على حدة.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label
            className={`block text-sm font-medium ${
              isDark ? "text-gray-300" : "text-gray-700"
            } mb-2`}
          >
            الحد الأدنى الافتراضي للسحب
          </label>
          <input
            type="number"
            aria-label="الحد الأدنى الافتراضي للسحب"
            step="1"
            min="0"
            max="1000000"
            value={settings.defaultMinPayout}
            onChange={(e) =>
              setSettings({
                ...settings,
                defaultMinPayout: parseNumberInput(
                  e.target.value,
                  settings.defaultMinPayout,
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

        <div>
          <label
            className={`block text-sm font-medium ${
              isDark ? "text-gray-300" : "text-gray-700"
            } mb-2`}
          >
            مدة معالجة السحب (أيام)
          </label>
          <input
            type="number"
            aria-label="مدة معالجة السحب"
            step="1"
            min="1"
            max="60"
            value={settings.payoutSlaDays}
            onChange={(e) =>
              setSettings({
                ...settings,
                payoutSlaDays: parseNumberInput(
                  e.target.value,
                  settings.payoutSlaDays,
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
            المدة المستهدفة لمعالجة طلبات السحب قبل اعتبارها متأخرة.
          </p>
        </div>

        <div
          className={`rounded-lg border p-4 ${
            isDark
              ? "border-gray-700 bg-gray-800/50"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <p
            className={`text-sm font-medium ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            مسار الاعتماد الحالي
          </p>
          <p
            className={`mt-2 text-sm ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {settings.autoApproveAffiliates
              ? "التسجيلات الجديدة ستصبح نشطة مباشرة بدون انتظار مراجعة."
              : "التسجيلات الجديدة ستدخل حالة قيد المراجعة لحين تفعيلها من الإدارة."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label
          className={`flex items-center justify-between rounded-lg border p-4 ${
            isDark
              ? "border-gray-700 bg-gray-800/50"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <div>
            <p
              className={`font-medium ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              السماح بالطلبات المباشرة
            </p>
            <p
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              تمكين المسوق الجديد من إنشاء طلبات مباشرة بعد تفعيله
            </p>
          </div>
          <input
            type="checkbox"
            aria-label="السماح بالطلبات المباشرة"
            checked={settings.defaultCanCreateOrdersForOthers}
            onChange={(e) =>
              setSettings({
                ...settings,
                defaultCanCreateOrdersForOthers: e.target.checked,
              })
            }
            className="h-4 w-4"
          />
        </label>

        <label
          className={`flex items-center justify-between rounded-lg border p-4 ${
            isDark
              ? "border-gray-700 bg-gray-800/50"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <div>
            <p
              className={`font-medium ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              إظهار بيانات العملاء
            </p>
            <p
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              تحديد ما إذا كان المسوق الجديد يرى بيانات العملاء افتراضيًا
            </p>
          </div>
          <input
            type="checkbox"
            aria-label="إظهار بيانات العملاء"
            checked={settings.defaultCanViewCustomerData}
            onChange={(e) =>
              setSettings({
                ...settings,
                defaultCanViewCustomerData: e.target.checked,
              })
            }
            className="h-4 w-4"
          />
        </label>

        <label
          className={`flex items-center justify-between rounded-lg border p-4 ${
            isDark
              ? "border-gray-700 bg-gray-800/50"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <div>
            <p
              className={`font-medium ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              إلزام مستند اعتماد
            </p>
            <p
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              طلب مستند هوية أو اعتماد من كل مسوق جديد قبل إرسال الطلب
            </p>
          </div>
          <input
            type="checkbox"
            aria-label="إلزام مستند اعتماد"
            checked={settings.requireIdentityDocument}
            onChange={(e) =>
              setSettings({
                ...settings,
                requireIdentityDocument: e.target.checked,
              })
            }
            className="h-4 w-4"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            className={`block text-sm font-medium ${
              isDark ? "text-gray-300" : "text-gray-700"
            } mb-2`}
          >
            اسم مستند الاعتماد
          </label>
          <input
            type="text"
            aria-label="اسم مستند الاعتماد"
            value={settings.identityDocumentLabel}
            onChange={(e) =>
              setSettings({
                ...settings,
                identityDocumentLabel: e.target.value,
              })
            }
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              isDark
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900"
            }`}
            placeholder="مثال: صورة البطاقة أو السجل التجاري"
          />
          <p
            className={`text-xs mt-1 ${
              isDark ? "text-gray-500" : "text-gray-500"
            }`}
          >
            يظهر هذا الاسم في صفحة التسجيل العامة وشاشة مراجعة المسوقين.
          </p>
        </div>
      </div>
    </div>
  );
};
