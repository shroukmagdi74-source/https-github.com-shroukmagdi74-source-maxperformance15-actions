import React from "react";
import { Loader2 } from "lucide-react";
import type { FacebookAdsSavedAdAccountStatus } from "../../../services/facebookAdsService";
import type { AdsConnectionTexts } from "../facebookAdsConnection.constants";

interface Props {
  accounts: FacebookAdsSavedAdAccountStatus[];
  loading: boolean;
  activatingAccountId?: string | null;
  onSetActive?: (account: FacebookAdsSavedAdAccountStatus) => void;
  t: AdsConnectionTexts;
}

export const FacebookAdsSavedAccountsTable: React.FC<Props> = ({
  accounts,
  loading,
  activatingAccountId,
  onSetActive,
  t,
}) => {
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200/70 dark:border-slate-800/70">
      <table className="w-full text-start text-xs">
        <thead className="bg-slate-50/90 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
          <tr>
            <th className="px-4 py-2.5 text-start font-semibold">{t.tableAccount}</th>
            <th className="px-4 py-2.5 text-start font-semibold">{t.tableSource}</th>
            <th className="px-4 py-2.5 text-start font-semibold">{t.tableCurrency}</th>
            <th className="px-4 py-2.5 text-start font-semibold">{t.tableStatus}</th>
            <th className="px-4 py-2.5 text-start font-semibold">{t.tableTokenType}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {loading ? (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                <Loader2 className="me-2 inline-block h-4 w-4 animate-spin text-blue-600" />
                {t.loadingAccounts}
              </td>
            </tr>
          ) : accounts.length ? (
            accounts.map((account) => {
              const metaStatus = account.metaHealth?.accountStatus;
              const isMetaActive = metaStatus === "1";
              const isMetaDisabled = metaStatus === "2";
              const isMetaReview = metaStatus === "7";
              const isActivating = activatingAccountId === account.id;

              return (
                <tr
                  key={account.id}
                  className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                >
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-900 dark:text-white">
                      {account.name}
                    </p>
                    <p className="font-mono text-[11px] tabular-nums text-slate-400">
                      {account.accountId}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">
                    {account.connectionSource?.facebookUserName ||
                      account.connectionSource?.facebookUserEmail ||
                      (account.connectionSourceId ? t.facebookAccount : t.legacySource)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono font-semibold tabular-nums text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {account.currency}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {isMetaDisabled ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                          {t.statusMetaDisabled}
                        </span>
                      ) : isMetaReview ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          {t.statusMetaReview}
                        </span>
                      ) : isMetaActive || account.isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {isMetaActive ? t.statusMetaActive : t.statusActive}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          {t.statusSaved}
                        </span>
                      )}

                      {!account.isActive && onSetActive ? (
                        <button
                          type="button"
                          onClick={() => onSetActive(account)}
                          disabled={isActivating}
                          className="inline-flex h-6 items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 text-[10px] font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300"
                        >
                          {isActivating ? (
                            <Loader2 className="h-2.5 w-2.5 animate-spin" />
                          ) : null}
                          {isActivating ? t.settingActive : t.setActive}
                        </button>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">
                    {account.tokenSource === "facebook_account"
                      ? t.tokenFromSource
                      : account.hasIsolatedToken
                        ? t.tokenIsolated
                        : t.tokenMissing}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                {t.noSavedAccounts}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
