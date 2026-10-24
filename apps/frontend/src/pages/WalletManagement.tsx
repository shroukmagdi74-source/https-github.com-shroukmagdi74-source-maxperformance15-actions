import React from "react";
import { Building2, CreditCard, ReceiptText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type WalletTab,
  INITIAL_FUNDS_FORM,
  INITIAL_WALLET_FORM,
  formatCurrency,
  useWalletManagementController,
  WalletManagementHeader,
  WalletTelemetryRibbon,
  WalletNumbersSection,
  PendingReceiptsSection,
  CompanyWalletsSection,
  WalletNumberDialog,
  AddFundsDialog,
  ReceiptReviewDialog,
  WalletDeleteConfirmDialog,
} from "./wallet-management";

const WalletManagement: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    walletNumbers,
    pendingReceipts,
    loadingState,
    sectionErrors,
    companiesLoaded,
    walletDialogOpen,
    setWalletDialogOpen,
    receiptDialogOpen,
    setReceiptDialogOpen,
    addFundsDialogOpen,
    setAddFundsDialogOpen,
    editingWallet,
    setEditingWallet,
    selectedReceipt,
    setSelectedReceipt,
    selectedCompany,
    setSelectedCompany,
    walletPendingDelete,
    setWalletPendingDelete,
    walletForm,
    setWalletForm,
    fundsForm,
    setFundsForm,
    companySearch,
    setCompanySearch,
    savingWallet,
    addingFunds,
    reviewingReceipt,
    deletingWallet,
    togglingWalletId,
    filteredCompanyWallets,
    companyBalanceTotal,
    activeTabDescription,
    updateWalletForm,
    updateFundsForm,
    openCreateWallet,
    openEditWallet,
    openReceiptDialog,
    openAddFundsDialog,
    refreshCurrentTab,
    handleSaveWallet,
    handleToggleWallet,
    handleDeleteWallet,
    handleReviewReceipt,
    handleAddFunds,
  } = useWalletManagementController();

  const activeWalletsCount = walletNumbers.filter((w) => w.isActive).length;

  return (
    <div className="w-full space-y-4" dir="rtl">
      {/* Top Header */}
      <WalletManagementHeader
        activeWalletsCount={activeWalletsCount}
        activeTabDescription={activeTabDescription}
        isLoading={loadingState[activeTab]}
        onRefresh={() => void refreshCurrentTab()}
      />

      {/* Unified Telemetry Ribbon */}
      <WalletTelemetryRibbon
        totalWallets={walletNumbers.length}
        activeWallets={activeWalletsCount}
        pendingReceiptsCount={pendingReceipts.length}
        companyBalanceDisplay={
          companiesLoaded ? formatCurrency(companyBalanceTotal) : "—"
        }
      />

      {/* Tabs Chassis */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as WalletTab)}
        className="w-full space-y-4"
      >
        <TabsList className="flex items-center gap-1 border-b border-border/60 pb-1 overflow-x-auto no-scrollbar bg-transparent h-auto p-0 justify-start w-full">
          <TabsTrigger
            value="wallets"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=active]:shadow-2xs data-[state=active]:border data-[state=active]:border-border/80 text-muted-foreground hover:text-foreground"
          >
            <CreditCard className="size-3.5" />
            <span>أرقام المحافظ</span>
          </TabsTrigger>
          <TabsTrigger
            value="receipts"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=active]:shadow-2xs data-[state=active]:border data-[state=active]:border-border/80 text-muted-foreground hover:text-foreground"
          >
            <ReceiptText className="size-3.5" />
            <span>الإيصالات المعلقة</span>
            {pendingReceipts.length > 0 && (
              <span className="flex size-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-mono text-white">
                {pendingReceipts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="companies"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=active]:shadow-2xs data-[state=active]:border data-[state=active]:border-border/80 text-muted-foreground hover:text-foreground"
          >
            <Building2 className="size-3.5" />
            <span>محافظ الشركات</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wallets" className="outline-none">
          <WalletNumbersSection
            wallets={walletNumbers}
            loading={loadingState.wallets}
            error={sectionErrors.wallets}
            onCreateWallet={openCreateWallet}
            onEditWallet={openEditWallet}
            onToggleWallet={handleToggleWallet}
            onDeleteWallet={setWalletPendingDelete}
            togglingWalletId={togglingWalletId}
          />
        </TabsContent>

        <TabsContent value="receipts" className="outline-none">
          <PendingReceiptsSection
            receipts={pendingReceipts}
            loading={loadingState.receipts}
            error={sectionErrors.receipts}
            onOpenReceipt={openReceiptDialog}
          />
        </TabsContent>

        <TabsContent value="companies" className="outline-none">
          <CompanyWalletsSection
            companyWallets={filteredCompanyWallets}
            loading={loadingState.companies}
            error={sectionErrors.companies}
            searchValue={companySearch}
            onSearchChange={setCompanySearch}
            onOpenAddFunds={openAddFundsDialog}
            onClearSearch={() => setCompanySearch("")}
          />
        </TabsContent>
      </Tabs>

      {/* Wallet Number Modal */}
      <WalletNumberDialog
        open={walletDialogOpen}
        onOpenChange={(open) => {
          setWalletDialogOpen(open);
          if (!open) {
            setEditingWallet(null);
            setWalletForm(INITIAL_WALLET_FORM);
          }
        }}
        editingWallet={editingWallet}
        formData={walletForm}
        onChange={updateWalletForm}
        onSubmit={() => void handleSaveWallet()}
        saving={savingWallet}
      />

      {/* Add Funds Modal */}
      <AddFundsDialog
        open={addFundsDialogOpen}
        onOpenChange={(open) => {
          setAddFundsDialogOpen(open);
          if (!open) {
            setSelectedCompany(null);
            setFundsForm(INITIAL_FUNDS_FORM);
          }
        }}
        company={selectedCompany}
        formData={fundsForm}
        onChange={updateFundsForm}
        onSubmit={() => void handleAddFunds()}
        submitting={addingFunds}
      />

      {/* Receipt Review Modal */}
      <ReceiptReviewDialog
        open={receiptDialogOpen}
        onOpenChange={(open) => {
          setReceiptDialogOpen(open);
          if (!open) {
            setSelectedReceipt(null);
          }
        }}
        receipt={selectedReceipt}
        submitting={reviewingReceipt}
        onDecision={(decision) => void handleReviewReceipt(decision)}
      />

      {/* Delete Confirmation Alert */}
      <WalletDeleteConfirmDialog
        open={Boolean(walletPendingDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setWalletPendingDelete(null);
          }
        }}
        wallet={walletPendingDelete}
        onConfirm={() => void handleDeleteWallet()}
        deleting={deletingWallet}
      />
    </div>
  );
};

export default WalletManagement;
