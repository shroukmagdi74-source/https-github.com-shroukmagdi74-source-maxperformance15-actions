import React from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { Request } from "./types";

export interface InternalRequestsTabProps {
  requests: Request[];
  respondingIds: Set<string>;
  onRespond: (requestId: string, status: "APPROVED" | "REJECTED") => void;
}

export const InternalRequestsTab: React.FC<InternalRequestsTabProps> = ({
  requests,
  respondingIds,
  onRespond,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {requests.length > 0 ? (
        requests.map((req) => (
          <div
            key={req.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl gap-4"
          >
            <div className="flex items-center gap-3">
              <img
                src={
                  req.requester.logo ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    req.requester.name
                  )}&background=random`
                }
                alt={req.requester.name}
                className="w-12 h-12 rounded-lg bg-gray-100 object-cover"
              />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {req.requester.name}
                </h4>
                <p className="text-xs text-gray-500">{req.requester.email}</p>
                <p className="text-xs mt-1 bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded italic">
                  "{req.message}"
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onRespond(req.id, "APPROVED")}
                disabled={respondingIds.has(req.id)}
                className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {respondingIds.has(req.id) ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircleIcon className="w-4 h-4" />
                )}
                {t("platform.k_100")}
              </button>
              <button
                onClick={() => onRespond(req.id, "REJECTED")}
                disabled={respondingIds.has(req.id)}
                className="flex items-center gap-1 px-4 py-2 border border-red-200 text-red-600 text-sm rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {respondingIds.has(req.id) ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircleIcon className="w-4 h-4" />
                )}
                {t("platform.k_101")}
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="py-12 text-center text-gray-500">
          {t("platform.k_47")}
        </div>
      )}
    </div>
  );
};
