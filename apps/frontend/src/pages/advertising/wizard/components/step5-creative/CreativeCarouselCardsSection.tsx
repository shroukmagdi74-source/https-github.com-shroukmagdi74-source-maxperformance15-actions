import React from "react";
import { Loader2, UploadCloud, X } from "lucide-react";
import type { FormData, CarouselCard } from "../../types";

interface CreativeCarouselCardsSectionProps {
  formData: FormData;
  handleChange: (field: keyof FormData, value: any) => void;
  getError: (field: string) => string;
  isEn: boolean;
  uploadingCardId: string | null;
  handleCardImageUpload: (cardId: string, file: File) => void;
  handleAddCard: () => void;
  handleRemoveCard: (cardId: string) => void;
  handleUpdateCard: (cardId: string, updates: Partial<CarouselCard>) => void;
}

export const CreativeCarouselCardsSection: React.FC<CreativeCarouselCardsSectionProps> = ({
  formData,
  getError,
  isEn,
  uploadingCardId,
  handleCardImageUpload,
  handleAddCard,
  handleRemoveCard,
  handleUpdateCard,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {isEn ? `Carousel Cards (${formData.carouselCards.length}/10)` : `بطاقات الدوّار (${formData.carouselCards.length}/10)`}
        </label>
        <button
          type="button"
          onClick={handleAddCard}
          disabled={formData.carouselCards.length >= 10}
          className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEn ? "+ Add Card" : "+ إضافة بطاقة"}
        </button>
      </div>

      {getError("carouselCards") && (
        <p className="mb-3 text-sm text-red-500">
          {getError("carouselCards")}
        </p>
      )}

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {formData.carouselCards.map((card, index) => (
          <div
            key={card.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800"
          >
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-sm text-gray-900 dark:text-white">
                {isEn ? `Card ${index + 1}` : `بطاقة ${index + 1}`}
              </h5>
              {formData.carouselCards.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveCard(card.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                  aria-label={isEn ? "Remove Card" : "حذف البطاقة"}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="space-y-3">
              {/* Image URL with Direct Upload */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs text-gray-600 dark:text-gray-400">
                    {isEn ? "Image URL *" : "صورة البطاقة *"}
                  </label>
                  <label
                    htmlFor={`card-upload-${card.id}`}
                    className={`inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer ${
                      uploadingCardId === card.id ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    {uploadingCardId === card.id ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        {isEn ? "Uploading..." : "جاري الرفع..."}
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-3 h-3" />
                        {isEn ? "Upload from device" : "رفع من الجهاز"}
                      </>
                    )}
                  </label>
                  <input
                    type="file"
                    id={`card-upload-${card.id}`}
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    className="hidden"
                    disabled={uploadingCardId === card.id}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleCardImageUpload(card.id, file);
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  {card.imageUrl && (
                    <div className="w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-900">
                      <img src={card.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <input
                    type="url"
                    value={card.imageUrl}
                    onChange={(e) => handleUpdateCard(card.id, { imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Headline */}
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  {isEn ? "Headline *" : "العنوان *"}
                </label>
                <input
                  type="text"
                  value={card.headline}
                  onChange={(e) => handleUpdateCard(card.id, { headline: e.target.value })}
                  placeholder={isEn ? "Card headline" : "عنوان البطاقة"}
                  maxLength={40}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  {isEn ? "Description" : "الوصف"}
                </label>
                <input
                  type="text"
                  value={card.description}
                  onChange={(e) => handleUpdateCard(card.id, { description: e.target.value })}
                  placeholder={isEn ? "Card description" : "وصف البطاقة"}
                  maxLength={20}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Link URL */}
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  {isEn ? "Destination URL *" : "رابط الوجهة *"}
                </label>
                <input
                  type="url"
                  value={card.linkUrl}
                  onChange={(e) => handleUpdateCard(card.id, { linkUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
