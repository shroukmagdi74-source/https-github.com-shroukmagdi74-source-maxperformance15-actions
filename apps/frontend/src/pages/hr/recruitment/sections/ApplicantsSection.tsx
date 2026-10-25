import React from "react";
import {
  useApplicantsController,
  ApplicantsHeaderAndFilters,
  ApplicantsGrid,
  ApplicantModals,
} from "./applicants/index";

const ApplicantsSection: React.FC = () => {
  const {
    loading,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    selectedApplicant,
    setSelectedApplicant,
    deletingApplicantId,
    showDetailsModal,
    setShowDetailsModal,
    showAddModal,
    setShowAddModal,
    jobs,
    newApplicant,
    setNewApplicant,
    filteredApplicants,
    handleDeleteApplicant,
    handleUpdateStatus,
    handleAddApplicant,
    resetAddForm,
  } = useApplicantsController();

  return (
    <div className="space-y-6">
      <ApplicantsHeaderAndFilters
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        onOpenAddModal={() => setShowAddModal(true)}
      />

      <ApplicantsGrid
        filteredApplicants={filteredApplicants}
        loading={loading}
        deletingApplicantId={deletingApplicantId}
        onViewDetails={(applicant) => {
          setSelectedApplicant(applicant);
          setShowDetailsModal(true);
        }}
        onUpdateStatus={handleUpdateStatus}
        onDeleteApplicant={handleDeleteApplicant}
      />

      <ApplicantModals
        showDetailsModal={showDetailsModal}
        selectedApplicant={selectedApplicant}
        onCloseDetailsModal={() => setShowDetailsModal(false)}
        showAddModal={showAddModal}
        jobs={jobs}
        newApplicant={newApplicant}
        onNewApplicantChange={setNewApplicant}
        onAddApplicant={handleAddApplicant}
        onCloseAddModal={() => {
          setShowAddModal(false);
          resetAddForm();
        }}
      />
    </div>
  );
};

export default ApplicantsSection;
