import React from "react";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import { Affiliate } from "./types";
import { AffiliateTableRow } from "./AffiliateTableRow";

interface AffiliatesTableProps {
  isDark: boolean;
  filteredAffiliates: Affiliate[];
  editingCommission: string | null;
  newCommission: number;
  updatingDocumentAffiliateId: string | null;
  setEditingCommission: (id: string | null) => void;
  setNewCommission: (commission: number) => void;
  updateCommission: (affiliateId: string) => void;
  handleStatusUpdate: (affiliateId: string, status: string) => void;
  openPolicyEditor: (affiliate: Affiliate) => void;
  openReviewHistory: (affiliate: Affiliate) => void;
  handleDocumentReviewUpdate: (
    affiliate: Affiliate,
    status: "APPROVED" | "REJECTED",
  ) => void;
}

export const AffiliatesTable: React.FC<AffiliatesTableProps> = ({
  isDark,
  filteredAffiliates,
  editingCommission,
  newCommission,
  updatingDocumentAffiliateId,
  setEditingCommission,
  setNewCommission,
  updateCommission,
  handleStatusUpdate,
  openPolicyEditor,
  openReviewHistory,
  handleDocumentReviewUpdate,
}) => {
  return (
    <div
      className={`rounded-2xl border ${
        isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
      } overflow-hidden shadow-sm`}
    >
      <div className="p-3 md:p-0">
        <div className="overflow-x-auto">
          <table className="block min-w-full md:table md:divide-y md:divide-gray-200 dark:md:divide-gray-700">
            <thead
              className={`hidden md:table-header-group ${
                isDark ? "bg-gray-900/50" : "bg-gray-50"
              }`}
            >
              <tr>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                  المسوق
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                  البيانات المالية
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                  الأداء
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                  العمولة اليدوية
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                  الضوابط
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                  الإجراء
                </th>
              </tr>
            </thead>
            <tbody
              className={`block space-y-3 md:table-row-group md:space-y-0 ${
                isDark
                  ? "md:bg-gray-800 md:divide-gray-700"
                  : "md:bg-white md:divide-gray-200"
              } md:divide-y`}
            >
              {filteredAffiliates.map((affiliate) => (
                <AffiliateTableRow
                  key={affiliate.id}
                  affiliate={affiliate}
                  isDark={isDark}
                  editingCommission={editingCommission}
                  newCommission={newCommission}
                  updatingDocumentAffiliateId={updatingDocumentAffiliateId}
                  setEditingCommission={setEditingCommission}
                  setNewCommission={setNewCommission}
                  updateCommission={updateCommission}
                  handleStatusUpdate={handleStatusUpdate}
                  openPolicyEditor={openPolicyEditor}
                  openReviewHistory={openReviewHistory}
                  handleDocumentReviewUpdate={handleDocumentReviewUpdate}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredAffiliates.length === 0 && (
        <div
          className={`p-20 text-center flex flex-col items-center ${
            isDark ? "text-gray-500" : "text-gray-400"
          }`}
        >
          <UserGroupIcon className="h-12 w-12 mb-4 opacity-20" />
          <p className="font-medium">
            لم يتم العثور على أي مسوقين يطابقون خيارات البحث.
          </p>
        </div>
      )}
    </div>
  );
};
