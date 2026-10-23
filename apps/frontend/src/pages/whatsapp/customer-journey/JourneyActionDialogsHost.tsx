import React from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CopilotDrawer } from "../components/journey/CopilotDrawer";
import MetaTemplatesModal from "../../customers/components/MetaTemplatesModal";
import CustomerMessageTimeline from "../components/CustomerMessageTimeline";
import { DeleteTarget, Flow, Journey, Step } from "./types";
import { JourneyDetailsDialog } from "./dialogs/JourneyDetailsDialog";
import { FlowEditDialog } from "./dialogs/FlowEditDialog";
import { StepEditDialog } from "./dialogs/StepEditDialog";

export interface JourneyActionDialogsHostProps {
  selectedJourney: Journey | null;
  onCloseJourneyDialog: () => void;
  flowDialogOpen: boolean;
  onFlowDialogChange: (open: boolean) => void;
  currentFlow: Partial<Flow>;
  setCurrentFlow: React.Dispatch<React.SetStateAction<Partial<Flow>>>;
  onSaveFlow: () => void;
  submitting: boolean;
  stepDialogOpen: boolean;
  onStepDialogChange: (open: boolean) => void;
  currentStep: Partial<Step>;
  setCurrentStep: React.Dispatch<React.SetStateAction<Partial<Step>>>;
  onSaveStep: () => void;
  steps: Step[];
  deleteTarget: DeleteTarget;
  onDeleteTargetChange: (target: DeleteTarget) => void;
  onConfirmDelete: () => void;
  deleteLoading: boolean;
  copilotOpen: boolean;
  onCopilotClose: () => void;
  selectedFlow: Flow | null;
  onOpenCreateStepDialog: () => void;
  onOpenEditStepDialog: (step: Step) => void;
  metaModalOpen: boolean;
  onOpenMetaModal: () => void;
  onMetaModalClose: () => void;
  onPickMetaTemplate: (content: string) => void;
  timelineOpen: boolean;
  onTimelineClose: () => void;
  t: (key: string, options?: any) => string;
}

export const JourneyActionDialogsHost: React.FC<JourneyActionDialogsHostProps> = ({
  selectedJourney,
  onCloseJourneyDialog,
  flowDialogOpen,
  onFlowDialogChange,
  currentFlow,
  setCurrentFlow,
  onSaveFlow,
  submitting,
  stepDialogOpen,
  onStepDialogChange,
  currentStep,
  setCurrentStep,
  onSaveStep,
  steps,
  deleteTarget,
  onDeleteTargetChange,
  onConfirmDelete,
  deleteLoading,
  copilotOpen,
  onCopilotClose,
  selectedFlow,
  onOpenCreateStepDialog,
  onOpenEditStepDialog,
  metaModalOpen,
  onOpenMetaModal,
  onMetaModalClose,
  onPickMetaTemplate,
  timelineOpen,
  onTimelineClose,
  t,
}) => {
  const flowDeleteTitle =
    deleteTarget?.type === "flow"
      ? t("whatsappJourney.dialogs.deleteFlowTitle")
      : t("whatsappJourney.dialogs.deleteStepTitle");
  const flowDeleteDescription =
    deleteTarget?.type === "flow"
      ? t("whatsappJourney.dialogs.deleteFlowContent")
      : t("whatsappJourney.dialogs.deleteStepContent");

  return (
    <>
      {/* ─── Journey Details Dialog ─── */}
      <JourneyDetailsDialog
        journey={selectedJourney}
        open={Boolean(selectedJourney)}
        onClose={onCloseJourneyDialog}
        t={t}
      />

      {/* ─── Flow Create / Edit Dialog ─── */}
      <FlowEditDialog
        open={flowDialogOpen}
        onOpenChange={onFlowDialogChange}
        currentFlow={currentFlow}
        setCurrentFlow={setCurrentFlow}
        onSaveFlow={onSaveFlow}
        submitting={submitting}
        t={t}
      />

      {/* ─── Step Create / Edit Dialog ─── */}
      <StepEditDialog
        open={stepDialogOpen}
        onOpenChange={onStepDialogChange}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        onSaveStep={onSaveStep}
        submitting={submitting}
        steps={steps}
        onOpenMetaModal={onOpenMetaModal}
        t={t}
      />

      {/* ─── Delete Confirmation Alert Dialog ─── */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) onDeleteTargetChange(null);
        }}
      >
        <AlertDialogContent
          size="sm"
          className="rounded-3xl border-[color:var(--shell-control-border)] bg-[var(--app-panel-bg)]"
        >
          <AlertDialogHeader>
            <AlertDialogMedia className="rounded-2xl bg-rose-500/10 text-rose-700 dark:text-rose-200">
              <Trash2 className="size-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>{flowDeleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>{flowDeleteDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="rounded-b-3xl border-t border-[color:color-mix(in_srgb,var(--shell-control-border)_72%,transparent)] bg-[color:color-mix(in_srgb,var(--color-background)_86%,var(--shell-control-bg)_14%)]">
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteLoading}
              onClick={onConfirmDelete}
            >
              {deleteLoading ? (
                <RefreshCw className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Copilot Drawer ─── */}
      <CopilotDrawer
        open={copilotOpen}
        onClose={onCopilotClose}
        flowId={selectedFlow?.id}
        flowName={selectedFlow?.name}
        onApplySuggestion={(s) => {
          if (s.kind === "create-step") {
            onOpenCreateStepDialog();
          } else if (s.kind === "edit-step" && s.payload) {
            const target = steps.find((st) => st.id === s.payload?.["stepId"]);
            if (target) onOpenEditStepDialog(target);
          }
        }}
      />

      {/* ─── Meta Templates Modal ─── */}
      <MetaTemplatesModal
        open={metaModalOpen}
        onClose={onMetaModalClose}
        onPick={onPickMetaTemplate}
        title="قوالب ميتا للسلاسل"
      />

      {/* ─── Customer Message Timeline Drawer ─── */}
      <CustomerMessageTimeline open={timelineOpen} onClose={onTimelineClose} />
    </>
  );
};
