import { useEffect, useState } from "react";
import i18n from "../../../../i18n";
import { apiClient } from "../../../../services/apiClient";
import { AssetRequestAdminRecord } from "./types";

export const useAssetRequestsController = () => {
  const [requests, setRequests] = useState<AssetRequestAdminRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showFulfillModal, setShowFulfillModal] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<AssetRequestAdminRecord | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [approvalNotes, setApprovalNotes] = useState("");
  const [selectedAssetId, setSelectedAssetId] = useState("");

  useEffect(() => {
    void loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/hr/assets/requests/all");
      if (response.data.success) {
        setRequests(response.data.data || []);
      }
    } catch (error) {
      console.error("Error loading requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {
      const response = await apiClient.post(
        `/hr/assets/requests/${selectedRequest.id}/approve`,
        {
          notes: approvalNotes,
        },
      );

      if (response.data.success) {
        void loadRequests();
        setShowApproveModal(false);
        setApprovalNotes("");
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error("Error approving request:", error);
      alert(i18n.t("AssetRequests.msg_d2d3"));
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      alert(i18n.t("AssetRequests.please_reason_7dfe"));
      return;
    }

    try {
      const response = await apiClient.post(
        `/hr/assets/requests/${selectedRequest.id}/reject`,
        {
          rejectionReason,
        },
      );

      if (response.data.success) {
        void loadRequests();
        setShowRejectModal(false);
        setRejectionReason("");
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert(i18n.t("AssetRequests.msg_b942"));
    }
  };

  const handleFulfill = async () => {
    if (!selectedRequest || !selectedAssetId) {
      alert(i18n.t("AssetRequests.msg_f5d7"));
      return;
    }

    try {
      const response = await apiClient.post(
        `/hr/assets/requests/${selectedRequest.id}/fulfill`,
        {
          assetId: selectedAssetId,
        },
      );

      if (response.data.success) {
        void loadRequests();
        setShowFulfillModal(false);
        setSelectedAssetId("");
        setSelectedRequest(null);
        alert(i18n.t("AssetRequests.msg_713d"));
      }
    } catch (error) {
      console.error("Error fulfilling request:", error);
      alert(i18n.t("AssetRequests.msg_eda3"));
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesStatus = filterStatus === "all" || req.status === filterStatus;
    const matchesSearch =
      req.assetType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return {
    isLoading,
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    showApproveModal,
    setShowApproveModal,
    showRejectModal,
    setShowRejectModal,
    showFulfillModal,
    setShowFulfillModal,
    selectedRequest,
    setSelectedRequest,
    rejectionReason,
    setRejectionReason,
    approvalNotes,
    setApprovalNotes,
    selectedAssetId,
    setSelectedAssetId,
    filteredRequests,
    handleApprove,
    handleReject,
    handleFulfill,
  };
};
