import React from "react";
import { CompanyMobileActionsSheet } from "./CompanyMobileActionsSheet";
import { CompanyFormModal } from "./CompanyFormModal";
import { FollowUpModal } from "./FollowUpModal";
import { CompanyUsersModal } from "./CompanyUsersModal";
import { CompanyFacebookPagesModal } from "./CompanyFacebookPagesModal";
import { CompanyTransferOwnershipModal } from "./CompanyTransferOwnershipModal";
import { CompanyAddEmployeeModal } from "./CompanyAddEmployeeModal";
import { CompanyDeleteModal } from "./CompanyDeleteModal";
import type { Company } from "../types";

interface CompanyModalsContainerProps {
  isMobile: boolean;
  adminId: string | null;
  modals: any;
  followUpOwners: { id: string; firstName: string; lastName: string; role: string }[];
  loadingFollowUpOwners: boolean;
  onOpenDetails: (company: Company) => void;
}

export const CompanyModalsContainer: React.FC<CompanyModalsContainerProps> = ({
  isMobile,
  adminId,
  modals,
  followUpOwners,
  loadingFollowUpOwners,
  onOpenDetails,
}) => {
  return (
    <>
      <CompanyMobileActionsSheet
        isOpen={modals.actionsSheetOpen}
        onOpenChange={modals.setActionsSheetOpen}
        company={modals.actionsCompany}
        onOpenDetails={onOpenDetails}
        onOpenFollowUp={modals.handleOpenFollowUp}
        onEdit={modals.handleEditCompany}
        onOpenUsers={modals.handleOpenUsers}
        onOpenFacebookPages={modals.handleOpenFacebookPages}
        onTransferOwnership={modals.handleTransferOwnership}
        onAddEmployee={modals.handleAddEmployee}
        onLoginAsAdmin={modals.handleLoginAsAdmin}
        onDelete={modals.handleDeleteCompany}
      />

      <CompanyFormModal
        isOpen={modals.companyModal.open}
        mode={modals.companyModal.mode}
        isMobile={isMobile}
        companyForm={modals.companyForm}
        companyFormErrors={modals.companyFormErrors}
        specialties={modals.specialties}
        saving={modals.savingCompany}
        onClose={() => modals.setCompanyModal((prev: any) => ({ ...prev, open: false }))}
        onChangeForm={modals.setCompanyForm}
        onSave={modals.handleSaveCompany}
      />

      <FollowUpModal
        isOpen={modals.followUpOpen}
        isMobile={isMobile}
        company={modals.followUpCompany}
        followUp={modals.followUpCompany?.followUp || null}
        reminder={modals.followUpCompany?.followUpReminder || null}
        automation={modals.followUpCompany?.followUpAutomation || null}
        owners={followUpOwners}
        loadingOwners={loadingFollowUpOwners}
        form={modals.followUpForm}
        saving={modals.savingFollowUp}
        currentAdminId={adminId}
        onClose={() => modals.setFollowUpOpen(false)}
        onChangeForm={modals.setFollowUpForm}
        onSave={modals.handleSaveFollowUp}
        onLogReminder={() =>
          modals.followUpCompany && modals.handleRunFollowUpAction(modals.followUpCompany, "remind")
        }
        onLogEscalation={() =>
          modals.followUpCompany && modals.handleRunFollowUpAction(modals.followUpCompany, "escalate")
        }
        onAssignSelf={modals.assignFollowUpSelf}
      />

      <CompanyUsersModal
        isOpen={modals.usersOpen}
        isMobile={isMobile}
        company={modals.userCompany}
        onClose={() => modals.setUsersOpen(false)}
      />

      <CompanyFacebookPagesModal
        isOpen={modals.pagesOpen}
        isMobile={isMobile}
        company={modals.pagesCompany}
        pages={modals.pages}
        loading={modals.loadingPages}
        onClose={() => modals.setPagesOpen(false)}
      />

      <CompanyTransferOwnershipModal
        isOpen={modals.ownerTransferOpen}
        isMobile={isMobile}
        company={modals.ownerTransferCompany}
        targetUserId={modals.ownerTransferTarget}
        transferring={modals.transferring}
        onClose={() => modals.setOwnerTransferOpen(false)}
        onChangeTarget={modals.setOwnerTransferTarget}
        onConfirm={modals.handleTransferConfirm}
      />

      <CompanyAddEmployeeModal
        isOpen={modals.ownersOpen}
        isMobile={isMobile}
        company={modals.activeCompany}
        employeeForm={modals.employeeForm}
        employeeErrors={modals.employeeErrors}
        saving={modals.savingEmployee}
        onClose={() => modals.setOwnersOpen(false)}
        onChangeForm={modals.setEmployeeForm}
        onSubmit={modals.handleAddEmployeeSubmit}
      />

      <CompanyDeleteModal
        isOpen={modals.deleteDialog.open}
        isMobile={isMobile}
        ids={modals.deleteDialog.ids}
        name={modals.deleteDialog.name}
        deleting={modals.deleting}
        onClose={() => modals.setDeleteDialog({ open: false, ids: [], name: "" })}
        onConfirm={modals.handleDeleteConfirm}
      />
    </>
  );
};
