import React from "react";
import { Link } from "react-router-dom";
import { Cloud, Smartphone, HelpCircle, ExternalLink, Info } from "lucide-react";
import { RoutingInfo } from "./types";
import { normalizeDigits } from "./formatters";
import { SourceBadge } from "./SourceBadge";

interface RoutingToolItem {
  tool: string;
  route: string;
  source: RoutingInfo;
  editable?: boolean;
}

interface LoyaltyRoutingSectionProps {
  routing: RoutingInfo;
  routingTools: RoutingToolItem[];
  openChannelDialog: () => void;
}

export const LoyaltyRoutingSection: React.FC<LoyaltyRoutingSectionProps> = ({
  routing,
  routingTools,
  openChannelDialog,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-1 text-lg font-bold text-gray-900 dark:text-white">
        توجيه الرسائل (WhatsApp Routing)
      </h3>
      <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
        المصدر الحالي للإرسال مأخوذ من جلسات واتساب المتصلة — أي قيمة غير مؤكدة تُعرض
        «غير محدد» ولا تُخمَّن.
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            routing.key === "meta"
              ? "bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400"
              : routing.key === "wa"
                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
          }`}
        >
          {routing.key === "meta" ? (
            <Cloud className="h-5 w-5" />
          ) : routing.key === "wa" ? (
            <Smartphone className="h-5 w-5" />
          ) : (
            <HelpCircle className="h-5 w-5" />
          )}
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            المصدر الافتراضي للإرسال: {routing.label}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400" dir="ltr">
            {normalizeDigits(routing.desc) || "لا توجد بيانات"}
          </p>
        </div>
        {routing.key === "unknown" && (
          <span className="ms-auto rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            تحتاج ربط جلسة واتساب من الإعدادات
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-right text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
              <th className="py-2 pe-4 font-semibold">الأداة</th>
              <th className="py-2 pe-4 font-semibold">المصدر</th>
            </tr>
          </thead>
          <tbody>
            {routingTools.map((row) => (
              <tr
                key={row.route}
                className="border-b border-gray-100 last:border-0 dark:border-gray-800"
              >
                <td className="py-2.5 pe-4">
                  <Link
                    to={row.route}
                    className="font-medium text-gray-800 hover:text-purple-600 dark:text-gray-200"
                  >
                    {row.tool}
                  </Link>
                </td>
                <td className="py-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <SourceBadge source={row.source} />
                    {row.editable && (
                      <button
                        onClick={openChannelDialog}
                        className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2 py-0.5 text-[10px] font-semibold text-gray-500 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <ExternalLink className="h-3 w-3" />
                        تعديل
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
        <Info className="h-3.5 w-3.5" />
        المصدر الافتراضي بيتحدد من جلسة الواتساب المتصلة — عدّله من
        <Link to="/whatsapp/settings" className="ms-1 font-medium text-purple-600 hover:underline dark:text-purple-400">
          إعدادات واتساب
        </Link>
        . قناة عيد الميلاد لها إعداد خاص قابل للتعديل من هنا.
      </p>
    </div>
  );
};
