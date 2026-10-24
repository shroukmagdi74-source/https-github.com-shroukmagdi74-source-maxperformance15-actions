import React from "react";
import { Link } from "react-router-dom";
import {
  Target,
  Send,
  Users,
  TrendingUp,
  TrendingDown,
  Eye,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { ReEngagementLine } from "./types";
import { fmt, normalizeDigits } from "./formatters";
import { SourceBadge } from "./SourceBadge";
import { StatusBadge } from "./StatusBadge";

interface LoyaltyReEngagementSectionProps {
  reEngagementLines: ReEngagementLine[];
  savingToggle: boolean;
  handleToggle: (line: ReEngagementLine) => void;
  thresholdDraft: number;
  setThresholdDraft: (val: number) => void;
  saveThreshold: () => Promise<void>;
  viewCustomers: (id: string) => Promise<void>;
}

export const LoyaltyReEngagementSection: React.FC<LoyaltyReEngagementSectionProps> = ({
  reEngagementLines,
  savingToggle,
  handleToggle,
  thresholdDraft,
  setThresholdDraft,
  saveThreshold,
  viewCustomers,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-1 flex items-center gap-2">
        <Target className="h-5 w-5 text-fuchsia-500" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          أداة إعادة الاستهداف (Re-engagement)
        </h3>
      </div>
      <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
        العميل اشترى ← النظام يحدد إنه محتاج إعادة استهداف ← تُرسل رسالة إعادة شراء من
        الأداة المناسبة في قسم العملاء.
      </p>

      <div className="space-y-3">
        {reEngagementLines.map((line) => (
          <div
            key={line.id}
            className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Send className="h-4 w-4 text-fuchsia-500" />
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {line.trigger}
              </p>
              <span className="ms-auto">
                <StatusBadge status={line.status} />
              </span>
              <Switch
                checked={line.enabled}
                disabled={savingToggle}
                onCheckedChange={() => handleToggle(line)}
                aria-label={`تفعيل حلقة ${line.tool}`}
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900/40">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  العملاء المطابقين:
                </span>
                <span className="font-bold font-mono tabular-nums text-gray-900 dark:text-white">
                  {line.count === null ? "غير محدد" : fmt(line.count)}
                </span>
              </div>
              {line.trend && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    line.trend.up === line.trend.goodWhenUp
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                  }`}
                  title={line.trend.text}
                >
                  {line.trend.up ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {line.trend.text}
                </span>
              )}
              {line.id === "postPurchase" && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    حد السكوت (يوم):
                  </span>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={thresholdDraft}
                    onChange={(e) =>
                      setThresholdDraft(Math.max(1, Math.min(365, Number(e.target.value) || 30)))
                    }
                    className="h-7 w-20 px-2 text-xs font-mono tabular-nums"
                  />
                  <button
                    onClick={saveThreshold}
                    className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    حفظ
                  </button>
                </div>
              )}
              <button
                onClick={() => viewCustomers(line.id)}
                className="ms-auto inline-flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 text-[10px] font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Eye className="h-3 w-3" />
                شوف العملاء
              </button>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div>
                <p className="text-[10px] font-semibold uppercase text-gray-400">
                  الأداة
                </p>
                <Link
                  to={line.route}
                  className="mt-1 inline-block text-sm font-medium text-purple-600 hover:underline dark:text-purple-400"
                >
                  {line.tool}
                </Link>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase text-gray-400">
                  الرسالة (قالب)
                </p>
                <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                  {line.message}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase text-gray-400">
                  بتتبعت منين
                </p>
                <div className="mt-1">
                  <SourceBadge source={line.source} />
                </div>
                <p className="mt-1 text-[10px] text-gray-400" dir="ltr">
                  {normalizeDigits(line.source.desc)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
