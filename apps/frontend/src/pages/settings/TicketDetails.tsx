import React from "react";
import {
  TicketConversationCard,
  TicketDetailsHeader,
  TicketErrorView,
  TicketInfoCard,
  TicketLoadingView,
  TicketLogsCard,
  TicketNotFoundView,
  TicketReplyFormCard,
  useTicketDetailsController,
} from "./ticket-details";

const TicketDetails: React.FC = () => {
  const {
    navigate,
    ticket,
    loading,
    error,
    replyMessage,
    setReplyMessage,
    replyImage,
    setReplyImage,
    sendingReply,
    currentRating,
    submittingRating,
    loadTicketDetails,
    handleReply,
    handleImageChange,
    handleRateTicket,
  } = useTicketDetailsController();

  if (loading) {
    return <TicketLoadingView />;
  }

  if (error) {
    return (
      <TicketErrorView
        error={error}
        onBack={() => navigate("/settings/turbo")}
        onRetry={loadTicketDetails}
      />
    );
  }

  if (!ticket) {
    return <TicketNotFoundView onBack={() => navigate("/settings/turbo")} />;
  }

  return (
    <div className="bg-gray-50 p-6 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <div className="w-full">
        <TicketDetailsHeader
          ticketId={ticket.id}
          onBack={() => navigate("/settings/turbo")}
        />

        <TicketInfoCard
          ticket={ticket}
          currentRating={currentRating}
          submittingRating={submittingRating}
          onRateTicket={handleRateTicket}
        />

        <TicketConversationCard messages={ticket.messages} />

        <TicketReplyFormCard
          replyMessage={replyMessage}
          replyImage={replyImage}
          sendingReply={sendingReply}
          onChangeMessage={setReplyMessage}
          onSetImage={setReplyImage}
          onChangeImage={handleImageChange}
          onSubmit={handleReply}
        />

        {ticket.logs && ticket.logs.length > 0 ? (
          <TicketLogsCard logs={ticket.logs} />
        ) : null}
      </div>
    </div>
  );
};

export default TicketDetails;
