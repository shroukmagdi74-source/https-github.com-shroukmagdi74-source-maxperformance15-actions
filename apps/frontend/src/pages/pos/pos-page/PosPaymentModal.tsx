import React from "react";
import { X, Banknote, CreditCard, Sliders, Check, Loader2 } from "lucide-react";

interface PosPaymentModalProps {
  show: boolean;
  onClose: () => void;
  total: number;
  paymentMethod: "CASH" | "CARD" | "SPLIT";
  setPaymentMethod: (m: "CASH" | "CARD" | "SPLIT") => void;
  cashReceived: number;
  setCashReceived: (val: number) => void;
  splitCash: number;
  setSplitCash: (val: number) => void;
  splitCard: number;
  setSplitCard: (val: number) => void;
  change: number;
  processing: boolean;
  onCheckout: () => void;
  t: (key: string) => string;
}

export const PosPaymentModal: React.FC<PosPaymentModalProps> = ({
  show,
  onClose,
  total,
  paymentMethod,
  setPaymentMethod,
  cashReceived,
  setCashReceived,
  splitCash,
  setSplitCash,
  splitCard,
  setSplitCard,
  change,
  processing,
  onCheckout,
  t,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t("pos.k_48")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="text-center mb-6">
          <p className="text-gray-500 dark:text-gray-400">{t("pos.k_6")}</p>
          <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
            {total.toLocaleString()} {t("pos.k_39")}
          </p>
        </div>

        {/* Method Toggles */}
        <div className="flex gap-2 mb-6">
          {(["CASH", "CARD", "SPLIT"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setPaymentMethod(m);
                if (m === "SPLIT") {
                  const half = Math.round(total / 2);
                  setSplitCash(half);
                  setSplitCard(Math.max(0, total - half));
                }
              }}
              className={
                "flex-1 p-3 rounded-xl font-medium flex items-center justify-center gap-1.5 transition-all text-xs sm:text-sm " +
                (paymentMethod === m
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300")
              }
            >
              {m === "CASH" ? (
                <>
                  <Banknote className="h-4 w-4" />
                  {t("pos.k_49")}
                </>
              ) : m === "CARD" ? (
                <>
                  <CreditCard className="h-4 w-4" />
                  {t("pos.k_50")}
                </>
              ) : (
                <>
                  <Sliders className="h-4 w-4" />
                  مقسم (كاش+فيزا)
                </>
              )}
            </button>
          ))}
        </div>

        {/* CASH mode details */}
        {paymentMethod === "CASH" && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {t("pos.k_51")}
            </label>
            <input
              type="number"
              value={cashReceived}
              onChange={(e) => setCashReceived(Number(e.target.value))}
              className="w-full p-4 border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-2xl text-center font-bold text-gray-900 dark:text-white focus:border-blue-500 outline-none transition-all"
            />
            <div className="flex gap-2 mt-3">
              {[50, 100, 200, 500].map((v) => (
                <button
                  key={v}
                  onClick={() => setCashReceived(v)}
                  className="flex-1 p-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {v}
                </button>
              ))}
            </div>
            {cashReceived >= total && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-center border border-green-100 dark:border-green-900/30">
                <p className="text-gray-600 dark:text-gray-400">{t("pos.k_8")}</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {change.toLocaleString()} {t("pos.k_39")}
                </p>
              </div>
            )}
          </div>
        )}

        {/* SPLIT mode details */}
        {paymentMethod === "SPLIT" && (
          <div className="space-y-3 mb-6 bg-gray-50 dark:bg-gray-700/50 p-3.5 rounded-xl border border-gray-200 dark:border-gray-600">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  المبلغ نقداً (كاش)
                </label>
                <span className="text-[11px] text-gray-400">ج.م</span>
              </div>
              <input
                type="number"
                value={splitCash || ""}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSplitCash(val);
                  setSplitCard(Math.max(0, Math.round(total - val)));
                }}
                placeholder="0"
                className="w-full p-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-lg text-center font-bold text-gray-900 dark:text-white outline-none focus:border-blue-500 tabular-nums"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  المبلغ بالبطاقة (فيزا / مدى)
                </label>
                <span className="text-[11px] text-gray-400">ج.م</span>
              </div>
              <input
                type="number"
                value={splitCard || ""}
                onChange={(e) => setSplitCard(Number(e.target.value))}
                placeholder="0"
                className="w-full p-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-lg text-center font-bold text-gray-900 dark:text-white outline-none focus:border-blue-500 tabular-nums"
              />
            </div>
            <div className="flex justify-between text-xs pt-1 border-t dark:border-gray-600">
              <span className="text-gray-500 dark:text-gray-400">
                إجمالي المدفوع:
              </span>
              <span
                className={
                  "font-bold tabular-nums " +
                  (splitCash + splitCard >= Math.floor(total)
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-500")
                }
              >
                {(splitCash + splitCard).toLocaleString()} /{" "}
                {total.toLocaleString()} {t("pos.k_39")}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={onCheckout}
          disabled={
            processing ||
            (paymentMethod === "CASH" && cashReceived < total) ||
            (paymentMethod === "SPLIT" && splitCash + splitCard < Math.floor(total))
          }
          className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
        >
          {processing ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Check className="h-6 w-6" />
          )}
          {t("pos.k_52")}
        </button>
      </div>
    </div>
  );
};
