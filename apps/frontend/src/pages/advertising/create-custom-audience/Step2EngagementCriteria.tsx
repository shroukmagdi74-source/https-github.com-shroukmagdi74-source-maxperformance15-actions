import React from "react";
import { CreateCustomAudienceData, FacebookPage } from "./types";

interface Step2EngagementCriteriaProps {
  formData: CreateCustomAudienceData;
  pages: FacebookPage[];
  onInputChange: (field: keyof CreateCustomAudienceData, value: any) => void;
}

export const Step2EngagementCriteria: React.FC<Step2EngagementCriteriaProps> = ({
  formData,
  pages,
  onInputChange,
}) => {
  return (
    <>
      {/* PAGE ENGAGEMENT CRITERIA */}
      {formData.audienceType === "PAGE_ENGAGEMENT" && (
        <div className="space-y-4">
          {pages.length > 0 && (
            <div>
              <label
                htmlFor="custom-audience-page-select"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                صفحة فيسبوك المستهدفة *
              </label>
              <select
                id="custom-audience-page-select"
                value={formData.pageId}
                onChange={(e) => onInputChange("pageId", e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                {pages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="custom-audience-page-action"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                طبيعة التفاعل المطلوبة *
              </label>
              <select
                id="custom-audience-page-action"
                value={formData.pageEngagementType || "page_engaged"}
                onChange={(e) => onInputChange("pageEngagementType", e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="page_engaged">كل من تفاعل مع الصفحة أو منشوراتها (الأوسع)</option>
                <option value="page_visited">الأشخاص الذين زاروا الصفحة فقط</option>
                <option value="post_engaged">من تفاعلوا مع أي منشور أو إعلان (لايك/تعليق/مشاركة)</option>
                <option value="page_cta_clicked">من نقروا على زر الدعوة للإجراء (CTA)</option>
                <option value="page_messaged">من أرسلوا رسائل إلى صفحتك</option>
                <option value="page_saved">من حفظوا صفحتك أو أي منشور منها</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="custom-audience-page-retention"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                فترة الاسترجاع (حتى 365 يوماً)
              </label>
              <input
                id="custom-audience-page-retention"
                type="number"
                min={1}
                max={365}
                value={formData.retentionDays || 365}
                onChange={(e) => onInputChange("retentionDays", parseInt(e.target.value) || 365)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm tabular-nums"
              />
            </div>
          </div>
        </div>
      )}

      {/* INSTAGRAM ENGAGEMENT CRITERIA */}
      {formData.audienceType === "IG_ENGAGEMENT" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="custom-audience-ig-action"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                طبيعة التفاعل مع Instagram *
              </label>
              <select
                id="custom-audience-ig-action"
                value={formData.igEngagementType || "ig_business_profile_engaged"}
                onChange={(e) => onInputChange("igEngagementType", e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="ig_business_profile_engaged">كل من تفاعل مع الحساب الاحترافي (الأشمل)</option>
                <option value="ig_business_profile_visited">من زاروا الملف الشخصي للحساب</option>
                <option value="ig_post_engaged">من تفاعلوا مع المنشورات أو إعلانات Instagram</option>
                <option value="ig_direct_message_sent">من أرسلوا رسائل خاصة (Direct Message)</option>
                <option value="ig_post_saved">من حفظوا أي منشور من الحساب</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="custom-audience-ig-retention"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                فترة الاسترجاع (حتى 365 يوماً)
              </label>
              <input
                id="custom-audience-ig-retention"
                type="number"
                min={1}
                max={365}
                value={formData.retentionDays || 365}
                onChange={(e) => onInputChange("retentionDays", parseInt(e.target.value) || 365)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm tabular-nums"
              />
            </div>
          </div>
        </div>
      )}

      {/* VIDEO VIEWS CRITERIA */}
      {formData.audienceType === "VIDEO_VIEWS" && (
        <div className="space-y-4">
          {pages.length > 0 && (
            <div>
              <label
                htmlFor="custom-audience-video-page"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                صفحة الفيديوهات *
              </label>
              <select
                id="custom-audience-video-page"
                value={formData.pageId}
                onChange={(e) => onInputChange("pageId", e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                {pages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="custom-audience-video-duration"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                مدة أو نسبة مشاهدة الفيديو *
              </label>
              <select
                id="custom-audience-video-duration"
                value={formData.videoViewDuration || "video_watched_10s"}
                onChange={(e) => onInputChange("videoViewDuration", e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="video_watched_10s">مشاهدة 10 ثوانٍ فما فوق أو اكتمال الفيديو (ThruPlay - موصى به)</option>
                <option value="video_watched_3s">مشاهدة 3 ثوانٍ على الأقل</option>
                <option value="video_watched_25_percent">مشاهدة 25% من مدة الفيديو</option>
                <option value="video_watched_50_percent">مشاهدة 50% من مدة الفيديو</option>
                <option value="video_watched_75_percent">مشاهدة 75% من مدة الفيديو</option>
                <option value="video_watched_95_percent">مشاهدة 95% من مدة الفيديو (أعلى اهتمام)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="custom-audience-video-retention"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                فترة الاسترجاع (حتى 365 يوماً)
              </label>
              <input
                id="custom-audience-video-retention"
                type="number"
                min={1}
                max={365}
                value={formData.retentionDays || 365}
                onChange={(e) => onInputChange("retentionDays", parseInt(e.target.value) || 365)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm tabular-nums"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
