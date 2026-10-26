import React from "react";
import {
  ShoppingCart,
  Bookmark,
  Trash2,
  Coffee,
  Check,
  Image as ImageIcon,
  Minus,
  Plus,
  Percent,
  FileText,
  Loader2,
  Flame,
  CreditCard,
} from "lucide-react";
import { CartItem, OpenTab } from "./types";
import { PosProductImage } from "./PosProductImage";

interface PosCartPanelProps {
  cart: CartItem[];
  activeTabName: string | null;
  activeTabId: string | null;
  openTabs: OpenTab[];
  kotSuccessNotice: string | null;
  kotFiring: boolean;
  discountType: "NONE" | "PERCENT" | "VIP_COMP";
  discountPercent: number;
  rawSubtotal: number;
  discountAmount: number;
  tax: number;
  total: number;
  onOpenParkModal: () => void;
  onClearCart: () => void;
  onUnlinkTab: () => void;
  onRestoreTab: (tab: OpenTab) => void;
  onDeleteTab: (tabId: string, e: React.MouseEvent) => void;
  onUpdateQty: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onSetDiscount: (type: "NONE" | "PERCENT" | "VIP_COMP", percent: number) => void;
  onOpenShiftReport: () => void;
  onFireKitchenTicket: () => void;
  onOpenPayment: () => void;
  t: (key: string) => string;
}

