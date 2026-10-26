import React from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import {
  STATUS_MAP,
  PAYMENT_STATUS_MAP,
  formatFileSize,
  useServiceOrderDetail,
  ServiceOrderHeader,
  ServiceOrderOverviewCard,
  ServiceOrderMediaCard,
  ServiceOrderNotesCard,
  ServiceOrderFinanceCard,
  ServiceOrderCustomerCard,
  ServiceOrderTeamCard,
  ServiceOrderWhatsAppModal,
  ServiceOrderPaymentModal,
  ServiceOrderInvoiceModal,
  ServiceOrderLightboxModal,
} from "./service-order-detail";

export default function ServiceOrderDetailPage() {
  const { id } = useParams<{ id: string }>();

  const {
    order,
    loading,
    notes,
    setNotes,
    assignedTo,
    setAssignedTo,
    teamMembers,
    savingNotes,
    showAddFiles,
    setShowAddFiles,
    additionalFiles,
    setAdditionalFiles,
    savingFiles,
    selectedImage,
    setSelectedImage,
    waDetection,
    showWhatsAppModal,
    setShowWhatsAppModal,
    waMessageText,
    setWaMessageText,
    selectedWaSessionId,
    setSelectedWaSessionId,
    sendingWa,
    showPaymentModal,
    setShowPaymentModal,
    showInvoiceModal,
    setShowInvoiceModal,
    savingPayment,
    paymentForm,
    setPaymentForm,
    companySettings,
    updateStatus,
    saveNotesAndAssignment,
    handleSaveAdditionalFiles,
    handleSavePayment,
    handleSendWhatsAppSystem,
    openWhatsAppExternal,
    openInternalWhatsAppChat,
    applyTemplate,
    handleDeleteOrder,
  } = useServiceOrderDetail(id);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <p className="text-sm font-medium">جاري تحميل تفاصيل الطلب...</p>
      </div>
    );
  }

  if (!order) return null;

  const shortId = order.id ? `#${order.id.slice(-6).toUpperCase()}` : "";
  const currentStatus = STATUS_MAP[order.status] || STATUS_MAP.NEW;
  const currentPaymentStatus =
    PAYMENT_STATUS_MAP[order.payment?.paymentStatus] || PAYMENT_STATUS_MAP.UNPAID;
  const files = order.files || order.referenceFiles || [];

  const audioFiles = files.filter(
    (f: any) => f.type === "audio" || /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(f.url)
  );
  const videoFiles = files.filter(
    (f: any) => f.type === "video" || /\.(mp4|mov|webm|avi|mkv)$/i.test(f.url)
  );
  const imageFiles = files.filter(
    (f: any) => f.type === "image" || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f.url)
  );
  const otherFiles = files.filter(
    (f: any) =>
      !audioFiles.includes(f) &&
      !videoFiles.includes(f) &&
      !imageFiles.includes(f)
  );

  return (
    <div className="p-3 sm:p-6 max-w-6xl mx-auto space-y-4 sm:space-y-6 rtl" dir="rtl">
      {/* Top Header & Navigation */}
      <ServiceOrderHeader
        order={order}
        shortId={shortId}
        currentStatus={currentStatus}
        currentPaymentStatus={currentPaymentStatus}
        updateStatus={updateStatus}
        onOpenInvoice={() => setShowInvoiceModal(true)}
        onOpenWhatsApp={() => setShowWhatsAppModal(true)}
        onDelete={handleDeleteOrder}
      />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <ServiceOrderOverviewCard order={order} />

          <ServiceOrderMediaCard
            files={files}
            audioFiles={audioFiles}
            videoFiles={videoFiles}
            imageFiles={imageFiles}
            otherFiles={otherFiles}
            showAddFiles={showAddFiles}
            setShowAddFiles={setShowAddFiles}
            additionalFiles={additionalFiles}
            setAdditionalFiles={setAdditionalFiles}
            savingFiles={savingFiles}
            handleSaveAdditionalFiles={handleSaveAdditionalFiles}
            setSelectedImage={setSelectedImage}
            formatFileSize={formatFileSize}
          />

          <ServiceOrderNotesCard
            notes={notes}
            setNotes={setNotes}
            savingNotes={savingNotes}
            onSaveNotes={saveNotesAndAssignment}
          />
        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-4 sm:space-y-6">
          <ServiceOrderFinanceCard
            order={order}
            onOpenPaymentModal={() => setShowPaymentModal(true)}
            onOpenInvoiceModal={() => setShowInvoiceModal(true)}
            onSendInvoiceWhatsApp={() => {
              applyTemplate("INVOICE");
              setShowWhatsAppModal(true);
            }}
          />

          <ServiceOrderCustomerCard
            order={order}
            waDetection={waDetection}
            onOpenWhatsAppModal={() => setShowWhatsAppModal(true)}
            onOpenInternalChat={openInternalWhatsAppChat}
            onOpenExternalWhatsApp={openWhatsAppExternal}
          />

          <ServiceOrderTeamCard
            assignedTo={assignedTo}
            setAssignedTo={setAssignedTo}
            teamMembers={teamMembers}
            savingNotes={savingNotes}
            onSaveAssignment={saveNotesAndAssignment}
            order={order}
          />
        </div>
      </div>

      {/* Modals */}
      <ServiceOrderWhatsAppModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        waDetection={waDetection}
        selectedWaSessionId={selectedWaSessionId}
        setSelectedWaSessionId={setSelectedWaSessionId}
        waMessageText={waMessageText}
        setWaMessageText={setWaMessageText}
        sendingWa={sendingWa}
        handleSendWhatsAppSystem={handleSendWhatsAppSystem}
        openWhatsAppExternal={openWhatsAppExternal}
        applyTemplate={applyTemplate}
      />

      <ServiceOrderPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        paymentForm={paymentForm}
        setPaymentForm={setPaymentForm}
        savingPayment={savingPayment}
        handleSavePayment={handleSavePayment}
      />

      <ServiceOrderInvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        order={order}
        shortId={shortId}
        currentPaymentStatus={currentPaymentStatus}
        companySettings={companySettings}
        onSendViaWhatsApp={() => {
          setShowInvoiceModal(false);
          applyTemplate("INVOICE");
          setShowWhatsAppModal(true);
        }}
      />

      <ServiceOrderLightboxModal
        selectedImage={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
}
