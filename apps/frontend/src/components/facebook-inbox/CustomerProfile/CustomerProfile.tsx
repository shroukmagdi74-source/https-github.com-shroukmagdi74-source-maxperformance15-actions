import React, { useEffect, useState } from "react";
import { User, ShoppingBag, Activity } from "lucide-react";
import { useCustomerProfile } from "../../../hooks/inbox/useCustomerProfile";
import {
  ConversationStatus,
  InboxConversation,
} from "../../../types/inbox.types";
import { apiClient } from "../../../services/apiClient";
import EnhancedOrderModal from "../../orders/EnhancedOrderModal";

import {
  CustomerProfileProps,
  Tab,
  ApiErrorLike,
  CustomerProfileHeader,
  CustomerInfoTab,
  CustomerOrdersTab,
  CustomerTimelineTab,
  BlockCustomerModal,
} from "./customer-profile";

export const CustomerProfile: React.FC<CustomerProfileProps> = ({
  conversation,
  className,
  onTagsChange,
  updatingTags,
  currentStatus,
  onStatusChange,
  currentAssignee,
  currentAssigneeName,
  onAssign,
  disabled = false,
  isBlocked = false,
  checkingBlockStatus = false,
  blocking = false,
  showBlockModal = false,
  blockReason = "",
  onBlockClick,
  onUnblockClick,
  onBlockReasonChange,
  onBlockConfirm,
  onBlockCancel,
  soundEnabled = true,
  notificationsEnabled = true,
  onSoundToggle,
  onNotificationsToggle,
  onCreateOrder,
  compactHeader = false,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>("timeline");
  const [syncingMessages, setSyncingMessages] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneDraft, setPhoneDraft] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneUpdateMessage, setPhoneUpdateMessage] = useState<string | null>(null);
  const [previewOrder, setPreviewOrder] = useState<any | null>(null);
  const [searchOrderPhone, setSearchOrderPhone] = useState("");

  const {
    orders,
    activities,
    loading,
    loadCustomerData,
    prependOrder,
    updateCustomerPhone,
    calculateLTV,
    customer,
  } = useCustomerProfile();

  const handleStartEditPhone = () => {
    setPhoneDraft(customer?.phone || "");
    setEditingPhone(true);
    setPhoneUpdateMessage(null);
  };

  const handleSavePhone = async () => {
    const phone = phoneDraft.trim();
    if (!phone) {
      setPhoneUpdateMessage("❌ يرجى إدخال رقم الهاتف");
      return;
    }
    setSavingPhone(true);
    setPhoneUpdateMessage(null);
    const result = await updateCustomerPhone(phone);
    setSavingPhone(false);
    if (result.success) {
      setEditingPhone(false);
      setPhoneUpdateMessage(`✅ ${result.message}`);
      setTimeout(() => setPhoneUpdateMessage(null), 4000);
      loadCustomerData(customer?.id || conversation?.customerId || "", {
        conversationId: conversation?.id,
        phone,
      });
    } else {
      setPhoneUpdateMessage(`❌ ${result.message}`);
      setTimeout(() => setPhoneUpdateMessage(null), 5000);
    }
  };

  useEffect(() => {
    loadCustomerData(conversation?.customerId || "", {
      conversationId: conversation?.id,
      phone: conversation?.customerPhone || customer?.phone || undefined,
    });
  }, [
    conversation?.customerId,
    conversation?.id,
    conversation?.customerPhone,
    loadCustomerData,
  ]);

  useEffect(() => {
    const handleInboxOrderCreated = (event: Event) => {
      const customEvent = event as CustomEvent<{
        order: any;
        orderId: string;
        orderNumber?: string;
        conversationId?: string;
      }>;
      const detail = customEvent.detail;
      if (!detail) return;

      const isCurrentConv =
        detail.conversationId &&
        conversation?.id &&
        detail.conversationId === conversation.id;
      const isCurrentCustomer =
        detail.order?.customerId &&
        conversation?.customerId &&
        detail.order.customerId === conversation.customerId;
      const isCurrentPhone =
        detail.order?.customerPhone &&
        (conversation?.customerPhone || customer?.phone) &&
        (detail.order.customerPhone === conversation?.customerPhone ||
          detail.order.customerPhone === customer?.phone);

      if (isCurrentConv || isCurrentCustomer || isCurrentPhone) {
        if (detail.order) {
          const rawOrder = detail.order;
          prependOrder({
            id: String(rawOrder.id || detail.orderId),
            orderNumber: String(
              rawOrder.orderNumber || detail.orderNumber || rawOrder.id,
            ),
            status: String(rawOrder.status || "CONFIRMED"),
            total: Number(rawOrder.totalAmount || rawOrder.total || 0),
            createdAt: rawOrder.createdAt || new Date().toISOString(),
            conversationId:
              rawOrder.conversationId || detail.conversationId || conversation?.id,
            items: Array.isArray(
              rawOrder.orderItems || rawOrder.products || rawOrder.items,
            )
              ? (rawOrder.orderItems || rawOrder.products || rawOrder.items).map(
                  (item: any) => ({
                    name: item.productName || item.name || "منتج",
                    productName: item.productName || item.name || "منتج",
                    quantity: Number(item.quantity || 1),
                    price: Number(item.price || 0),
                    image: item.productImage || item.image || null,
                    productColor: item.productColor || item.color || null,
                    productSize: item.productSize || item.size || null,
                  }),
                )
              : [],
          });
        }

        loadCustomerData(conversation?.customerId || "", {
          conversationId: conversation?.id,
          phone: conversation?.customerPhone || customer?.phone || undefined,
        });
      }
    };

    window.addEventListener("inbox:order-created", handleInboxOrderCreated);
    return () => {
      window.removeEventListener("inbox:order-created", handleInboxOrderCreated);
    };
  }, [
    conversation?.id,
    conversation?.customerId,
    conversation?.customerPhone,
    customer?.phone,
    loadCustomerData,
    prependOrder,
  ]);

  const handleSyncMessages = async () => {
    if (!conversation?.id || conversation.platform !== "facebook") {
      return;
    }

    setSyncingMessages(true);
    setSyncMessage(null);

    try {
      const response = await apiClient.post(
        `/conversations/${conversation.id}/sync-messages`,
        {},
        { timeout: 90000 },
      );

      if (response.data.success) {
        setSyncMessage(`✅ ${response.data.message || "تم جلب الرسائل بنجاح"}`);
        if (conversation.customerId) {
          loadCustomerData(conversation.customerId);
        }
      } else {
        setSyncMessage(`❌ ${response.data.message || "فشل في جلب الرسائل"}`);
      }
    } catch (error: unknown) {
      const apiError = error as ApiErrorLike;
      console.error("Error syncing messages:", error);
      const errorMessage =
        apiError.response?.data?.message ||
        apiError.response?.data?.error ||
        apiError.message ||
        "حدث خطأ أثناء جلب الرسائل";
      const errorInfo = apiError.response?.data?.info
        ? ` (${apiError.response.data.info})`
        : "";
      setSyncMessage(`❌ ${errorMessage}${errorInfo}`);
    } finally {
      setSyncingMessages(false);
      setTimeout(() => {
        setSyncMessage(null);
      }, 5000);
    }
  };

  const ltv = calculateLTV();
  const effectiveStatus: ConversationStatus =
    currentStatus === "open" ||
    currentStatus === "pending" ||
    currentStatus === "resolved" ||
    currentStatus === "done"
      ? currentStatus
      : conversation.status;

  return (
    <div
      className={[
        "business-inbox-column business-inbox-column--profile h-full",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <CustomerProfileHeader
        conversation={conversation}
        compactHeader={compactHeader}
        ordersCount={orders.length}
        ltv={ltv}
        effectiveStatus={effectiveStatus}
        currentAssignee={currentAssignee}
        currentAssigneeName={currentAssigneeName}
        onStatusChange={onStatusChange}
        onAssign={onAssign}
        disabled={disabled}
        soundEnabled={soundEnabled}
        notificationsEnabled={notificationsEnabled}
        onSoundToggle={onSoundToggle}
        onNotificationsToggle={onNotificationsToggle}
        onCreateOrder={onCreateOrder}
        checkingBlockStatus={checkingBlockStatus}
        isBlocked={isBlocked}
        blocking={blocking}
        onBlockClick={onBlockClick}
        onUnblockClick={onUnblockClick}
      />

      {/* Tabs */}
      <div className="business-inbox-tabs mx-2 my-1">
        <button
          type="button"
          onClick={() => setActiveTab("timeline")}
          className="business-inbox-tab"
          data-active={activeTab === "timeline" ? "true" : "false"}
        >
          <span className="flex items-center justify-center gap-1">
            <Activity size={14} /> نشاط
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className="business-inbox-tab"
          data-active={activeTab === "orders" ? "true" : "false"}
        >
          <span className="flex items-center justify-center gap-1">
            <ShoppingBag size={14} /> طلبات
            {orders.length > 0 && (
              <span className="business-inbox-tab-count tabular-nums">{orders.length}</span>
            )}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("info")}
          className="business-inbox-tab"
          data-active={activeTab === "info" ? "true" : "false"}
        >
          <span className="flex items-center justify-center gap-1">
            <User size={14} /> معلومات
          </span>
        </button>
      </div>

      {/* Content area */}
      <div className="business-chat-stage flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex justify-center p-6">
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2"
              style={{ borderColor: "var(--color-primary)" }}
            />
          </div>
        ) : (
          <>
            {activeTab === "info" && (
              <CustomerInfoTab
                customer={customer}
                conversation={conversation}
                editingPhone={editingPhone}
                phoneDraft={phoneDraft}
                setPhoneDraft={setPhoneDraft}
                savingPhone={savingPhone}
                phoneUpdateMessage={phoneUpdateMessage}
                handleStartEditPhone={handleStartEditPhone}
                handleSavePhone={handleSavePhone}
                setEditingPhone={setEditingPhone}
                setPhoneUpdateMessage={setPhoneUpdateMessage}
                onTagsChange={onTagsChange}
                updatingTags={updatingTags}
              />
            )}

            {activeTab === "orders" && (
              <CustomerOrdersTab
                orders={orders}
                customer={customer}
                conversation={conversation}
                editingPhone={editingPhone}
                phoneDraft={phoneDraft}
                setPhoneDraft={setPhoneDraft}
                savingPhone={savingPhone}
                phoneUpdateMessage={phoneUpdateMessage}
                handleStartEditPhone={handleStartEditPhone}
                handleSavePhone={handleSavePhone}
                setEditingPhone={setEditingPhone}
                setPhoneUpdateMessage={setPhoneUpdateMessage}
                searchOrderPhone={searchOrderPhone}
                setSearchOrderPhone={setSearchOrderPhone}
                loadCustomerData={loadCustomerData}
                setPreviewOrder={setPreviewOrder}
              />
            )}

            {activeTab === "timeline" && (
              <CustomerTimelineTab
                conversation={conversation}
                activities={activities}
                syncMessage={syncMessage}
                syncingMessages={syncingMessages}
                onSyncMessages={handleSyncMessages}
              />
            )}
          </>
        )}
      </div>

      {/* Block Customer Modal */}
      {showBlockModal && onBlockConfirm && onBlockCancel && (
        <BlockCustomerModal
          isOpen={showBlockModal}
          blockReason={blockReason}
          blocking={blocking}
          onBlockReasonChange={onBlockReasonChange || (() => {})}
          onBlockConfirm={onBlockConfirm}
          onBlockCancel={onBlockCancel}
        />
      )}

      {/* Order Preview Modal */}
      {previewOrder && (
        <EnhancedOrderModal
          order={previewOrder}
          isOpen={Boolean(previewOrder)}
          onClose={() => setPreviewOrder(null)}
        />
      )}
    </div>
  );
};

export default CustomerProfile;
