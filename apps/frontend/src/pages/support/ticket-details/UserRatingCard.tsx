import React from "react";
import { Star } from "lucide-react";

interface UserRatingCardProps {
  rating: number;
  setRating: (rating: number) => void;
  feedback: string;
  setFeedback: (feedback: string) => void;
  submittingRating: boolean;
  onSkip: () => void;
  onSubmit: () => void;
}

export const UserRatingCard: React.FC<UserRatingCardProps> = ({
  rating,
  setRating,
  feedback,
  setFeedback,
  submittingRating,
  onSkip,
  onSubmit,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-4 flex-shrink-0 border border-slate-200/80 dark:border-slate-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">
        تقييم الخدمة
      </h3>
      <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
        نرجو منك تقييم جودة الدعم المقدم لك
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            التقييم *
          </label>
          <div className="flex space-x-1 space-x-reverse">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`p-1.5 transition-colors ${
                  star <= rating
                    ? "text-yellow-400"
                    : "text-gray-300 dark:text-gray-600 hover:text-yellow-400"
                }`}
                aria-label={`تقييم ${star} من 5`}
              >
                <Star className="w-6 h-6 fill-current" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="feedback-input"
            className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2"
          >
            ملاحظات إضافية (اختياري)
          </label>
          <textarea
            id="feedback-input"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="شاركنا رأيك حول الخدمة المقدمة..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
          />
        </div>

        <div className="flex justify-end space-x-3 space-x-reverse">
          <button
            type="button"
            onClick={onSkip}
            className="px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
          >
            تخطي
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submittingRating || rating === 0}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
          >
            {submittingRating ? "جاري الحفظ..." : "إرسال التقييم"}
          </button>
        </div>
      </div>
    </div>
  );
};
