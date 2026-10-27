import React from "react";
import {
  ArrowTopRightOnSquareIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PhoneIcon,
  ShoppingBagIcon,
  TruckIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export interface TurboTicketOrderSidebarProps {
  activeOrder: any;
  showOrderSidebar: boolean;
  onClose: () => void;
  orderSearchQuery: string;
  setOrderSearchQuery: (val: string) => void;
  searchingOrder: boolean;
  onSearchOrder: (e: React.FormEvent) => void;
  onCopyCode: (code: string) => void;
}

export const TurboTicketOrderSidebar: React.FC<TurboTicketOrderSidebarProps> = ({
  activeOrder,
  showOrderSidebar,
  onClose,
  orderSearchQuery,
  setOrderSearchQuery,
  searchingOrder,
  onSearchOrder,
  onCopyCode,
}) => {
  if (!showOrderSidebar) return null;

  return (
    <aside className="w-80 sm:w-88 md:w-96 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col h-full min-h-0 overflow-hidden shrink-0 absolute inset-y-0 right-0 z-30 md:static md:z-auto shadow-2xl md:shadow-none animate-in slide-in-from-right duration-200">
      {/* Sidebar Header */}
      <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <ShoppingBagIcon className="h-4 w-4 text-zinc-600 dark:text-zinc-400 shrink-0" />
          <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
            {activeOrder
              ? `تفاصيل طلب #${activeOrder.orderNumber}`
              : "تفاصيل الأوردر المرتبط"}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          title="إغلاق القائمة الجانبية"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Sidebar Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5 text-xs">
        {activeOrder ? (
          <>
            {/* Statuses & Tracking */}
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 space-y-2">
              <div className="flex items-center justify-between gap-1.5 flex-wrap">
                <span className="text-[11px] text-zinc-500">حالة الطلب بالمتجر:</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200">
                  {activeOrder.status}
                </span>
              </div>
              {activeOrder.turboStatus && (
                <div className="flex items-center justify-between gap-1.5 flex-wrap">
                  <span className="text-[11px] text-zinc-500">حالة شحن تربو:</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                    {activeOrder.turboStatus}
                  </span>
                </div>
              )}
              {(activeOrder.turboTrackingNumber || activeOrder.turboShipmentId) && (
                <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-zinc-200/50 dark:border-zinc-700/50">
                  <span className="text-[11px] text-zinc-500">رقم البوليصة / الشحنة:</span>
                  <button
                    type="button"
                    onClick={() =>
                      onCopyCode(
                        String(activeOrder.turboTrackingNumber || activeOrder.turboShipmentId)
                      )
                    }
                    className="font-mono text-[11px] font-bold text-zinc-800 dark:text-zinc-200 hover:text-primary transition flex items-center gap-1"
                  >
                    <span>{activeOrder.turboTrackingNumber || activeOrder.turboShipmentId}</span>
                    <ClipboardDocumentIcon className="h-3 w-3 text-zinc-400" />
                  </button>
                </div>
              )}
            </div>

            {/* Customer Details Card */}
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <UserIcon className="h-3.5 w-3.5 text-zinc-500" />
                  <span>بيانات العميل</span>
                </span>
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {activeOrder.customer?.name || "عميل بدون اسم"}
                </p>
                {activeOrder.customer?.phone && (
                  <div className="flex items-center justify-between pt-1 flex-wrap gap-1">
                    <span className="font-mono text-zinc-700 dark:text-zinc-300 tabular-nums text-[11px]">
                      {activeOrder.customer.phone}
                    </span>
                    <div className="flex items-center gap-1">
                      <a
                        href={`tel:${activeOrder.customer.phone}`}
                        className="p-1 px-1.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition flex items-center gap-1 text-[10px]"
                        title="اتصال بالعميل"
                      >
                        <PhoneIcon className="h-3 w-3" />
                        <span>اتصال</span>
                      </a>
                      {(() => {
                        const cleanP = String(activeOrder.customer.phone).replace(/\D/g, "");
                        const waNumber = cleanP.startsWith("0") ? `2${cleanP}` : cleanP;
                        return (
                          <a
                            href={`https://wa.me/${waNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 px-1.5 rounded bg-emerald-500 text-white hover:bg-emerald-600 transition flex items-center gap-1 text-[10px] font-semibold"
                            title="محادثة واتساب"
                          >
                            <ChatBubbleLeftRightIcon className="h-3 w-3" />
                            <span>واتساب</span>
                          </a>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Address */}
              {(activeOrder.customer?.governorate ||
                activeOrder.customer?.city ||
                activeOrder.customer?.address) && (
                <div className="pt-2 border-t border-zinc-200/50 dark:border-zinc-700/50 space-y-1">
                  <div className="flex items-start gap-1.5 text-zinc-600 dark:text-zinc-300 text-[11px]">
                    <MapPinIcon className="h-3.5 w-3.5 text-zinc-400 shrink-0 mt-0.5" />
                    <div>
                      {(activeOrder.customer.governorate || activeOrder.customer.city) && (
                        <p className="font-medium text-zinc-800 dark:text-zinc-200">
                          {[activeOrder.customer.governorate, activeOrder.customer.city]
                            .filter(Boolean)
                            .join(" - ")}
                        </p>
                      )}
                      {activeOrder.customer.address && (
                        <p className="text-zinc-500 dark:text-zinc-400 leading-snug">
                          {activeOrder.customer.address}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Products List */}
            {activeOrder.items && activeOrder.items.length > 0 && (
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 space-y-2">
                <span className="font-bold text-zinc-800 dark:text-zinc-200 block">
                  المنتجات المطلوبة ({activeOrder.items.length})
                </span>
                <div className="space-y-1.5 divide-y divide-zinc-200/50 dark:divide-zinc-700/50">
                  {activeOrder.items.map((item: any, iIdx: number) => (
                    <div
                      key={item.id || iIdx}
                      className="pt-1.5 first:pt-0 flex items-start justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                          {item.productName}
                        </p>
                        {item.variantName && (
                          <p className="text-[10px] text-zinc-500">
                            {item.variantName}
                          </p>
                        )}
                        <p className="text-[10px] text-zinc-400 font-mono tabular-nums">
                          {item.quantity} × {item.unitPrice} ج.م
                        </p>
                      </div>
                      <span className="font-bold font-mono text-zinc-900 dark:text-zinc-100 tabular-nums text-xs">
                        {item.total} ج.م
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Financial Breakdown */}
            {activeOrder.financials && (
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 space-y-1.5">
                <span className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                  الحسابات المالية
                </span>
                <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 text-[11px]">
                  <span>قيمة المنتجات:</span>
                  <span className="font-mono tabular-nums font-medium">
                    {activeOrder.financials.subtotal} ج.م
                  </span>
                </div>
                <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 text-[11px]">
                  <span>مصاريف الشحن:</span>
                  <span className="font-mono tabular-nums font-medium">
                    {activeOrder.financials.shippingFee} ج.م
                  </span>
                </div>
                {activeOrder.financials.discount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 text-[11px]">
                    <span>الخصم:</span>
                    <span className="font-mono tabular-nums font-medium">
                      -{activeOrder.financials.discount} ج.م
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1.5 border-t border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  <span>المطلوب تحصيله:</span>
                  <span className="font-mono tabular-nums text-sm text-emerald-600 dark:text-emerald-400">
                    {activeOrder.financials.total} ج.م
                  </span>
                </div>
              </div>
            )}

            {/* Turbo Captain info if assigned */}
            {(activeOrder.turboCaptainName || activeOrder.turboCaptainPhone) && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                  <TruckIcon className="h-3.5 w-3.5" />
                  <span>مندوب / كابتن تربو</span>
                </span>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {activeOrder.turboCaptainName || "كابتن تربو"}
                </p>
                {activeOrder.turboCaptainPhone && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-mono text-zinc-700 dark:text-zinc-300 tabular-nums text-[11px]">
                      {activeOrder.turboCaptainPhone}
                    </span>
                    <a
                      href={`tel:${activeOrder.turboCaptainPhone}`}
                      className="p-1 px-2 rounded bg-amber-600 text-white hover:bg-amber-700 transition text-[10px] font-semibold"
                    >
                      اتصال
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Direct Link to Store Order */}
            <a
              href={`/orders?search=${encodeURIComponent(activeOrder.orderNumber)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-semibold text-xs flex items-center justify-center gap-1.5 transition active:scale-97 shadow-xs"
            >
              <span>عرض الأوردر بالكامل في المتجر</span>
              <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
            </a>
          </>
        ) : (
          <div className="space-y-3 py-4">
            <div className="text-center space-y-1">
              <ShoppingBagIcon className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto" />
              <p className="font-bold text-zinc-700 dark:text-zinc-300">
                لا يوجد أوردر مرتبط تلقائياً
              </p>
              <p className="text-[11px] text-zinc-400">
                يمكنك البحث برقم الأوردر أو كود الشحنة لعرض كافة تفاصيل الطلب هنا.
              </p>
            </div>

            <form onSubmit={onSearchOrder} className="space-y-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  placeholder="رقم الأوردر (مثال: 1042)..."
                  className="w-full pr-8 pl-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:border-zinc-400 transition"
                />
              </div>
              <button
                type="submit"
                disabled={searchingOrder || !orderSearchQuery.trim()}
                className="w-full py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-semibold text-xs transition disabled:opacity-40"
              >
                {searchingOrder ? "جاري البحث..." : "بحث عن الأوردر"}
              </button>
            </form>
          </div>
        )}
      </div>
    </aside>
  );
};
