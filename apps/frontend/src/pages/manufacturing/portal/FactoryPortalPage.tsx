import React from 'react';
import { RotateCw, ClipboardList, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  useFactoryPortalData,
  FactoryPortalLoginCard,
  FactoryPortalHeader,
  FactoryPortalFilterTabs,
  FactoryAssignmentCard,
  FactoryPortalModals,
} from './factory-portal';

export const FactoryPortalPage: React.FC = () => {
  const {
    token, inputToken, setInputToken, context, filteredAssignments, stats,
    loading, authError, actionSuccess, actionError, statusTab, setStatusTab,
    expandedMaterials, activeModal, setActiveModal, updateExecutedQty, setUpdateExecutedQty,
    updateScrapQty, setUpdateScrapQty, updateReworkQty, setUpdateReworkQty,
    updateNotes, setUpdateNotes, selectedFile, mediaCaption, setMediaCaption,
    mediaPreviewUrl, approvalNotes, setApprovalNotes, issueText, setIssueText,
    submitting, loadPortalData, handleManualLogin, toggleExpandMaterials,
    handleConfirmReceipt, handleStart, openUpdateModal, handleSaveUpdate,
    openMediaModal, handleFileChange, handleUploadMedia, openApprovalModal,
    handleSendApprovalRequest, openIssueModal, handleSendIssue,
  } = useFactoryPortalData();

  if (!token || authError) {
    return (
      <FactoryPortalLoginCard
        authError={authError}
        inputToken={inputToken}
        setInputToken={setInputToken}
        onSubmit={handleManualLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-foreground pb-12" dir="rtl">
      <FactoryPortalHeader
        context={context}
        loading={loading}
        onRefresh={() => loadPortalData(token)}
      />

      <main className="max-w-3xl mx-auto p-3.5 sm:p-5 space-y-4">
        {actionSuccess && (
          <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {actionError && (
          <div className="p-3 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        <FactoryPortalFilterTabs
          statusTab={statusTab}
          setStatusTab={setStatusTab}
          stats={stats}
        />

        {loading ? (
          <div className="p-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
            <RotateCw className="w-7 h-7 animate-spin text-primary" />
            <span className="text-sm">جارٍ تحميل تكليفات المصنع...</span>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/50 flex flex-col items-center justify-center gap-3">
            <ClipboardList className="w-8 h-8 text-muted-foreground" />
            <h3 className="font-bold text-sm text-foreground">لا توجد تكليفات في هذا الفلتر</h3>
            <p className="text-xs text-muted-foreground">
              ستظهر هنا أي مراحل تشغيل جديدة يتم إسنادها لمصنعك من قِبل إدارة الإنتاج.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAssignments.map((asg) => (
              <FactoryAssignmentCard
                key={asg.id}
                asg={asg}
                isExpanded={Boolean(expandedMaterials[asg.id])}
                submitting={submitting}
                onToggleExpandMaterials={toggleExpandMaterials}
                onConfirmReceipt={handleConfirmReceipt}
                onStart={handleStart}
                onOpenUpdateModal={openUpdateModal}
                onOpenMediaModal={openMediaModal}
                onOpenApprovalModal={openApprovalModal}
                onOpenIssueModal={openIssueModal}
              />
            ))}
          </div>
        )}
      </main>

      <FactoryPortalModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        submitting={submitting}
        updateExecutedQty={updateExecutedQty}
        setUpdateExecutedQty={setUpdateExecutedQty}
        updateScrapQty={updateScrapQty}
        setUpdateScrapQty={setUpdateScrapQty}
        updateReworkQty={updateReworkQty}
        setUpdateReworkQty={setUpdateReworkQty}
        updateNotes={updateNotes}
        setUpdateNotes={setUpdateNotes}
        onSaveUpdate={handleSaveUpdate}
        mediaPreviewUrl={mediaPreviewUrl}
        selectedFile={selectedFile}
        mediaCaption={mediaCaption}
        setMediaCaption={setMediaCaption}
        onFileChange={handleFileChange}
        onUploadMedia={handleUploadMedia}
        approvalNotes={approvalNotes}
        setApprovalNotes={setApprovalNotes}
        onSendApprovalRequest={handleSendApprovalRequest}
        issueText={issueText}
        setIssueText={setIssueText}
        onSendIssue={handleSendIssue}
      />
    </div>
  );
};

export default FactoryPortalPage;
