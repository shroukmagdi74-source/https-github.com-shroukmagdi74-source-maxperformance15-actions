import React from "react";
import BirthdayWhatsAppNotify from "./BirthdayWhatsAppNotify";
import {
  useCustomerWhatsAppNotifyController,
  CustomerWhatsAppNotifyHeader,
  CustomerWhatsAppAudienceCard,
  CustomerWhatsAppMessageEditor,
  CustomerWhatsAppProductDrawer,
  CustomerWhatsAppDelaySettings,
  CustomerWhatsAppChatPreview,
  CustomerWhatsAppCampaignProgress,
  type CustomerWhatsAppNotifyProps,
} from "./whatsapp-notify";

const CustomerWhatsAppNotify: React.FC<CustomerWhatsAppNotifyProps> = ({
  mode = "general",
}) => {
  if (mode === "birthday") {
    return <BirthdayWhatsAppNotify />;
  }

  const {
    sessions,
    connectedSession,
    sessionsLoading,
    loadSessions,
    audience,
    setAudience,
    newDays,
    setNewDays,
    audienceCount,
    audienceLoading,
    message,
    setMessage,
    mediaUrl,
    setMediaUrl,
    showProducts,
    setShowProducts,
    productSearch,
    setProductSearch,
    products,
    productsLoading,
    insertProduct,
    delayValue,
    setDelayValue,
    delayUnit,
    setDelayUnit,
    delayMode,
    setDelayMode,
    sending,
    campaign,
    sendError,
    handleSend,
    handleStop,
  } = useCustomerWhatsAppNotifyController();

  return (
    <div
      className="mx-auto w-full max-w-7xl space-y-4 p-3 sm:space-y-6 sm:p-6"
      dir="rtl"
    >
      {/* 1. Header Bar */}
      <CustomerWhatsAppNotifyHeader
        connectedSession={connectedSession}
        sessionsLoading={sessionsLoading}
        onRefreshSessions={() => void loadSessions()}
      />

      {/* 2. Cockpit Layout */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Left Column: Audience & Active Campaign */}
        <div className="space-y-4 xl:col-span-5">
          <CustomerWhatsAppAudienceCard
            audience={audience}
            newDays={newDays}
            audienceCount={audienceCount}
            audienceLoading={audienceLoading}
            onAudienceChange={setAudience}
            onNewDaysChange={setNewDays}
          />

          {campaign && (
            <CustomerWhatsAppCampaignProgress
              campaign={campaign}
              onStop={() => void handleStop()}
            />
          )}
        </div>

        {/* Right Column: Composer, Delay & Live Chat Preview */}
        <div className="space-y-4 xl:col-span-7">
          {showProducts && (
            <CustomerWhatsAppProductDrawer
              products={products}
              productSearch={productSearch}
              productsLoading={productsLoading}
              onSearchChange={setProductSearch}
              onSelectProduct={insertProduct}
              onClose={() => setShowProducts(false)}
            />
          )}

          <CustomerWhatsAppMessageEditor
            message={message}
            mediaUrl={mediaUrl}
            showProducts={showProducts}
            onMessageChange={setMessage}
            onMediaUrlChange={setMediaUrl}
            onToggleProducts={() => setShowProducts(!showProducts)}
            onClearMessage={() => setMessage("")}
          />

          <CustomerWhatsAppDelaySettings
            delayValue={delayValue}
            delayUnit={delayUnit}
            delayMode={delayMode}
            sending={sending}
            sendError={sendError}
            hasConnectedSession={Boolean(connectedSession)}
            hasMessage={Boolean(message.trim())}
            onDelayValueChange={setDelayValue}
            onDelayUnitChange={setDelayUnit}
            onDelayModeChange={setDelayMode}
            onSend={() => void handleSend()}
          />

          <CustomerWhatsAppChatPreview
            message={message}
            mediaUrl={mediaUrl}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerWhatsAppNotify;
