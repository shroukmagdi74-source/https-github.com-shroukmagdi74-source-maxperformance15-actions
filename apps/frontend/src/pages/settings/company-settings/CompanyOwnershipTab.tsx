import React from "react";
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { CompanyUser } from "./types";

interface CompanyOwnershipTabProps {
  users: CompanyUser[];
  selectedNewOwner: string;
  setSelectedNewOwner: (userId: string) => void;
  showTransferConfirm: boolean;
  setShowTransferConfirm: (show: boolean) => void;
  transferring: boolean;
  handleTransferOwnership: () => void;
}

export const CompanyOwnershipTab: React.FC<CompanyOwnershipTabProps> = ({
  users,
  selectedNewOwner,
  setSelectedNewOwner,
  showTransferConfirm,
  setShowTransferConfirm,
  transferring,
  handleTransferOwnership,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border-2 border-red-100 dark:border-red-900/30">
      <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-6 flex items-center">
        <ShieldCheckIcon className="h-6 w-6 mr-2" />
        نقل ملكية الشركة
      </h2>

      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-6 border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-2 text-red-800 dark:text-red-200 font-medium mb-2">
          <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
          <span>منطقة خطر!</span>
        </div>
        <div className="text-sm text-red-700 dark:text-red-300">
          نقل الملكية إجراء نهائي لا يمكن التراجع عنه. عند نقل الملكية لموظف آخر:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>ستفقد صلاحيات المالك وتصبح مديراً (Admin) فقط.</li>
            <li>
              سيحصل المالك الجديد على كامل الصلاحيات بما في ذلك حذفك من النظام.
            </li>
            <li>سيطالبك النظام بتسجيل الدخول مجدداً لتحديث الصلاحيات.</li>
          </ul>
        </div>
      </div>

      <div className="max-w-xl">
        <label
          htmlFor="company-transfer-owner"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          اختر المالك الجديد
        </label>
        <select
          id="company-transfer-owner"
          name="newOwnerId"
          autoComplete="off"
          value={selectedNewOwner}
          onChange={(e) => setSelectedNewOwner(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
        >
          <option value="">اختر مستخدم...</option>
          {users.map((u) => {
            const displayName =
              u.firstName && u.lastName
                ? `${u.firstName} ${u.lastName}`
                : u.name || u.email || u.id;
            return (
              <option key={u.id} value={u.id}>
                {displayName} ({u.email || "—"}) - {u.role || "MEMBER"}
              </option>
            );
          })}
        </select>

        <div className="mt-6">
          {!showTransferConfirm ? (
            <button
              type="button"
              onClick={() => setShowTransferConfirm(true)}
              disabled={!selectedNewOwner}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              نقل الملكية
            </button>
          ) : (
            <div className="flex items-center space-x-4 space-x-reverse">
              <button
                type="button"
                onClick={handleTransferOwnership}
                disabled={transferring}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {transferring ? "جاري النقل..." : "تأكيد النقل النهائي"}
              </button>
              <button
                type="button"
                onClick={() => setShowTransferConfirm(false)}
                disabled={transferring}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                إلغاء
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
