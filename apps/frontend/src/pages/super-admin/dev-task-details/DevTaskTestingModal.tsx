import React from "react";
import {
  CheckCircleIcon,
  XMarkIcon,
  UserIcon,
  LightBulbIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

export interface DevTaskTestingModalProps {
  showTestingModal: boolean;
  setShowTestingModal: (show: boolean) => void;
  selectedTesterId: string;
  setSelectedTesterId: (id: string) => void;
  handleCreateTestingSubtask: (e: React.FormEvent) => void;
  teamMembers: any[];
  taskTitle?: string;
}

export const DevTaskTestingModal: React.FC<DevTaskTestingModalProps> = ({
  showTestingModal,
  setShowTestingModal,
  selectedTesterId,
  setSelectedTesterId,
  handleCreateTestingSubtask,
  teamMembers,
  taskTitle,
}) => {
  if (!showTestingModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center overflow-y-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl transform transition-all">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-50 dark:bg-cyan-900/30 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                طلب اختبار
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                اختر المسؤول عن اختبار هذه المهمة
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowTestingModal(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <XMarkIcon className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleCreateTestingSubtask} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
              <UserIcon className="h-4 w-4" /> اختر المختبر
            </label>
            <select
              required
              value={selectedTesterId}
              onChange={(e) => setSelectedTesterId(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:text-white transition-all text-sm"
            >
              <option value="">-- اختر المختبر --</option>
              {teamMembers.map((member) => (
                <option
                  key={member.userId || member.id}
                  value={member.userId || member.id}
                >
                  {member.name}{" "}
                  {member.availability !== "available" ? "(مشغول)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-900/30 rounded-lg p-4">
            <div className="flex gap-3">
              <LightBulbIcon className="h-5 w-5 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-cyan-800 dark:text-cyan-300">
                <p className="font-medium mb-1">تفاصيل الاختبار:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>
                    سيتم إنشاء مهمة فرعية جديدة بعنوان &quot;Testing:{" "}
                    {taskTitle?.substring(0, 30)}...&quot;
                  </li>
                  <li>ستحتفظ بنفس الأولوية والقسم</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-50 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setShowTestingModal(false)}
              className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold shadow-lg shadow-cyan-200 dark:shadow-none transition-all flex items-center gap-2"
            >
              إرسال الطلب <CheckIcon className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
