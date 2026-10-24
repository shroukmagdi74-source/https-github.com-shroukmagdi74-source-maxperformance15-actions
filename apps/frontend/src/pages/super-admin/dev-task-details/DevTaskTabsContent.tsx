import React from "react";
import {
  DocumentDuplicateIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ChatBubbleLeftIcon,
  PaperClipIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import type { Task } from "../../../types/tasks";
import type {
  DevTaskTab,
  ConfirmModalState,
  EditingTimeLogState,
} from "./types";
import TaskOverview from "../../../components/tasks/details/TaskOverview";
import TaskSubtasks from "../../../components/tasks/details/TaskSubtasks";
import TaskActivities from "../../../components/tasks/details/TaskActivities";
import { DevTaskChecklistsTab } from "./DevTaskChecklistsTab";
import { DevTaskCommentsTab } from "./DevTaskCommentsTab";
import { DevTaskAttachmentsTab } from "./DevTaskAttachmentsTab";
import { DevTaskTimeTab } from "./DevTaskTimeTab";

export interface DevTaskTabsContentProps {
  task: Task;
  activeTab: DevTaskTab;
  setActiveTab: (tab: DevTaskTab) => void;
  settings: any;
  userPermissions: any;
  handleToggleItem: (itemId: string, currentStatus: boolean) => void;
  handleAddItem: (checklistId: string) => void;
  newItemInputs: Record<string, string>;
  setNewItemInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setShowSubtaskModal: (show: boolean) => void;
  setShowTestingModal: (show: boolean) => void;
  newChecklistTitle: string;
  setNewChecklistTitle: (val: string) => void;
  handleCreateChecklist: () => void;
  handleExportChecklists: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  isImporting: boolean;
  handleImportChecklists: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setConfirmModal: React.Dispatch<React.SetStateAction<ConfirmModalState>>;
  handleDeleteChecklistItem: (itemId: string) => void;
  newComment: string;
  setNewComment: (val: string) => void;
  handleAddComment: () => void;
  isUploading: boolean;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDeleteAttachment: (id: string) => void;
  isCurrentTaskTimerActive: boolean;
  isCurrentTaskTimerPaused: boolean;
  currentTaskElapsedSeconds: number;
  formatTime: (seconds: number) => string;
  handleStartTimer: () => void;
  handleStopTimer: () => void;
  handlePauseTimer: () => void;
  handleResumeTimer: () => void;
  setEditingTimeLog: React.Dispatch<React.SetStateAction<EditingTimeLogState | null>>;
  handleDeleteTimeLog: (id: string) => void;
}

export const DevTaskTabsContent: React.FC<DevTaskTabsContentProps> = ({
  task,
  activeTab,
  setActiveTab,
  settings,
  handleToggleItem,
  handleAddItem,
  newItemInputs,
  setNewItemInputs,
  setShowSubtaskModal,
  setShowTestingModal,
  newChecklistTitle,
  setNewChecklistTitle,
  handleCreateChecklist,
  handleExportChecklists,
  fileInputRef,
  isImporting,
  handleImportChecklists,
  setConfirmModal,
  handleDeleteChecklistItem,
  newComment,
  setNewComment,
  handleAddComment,
  isUploading,
  handleFileUpload,
  handleDeleteAttachment,
  isCurrentTaskTimerActive,
  isCurrentTaskTimerPaused,
  currentTaskElapsedSeconds,
  formatTime,
  handleStartTimer,
  handleStopTimer,
  handlePauseTimer,
  handleResumeTimer,
  setEditingTimeLog,
  handleDeleteTimeLog,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm min-h-[600px]">
      {/* Tabs Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 overflow-x-auto">
        <div className="flex">
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "details"
                ? "text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400 bg-white dark:bg-gray-800"
                : "text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <DocumentDuplicateIcon className="h-5 w-5" />
            نظرة عامة
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("subtasks")}
            className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "subtasks"
                ? "text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400 bg-white dark:bg-gray-800"
                : "text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <ClipboardDocumentListIcon className="h-5 w-5" />
            المهام الفرعية ({task.subtasks?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("checklists")}
            className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "checklists"
                ? "text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400 bg-white dark:bg-gray-800"
                : "text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <CheckCircleIcon className="h-5 w-5" />
            القوائم ({task.checklists?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("comments")}
            className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "comments"
                ? "text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400 bg-white dark:bg-gray-800"
                : "text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <ChatBubbleLeftIcon className="h-5 w-5" />
            التعليقات ({task.comments?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("attachments")}
            className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "attachments"
                ? "text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400 bg-white dark:bg-gray-800"
                : "text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <PaperClipIcon className="h-5 w-5" />
            المرفقات ({task.attachments?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("time")}
            className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "time"
                ? "text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400 bg-white dark:bg-gray-800"
                : "text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <ClockIcon className="h-5 w-5" />
            تتبع الوقت
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("activities")}
            className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "activities"
                ? "text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400 bg-white dark:bg-gray-800"
                : "text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            يوميات النظام
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === "details" && (
          <TaskOverview
            task={task}
            handleToggleItem={handleToggleItem}
            handleAddItem={handleAddItem}
            newItemInputs={newItemInputs}
            setNewItemInputs={setNewItemInputs}
            settings={settings}
          />
        )}

        {activeTab === "subtasks" && (
          <TaskSubtasks
            task={task}
            onAddSubtask={() => setShowSubtaskModal(true)}
            onRequestTesting={() => setShowTestingModal(true)}
            settings={settings}
          />
        )}

        {activeTab === "checklists" && (
          <DevTaskChecklistsTab
            checklists={task.checklists}
            newChecklistTitle={newChecklistTitle}
            setNewChecklistTitle={setNewChecklistTitle}
            handleCreateChecklist={handleCreateChecklist}
            handleExportChecklists={handleExportChecklists}
            fileInputRef={fileInputRef}
            isImporting={isImporting}
            handleImportChecklists={handleImportChecklists}
            newItemInputs={newItemInputs}
            setNewItemInputs={setNewItemInputs}
            handleToggleItem={handleToggleItem}
            handleAddItem={handleAddItem}
            setConfirmModal={setConfirmModal}
            handleDeleteChecklistItem={handleDeleteChecklistItem}
          />
        )}

        {activeTab === "comments" && (
          <DevTaskCommentsTab
            comments={task.comments}
            newComment={newComment}
            setNewComment={setNewComment}
            handleAddComment={handleAddComment}
          />
        )}

        {activeTab === "attachments" && (
          <DevTaskAttachmentsTab
            attachments={task.attachments}
            isUploading={isUploading}
            handleFileUpload={handleFileUpload}
            setConfirmModal={setConfirmModal}
            handleDeleteAttachment={handleDeleteAttachment}
          />
        )}

        {activeTab === "time" && (
          <DevTaskTimeTab
            timeLogs={task.timeLogs}
            isCurrentTaskTimerActive={isCurrentTaskTimerActive}
            isCurrentTaskTimerPaused={isCurrentTaskTimerPaused}
            currentTaskElapsedSeconds={currentTaskElapsedSeconds}
            formatTime={formatTime}
            handleStartTimer={handleStartTimer}
            handleStopTimer={handleStopTimer}
            handlePauseTimer={handlePauseTimer}
            handleResumeTimer={handleResumeTimer}
            setEditingTimeLog={setEditingTimeLog}
            setConfirmModal={setConfirmModal}
            handleDeleteTimeLog={handleDeleteTimeLog}
          />
        )}

        {activeTab === "activities" && (
          <TaskActivities activities={task.activities} />
        )}
      </div>
    </div>
  );
};
