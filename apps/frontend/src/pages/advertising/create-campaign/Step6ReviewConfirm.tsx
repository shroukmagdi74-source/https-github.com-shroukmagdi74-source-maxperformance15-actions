import React from "react";
import { CampaignFormData, FacebookPixel } from "./types";
import {
  conversionLocations,
  optimizationGoals,
  availableLocations,
  availableInterests,
  availablePlacements,
  buyingTypes,
  bidStrategies,
  specialAdCategories,
} from "./constants";
import { CAMPAIGN_OBJECTIVES } from "../../../services/facebookAdsService";

interface Step6ReviewConfirmProps {
  formData: CampaignFormData;
  pixels: FacebookPixel[];
}

export const Step6ReviewConfirm: React.FC<Step6ReviewConfirmProps> = ({
  formData,
  pixels,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        مراجعة وإطلاق
      </h2>

      <div className="space-y-4">
        {/* Campaign Info */}
        <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-4">
          <h3 className="font-medium text-gray-900 dark:text-white">معلومات الحملة</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">اسم الحملة</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formData.name}
              </p>
            </div>
            {formData.description && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">الوصف</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formData.description}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">الهدف</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {
                  CAMPAIGN_OBJECTIVES.find(
                    (o) => o.value === formData.objective,
                  )?.label
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">الحالة</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formData.status === "ACTIVE" ? "نشطة" : "متوقفة"}
              </p>
            </div>
          </div>
        </div>

        {/* Budget */}
        <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-4">
          <h3 className="font-medium text-gray-900 dark:text-white">الميزانية</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">نوع الميزانية</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formData.budgetType === "DAILY" ? "يومية" : "إجمالية"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">مبلغ الميزانية</p>
              <p className="font-semibold text-gray-900 dark:text-white font-mono tabular-nums">
                {formData.budgetAmount.toLocaleString()} EGP
              </p>
            </div>
            {formData.spendLimit && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">حد الإنفاق</p>
                <p className="font-semibold text-gray-900 dark:text-white font-mono tabular-nums">
                  {formData.spendLimit.toLocaleString()} EGP
                </p>
              </div>
            )}
            {formData.budgetOptimization && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">CBO</p>
                <p className="font-semibold text-green-600 dark:text-green-400">مفعل</p>
              </div>
            )}
            {formData.startDate && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">تاريخ البدء</p>
                <p className="font-semibold text-gray-900 dark:text-white font-mono tabular-nums">
                  {new Date(formData.startDate).toLocaleDateString("ar-EG")}
                </p>
              </div>
            )}
            {formData.endDate && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">تاريخ الانتهاء</p>
                <p className="font-semibold text-gray-900 dark:text-white font-mono tabular-nums">
                  {new Date(formData.endDate).toLocaleDateString("ar-EG")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Targeting */}
        <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-4">
          <h3 className="font-medium text-gray-900 dark:text-white">الاستهداف</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">مكان التحويل</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {conversionLocations.find(
                  (l) => l.value === formData.conversionLocation,
                )?.label || formData.conversionLocation}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">هدف التحسين</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {optimizationGoals.find(
                  (g) => g.value === formData.optimizationGoal,
                )?.label || formData.optimizationGoal}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">الفئة العمرية</p>
              <p className="font-semibold text-gray-900 dark:text-white font-mono tabular-nums">
                {formData.targetingAgeMin} - {formData.targetingAgeMax} سنة
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">الجنس</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formData.targetingGenders.length === 0
                  ? "الكل"
                  : formData.targetingGenders
                      .map((g) => (g === "male" ? "ذكور" : "إناث"))
                      .join(" و ")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">المواقع</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formData.targetingLocations
                  .map(
                    (code) =>
                      availableLocations.find((l) => l.value === code)
                        ?.label || code,
                  )
                  .join(", ")}
              </p>
            </div>
            {formData.targetingInterests.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">الاهتمامات</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formData.targetingInterests
                    .map(
                      (i) =>
                        availableInterests.find((int) => int.value === i)
                          ?.label || i,
                    )
                    .join(", ")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Placements */}
        <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-4">
          <h3 className="font-medium text-gray-900 dark:text-white">المواضع</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">نوع المواضع</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formData.placementType === "AUTOMATIC"
                  ? "Advantage+ (تلقائي)"
                  : "يدوي"}
              </p>
            </div>
            {formData.placementType === "MANUAL" &&
              formData.placements.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">المواضع المحددة</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formData.placements
                      .map(
                        (p) =>
                          availablePlacements.find((pl) => pl.value === p)
                            ?.label || p,
                      )
                      .join(", ")}
                  </p>
                </div>
              )}
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-4">
          <h3 className="font-medium text-gray-900 dark:text-white">
            الإعدادات المتقدمة
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">نوع الشراء</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {buyingTypes.find((t) => t.value === formData.buyingType)
                  ?.label || "مزاد"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">استراتيجية المزايدة</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {bidStrategies.find(
                  (s) => s.value === formData.bidStrategy,
                )?.label || "أقل تكلفة"}
              </p>
            </div>
            {formData.pixelId && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Facebook Pixel</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {pixels.find((p) => p.pixelId === formData.pixelId)
                    ?.pixelName || formData.pixelId}
                </p>
              </div>
            )}
            {formData.specialAdCategories &&
              formData.specialAdCategories.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">فئات خاصة</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formData.specialAdCategories
                      .map(
                        (id) =>
                          specialAdCategories.find((c) => c.value === id)
                            ?.label,
                      )
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              )}
          </div>
        </div>

        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            <strong>جاهز للإطلاق!</strong> راجع جميع الإعدادات أعلاه ثم اضغط على &quot;إنشاء الحملة&quot; لبدء حملتك الإعلانية.
          </p>
        </div>
      </div>
    </div>
  );
};
