import React from "react";
import {
  useJobPostingsController,
  JobPostingsFilterAndGrid,
  CreateJobPostingModal,
  JobPostingDetailsModal,
} from "./job-postings";

const JobPostingsSection: React.FC = () => {
  const {
    loading,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    showCreateModal,
    setShowCreateModal,
    selectedJob,
    setSelectedJob,
    showDetailsModal,
    setShowDetailsModal,
    newJob,
    setNewJob,
    filteredJobs,
    handleCreateJob,
    handleDeleteJob,
    handleUpdateStatus,
    resetForm,
  } = useJobPostingsController();

  return (
    <div className="space-y-6">
      <JobPostingsFilterAndGrid
        loading={loading}
        searchTerm={searchTerm}
        filterStatus={filterStatus}
        filteredJobs={filteredJobs}
        onSearchChange={setSearchTerm}
        onFilterStatusChange={setFilterStatus}
        onOpenCreateModal={() => setShowCreateModal(true)}
        onViewDetails={(job) => {
          setSelectedJob(job);
          setShowDetailsModal(true);
        }}
        onToggleStatus={(job) =>
          handleUpdateStatus(
            job.id,
            job.status === "ACTIVE" ? "CLOSED" : "ACTIVE",
          )
        }
        onDeleteJob={handleDeleteJob}
      />

      <CreateJobPostingModal
        open={showCreateModal}
        newJob={newJob}
        onChangeJob={setNewJob}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        onSubmit={handleCreateJob}
      />

      <JobPostingDetailsModal
        open={showDetailsModal}
        selectedJob={selectedJob}
        onClose={() => setShowDetailsModal(false)}
      />
    </div>
  );
};

export default JobPostingsSection;