export const PosCartPanel: React.FC<PosCartPanelProps> = ({
  cart,
  activeTabName,
  activeTabId,
  openTabs,
  kotSuccessNotice,
  kotFiring,
  discountType,
  discountPercent,
  rawSubtotal,
  discountAmount,
  tax,
  total,
  onOpenParkModal,
  onClearCart,
  onUnlinkTab,
  onRestoreTab,
  onDeleteTab,
  onUpdateQty,
  onRemoveItem,
  onSetDiscount,
  onOpenShiftReport,
  onFireKitchenTicket,
  onOpenPayment,
  t,
}) => {
  return (
    <div className="w-88 md:w-96 bg-card/60 backdrop-blur-xs border-r border-border/80 flex flex-col shrink-0 min-h-0">
      {/* Header */}
      <div className="p-3 border-b border-border/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg border border-border/80 bg-muted/40 flex items-center justify-center">
            <ShoppingCart className="size-4 text-foreground" />
          </div>
          <span className="font-bold text-sm text-foreground">
            {t("pos.k_46")}
          </span>
          <span className="font-mono text-xs tabular-nums px-1.5 py-0.5 rounded border border-border/60 text-muted-foreground bg-muted/40">
            {cart.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenParkModal}
            disabled={!cart.length}
            className="p-1.5 border border-border/80 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors disabled:opacity-30 active:scale-[0.98]"
            title="تعليق الطلب على طاولة"
          >
            <Bookmark className="size-4" />
          </button>
          <button
            onClick={onClearCart}
            className="p-1.5 border border-border/80 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors active:scale-[0.98]"
            title="تفريغ السلة"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      {/* Active Tab Notice */}
      {activeTabName && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-3 py-1.5 flex items-center justify-between text-xs text-amber-700 dark:text-amber-300">
          <div className="flex items-center gap-1.5 font-medium">
            <Coffee className="w-3.5 h-3.5 text-amber-600" />
            <span>طاولة مفتوحة: {activeTabName}</span>
          </div>
          <button
            onClick={onUnlinkTab}
            className="text-[11px] underline hover:text-amber-800 dark:hover:text-amber-200"
          >
            تحويل لسفري
          </button>
        </div>
      )}

      {/* KOT Success Notice */}
      {kotSuccessNotice && (
        <div className="bg-green-500/15 border-b border-green-500/30 px-3 py-1.5 text-xs text-green-700 dark:text-green-300 font-medium flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-green-600" />
          <span>{kotSuccessNotice}</span>
        </div>
      )}

      {/* Open Tabs Horizontal Ribbon */}
      {openTabs.length > 0 && (
        <div className="bg-amber-50/70 dark:bg-amber-950/30 border-b dark:border-gray-700 px-3 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-hide text-xs">
          <span className="font-semibold text-amber-800 dark:text-amber-400 whitespace-nowrap text-[11px]">
            طاولات:
          </span>
          {openTabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => onRestoreTab(tab)}
              className={
                "inline-flex items-center gap-1 px-2 py-1 rounded border shadow-xs cursor-pointer whitespace-nowrap " +
                (activeTabId === tab.id
                  ? "bg-amber-500 text-white border-amber-600 font-bold"
                  : "bg-white dark:bg-gray-800 border-amber-300 dark:border-amber-700/60 hover:border-amber-500 text-gray-900 dark:text-white")
              }
            >
              <span className="text-xs">{tab.name}</span>
              <span
                className={
                  "text-[10px] " +
                  (activeTabId === tab.id ? "text-white/80" : "text-gray-400")
                }
              >
                ({tab.items.length})
              </span>
              <span
                onClick={(e) => onDeleteTab(tab.id, e)}
                className="hover:text-red-500 ml-1 font-bold text-xs"
              >
                ×
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Cart Items List */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2 dark:bg-gray-800/50">
        {!cart.length ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-600">
            <ShoppingCart className="h-16 w-16 mb-4 opacity-30" />
            <p>{t("pos.k_10")}</p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 border border-transparent dark:border-gray-700"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                  {item.images.length ? (
                    <PosProductImage
                      candidates={item.images}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      requestedWidth={96}
                      responsiveWidths={[64, 96, 128]}
                      responsiveSizes="48px"
                      imageQuality={68}
                      fallback={
                        <ImageIcon className="w-full h-full p-2 text-gray-400 dark:text-gray-500" />
                      }
                    />
                  ) : (
                    <ImageIcon className="w-full h-full p-2 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate text-gray-900 dark:text-white">
                    {item.name}
                  </h4>
                  {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {item.selectedModifiers.map((mod) => (
                        <span
                          key={mod.id}
                          className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-300 px-1 py-0.2 rounded border border-amber-500/20 tabular-nums"
                        >
                          +{mod.name}
                          {mod.additionalPrice > 0 ? ` (${mod.additionalPrice})` : ""}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.itemNotes && (
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 italic mt-0.5 truncate">
                      ملاحظة: {item.itemNotes}
                    </p>
                  )}
                  <p className="text-blue-600 dark:text-blue-400 font-bold text-sm mt-0.5 tabular-nums">
                    {(item.price * item.qty).toLocaleString()} {t("pos.k_39")}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onUpdateQty(item.id, -1)}
                    className="w-7 h-7 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => onUpdateQty(item.id, 1)}
                    className="w-7 h-7 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Summary & Actions */}
      <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 space-y-3">
        {/* Quick Discounts Bar */}
        <div className="flex items-center justify-between gap-1 pb-2 border-b dark:border-gray-700">
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Percent className="w-3 h-3" />
            <span className="text-[11px]">خصم:</span>
          </div>
          <div className="flex items-center gap-1">
            {[
              { label: "0%", type: "NONE" as const, val: 0 },
              { label: "10%", type: "PERCENT" as const, val: 10 },
              { label: "15%", type: "PERCENT" as const, val: 15 },
              { label: "20%", type: "PERCENT" as const, val: 20 },
              { label: "ضيافة VIP", type: "VIP_COMP" as const, val: 100 },
            ].map((d) => {
              const active =
                discountType === d.type &&
                (d.type !== "PERCENT" || discountPercent === d.val);
              return (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => {
                    if (active) {
                      onSetDiscount("NONE", 0);
                    } else {
                      onSetDiscount(d.type, d.val);
                    }
                  }}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    active
                      ? "bg-amber-600 text-white shadow-xs"
                      : "bg-gray-200/70 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Calculations */}
        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex justify-between">
            <span>{t("pos.k_4")}</span>
            <span className="text-gray-900 dark:text-white tabular-nums">
              {rawSubtotal.toLocaleString()} {t("pos.k_39")}
            </span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-amber-600 dark:text-amber-400 font-medium">
              <span>
                {discountType === "VIP_COMP"
                  ? "ضيافة إدارة (100%)"
                  : `خصم (${discountPercent}%)`}
              </span>
              <span className="tabular-nums">
                - {discountAmount.toLocaleString()} {t("pos.k_39")}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span>{t("pos.k_11")}</span>
            <span className="text-gray-900 dark:text-white tabular-nums">
              {tax.toLocaleString()} {t("pos.k_39")}
            </span>
          </div>
          <div className="flex justify-between text-xl font-bold pt-2 border-t dark:border-gray-700 text-gray-900 dark:text-white">
            <span>{t("pos.k_6")}</span>
            <span className="text-blue-600 dark:text-blue-400 tabular-nums">
              {total.toLocaleString()} {t("pos.k_39")}
            </span>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="grid grid-cols-4 gap-1.5">
          <button
            onClick={onOpenShiftReport}
            className="p-2.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg flex flex-col items-center justify-center hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            title={t("pos.k_12")}
          >
            <FileText className="h-4 w-4" />
            <span className="text-[10px] mt-0.5">{t("pos.k_12")}</span>
          </button>
          <button
            onClick={onFireKitchenTicket}
            disabled={!cart.length || kotFiring}
            className="p-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 rounded-lg flex flex-col items-center justify-center transition-colors disabled:opacity-40"
            title="إرسال تذكرة التحضير للبار والمطبخ فوراً"
          >
            {kotFiring ? (
              <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
            ) : (
              <Flame className="h-4 w-4 text-amber-600" />
            )}
            <span className="text-[10px] font-bold mt-0.5">للبـار</span>
          </button>
          <button
            onClick={onOpenPayment}
            disabled={!cart.length}
            className="col-span-2 p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-50 font-bold transition-all shadow-md active:scale-95 text-sm"
          >
            <CreditCard className="h-4 w-4" />
            {t("pos.k_47")}
          </button>
        </div>
      </div>
    </div>
  );
};
