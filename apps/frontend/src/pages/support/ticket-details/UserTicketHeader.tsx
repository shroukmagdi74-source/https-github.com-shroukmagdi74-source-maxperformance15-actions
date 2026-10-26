import React from "react";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
} from "lucide-react";
import { Ticket, getStatusText, getCategoryText } from "./types";

interface UserTicketHeaderProps {
  ticket: Ticket;
  onBack: () => void;
}

export const UserTicketHeader: React.FC<UserTicketHeaderProps> = ({
  ticket,
  onBack,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <Clock className="w-5 h-5 text-orange-500" />;
      case "in_progress":
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case "closed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="mb-6">
      <button
        onClick={onBack}
        className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4 ml-2" />
        العودة إلى التذاكر
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
              {ticket.subject}
            </h1>
            <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-600 dark:text-slate-400">
              <span>#{ticket.ticketId}</span>
              <span>•</span>
              <span>{getCategoryText(ticket.category)}</span>
              <span>•</span>
              <span>
                {new Date(ticket.createdAt).toLocaleDateString("ar-EG")}
              </span>
            </div>
          </div>
          <div className="flex items-center">
            {getStatusIcon(ticket.status)}
            <span className="mr-2 font-medium text-slate-800 dark:text-slate-200">
              {getStatusText(ticket.status)}
            </span>
          </div>
        </div>

        {ticket.status === "closed" && ticket.resolvedAt && (
          <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 ml-2" />
              <span className="text-green-800 dark:text-green-300">
                تم حل التذكرة في{" "}
                {new Date(ticket.resolvedAt).toLocaleDateString("ar-EG")}
              </span>
            </div>
            {ticket.rating && (
              <div className="mt-2 flex items-center">
                <span className="text-green-700 dark:text-green-400 ml-2">التقييم:</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= ticket.rating!
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
