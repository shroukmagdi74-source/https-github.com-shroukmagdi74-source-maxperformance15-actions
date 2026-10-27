import React from "react";
import { CreateCustomAudienceData, FacebookPixel } from "./types";

interface Step2WebsiteCriteriaProps {
  formData: CreateCustomAudienceData;
  pixels: FacebookPixel[];
  onInputChange: (field: keyof CreateCustomAudienceData, value: any) => void;
}

export const Step2WebsiteCriteria: React.FC<Step2WebsiteCriteriaProps> = ({
  formData,
  pixels,
  onInputChange,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="custom-audience-pixel-id"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Facebook Pixel *
        </label>
        {pixels.length > 0 ? (
          <select
            id="custom-audience-pixel-id"
            value={formData.pixelId}
            onChange={(e) => onInputChange("pixelId", e.target.value)}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            {pixels.map((pix) => (
              <option key={pix.id} value={pix.id}>
                {pix.name} ({pix.id})
              </option>
            ))}
          </select>
        ) : (
          <input
            id="custom-audience-pixel-id"
            type="text"
            value={formData.pixelId}
            onChange={(e) => onInputChange("pixelId", e.target.value)}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
            placeholder="أدخل معرف البيكسل (Pixel ID)"
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="custom-audience-event-type"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            نوع الحدث (Event) *
          </label>
          <select
            id="custom-audience-event-type"
            value={formData.eventType}
            onChange={(e) => onInputChange("eventType", e.target.value)}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="ALL_VISITORS">جميع زوار المتجر (PageView)</option>
            <option value="PURCHASE">المشترون الفعليون (Purchase)</option>
            <option value="ADD_TO_CART">من أضافوا منتجات للسلة (AddToCart)</option>
            <option value="INITIATE_CHECKOUT">من بدأوا إتمام الطلب (InitiateCheckout)</option>
            <option value="VIEW_CONTENT">من شاهدوا صفحات المنتجات (ViewContent)</option>
            <option value="LEAD">من سجلوا بياناتهم (Lead)</option>
            <option value="SEARCH">من أجروا بحثاً في المتجر (Search)</option>
            <option value="COMPLETE_REGISTRATION">إتمام التسجيل (CompleteRegistration)</option>
            <option value="ADD_PAYMENT_INFO">إضافة معلومات الدفع (AddPaymentInfo)</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="custom-audience-retention-days"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            فترة الاسترجاع (من 1 إلى 180 يوماً)
          </label>
          <input
            id="custom-audience-retention-days"
            type="number"
            min={1}
            max={180}
            value={formData.retentionDays || 30}
            onChange={(e) => onInputChange("retentionDays", parseInt(e.target.value) || 30)}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm tabular-nums"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="custom-audience-url-contains"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          فلترة بمسار رابط معين (اختياري)
        </label>
        <input
          id="custom-audience-url-contains"
          type="text"
          value={formData.urlContains || ""}
          onChange={(e) => onInputChange("urlContains", e.target.value)}
          placeholder="مثال: /checkout أو /shoes أو /sale"
          className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">
          اتركه فارغاً لاستهداف كافة صفحات المتجر، أو اكتب كلمة لتخصيص الزوار لصفحات معينة فقط.
        </p>
      </div>
    </div>
  );
};
