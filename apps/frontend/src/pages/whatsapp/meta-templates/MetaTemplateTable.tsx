import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type MetaTemplateTableProps,
  MetaTemplateTableLoading,
  MetaTemplateTableEmptyState,
  MetaTemplateBulkToolbar,
  MetaTemplateMobileCard,
  MetaTemplateDesktopRow,
} from "./table";

export const MetaTemplateTable: React.FC<MetaTemplateTableProps> = ({
  loading,
  selectedSessionId,
  groupedTemplates,
  expandedGroups,
  onToggleGroup,
  selectedRows,
  onToggleRow,
  onToggleAll,
  allSelected,
  someSelected,
  onClearSelectedRows,
  varPreviewOpen,
  onToggleVarPreview,
  varPreviewValues,
  onVarPreviewChange,
  substituteVars,
  onRefresh,
  onOpenCreate,
  onOpenLibrary,
  onViewTemplate,
  onEditTemplate,
  onDuplicateTemplate,
  onDeleteTemplate,
}) => {
  if (loading) {
    return <MetaTemplateTableLoading />;
  }

  const groupEntries = Object.entries(groupedTemplates);

  if (groupEntries.length === 0) {
    return (
      <MetaTemplateTableEmptyState
        selectedSessionId={selectedSessionId}
        onOpenCreate={onOpenCreate}
        onOpenLibrary={onOpenLibrary}
      />
    );
  }

  const handleDeleteSelected = () => {
    const first = Array.from(selectedRows)[0];
    if (first) onDeleteTemplate(first);
  };

  return (
    <>
      {/* Bulk action toolbar */}
      <MetaTemplateBulkToolbar
        selectedCount={selectedRows.size}
        loading={loading}
        onClearSelectedRows={onClearSelectedRows}
        onRefresh={onRefresh}
        onDeleteSelected={handleDeleteSelected}
      />

      {/* Mobile card view */}
      <div className="space-y-2 md:hidden">
        {groupEntries.map(([groupName, groupTemplates]) => (
          <MetaTemplateMobileCard
            key={groupName}
            groupName={groupName}
            groupTemplates={groupTemplates}
            isExpanded={expandedGroups[groupName] === true}
            onToggleGroup={() => onToggleGroup(groupName)}
            isSelected={selectedRows.has(groupName)}
            onToggleRow={() => onToggleRow(groupName)}
            varPreviewOpen={varPreviewOpen}
            onToggleVarPreview={onToggleVarPreview}
            varPreviewValues={varPreviewValues}
            onVarPreviewChange={onVarPreviewChange}
            substituteVars={substituteVars}
            onViewTemplate={onViewTemplate}
            onEditTemplate={onEditTemplate}
            onDeleteTemplate={() => onDeleteTemplate(groupName)}
          />
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={
                    allSelected ? true : someSelected ? "indeterminate" : false
                  }
                  onCheckedChange={onToggleAll}
                  aria-label="تحديد كل القوالب الظاهرة"
                  className="translate-y-[2px]"
                />
              </TableHead>
              <TableHead className="w-8"></TableHead>
              <TableHead>الاسم</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>التصنيف</TableHead>
              <TableHead>القسم</TableHead>
              <TableHead>اللغات</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupEntries.map(([groupName, groupTemplates]) => (
              <MetaTemplateDesktopRow
                key={groupName}
                groupName={groupName}
                groupTemplates={groupTemplates}
                isExpanded={expandedGroups[groupName] === true}
                onToggleGroup={() => onToggleGroup(groupName)}
                isSelected={selectedRows.has(groupName)}
                onToggleRow={() => onToggleRow(groupName)}
                varPreviewOpen={varPreviewOpen}
                onToggleVarPreview={onToggleVarPreview}
                varPreviewValues={varPreviewValues}
                onVarPreviewChange={onVarPreviewChange}
                substituteVars={substituteVars}
                onViewTemplate={onViewTemplate}
                onEditTemplate={onEditTemplate}
                onDuplicateTemplate={onDuplicateTemplate}
                onDeleteTemplate={() => onDeleteTemplate(groupName)}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export * from "./table";
