import React from "react";
import { FileText, Globe, Plus, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import MetaTemplatesModal from "../customers/components/MetaTemplatesModal";
import {
  WhatsAppPageShell,
  WhatsAppSurfaceCard,
} from "./components/WhatsAppPageShell";
import {
  TemplateCardsGrid,
  TemplateCategoryTabs,
  TemplateCustomerRetentionBanner,
  TemplateEditDialog,
  useWhatsAppTemplatesController,
  WhatsAppTemplatesProps,
} from "./templates";

const WhatsAppTemplates: React.FC<WhatsAppTemplatesProps> = (props) => {
  const { superAdminMode } = props;
  const ctrl = useWhatsAppTemplatesController(props);

  if (ctrl.loading) {
    return (
      <WhatsAppPageShell
        title={ctrl.pageTitle}
        description={ctrl.pageDescription}
        icon={FileText}
      >
        <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[280px] rounded-3xl" />
          ))}
        </div>
      </WhatsAppPageShell>
    );
  }

  const surfaceTitle = superAdminMode
    ? ctrl.isArabic
      ? "قوالب تسجيل الشركات"
      : "Company signup templates"
    : (ctrl.t("whatsappNotifications.tabs.templates") as unknown as string);

  const surfaceDescription = superAdminMode
    ? ctrl.isArabic
      ? "عدّل فقط القوالب الخاصة بتسجيل الشركات والاشتراك التي يستخدمها السوبر أدمن."
      : "Edit only the company-signup and subscription templates used by the super-admin workspace."
    : ctrl.isArabic
      ? "ابحث داخل القوالب وعدّل المحتوى الذي يُرسل تلقائيًا لكل حدث."
      : "Search templates and edit the message content used by each automation event.";

  return (
    <WhatsAppPageShell
      title={ctrl.pageTitle}
      description={ctrl.pageDescription}
      icon={FileText}
      actions={
        <div className="flex items-center gap-2">
          {ctrl.metaSessions.length > 0 ? (
            <Select
              value={ctrl.selectedMetaSession}
              onValueChange={(v) => ctrl.setSelectedMetaSession(v ?? "")}
            >
              <SelectTrigger className="h-9 w-auto min-w-[140px] rounded-full border-[color:var(--shell-control-border)] bg-[color:var(--color-muted)] text-xs">
                <Globe className="size-3 me-1" />
                <SelectValue
                  placeholder={
                    ctrl.isArabic ? "جلسة ميتا" : "Meta session"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {ctrl.metaSessions.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="text-xs">
                    {s.metaDisplayPhoneNumber || s.name || s.id.substring(0, 8)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
          <Button
            variant="outline"
            onClick={ctrl.refreshPageData}
            disabled={ctrl.refreshing}
            className="rounded-full bg-[color:var(--color-muted)]"
          >
            {ctrl.refreshing ? (
              <span className="flex items-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {ctrl.isArabic ? "جاري التحديث..." : "Refreshing..."}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <RefreshCw className="size-4" />
                {ctrl.isArabic ? "تحديث" : "Refresh"}
              </span>
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <WhatsAppSurfaceCard
          title={surfaceTitle}
          description={surfaceDescription}
          action={
            <Button
              className="rounded-full bg-[color:var(--color-primary)] text-white hover:brightness-90"
              onClick={ctrl.openCreateTemplateDialog}
            >
              <Plus className="size-4" />
              {superAdminMode
                ? ctrl.isArabic
                  ? "إضافة قالب تسجيل"
                  : "New signup template"
                : ctrl.isArabic
                  ? "إضافة قالب جديد"
                  : "New template"}
            </Button>
          }
        >
          <div className="space-y-5">
            <div className="flex flex-col gap-4">
              {/* Search bar */}
              <div className="relative w-full">
                <Search className="pointer-events-none absolute top-1/2 start-3 size-4 -translate-y-1/2 text-[color:var(--color-muted-foreground)]" />
                <Input
                  value={ctrl.templateSearch}
                  onChange={(e) => ctrl.setTemplateSearch(e.target.value)}
                  placeholder={String(ctrl.t("common.search"))}
                  className="h-11 rounded-full bg-[color:var(--color-muted)] ps-10"
                />
              </div>

              {/* Category filter tabs */}
              <TemplateCategoryTabs
                templateCategory={ctrl.templateCategory}
                onCategoryChange={ctrl.handleCategoryChange}
                availableCategoryEntries={ctrl.availableCategoryEntries}
                metaCategoryCounts={ctrl.metaCategoryCounts}
                metaSubCategory={ctrl.metaSubCategory}
                onMetaSubCategoryChange={ctrl.setMetaSubCategory}
                isArabic={ctrl.isArabic}
              />

              {/* Customer Lifecycle & Automation Synergy Banner */}
              {ctrl.templateCategory === "CUSTOMER" && (
                <TemplateCustomerRetentionBanner
                  isArabic={ctrl.isArabic}
                  onNavigateToNotifications={() =>
                    ctrl.navigate("/customers/customer-notifications")
                  }
                />
              )}
            </div>

            {/* Templates cards grid */}
            <TemplateCardsGrid
              templates={ctrl.filteredTemplates}
              eventLabels={ctrl.EVENT_LABELS}
              categoryLabels={ctrl.CATEGORY_LABELS}
              selectedMetaSession={ctrl.selectedMetaSession}
              publishingId={ctrl.publishingId}
              onPublishToMeta={ctrl.publishToMeta}
              onEditTemplate={(tpl) => {
                ctrl.setEditingTemplate(tpl);
                ctrl.setTemplateDialogOpen(true);
              }}
              onOpenStatusTemplates={() => ctrl.navigate("/orders/status-templates")}
              onResetFilters={() => {
                ctrl.setTemplateSearch("");
                ctrl.handleCategoryChange("ALL");
              }}
              isArabic={ctrl.isArabic}
            />
          </div>
        </WhatsAppSurfaceCard>

        {/* Create / Edit Template Dialog */}
        <TemplateEditDialog
          open={ctrl.templateDialogOpen}
          onOpenChange={ctrl.setTemplateDialogOpen}
          isEditing={Boolean(ctrl.editingTemplate?.id)}
          saving={ctrl.saving}
          templateForm={ctrl.templateForm}
          setTemplateForm={ctrl.setTemplateForm}
          availableCategoryEntries={ctrl.availableCategoryEntries}
          dialogEventEntries={ctrl.dialogEventEntries}
          activeCategoryVars={ctrl.activeCategoryVars}
          superAdminMode={Boolean(superAdminMode)}
          textareaRef={ctrl.textareaRef}
          insertVariable={ctrl.insertVariable}
          onSave={ctrl.saveTemplate}
          onOpenMetaPicker={() => ctrl.setMetaPickerOpen(true)}
          isArabic={ctrl.isArabic}
        />

        {/* Import from Meta Modal */}
        <MetaTemplatesModal
          open={ctrl.metaPickerOpen}
          onClose={() => ctrl.setMetaPickerOpen(false)}
          onPick={(content, picked) => {
            ctrl.setTemplateForm((prev) => ({
              ...prev,
              content,
              name: prev.name || picked.name || picked.metaTemplateName || "",
              channel: "META_CLOUD",
              metaTemplateName: picked.metaTemplateName || picked.name || "",
            }));
          }}
          title={
            ctrl.isArabic
              ? "اختيار من قوالب ميتا المعتمدة للمتجر"
              : "Select Approved Meta Template"
          }
        />
      </div>
    </WhatsAppPageShell>
  );
};

export default WhatsAppTemplates;
