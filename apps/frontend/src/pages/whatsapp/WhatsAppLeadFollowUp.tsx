import React from "react";
import { Layers, RefreshCw, Users, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { WhatsAppPageShell } from "./components/WhatsAppPageShell";
import {
  LeadFollowUpBusinessHoursCard,
  LeadFollowUpCategoriesCard,
  LeadFollowUpCategoryPerformanceCard,
  LeadFollowUpFlowsList,
  LeadFollowUpHintsCard,
  LeadFollowUpKpiGrid,
  LeadFollowUpMonitoringTab,
  useWhatsAppLeadFollowUpController,
} from "./lead-follow-up";

export const WhatsAppLeadFollowUp: React.FC<{ companyId?: string }> = ({ companyId }) => {
  const {
    tx,
    flows,
    categories,
    categoryStats,
    journeys,
    enrollments,
    settings,
    setSettings,
    loading,
    saving,
    expandedFlow,
    editingStep,
    setEditingStep,
    activeTab,
    setActiveTab,
    monFilter,
    setMonFilter,
    newFlowName,
    setNewFlowName,
    newFlowScope,
    setNewFlowScope,
    newFlowCategoryIds,
    setNewFlowCategoryIds,
    showNewFlow,
    setShowNewFlow,
    deleteConfirm,
    setDeleteConfirm,
    loadData,
    toggleFlow,
    createFlow,
    createPresetFlow,
    deleteFlow,
    expandFlow,
    saveStep,
    deleteStep,
    setFlowScope,
    toggleCategory,
    bindCategoryFlow,
    linkCategoryToFlow,
    cancelEnrollment,
    saveSettings,
    statCards,
    formatDate,
  } = useWhatsAppLeadFollowUpController({ companyId });

  return (
    <WhatsAppPageShell
      title={tx("title")}
      description={tx("subtitle") as string}
      icon={Zap}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full h-8 w-8 p-0"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      ) : (
        <div className="space-y-6">
          <LeadFollowUpKpiGrid cards={statCards} />

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 gap-1 rounded-2xl bg-muted/40 p-1">
              <TabsTrigger
                value="flows"
                className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-xs text-xs"
              >
                <Layers className="size-3.5 mr-1.5" /> {tx("tabs.flows")}
              </TabsTrigger>
              <TabsTrigger
                value="monitoring"
                className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-xs text-xs"
              >
                <Users className="size-3.5 mr-1.5" /> {tx("tabs.monitoring")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="flows" className="space-y-6">
              <LeadFollowUpFlowsList
                flows={flows}
                categories={categories}
                expandedFlow={expandedFlow}
                editingStep={editingStep}
                saving={saving}
                newFlowName={newFlowName}
                newFlowScope={newFlowScope}
                newFlowCategoryIds={newFlowCategoryIds}
                showNewFlow={showNewFlow}
                deleteConfirm={deleteConfirm}
                tx={tx}
                onSetShowNewFlow={setShowNewFlow}
                onSetNewFlowName={setNewFlowName}
                onSetNewFlowScope={setNewFlowScope}
                onSetNewFlowCategoryIds={setNewFlowCategoryIds}
                onSetDeleteConfirm={setDeleteConfirm}
                onSetEditingStep={setEditingStep}
                onCreatePresetFlow={createPresetFlow}
                onCreateFlow={createFlow}
                onToggleFlow={toggleFlow}
                onExpandFlow={expandFlow}
                onDeleteFlow={deleteFlow}
                onSaveStep={saveStep}
                onDeleteStep={deleteStep}
                onSetFlowScope={setFlowScope}
                onLinkCategoryToFlow={linkCategoryToFlow}
              />

              <LeadFollowUpCategoriesCard
                categories={categories}
                flows={flows}
                tx={tx}
                onToggleCategory={toggleCategory}
                onBindCategoryFlow={bindCategoryFlow}
              />

              <LeadFollowUpCategoryPerformanceCard
                categoryStats={categoryStats}
                tx={tx}
              />

              <LeadFollowUpBusinessHoursCard
                settings={settings}
                saving={saving}
                tx={tx}
                onUpdateSettings={setSettings}
                onSaveSettings={saveSettings}
              />

              <LeadFollowUpHintsCard tx={tx} />
            </TabsContent>

            <TabsContent value="monitoring">
              <LeadFollowUpMonitoringTab
                journeys={journeys}
                enrollments={enrollments}
                flows={flows}
                monFilter={monFilter}
                tx={tx}
                formatDate={formatDate}
                onSetMonFilter={setMonFilter}
                onCancelEnrollment={cancelEnrollment}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </WhatsAppPageShell>
  );
};

export default WhatsAppLeadFollowUp;
