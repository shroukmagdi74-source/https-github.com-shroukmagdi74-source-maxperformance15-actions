import React from "react";
import type { FormData } from "../../types";
import { WhatsAppGreetingEditor } from "../WhatsAppGreetingEditor";

interface CreativeCallToActionSectionProps {
  formData: FormData;
  handleChange: (field: keyof FormData, value: any) => void;
  callToActions: { label: string; value: string }[];
  isEn: boolean;
}

export const CreativeCallToActionSection: React.FC<CreativeCallToActionSectionProps> = ({
  formData,
  handleChange,
  callToActions,
  isEn,
}) => {
  return (
    <div className="space-y-4">
      {/* Call to Action Grid */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {isEn ? "Call to Action" : "زر الإجراء"}
        </label>
        <div className="grid grid-cols-4 gap-2">
          {callToActions.map((cta) => (
            <button
              key={cta.value}
              type="button"
              onClick={() => handleChange("callToAction", cta.value)}
              className={`py-2 px-3 text-xs rounded-lg border transition-all ${
                formData.callToAction === cta.value
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
              }`}
            >
              {cta.label}
            </button>
          ))}
        </div>
      </div>

      {/* WhatsApp Greeting & Quick FAQs Editor */}
      {(formData.callToAction === "WHATSAPP_MESSAGE" ||
        formData.conversionLocation === "WHATSAPP") && (
        <WhatsAppGreetingEditor
          greeting={formData.whatsappGreeting || ""}
          onGreetingChange={(val) => handleChange("whatsappGreeting", val)}
          quickFaqs={formData.whatsappQuickFaqs || []}
          onQuickFaqsChange={(faqs) =>
            handleChange("whatsappQuickFaqs", faqs)
          }
        />
      )}
    </div>
  );
};
