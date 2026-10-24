import React from 'react';
import { Activity, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatRightPanelActivityTab } from './chat-right-panel/ChatRightPanelActivityTab';
import { ChatRightPanelHero } from './chat-right-panel/ChatRightPanelHero';
import { ChatRightPanelInfoTab } from './chat-right-panel/ChatRightPanelInfoTab';
import { ChatRightPanelOrderModals } from './chat-right-panel/ChatRightPanelOrderModals';
import { ChatRightPanelOrdersTab } from './chat-right-panel/ChatRightPanelOrdersTab';
import { useChatRightPanelController } from './chat-right-panel/useChatRightPanelController';
import type { ChatRightPanelProps } from './chat-right-panel/types';

export const ChatRightPanel: React.FC<ChatRightPanelProps> = ({
  contact,
  onOpenOrder,
  onOpenServiceOrder,
  onOpenTasks,
  onClose,
  onOpenLabels,
  labels = [],
  refreshToken = 0,
  onContactUpdated,
}) => {
  const {
    activeTab,
    setActiveTab,
    leadCategories,
    updatingCategory,
    selectedCategoryId,
    orderMenu,
    setOrderMenu,
    previewOrder,
    setPreviewOrder,
    orderDetailsLoading,
    orderStatuses,
    selectedReturn,
    setSelectedReturn,
    editingPhone,
    setEditingPhone,
    phoneDraft,
    setPhoneDraft,
    savingPhone,
    phoneUpdateMessage,
    setPhoneUpdateMessage,
    editingPhone2,
    setEditingPhone2,
    phone2Draft,
    setPhone2Draft,
    savingPhone2,
    tags,
    newTagInput,
    setNewTagInput,
    availableTags,
    isAddingTag,
    activeJourney,
    journeyLoading,
    reEnrolling,
    customer,
    orders,
    activities,
    loading,
    isLinkedCustomer,
    isGroup,
    rawDisplayPhone,
    displayPhone,
    displayPhone2,
    contactName,
    ltv,
    handleSavePhone,
    handleSavePhone2,
    handleCategoryChange,
    handleAddTag,
    handleRemoveTag,
    handleReEnroll,
    handleViewOrderDetails,
    handleOpenReturnReason,
  } = useChatRightPanelController({ contact, refreshToken, onContactUpdated });

  if (!contact) {
    return (
      <aside className="whatsapp-theme-transition hidden w-80 flex-col items-center justify-center border-l border-border/50 bg-card p-6 text-center lg:flex">
        <User className="size-12 text-muted-foreground/30 mb-2" />
        <p className="text-sm font-semibold text-foreground">معلومات جهة الاتصال</p>
        <p className="text-xs text-muted-foreground mt-1">
          اختر محادثة لعرض بيانات العميل والطلبات
        </p>
      </aside>
    );
  }

  return (
    <aside className="whatsapp-theme-transition flex h-full w-full flex-col overflow-hidden border-s border-border/50 bg-card lg:w-80 shrink-0">
      <ChatRightPanelHero
        contact={contact}
        contactName={contactName}
        isGroup={isGroup}
        isLinkedCustomer={isLinkedCustomer}
        ordersCount={orders.length}
        ltv={ltv}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenOrder={onOpenOrder}
        onOpenServiceOrder={onOpenServiceOrder}
        onOpenTasks={onOpenTasks}
        onOpenLabels={onOpenLabels}
        onClose={onClose}
      />

      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            {activeTab === 'info' && (
              <ChatRightPanelInfoTab
                contact={contact}
                customer={customer}
                isGroup={isGroup}
                isLinkedCustomer={isLinkedCustomer}
                displayPhone={displayPhone}
                editingPhone={editingPhone}
                phoneDraft={phoneDraft}
                setPhoneDraft={setPhoneDraft}
                savingPhone={savingPhone}
                phoneUpdateMessage={phoneUpdateMessage}
                onStartEditPhone={() => {
                  setPhoneDraft(rawDisplayPhone || '');
                  setEditingPhone(true);
                  setPhoneUpdateMessage(null);
                }}
                onCancelEditPhone={() => {
                  setEditingPhone(false);
                  setPhoneUpdateMessage(null);
                }}
                onSavePhone={handleSavePhone}
                displayPhone2={displayPhone2}
                editingPhone2={editingPhone2}
                phone2Draft={phone2Draft}
                setPhone2Draft={setPhone2Draft}
                savingPhone2={savingPhone2}
                onStartEditPhone2={() => {
                  setPhone2Draft(displayPhone2);
                  setEditingPhone2(true);
                }}
                onCancelEditPhone2={() => setEditingPhone2(false)}
                onSavePhone2={handleSavePhone2}
                selectedCategoryId={selectedCategoryId}
                onCategoryChange={handleCategoryChange}
                updatingCategory={updatingCategory}
                leadCategories={leadCategories}
                tags={tags}
                newTagInput={newTagInput}
                setNewTagInput={setNewTagInput}
                availableTags={availableTags}
                isAddingTag={isAddingTag}
                onAddTag={handleAddTag}
                onRemoveTag={handleRemoveTag}
                labels={labels}
                activeJourney={activeJourney}
                journeyLoading={journeyLoading}
                reEnrolling={reEnrolling}
                onReEnroll={handleReEnroll}
              />
            )}

            {activeTab === 'orders' && (
              <ChatRightPanelOrdersTab
                orders={orders}
                ltv={ltv}
                onOpenOrder={onOpenOrder}
                onOpenServiceOrder={onOpenServiceOrder}
                onOrderContextMenu={setOrderMenu}
              />
            )}

            {activeTab === 'activity' && (
              <ChatRightPanelActivityTab activities={activities} />
            )}
          </>
        )}
      </div>

      <div className="border-t border-border/50 p-3">
        <Button variant="outline" className="w-full gap-1.5 text-xs font-semibold" onClick={onOpenTasks}>
          <Activity className="size-4" />
          <span>مهمة جديدة</span>
        </Button>
      </div>

      <ChatRightPanelOrderModals
        orderMenu={orderMenu}
        onCloseOrderMenu={() => setOrderMenu(null)}
        orderDetailsLoading={orderDetailsLoading}
        onViewOrderDetails={handleViewOrderDetails}
        onOpenReturnReason={handleOpenReturnReason}
        previewOrder={previewOrder}
        onClosePreviewOrder={() => setPreviewOrder(null)}
        orderStatuses={orderStatuses}
        selectedReturn={selectedReturn}
        onCloseSelectedReturn={() => setSelectedReturn(null)}
      />
    </aside>
  );
};

export default ChatRightPanel;
