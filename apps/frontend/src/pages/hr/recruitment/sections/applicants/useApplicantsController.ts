import { useState, useEffect } from "react";
import { companyAwareApi } from "../../../../../services/companyAwareApi";
import { toast } from "sonner";
import { tToast } from "../../../../../utils/i18n-toast";
import { Applicant, NewApplicantForm } from "./types";
import { filterApplicantsList, normalizeApplicant } from "./helpers";

export const useApplicantsController = () => {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(
    null
  );
  const [deletingApplicantId, setDeletingApplicantId] = useState<string | null>(
    null
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [newApplicant, setNewApplicant] = useState<NewApplicantForm>({
    name: "",
    email: "",
    phone: "",
    jobId: "",
    experience: 0,
    education: "",
    skills: "",
    coverLetter: "",
    resumeUrl: "",
  });

  useEffect(() => {
    fetchApplicants();
    fetchJobs();
  }, []);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const response = await companyAwareApi.get("/hr/recruitment/applicants", {
        params: { limit: "all" },
      });
      if (response.data.success) {
        setApplicants((response.data.data || []).map(normalizeApplicant));
      }
    } catch (error) {
      console.error("Error fetching applicants:", error);
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApplicant = async (applicant: Applicant) => {
    const confirmed = window.confirm(`هل تريدين حذف ${applicant.name}؟`);

    if (!confirmed) {
      return;
    }

    try {
      setDeletingApplicantId(applicant.id);
      const response = await companyAwareApi.delete(
        `/hr/recruitment/applicants/${applicant.id}`
      );

      if (response.data.success) {
        tToast.success("ApplicantsSection.success_delete_026c");
        setApplicants((currentApplicants) =>
          currentApplicants.filter(
            (currentApplicant) => currentApplicant.id !== applicant.id
          )
        );

        if (selectedApplicant?.id === applicant.id) {
          setSelectedApplicant(null);
          setShowDetailsModal(false);
        }

        fetchApplicants();
      } else {
        tToast.error("ApplicantsSection.failed_delete_951f");
      }
    } catch (error: any) {
      console.error("Error deleting applicant:", error);
      toast.error(error.response?.data?.message || "حدث خطأ أثناء حذف المتقدم");
    } finally {
      setDeletingApplicantId(null);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await companyAwareApi.get("/hr/recruitment/jobs");
      if (response.data.success) {
        setJobs(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const handleUpdateStatus = async (applicantId: string, status: string) => {
    try {
      await companyAwareApi.put(
        `/hr/recruitment/applicants/${applicantId}/status`,
        { status }
      );
      tToast.success("ApplicantsSection.success_update_status_7ae4");
      fetchApplicants();
    } catch {
      tToast.error("ApplicantsSection.failed_update_a9eb");
    }
  };

  const resetAddForm = () => {
    setNewApplicant({
      name: "",
      email: "",
      phone: "",
      jobId: "",
      experience: 0,
      education: "",
      skills: "",
      coverLetter: "",
      resumeUrl: "",
    });
  };

  const handleAddApplicant = async () => {
    try {
      if (!newApplicant.name || !newApplicant.email || !newApplicant.jobId) {
        tToast.error("ApplicantsSection.msg_0d23");
        return;
      }

      const payload = {
        ...newApplicant,
        skills: newApplicant.skills
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
      };

      const response = await companyAwareApi.post(
        "/hr/recruitment/applicants",
        payload
      );
      if (response.data.success) {
        tToast.success("ApplicantsSection.success_add_3282");
        setShowAddModal(false);
        resetAddForm();
        fetchApplicants();
      }
    } catch (error: any) {
      console.error("Error adding applicant:", error);
      toast.error(error.response?.data?.message || "فشل في إضافة المتقدم");
    }
  };

  const filteredApplicants = filterApplicantsList(
    applicants,
    searchTerm,
    filterStatus
  );

  return {
    applicants,
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
  };
};
