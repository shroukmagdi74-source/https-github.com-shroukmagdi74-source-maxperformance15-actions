import { useState, useEffect, useCallback, useMemo } from "react";
import { companyAwareApi } from "../../../../../services/companyAwareApi";
import { tToast } from "../../../../../utils/i18n-toast";
import { JobPosting, NewJobForm } from "./types";
import { createInitialJobForm } from "./helpers";

export const useJobPostingsController = () => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [newJob, setNewJob] = useState<NewJobForm>(createInitialJobForm);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await companyAwareApi.get("/hr/recruitment/jobs");
      if (response.data.success) {
        setJobs(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const resetForm = () => {
    setNewJob(createInitialJobForm());
  };

  const handleCreateJob = async () => {
    try {
      const jobData = {
        ...newJob,
        requirements: newJob.requirements
          .split("\n")
          .filter((r) => r.trim()),
        responsibilities: newJob.responsibilities
          .split("\n")
          .filter((r) => r.trim()),
        salaryMin: newJob.salaryMin ? parseFloat(newJob.salaryMin) : undefined,
        salaryMax: newJob.salaryMax ? parseFloat(newJob.salaryMax) : undefined,
      };

      const response = await companyAwareApi.post(
        "/hr/recruitment/jobs",
        jobData,
      );
      if (response.data.success) {
        tToast.success("JobPostingsSection.success_create_66f5");
        setShowCreateModal(false);
        fetchJobs();
        resetForm();
      }
    } catch (error) {
      tToast.error("JobPostingsSection.failed_create_5462");
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الوظيفة؟")) return;

    try {
      await companyAwareApi.delete(`/hr/recruitment/jobs/${jobId}`);
      tToast.success("JobPostingsSection.success_delete_0815");
      fetchJobs();
    } catch (error) {
      tToast.error("JobPostingsSection.failed_delete_fc8a");
    }
  };

  const handleUpdateStatus = async (jobId: string, status: string) => {
    try {
      await companyAwareApi.put(`/hr/recruitment/jobs/${jobId}/status`, {
        status,
      });
      tToast.success("JobPostingsSection.success_update_status_49df");
      fetchJobs();
    } catch (error) {
      tToast.error("JobPostingsSection.failed_update_22de");
    }
  };

  const filteredJobs = useMemo(
    () =>
      jobs.filter((job) => {
        const matchesSearch =
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.department.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter =
          filterStatus === "all" || job.status === filterStatus;
        return matchesSearch && matchesFilter;
      }),
    [jobs, searchTerm, filterStatus],
  );

  return {
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
  };
};
