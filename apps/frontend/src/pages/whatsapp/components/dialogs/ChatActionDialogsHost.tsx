import React from 'react';
import { toast } from 'sonner';

import type { Contact } from '@/hooks/useWhatsAppQueries';
import { ChatPollDialog } from './ChatPollDialog';
import { ChatButtonsDialog } from './ChatButtonsDialog';
import { ChatListDialog } from './ChatListDialog';
import { ChatCatalogDialog } from './ChatCatalogDialog';
import { ChatLocationDialog } from './ChatLocationDialog';
import { ChatTemplateDialog } from './ChatTemplateDialog';
import { ChatStatusDialog } from './ChatStatusDialog';
import { ChatMessageContextMenu } from './ChatMessageContextMenu';
import { ChatForwardDialog } from './ChatForwardDialog';
import { ChatReactionPickerDialog } from './ChatReactionPickerDialog';
import { ContactInfoSheet } from './ContactInfoSheet';
import { ChatStarredMessagesSheet } from './ChatStarredMessagesSheet';
import { ChatModalsContainer } from './ChatModalsContainer';

import type { useWhatsAppChatData } from '../../hooks/useWhatsAppChatData';
import type { useWhatsAppChatDialogs } from '../../hooks/useWhatsAppChatDialogs';
import type { useWhatsAppChatActions } from '../../hooks/useWhatsAppChatActions';
import { getContactPhoneNumber } from '../../whatsappContactDisplay';

interface ChatActionDialogsHostProps {
  dialogs: ReturnType<typeof useWhatsAppChatDialogs>;
  chatData: ReturnType<typeof useWhatsAppChatData>;
  chatActions: ReturnType<typeof useWhatsAppChatActions>;
  selectedContactPhoneNumber: string | null;
  getContactName: (contact: Contact) => string;
  t: (key: string, options?: Record<string, unknown>) => string;
}

