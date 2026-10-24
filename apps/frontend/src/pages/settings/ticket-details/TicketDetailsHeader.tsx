import React from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

interface TicketDetailsHeaderProps {
  ticketId: number;
  onBack: () => void;
}

export const TicketDetailsHeader: React.FC<TicketDetailsHeaderProps> = ({
  ticketId,
  onBack,
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        العودة لإعدادات Turbo
      </button>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        تذكرة <span className="font-mono tabular-nums">#{ticketId}</span>
      </h1>
    </div>
  );
};
