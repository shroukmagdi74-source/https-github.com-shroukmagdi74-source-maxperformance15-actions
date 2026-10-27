import React from "react";
import { AUDIENCE_TYPES, CreateCustomAudienceData } from "./types";

interface Step3ReviewProps {
  formData: CreateCustomAudienceData;
}

export const Step3Review: React.FC<Step3ReviewProps> = ({ formData }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50/80 border border-gray-200 rounded-xl p-5 space-y-4">
        <h3 className="font-semibold text-gray-900 border-b pb-2">
          مراجعة إعدادات الجمهور المخصص
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-xs text-gray-500 block">اسم الجمهور:</span>
            <p className="font-semibold text-gray-900">{formData.name}</p>
          </div>

          <div>
            <span className="text-xs text-gray-500 block">نوع المعيار:</span>
            <p className="font-semibold text-indigo-700">
              {AUDIENCE_TYPES.find((t) => t.value === formData.audienceType)?.label ||
                formData.audienceType}
            </p>
          </div>

          {formData.audienceType === "WEBSITE" && (
            <>
              <div>
                <span className="text-xs text-gray-500 block">Pixel ID:</span>
                <p className="font-mono text-gray-900">{formData.pixelId}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">الحدث المطلوب:</span>
                <p className="font-semibold text-gray-900">{formData.eventType}</p>
              </div>
              {formData.urlContains && (
                <div>
                  <span className="text-xs text-gray-500 block">فلتر الرابط:</span>
                  <p className="font-mono text-xs bg-white px-2 py-1 border rounded inline-block">
                    {formData.urlContains}
                  </p>
                </div>
              )}
            </>
          )}

          {formData.audienceType === "CUSTOMER_LIST" && (
            <div>
              <span className="text-xs text-gray-500 block">مصدر العملاء:</span>
              <p className="font-semibold text-gray-900">
                {formData.sourceType === "STORE_CUSTOMERS"
                  ? "استيراد مباشر من قاعدة بيانات متجر MaxP"
                  : `قائمة مجهزة (${formData.customerList?.length || 0} عميل)`}
              </p>
            </div>
          )}

          {formData.audienceType === "PAGE_ENGAGEMENT" && (
            <div>
              <span className="text-xs text-gray-500 block">طبيعة التفاعل:</span>
              <p className="font-semibold text-gray-900">{formData.pageEngagementType}</p>
            </div>
          )}

          {formData.audienceType === "IG_ENGAGEMENT" && (
            <div>
              <span className="text-xs text-gray-500 block">تفاعل Instagram:</span>
              <p className="font-semibold text-gray-900">{formData.igEngagementType}</p>
            </div>
          )}

          {formData.audienceType === "VIDEO_VIEWS" && (
            <div>
              <span className="text-xs text-gray-500 block">معيار المشاهدة:</span>
              <p className="font-semibold text-gray-900">{formData.videoViewDuration}</p>
            </div>
          )}

          <div>
            <span className="text-xs text-gray-500 block">مدة الاحتفاظ:</span>
            <p className="font-semibold text-gray-900 tabular-nums">
              {formData.retentionDays} يوماً
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
