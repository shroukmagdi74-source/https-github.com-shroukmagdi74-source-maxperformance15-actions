import { getDirection } from "../../i18n";
import {
  ConversionToolPreviewProvider,
  renderConversionToolMiniPreview,
} from "./conversionToolPreviews";
import {
  ConversionToolsStudioHero,
  ConversionToolsStudioToolbar,
  ConversionToolsStudioEmptyState,
  ToolCard,
  useConversionToolsStudioController,
} from "./conversion-tools-studio";

export default function ConversionToolsIndexPage() {
  const {
    t,
    loading,
    savingToolKey,
    merchantTheme,
    selectedCategory,
    setSelectedCategory,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    appSlugs,
    totalTools,
    activeToolsCount,
    activeAppsCount,
    storePreviewPath,
    categoryTabs,
    filteredTools,
    hasActiveFilters,
    resetFilters,
    isToolAvailable,
    getToolEnabled,
    handleToolToggle,
  } = useConversionToolsStudioController();

  return (
    <div
      className="conversion-admin-scope mx-auto max-w-7xl space-y-6 sm:space-y-8"
      dir={getDirection()}
    >
      {/* Hero Header */}
      <ConversionToolsStudioHero
        title={t("storeConversionSettings.toolsIndexTitle")}
        description={t("storeConversionSettings.toolsIndexDesc")}
        activeToolsCount={activeToolsCount}
        totalTools={totalTools}
        activeAppsCount={activeAppsCount}
        totalApps={appSlugs.length}
        storePreviewPath={storePreviewPath}
      />

      {/* Toolbar: Category tabs, search & status filter */}
      <ConversionToolsStudioToolbar
        categoryTabs={categoryTabs}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
      />

      {/* Main Content Area */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
            />
          ))}
        </div>
      ) : filteredTools.length === 0 ? (
        <ConversionToolsStudioEmptyState onResetFilters={resetFilters} />
      ) : (
        <ConversionToolPreviewProvider initialTheme={merchantTheme}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredTools.map((entry) => {
              const { tool } = entry;
              const available = isToolAvailable(tool);
              const enabled = available && getToolEnabled(tool);
              const isSaving = savingToolKey === tool.key;

              return (
                <ToolCard
                  key={tool.key}
                  entry={entry}
                  toolLabel={t(`storeConversionSettings.tool.${tool.key}.label`, {
                    defaultValue: tool.label,
                  })}
                  toolBenefit={t(`storeConversionSettings.tool.${tool.key}.benefit`, {
                    defaultValue: tool.description,
                  })}
                  enabled={enabled}
                  available={available}
                  isSaving={isSaving}
                  onToggle={(nextVal) => handleToolToggle(tool, nextVal)}
                  preview={renderConversionToolMiniPreview(tool.key)}
                />
              );
            })}
          </div>
        </ConversionToolPreviewProvider>
      )}
    </div>
  );
}
