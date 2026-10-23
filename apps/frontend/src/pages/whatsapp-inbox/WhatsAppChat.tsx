import React from 'react';
import type { WhatsAppChatProps } from './chat/types';
import {
  useWhatsAppChatController,
  WhatsAppChatHeader,
  WhatsAppChatMessageStream,
  WhatsAppChatComposer,
  WhatsAppChatDetailsSidebar,
  WhatsAppChatModals,
} from './chat';

const WhatsAppChat: React.FC<WhatsAppChatProps> = (props) => {
  const {
    conversation,
    loading,
    saving,
    draft,
    setDraft,
    noteDraft,
    setNoteDraft,
    transferTarget,
    setTransferTarget,
    tagInput,
    setTagInput,
    selectedMentionIds,
    toggleMention,
    editingMessageId,
    setEditingMessageId,
    correctionText,
    setCorrectionText,
    showDetailsPanel,
    setShowDetailsPanel,
    showOrderModal,
    setShowOrderModal,
    showServiceOrderModal,
    setShowServiceOrderModal,
    showQuickCreateTaskModal,
    setShowQuickCreateTaskModal,
    showProductPicker,
    setShowProductPicker,
    showImageGallery,
    setShowImageGallery,
    customerOrders,
    loadingOrders,
    messagesEndRef,
    copy,
    canTransfer,
    navigateToInbox,
    sendMessage,
    sendSms,
    sendProductImages,
    handleSelectImageFromGallery,
    handleSelectMultipleImagesFromGallery,
    submitCorrection,
    addNote,
    addTag,
    removeTag,
    updateStatus,
    transferConversation,
    loadConversation,
  } = useWhatsAppChatController(props);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div className="text-sm font-medium text-muted-foreground">
          {copy.chat.notAvailable}
        </div>
        <button
          type="button"
          onClick={navigateToInbox}
          className="mt-3 inline-flex items-center rounded-lg border border-border/50 bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted"
        >
          {copy.chat.back}
        </button>
      </div>
    );
  }

  const translateStatus = (st?: string) => {
    const key = String(st || '').toUpperCase();
    return (copy.chat.status as Record<string, string>)?.[key] || key;
  };

  return (
    <div
      dir={copy.isArabic ? 'rtl' : 'ltr'}
      className="grid h-[calc(100dvh-64px)] min-h-0 gap-0 xl:grid-cols-[1fr,360px] overflow-hidden bg-background"
    >
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden border-r border-border/50 bg-background rtl:border-r-0 rtl:border-l">
        <WhatsAppChatHeader
          conversation={conversation}
          language={copy.locale}
          onBack={navigateToInbox}
          onOpenOrderModal={() => setShowOrderModal(true)}
          onOpenServiceOrderModal={() => setShowServiceOrderModal(true)}
          onOpenTaskModal={() => setShowQuickCreateTaskModal(true)}
          onToggleDetails={() => setShowDetailsPanel((prev) => !prev)}
          showDetailsPanel={showDetailsPanel}
          backLabel={copy.chat.back}
          chatLabel={copy.chat.chatLabel}
        />

        <WhatsAppChatMessageStream
          messages={conversation.messages}
          editingMessageId={editingMessageId}
          correctionText={correctionText}
          onStartCorrection={(id, content) => {
            setEditingMessageId(id);
            setCorrectionText(content);
          }}
          onCancelCorrection={() => {
            setEditingMessageId(null);
            setCorrectionText('');
          }}
          onCorrectionTextChange={setCorrectionText}
          onSubmitCorrection={submitCorrection}
          messagesEndRef={messagesEndRef}
          locale={copy.locale}
          mediaHintCopy={copy.chat.mediaHint as Record<string, string>}
        />

        <WhatsAppChatComposer
          draft={draft}
          onDraftChange={setDraft}
          onSendMessage={sendMessage}
          onSendSms={sendSms}
          onOpenProductPicker={() => setShowProductPicker(true)}
          onOpenImageGallery={() => setShowImageGallery(true)}
          saving={saving}
          placeholder={copy.chat.replyPlaceholder}
          sendLabel={copy.chat.sendReply}
        />
      </main>

      <WhatsAppChatDetailsSidebar
        conversation={conversation}
        customerOrders={customerOrders}
        loadingOrders={loadingOrders}
        tagInput={tagInput}
        onTagInputChange={setTagInput}
        onAddTag={addTag}
        onRemoveTag={removeTag}
        noteDraft={noteDraft}
        onNoteDraftChange={setNoteDraft}
        onAddNote={addNote}
        selectedMentionIds={selectedMentionIds}
        onToggleMention={toggleMention}
        transferTarget={transferTarget}
        onTransferTargetChange={setTransferTarget}
        onTransferConversation={transferConversation}
        onUpdateStatus={updateStatus}
        canTransfer={canTransfer}
        saving={saving}
        showDetailsPanel={showDetailsPanel}
        onCloseDetailsPanel={() => setShowDetailsPanel(false)}
        translateStatus={translateStatus}
      />

      <WhatsAppChatModals
        conversation={conversation}
        showOrderModal={showOrderModal}
        onCloseOrderModal={() => setShowOrderModal(false)}
        showServiceOrderModal={showServiceOrderModal}
        onCloseServiceOrderModal={() => setShowServiceOrderModal(false)}
        showQuickCreateTaskModal={showQuickCreateTaskModal}
        onCloseTaskModal={() => setShowQuickCreateTaskModal(false)}
        showProductPicker={showProductPicker}
        onCloseProductPicker={() => setShowProductPicker(false)}
        onSendProductImages={sendProductImages}
        showImageGallery={showImageGallery}
        onCloseImageGallery={() => setShowImageGallery(false)}
        onSelectImageFromGallery={handleSelectImageFromGallery}
        onSelectMultipleImagesFromGallery={handleSelectMultipleImagesFromGallery}
        onReloadOrders={() => loadConversation()}
      />
    </div>
  );
};

export default WhatsAppChat;
