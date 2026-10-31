import React from "react";
import { AlertTriangle, CheckCircle2, Loader2, Unplug, Users, X } from "lucide-react";
import type {
  FacebookAdsConnectionSourceStatus,
  FacebookAdsRemoteSourceStatus,
} from "../../../services/facebookAdsService";
import { safeStr, type AdsConnectionTexts } from "../facebookAdsConnection.constants";

interface Props {
  sources: FacebookAdsConnectionSourceStatus[];
  remoteSourcesById: Map<string, FacebookAdsRemoteSourceStatus>;
  loading: boolean;
  disconnectingSourceId: string | null;
  confirmSourceId: string | null;
  onConfirmDisconnect: (sourceId: string) => void;
  onCancelConfirm: () => void;
  onStartDisconnect: (sourceId: string) => void;
  formatDateTime: (value?: string | null) => string;
  t: AdsConnectionTexts;
}

export const FacebookAdsConnectionSources: React.FC<Props> = ({
  sources,
  remoteSourcesById,
  loading,
  disconnectingSourceId,
  confirmSourceId,
  onConfirmDisconnect,
  onCancelConfirm,
  onStartDisconnect,
  formatDateTime,
  t,
}) => {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-slate-200/70 dark:border-slate-800/70">
      <div className="flex items-center justify-between gap-2 bg-slate-50/90 px-4 py-2.5 dark:bg-slate-800/50">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200">
          {t.connectedSourcesTitle}
        </h3>
        <span className="text-xs font-medium tabular-nums text-slate-500 dark:text-slate-400">
          {sources.length} {t.sourcesCount}
        </span>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 px-4 py-4 text-xs font-medium text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          {t.loadingSources}
        </div>
      ) : sources.length ? (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {sources.map((source) => {
            const remoteSource = remoteSourcesById.get(source.id);
            const sourceName =
              source.facebookUserName ||
              source.facebookUserEmail ||
              source.facebookUserId;
            const isConnected =
              source.status === "connected" && source.hasToken;
            const disconnecting = disconnectingSourceId === source.id;
            const isConfirming = confirmSourceId === source.id;

            return (
              <div
                key={source.id}
                className="flex flex-col gap-3 p-4 transition-colors hover:bg-slate-50/50 sm:flex-row sm:items-center sm:justify-between dark:hover:bg-slate-800/30"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300">
                    <Users className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                      {sourceName}
                    </p>
                    <p className="truncate font-mono text-xs tabular-nums text-slate-400 dark:text-slate-500">
                      {source.facebookUserId}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-md bg-slate-100 px-2 py-1 font-medium tabular-nums text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {source.syncedAdAccountsCount} {t.adAccountsCount}
                  </span>
                  <span className="tabular-nums text-slate-400">
                    {formatDateTime(source.lastSyncedAt || source.connectedAt)}
                  </span>
                  {remoteSource?.checked ? (
                    remoteSource.ok ? (
                      <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        {remoteSource.accountsCount ?? 0} {t.fromMeta}
                      </span>
                    ) : (
                      <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                        {safeStr(remoteSource.error) || t.testFailed}
                      </span>
                    )
                  ) : null}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span
                    className={[
                      "inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold tracking-wide",
                      isConnected
                        ? "border border-emerald-200/70 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "border border-amber-200/70 bg-amber-50 text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300",
                    ].join(" ")}
                  >
                    {isConnected ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5" />
                    )}
                    {isConnected ? t.connected : t.disconnected}
                  </span>
                  {isConfirming ? (
                    <div className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-rose-50 p-1 dark:border-rose-900 dark:bg-rose-950/60">
                      <button
                        type="button"
                        onClick={() => onConfirmDisconnect(source.id)}
                        disabled={disconnecting}
                        className="inline-flex h-7 items-center gap-1 rounded-md bg-rose-600 px-2 text-[11px] font-semibold text-white transition hover:bg-rose-700"
                      >
                        {disconnecting ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Unplug className="h-3 w-3" />
                        )}
                        {t.disconnect}
                      </button>
                      <button
                        type="button"
                        onClick={onCancelConfirm}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-rose-100 dark:hover:bg-rose-900"
                        title="إلغاء"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onStartDisconnect(source.id)}
                      disabled={!isConnected || disconnecting}
                      className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/30 disabled:cursor-not-allowed disabled:opacity-40 dark:border-rose-900/60 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
                    >
                      <Unplug className="h-3 w-3" />
                      {t.disconnect}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-4 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
          {t.noSourcesFound}
        </div>
      )}
    </div>
  );
};