export const ChatActionDialogsHost: React.FC<ChatActionDialogsHostProps> = ({
  dialogs,
  chatData,
  chatActions,
  selectedContactPhoneNumber,
  getContactName,
  t,
}) => {
  return (
    <>
      <ChatMessageContextMenu
        position={chatActions.messageContextMenu}
        selectedMessage={chatActions.selectedMessageForMenu}
        onClose={() => {
          chatActions.setMessageContextMenu(null);
          chatActions.setSelectedMessageForMenu(null);
        }}
        onSendReaction={chatActions.handleSendReaction}
        onOpenReactionPicker={(messageId) => dialogs.setShowReactionPicker(messageId)}
        onReply={chatActions.handleReply}
        onCopy={chatActions.handleCopy}
        onForward={() => dialogs.setForwardDialogOpen(true)}
        onStarMessage={chatActions.handleStarMessage}
        onPinMessage={chatActions.handlePinMessage}
        onUnpinMessage={chatActions.handleUnpinMessage}
        onDeleteMessage={chatActions.handleDeleteMessage}
      />

      <ChatForwardDialog
        open={dialogs.forwardDialogOpen}
        onOpenChange={dialogs.setForwardDialogOpen}
        conversations={chatData.conversations}
        getContactName={getContactName}
        onForward={chatActions.handleForwardMessage}
      />

      <ChatReactionPickerDialog
        messageId={dialogs.showReactionPicker}
        onClose={() => dialogs.setShowReactionPicker(null)}
        onSelectEmoji={chatActions.handleSendReaction}
      />

      <ChatPollDialog
        open={dialogs.pollDialogOpen}
        onOpenChange={dialogs.setPollDialogOpen}
        onSendPoll={chatActions.handleSendPoll}
      />

      <ChatButtonsDialog
        open={dialogs.buttonsDialogOpen}
        onOpenChange={dialogs.setButtonsDialogOpen}
        onSendButtons={chatActions.handleSendButtons}
      />

      <ChatListDialog
        open={dialogs.listDialogOpen}
        onOpenChange={dialogs.setListDialogOpen}
        onSendList={chatActions.handleSendList}
      />

      <ChatCatalogDialog
        open={dialogs.catalogDialogOpen}
        onOpenChange={dialogs.setCatalogDialogOpen}
        products={chatData.products}
        onSendProduct={chatActions.handleSendProduct}
      />

      <ChatLocationDialog
        open={dialogs.locationDialogOpen}
        onOpenChange={dialogs.setLocationDialogOpen}
        onSendLocation={chatActions.handleSendLocation}
      />

      <ChatTemplateDialog
        open={dialogs.templateDialogOpen}
        onOpenChange={dialogs.setTemplateDialogOpen}
        templates={chatData.templates}
        loadingTemplates={chatData.loadingTemplates}
        onSendTemplate={chatActions.handleSendTemplate}
      />

      <ChatStatusDialog
        open={dialogs.statusDialogOpen}
        onOpenChange={dialogs.setStatusDialogOpen}
        onPostStatus={chatActions.handlePostStatusAction}
        isPosting={chatActions.postingStatus}
      />

      <ContactInfoSheet
        open={dialogs.showContactInfo && Boolean(!chatData.selectedContact?.isGroup)}
        onOpenChange={dialogs.setShowContactInfo}
        contact={chatData.selectedContact}
        onLoadStarredMessages={chatData.loadStarredMessages}
        onMuteChat={chatActions.handleMuteChat}
        onClearChat={chatActions.handleClearChat}
        onDeleteChat={chatActions.handleDeleteChat}
        onBlockContact={chatActions.handleBlockContact}
        onUnblockContact={chatActions.handleUnblockContact}
      />

      <ChatStarredMessagesSheet
        open={chatData.starredMessagesOpen}
        onOpenChange={chatData.setStarredMessagesOpen}
        messages={chatData.starredMessages}
      />

      <ChatModalsContainer
        confirmData={chatActions.confirmData}
        setConfirmData={chatActions.setConfirmData}
        activeSessionId={chatData.activeSessionId}
        selectedSession={chatData.selectedSession}
        sessions={chatData.sessions}
        selectedContact={chatData.selectedContact}
        setSelectedContact={chatData.setSelectedContact}
        conversations={chatData.conversations}
        currentUserProfile={chatData.currentUserProfile}
        showContactInfo={dialogs.showContactInfo}
        setShowContactInfo={dialogs.setShowContactInfo}
        createGroupDialogOpen={dialogs.createGroupDialogOpen}
        setCreateGroupDialogOpen={dialogs.setCreateGroupDialogOpen}
        profileDialogOpen={dialogs.profileDialogOpen}
        setProfileDialogOpen={dialogs.setProfileDialogOpen}
        checkNumberDialogOpen={dialogs.checkNumberDialogOpen}
        setCheckNumberDialogOpen={dialogs.setCheckNumberDialogOpen}
        showQuickOrderModal={dialogs.showQuickOrderModal}
        setShowQuickOrderModal={dialogs.setShowQuickOrderModal}
        showServiceOrderModal={dialogs.showServiceOrderModal}
        setShowServiceOrderModal={dialogs.setShowServiceOrderModal}
        showQuickCreateTaskModal={dialogs.showQuickCreateTaskModal}
        setShowQuickCreateTaskModal={dialogs.setShowQuickCreateTaskModal}
        showProductPicker={dialogs.showProductPicker}
        setShowProductPicker={dialogs.setShowProductPicker}
        showImageGallery={dialogs.showImageGallery}
        setShowImageGallery={dialogs.setShowImageGallery}
        interactiveDialogOpen={dialogs.interactiveDialogOpen}
        setInteractiveDialogOpen={dialogs.setInteractiveDialogOpen}
        labelDialogOpen={dialogs.labelDialogOpen}
        setLabelDialogOpen={dialogs.setLabelDialogOpen}
        selectedContactForLabel={dialogs.selectedContactForLabel}
        setSelectedContactForLabel={dialogs.setSelectedContactForLabel}
        broadcastDialogOpen={dialogs.broadcastDialogOpen}
        setBroadcastDialogOpen={dialogs.setBroadcastDialogOpen}
        privacyDialogOpen={dialogs.privacyDialogOpen}
        setPrivacyDialogOpen={dialogs.setPrivacyDialogOpen}
        businessProfileDialogOpen={dialogs.businessProfileDialogOpen}
        setBusinessProfileDialogOpen={dialogs.setBusinessProfileDialogOpen}
        quickOrderContact={dialogs.quickOrderContact}
        setQuickOrderContact={dialogs.setQuickOrderContact}
        selectedContactPhoneNumber={selectedContactPhoneNumber}
        targetSessionId={chatData.targetSessionId}
        getContactName={getContactName}
        getContactPhoneNumber={getContactPhoneNumber}
        onOrderCreated={(orderId) => {
          toast.success(t('whatsapp.dialogs.orderCreated', { orderId }));
          dialogs.setOrdersRefreshToken((prev) => prev + 1);
        }}
        onServiceOrderCreated={() => {
          dialogs.setOrdersRefreshToken((prev) => prev + 1);
        }}
        onSendProductImages={chatActions.handleSendProductImages}
        onSelectImageFromGallery={chatActions.handleSelectImageFromGallery}
        onSelectMultipleImagesFromGallery={chatActions.handleSelectMultipleImagesFromGallery}
        onSendInteractive={chatActions.handleSendInteractive}
      />
    </>
  );
};
