import React from "react";
import {
  ChatBubbleLeftRightIcon,
  ClockIcon,
  StarIcon as StarOutlineIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import {
  formatDate,
  getStatusColor,
  getStatusText,
  TicketDetailsData,
} from "./types";

interface TicketInfoCardProps {
  ticket: TicketDetailsData;
  currentRating: number | null;
  submittingRating: boolean;
  onRateTicket: (score: number) => void;
}

export const TicketInfoCard: React.FC<TicketInfoCardProps> = ({
  ticket,
  currentRating,
  submittingRating,
  onRateTicket,
}) => {
  return (
    <div className="mb-6 rounded-lg bg-white p-6 shadow dark:bg-gray-900 dark:shadow-black/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <ChatBubbleLeftRightIcon className="w-6 h-6 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            معلومات التذكرة
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Rating Component */}
          <div className="flex items-center gap-1 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl px-2.5 py-1">
            <span className="text-xs font-semibold text-amber-900 dark:text-amber-200 ml-1">
              {currentRating ? (
                <>
                  التقييم (<span className="font-mono tabular-nums">{currentRating}</span>/5):
                </>
              ) : (
                "تقييم الدعم:"
              )}
            </span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                disabled={submittingRating}
                onClick={() => onRateTicket(star)}
                className="p-0.5 text-amber-500 hover:scale-110 transition disabled:opacity-50"
                title={`تقييم ${star} من 5 نجوم`}
              >
                {currentRating && currentRating >= star ? (
                  <StarSolidIcon className="h-4 w-4 fill-amber-400 text-amber-400" />
                ) : (
                  <StarOutlineIcon className="h-4 w-4 text-amber-400 hover:text-amber-500" />
                )}
              </button>
            ))}
          </div>

          <span
            className={`px-3 py-1 text-sm rounded-full font-medium ${getStatusColor(
              ticket.status
            )}`}
          >
            {getStatusText(ticket.status)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <ClockIcon className="w-4 h-4" />
          تاريخ الإنشاء:{" "}
          <span className="font-mono tabular-nums">{formatDate(ticket.created_at)}</span>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          وصف المشكلة
        </label>
        <p className="rounded-lg bg-gray-50 p-4 text-gray-900 dark:bg-gray-800 dark:text-gray-100">
          {ticket.description}
        </p>
      </div>
    </div>
  );
};
