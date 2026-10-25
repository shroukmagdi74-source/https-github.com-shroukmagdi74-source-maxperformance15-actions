export interface ReceiptData {
  id: string;
  referenceNumber: string;
  date: string;
  employeeName: string;
  employeeId: string;
  jobTitle: string;
  department: string;
  assetName: string;
  assetCategory: string;
  assetCode: string;
  assetSerial: string;
  assetCondition: string;
  managerName: string;
  signatureUrl?: string;
  status: "pending" | "signed" | "archived";
}
