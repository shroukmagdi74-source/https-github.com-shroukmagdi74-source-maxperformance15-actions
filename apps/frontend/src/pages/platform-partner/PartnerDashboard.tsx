import React from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  PartnerCommissionsTable,
  PartnerDashboardHeader,
  PartnerDashboardStatsGrid,
  PartnerPayoutRequestCard,
  PartnerPayoutsTable,
  PartnerReferralsTable,
  usePartnerDashboard,
} from "./dashboard";

const PartnerDashboard: React.FC = () => {
  const { t } = useTranslation();
  const {
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
  } = usePartnerDashboard();

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-t-4 border-blue-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-blue-500">
            {t("common.loading")}
          </div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-8 text-center max-w-2xl mx-auto text-gray-500">
        {error}
      </div>
    );
  }

  if (!data?.partner && !loading) {
    return (
      <div className="p-8 text-center max-w-2xl mx-auto">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-8 rounded-2xl shadow-sm">
          <AlertCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">
            {t("platformPartner.dashboard.accountRequired")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t("platformPartner.dashboard.accountRequiredDesc")}
          </p>
        </div>
      </div>
    );
  }

  if (!data || !data.partner) return null;

  const referralLink = `${window.location.origin}/auth/register?partner=${data.partner.partnerCode}`;

  return (
    <div className="p-6 max-w-6xl 2xl:max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {error && (
        <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 rounded-xl text-red-700 dark:text-red-200 flex items-center justify-between">
          <span>{error}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchDashboardData()}
            className="cursor-pointer"
          >
            {t("common.retry") || "إعادة المحاولة"}
          </Button>
        </div>
      )}

      <PartnerDashboardHeader
        partnerCode={data.partner.partnerCode}
        partnerTitle={data.partner.title}
        referralLink={referralLink}
        copyToClipboard={copyToClipboard}
      />

      <PartnerDashboardStatsGrid
        partner={data.partner}
        stats={data.stats}
        trends={data.trends}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <PartnerCommissionsTable
            commissions={data.recentCommissions}
            hasMore={hasMore.commissions}
            onLoadMore={loadMoreCommissions}
          />

          <PartnerPayoutsTable
            payouts={data.recentPayouts}
            hasMore={hasMore.payouts}
            onLoadMore={loadMorePayouts}
          />

          <PartnerReferralsTable
            referrals={data.referredCompanies}
            hasMore={hasMore.referrals}
            onLoadMore={loadMoreReferrals}
          />
        </div>

        <PartnerPayoutRequestCard
          pendingEarnings={data.partner.pendingEarnings}
          payoutAmount={payoutAmount}
          setPayoutAmount={setPayoutAmount}
          payoutMethod={payoutMethod}
          setPayoutMethod={setPayoutMethod}
          payoutLoading={payoutLoading}
          handlePayoutRequest={handlePayoutRequest}
          partnerTitle={data.partner.title}
        />
      </div>
    </div>
  );
};

export default PartnerDashboard;
