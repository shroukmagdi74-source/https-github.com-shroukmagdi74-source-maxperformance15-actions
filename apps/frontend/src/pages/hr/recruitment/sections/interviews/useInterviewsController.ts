import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { companyAwareApi } from "../../../../../services/companyAwareApi";
import { tToast } from "../../../../../utils/i18n-toast";
import {
  Interview,
  InterviewApplicant,
  InterviewJob,
  NewInterviewForm,
} from "./types";
import { createInitialInterviewForm } from "./helpers";

export const useInterviewsController = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [applicants, setApplicants] = useState<InterviewApplicant[]>([]);
  const [jobs, setJobs] = useState<InterviewJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const [newInterview, setNewInterview] = useState<NewInterviewForm>(
    createInitialInterviewForm,
  );
  const [interviewerInput, setInterviewerInput] = useState("");

  const fetchInterviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await companyAwareApi.get("/hr/recruitment/interviews");
      if (response.data.success) {
        setInterviews(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching interviews:", error);
      tToast.error("InterviewsSection.failed_fetch_cbf5");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchApplicants = useCallback(async () => {
    try {
      const response = await companyAwareApi.get("/hr/recruitment/applicants");
      if (response.data.success) {
        setApplicants(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching applicants:", error);
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      const response = await companyAwareApi.get("/hr/recruitment/jobs");
      if (response.data.success) {
        setJobs(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  }, []);

  useEffect(() => {
    fetchInterviews();
    fetchApplicants();
    fetchJobs();
  }, [fetchInterviews, fetchApplicants, fetchJobs]);

  const resetForm = () => {
    setNewInterview(createInitialInterviewForm());
    setInterviewerInput("");
  };

  const handleScheduleInterview = async () => {
    try {
      if (
        !newInterview.applicantId ||
        !newInterview.jobId ||
        !newInterview.date ||
        !newInterview.time
      ) {
        tToast.error("InterviewsSection.msg_faf7");
        return;
      }

      const payload = {
        ...newInterview,
        interviewers: newInterview.interviewers,
      };

      const response = await companyAwareApi.post(
        "/hr/recruitment/interviews",
        payload,
      );

      if (response.data.success) {
        tToast.success("InterviewsSection.msg_d55d");
        setShowScheduleModal(false);
        resetForm();
        fetchInterviews();
      }
    } catch (error: any) {
      console.error("Error scheduling interview:", error);
      toast.error(error.response?.data?.message || "فشل في جدولة المقابلة");
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const response = await companyAwareApi.put(
        `/hr/recruitment/interviews/${id}/status`,
        { status },
      );
      if (response.data.success) {
        tToast.success("InterviewsSection.success_update_a5d2");
        fetchInterviews();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      tToast.error("InterviewsSection.failed_update_fa1c");
    }
  };

  const addInterviewer = () => {
    if (interviewerInput.trim()) {
      setNewInterview((prev) => ({
        ...prev,
        interviewers: [...prev.interviewers, interviewerInput.trim()],
      }));
      setInterviewerInput("");
    }
  };

  const removeInterviewer = (index: number) => {
    setNewInterview((prev) => {
      const updated = [...prev.interviewers];
      updated.splice(index, 1);
      return { ...prev, interviewers: updated };
    });
  };

  const getApplicantsForJob = () => {
    if (!newInterview.jobId) return [];
    return applicants.filter((app) => app.jobId === newInterview.jobId);
  };

  return {
    interviews,
    jobs,
    loading,
    showScheduleModal,
    setShowScheduleModal,
    newInterview,
    setNewInterview,
    interviewerInput,
    setInterviewerInput,
    handleScheduleInterview,
    handleUpdateStatus,
    resetForm,
    addInterviewer,
    removeInterviewer,
    getApplicantsForJob,
  };
};
