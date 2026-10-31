import React from "react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import {
  Phone,
  SquarePen,
  X,
  Plus,
  Check,
  ShoppingBag,
  User,
  Star,
  MapPin,
  FileText,
  ExternalLink,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { getStatusDisplay } from "../../../../utils/statusRegistry";
import { sectionSurfaceStyle, mutedHeadingStyle, getOrderStatusTheme } from "./styles";
import { InboxConversation } from "../../../../types/inbox.types";

interface CustomerOrdersTabProps {
  orders: any[];
  customer: any;
  conversation: InboxConversation;
  editingPhone: boolean;
  phoneDraft: string;
  setPhoneDraft: (val: string) => void;
  savingPhone: boolean;
  phoneUpdateMessage: string | null;
  handleStartEditPhone: () => void;
  handleSavePhone: () => void;
  setEditingPhone: (val: boolean) => void;
  setPhoneUpdateMessage: (val: string | null) => void;
  searchOrderPhone: string;
  setSearchOrderPhone: (val: string) => void;
  loadCustomerData: (customerId: string, options?: any) => void;
  setPreviewOrder: (order: any) => void;
}

export const CustomerOrdersTab: React.FC<CustomerOrdersTabProps> = ({
  orders,
  customer,
  conversation,
  editingPhone,
  phoneDraft,
  setPhoneDraft,
  savingPhone,
  phoneUpdateMessage,
  handleStartEditPhone,
  handleSavePhone,
  setEditingPhone,
  setPhoneUpdateMessage,
  searchOrderPhone,
  setSearchOrderPhone,
  loadCustomerData,
  setPreviewOrder,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Phone Banner above orders */}
      <div
        className="p-3 rounded-lg"
        style={{
          background:
            "color-mix(in srgb, var(--color-primary) 7%, var(--color-card, #ffffff))",
          border:
            "1px solid color-mix(in srgb, var(--color-primary) 18%, transparent)",
        }}
      >
        <h4
          className="text-xs font-semibold uppercase mb-2"
          style={mutedHeadingStyle}
        >
          رقم الهاتف
        </h4>
        <div className="flex items-center gap-2 text-sm">
          <Phone
            size={15}
            className="shrink-0"
            style={{ color: "var(--color-primary)" }}
          />
          {editingPhone ? (
            <input
              autoFocus
              type="tel"
              dir="ltr"
              value={phoneDraft}
              onChange={(e) => setPhoneDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSavePhone();
                if (e.key === "Escape") {
                  setEditingPhone(false);
                  setPhoneUpdateMessage(null);
                }
              }}
              className="business-chat-input flex-1 min-w-0 px-2 py-1 text-sm font-medium font-mono"
              placeholder="01xxxxxxxxx"
              disabled={savingPhone}
            />
          ) : customer?.phone ? (
            <span
              className="flex-1 min-w-0 truncate font-mono font-medium"
              style={{ color: "var(--color-primary)" }}
              dir="ltr"
            >
              {customer.phone}
            </span>
          ) : (
            <span
              className="flex-1 min-w-0 text-xs"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              لم يتم إضافة رقم هاتف بعد
            </span>
          )}
          {editingPhone ? (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleSavePhone}
                disabled={savingPhone}
                className="business-chip-button flex h-8 w-8 items-center justify-center rounded-lg transition-all disabled:opacity-50"
                style={{
                  color: "#ffffff",
                  background: "var(--business-success)",
                  borderColor: "transparent",
                  boxShadow:
                    "0 10px 20px -12px color-mix(in srgb, var(--business-success) 70%, transparent)",
                }}
                title="حفظ رقم الهاتف"
                aria-label="حفظ رقم الهاتف"
              >
                {savingPhone ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-b-transparent"></div>
                ) : (
                  <Check size={20} strokeWidth={3} />
                )}
              </button>
              <button
                onClick={() => {
                  setEditingPhone(false);
                  setPhoneUpdateMessage(null);
                }}
                disabled={savingPhone}
                className="business-chip-button flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:opacity-50"
                style={{
                  color: "var(--business-danger)",
                  background:
                    "color-mix(in srgb, var(--business-danger) 12%, var(--color-card, #ffffff))",
                  borderColor:
                    "color-mix(in srgb, var(--business-danger) 30%, transparent)",
                }}
                title="إلغاء"
                aria-label="إلغاء"
              >
                <X size={18} />
              </button>
            </div>
          ) : customer?.phone ? (
            <button
              onClick={handleStartEditPhone}
              className="business-chip-button flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors"
              style={{
                color: "var(--color-primary)",
                background:
                  "color-mix(in srgb, var(--color-primary) 12%, var(--color-card, #ffffff))",
                borderColor:
                  "color-mix(in srgb, var(--color-primary) 30%, transparent)",
              }}
              title="تعديل رقم الهاتف"
              aria-label="تعديل رقم الهاتف"
            >
              <SquarePen size={16} />
            </button>
          ) : null}
        </div>
        {!customer?.phone && !editingPhone && (
          <button
            onClick={handleStartEditPhone}
            className="business-chip-button mt-2 w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold transition-all"
            style={{
              color: "#ffffff",
              background:
                "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
              border: "none",
              boxShadow:
                "0 18px 34px -22px color-mix(in srgb, var(--color-primary) 65%, transparent)",
            }}
            title="إضافة رقم الهاتف"
            aria-label="إضافة رقم الهاتف"
          >
            <Plus size={16} />
            إضافة رقم الهاتف
          </button>
        )}
        {phoneUpdateMessage && (
          <p
            className="text-xs mt-2"
            style={{
              color: phoneUpdateMessage.includes("✅")
                ? "var(--business-success)"
                : "var(--business-danger)",
            }}
          >
            {phoneUpdateMessage}
          </p>
        )}
      </div>

      {/* Orders Summary Header & Quick Phone Search */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            placeholder="بحث برقم هاتف عن طلبات سابقة..."
            className="business-control-input flex-1 text-xs py-1.5 font-mono"
            dir="ltr"
            value={searchOrderPhone}
            onChange={(e) => setSearchOrderPhone(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchOrderPhone.trim()) {
                loadCustomerData(customer?.id || "", {
                  conversationId: conversation?.id,
                  phone: searchOrderPhone.trim(),
                });
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              if (searchOrderPhone.trim()) {
                loadCustomerData(customer?.id || "", {
                  conversationId: conversation?.id,
                  phone: searchOrderPhone.trim(),
                });
              }
            }}
            className="business-chip-button px-3 py-1.5 text-xs font-medium"
          >
            بحث
          </button>
          {searchOrderPhone && (
            <button
              type="button"
              onClick={() => {
                setSearchOrderPhone("");
                loadCustomerData(conversation?.customerId || "", {
                  conversationId: conversation?.id,
                  phone:
                    conversation?.customerPhone ||
                    customer?.phone ||
                    undefined,
                });
              }}
              className="business-chip-button px-2 py-1.5 text-xs"
              title="إعادة تعيين"
            >
              إلغاء
            </button>
          )}
        </div>

        {/* Customer Information Card (from phone lookup) */}
        {(customer?.name ||
          customer?.address ||
          customer?.governorate ||
          customer?.city ||
          customer?.customerRating) && (
          <div
            className="p-3 rounded-lg text-xs space-y-1.5 border"
            style={{
              background: "var(--business-surface-subtle)",
              borderColor: "var(--business-card-border)",
            }}
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div
                className="flex items-center gap-1.5 font-bold text-sm"
                style={{ color: "var(--color-foreground)" }}
              >
                <User size={15} className="text-primary shrink-0" />
                <span>{customer.name || conversation.customerName}</span>
              </div>
              {customer.customerRating && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  <Star size={11} className="text-amber-500 fill-amber-500" />
                  {customer.customerRating}
                </span>
              )}
            </div>

            {(customer.governorate ||
              customer.city ||
              customer.address) && (
              <div className="flex items-start gap-1.5 text-muted-foreground">
                <MapPin size={13} className="text-primary shrink-0 mt-0.5" />
                <span className="leading-snug">
                  {[customer.governorate, customer.city, customer.address]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </div>
            )}

            {customer.notes && (
              <div className="flex items-start gap-1.5 text-muted-foreground">
                <FileText size={13} className="text-amber-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{customer.notes}</span>
              </div>
            )}
          </div>
        )}

        {orders.length > 0 && (
          <div
            className="p-3 rounded-lg"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 10%, var(--color-card, #ffffff)) 0%, color-mix(in srgb, var(--color-secondary) 8%, var(--color-card, #ffffff)) 100%)",
              border:
                "1px solid color-mix(in srgb, var(--color-primary) 18%, transparent)",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag
                  size={18}
                  style={{ color: "var(--color-primary)" }}
                />
                <span
                  className="font-semibold text-sm"
                  style={{ color: "var(--color-primary)" }}
                >
                  سجل الطلبات
                </span>
              </div>
              <span
                className="text-white text-xs font-bold font-mono tabular-nums px-2 py-0.5 rounded-full"
                style={{ background: "var(--color-primary)" }}
              >
                {orders.length} طلب
              </span>
            </div>
          </div>
        )}
      </div>

      {orders.length === 0 ? (
        <div
          className="text-center py-8"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          <ShoppingBag size={44} className="mx-auto mb-2 opacity-20" />
          <p className="text-sm">لا توجد طلبات سابقة لهذا الرقم</p>
        </div>
      ) : (
        orders.map((order) => {
          const isFromThisConv = Boolean(
            order.conversationId &&
              conversation?.id &&
              String(order.conversationId) === String(conversation.id),
          );

          return (
            <div
              key={order.id}
              className="p-3 rounded-lg transition-colors space-y-2.5"
              style={sectionSurfaceStyle}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p
                      className="font-bold text-sm font-mono"
                      style={{ color: "var(--color-foreground)" }}
                    >
                      #{order.orderNumber}
                    </p>
                    {isFromThisConv && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        💬 من هذه المحادثة
                      </span>
                    )}
                  </div>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    {format(
                      new Date(order.createdAt),
                      "dd MMM yyyy - HH:mm",
                      {
                        locale: arSA,
                      },
                    )}
                  </p>
                </div>
                <span
                  className="px-2 py-0.5 text-xs rounded-full shrink-0 font-medium"
                  style={getOrderStatusTheme(order.status)}
                >
                  {(() => {
                    const info = getStatusDisplay(order.status);
                    return t(info.labelKey) || info.label;
                  })()}
                </span>
              </div>

              {/* Order Items Breakdown */}
              {order.items && order.items.length > 0 && (
                <div
                  className="pt-2 space-y-1.5"
                  style={{
                    borderTop: "1px dashed var(--business-muted-line)",
                  }}
                >
                  {order.items.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-xs gap-2"
                    >
                      <span
                        className="truncate font-medium flex-1 text-right"
                        style={{ color: "var(--color-foreground)" }}
                      >
                        {item.quantity}× {item.productName || item.name}
                        {(item.productColor || item.productSize) && (
                          <span className="text-[11px] opacity-75 mr-1 font-normal">
                            (
                            {[item.productColor, item.productSize]
                              .filter(Boolean)
                              .join(" - ")}
                            )
                          </span>
                        )}
                      </span>
                      <span
                        className="font-mono tabular-nums shrink-0 text-left font-medium"
                        style={{ color: "var(--color-foreground)" }}
                      >
                        {(item.price * item.quantity).toLocaleString()} ج.م
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div
                className="flex justify-between items-center pt-2"
                style={{
                  borderTop: "1px solid var(--business-muted-line)",
                }}
              >
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  الإجمالي:
                </span>
                <span
                  className="font-bold text-sm font-mono tabular-nums"
                  style={{ color: "var(--color-primary)" }}
                >
                  {order.total?.toLocaleString() || 0} ج.م
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPreviewOrder(order)}
                  className="business-chip-button flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    color: "var(--color-primary)",
                    background:
                      "color-mix(in srgb, var(--color-primary) 8%, var(--color-card, #ffffff))",
                  }}
                >
                  معاينة سريعة
                </button>
                <a
                  href={`/orders/${order.orderNumber || order.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="business-chip-button flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    borderColor: "var(--business-card-border)",
                    color: "var(--business-text-primary)",
                  }}
                >
                  <ExternalLink size={12} />
                  صفحة الطلب
                </a>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
