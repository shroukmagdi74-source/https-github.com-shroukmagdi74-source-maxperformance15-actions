import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  useDocumentsController,
  DocumentsHeaderAndFilters,
  DocumentsGridSection,
  DocumentUploadModal,
} from "./documents/index";

const DocumentsSection: React.FC = () => {
  const {
    documents,
    assets,
    loading,
    loadingMore,
    error,
    showUploadModal,
    setShowUploadModal,
    documentTypes,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedAsset,
    setSelectedAsset,
    lightbox,
    setLightbox,
    page,
    hasMore,
    uploadForm,
    setUploadForm,
    uploading,
    selectedFile,
    assetsLoading,
    filteredDocuments,
    fetchAllDocuments,
    handleFileChange,
    handleUpload,
    resetUploadForm,
    handleDelete,
  } = useDocumentsController();

  return (
    <div className="space-y-6">
      <DocumentsHeaderAndFilters
        documents={documents}
        assets={assets}
        documentTypes={documentTypes}
        activeTab={activeTab}
        onActiveTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        selectedAsset={selectedAsset}
        onSelectedAssetChange={setSelectedAsset}
        onOpenUploadModal={(docType) => {
          if (docType) {
            setUploadForm((prev) => ({ ...prev, documentType: docType }));
          }
          setShowUploadModal(true);
        }}
      />

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          {error || "فشل في تحميل المستندات"}
        </div>
      )}

      <DocumentsGridSection
        filteredDocuments={filteredDocuments}
        documentTypes={documentTypes}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        hasActiveFilters={
          Boolean(searchQuery) ||
          activeTab !== "all" ||
          selectedAsset !== "all"
        }
        onOpenUploadModal={() => setShowUploadModal(true)}
        onOpenLightbox={(src) => setLightbox({ open: true, src })}
        onDelete={handleDelete}
        onLoadMore={() => fetchAllDocuments({ page: page + 1, append: true })}
      />

      <DocumentUploadModal
        open={showUploadModal}
        assets={assets}
        assetsLoading={assetsLoading}
        documentTypes={documentTypes}
        uploadForm={uploadForm}
        onUploadFormChange={setUploadForm}
        selectedFile={selectedFile}
        onFileChange={handleFileChange}
        uploading={uploading}
        onUpload={handleUpload}
        onClose={() => {
          setShowUploadModal(false);
          resetUploadForm();
        }}
      />

      <Dialog
        open={lightbox.open}
        onOpenChange={(open) => {
          if (!open) setLightbox({ open: false, src: "" });
        }}
      >
        <DialogContent
          className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 gap-0 bg-transparent shadow-none ring-0 border-0 sm:max-w-[95vw]"
          showCloseButton={false}
        >
          <div className="relative flex items-center justify-center w-full h-full min-h-[50vh]">
            <button
              onClick={() => setLightbox({ open: false, src: "" })}
              className="absolute top-2 right-2 z-50 text-white bg-black/50 hover:bg-black/70 rounded-full p-1.5 transition-colors"
              aria-label="إغلاق"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <img
              src={lightbox.src}
              alt="معاينة المستند"
              className="max-w-full max-h-[85vh] w-auto h-auto object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentsSection;
