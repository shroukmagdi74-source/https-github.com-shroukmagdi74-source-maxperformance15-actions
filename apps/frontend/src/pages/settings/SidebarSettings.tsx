import React from "react";
import {
  SidebarSettingsHeader,
  SidebarLayoutPicker,
  SidebarToolbar,
  SidebarFlatSearchResults,
  SidebarFlatView,
  SidebarCategoryGroup,
  SidebarSmartInfoCard,
  useSidebarSettingsController,
} from "./sidebar-settings";

const SidebarSettings: React.FC = () => {
  const {
    t,
    isLoading,
    userLayout,
    setUserLayout,
    localSections,
    visibleSectionIds,
    sidebarSections,
    searchQuery,
    setSearchQuery,
    expandedSections,
    saveStatus,
    expandedItemRoles,
    viewMode,
    setViewMode,
    categorizedSections,
    flatItems,
    visibleCount,
    totalCount,
    setItemVisibility,
    setSectionVisibility,
    moveItem,
    moveSection,
    toggleRoleForSection,
    toggleRoleForItem,
    toggleExpand,
    toggleRoleExpand,
    handleRefresh,
  } = useSidebarSettingsController();

  return (
    <div className="px-4 py-6 sm:px-6">
      <SidebarSettingsHeader
        visibleCount={visibleCount}
        totalCount={totalCount}
        saveStatus={saveStatus}
        onRefresh={handleRefresh}
      />

      <SidebarLayoutPicker
        userLayout={userLayout}
        onSelectLayout={setUserLayout}
      />

      <SidebarToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <span className="mr-3 text-sm text-gray-500 dark:text-gray-400">
            {t("sidebar.sidebarLoading")}
          </span>
        </div>
      ) : flatItems ? (
        <SidebarFlatSearchResults
          flatItems={flatItems}
          sidebarSections={sidebarSections}
          onSetItemVisibility={setItemVisibility}
          onClearSearch={() => setSearchQuery("")}
        />
      ) : viewMode === "categories" ? (
        <div className="space-y-6">
          {categorizedSections.map(({ category, sections }) => (
            <SidebarCategoryGroup
              key={category}
              category={category}
              sections={sections}
              sidebarSections={sidebarSections}
              expandedSections={expandedSections}
              onToggleExpand={toggleExpand}
              onSetSectionVisibility={setSectionVisibility}
              onSetItemVisibility={setItemVisibility}
            />
          ))}
          {categorizedSections.length === 0 && (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <p className="text-sm">{t("sidebar.sidebarNoSections")}</p>
            </div>
          )}
        </div>
      ) : (
        <SidebarFlatView
          localSections={localSections}
          visibleSectionIds={visibleSectionIds}
          sidebarSections={sidebarSections}
          expandedSections={expandedSections}
          expandedItemRoles={expandedItemRoles}
          onToggleExpand={toggleExpand}
          onSetSectionVisibility={setSectionVisibility}
          onSetItemVisibility={setItemVisibility}
          onMoveSection={moveSection}
          onMoveItem={moveItem}
          onToggleRoleForSection={toggleRoleForSection}
          onToggleRoleForItem={toggleRoleForItem}
          onToggleRoleExpand={toggleRoleExpand}
        />
      )}

      <SidebarSmartInfoCard />
    </div>
  );
};

export default SidebarSettings;
