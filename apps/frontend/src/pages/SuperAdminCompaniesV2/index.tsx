import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Button } from "../../components/ui/button";

import { useCompanies, useBulkMutations, useCompanyMutations, useFacebookLookup, useFollowUpOwners } from "./hooks/useCompanies";
import { useSuperAdminCompaniesModals } from "./hooks/useSuperAdminCompaniesModals";
import { useCompaniesFilterBar } from "./hooks/useCompaniesFilterBar";
import { AlertBanner } from "./components/AlertBanner";
import { CompanyFilters } from "./components/CompanyFilters";
import { CompaniesTable } from "./components/CompaniesTable";
import { BulkActionsBar } from "./components/BulkActionsBar";
import { CompaniesHeader } from "./components/CompaniesHeader";
import { CompaniesLifecycleRibbon } from "./components/CompaniesLifecycleRibbon";
import { CompanyModalsContainer } from "./components/CompanyModalsContainer";
import { DEFAULT_SORT } from "./constants";
import type { Company } from "./types";

export default function SuperAdminCompaniesV2() {
  const navigate = useNavigate();
  const [filterParams, setFilterParams] = useState({ search: "", status: "ALL", savedView: "ALL", page: 1, pageSize: 10, sort: DEFAULT_SORT });

  const { companies, isLoading, isFetching, error: pageError, admin, refetch, total, totalPages, meta, serverStats } = useCompanies(filterParams);
  const { bulkStatus, bulkDelete } = useBulkMutations();
  const { createCompany, editCompany } = useCompanyMutations();
  const facebookLookup = useFacebookLookup();
  const followUpOwnersQuery = useFollowUpOwners();

  const filterBar = useCompaniesFilterBar({ companies, adminId: admin?.id || null, meta, serverStats, totalPages, bulkStatus });

  useEffect(() => {
    setFilterParams({
      search: filterBar.search, status: filterBar.status, savedView: filterBar.savedView,
      page: filterBar.currentPage, pageSize: Number(filterBar.rowsPerPage), sort: filterBar.sort,
    });
  }, [filterBar.search, filterBar.status, filterBar.savedView, filterBar.currentPage, filterBar.rowsPerPage, filterBar.sort]);

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const modals = useSuperAdminCompaniesModals({
    admin, refetch, createCompany, editCompany, bulkDelete, setSelectedIds: filterBar.setSelectedIds,
  });

  const handleOpenDetails = useCallback((company: Company) => navigate(`/super-admin/companies/${company.id}`), [navigate]);
  const handleBulkDelete = useCallback(() => modals.setDeleteDialog({ open: true, ids: filterBar.selectedIds, name: "" }), [filterBar.selectedIds, modals]);

  const handleFbSearch = useCallback(async () => {
    if (!filterBar.fbQuery.trim()) { filterBar.setFbSearched(false); filterBar.setFbResults([]); return; }
    try {
      filterBar.setFbSearched(true);
      const r = await facebookLookup.mutateAsync(filterBar.fbQuery.trim());
      filterBar.setFbResults(r || []);
    } catch { /* error handled by mutation */ }
  }, [filterBar, facebookLookup]);

  return (
    <div dir="rtl" className="min-h-full pb-6">
      <div className="flex w-full flex-col gap-1.5 p-1 md:p-1.5">
        {pageError && (
          <Alert variant="destructive" className="rounded-xl border-destructive/30 bg-white dark:bg-card/90">
            <AlertTriangle className="size-4" />
            <AlertTitle>تعذر تحميل الصفحة</AlertTitle>
            <AlertDescription>{(pageError as Error).message}</AlertDescription>
          </Alert>
        )}

        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <CompaniesHeader
            total={total} activeCompanies={filterBar.quickStats.activeCompanies} isLoading={isLoading}
            filterOpen={filterBar.filterOpen} filterCount={filterBar.filterCount} onExport={filterBar.handleExport}
            onRefresh={() => refetch()} onCreateCompany={modals.handleCreateCompany} onToggleFilter={() => filterBar.setFilterOpen(!filterBar.filterOpen)}
          />

          <div className="p-3 sm:p-4 space-y-3">
            {(filterBar.quickStats.urgentEscalationDue > 0 || filterBar.quickStats.myDueToday > 0) && (
              <div className="rounded-lg border border-primary/10 bg-primary/5 p-px">
                <AlertBanner urgentEscalationDue={filterBar.quickStats.urgentEscalationDue} myDueToday={filterBar.quickStats.myDueToday} onOpenView={filterBar.handleOpenView} />
              </div>
            )}

            <CompaniesLifecycleRibbon savedView={filterBar.savedView} quickStats={filterBar.quickStats} onClearFilters={filterBar.handleClearFilters} onOpenView={filterBar.handleOpenView} />

            <div className="rounded-lg border border-border/40 bg-muted/10 dark:bg-card/30 p-1 md:p-1.5">
              <CompanyFilters
                collapsed={!filterBar.filterOpen} search={filterBar.search} onSearchChange={filterBar.setSearch}
                status={filterBar.status} onStatusChange={filterBar.setStatus} sort={filterBar.sort} onSortChange={filterBar.setSort}
                rowsPerPage={filterBar.rowsPerPage} onRowsPerPageChange={filterBar.setRowsPerPage} onClearAll={filterBar.handleClearFilters}
                filterCount={filterBar.filterCount} activeFilterLabels={filterBar.activeFilterLabels} searchLoading={isFetching}
                facebookLookup={{
                  query: filterBar.fbQuery, onQueryChange: filterBar.setFbQuery, onSearch: handleFbSearch,
                  onClear: () => { filterBar.setFbQuery(""); filterBar.setFbResults([]); filterBar.setFbSearched(false); },
                  loading: facebookLookup.isPending, error: facebookLookup.error?.message || "", searched: filterBar.fbSearched, results: filterBar.fbResults,
                }}
              />
            </div>

            <div className="relative">
              <BulkActionsBar selectedCount={filterBar.selectedIds.length} onActivate={filterBar.handleBulkActivate} onDeactivate={filterBar.handleBulkDeactivate} onDelete={handleBulkDelete} onClear={() => filterBar.setSelectedIds([])} />
            </div>

            <CompaniesTable
              companies={filterBar.enrichedCompanies} totalPages={totalPages} currentPage={filterBar.safeCurrentPage}
              onPageChange={filterBar.setCurrentPage} pageSize={filterBar.pageSize} totalItems={total} selectedIds={filterBar.selectedIds}
              onToggleSelect={filterBar.handleToggleSelect} onToggleSelectAll={filterBar.handleToggleSelectAll}
              isAllVisibleSelected={filterBar.isAllVisibleSelected} isSomeVisibleSelected={filterBar.isSomeVisibleSelected}
              loading={isLoading} searchQuery={filterBar.search} onOpenDetails={handleOpenDetails} onEdit={modals.handleEditCompany}
              onDelete={modals.handleDeleteCompany} onOpenUsers={modals.handleOpenUsers} onOpenFollowUp={modals.handleOpenFollowUp}
              onOpenFacebookPages={modals.handleOpenFacebookPages} onOpenWhatsApp={modals.handleOpenWhatsApp}
              onTransferOwnership={modals.handleTransferOwnership} onAddEmployee={modals.handleAddEmployee}
              onLoginAsAdmin={modals.handleLoginAsAdmin} onRunFollowUpAction={modals.handleRunFollowUpAction} isMobile={isMobile}
            />
          </div>
        </div>
      </div>

      <Button type="button" aria-label="إضافة شركة جديدة" size="icon-lg" className="fixed bottom-6 right-4 z-40 rounded-2xl shadow-lg md:hidden" onClick={modals.handleCreateCompany}>
        <Plus className="size-5" aria-hidden="true" />
      </Button>

      <CompanyModalsContainer
        isMobile={isMobile} adminId={admin?.id as string | null} modals={modals}
        followUpOwners={followUpOwnersQuery.data || []} loadingFollowUpOwners={followUpOwnersQuery.isLoading}
        onOpenDetails={handleOpenDetails}
      />
    </div>
  );
}

export { SuperAdminCompaniesV2 };
