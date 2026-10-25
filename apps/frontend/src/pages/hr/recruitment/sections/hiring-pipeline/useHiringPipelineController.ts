import { useEffect, useState } from "react";
import { toast } from "sonner";
import { companyAwareApi } from "../../../../../services/companyAwareApi";
import { tToast } from "../../../../../utils/i18n-toast";
import { PipelineStage, StageApplicant } from "./types";
import {
  DEFAULT_PIPELINE_STAGES,
  normalizeStageApplicant,
} from "./helpers";

export const useHiringPipelineController = () => {
  const [stages, setStages] = useState<PipelineStage[]>(
    DEFAULT_PIPELINE_STAGES,
  );
  const [selectedStageId, setSelectedStageId] = useState("NEW");
  const [stageApplicants, setStageApplicants] = useState<StageApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [stageApplicantsLoading, setStageApplicantsLoading] = useState(false);
  const [deletingApplicantId, setDeletingApplicantId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    void fetchPipelineStats();
  }, []);

  useEffect(() => {
    if (selectedStageId) {
      void fetchStageApplicants(selectedStageId);
    }
  }, [selectedStageId]);

  const fetchPipelineStats = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const response = await companyAwareApi.get(
        "/hr/recruitment/pipeline-stats",
      );

      if (response.data.success) {
        const incomingStages = Array.isArray(response.data.data)
          ? response.data.data
          : [];

        const normalizedStages = DEFAULT_PIPELINE_STAGES.map((defaultStage) => {
          const matchingStage = incomingStages.find(
            (stage: PipelineStage) => stage.id === defaultStage.id,
          );

          return matchingStage
            ? { ...defaultStage, ...matchingStage }
            : defaultStage;
        });

        setStages(normalizedStages);
        setSelectedStageId((currentStageId) => {
          if (normalizedStages.some((stage) => stage.id === currentStageId)) {
            return currentStageId;
          }

          return normalizedStages.find((stage) => stage.count > 0)?.id || "NEW";
        });
      }
    } catch (error) {
      console.error("Error fetching pipeline stats:", error);
      setStages(DEFAULT_PIPELINE_STAGES);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const fetchStageApplicants = async (status: string) => {
    try {
      setStageApplicantsLoading(true);
      const response = await companyAwareApi.get("/hr/recruitment/applicants", {
        params: { status, limit: "all" },
      });

      if (response.data.success) {
        setStageApplicants(
          (response.data.data || []).map(normalizeStageApplicant),
        );
      } else {
        setStageApplicants([]);
      }
    } catch (error) {
      console.error("Error fetching stage applicants:", error);
      setStageApplicants([]);
    } finally {
      setStageApplicantsLoading(false);
    }
  };

  const handleUpdateStatus = async (applicantId: string, newStatus: string) => {
    try {
      setStageApplicantsLoading(true);
      const response = await companyAwareApi.put(
        `/hr/recruitment/applicants/${applicantId}/status`,
        { status: newStatus },
      );
      if (response.data.success) {
        tToast.success("HiringPipelineSection.msg_875d");
        await Promise.all([
          fetchPipelineStats(false),
          fetchStageApplicants(selectedStageId),
        ]);
      } else {
        tToast.error("HiringPipelineSection.msg_a559");
        setStageApplicantsLoading(false);
      }
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error(error.response?.data?.message || "حدث خطأ أثناء نقل المتقدم");
      setStageApplicantsLoading(false);
    }
  };

  const handleDeleteApplicant = async (applicant: StageApplicant) => {
    const confirmed = window.confirm(
      `هل تريدين حذف ${applicant.name} من مسار التوظيف؟`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingApplicantId(applicant.id);
      const response = await companyAwareApi.delete(
        `/hr/recruitment/applicants/${applicant.id}`,
      );

      if (response.data.success) {
        tToast.success("HiringPipelineSection.success_delete_28f8");
        setStageApplicants((currentApplicants) =>
          currentApplicants.filter(
            (currentApplicant) => currentApplicant.id !== applicant.id,
          ),
        );
        await Promise.all([
          fetchPipelineStats(false),
          fetchStageApplicants(selectedStageId),
        ]);
      } else {
        tToast.error("HiringPipelineSection.failed_delete_15ad");
      }
    } catch (error: any) {
      console.error("Error deleting applicant:", error);
      toast.error(error.response?.data?.message || "حدث خطأ أثناء حذف المتقدم");
    } finally {
      setDeletingApplicantId(null);
    }
  };

  const totalApplicants = stages.reduce((sum, stage) => sum + stage.count, 0);
  const newApplicants = stages.find((stage) => stage.id === "NEW")?.count || 0;
  const hiredApplicants =
    stages.find((stage) => stage.id === "HIRED")?.count || 0;
  const inInterviewStages = stages
    .filter((stage) =>
      ["INTERVIEW_SCHEDULED", "INTERVIEWED"].includes(stage.id),
    )
    .reduce((sum, stage) => sum + stage.count, 0);
  const activePipelineApplicants = stages
    .filter((stage) => !["HIRED", "REJECTED"].includes(stage.id))
    .reduce((sum, stage) => sum + stage.count, 0);
  const conversionRate =
    newApplicants > 0 ? Math.round((hiredApplicants / newApplicants) * 100) : 0;
  const selectedStage =
    stages.find((stage) => stage.id === selectedStageId) || stages[0];

  return {
    stages,
    selectedStageId,
    setSelectedStageId,
    stageApplicants,
    loading,
    stageApplicantsLoading,
    deletingApplicantId,
    handleUpdateStatus,
    handleDeleteApplicant,
    totalApplicants,
    hiredApplicants,
    inInterviewStages,
    activePipelineApplicants,
    conversionRate,
    selectedStage,
  };
};
