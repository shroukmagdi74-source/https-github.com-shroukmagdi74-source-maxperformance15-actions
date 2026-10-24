import React from "react";
import { KeyIcon } from "@heroicons/react/24/outline";

interface TurboSenderNumberCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
  senderNumber: string;
  onChangeSenderNumber: (number: string) => void;
}

export const TurboSenderNumberCard: React.FC<TurboSenderNumberCardProps> = ({
  t,
  senderNumber,
  onChangeSenderNumber,
}) => {
  return (
    <div className="border-t dark:border-gray-700 pt-6">
      <div className="flex items-center mb-4">
        <KeyIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 ml-2" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {t("turbo.k_32")}
        </h3>
      </div>

      <div className="space-y-2">
        <input
          type="text"
          value={senderNumber}
          onChange={(e) => onChangeSenderNumber(e.target.value)}
          placeholder="01000000000"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 font-mono tabular-nums"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t("turbo.k_33")}
        </p>
      </div>
    </div>
  );
};
