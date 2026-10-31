import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  ShoppingBag,
} from "lucide-react";
import { NoSymbolIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import {
  ConversationStatus,
  InboxConversation,
} from "../../../../types/inbox.types";
import { getInboxCustomerAvatarUrl } from "../../../../utils/imageUrl";
import StatusDropdown from "../../StatusDropdown/StatusDropdown";
import AssignmentDropdown from "../../AssignmentDropdown/AssignmentDropdown";
import { mutedHeadingStyle } from "./styles";

interface CustomerProfileHeaderProps {
  conversation: InboxConversation;
  compactHeader?: boolean;
  ordersCount: number;
  ltv: number;
  effectiveStatus: ConversationStatus;
  currentAssignee?: string | null;
  currentAssigneeName?: string | null;
  onStatusChange?: (status: string) => void;
  onAssign?: (userId: string | null) => void;
  disabled?: boolean;
  soundEnabled?: boolean;
  notificationsEnabled?: boolean;
  onSoundToggle?: () => void;
  onNotificationsToggle?: () => void;
  onCreateOrder?: () => void;
  checkingBlockStatus?: boolean;
  isBlocked?: boolean;
  blocking?: boolean;
  onBlockClick?: () => void;
  onUnblockClick?: () => void;
}

export const CustomerProfileHeader: React.FC<CustomerProfileHeaderProps> = ({
  conversation,
  compactHeader = false,
  ordersCount,
  ltv,
  effectiveStatus,
  currentAssignee,
  currentAssigneeName,
  onStatusChange,
  onAssign,
  disabled = false,
  soundEnabled = true,
  notificationsEnabled = true,
  onSoundToggle,
  onNotificationsToggle,
  onCreateOrder,
  checkingBlockStatus = false,
  isBlocked = false,
  blocking = false,
  onBlockClick,
  onUnblockClick,
}) => {
  const [isMobileViewport, setIsMobileViewport] = useState(
    () => (typeof window !== "undefined" ? window.innerWidth < 768 : false),
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => setIsMobileViewport(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const customerAvatarUrl = getInboxCustomerAvatarUrl(
    conversation.customerId,
    conversation.customerAvatar,
  );

  const statsSummary = (
    <div
      className={[
        "grid grid-cols-2 overflow-hidden rounded-lg text-center",
        compactHeader ? "w-full" : "shrink-0",
      ].join(" ")}
      style={{
        border: "1px solid var(--business-card-border)",
        background: "var(--business-surface-subtle)",
      }}
    >
      <div className="min-w-[46px] px-2 py-1">
        <p className="text-[10px] leading-4" style={mutedHeadingStyle}>
          الطلبات
        </p>
        <p
          className="text-sm font-semibold font-mono tabular-nums leading-5"
          style={{ color: "var(--color-foreground)" }}
        >
          {ordersCount}
        </p>
      </div>
      <div
        className="min-w-[58px] px-2 py-1"
        style={{ borderRight: "1px solid var(--business-muted-line)" }}
      >
        <p className="text-[10px] leading-4" style={mutedHeadingStyle}>
          القيمة
        </p>
        <p
          className="text-sm font-semibold font-mono tabular-nums leading-5"
          style={{ color: "var(--business-success)" }}
        >
          {ltv.toLocaleString()} ج.م
        </p>
      </div>
    </div>
  );

  const useCompactActions = compactHeader || isMobileViewport;
  const compactActionClassName =
    "business-chip-button flex h-8 w-8 shrink-0 items-center justify-center rounded-xl p-0 text-xs font-medium transition-colors";
  const expandedActionClassName =
    "business-chip-button flex h-8 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl px-2 text-xs font-medium transition-colors";
  const actionLabelClassName = useCompactActions ? "sr-only" : "truncate";

  return (
    <div
      className="business-inbox-header px-3 py-2.5 text-right"
      style={{ borderBottom: "1px solid var(--business-muted-line)" }}
    >
      {compactHeader ? (
        statsSummary
      ) : (
        <div className="flex items-center gap-2.5">
          {customerAvatarUrl ? (
            <img
              src={customerAvatarUrl}
              alt={conversation.customerName}
              className="h-12 w-12 shrink-0 rounded-full object-cover shadow-sm"
              style={{ border: "1px solid var(--business-card-border)" }}
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = "none";
                const fallback = e.currentTarget.nextElementSibling;
                if (fallback) (fallback as HTMLElement).style.display = "flex";
              }}
            />
          ) : null}
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white shadow-sm"
            style={{
              display: customerAvatarUrl ? "none" : "flex",
              background:
                "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
            }}
          >
            {conversation.customerName?.charAt(0)?.toUpperCase() || "؟"}
          </div>

          <div className="min-w-0 flex-1">
            <h3
              className="truncate text-sm font-bold leading-5"
              style={{ color: "var(--color-foreground)" }}
            >
              {conversation.customerName}
            </h3>
            <div
              className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]"
              style={mutedHeadingStyle}
            >
              <span>عميل منذ {format(new Date(), "yyyy")}</span>
              {conversation.platform === "facebook" && (
                <span className="truncate font-medium">
                  {conversation.pageName || "Facebook"}
                </span>
              )}
            </div>
          </div>

          {statsSummary}
        </div>
      )}

      {/* Status & Assignment - compact controls */}
      {(onStatusChange || onAssign) && (
        <div
          className="mt-2 grid gap-1.5"
          style={{
            gridTemplateColumns:
              onStatusChange && onAssign
                ? "minmax(0, 1fr) minmax(0, 1fr)"
                : "minmax(0, 1fr)",
          }}
        >
          {onStatusChange && (
            <div className="min-w-0 [&>div>button]:w-full [&>div>button]:justify-between [&>div>button]:overflow-hidden [&>div>button]:rounded-xl [&>div>button]:px-2 [&>div>button]:py-1 [&>div>button]:text-xs [&>div>button_span]:truncate">
              <StatusDropdown
                currentStatus={effectiveStatus}
                onStatusChange={onStatusChange}
                disabled={disabled}
              />
            </div>
          )}
          {onAssign && (
            <div className="min-w-0 [&>div>button]:w-full [&>div>button]:justify-between [&>div>button]:overflow-hidden [&>div>button]:rounded-xl [&>div>button]:px-2 [&>div>button]:py-1 [&>div>button]:text-xs [&>div>button_span]:truncate">
              <AssignmentDropdown
                currentAssignee={currentAssignee ?? conversation.assignedTo}
                currentAssigneeName={
                  currentAssigneeName ?? conversation.assignedToName
                }
                onAssign={onAssign}
                disabled={disabled}
              />
            </div>
          )}
        </div>
      )}

      {(onSoundToggle ||
        onNotificationsToggle ||
        onCreateOrder ||
        (conversation.pageId && (onBlockClick || onUnblockClick))) && (
        <div className="mt-2 flex items-center gap-1.5">
          {onSoundToggle && (
            <button
              onClick={onSoundToggle}
              className="business-chip-button flex h-8 w-8 shrink-0 items-center justify-center rounded-xl p-0 transition-colors"
              style={
                soundEnabled
                  ? {
                      color: "var(--color-primary)",
                      background:
                        "color-mix(in srgb, var(--color-primary) 10%, var(--color-card, #ffffff))",
                    }
                  : undefined
              }
              title={soundEnabled ? "كتم الصوت" : "تفعيل الصوت"}
              aria-label={soundEnabled ? "كتم الصوت" : "تفعيل الصوت"}
            >
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
          )}

          {onNotificationsToggle && (
            <button
              onClick={onNotificationsToggle}
              className="business-chip-button flex h-8 w-8 shrink-0 items-center justify-center rounded-xl p-0 transition-colors"
              style={
                notificationsEnabled
                  ? {
                      color: "var(--color-primary)",
                      background:
                        "color-mix(in srgb, var(--color-primary) 10%, var(--color-card, #ffffff))",
                    }
                  : undefined
              }
              title={
                notificationsEnabled ? "كتم الإشعارات" : "تفعيل الإشعارات"
              }
              aria-label={
                notificationsEnabled ? "كتم الإشعارات" : "تفعيل الإشعارات"
              }
            >
              {notificationsEnabled ? (
                <Bell size={15} />
              ) : (
                <BellOff size={15} />
              )}
            </button>
          )}

          {onCreateOrder && (
            <button
              onClick={onCreateOrder}
              className={
                useCompactActions
                  ? compactActionClassName
                  : expandedActionClassName
              }
              style={{
                color: "var(--business-warning)",
                background:
                  "color-mix(in srgb, var(--business-warning) 10%, var(--color-card, #ffffff))",
                borderColor:
                  "color-mix(in srgb, var(--business-warning) 20%, transparent)",
              }}
              title="إنشاء طلب سريع لهذا العميل"
              aria-label="إنشاء طلب سريع لهذا العميل"
            >
              <ShoppingBag className="h-4 w-4 shrink-0" />
              <span className={actionLabelClassName}>طلب</span>
            </button>
          )}

          {conversation.pageId &&
            (onBlockClick || onUnblockClick) &&
            (checkingBlockStatus ? (
              <div
                className={[
                  "flex h-8 items-center justify-center rounded-xl",
                  useCompactActions ? "w-8 shrink-0" : "min-w-0 flex-1",
                ].join(" ")}
                style={{
                  border: "1px solid var(--business-card-border)",
                  background: "var(--business-surface-subtle)",
                }}
              >
                <div
                  className="h-4 w-4 animate-spin rounded-full border-b-2"
                  style={{ borderColor: "var(--color-muted-foreground)" }}
                ></div>
              </div>
            ) : isBlocked ? (
              <button
                onClick={onUnblockClick}
                disabled={blocking}
                className={`${useCompactActions ? compactActionClassName : expandedActionClassName} disabled:cursor-not-allowed disabled:opacity-50`}
                style={{
                  color: "var(--business-success)",
                  background:
                    "color-mix(in srgb, var(--business-success) 10%, var(--color-card, #ffffff))",
                  borderColor:
                    "color-mix(in srgb, var(--business-success) 20%, transparent)",
                }}
                title="إلغاء حظر العميل على الصفحة"
                aria-label="إلغاء حظر العميل على الصفحة"
              >
                <CheckCircleIcon className="h-4 w-4 shrink-0" />
                <span className={actionLabelClassName}>فتح</span>
              </button>
            ) : (
              <button
                onClick={onBlockClick}
                className={
                  useCompactActions
                    ? compactActionClassName
                    : expandedActionClassName
                }
                style={{
                  color: "var(--business-danger)",
                  background:
                    "color-mix(in srgb, var(--business-danger) 10%, var(--color-card, #ffffff))",
                  borderColor:
                    "color-mix(in srgb, var(--business-danger) 20%, transparent)",
                }}
                title="حظر العميل على الصفحة"
                aria-label="حظر العميل على الصفحة"
              >
                <NoSymbolIcon className="h-4 w-4 shrink-0" />
                <span className={actionLabelClassName}>حظر</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
};
