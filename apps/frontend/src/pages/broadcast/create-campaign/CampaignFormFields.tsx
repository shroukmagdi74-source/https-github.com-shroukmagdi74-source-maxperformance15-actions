import React from "react";
import type { CampaignFormData, CustomerList } from "./types";

interface CampaignFormFieldsProps {
  formData: CampaignFormData;
  customerLists: CustomerList[];
  selectedList?: CustomerList;
  loading: boolean;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onInsertVariable: (variable: string) => void;
  setMessageTextareaRef: (ref: HTMLTextAreaElement | null) => void;
}

export const CampaignFormFields: React.FC<CampaignFormFieldsProps> = ({
  formData,
  customerLists,
  selectedList,
  loading,
  onInputChange,
  onInsertVariable,
  setMessageTextareaRef,
}) => {
  return (
    <>
      {/* Campaign Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          اسم الحملة *
        </label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={onInputChange}
          className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="مثال: عرض الجمعة البيضاء"
          required
        />
      </div>

      {/* Target Audience */}
      <div>
        <label
          htmlFor="targetAudience"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          الجمهور المستهدف *
        </label>
        <select
          name="targetAudience"
          id="targetAudience"
          value={formData.targetAudience}
          onChange={onInputChange}
          className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
          disabled={loading}
        >
          <option value="">
            {loading ? "جاري التحميل..." : "اختر قائمة العملاء"}
          </option>
          {customerLists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.name} ({list.count.toLocaleString()} عميل)
            </option>
          ))}
        </select>
        {selectedList && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {selectedList.description}
          </p>
        )}
        {formData.targetAudience && formData.recipientCount > 0 && (
          <p className="mt-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 tabular-nums">
            ✓ سيتم الإرسال إلى {formData.recipientCount.toLocaleString()} عميل
          </p>
        )}
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          نص الرسالة *
        </label>
        <textarea
          ref={(ref) => setMessageTextareaRef(ref)}
          name="message"
          id="message"
          rows={4}
          value={formData.message}
          onChange={onInputChange}
          className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="اكتب رسالتك هنا... يمكنك استخدام المتغيرات لتخصيص الرسالة"
          required
        />

        {/* Variables Buttons */}
        <div className="mt-2 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-md border border-indigo-200 dark:border-indigo-700">
          <p className="text-xs font-medium text-indigo-900 dark:text-indigo-100 mb-2">
            إدراج متغيرات:
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onInsertVariable("{customerName}")}
              className="inline-flex items-center px-2.5 py-1 border border-indigo-300 dark:border-indigo-600 text-xs font-medium rounded text-indigo-700 dark:text-indigo-300 bg-white dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-indigo-800 transition-colors"
              title="إدراج اسم العميل الكامل"
            >
              <span className="ml-1">👤</span>
              اسم العميل
            </button>
            <button
              type="button"
              onClick={() => onInsertVariable("{firstName}")}
              className="inline-flex items-center px-2.5 py-1 border border-indigo-300 dark:border-indigo-600 text-xs font-medium rounded text-indigo-700 dark:text-indigo-300 bg-white dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-indigo-800 transition-colors"
              title="إدراج الاسم الأول"
            >
              <span className="ml-1">✨</span>
              الاسم الأول
            </button>
            <button
              type="button"
              onClick={() => onInsertVariable("{lastName}")}
              className="inline-flex items-center px-2.5 py-1 border border-indigo-300 dark:border-indigo-600 text-xs font-medium rounded text-indigo-700 dark:text-indigo-300 bg-white dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-indigo-800 transition-colors"
              title="إدراج الاسم الأخير"
            >
              <span className="ml-1">✨</span>
              الاسم الأخير
            </button>
          </div>
          <p className="text-xs text-indigo-600 dark:text-indigo-300 mt-2">
            💡 مثال: &quot;مرحباً &#123;customerName&#125;، نذكرك بالعرض الخاص!&quot;
          </p>
        </div>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 tabular-nums">
          عدد الأحرف: {formData.message.length} / 1000
        </p>
      </div>
    </>
  );
};
