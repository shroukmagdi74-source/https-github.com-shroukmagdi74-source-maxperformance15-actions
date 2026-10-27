import React from "react";
import { useTranslation } from "react-i18next";
import { Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { useCurrency } from "../../../hooks/useCurrency";
import { getRankProgress } from "./helpers";

interface PartnerPayoutRequestCardProps {
  pendingEarnings: number;
  payoutAmount: string;
  setPayoutAmount: (value: string) => void;
  payoutMethod: string;
  setPayoutMethod: (value: string) => void;
  payoutLoading: boolean;
  handlePayoutRequest: (e: React.FormEvent) => Promise<void>;
  partnerTitle: string;
}

export const PartnerPayoutRequestCard: React.FC<PartnerPayoutRequestCardProps> = ({
  pendingEarnings,
  payoutAmount,
  setPayoutAmount,
  payoutMethod,
  setPayoutMethod,
  payoutLoading,
  handlePayoutRequest,
  partnerTitle,
}) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  const { progressToTop, nextRankKey } = getRankProgress(partnerTitle);
  const nextRankLabel = nextRankKey
    ? t(`platformPartner.dashboard.ranks.${nextRankKey}`) || nextRankKey
    : t("platformPartner.dashboard.rankings.maxRank") || "";

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-lg bg-gradient-to-br from-blue-700 to-indigo-900 text-white">
        <CardContent className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xl">
              <Wallet className="w-8 h-8" />
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100">
                {t("platformPartner.dashboard.payout.readyForWithdrawal")}
              </p>
              <h2 className="text-3xl font-bold tabular-nums">
                {formatPrice(pendingEarnings)}
              </h2>
            </div>
          </div>

          <form onSubmit={handlePayoutRequest} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="partner-payout-amount"
                className="text-sm font-medium text-blue-100"
              >
                {t("platformPartner.dashboard.payout.amountToWithdraw")}
              </label>
              <input
                id="partner-payout-amount"
                name="payoutAmount"
                type="number"
                inputMode="numeric"
                autoComplete="off"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                placeholder="EGP"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all tabular-nums"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="partner-payout-method"
                className="text-sm font-medium text-blue-100"
              >
                {t("platformPartner.dashboard.payout.method")}
              </label>
              <select
                id="partner-payout-method"
                name="payoutMethod"
                autoComplete="off"
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all appearance-none text-white cursor-pointer"
              >
                <option value="VODAFONE_CASH" className="text-gray-900">
                  {t("platformPartner.dashboard.payout.methods.vodafoneCash")}
                </option>
                <option value="INSTAPAY" className="text-gray-900">
                  {t("platformPartner.dashboard.payout.methods.instapay")}
                </option>
                <option value="BANK_TRANSFER" className="text-gray-900">
                  {t("platformPartner.dashboard.payout.methods.bankTransfer")}
                </option>
                <option value="CASH" className="text-gray-900">
                  {t("platformPartner.dashboard.payout.methods.cash")}
                </option>
                <option value="WALLET" className="text-gray-900">
                  {t("platformPartner.dashboard.payout.methods.wallet")}
                </option>
              </select>
            </div>

            <Button
              type="submit"
              disabled={payoutLoading || !payoutAmount}
              className="w-full bg-white text-blue-900 hover:bg-blue-50 py-6 text-lg font-bold rounded-xl shadow-lg transition-transform active:scale-[0.98] cursor-pointer"
            >
              {payoutLoading
                ? t("platformPartner.dashboard.payout.processing")
                : t("platformPartner.dashboard.payout.withdrawFunds")}
            </Button>
          </form>

          <p className="mt-4 text-xs text-center text-blue-200 opacity-80">
            {t("platformPartner.dashboard.payout.minimumAmount")}
          </p>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-500">
            {t("platformPartner.dashboard.rankings.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${progressToTop}%` }}
              />
            </div>
            <span className="text-xs font-bold text-blue-600 tabular-nums">
              {progressToTop}%
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {t("platformPartner.dashboard.rankings.nextRank")}{" "}
            <span className="text-gray-600 dark:text-gray-300">
              {nextRankLabel}
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
