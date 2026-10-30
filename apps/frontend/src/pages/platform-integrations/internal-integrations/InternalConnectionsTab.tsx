import React from "react";
import { useTranslation } from "react-i18next";
import {
  LinkIcon,
  ShoppingCartIcon,
  ArrowDownTrayIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Connection } from "./types";

export interface InternalConnectionsTabProps {
  connections: Connection[];
  onStartPulling: (conn: Connection) => void;
  onStartPullingOrders: (conn: Connection) => void;
  onDeleteConnection: (connectionId: string) => void;
}

export const InternalConnectionsTab: React.FC<InternalConnectionsTabProps> = ({
  connections,
  onStartPulling,
  onStartPullingOrders,
  onDeleteConnection,
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {connections.length > 0 ? (
        connections.map((conn) => (
          <div
            key={conn.id}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <img
                src={
                  conn.provider.logo ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    conn.provider.name
                  )}&background=random`
                }
                alt={conn.provider.name}
                className="w-10 h-10 rounded-lg object-cover bg-gray-100"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                  {conn.provider.name}
                </h4>
                <p className="text-xs text-gray-500 truncate">
                  {conn.provider.email}
                </p>
              </div>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] rounded-full">
                {t("platform.k_98")}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onStartPulling(conn)}
                className="w-full flex items-center justify-center gap-2 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm rounded-lg hover:bg-blue-100 transition-colors"
              >
                <ShoppingCartIcon className="w-4 h-4" />
                {t("platform.k_48")}
              </button>
              <button
                onClick={() => onStartPullingOrders(conn)}
                disabled={!conn.allowOrderPull}
                className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-sm rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                {t("platform.k_49")}
              </button>
              <button
                onClick={() => onDeleteConnection(conn.id)}
                className="w-full flex items-center justify-center gap-2 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg hover:bg-red-100 transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
                {t("platform.k_99")}
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full py-12 text-center">
          <div className="bg-gray-100 dark:bg-gray-700/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <LinkIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-gray-900 dark:text-white font-medium">
            {t("platform.k_45")}
          </h3>
          <p className="text-gray-500 text-sm">{t("platform.k_46")}</p>
        </div>
      )}
    </div>
  );
};
