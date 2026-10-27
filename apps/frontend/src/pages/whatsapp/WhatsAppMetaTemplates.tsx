import React from "react";
import {
  FileText,
  Globe,
  History,
  Library,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  WhatsAppPageShell,
  WhatsAppSurfaceCard,
} from "./components/WhatsAppPageShell";
import {
  loadHistory,
  MetaTemplateCreateDialog,
  MetaTemplateDeleteDialog,
  MetaTemplateEditDialog,
  MetaTemplateFilterBar,
  MetaTemplateHistoryDialog,
  MetaTemplateLibraryDialog,
  MetaTemplateStatusBanner,
  MetaTemplateTable,
  MetaTemplateViewDialog,
  useWhatsAppMetaTemplatesController,
} from "./meta-templates";

const WhatsAppMetaTemplates: React.FC<{
  companyId?: string;
  companyName?: string;
  superAdminMode?: boolean;
}> = (props) => {
  const { superAdminMode, companyName } = props;
  const ctrl = useWhatsAppMetaTemplatesController(props);

  return (
    <TooltipProvider delayDuration={300}>
      <WhatsAppPageShell
        title={ctrl.pageTitle}
        description="إدارة قوالب واتساب بزنس المسجلة في Meta Cloud API"
        icon={Globe}
        backHref="/whatsapp"
        backLabel={ctrl.t("common.back") as string}
        eyebrow={
          superAdminMode ? `Company: ${companyName}` : "WhatsApp Workspace"
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={ctrl.selectedSessionId}
              onValueChange={(v) => ctrl.setSelectedSessionId(v ?? "")}
            >
              <SelectTrigger className="h-10 w-full min-w-0 max-w-[200px] rounded-full bg-[color:var(--color-muted)] sm:w-56">
                <SelectValue placeholder="اختر جلسة">
                  {(value: string | null) => {
                    if (!value) return null;
                    const s = ctrl.sessions.find((x) => x.id === value);
                    if (!s) return value;
                    const isCuid =
                      s.name && s.name.length === 25 && /^[a-z]/.test(s.name);
                    return s.name && !isCuid ? s.name : s.phoneNumber || s.id;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ctrl.sessions.map((s) => {
                  const isCuid =
                    s.name && s.name.length === 25 && /^[a-z]/.test(s.name);
                  const displayName =
                    s.name && !isCuid ? s.name : s.phoneNumber || s.id;
                  return (
                    <SelectItem key={s.id} value={s.id}>
                      {displayName}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => ctrl.fetchTemplates({ forceRefresh: true })}
                  disabled={ctrl.loading}
                  aria-label="تحديث القوالب"
                  className="size-10 rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-95"
                >
                  <RefreshCw
                    className={`size-4 ${ctrl.loading ? "animate-spin" : ""}`}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">تحديث القوالب (فرض التحديث من Meta)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    ctrl.setTemplateHistory(loadHistory());
                    ctrl.setHistoryOpen(true);
                  }}
                  aria-label="فتح سجل العمليات"
                  className="size-10 rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-95"
                >
                  <History className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                سجل آخر عمليات على القوالب
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    ctrl.setLibrarySearch("");
                    ctrl.setLibraryOpen(true);
                  }}
                  aria-label="فتح مكتبة القوالب الجاهزة"
                  className="size-10 rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-95"
                >
                  <Library className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                قوالب معتمدة جاهزة للنسخ
              </TooltipContent>
            </Tooltip>

            <Button
              onClick={() => {
                ctrl.setCreateStep(1);
                ctrl.setCreateOpen(true);
              }}
              aria-label="إنشاء قالب جديد"
              className="h-11 rounded-full bg-gradient-to-l from-[color:var(--color-primary)] to-[color:var(--color-primary)]/85 px-5 text-sm font-semibold text-white shadow-md shadow-[color:var(--color-primary)]/25 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-95"
            >
              <Plus className="size-4" />{" "}
              <span className="hidden sm:inline">قالب جديد</span>
            </Button>
          </div>
        }
      >
        <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>

        {/* Health status alert banner */}
        <MetaTemplateStatusBanner
          statusCounts={ctrl.statusCounts}
          loading={ctrl.loading}
          onRefresh={ctrl.fetchTemplates}
        />

        {/* Main surface card */}
        <WhatsAppSurfaceCard
          title={
            ctrl.statusCounts.total > 0
              ? `${ctrl.statusCounts.total} قالب`
              : "قوالب Meta API"
          }
          description="القوالب المسجلة لدى واتساب بزنس — مجمعة حسب الاسم"
          action={null}
        >
          <div className="space-y-4">
            {/* Filter and search bar */}
            <MetaTemplateFilterBar
              searchQuery={ctrl.searchQuery}
              onSearchQueryChange={ctrl.setSearchQuery}
              sectionFilter={ctrl.sectionFilter}
              onSectionFilterChange={ctrl.setSectionFilter}
              sectionFilterOptions={ctrl.sectionFilterOptions}
              statusFilter={ctrl.statusFilter}
              onStatusFilterChange={ctrl.setStatusFilter}
              statusFilterCounts={ctrl.statusFilterCounts}
              onClearFilters={() => {
                ctrl.setSearchQuery("");
                ctrl.setStatusFilter("ALL");
                ctrl.setSectionFilter("ALL");
              }}
            />

            {/* Template table & cards */}
            <MetaTemplateTable
              loading={ctrl.loading}
              selectedSessionId={ctrl.selectedSessionId}
              groupedTemplates={ctrl.groupedTemplates}
              expandedGroups={ctrl.expandedGroups}
              onToggleGroup={ctrl.toggleGroup}
              selectedRows={ctrl.selectedRows}
              onToggleRow={ctrl.toggleRow}
              onToggleAll={ctrl.toggleAll}
              allSelected={ctrl.allSelected}
              someSelected={ctrl.someSelected}
              onClearSelectedRows={() => ctrl.setSelectedRows(new Set())}
              varPreviewOpen={ctrl.varPreviewOpen}
              onToggleVarPreview={(k) =>
                ctrl.setVarPreviewOpen((p) => ({ ...p, [k]: !p[k] }))
              }
              varPreviewValues={ctrl.varPreviewValues}
              onVarPreviewChange={(k, v) =>
                ctrl.setVarPreviewValues((p) => ({ ...p, [k]: v }))
              }
              substituteVars={ctrl.substituteVars}
              onRefresh={ctrl.fetchTemplates}
              onOpenCreate={() => {
                ctrl.setCreateStep(1);
                ctrl.setCreateOpen(true);
              }}
              onOpenLibrary={() => {
                ctrl.setLibrarySearch("");
                ctrl.setLibraryOpen(true);
              }}
              onViewTemplate={(tpl) => ctrl.setViewTemplate(tpl)}
              onEditTemplate={(tmpl) => {
                const headerComp = tmpl.components?.find((c) => c.type === "HEADER");
                const bodyComp = tmpl.components?.find((c) => c.type === "BODY");
                const footerComp = tmpl.components?.find((c) => c.type === "FOOTER");
                const buttonsComp = tmpl.components?.find((c) => c.type === "BUTTONS");
                ctrl.setEditForm({
                  name: tmpl.name,
                  language: tmpl.language,
                  category: tmpl.category,
                  headerFormat: headerComp?.format || "TEXT",
                  headerText: headerComp?.text || "",
                  headerMediaHandle:
                    headerComp?.example?.header_handle?.[0] || "",
                  headerMediaName:
                    headerComp?.example?.header_handle?.[0] || "",
                  bodyText: bodyComp?.text || "",
                  footerText: footerComp?.text || "",
                  buttonText: buttonsComp?.buttons?.[0]?.text || "",
                  buttonUrl: buttonsComp?.buttons?.[0]?.url || "",
                });
                ctrl.setEditOpen(true);
              }}
              onDuplicateTemplate={(tmpl) => {
                const headerComp = tmpl.components?.find((c) => c.type === "HEADER");
                const bodyComp = tmpl.components?.find((c) => c.type === "BODY");
                const footerComp = tmpl.components?.find((c) => c.type === "FOOTER");
                const buttonsComp = tmpl.components?.find((c) => c.type === "BUTTONS");
                ctrl.setForm({
                  name: `${tmpl.name}_copy`,
                  language: tmpl.language,
                  category: tmpl.category,
                  headerFormat: headerComp?.format || "TEXT",
                  headerText: headerComp?.text || "",
                  headerMediaHandle: "",
                  headerMediaName: "",
                  bodyText: bodyComp?.text || "",
                  footerText: footerComp?.text || "",
                  buttonText: buttonsComp?.buttons?.[0]?.text || "",
                  buttonUrl: buttonsComp?.buttons?.[0]?.url || "",
                });
                ctrl.setCreateStep(2);
                ctrl.setCreateOpen(true);
              }}
              onDeleteTemplate={(name) => ctrl.setDeleteConfirm(name)}
            />
          </div>
        </WhatsAppSurfaceCard>

        {/* Mobile bottom sticky action bar */}
        {ctrl.selectedRows.size > 0 ? (
          <div
            className="fixed inset-x-0 bottom-0 z-30 border-t border-[color:var(--shell-control-border)] bg-[color:var(--color-card)]/95 px-3 py-2 shadow-2xl backdrop-blur-md md:hidden"
            role="region"
            aria-label="إجراءات مجمعة"
          >
            <div className="mx-auto flex max-w-md items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => ctrl.setSelectedRows(new Set())}
                className="h-10 flex-1 rounded-full text-xs"
              >
                إلغاء
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={ctrl.fetchTemplates}
                disabled={ctrl.loading}
                className="h-10 flex-1 rounded-full text-xs"
              >
                <RefreshCw
                  className={`size-3.5 ${ctrl.loading ? "animate-spin" : ""}`}
                />{" "}
                تحديث
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  const first = Array.from(ctrl.selectedRows)[0];
                  if (first) ctrl.setDeleteConfirm(first);
                }}
                className="h-10 flex-1 rounded-full text-xs"
              >
                <Trash2 className="size-3.5" /> حذف
              </Button>
            </div>
          </div>
        ) : null}

        {/* Mobile floating action button */}
        <Button
          onClick={() => {
            ctrl.setCreateStep(1);
            ctrl.setCreateOpen(true);
          }}
          aria-label="إنشاء قالب جديد"
          className="fixed bottom-24 left-1/2 z-20 size-14 -translate-x-1/2 rounded-full bg-gradient-to-br from-[color:var(--color-primary)] to-[color:var(--color-primary)]/70 p-0 text-white shadow-lg shadow-[color:var(--color-primary)]/30 transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 md:hidden"
        >
          <Plus className="size-6" />
        </Button>

        {/* Create Dialog - mounted conditionally to keep initial render lightweight */}
        {ctrl.createOpen && (
          <MetaTemplateCreateDialog
            open={ctrl.createOpen}
            onOpenChange={(open) => {
              if (open) ctrl.setCreateOpen(true);
              else ctrl.closeCreateDialog();
            }}
            createStep={ctrl.createStep}
            setCreateStep={ctrl.setCreateStep}
            form={ctrl.form}
            setForm={ctrl.setForm}
            sanitizedName={ctrl.sanitizedName}
            nameValid={ctrl.nameValid}
            headerVarsOk={ctrl.headerVarsOk}
            bodyVarsOk={ctrl.bodyVarsOk}
            buttonUrlOk={ctrl.buttonUrlOk}
            bodyVars={ctrl.bodyVars}
            varValues={ctrl.varValues}
            setVarValues={ctrl.setVarValues}
            previewText={ctrl.previewText}
            complianceResults={ctrl.complianceResults}
            showCompliance={ctrl.showCompliance}
            setShowCompliance={ctrl.setShowCompliance}
            uploadingHeader={ctrl.uploadingHeader}
            onUploadHeaderMedia={ctrl.uploadHeaderMedia}
            insertBodyVariable={ctrl.insertBodyVariable}
            sending={ctrl.sending}
            onCreate={ctrl.handleCreate}
            onClose={ctrl.closeCreateDialog}
          />
        )}

        {/* View Dialog */}
        {ctrl.viewTemplate && (
          <MetaTemplateViewDialog
            viewTemplate={ctrl.viewTemplate}
            onClose={() => ctrl.setViewTemplate(null)}
          />
        )}

        {/* Edit Dialog */}
        {ctrl.editOpen && (
          <MetaTemplateEditDialog
            open={ctrl.editOpen}
            onOpenChange={(o) => {
              if (!o) {
                ctrl.setEditOpen(false);
                ctrl.setEditForm(null);
                ctrl.setEditComplianceResults([]);
                ctrl.setEditShowCompliance(false);
              }
            }}
            editForm={ctrl.editForm}
            setEditForm={ctrl.setEditForm}
            editSending={ctrl.editSending}
            editComplianceResults={ctrl.editComplianceResults}
            editShowCompliance={ctrl.editShowCompliance}
            onToggleShowCompliance={() =>
              ctrl.setEditShowCompliance(!ctrl.editShowCompliance)
            }
            uploadingHeader={ctrl.uploadingHeader}
            onUploadHeaderMedia={ctrl.uploadHeaderMedia}
            onSave={ctrl.handleEdit}
          />
        )}

        {/* Delete Dialog */}
        {ctrl.deleteConfirm && (
          <MetaTemplateDeleteDialog
            templateName={ctrl.deleteConfirm}
            onClose={() => ctrl.setDeleteConfirm(null)}
            onConfirm={(name) => ctrl.handleDelete(name)}
          />
        )}

        {/* Library Dialog */}
        {ctrl.libraryOpen && (
          <MetaTemplateLibraryDialog
            open={ctrl.libraryOpen}
            onOpenChange={ctrl.setLibraryOpen}
            librarySearch={ctrl.librarySearch}
            onSearchChange={ctrl.setLibrarySearch}
            domainFilter={ctrl.libraryDomainFilter}
            onDomainFilterChange={ctrl.setLibraryDomainFilter}
            libraryByCategory={ctrl.libraryByCategory}
            filteredLibraryCount={ctrl.filteredLibrary.length}
            onApplyTemplate={ctrl.applyLibraryTemplate}
          />
        )}

        {/* History Dialog */}
        {ctrl.historyOpen && (
          <MetaTemplateHistoryDialog
            open={ctrl.historyOpen}
            onOpenChange={ctrl.setHistoryOpen}
            templateHistory={ctrl.templateHistory}
            onClearHistory={() => {
              localStorage.removeItem("meta_template_history");
              ctrl.setTemplateHistory([]);
            }}
          />
        )}
      </WhatsAppPageShell>
    </TooltipProvider>
  );
};

export default WhatsAppMetaTemplates;
