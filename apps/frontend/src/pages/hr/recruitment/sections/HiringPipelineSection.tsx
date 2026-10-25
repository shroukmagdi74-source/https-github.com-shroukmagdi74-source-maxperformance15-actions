import React from "react";
import {
  useHiringPipelineController,
  PipelineStagesAndApplicantsBoard,
  PipelineStatsSummaryGrid,
} from "./hiring-pipeline";

const HiringPipelineSection: React.FC = () => {
  const {
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
  } = useHiringPipelineController();

  return (
    <div className="space-y-6">
      <PipelineStagesAndApplicantsBoard
        stages={stages}
        selectedStageId={selectedStageId}
        onSelectStageId={setSelectedStageId}
        selectedStage={selectedStage}
        totalApplicants={totalApplicants}
        loading={loading}
        stageApplicantsLoading={stageApplicantsLoading}
        stageApplicants={stageApplicants}
        deletingApplicantId={deletingApplicantId}
        onUpdateStatus={handleUpdateStatus}
        onDeleteApplicant={handleDeleteApplicant}
      />

      <PipelineStatsSummaryGrid
        totalApplicants={totalApplicants}
        activePipelineApplicants={activePipelineApplicants}
        inInterviewStages={inInterviewStages}
        hiredApplicants={hiredApplicants}
        conversionRate={conversionRate}
      />
    </div>
  );
};

export default HiringPipelineSection;
