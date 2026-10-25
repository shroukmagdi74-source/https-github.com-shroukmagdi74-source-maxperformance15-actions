export interface Asset {
  id: string;
  name: string;
  code: string;
}

export interface AssetDocument {
  id: string;
  assetId: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  uploadedBy: string;
  uploadedAt: string;
  description?: string;
  asset?: Asset;
}

export interface DocumentType {
  value: string;
  label: string;
  labelEn: string;
  icon: string;
}

export interface DocumentUploadForm {
  assetId: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  description: string;
}
