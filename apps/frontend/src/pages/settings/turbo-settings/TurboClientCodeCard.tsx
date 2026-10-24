import React from "react";
import { KeyIcon } from "@heroicons/react/24/outline";

interface TurboClientCodeCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
  clientCode: number | null;
  onChangeClientCode: (code: number | null) => void;
}

export const TurboClientCodeCard: React.FC<TurboClientCodeCardProps> = ({
  t,
  clientCode,
  onChangeClientCode,
}) => {
  return (
    <div className="border-t dark:border-gray-700 pt-6">
      <div className="flex items-center mb-4">
        <KeyIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 ml-2" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Main Client Code
        </h3>
      </div>

      <div className="space-y-2">
        <input
          type="number"
          value={clientCode ?? ""}
          onChange={(e) =>
            onChangeClientCode(e.target.value ? parseInt(e.target.value, 10) : null)
          }
          placeholder="37321"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 font-mono tabular-nums"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t("turbo.k_31")}
        </p>
      </div>
    </div>
  );
};
