import React from "react";
import { BusinessPageShell } from "../components/business/BusinessSurface";
import {
  CompanyLinkDeleteDialog,
  CompanyLinkFormDialog,
  CompanyLinkPasswordDialog,
  CompanyLinksError,
  CompanyLinksHeader,
  CompanyLinksList,
  CompanyLinksSkeleton,
  useCompanyLinksController,
} from "./company-links";

const CompanyLinks: React.FC = () => {
  const {
    canManage,
    loading,
    error,
    links,
    dialogOpen,
    setDialogOpen,
    editing,
    form,
    setForm,
    passwordDialogOpen,
    setPasswordDialogOpen,
    shownPassword,
    setShownPassword,
    shareToken,
    shareUrl,
    linkPendingDelete,
    setLinkPendingDelete,
    resetForm,
    copyText,
    openLink,
    saveLink,
    deleteLink,
    showPassword,
    copyPassword,
    generateShareLink,
    revokeShareLink,
    startEditing,
    openModeLabel,
    t,
  } = useCompanyLinksController();

  return (
    <BusinessPageShell className="space-y-4 md:space-y-6" dir="rtl">
      <CompanyLinksHeader
        canManage={canManage}
        shareToken={shareToken}
        shareUrl={shareUrl}
        onOpenCreate={() => {
          resetForm();
          setDialogOpen(true);
        }}
        onCopyShareLink={copyText}
        onGenerateShareLink={generateShareLink}
        onRevokeShareLink={revokeShareLink}
      />

      {loading ? (
        <CompanyLinksSkeleton />
      ) : error ? (
        <CompanyLinksError error={error} />
      ) : (
        <CompanyLinksList
          links={links}
          canManage={canManage}
          openModeLabel={openModeLabel}
          onOpenLink={openLink}
          onCopyUsername={(username) =>
            void copyText(username, t("companyLinks.usernameCopied"))
          }
          onShowPassword={(link) => void showPassword(link)}
          onCopyPassword={(link) => void copyPassword(link)}
          onEdit={startEditing}
          onDelete={(link) => setLinkPendingDelete(link)}
        />
      )}

      <CompanyLinkFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}
        isEditing={Boolean(editing)}
        form={form}
        setForm={setForm}
        onSave={() => void saveLink()}
        onCancel={() => {
          setDialogOpen(false);
          resetForm();
        }}
      />

      <CompanyLinkPasswordDialog
        open={passwordDialogOpen}
        onOpenChange={(open) => {
          setPasswordDialogOpen(open);
          if (!open) {
            setShownPassword("");
          }
        }}
        shownPassword={shownPassword}
        onCopyPassword={() =>
          void copyText(shownPassword, t("companyLinks.passwordCopied"))
        }
        onClose={() => {
          setPasswordDialogOpen(false);
          setShownPassword("");
        }}
      />

      <CompanyLinkDeleteDialog
        linkPendingDelete={linkPendingDelete}
        onOpenChange={(open) => {
          if (!open) {
            setLinkPendingDelete(null);
          }
        }}
        onConfirmDelete={() => void deleteLink()}
      />
    </BusinessPageShell>
  );
};

export default CompanyLinks;
