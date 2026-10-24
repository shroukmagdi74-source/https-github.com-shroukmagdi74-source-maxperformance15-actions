import React from "react";
import i18n from "../../i18n";
import TaskHeader from "../../components/tasks/details/TaskHeader";
import TaskSidebar from "../../components/tasks/details/TaskSidebar";
import {
  useDevTaskDetailsController,
  DevTaskModals,
  DevTaskTabsContent,
} from "./dev-task-details";

const DevTaskDetails: React.FC = () => {
  const {
    id,
    navigate,
    task,
    settings,
    userPermissions,
    loading,
    error,
    activeTab,
    setActiveTab,
    newComment,
    setNewComment,
    newChecklistTitle,
    setNewChecklistTitle,
    newItemInputs,
    setNewItemInputs,
    isUploading,
    toast,
    confirmModal,
    setConfirmModal,
    statusDropdownOpen,
    setStatusDropdownOpen,
    editingTimeLog,
    setEditingTimeLog,
    teamMembers,
    showSubtaskModal,
    setShowSubtaskModal,
    showTestingModal,
    setShowTestingModal,
    selectedTesterId,
    setSelectedTesterId,
    subtaskForm,
    setSubtaskForm,
    showDuplicateModal,
    setShowDuplicateModal,
    duplicateForm,
    setDuplicateForm,
    isDuplicating,
    isImporting,
    fileInputRef,
    isCurrentTaskTimerActive,
    isCurrentTaskTimerPaused,
    currentTaskElapsedSeconds,
    formatTime,
    handleStartTimer,
    handleStopTimer,
    handlePauseTimer,
    handleResumeTimer,
    handleAddComment,
    handleDuplicateTask,
    handleDeleteTask,
    handleCreateChecklist,
    handleAddItem,
    handleToggleItem,
    handleCreateSubtask,
    handleDepartmentChange,
    handleFileUpload,
    handleCreateTestingSubtask,
    handleDeleteTimeLog,
    handleEditTimeLog,
    handleDeleteChecklistItem,
    handleDeleteAttachment,
    handleExportChecklists,
    handleImportChecklists,
    handleUpdateStatus,
    handleUpdateAssignee,
  } = useDevTaskDetailsController();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="p-8 text-center text-red-600 dark:text-red-400">
        <p>{error || "المهمة غير موجودة"}</p>
        <button
          type="button"
          onClick={() => navigate("/super-admin/dev-tasks")}
          className="mt-4 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600"
        >
          العودة للقائمة
        </button>
      </div>
    );
  }

  return (
    <div className="w-full pb-10" dir={i18n.dir()}>
      <DevTaskModals
        toast={toast}
        confirmModal={confirmModal}
        setConfirmModal={setConfirmModal}
        editingTimeLog={editingTimeLog}
        setEditingTimeLog={setEditingTimeLog}
        handleEditTimeLog={handleEditTimeLog}
        showDuplicateModal={showDuplicateModal}
        setShowDuplicateModal={setShowDuplicateModal}
        duplicateForm={duplicateForm}
        setDuplicateForm={setDuplicateForm}
        isDuplicating={isDuplicating}
        handleDuplicateTask={handleDuplicateTask}
        taskAssigneeName={task.assigneeName}
        teamMembers={teamMembers}
        showSubtaskModal={showSubtaskModal}
        setShowSubtaskModal={setShowSubtaskModal}
        subtaskForm={subtaskForm}
        setSubtaskForm={setSubtaskForm}
        handleCreateSubtask={handleCreateSubtask}
        handleDepartmentChange={handleDepartmentChange}
        showTestingModal={showTestingModal}
        setShowTestingModal={setShowTestingModal}
        selectedTesterId={selectedTesterId}
        setSelectedTesterId={setSelectedTesterId}
        handleCreateTestingSubtask={handleCreateTestingSubtask}
        taskTitle={task.title}
      />

      <TaskHeader
        task={task}
        isTimerRunning={isCurrentTaskTimerActive}
        isTimerPaused={isCurrentTaskTimerPaused}
        elapsedSeconds={currentTaskElapsedSeconds}
        handleStartTimer={handleStartTimer}
        handleStopTimer={handleStopTimer}
        handlePauseTimer={handlePauseTimer}
        handleResumeTimer={handleResumeTimer}
        onEdit={() => navigate(`/super-admin/dev-tasks/${id}/edit`)}
        onDelete={() =>
          setConfirmModal({
            open: true,
            message: "هل أنت متأكد من حذف هذه المهمة؟",
            onConfirm: handleDeleteTask,
          })
        }
        onDuplicate={() => setShowDuplicateModal(true)}
        isSmartTimeTrackingEnabled={settings?.smartTimeTracking ?? true}
        canEdit={userPermissions?.canEdit}
        canDelete={userPermissions?.canDelete}
        settings={settings}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <DevTaskTabsContent
            task={task}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            settings={settings}
            userPermissions={userPermissions}
            handleToggleItem={handleToggleItem}
            handleAddItem={handleAddItem}
            newItemInputs={newItemInputs}
            setNewItemInputs={setNewItemInputs}
            setShowSubtaskModal={setShowSubtaskModal}
            setShowTestingModal={setShowTestingModal}
            newChecklistTitle={newChecklistTitle}
            setNewChecklistTitle={setNewChecklistTitle}
            handleCreateChecklist={handleCreateChecklist}
            handleExportChecklists={handleExportChecklists}
            fileInputRef={fileInputRef}
            isImporting={isImporting}
            handleImportChecklists={handleImportChecklists}
            setConfirmModal={setConfirmModal}
            handleDeleteChecklistItem={handleDeleteChecklistItem}
            newComment={newComment}
            setNewComment={setNewComment}
            handleAddComment={handleAddComment}
            isUploading={isUploading}
            handleFileUpload={handleFileUpload}
            handleDeleteAttachment={handleDeleteAttachment}
            isCurrentTaskTimerActive={isCurrentTaskTimerActive}
            isCurrentTaskTimerPaused={isCurrentTaskTimerPaused}
            currentTaskElapsedSeconds={currentTaskElapsedSeconds}
            formatTime={formatTime}
            handleStartTimer={handleStartTimer}
            handleStopTimer={handleStopTimer}
            handlePauseTimer={handlePauseTimer}
            handleResumeTimer={handleResumeTimer}
            setEditingTimeLog={setEditingTimeLog}
            handleDeleteTimeLog={handleDeleteTimeLog}
          />
        </div>
        <div className="lg:col-span-4 space-y-6 lg:order-last">
          <TaskSidebar
            task={task}
            settings={settings}
            userPermissions={userPermissions}
            statusDropdownOpen={statusDropdownOpen}
            setStatusDropdownOpen={setStatusDropdownOpen}
            handleUpdateStatus={handleUpdateStatus}
            teamMembers={teamMembers}
            handleUpdateAssignee={handleUpdateAssignee}
          />
        </div>
      </div>
    </div>
  );
};

export default DevTaskDetails;
