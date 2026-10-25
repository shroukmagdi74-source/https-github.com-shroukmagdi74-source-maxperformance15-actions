import React, { useState, useEffect } from "react";
import i18n from "../../../../../i18n";
import { companyAwareApi } from "../../../../../services/companyAwareApi";
import axios from "axios";
import { getApiUrl } from "../../../../../config/environment";
import { tokenManager } from "../../../../../utils/tokenManager";
import {
  Asset,
  AssetDocument,
  DocumentType,
  DocumentUploadForm,
} from "./types";
import {
  DOCUMENT_TYPES,
  filterAssetDocuments,
  normalizeDoc,
} from "./helpers";

export const useDocumentsController = () => {
  const PAGE_SIZE = 12;
  const [documents, setDocuments] = useState<AssetDocument[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [documentTypes] = useState<DocumentType[]>(DOCUMENT_TYPES);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("all");
  const [lightbox, setLightbox] = useState<{ open: boolean; src: string }>({
    open: false,
    src: "",
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [uploadForm, setUploadForm] = useState<DocumentUploadForm>({
    assetId: "",
    documentType: "image",
    fileName: "",
    fileUrl: "",
    description: "",
  });
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [assetsLoading, setAssetsLoading] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    setPage(1);
    fetchAllDocuments({ page: 1, append: false });
  }, [activeTab, selectedAsset, debouncedSearch]);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(id);
  }, [searchQuery]);

  useEffect(() => {
    if (showUploadModal) {
      fetchAssets();
    }
  }, [showUploadModal]);

  const fetchAllDocuments = async ({
    page: requestedPage = 1,
    append = false,
  }: {
    page?: number;
    append?: boolean;
  } = {}) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError("");
      const response = await companyAwareApi.get("/hr/assets/documents/all", {
        params: {
          page: requestedPage,
          limit: PAGE_SIZE,
          type: activeTab !== "all" ? activeTab : undefined,
          assetId: selectedAsset !== "all" ? selectedAsset : undefined,
          search: debouncedSearch || undefined,
        },
      });
      if (response.data.success) {
        const docs = (response.data.data.documents || []).map((d: any) =>
          normalizeDoc(d)
        );
        setDocuments((prev) => (append ? [...prev, ...docs] : docs));
        const pagination = response.data.data.pagination || {};
        const totalPages =
          pagination.totalPages ||
          (docs.length < PAGE_SIZE ? requestedPage : requestedPage + 1);
        setPage(requestedPage);
        setHasMore(requestedPage < totalPages && docs.length > 0);
      }
    } catch {
      try {
        const assetsResponse = await companyAwareApi.get("/hr/assets");
        if (assetsResponse.data.success) {
          const allDocs: AssetDocument[] = [];
          const assetsData = assetsResponse.data.data || [];
          for (const asset of assetsData) {
            try {
              const docsResponse = await companyAwareApi.get(
                `/hr/assets/${asset.id}/documents`
              );
              if (docsResponse.data.success) {
                const docs = docsResponse.data.data.documents || [];
                docs.forEach((doc: AssetDocument) => {
                  allDocs.push({ ...normalizeDoc(doc), asset });
                });
              }
            } catch {}
          }
          setDocuments(allDocs);
          setHasMore(false);
          setPage(requestedPage);
        }
      } catch {
        setError("فشل في تحميل المستندات");
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchAssets = async () => {
    try {
      setAssetsLoading(true);
      const response = await companyAwareApi.get("/hr/assets", {
        params: { limit: 200 },
      });
      if (response.data.success) {
        setAssets(response.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch assets:", err);
    } finally {
      setAssetsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [
        "image/",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      const maxSize = 20 * 1024 * 1024;
      const isAllowed =
        allowedTypes.some((t) => file.type.startsWith(t.replace("/*", ""))) ||
        file.type === "";
      if (!isAllowed) {
        alert(i18n.t("DocumentsSection.msg_8a25"));
        return;
      }
      if (file.size > maxSize) {
        alert(i18n.t("DocumentsSection.msg_fd1d"));
        return;
      }
      setSelectedFile(file);
      setUploadForm((prev) => ({ ...prev, fileName: file.name }));
    }
  };

  const resetUploadForm = () => {
    setUploadForm({
      assetId: "",
      documentType: "image",
      fileName: "",
      fileUrl: "",
      description: "",
    });
    setSelectedFile(null);
  };

  const handleUpload = async () => {
    if (!uploadForm.assetId) {
      alert(i18n.t("DocumentsSection.msg_4ae4"));
      return;
    }
    if (!selectedFile && !uploadForm.fileUrl) {
      alert(i18n.t("DocumentsSection.msg_a01e"));
      return;
    }
    if (!uploadForm.fileName) {
      alert(i18n.t("DocumentsSection.please_name_78ee"));
      return;
    }

    setUploading(true);
    try {
      let fileUrl = uploadForm.fileUrl;
      const mimeType = selectedFile?.type;
      const fileSize = selectedFile?.size;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const token = tokenManager.getAccessToken();
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        const uploadResponse = await axios.post(
          `${getApiUrl()}/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
            params: {
              companyId: user.companyId,
            },
          }
        );

        if (uploadResponse.data?.success) {
          fileUrl =
            uploadResponse.data.filePath ||
            uploadResponse.data.url ||
            uploadResponse.data.data?.url ||
            uploadResponse.data.fileUrl;
        } else {
          throw new Error("فشل في رفع الملف");
        }
      }

      if (!fileUrl) {
        alert(i18n.t("DocumentsSection.msg_a01e"));
        setUploading(false);
        return;
      }

      const response = await companyAwareApi.post(
        `/hr/assets/${uploadForm.assetId}/documents`,
        {
          documentType: uploadForm.documentType,
          fileName: uploadForm.fileName,
          fileUrl,
          description: uploadForm.description,
          mimeType,
          fileSize,
        }
      );

      if (response.data.success) {
        const newDoc = normalizeDoc(response.data.data);
        const asset = assets.find((a) => a.id === uploadForm.assetId);
        setDocuments((prev) => [{ ...newDoc, asset }, ...prev]);
        setShowUploadModal(false);
        resetUploadForm();
        alert(i18n.t("DocumentsSection.msg_7330"));
        fetchAllDocuments({ page: 1, append: false });
      }
    } catch (err: any) {
      console.error("Document upload error:", err);
      alert(
        err.response?.data?.message ||
          err.message ||
          i18n.t("DocumentsSection.msg_3c68")
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستند؟")) return;

    try {
      await companyAwareApi.delete(`/hr/assets/documents/${docId}`);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err: any) {
      alert(err.response?.data?.message || "فشل في حذف المستند");
    }
  };

  const filteredDocuments = filterAssetDocuments(
    documents,
    activeTab,
    selectedAsset,
    debouncedSearch
  );

  return {
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
  };
};
