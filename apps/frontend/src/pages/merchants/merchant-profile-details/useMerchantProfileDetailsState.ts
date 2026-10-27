import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { apiClient } from "../../../services/apiClient";
import { useCurrency } from "../../../hooks/useCurrency";
import {
  ApiSuccess,
  MerchantProfileResponse,
} from "./types";
import {
  getApiErrorMessage,
  getDisplayName,
} from "./helpers";

export function useMerchantProfileDetailsState() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [profile, setProfile] = useState<MerchantProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await apiClient.get<ApiSuccess<MerchantProfileResponse>>(
        `/merchants/${id}/profile`,
      );
      if (response.data.success) {
        setProfile(response.data.data);
      }
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "فشل تحميل ملف التاجر"));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const merchant = profile?.merchant;
  const user = profile?.user;
  const stats = profile?.stats;
  const displayName = useMemo(
    () => getDisplayName(user, merchant?.name),
    [merchant?.name, user],
  );
  const fulfillmentMode = String(merchant?.fulfillmentMode || "MERCHANT");

  return {
    id,
    navigate,
    formatPrice,
    profile,
    loading,
    merchant,
    user,
    stats,
    displayName,
    fulfillmentMode,
    loadProfile,
  };
}
