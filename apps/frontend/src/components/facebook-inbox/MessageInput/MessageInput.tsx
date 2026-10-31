import React from "react";
import QuickReplyDropdown from "../QuickReplyDropdown/QuickReplyDropdown";
import {
  MessageInputProps,
  useMessageInputController,
  VoiceRecordingBanner,
  ReplyPreviewBanner,
  MobileToolsMenu,
  DesktopToolsRow,
  MessageComposerBox,
  FloatingEmojiPicker,
} from "./components";

export type { MessageInputProps };

const MessageInput: React.FC<MessageInputProps> = (props) => {
  const {
    conversation,
    user,
    replyTo,
    onCancelReply,
    disabled = false,
    disabledReason,
    fileAccept,
    onSendFile,
  } = props;

  const {
    message,
    showEmojiPicker,
    setShowEmojiPicker,
    showQuickReplies,
    setShowQuickReplies,
    showMobileTools,
    setShowMobileTools,
    showDesktopExtraTools,
    setShowDesktopExtraTools,
    isCompactMobile,
    fileInputRef,
    messageInputRef,
    mobileMenuRef,
    desktopExtraToolsRef,
    hasExtraTools,
    isBusy,
    isRecording,
    recordingSeconds,
    recordingStatus,
    recordingError,
    formatRecordingTime,
    handleStartVoiceRecording,
    handleCancelVoiceRecording,
    handleStopAndSendVoice,
    handleSend,
    handleKeyPress,
    handleInputChange,
    handleSelectQuickReply,
    handleDirectSendQuickReply,
    handleEmojiClick,
    handleFileSelect,
  } = useMessageInputController(props);

  return (
    <div className="business-chat-composer business-chat-composer--facebook relative">
      {/* Quick Replies Dropdown */}
      {showQuickReplies && (
        <QuickReplyDropdown
          inputValue={message}
          onSelectReply={handleSelectQuickReply}
          onDirectSend={handleDirectSendQuickReply}
          onClose={() => setShowQuickReplies(false)}
          conversation={conversation}
          user={user}
        />
      )}

      {/* Reply Banner */}
      <ReplyPreviewBanner replyTo={replyTo} onCancelReply={onCancelReply} />

      {/* Main Single-Line Composer Form */}
      <form
        onSubmit={handleSend}
        className="business-chat-composer-form flex items-end gap-1.5 sm:gap-2 p-2 sm:p-2.5"
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept={
            fileAccept ||
            "image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.csv,.zip,.rar"
          }
        />

        {isRecording ? (
          <VoiceRecordingBanner
            recordingSeconds={recordingSeconds}
            recordingStatus={recordingStatus}
            recordingError={recordingError}
            formatRecordingTime={formatRecordingTime}
            onCancel={handleCancelVoiceRecording}
            onStopAndSend={handleStopAndSendVoice}
          />
        ) : (
          <>
            <MobileToolsMenu
              showMobileTools={showMobileTools}
              setShowMobileTools={setShowMobileTools}
              mobileMenuRef={mobileMenuRef}
              fileInputRef={fileInputRef}
              onStartVoiceRecording={handleStartVoiceRecording}
              onOpenQuickReplies={() => {
                setShowMobileTools(false);
                setShowQuickReplies(true);
                if (!isCompactMobile) {
                  messageInputRef.current?.focus();
                }
              }}
              uploadingFile={Boolean(props.uploadingFile)}
              props={props}
            />

            <DesktopToolsRow
              uploadingFile={Boolean(props.uploadingFile)}
              fileInputRef={fileInputRef}
              showQuickReplies={showQuickReplies}
              setShowQuickReplies={setShowQuickReplies}
              showEmojiPicker={showEmojiPicker}
              setShowEmojiPicker={setShowEmojiPicker}
              showDesktopExtraTools={showDesktopExtraTools}
              setShowDesktopExtraTools={setShowDesktopExtraTools}
              desktopExtraToolsRef={desktopExtraToolsRef}
              hasExtraTools={hasExtraTools}
              onFocusInput={() => {
                if (!isCompactMobile) {
                  setTimeout(() => messageInputRef.current?.focus(), 50);
                }
              }}
              props={props}
            />

            <MessageComposerBox
              message={message}
              messageInputRef={messageInputRef}
              disabled={disabled}
              disabledReason={disabledReason}
              isCompactMobile={isCompactMobile}
              isBusy={isBusy}
              uploadingFile={Boolean(props.uploadingFile)}
              showQuickReplies={showQuickReplies}
              showEmojiPicker={showEmojiPicker}
              setShowEmojiPicker={setShowEmojiPicker}
              hasSendFile={Boolean(onSendFile)}
              onInputChange={handleInputChange}
              onKeyPress={handleKeyPress}
              onStartVoiceRecording={handleStartVoiceRecording}
            />
          </>
        )}
      </form>

      {/* Floating Emoji Picker Popover */}
      <FloatingEmojiPicker
        showEmojiPicker={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onEmojiClick={handleEmojiClick}
        isCompactMobile={isCompactMobile}
      />

      {/* Helper Text */}
      {message.startsWith("/") && (
        <div
          className="mt-1 text-xs flex items-center gap-1.5 px-2.5 sm:px-3 md:px-4 pb-1.5"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          <span>💡</span>
          <span className="hidden sm:inline">
            اضغط Tab أو Enter أو انقر لاختيار الرد السريع
          </span>
          <span className="sm:hidden">
            اضغط على أي رد لاختياره أو إرساله مباشرة
          </span>
        </div>
      )}
    </div>
  );
};

export default MessageInput;
