import { getApiUrl } from "../../../../../config/environment";
import { AssetDocument, DocumentType } from "./types";

export const DOCUMENT_TYPES: DocumentType[] = [
  {
    value: "image",
    label: "صور الأصل",
    labelEn: "Asset Images",
    icon: "photo",
  },
  {
    value: "invoice",
    label: "فاتورة الشراء",
    labelEn: "Purchase Invoice",
    icon: "document",
  },
  {
    value: "warranty",
    label: "شهادة الضمان",
    labelEn: "Warranty Certificate",
    icon: "shield",
  },
  {
    value: "manual",
    label: "دليل الاستخدام",
    labelEn: "User Manual",
    icon: "book",
  },
  {
    value: "other",
    label: "معاينة وتحميل المرفقات",
    labelEn: "Preview & Download",
    icon: "document",
  },
];

export const COLOR_MAP: Record<
  string,
  { bg: string; text: string; light: string }
> = {
  gray: {
    bg: "bg-gray-600",
    text: "text-gray-600",
    light: "bg-gray-100 dark:bg-gray-700",
  },
  blue: {
    bg: "bg-blue-600",
    text: "text-blue-600",
    light: "bg-blue-100 dark:bg-blue-900/30",
  },
  green: {
    bg: "bg-green-600",
    text: "text-green-600",
    light: "bg-green-100 dark:bg-green-900/30",
  },
  purple: {
    bg: "bg-purple-600",
    text: "text-purple-600",
    light: "bg-purple-100 dark:bg-purple-900/30",
  },
  orange: {
    bg: "bg-orange-600",
    text: "text-orange-600",
    light: "bg-orange-100 dark:bg-orange-900/30",
  },
};

export const normalizeDoc = (doc: any): AssetDocument => ({
  ...doc,
  documentType: doc.documentType || doc.type,
  uploadedAt: doc.uploadedAt || doc.createdAt,
  asset: doc.asset || doc.assets,
});

export const getDocumentTypeLabel = (
  type: string,
  documentTypes: DocumentType[] = DOCUMENT_TYPES
): string => {
  const docType = documentTypes.find((t) => t.value === type);
  return docType?.label || type;
};

export const formatFileSize = (bytes?: number): string => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const buildFileUrl = (url: string): string => {
  if (!url) return "";
  if (url.startsWith("http")) return encodeURI(url);
  const base = getApiUrl().replace("/api/v1", "");
  const cleanPath = url.replace(/^\/+/, "");
  return encodeURI(`${base}/${cleanPath}`);
};

export const filterAssetDocuments = (
  documents: AssetDocument[],
  activeTab: string,
  selectedAsset: string,
  debouncedSearch: string
): AssetDocument[] => {
  let filtered = documents;

  if (activeTab !== "all") {
    filtered = filtered.filter((d) => d.documentType === activeTab);
  }

  if (selectedAsset !== "all") {
    filtered = filtered.filter((d) => d.assetId === selectedAsset);
  }

  if (debouncedSearch) {
    const query = debouncedSearch.toLowerCase();
    filtered = filtered.filter(
      (d) =>
        d.fileName.toLowerCase().includes(query) ||
        d.description?.toLowerCase().includes(query) ||
        d.asset?.name.toLowerCase().includes(query)
    );
  }

  return filtered;
};
