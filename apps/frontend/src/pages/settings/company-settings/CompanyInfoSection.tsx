import React from "react";
import { BuildingOfficeIcon } from "@heroicons/react/24/outline";
import i18n from "../../../i18n";
import { CompanyRecord, parseCompanySettings } from "./types";
import { CompanySlugEditor } from "./CompanySlugEditor";

interface CompanyInfoSectionProps {
  company: CompanyRecord | null;
  companyIdFallback?: string;
  editingName: boolean;
  setEditingName: (editing: boolean) => void;
  companyName: string;
  setCompanyName: (name: string) => void;
  savingName: boolean;
  handleCompanyNameSave: () => void;
  editingSlug: boolean;
  setEditingSlug: (editing: boolean) => void;
  slug: string;
  setSlug: (slug: string) => void;
  savingSlug: boolean;
  handleSlugSave: () => void;
  editingDescription: boolean;
  setEditingDescription: (editing: boolean) => void;
  companyDescription: string;
  setCompanyDescription: (desc: string) => void;
  savingDescription: boolean;
  handleCompanyDescriptionSave: () => void;
  customerRegisterUrl: string | null;
}

export const CompanyInfoSection: React.FC<CompanyInfoSectionProps> = ({
  company,
  companyIdFallback,
  editingName,
  setEditingName,
  companyName,
  setCompanyName,
  savingName,
  handleCompanyNameSave,
  editingSlug,
  setEditingSlug,
  slug,
  setSlug,
  savingSlug,
  handleSlugSave,
  editingDescription,
  setEditingDescription,
  companyDescription,
  setCompanyDescription,
  savingDescription,
  handleCompanyDescriptionSave,
  customerRegisterUrl,
}) => {
  const [copiedCode, setCopiedCode] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState(false);

  const handleCopyCode = () => {
    if (!company?.publicCode) return;
    navigator.clipboard.writeText(company.publicCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyId = () => {
    const idVal = company?.id || companyIdFallback || "";
    if (!idVal) return;
    navigator.clipboard.writeText(idVal);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        معلومات الشركة
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {editingName ? (
            <label
              htmlFor="company-name-input"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              اسم الشركة
            </label>
          ) : (
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              اسم الشركة
            </span>
          )}
          {editingName ? (
            <div className="mt-1 flex items-center space-x-2 space-x-reverse">
              <input
                id="company-name-input"
                name="companyName"
                type="text"
                autoComplete="organization"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="اسم الشركة (يفضل بالإنجليزية)"
                disabled={savingName}
              />
              <p className="mt-1 text-xs text-gray-500">
                اسم الشركة بالإنجليزية يسهل توليد رابط المتجر تلقائياً
              </p>
              <button
                type="button"
                onClick={handleCompanyNameSave}
                disabled={savingName || !companyName.trim()}
                className="px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {savingName ? "حفظ..." : "حفظ"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingName(false);
                  setCompanyName(company?.name || "");
                }}
                disabled={savingName}
                className="px-3 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:cursor-not-allowed"
              >
                إلغاء
              </button>
            </div>
          ) : (
            <div className="mt-1 flex items-center justify-between">
              <p className="text-lg text-gray-900 dark:text-white">
                {company?.name}
              </p>
              <button
                type="button"
                onClick={() => setEditingName(true)}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium"
              >
                تعديل
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Slug Setting (Full Width) */}
      <CompanySlugEditor
        slug={slug}
        setSlug={setSlug}
        editingSlug={editingSlug}
        setEditingSlug={setEditingSlug}
        savingSlug={savingSlug}
        handleSlugSave={handleSlugSave}
        companySlug={company?.slug}
        companyName={companyName}
      />

      {/* Company Public Code & Technical ID */}
      <div className="col-span-1 md:col-span-2 border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          معرف الشركة (Company Code){" "}
          <span className="text-xs text-gray-500 font-normal">
            - شاركه مع الدعم أو الشركات الأخرى
          </span>
        </span>
        <div className="mt-1 flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <div
            className="flex items-center text-gray-700 dark:text-gray-300 font-mono text-sm dir-ltr tabular-nums"
            style={{ direction: "ltr" }}
          >
            <BuildingOfficeIcon className="h-4 w-4 ml-2 shrink-0" />
            {company?.publicCode || "—"}
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            disabled={!company?.publicCode}
            className={`mr-auto text-sm font-medium shrink-0 ${
              !company?.publicCode
                ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                : "text-indigo-600 dark:text-indigo-400 hover:text-indigo-800"
            }`}
            title="نسخ الرمز"
          >
            {copiedCode ? "تم النسخ" : "نسخ"}
          </button>
        </div>
        <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-mono">
          <span>
            المعرف التقني:{" "}
            <span title="Company.id — internal only" className="select-all">
              {company?.id || companyIdFallback || "—"}
            </span>
          </span>
          {(company?.id || companyIdFallback) && (
            <button
              type="button"
              onClick={handleCopyId}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline text-xs"
              title="نسخ المعرف التقني"
            >
              {copiedId ? "تم النسخ" : "نسخ"}
            </button>
          )}
        </div>
      </div>

      {/* Meta Description */}
      <div className="col-span-1 md:col-span-2 border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="company-description-input"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            وصف الشركة (Meta Description)
          </label>
          {!editingDescription && (
            <button
              onClick={() => setEditingDescription(true)}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium"
              type="button"
            >
              تعديل
            </button>
          )}
        </div>

        {editingDescription ? (
          <div className="space-y-2">
            <textarea
              id="company-description-input"
              name="companyDescription"
              rows={4}
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="اكتب وصف الشركة الذي يظهر كـ fallback في معاينات فيسبوك ومحركات البحث..."
              disabled={savingDescription}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              هذا الوصف يُستخدم تلقائيًا كخطة بديلة في الـ SEO إذا لم يتم
              ضبط وصف مخصص داخل إعدادات SEO للمتجر.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCompanyDescriptionSave}
                disabled={savingDescription}
                className="px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
                type="button"
              >
                {savingDescription ? "حفظ..." : "حفظ"}
              </button>
              <button
                onClick={() => {
                  setEditingDescription(false);
                  const parsedSettings = parseCompanySettings(company?.settings);
                  setCompanyDescription(
                    typeof parsedSettings.description === "string"
                      ? parsedSettings.description
                      : "",
                  );
                }}
                disabled={savingDescription}
                className="px-3 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 disabled:cursor-not-allowed"
                type="button"
              >
                إلغاء
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {companyDescription?.trim()
                ? companyDescription
                : "لا يوجد وصف محفوظ للشركة حالياً."}
            </p>
          </div>
        )}
      </div>

      {/* Customer Register URL */}
      <div className="col-span-1 md:col-span-2 border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
        <label
          htmlFor="customer-register-url"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          تسجيل دخول العميل (واتساب OTP)
        </label>

        {!customerRegisterUrl ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            لا يمكن تحديد الشركة حالياً
          </p>
        ) : (
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <input
              id="customer-register-url"
              name="customerRegisterUrl"
              value={customerRegisterUrl}
              readOnly
              aria-readonly="true"
              autoComplete="off"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-900/50 text-gray-800 dark:text-gray-200 text-sm font-mono dir-ltr"
              style={{ direction: "ltr" }}
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.open(customerRegisterUrl, "_blank")}
                className="px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
              >
                فتح
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(customerRegisterUrl);
                    alert(i18n.t("companySettings.msg_005a"));
                  } catch (e) {
                    alert(i18n.t("companySettings.msg_bcf1"));
                  }
                }}
                className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-medium rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                نسخ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
