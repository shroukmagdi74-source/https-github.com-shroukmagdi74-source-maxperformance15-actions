import React from 'react';
import {
  StorePagesHeader,
  StorePagesMetrics,
  StorePagesEmptyState,
  StorePagesGrid,
  StorePageEditorModal,
  useStorePagesController,
} from './store-pages';

export const StorePages: React.FC = () => {
  const {
    t,
    pages,
    filteredPages,
    loading,
    saving,
    showModal,
    editingPage,
    formData,
    setFormData,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    metrics,
    getPageUrl,
    openCreateModal,
    closeModal,
    handleEdit,
    handleDelete,
    toggleStatus,
    handleSubmit,
    initializeDefaultPages,
  } = useStorePagesController();

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-0 h-full w-full bg-background">
      <StorePagesHeader
        badgeLabel="متجر إلكتروني"
        pageTitle={t('storePages.pageTitle')}
        pageSubtitle={t('storePages.pageSubtitle')}
        generatePoliciesLabel={t('storePages.generatePolicies')}
        newPageLabel={t('storePages.createCustomPage')}
        showGenerateButton={pages.length === 0}
        onGeneratePolicies={initializeDefaultPages}
        onNewPage={openCreateModal}
      />

      <StorePagesMetrics
        metrics={metrics}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        translate={t}
      />

      <div className="flex-1 overflow-y-auto">
        {filteredPages.length === 0 ? (
          <StorePagesEmptyState
            hasTotalPages={pages.length > 0}
            onGeneratePolicies={initializeDefaultPages}
            onNewPage={openCreateModal}
            translate={t}
          />
        ) : (
          <StorePagesGrid
            pages={filteredPages}
            getPageUrl={getPageUrl}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={toggleStatus}
            translate={t}
          />
        )}
      </div>

      <StorePageEditorModal
        isOpen={showModal}
        isEditing={Boolean(editingPage)}
        saving={saving}
        formData={formData}
        setFormData={setFormData}
        onClose={closeModal}
        onSubmit={handleSubmit}
        translate={t}
      />
    </div>
  );
};

export default StorePages;
