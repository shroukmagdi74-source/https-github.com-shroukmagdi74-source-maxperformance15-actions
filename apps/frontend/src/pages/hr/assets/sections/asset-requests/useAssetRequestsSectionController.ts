import { useEffect, useState } from "react";
import { toast } from "sonner";
import { companyAwareApi } from "../../../../../services/companyAwareApi";
import { tToast } from "../../../../../utils/i18n-toast";
import {
  AssetRequestRecord,
  AssetRequestsViewMode,
  NewAssetRequestFormState,
} from "./types";
import { enrichAssetRequestRecord } from "./helpers";

export const useAssetRequestsSectionController = () => {
  const [view, setView] = useState<AssetRequestsViewMode>("employee");
  const [requests, setRequests] = useState<AssetRequestRecord[]>([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newRequest, setNewRequest] = useState<NewAssetRequestFormState>({
    assetType: "حاسوب محمول (Laptop)",
    reason: "",
    priority: "NORMAL",
  });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const endpoint =
        view === "hr" ? "/hr/assets/requests/all" : "/hr/assets/requests/my";
      const response = await companyAwareApi.get(endpoint);
      if (response.data.success) {
        const enriched: AssetRequestRecord[] = (response.data.data || []).map(
          enrichAssetRequestRecord,
        );
        setRequests(enriched);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      if (requests.length === 0) {
        setRequests([
          {
            id: "REQ-MOCK",
            requestedBy: "me",
            assetType: "Laptop (Mock)",
            reason: "API Connection Error - Showing Mock",
            priority: "NORMAL",
            status: "PENDING",
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRequests();
  }, [view]);

  const handleCreateRequest = async () => {
    if (!newRequest.reason) {
      tToast.error("AssetRequestsSection.please_reason_9729");
      return;
    }
    try {
      const response = await companyAwareApi.post(
        "/hr/assets/requests",
        newRequest,
      );
      if (response.data.success) {
        tToast.success("AssetRequestsSection.success_send_b0f3");
        setShowRequestModal(false);
        void fetchRequests();
      }
    } catch {
      tToast.error("AssetRequestsSection.failed_send_3330");
    }
  };

  const handleUpdateStatus = async (
    requestId: string,
    status: string,
    rejectionReason?: string,
  ) => {
    try {
      const response = await companyAwareApi.put(
        `/hr/assets/requests/${requestId}/status`,
        {
          status,
          rejectionReason,
        },
      );
      if (response.data.success) {
        toast.success(status === "APPROVED" ? "تمت الموافقة" : "تم الرفض");
        void fetchRequests();
      }
    } catch {
      tToast.error("AssetRequestsSection.failed_update_e7e1");
    }
  };

  return {
    view,
    setView,
    requests,
    showRequestModal,
    setShowRequestModal,
    loading,
    newRequest,
    setNewRequest,
    fetchRequests,
    handleCreateRequest,
    handleUpdateStatus,
  };
};
