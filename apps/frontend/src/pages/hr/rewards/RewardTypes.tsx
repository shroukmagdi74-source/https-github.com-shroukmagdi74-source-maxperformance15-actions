import React from "react";
import { Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { ConfirmDialog } from "../../../components/hr/ConfirmDialog";
import {
  useRewardTypesController,
  RewardTypesTable,
  RewardTypeFormDialog,
} from "./reward-types";

const RewardTypes: React.FC = () => {
  const {
    t,
    user,
    types,
    isDialogOpen,
    setIsDialogOpen,
    editingType,
    deleteDialogOpen,
    setDeleteDialogOpen,
    deleteTarget,
    setDeleteTarget,
    deleting,
    formData,
    setFormData,
    resetForm,
    openEdit,
    handleSubmit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleToggleStatus,
  } = useRewardTypesController();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t("rewards.types")}</CardTitle>
          <CardDescription>{t("rewards.pageDescription")}</CardDescription>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 ml-2" />
          {t("rewards.form.addNew")}
        </Button>
      </CardHeader>
      <CardContent>
        <RewardTypesTable
          t={t}
          types={types}
          userRole={user?.role}
          onToggleStatus={handleToggleStatus}
          onEdit={openEdit}
          onDeleteClick={handleDeleteClick}
        />

        <RewardTypeFormDialog
          t={t}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingType={editingType}
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleSubmit}
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            if (!deleting) setDeleteDialogOpen(open);
            if (!open) setDeleteTarget(null);
          }}
          onConfirm={handleDeleteConfirm}
          title={t("rewards.delete.confirmTitle")}
          description={t("rewards.delete.confirmDescription")}
          confirmText={t("rewards.delete.confirmText")}
          type="danger"
          loading={deleting}
          itemName={deleteTarget?.name}
          itemDetails={
            deleteTarget
              ? `${deleteTarget.category} - ${deleteTarget.calculationMethod}`
              : undefined
          }
          consequences={[
            t("rewards.delete.irreversible"),
            t("rewards.delete.linkedRecords"),
            t("rewards.delete.disableInstead"),
          ]}
        />
      </CardContent>
    </Card>
  );
};

export default RewardTypes;
