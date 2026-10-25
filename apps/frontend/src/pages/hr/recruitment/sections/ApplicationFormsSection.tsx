import React from "react";
import { motion } from "framer-motion";
import {
  useApplicationFormsController,
  ApplicationFormsHeaderAndGrid,
  ApplicationFormBuilderModal,
  ApplicationFormResponsesModal,
  ApplicationFormResponseDetailModal,
} from "./application-forms/index";

const ApplicationFormsSection: React.FC = () => {
  const {
    loading,
    searchTerm,
    setSearchTerm,
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    showResponsesModal,
    setShowResponsesModal,
    showResponseDetailModal,
    setShowResponseDetailModal,
    selectedForm,
    responses,
    selectedResponse,
    responseFilter,
    setResponseFilter,
    updatingResponseId,
    convertingResponseId,
    jobs,
    newForm,
    setNewForm,
    newQuestion,
    setNewQuestion,
    optionInput,
    setOptionInput,
    handleCreateForm,
    handleUpdateForm,
    handleDeleteForm,
    handleEditForm,
    handleViewResponses,
    handleViewResponseDetail,
    handleDeleteResponse,
    handleToggleContactStatus,
    handleConvertResponseToApplicant,
    addQuestion,
    removeQuestion,
    moveQuestion,
    addOption,
    removeOption,
    resetForm,
    copyFormLink,
    filteredForms,
    contactedResponsesCount,
    notContactedResponsesCount,
    visibleResponses,
    selectedResponseCanJoinPipeline,
  } = useApplicationFormsController();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <ApplicationFormsHeaderAndGrid
        loading={loading}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        filteredForms={filteredForms}
        onOpenCreateModal={() => setShowCreateModal(true)}
        onEditForm={handleEditForm}
        onViewResponses={handleViewResponses}
        onDeleteForm={handleDeleteForm}
        onCopyFormLink={copyFormLink}
      />

      <ApplicationFormBuilderModal
        showCreateModal={showCreateModal}
        showEditModal={showEditModal}
        selectedForm={selectedForm}
        jobs={jobs}
        newForm={newForm}
        onNewFormChange={setNewForm}
        newQuestion={newQuestion}
        onNewQuestionChange={setNewQuestion}
        optionInput={optionInput}
        onOptionInputChange={setOptionInput}
        onAddOption={addOption}
        onRemoveOption={removeOption}
        onAddQuestion={addQuestion}
        onRemoveQuestion={removeQuestion}
        onMoveQuestion={moveQuestion}
        onCopyFormLink={copyFormLink}
        onClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          resetForm();
        }}
        onSubmit={showEditModal ? handleUpdateForm : handleCreateForm}
      />

      <ApplicationFormResponsesModal
        open={showResponsesModal}
        selectedForm={selectedForm}
        responses={responses}
        visibleResponses={visibleResponses}
        responseFilter={responseFilter}
        onResponseFilterChange={setResponseFilter}
        contactedResponsesCount={contactedResponsesCount}
        notContactedResponsesCount={notContactedResponsesCount}
        convertingResponseId={convertingResponseId}
        updatingResponseId={updatingResponseId}
        onConvertResponseToApplicant={handleConvertResponseToApplicant}
        onToggleContactStatus={handleToggleContactStatus}
        onViewResponseDetail={handleViewResponseDetail}
        onDeleteResponse={handleDeleteResponse}
        onClose={() => setShowResponsesModal(false)}
      />

      <ApplicationFormResponseDetailModal
        open={showResponseDetailModal}
        selectedResponse={selectedResponse}
        selectedResponseCanJoinPipeline={selectedResponseCanJoinPipeline}
        convertingResponseId={convertingResponseId}
        updatingResponseId={updatingResponseId}
        onConvertResponseToApplicant={handleConvertResponseToApplicant}
        onToggleContactStatus={handleToggleContactStatus}
        onClose={() => setShowResponseDetailModal(false)}
      />
    </motion.div>
  );
};

export default ApplicationFormsSection;
