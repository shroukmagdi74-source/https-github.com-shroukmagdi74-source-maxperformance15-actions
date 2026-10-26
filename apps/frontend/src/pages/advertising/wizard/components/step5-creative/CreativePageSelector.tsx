import React from "react";
import { Loader2 } from "lucide-react";
import type { FormData } from "../../types";
import type {
  FacebookPage,
  FacebookPagesMeta,
} from "../../../../../services/facebookAdsService";
import { InstagramIdentitySelector } from "../InstagramIdentitySelector";

interface CreativePageSelectorProps {
  formData: FormData;
  handleChange: (field: keyof FormData, value: any) => void;
  getError: (field: string) => string;
  facebookPages: FacebookPage[];
  facebookPagesMeta: FacebookPagesMeta | null;
  loadingPages: boolean;
  selectedFacebookPage: FacebookPage | undefined;
  isEn: boolean;
}

export const CreativePageSelector: React.FC<CreativePageSelectorProps> = ({
  formData,
  handleChange,
  getError,
  facebookPages,
  facebookPagesMeta,
  loadingPages,
  selectedFacebookPage,
  isEn,
}) => {
  const readyCompanyPages = facebookPages.filter(
    (page) => page.status === "READY",
  );
  const accessibleUnlinkedPages = facebookPages.filter(
    (page) => page.status === "ACCESSIBLE_BUT_NOT_CONNECTED",
  );
  const connectedButUnavailablePages = facebookPages.filter(
    (page) => page.status === "CONNECTED_BUT_NOT_ACCESSIBLE",
  );

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {isEn ? "Facebook Page" : "صفحة Facebook"} <span className="text-red-500">*</span>
      </label>

      {facebookPagesMeta?.primaryWarning && (
        <div className="mb-3 rounded-lg border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/40 p-3 text-sm text-amber-800 dark:text-amber-300">
          {facebookPagesMeta.primaryWarning}
        </div>
      )}

      {loadingPages ? (
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">{isEn ? "Loading pages..." : "جاري تحميل الصفحات..."}</span>
        </div>
      ) : facebookPages.length > 0 ? (
        <select
          value={formData.pageId}
          onChange={(e) => handleChange("pageId", e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
            getError("pageId") ? "border-red-500" : "border-gray-300 dark:border-gray-600"
          }`}
        >
          <option value="">{isEn ? "Select Page" : "اختر الصفحة"}</option>
          {readyCompanyPages.length > 0 && (
            <optgroup label={isEn ? "Ready Company Pages" : "صفحات الشركة الجاهزة"}>
              {readyCompanyPages.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.name} {page.category && `(${page.category})`}
                </option>
              ))}
            </optgroup>
          )}
          {accessibleUnlinkedPages.length > 0 && (
            <optgroup label={isEn ? "Meta Pages Not Linked to Company" : "صفحات Meta غير المربوطة بالشركة"}>
              {accessibleUnlinkedPages.map((page) => (
                <option key={page.id} value={page.id} disabled>
                  {page.name} {page.category && `(${page.category})`} - {isEn ? "Link to company before publishing" : "اربطها بالشركة قبل النشر"}
                </option>
              ))}
            </optgroup>
          )}
          {connectedButUnavailablePages.length > 0 && (
            <optgroup label={isEn ? "Currently Unavailable Company Pages" : "صفحات الشركة غير المتاحة حالياً"}>
              {connectedButUnavailablePages.map((page) => (
                <option
                  key={page.id}
                  value={page.id}
                  disabled={page.isSelectable === false}
                >
                  {page.name} - {isEn ? "Requires Facebook reconnection" : "تحتاج إعادة ربط Facebook"}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      ) : (
        <div className="bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-800/60 rounded-lg p-3">
          <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-2">
            {isEn ? "⚠️ No pages available. You can enter the page ID manually:" : "⚠️ لا توجد صفحات متاحة. يمكنك إدخال معرف الصفحة يدوياً:"}
          </p>
          <input
            type="text"
            value={formData.pageId}
            onChange={(e) => handleChange("pageId", e.target.value)}
            placeholder={isEn ? "e.g. 123456789" : "مثال: 123456789"}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg text-sm"
          />
        </div>
      )}

      {facebookPagesMeta?.counts && (
        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
          <div className="rounded-lg border border-green-200 dark:border-green-800/60 bg-green-50 dark:bg-green-950/40 px-3 py-2 text-xs text-green-800 dark:text-green-300">
            {isEn ? "Ready Pages: " : "صفحات الشركة الجاهزة: "}{facebookPagesMeta.counts.ready}
          </div>
          <div className="rounded-lg border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/40 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
            {isEn ? "Unlinked Meta Pages: " : "صفحات Meta غير المربوطة: "}{facebookPagesMeta.counts.accessibleButNotConnected}
          </div>
          <div className="rounded-lg border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-950/40 px-3 py-2 text-xs text-red-800 dark:text-red-300">
            {isEn ? "Unavailable Pages: " : "صفحات الشركة غير المتاحة: "}{facebookPagesMeta.counts.connectedButNotAccessible}
          </div>
        </div>
      )}

      {selectedFacebookPage &&
        selectedFacebookPage.isConnectedToCompany === false && (
          <div className="mt-3 rounded-lg border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/40 p-3 text-sm text-amber-800 dark:text-amber-300">
            {isEn
              ? "The ad will be published under an available page from the current Meta account, but it is not linked to this company in Max P."
              : "سيتم إنشاء الإعلان باسم صفحة متاحة من حساب Meta الحالي لكنها غير مربوطة بهذه الشركة داخل Max P."}
          </div>
        )}

      {selectedFacebookPage?.warning && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {selectedFacebookPage.warning}
        </p>
      )}

      {facebookPagesMeta?.permissions?.missingRecommended?.length ? (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {isEn ? "Recommended permissions to display all pages: " : "الصلاحيات التي قد نحتاجها لإظهار الصفحات بشكل أكمل: "}
          {facebookPagesMeta.permissions.missingRecommended.join(", ")}
        </p>
      ) : null}

      {getError("pageId") && (
        <p className="mt-1 text-sm text-red-500">{getError("pageId")}</p>
      )}

      {/* Instagram Account Identity */}
      {formData.pageId && (
        <InstagramIdentitySelector
          pageName={selectedFacebookPage?.name}
          instagramActorId={formData.instagramActorId || ""}
          onInstagramActorIdChange={(val) => handleChange("instagramActorId", val)}
        />
      )}
    </div>
  );
};
