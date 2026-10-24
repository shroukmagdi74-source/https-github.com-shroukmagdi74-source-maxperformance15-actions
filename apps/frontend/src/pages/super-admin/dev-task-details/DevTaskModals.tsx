import React from "react";
import {
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type {
  ToastState,
  ConfirmModalState,
  EditingTimeLogState,
  DuplicateFormData,
  SubtaskFormData,
} from "./types";
import { DevTaskSubtaskModal } from "./DevTaskSubtaskModal";
import { DevTaskDuplicateModal } from "./DevTaskDuplicateModal";
import { DevTaskTestingModal } from "./DevTaskTestingModal";

export interface DevTaskModalsProps {
  toast: ToastState | null;
  confirmModal: ConfirmModalState;
  setConfirmModal: React.Dispatch<React.SetStateAction<ConfirmModalState>>;
  editingTimeLog: EditingTimeLogState | null;
  setEditingTimeLog: React.Dispatch<React.SetStateAction<EditingTimeLogState | null>>;
  handleEditTimeLog: () => void;
  showDuplicateModal: boolean;
  setShowDuplicateModal: (show: boolean) => void;
  duplicateForm: DuplicateFormData;
  setDuplicateForm: React.Dispatch<React.SetStateAction<DuplicateFormData>>;
  isDuplicating: boolean;
  handleDuplicateTask: () => void;
  taskAssigneeName?: string;
  teamMembers: any[];
  showSubtaskModal: boolean;
  setShowSubtaskModal: (show: boolean) => void;
  subtaskForm: SubtaskFormData;
  setSubtaskForm: React.Dispatch<React.SetStateAction<SubtaskFormData>>;
  handleCreateSubtask: (e: React.FormEvent) => void;
  handleDepartmentChange: (dept: string) => void;
  showTestingModal: boolean;
  setShowTestingModal: (show: boolean) => void;
  selectedTesterId: string;
  setSelectedTesterId: (id: string) => void;
  handleCreateTestingSubtask: (e: React.FormEvent) => void;
  taskTitle?: string;
}

export const DevTaskModals: React.FC<DevTaskModalsProps> = ({
  toast,
  confirmModal,
  setConfirmModal,
  editingTimeLog,
  setEditingTimeLog,
  handleEditTimeLog,
  showDuplicateModal,
  setShowDuplicateModal,
  duplicateForm,
  setDuplicateForm,
  isDuplicating,
  handleDuplicateTask,
  taskAssigneeName,
  teamMembers,
  showSubtaskModal,
  setShowSubtaskModal,
  subtaskForm,
  setSubtaskForm,
  handleCreateSubtask,
  handleDepartmentChange,
  showTestingModal,
  setShowTestingModal,
  selectedTesterId,
  setSelectedTesterId,
  handleCreateTestingSubtask,
  taskTitle,
}) => {
  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 left-1/2 transform -translate-x-1/2 px-8 py-4 rounded-xl shadow-2xl flex items-center gap-3 border-2 font-bold text-lg animate-bounce ${
            toast.type === "success"
              ? "bg-green-500 text-white border-green-300"
              : "bg-red-500 text-white border-red-300"
          }`}
          style={{ zIndex: 9999 }}
        >
          {toast.type === "success" ? (
            <CheckCircleIcon className="h-6 w-6" />
          ) : (
            <XMarkIcon className="h-6 w-6" />
          )}
          <span className="drop-shadow-lg">{toast.message}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              تأكيد الحذف
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {confirmModal.message}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() =>
                  setConfirmModal({
                    open: false,
                    message: "",
                    onConfirm: () => {},
                  })
                }
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Time Log Modal */}
      {editingTimeLog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              تعديل سجل الوقت
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  المدة (دقيقة)
                </label>
                <input
                  type="number"
                  value={editingTimeLog.duration}
                  onChange={(e) =>
                    setEditingTimeLog({
                      ...editingTimeLog,
                      duration: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الوصف
                </label>
                <input
                  type="text"
                  value={editingTimeLog.description}
                  onChange={(e) =>
                    setEditingTimeLog({
                      ...editingTimeLog,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                type="button"
                onClick={() => setEditingTimeLog(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleEditTimeLog}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Task Modal */}
      <DevTaskDuplicateModal
        showDuplicateModal={showDuplicateModal}
        setShowDuplicateModal={setShowDuplicateModal}
        duplicateForm={duplicateForm}
        setDuplicateForm={setDuplicateForm}
        isDuplicating={isDuplicating}
        handleDuplicateTask={handleDuplicateTask}
        taskAssigneeName={taskAssigneeName}
        teamMembers={teamMembers}
      />

      {/* Subtask Modal */}
      <DevTaskSubtaskModal
        showSubtaskModal={showSubtaskModal}
        setShowSubtaskModal={setShowSubtaskModal}
        subtaskForm={subtaskForm}
        setSubtaskForm={setSubtaskForm}
        handleCreateSubtask={handleCreateSubtask}
        handleDepartmentChange={handleDepartmentChange}
        teamMembers={teamMembers}
      />

      {/* Request Testing Modal */}
      <DevTaskTestingModal
        showTestingModal={showTestingModal}
        setShowTestingModal={setShowTestingModal}
        selectedTesterId={selectedTesterId}
        setSelectedTesterId={setSelectedTesterId}
        handleCreateTestingSubtask={handleCreateTestingSubtask}
        teamMembers={teamMembers}
        taskTitle={taskTitle}
      />
    </>
  );
};
