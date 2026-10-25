import { useState, useEffect, useCallback } from "react";
import i18n from "../../../../../i18n";
import { companyAwareApi } from "../../../../../services/companyAwareApi";
import { ReceiptData } from "./types";
import { createInitialReceipts, buildReceiptFromSelection } from "./helpers";

export const useReceiptFormController = () => {
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(
    null,
  );
  const [isPrinting, setIsPrinting] = useState(false);
  const [showUploadSignature, setShowUploadSignature] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedAsset, setSelectedAsset] = useState<string>("");
  const [employees, setEmployees] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [receipts, setReceipts] = useState<ReceiptData[]>(
    createInitialReceipts,
  );

  const fetchEmployees = useCallback(async () => {
    setLoadingData(true);
    try {
      const response = await companyAwareApi.get("/hr/employees");
      if (response.data.success) {
        const employeesList =
          response.data.employees || response.data.data || [];
        setEmployees(employeesList);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoadingData(false);
    }
  }, []);

  const fetchAssets = useCallback(async () => {
    try {
      const response = await companyAwareApi.get("/hr/assets");
      if (response.data.success) {
        const assetsList = response.data.data || [];
        setAssets(assetsList);
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
    fetchAssets();
  }, [fetchEmployees, fetchAssets]);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  const handleGeneratePDF = () => {
    alert(i18n.t("ReceiptFormSection.msg_ad05"));
  };

  const handleGenerateReceipt = () => {
    if (!selectedEmployee || !selectedAsset) {
      alert(i18n.t("ReceiptFormSection.msg_c899"));
      return;
    }

    const employee = employees.find((e) => e.id === selectedEmployee);
    const asset = assets.find((a) => a.id === selectedAsset);

    if (!employee) {
      alert(i18n.t("ReceiptFormSection.msg_0eef"));
      return;
    }

    if (!asset) {
      alert(i18n.t("ReceiptFormSection.msg_3fad"));
      return;
    }

    const newReceipt = buildReceiptFromSelection(employee, asset);

    setReceipts((prev) => [newReceipt, ...prev]);
    setSelectedReceipt(newReceipt);
    setShowGenerateModal(false);
    setSelectedEmployee("");
    setSelectedAsset("");
  };

  return {
    selectedReceipt,
    setSelectedReceipt,
    isPrinting,
    showUploadSignature,
    setShowUploadSignature,
    showGenerateModal,
    setShowGenerateModal,
    selectedEmployee,
    setSelectedEmployee,
    selectedAsset,
    setSelectedAsset,
    employees,
    assets,
    loadingData,
    receipts,
    handlePrint,
    handleGeneratePDF,
    handleGenerateReceipt,
  };
};
