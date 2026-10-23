import React from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useWhatsAppCustomerJourneyController,
  JourneyPageTopBar,
  JourneyFlowsListCard,
  JourneyStepsCanvasCard,
  JourneyMonitoringGridCard,
  JourneyActionDialogsHost,
  floatingNoticeBaseClass,
  noticeStyles,
} from "./customer-journey";

export interface WhatsAppCustomerJourneyProps {
  FlowCanvasComponent?: React.ComponentType<any>;
}

const WhatsAppCustomerJourney: React.FC<WhatsAppCustomerJourneyProps> = ({
  FlowCanvasComponent,
}) => {
  const {
    t,
    i18n,
    isRtl,
    isAdmin,
    copilot,
    flows,
    filteredFlows,
    selectedFlow,
    steps,
    setSteps,
    journeys,
    loading,
    refreshing,
    stepsLoading,
    submitting,
    deleteLoading,
    searchTerm,
    setSearchTerm,
    notice,
    deleteTarget,
    setDeleteTarget,
    flowDialogOpen,
    setFlowDialogOpen,
    currentFlow,
    setCurrentFlow,
    stepDialogOpen,
    setStepDialogOpen,
    currentStep,
    setCurrentStep,
    selectedJourney,
    setSelectedJourney,
    metaModalOpen,
    setMetaModalOpen,
    timelineOpen,
    setTimelineOpen,
    handleRefreshWorkspace,
    handleFlowClick,
    openCreateFlowDialog,
    openEditFlowDialog,
    openCreateStepDialog,
    openEditStepDialog,
    handleSaveFlow,
    handleSaveStep,
    handleConfirmDelete,
  } = useWhatsAppCustomerJourneyController();

  if (loading) {
    return (
      <section
        dir={i18n.dir()}
        className="min-h-full space-y-space-4 overflow-x-hidden px-space-1 py-space-2 pb-[calc(var(--space-4)+env(safe-area-inset-bottom))] sm:space-y-space-6 sm:px-space-6 sm:py-space-4 lg:px-space-8"
      >
        <JourneyPageTopBar
          backHref="/whatsapp/notifications"
          backLabel={t("common.back") as string}
          isRtl={isRtl}
          refreshing={refreshing}
          onRefresh={() => void handleRefreshWorkspace()}
          onOpenTimeline={() => setTimelineOpen(true)}
          onOpenCopilot={() => copilot.setOpen(true)}
          copilotTitle={t("whatsappJourney.copilot.title")}
          isAdmin={isAdmin}
          onAddNewFlow={openCreateFlowDialog}
          refreshLabel={t("common.refresh")}
          addNewFlowLabel={t("whatsappJourney.flows.addNew")}
        />
        <div className="space-y-4">
          <Skeleton className="h-[26rem] rounded-2xl sm:rounded-3xl" />
          <Skeleton className="h-[22rem] rounded-2xl sm:rounded-3xl" />
          <Skeleton className="h-56 rounded-2xl sm:rounded-3xl" />
        </div>
      </section>
    );
  }

  return (
    <section
      dir={i18n.dir()}
      className="min-h-full space-y-space-4 overflow-x-hidden px-space-1 py-space-2 pb-[calc(var(--space-4)+env(safe-area-inset-bottom))] sm:space-y-space-6 sm:px-space-6 sm:py-space-4 lg:px-space-8"
    >
      <JourneyPageTopBar
        backHref="/whatsapp/notifications"
        backLabel={t("common.back") as string}
        isRtl={isRtl}
        refreshing={refreshing}
        onRefresh={() => void handleRefreshWorkspace()}
        onOpenTimeline={() => setTimelineOpen(true)}
        onOpenCopilot={() => copilot.setOpen(true)}
        copilotTitle={t("whatsappJourney.copilot.title")}
        isAdmin={isAdmin}
        onAddNewFlow={openCreateFlowDialog}
        refreshLabel={t("common.refresh")}
        addNewFlowLabel={t("whatsappJourney.flows.addNew")}
      />

      {notice ? (
        <div className="fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
          <Alert
            className={cn(
              floatingNoticeBaseClass,
              noticeStyles[notice.tone],
              "w-full max-w-md",
            )}
          >
            {notice.tone === "success" ? (
              <CheckCircle className="size-4" />
            ) : (
              <AlertCircle className="size-4" />
            )}
            <AlertTitle>
              {notice.tone === "success"
                ? t("common.success")
                : t("common.error")}
            </AlertTitle>
            <AlertDescription>{notice.message}</AlertDescription>
          </Alert>
        </div>
      ) : null}

      {/* MASTER-DETAIL: flows + steps editor side by side */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.55fr)]">
        <JourneyFlowsListCard
          flows={flows}
          filteredFlows={filteredFlows}
          selectedFlow={selectedFlow}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSelectFlow={handleFlowClick}
          onEditFlow={openEditFlowDialog}
          onDeleteFlow={(flow) =>
            setDeleteTarget({ type: "flow", id: flow.id })
          }
          onOpenCreateFlow={openCreateFlowDialog}
          isAdmin={isAdmin}
          isRtl={isRtl}
          t={t}
        />

        <JourneyStepsCanvasCard
          selectedFlow={selectedFlow}
          steps={steps}
          stepsLoading={stepsLoading}
          isAdmin={isAdmin}
          onOpenCopilot={() => copilot.setOpen(true)}
          onReorderSteps={setSteps}
          onEditStep={openEditStepDialog}
          onAddStep={openCreateStepDialog}
          onDeleteStep={(step) =>
            setDeleteTarget({ type: "step", id: step.id || "" })
          }
          onOpenCreateFlow={openCreateFlowDialog}
          t={t}
          FlowCanvasComponent={FlowCanvasComponent}
        />
      </div>

      {/* MONITORING — full width below */}
      <JourneyMonitoringGridCard
        journeys={journeys}
        onSelectJourney={setSelectedJourney}
        t={t}
      />

      {/* DIALOGS */}
      <JourneyActionDialogsHost
        selectedJourney={selectedJourney}
        onCloseJourneyDialog={() => setSelectedJourney(null)}
        flowDialogOpen={flowDialogOpen}
        onFlowDialogChange={setFlowDialogOpen}
        currentFlow={currentFlow}
        setCurrentFlow={setCurrentFlow}
        onSaveFlow={() => void handleSaveFlow()}
        submitting={submitting}
        stepDialogOpen={stepDialogOpen}
        onStepDialogChange={setStepDialogOpen}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        onSaveStep={() => void handleSaveStep()}
        steps={steps}
        deleteTarget={deleteTarget}
        onDeleteTargetChange={setDeleteTarget}
        onConfirmDelete={() => void handleConfirmDelete()}
        deleteLoading={deleteLoading}
        copilotOpen={copilot.open}
        onCopilotClose={() => copilot.setOpen(false)}
        selectedFlow={selectedFlow}
        onOpenCreateStepDialog={openCreateStepDialog}
        onOpenEditStepDialog={openEditStepDialog}
        metaModalOpen={metaModalOpen}
        onOpenMetaModal={() => setMetaModalOpen(true)}
        onMetaModalClose={() => setMetaModalOpen(false)}
        onPickMetaTemplate={(content) =>
          setCurrentStep((previous) =>
            previous
              ? { ...previous, content: content || previous.content }
              : previous,
          )
        }
        timelineOpen={timelineOpen}
        onTimelineClose={() => setTimelineOpen(false)}
        t={t}
      />
    </section>
  );
};

export default WhatsAppCustomerJourney;
