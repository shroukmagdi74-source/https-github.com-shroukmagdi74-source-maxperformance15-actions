import React from "react";
import { BuildingOfficeIcon, GlobeAltIcon } from "@heroicons/react/24/outline";

interface CompanyLogoSectionProps {
  logoPreview: string | null;
  uploadingLogo: boolean;
  handleLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CompanyLogoSection: React.FC<CompanyLogoSectionProps> = ({
  logoPreview,
  uploadingLogo,
  handleLogoUpload,
}) => {
  return (
    <>
      {/* Logo Upload Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          لوجو الشركة
        </h3>
        <div className="flex items-start space-x-4 space-x-reverse">
          {/* Logo Preview */}
          <div className="flex-shrink-0">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Company Logo"
                className="h-24 w-24 rounded-lg object-cover border-2 border-gray-200 dark:border-gray-700"
              />
            ) : (
              <div className="h-24 w-24 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                <BuildingOfficeIcon className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div className="flex-1">
            <label
              htmlFor="company-logo-upload"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              رفع لوجو جديد
            </label>
            <div className="flex items-center">
              <label
                htmlFor="company-logo-upload"
                className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus-within:outline-none"
              >
                <span className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  {uploadingLogo ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 ml-2"></div>
                      جاري الرفع...
                    </>
                  ) : (
                    <>
                      <svg
                        className="ml-2 h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                      اختر صورة
                    </>
                  )}
                </span>
                <input
                  id="company-logo-upload"
                  name="companyLogo"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo}
                />
              </label>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            PNG, JPG, GIF حتى 5MB
          </p>
        </div>
      </div>

      {/* Custom Domain Redirect Section */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg shrink-0">
            <GlobeAltIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              إعدادات الدومين المخصص انتقلت لمكان جديد!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              لقد قمنا بتحسين تجربة ربط الدومينات المخصصة وتوفير شرح مفصل في
              صفحة مستقلة لضمان ربط متجرك بأمان وسهولة.
            </p>
            <div className="flex items-center gap-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
                تجدها الآن في القائمة الجانبية تحت مسمى &quot;الدومين المخصص&quot;.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
