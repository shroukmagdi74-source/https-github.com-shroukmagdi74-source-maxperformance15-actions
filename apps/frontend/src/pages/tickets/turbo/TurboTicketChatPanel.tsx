import React from "react";
import { useAuth } from "../../../hooks/useAuthSimple";
import {
  type TurboTicketChatPanelProps,
  useTicketChat,
  TurboTicketChatHeader,
  TurboTicketInitialCard,
  TurboTicketMessageBubble,
  TurboTicketInputBar,
  TurboTicketOrderSidebar,
  TurboTicketEmptyState,
  TurboTicketImageLightbox,
  TurboTicketDragOverlay,
} from "./chat-panel";

export type { TurboTicketChatPanelProps };

export const TurboTicketChatPanel: React.FC<TurboTicketChatPanelProps> = ({
  ticket,
  loading,
  onRefreshTicket,
  onBackToList,
  onOpenLogs,
}) => {
  const { user } = useAuth();

  const {
    replyText,
    setReplyText,
    replyImage,
    setReplyImage,
    replyImagePreview,
    isDragging,
    sending,
    ratingScore,
    submittingRating,
    copiedCode,
    previewImage,
    setPreviewImage,
    showOrderSidebar,
    setShowOrderSidebar,
    orderSearchQuery,
    setOrderSearchQuery,
    searchingOrder,
    activeOrder,
    messagesEndRef,
    uniqueMessages,
    handlePaste,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleCopyCode,
    handleRate,
    handleSendReply,
    handleSearchOrder,
    isMessageFromStore,
    formatSenderName,
  } = useTicketChat({ ticket, onRefreshTicket, user });

  if (!ticket) {
    return <TurboTicketEmptyState />;
  }

  return (
    <main className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-zinc-50/50 dark:bg-zinc-950/40 min-w-0 relative">
      <TurboTicketChatHeader
        ticket={ticket}
        loading={loading}
        copiedCode={copiedCode}
        showOrderSidebar={showOrderSidebar}
        ratingScore={ratingScore}
        submittingRating={submittingRating}
        activeOrder={activeOrder}
        onBackToList={onBackToList}
        onCopyCode={handleCopyCode}
        onToggleOrderSidebar={() => setShowOrderSidebar((prev) => !prev)}
        onRate={handleRate}
        onOpenLogs={onOpenLogs}
        onRefreshTicket={onRefreshTicket}
      />

      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        <div
          className="flex-1 flex flex-col h-full min-h-0 min-w-0 overflow-hidden relative"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <TurboTicketDragOverlay isDragging={isDragging} />

          <div
            className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-3.5 min-h-0 touch-pan-y"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <TurboTicketInitialCard
              ticket={ticket}
              user={user}
              onPreviewImage={setPreviewImage}
            />

            {uniqueMessages.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-400">
                لا توجد ردود بعد. سيتم عرض ردود خدمة عملاء تربو هنا فور وصولها.
              </div>
            ) : (
              uniqueMessages.map((msg, idx) => {
                const isStore = isMessageFromStore(msg);
                const senderTitle = formatSenderName(msg);
                const roleName = isStore
                  ? user?.company?.name?.trim() || "المتجر"
                  : "تربو";

                return (
                  <TurboTicketMessageBubble
                    key={msg.id || idx}
                    message={msg}
                    isStore={isStore}
                    senderTitle={senderTitle}
                    roleName={roleName}
                    onPreviewImage={setPreviewImage}
                  />
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <TurboTicketInputBar
            replyText={replyText}
            setReplyText={setReplyText}
            replyImage={replyImage}
            setReplyImage={setReplyImage}
            replyImagePreview={replyImagePreview}
            sending={sending}
            onSendReply={handleSendReply}
            onPaste={handlePaste}
            onPreviewImage={setPreviewImage}
          />
        </div>

        <TurboTicketOrderSidebar
          activeOrder={activeOrder}
          showOrderSidebar={showOrderSidebar}
          onClose={() => setShowOrderSidebar(false)}
          orderSearchQuery={orderSearchQuery}
          setOrderSearchQuery={setOrderSearchQuery}
          searchingOrder={searchingOrder}
          onSearchOrder={handleSearchOrder}
          onCopyCode={handleCopyCode}
        />
      </div>

      <TurboTicketImageLightbox
        imageUrl={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </main>
  );
};
