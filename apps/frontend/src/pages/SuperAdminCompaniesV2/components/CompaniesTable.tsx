import React, { useState } from "react";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { cn } from "../../../lib/utils";
import {
  CompaniesTableProps,
  CompaniesTableLoadingSkeleton,
  CompaniesTableEmptyState,
  CompaniesTablePagination,
  CompaniesTableExpandedRow,
  CompaniesTableMobileView,
  useCompanyTableColumns,
} from "./companies-table";

export function CompaniesTable({
  companies,
  totalPages,
  currentPage,
  onPageChange,
  pageSize,
  totalItems,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  isAllVisibleSelected,
  isSomeVisibleSelected,
  loading,
  searchQuery,
  onOpenDetails,
  onEdit,
  onDelete,
  onOpenUsers,
  onOpenFollowUp,
  onOpenFacebookPages,
  onOpenWhatsApp,
  onTransferOwnership,
  onAddEmployee,
  onLoginAsAdmin,
  onRunFollowUpAction,
  isMobile,
}: CompaniesTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const columns = useCompanyTableColumns({
    selectedIds,
    isAllVisibleSelected,
    isSomeVisibleSelected,
    expandedId,
    setExpandedId,
    onToggleSelect,
    onToggleSelectAll,
    onOpenDetails,
    onEdit,
    onDelete,
    onOpenUsers,
    onOpenFollowUp,
    onOpenFacebookPages,
    onOpenWhatsApp,
    onTransferOwnership,
    onAddEmployee,
    onLoginAsAdmin,
  });

  const table = useReactTable({
    data: companies,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  if (loading) {
    return <CompaniesTableLoadingSkeleton isMobile={isMobile} />;
  }

  if (companies.length === 0) {
    return <CompaniesTableEmptyState searchQuery={searchQuery} />;
  }

  return (
    <div className="space-y-3">
      {isMobile ? (
        <CompaniesTableMobileView
          companies={companies}
          selectedIds={selectedIds}
          onToggleSelect={onToggleSelect}
          expandedId={expandedId}
          setExpandedId={setExpandedId}
          onOpenDetails={onOpenDetails}
          onOpenUsers={onOpenUsers}
          onOpenFacebookPages={onOpenFacebookPages}
          onOpenFollowUp={onOpenFollowUp}
          onOpenWhatsApp={onOpenWhatsApp}
          onTransferOwnership={onTransferOwnership}
          onAddEmployee={onAddEmployee}
          onLoginAsAdmin={onLoginAsAdmin}
        />
      ) : (
        <div className="rounded-xl border border-border/60 bg-white shadow-2xs dark:bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/60 dark:bg-card/90 border-b border-border/50">
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id} className="border-border/40 hover:bg-transparent">
                    {hg.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className={cn(
                          "h-9 px-3 text-right text-xs font-black uppercase tracking-wider text-muted-foreground/80",
                          (header.column.columnDef.meta as { className?: string })?.className,
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row, idx) => {
                  const company = row.original;
                  const attention =
                    company.followUpAutomation?.needsEscalation ||
                    company.followUpAutomation?.needsUrgentEscalation;
                  const critical = company.followUpAutomation?.needsUrgentEscalation;
                  return (
                    <React.Fragment key={row.id}>
                      <TableRow
                        className={cn(
                          "group/row border-border/40 transition-colors hover:bg-primary/[0.03] cursor-pointer",
                          idx % 2 === 1 && "bg-muted/[0.02]",
                          attention &&
                            "border-r-4 border-r-amber-500 bg-amber-50/[0.25] hover:bg-amber-50/40",
                          critical &&
                            "border-r-4 border-r-rose-500 bg-rose-50/[0.35] hover:bg-rose-50/50",
                        )}
                        onClick={() =>
                          setExpandedId(expandedId === row.original.id ? null : row.original.id)
                        }
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className={cn(
                              "px-3 py-2",
                              (cell.column.columnDef.meta as { className?: string })?.className,
                            )}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                      {expandedId === row.original.id ? (
                        <TableRow className="border-0 hover:bg-transparent">
                          <TableCell
                            colSpan={row.getVisibleCells().length}
                            className="bg-muted/15 px-6 py-4"
                          >
                            <CompaniesTableExpandedRow
                              company={row.original}
                              onOpenDetails={onOpenDetails}
                              onOpenFollowUp={onOpenFollowUp}
                              onOpenUsers={onOpenUsers}
                              onOpenFacebookPages={onOpenFacebookPages}
                              onOpenWhatsApp={onOpenWhatsApp}
                              onLoginAsAdmin={onLoginAsAdmin}
                              onEdit={onEdit}
                              onDelete={onDelete}
                              onTransferOwnership={onTransferOwnership}
                              onAddEmployee={onAddEmployee}
                              onRunFollowUpAction={onRunFollowUpAction}
                            />
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Pagination Bar */}
      <CompaniesTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={onPageChange}
      />
    </div>
  );
}

export default CompaniesTable;
export * from "./companies-table";
