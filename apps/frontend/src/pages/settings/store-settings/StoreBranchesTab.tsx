import React from "react";
import { BranchesSection } from "../../../components/store/BranchesSection";
import { BranchModal } from "../../../components/store/BranchModal";
import { Branch } from "../../../services/storeSettingsService";

interface StoreBranchesTabProps {
  branches: Branch[];
  onAdd: () => void;
  onEdit: (branch: Branch) => void;
  onDelete: (id: string) => void;
  showBranchModal: boolean;
  onCloseBranchModal: () => void;
  onSaveBranch: () => void;
  branchForm: Partial<Branch>;
  onBranchFormChange: React.Dispatch<React.SetStateAction<Partial<Branch>>>;
  isEditingBranch: boolean;
}

export const StoreBranchesTab: React.FC<StoreBranchesTabProps> = ({
  branches,
  onAdd,
  onEdit,
  onDelete,
  showBranchModal,
  onCloseBranchModal,
  onSaveBranch,
  branchForm,
  onBranchFormChange,
  isEditingBranch,
}) => {
  return (
    <>
      <BranchesSection
        branches={branches}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      {showBranchModal && (
        <BranchModal
          onClose={onCloseBranchModal}
          onSave={onSaveBranch}
          branch={branchForm}
          onChange={onBranchFormChange}
          isEditing={isEditingBranch}
        />
      )}
    </>
  );
};
