import React from "react";
import { useTranslation } from "react-i18next";
import {
  UserGroupIcon,
  ShoppingCartIcon,
  ArrowDownTrayIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

export interface InternalConsumersTabProps {
  consumers: any[];
  onUpdatePermission: (
    connId: string,
    perms: { allowProductPull?: boolean; allowOrderPull?: boolean }
  ) => void;
  onDeleteConnection: (connId: string) => void;
}

export const InternalConsumersTab: React.FC<InternalConsumersTabProps> = ({
  consumers,
  onUpdatePermission,
  onDeleteConnection,
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {consumers.length > 0 ? (
        consumers.map((conn: any) => (
          <div
            key={conn.id}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50"
          >
            <div className="flex items-center gap-3 mb-6">
              <img
                src={
                  conn.consumer.logo ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    conn.consumer.name
                  )}&background=random`
                }
                alt={conn.consumer.name}
                className="w-12 h-12 rounded-lg object-cover bg-gray-100"
              />
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 dark:text-white">
                  {conn.consumer.name}
                </h4>
                <p className="text-xs text-gray-500">{conn.consumer.email}</p>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] rounded-full">
                <UserGroupIcon className="w-3 h-3" />
                {t("platform.k_102")}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <ShoppingCartIcon className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">
                    {t("platform.k_48")}
                  </span>
                </div>
                <button
                  type="button"
                  aria-label={`${t("platform.k_48")} toggle`}
                  onClick={() =>
                    onUpdatePermission(conn.id, {
                      allowProductPull: !conn.allowProductPull,
                    })
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    conn.allowProductPull
                      ? "bg-blue-600"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                      conn.allowProductPull ? "right-1" : "right-7"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <ArrowDownTrayIcon className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-medium">
                    {t("platform.k_49")}
                  </span>
                </div>
                <button
                  type="button"
                  aria-label={`${t("platform.k_49")} toggle`}
                  onClick={() =>
                    onUpdatePermission(conn.id, {
                      allowOrderPull: !conn.allowOrderPull,
                    })
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    conn.allowOrderPull
                      ? "bg-indigo-600"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                      conn.allowOrderPull ? "right-1" : "right-7"
                    }`}
                  />
                </button>
              </div>

              <button
                onClick={() => onDeleteConnection(conn.id)}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg hover:bg-red-100 transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
                {t("platform.k_103")}
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full py-12 text-center text-gray-500">
          {t("platform.k_50")}
        </div>
      )}
    </div>
  );
};
