import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../../hooks/useAuthSimple";
import {
  useTicketDetails,
  formatFileSize,
  AdminTicketsSidebar,
  AdminChatArea,
  AdminMetaPanel,
  UserTicketHeader,
  UserChatMessages,
  UserReplyForm,
  UserRatingCard,
} from "./ticket-details";

const TicketDetails: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  const details = useTicketDetails({
    ticketId,
    isAdmin,
    userId: user?.id,
  });

  const {
    ticket,
    loading,
    error,
    messageContent,
    setMessageContent,
    attachments,
    sendingMessage,
    showRating,
    setShowRating,
    rating,
    setRating,
    feedback,
    setFeedback,
    submittingRating,
    adminTab,
    setAdminTab,
    userHistory,
    staffList,
    notification,
    allTickets,
    ticketsSearchQuery,
    setTicketsSearchQuery,
    filteredTickets,
    messagesEndRef,
    handleUpdateStatus,
    handleUpdatePriority,
    handleAssignToMe,
    handleAssignUser,
    handleFileUpload,
    removeAttachment,
    handleSendMessage,
    handleRatingSubmit,
  } = details;

  if (loading) {
    return (
      <div className="support-ticket-theme min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="support-ticket-theme min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-950">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-md dark:shadow-black/40 p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
            خطأ
          </h2>
          <p className="text-gray-600 dark:text-slate-400 mb-4">{error}</p>
          <button
            onClick={() =>
              navigate(isAdmin ? "/admin/support" : "/support/tickets")
            }
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            العودة إلى التذاكر
          </button>
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  // Admin View (3-column layout)
  if (isAdmin) {
    return (
      <div className="support-ticket-theme h-[calc(100vh-4rem)] flex flex-col bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden">
        {notification && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2 shadow-sm animate-fade-in flex-shrink-0 z-50">
            <CheckCircle className="w-4 h-4" />
            {notification}
          </div>
        )}

        <div className="flex-1 flex overflow-hidden min-h-0">
          <AdminTicketsSidebar
            allTickets={allTickets}
            filteredTickets={filteredTickets}
            ticketsSearchQuery={ticketsSearchQuery}
            setTicketsSearchQuery={setTicketsSearchQuery}
            activeTicketId={ticket.ticketId}
            onSelectTicket={(selectedId) =>
              navigate(`/admin/support/tickets/${selectedId}`)
            }
          />

          <AdminChatArea
            ticket={ticket}
            onBack={() => navigate("/admin/support")}
            onUpdateStatus={handleUpdateStatus}
            adminTab={adminTab}
            setAdminTab={setAdminTab}
            messageContent={messageContent}
            setMessageContent={setMessageContent}
            attachments={attachments}
            handleFileUpload={handleFileUpload}
            removeAttachment={removeAttachment}
            handleSendMessage={handleSendMessage}
            sendingMessage={sendingMessage}
            messagesEndRef={messagesEndRef}
          />

          <AdminMetaPanel
            ticket={ticket}
            userHistory={userHistory}
            staffList={staffList}
            currentUserId={user?.id}
            onUpdatePriority={handleUpdatePriority}
            onAssignToMe={handleAssignToMe}
            onAssignUser={handleAssignUser}
            onSelectHistoryTicket={(histId) =>
              navigate(`/admin/support/tickets/${histId}`)
            }
          />
        </div>
      </div>
    );
  }

  // User View
  return (
    <div className="support-ticket-theme bg-gray-50 flex flex-col dark:bg-gray-950">
      <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-4 flex flex-col overflow-hidden">
        <UserTicketHeader
          ticket={ticket}
          onBack={() => navigate("/support/tickets")}
        />

        <UserChatMessages
          ticket={ticket}
          messagesEndRef={messagesEndRef}
          formatFileSize={formatFileSize}
        />

        {ticket.status !== "closed" && (
          <UserReplyForm
            messageContent={messageContent}
            setMessageContent={setMessageContent}
            error={error}
            sendingMessage={sendingMessage}
            attachments={attachments}
            handleSendMessage={handleSendMessage}
            handleFileUpload={handleFileUpload}
            removeAttachment={removeAttachment}
          />
        )}

        {showRating && (
          <UserRatingCard
            rating={rating}
            setRating={setRating}
            feedback={feedback}
            setFeedback={setFeedback}
            submittingRating={submittingRating}
            onSkip={() => setShowRating(false)}
            onSubmit={handleRatingSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default TicketDetails;
