import React from "react";
import { ProductLandingHeader } from "./product-landing/ProductLandingHeader";
import { ElementsSidebarDrawer } from "./product-landing/ElementsSidebarDrawer";
import { CreateLandingModal } from "./product-landing/CreateLandingModal";
import { TemplatesLibraryModal } from "./product-landing/TemplatesLibraryModal";
import { LandingLivePreview } from "./product-landing/LandingLivePreview";
import { ProductLandingZeroState } from "./product-landing/ProductLandingZeroState";
import { ProductLandingMobileNav } from "./product-landing/ProductLandingMobileNav";
import { ProductLandingCanvas } from "./product-landing/ProductLandingCanvas";
import { useProductLandingState } from "./product-landing/useProductLandingState";
import "./ProductLandingPages.css";

const ProductLandingPages: React.FC = () => {
  const {
    pages,
    products,
    selectedId,
    setSelectedId,
    selectedPage,
    selectedProduct,
    editor,
    updateEditor,
    undo,
    redo,
    canUndo,
    canRedo,
    activeSectionId,
    setActiveSectionId,
    loadingPages,
    loadingProducts,
    saving,
    creating,
    deleting,
    isDirty,
    setIsDirty,
    generatingAi,
    updatingStatus,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isTemplatesModalOpen,
    setIsTemplatesModalOpen,
    showPhonePreview,
    setShowPhonePreview,
    mobileTab,
    setMobileTab,
    isElementsDrawerOpen,
    setIsElementsDrawerOpen,
    companyId,
    customerUrl,
    previewUrl,
    previewRefreshToken,
    qualityIssues,
    loadPages,
    loadProducts,
    handleAddSection,
    handleMoveSection,
    handleReorderSections,
    handleDuplicateSection,
    handleToggleSectionEnabled,
    handleRemoveSection,
    handleExportJson,
    handleImportJson,
    handleApplyTemplate,
    handleUpdateSectionContent,
    handleUpdateSectionVariant,
    handleSave,
    handleUpdateStatus,
    handleDeletePage,
    handleGenerateAi,
    handleCreatePage,
    handleCopyUrl,
  } = useProductLandingState();

  return (
    <main className="eo-builder-page" dir="rtl">
      {/* Header Bar */}
      <ProductLandingHeader
        pages={pages}
        selectedId={selectedId}
        onSelectPage={setSelectedId}
        onRefresh={loadPages}
        onSave={() => void handleSave()}
        saving={saving}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenTemplatesModal={() => setIsTemplatesModalOpen(true)}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onGenerateAi={handleGenerateAi}
        generatingAi={generatingAi}
        previewUrl={previewUrl}
        customerUrl={customerUrl}
        onCopyUrl={handleCopyUrl}
        onTogglePhonePreview={() => setShowPhonePreview((prev) => !prev)}
        showPhonePreview={showPhonePreview}
        isDirty={isDirty}
      />

      {/* If No Pages Created Yet: Show Clean Zero State */}
      {!loadingPages && pages.length === 0 ? (
        <ProductLandingZeroState
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <>
          {/* Mobile Studio Segment Switcher Bar (< 1024px) */}
          <ProductLandingMobileNav
            mobileTab={mobileTab}
            onSelectTab={setMobileTab}
            sectionsCount={editor.sections.length}
            onOpenElementsDrawer={() => setIsElementsDrawerOpen(true)}
          />

          {/* Main Workspace: Canvas + Elements Drawer + Phone Preview */}
          <div className="eo-builder-workspace" data-mobile-tab={mobileTab}>
            {/* Right Drawer: Elements Palette (Desktop Only) */}
            <div className="eo-builder-sidebar-wrapper eo-desktop-only">
              <ElementsSidebarDrawer onAddSection={handleAddSection} />
            </div>

            {/* Center: Main Canvas Editor */}
            <ProductLandingCanvas
              mobileTab={mobileTab}
              selectedPage={selectedPage}
              selectedProduct={selectedProduct}
              editor={editor}
              updateEditor={updateEditor}
              setIsDirty={setIsDirty}
              onUpdateStatus={handleUpdateStatus}
              updatingStatus={updatingStatus}
              onDeletePage={handleDeletePage}
              deleting={deleting}
              qualityIssues={qualityIssues}
              activeSectionId={activeSectionId}
              setActiveSectionId={setActiveSectionId}
              onMoveSection={handleMoveSection}
              onReorderSections={handleReorderSections}
              onDuplicateSection={handleDuplicateSection}
              onToggleEnabled={handleToggleSectionEnabled}
              onRemoveSection={handleRemoveSection}
              onUpdateSectionContent={handleUpdateSectionContent}
              onUpdateSectionVariant={handleUpdateSectionVariant}
              onOpenElementsDrawer={() => setIsElementsDrawerOpen(true)}
            />

            {/* Left: Live Preview of the REAL storefront page */}
            <aside
              className={`eo-builder-preview-col ${mobileTab === "editor" ? "eo-hide-on-mobile" : ""} ${!showPhonePreview ? "eo-hide-on-desktop" : ""}`}
            >
              <LandingLivePreview
                customerUrl={customerUrl}
                companyId={companyId || undefined}
                refreshToken={previewRefreshToken}
                isMobileView={mobileTab === "preview"}
              />
            </aside>
          </div>

          {/* Mobile Elements Slide-Over Bottom Sheet */}
          {isElementsDrawerOpen && (
            <div
              className="eo-mobile-sheet-backdrop"
              onClick={() => setIsElementsDrawerOpen(false)}
            >
              <div
                className="eo-mobile-sheet-dialog"
                onClick={(e) => e.stopPropagation()}
              >
                <ElementsSidebarDrawer
                  isMobileSheet
                  onClose={() => setIsElementsDrawerOpen(false)}
                  onAddSection={(type) => {
                    handleAddSection(type);
                    setIsElementsDrawerOpen(false);
                    setMobileTab("editor");
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Landing Modal */}
      <CreateLandingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        products={products}
        loadingProducts={loadingProducts}
        onSearchProducts={loadProducts}
        onCreate={handleCreatePage}
        creating={creating}
      />

      {/* Templates Library Modal */}
      <TemplatesLibraryModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onApplyTemplate={handleApplyTemplate}
        product={selectedProduct}
        currentSectionsCount={editor.sections.length}
      />
    </main>
  );
};

export default ProductLandingPages;
