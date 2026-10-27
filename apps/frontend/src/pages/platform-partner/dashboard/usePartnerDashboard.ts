import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { apiClient } from "../../../services/apiClient";
import { useAuth } from "../../../hooks/useAuthSimple";
import {
  createStorageKey,
  getWithExpiry,
  setWithExpiry,
} from "../../../utils/storage";
import {
  PartnerDashboardData,
  PartnerDashboardPagination,
  HasMoreState,
} from "./types";
import { calcHasMore, calcTrendPercent } from "./helpers";

const CACHE_TTL_MS = 60_000;

export function usePartnerDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [data, setData] = useState<PartnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("VODAFONE_CASH");
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [commPage, setCommPage] = useState(1);
  const [payoutPage, setPayoutPage] = useState(1);
  const [refPage, setRefPage] = useState(1);
  const [pagination, setPagination] = useState<PartnerDashboardPagination>({
    commissions: { page: 1, pageSize: 10, total: 0 },
    payouts: { page: 1, pageSize: 5, total: 0 },
    referrals: { page: 1, pageSize: 10, total: 0 },
  });
  const [hasMore, setHasMore] = useState<HasMoreState>({
    commissions: true,
    payouts: true,
    referrals: true,
  });

  const cacheKey = useMemo(() => {
    const companyId = user?.companyId || user?.company?.id || "unknown";
    return createStorageKey("partner-dashboard", companyId);
  }, [user?.company?.id, user?.companyId]);

  const fetchDashboardData = useCallback(
    async ({
      signal,
      background = false,
      appendSection,
      overridePages,
    }: {
      signal?: AbortSignal;
      background?: boolean;
      appendSection?: "commissions" | "payouts" | "referrals";
      overridePages?: {
        commPage?: number;
        payoutPage?: number;
        refPage?: number;
      };
    } = {}) => {
      let success = false;
      try {
        if (!background) {
          setLoading(true);
          setError(null);
        }

        const response = await apiClient.get("/platform-partners/dashboard", {
          signal,
          params: {
            commPage: overridePages?.commPage ?? commPage,
            commLimit: pagination.commissions.pageSize,
            payoutPage: overridePages?.payoutPage ?? payoutPage,
            payoutLimit: pagination.payouts.pageSize,
            refPage: overridePages?.refPage ?? refPage,
            refLimit: pagination.referrals.pageSize,
          },
        });

        if (response.data.status === "success") {
          const dash = response.data.data.dashboard;
          const nextPagination = dash.pagination || pagination;
          setPagination(nextPagination);
          setData((prev) => {
            const prevData = appendSection ? prev || dash : dash;
            const computedTrends = {
              earningsChange:
                dash.trends?.earningsChange ??
                calcTrendPercent(
                  dash.partner?.totalEarnings,
                  prev?.partner?.totalEarnings,
                ),
              referralsChange:
                dash.trends?.referralsChange ??
                calcTrendPercent(
                  dash.stats?.totalNetworkCount,
                  prev?.stats?.totalNetworkCount,
                ),
            };
            return {
              ...dash,
              trends: computedTrends,
              recentCommissions:
                appendSection === "commissions"
                  ? [
                      ...(prevData?.recentCommissions || []),
                      ...(dash.recentCommissions || []),
                    ]
                  : dash.recentCommissions,
              recentPayouts:
                appendSection === "payouts"
                  ? [
                      ...(prevData?.recentPayouts || []),
                      ...(dash.recentPayouts || []),
                    ]
                  : dash.recentPayouts,
              referredCompanies:
                appendSection === "referrals"
                  ? [
                      ...(prevData?.referredCompanies || []),
                      ...(dash.referredCompanies || []),
                    ]
                  : dash.referredCompanies,
            };
          });
          setHasMore({
            commissions: calcHasMore(
              nextPagination.commissions,
              dash.recentCommissions?.length || 0,
            ),
            payouts: calcHasMore(
              nextPagination.payouts,
              dash.recentPayouts?.length || 0,
            ),
            referrals: calcHasMore(
              nextPagination.referrals,
              dash.referredCompanies?.length || 0,
            ),
          });
          setWithExpiry(cacheKey, dash, CACHE_TTL_MS);
          setError(null);
          success = true;
        } else {
          const message =
            response.data.message ||
            t("platformPartner.dashboard.errors.fetchDashboard");
          setError(message);
          toast.error(message);
        }
      } catch (error: any) {
        if (
          error?.code === "ERR_CANCELED" ||
          error?.name === "CanceledError" ||
          error?.name === "AbortError"
        ) {
          return false;
        }

        const status = error.response?.status;
        const serverMessage = String(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "",
        );

        const isNotPartner =
          status === 404 || /partner not found/i.test(serverMessage);

        if (isNotPartner) {
          setError(null);
        } else {
          const message =
            serverMessage ||
            t("platformPartner.dashboard.errors.fetchDashboard");
          setError(message);
          toast.error(message);
        }
      } finally {
        if (!background) {
          setLoading(false);
        }
      }
      return success;
    },
    [cacheKey, t, commPage, payoutPage, refPage, pagination],
  );

  useEffect(() => {
    const controller = new AbortController();
    const initialPages = {
      commPage: 1,
      payoutPage: 1,
      refPage: 1,
    };
    setData(null);
    setCommPage(1);
    setPayoutPage(1);
    setRefPage(1);
    setPagination({
      commissions: { page: 1, pageSize: 10, total: 0 },
      payouts: { page: 1, pageSize: 5, total: 0 },
      referrals: { page: 1, pageSize: 10, total: 0 },
    });
    setHasMore({
      commissions: true,
      payouts: true,
      referrals: true,
    });
    setError(null);
    const cached = getWithExpiry<PartnerDashboardData>(cacheKey);

    if (cached) {
      setData(cached);
      setLoading(false);
      fetchDashboardData({
        signal: controller.signal,
        background: true,
        overridePages: initialPages,
      });
    } else {
      fetchDashboardData({
        signal: controller.signal,
        overridePages: initialPages,
      });
    }

    return () => controller.abort();
  }, [cacheKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const loadMoreCommissions = () => {
    if (!hasMore.commissions) return;
    const nextPage = commPage + 1;
    fetchDashboardData({
      background: true,
      appendSection: "commissions",
      overridePages: { commPage: nextPage },
    }).then((ok) => {
      if (ok) setCommPage(nextPage);
    });
  };

  const loadMorePayouts = () => {
    if (!hasMore.payouts) return;
    const nextPage = payoutPage + 1;
    fetchDashboardData({
      background: true,
      appendSection: "payouts",
      overridePages: { payoutPage: nextPage },
    }).then((ok) => {
      if (ok) setPayoutPage(nextPage);
    });
  };

  const loadMoreReferrals = () => {
    if (!hasMore.referrals) return;
    const nextPage = refPage + 1;
    fetchDashboardData({
      background: true,
      appendSection: "referrals",
      overridePages: { refPage: nextPage },
    }).then((ok) => {
      if (ok) setRefPage(nextPage);
    });
  };

  const handlePayoutRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutAmount || Number(payoutAmount) <= 0) {
      toast.error(t("platformPartner.dashboard.payout.validAmountError"));
      return;
    }

    try {
      setPayoutLoading(true);
      const response = await apiClient.post(
        "/platform-partners/payout-request",
        {
          amount: Number(payoutAmount),
          method: payoutMethod,
          details: {},
        },
      );

      if (response.data.status === "success") {
        toast.success(t("platformPartner.dashboard.payout.success"));
        setPayoutAmount("");
        fetchDashboardData({ background: true });
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          t("platformPartner.dashboard.payout.error"),
      );
    } finally {
      setPayoutLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    payoutAmount,
    setPayoutAmount,
    payoutMethod,
    setPayoutMethod,
    payoutLoading,
    hasMore,
    fetchDashboardData,
    copyToClipboard,
    loadMoreCommissions,
    loadMorePayouts,
    loadMoreReferrals,
    handlePayoutRequest,
  };
}
