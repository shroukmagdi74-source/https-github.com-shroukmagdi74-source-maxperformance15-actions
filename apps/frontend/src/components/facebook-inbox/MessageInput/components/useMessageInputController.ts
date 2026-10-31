import { useState, useRef, useEffect } from "react";
import { useAudioRecorder } from "../../../../hooks/useAudioRecorder";
import { QuickReply } from "../QuickReplyDropdown/QuickReplyDropdown";
import {
  replaceVariables,
  getContextVariables,
} from "../../../../utils/quickReplyUtils";
import { MessageInputProps } from "./types";

export function useMessageInputController(props: MessageInputProps) {
  const {
    onSendMessage,
    onSendFile,
    onSendFiles,
    sending = false,
    uploadingFile = false,
    conversation,
    user,
    onCancelReply,
    onSend,
    isSending = false,
    draftMessage,
    onDraftMessageHandled,
    onSendQuickReply,
    disabled = false,
    onOpenOrder,
    onOpenServiceOrder,
    onOpenTasks,
    onOpenInteractive,
    onOpenPoll,
    onOpenButtons,
    onOpenList,
    onOpenCatalog,
    onOpenLocation,
    onOpenTemplate,
  } = props;

  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showMobileTools, setShowMobileTools] = useState(false);
  const [showDesktopExtraTools, setShowDesktopExtraTools] = useState(false);
  const [isCompactMobile, setIsCompactMobile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const desktopExtraToolsRef = useRef<HTMLDivElement>(null);

  const hasExtraTools = Boolean(
    onOpenOrder ||
      onOpenServiceOrder ||
      onOpenTasks ||
      onOpenInteractive ||
      onOpenPoll ||
      onOpenButtons ||
      onOpenList ||
      onOpenCatalog ||
      onOpenLocation ||
      onOpenTemplate
  );

  const isBusy = sending || isSending;
  const handleSendAction = onSendMessage || onSend;

  // Voice recording integration
  const {
    status: recordingStatus,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    clearBlobUrl,
    error: recordingError,
  } = useAudioRecorder();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSubmittingVoiceRef = useRef(false);

  const handleStartVoiceRecording = () => {
    if (disabled || isBusy || uploadingFile) return;
    setShowMobileTools(false);
    setShowEmojiPicker(false);
    setShowQuickReplies(false);
    setIsRecording(true);
    setRecordingSeconds(0);
    startRecording();
  };

  const handleCancelVoiceRecording = () => {
    setIsRecording(false);
    stopRecording();
    clearBlobUrl();
    setRecordingSeconds(0);
    isSubmittingVoiceRef.current = false;
  };

  const handleStopAndSendVoice = () => {
    isSubmittingVoiceRef.current = true;
    stopRecording();
  };

  useEffect(() => {
    if (isRecording && recordingStatus === "recording") {
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording, recordingStatus]);

  useEffect(() => {
    if (!isSubmittingVoiceRef.current || !mediaBlobUrl || recordingStatus !== "stopped") {
      return;
    }

    isSubmittingVoiceRef.current = false;
    setIsRecording(false);

    const submitVoiceBlob = async () => {
      try {
        const response = await fetch(mediaBlobUrl);
        const blob = await response.blob();
        if (blob.size < 500) {
          console.warn("Audio recording too small or empty, skipping send:", blob.size);
          return;
        }

        const ext = blob.type.includes("mp4")
          ? "m4a"
          : blob.type.includes("ogg")
          ? "ogg"
          : "webm";
        const file = new File([blob], `voice-${Date.now()}.${ext}`, {
          type: blob.type || "audio/mp4",
        });

        if (onSendFile) {
          onSendFile(file);
        }
      } catch (err) {
        console.error("Failed to process voice note recording:", err);
      } finally {
        clearBlobUrl();
        setRecordingSeconds(0);
      }
    };

    submitVoiceBlob();
  }, [clearBlobUrl, mediaBlobUrl, onSendFile, recordingStatus]);

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Insert draft text when provided from TextGallery or QuickReplies
  useEffect(() => {
    if (draftMessage !== undefined && draftMessage !== null && draftMessage !== "") {
      setMessage((prev) => {
        if (!prev) return draftMessage;
        if (prev === draftMessage || prev.includes(draftMessage)) return prev;
        return `${prev}\n${draftMessage}`;
      });
      if (onDraftMessageHandled) {
        onDraftMessageHandled();
      }
      setTimeout(() => {
        if (messageInputRef.current) {
          if (!isCompactMobile) {
            messageInputRef.current.focus();
          }
          messageInputRef.current.style.height = "auto";
          messageInputRef.current.style.height =
            Math.min(messageInputRef.current.scrollHeight, 120) + "px";
        }
      }, 50);
    }
  }, [draftMessage, onDraftMessageHandled, isCompactMobile]);

  // Focus input on mount (desktop only)
  useEffect(() => {
    if (!isCompactMobile && messageInputRef.current && !isBusy && !uploadingFile) {
      messageInputRef.current.focus();
    }
  }, [isCompactMobile, isBusy, uploadingFile]);

  // Keep input focused after sending message (desktop only)
  useEffect(() => {
    if (!isCompactMobile && !isBusy && messageInputRef.current) {
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 50);
    }
  }, [isBusy, isCompactMobile]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const updateViewportMode = () => {
      setIsCompactMobile(window.innerWidth < 640);
    };

    updateViewportMode();
    window.addEventListener("resize", updateViewportMode);

    return () => {
      window.removeEventListener("resize", updateViewportMode);
    };
  }, []);

  // Close mobile & desktop extra tools dropdown on outside click
  useEffect(() => {
    if (!showMobileTools && !showDesktopExtraTools) return undefined;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        showMobileTools &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target)
      ) {
        setShowMobileTools(false);
      }
      if (
        showDesktopExtraTools &&
        desktopExtraToolsRef.current &&
        !desktopExtraToolsRef.current.contains(target)
      ) {
        setShowDesktopExtraTools(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showMobileTools, showDesktopExtraTools]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (disabled) return;
    if (message.trim() && !isBusy && handleSendAction) {
      handleSendAction(message);
      setMessage("");
      setShowQuickReplies(false);
      setShowMobileTools(false);
      setShowEmojiPicker(false);
      if (messageInputRef.current) {
        messageInputRef.current.style.height = "auto";
      }
      if (!isCompactMobile) {
        setTimeout(() => {
          messageInputRef.current?.focus();
        }, 100);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !showQuickReplies) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Trigger quick replies if starting with / or preceded by space
    if (value.startsWith("/") || /(?:^|\s)\/([^\s]*)$/.test(value)) {
      setShowQuickReplies(true);
    } else {
      setShowQuickReplies(false);
    }

    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  };

  const handleSelectQuickReply = (reply: QuickReply) => {
    const contextVars = getContextVariables(conversation, user);
    const rawText = reply.content || (reply as any).text || "";
    const processedContent = replaceVariables(rawText, contextVars);

    // If message contains slash command, replace the slash portion or append cleanly
    const lastSlashIndex = message.lastIndexOf("/");
    if (lastSlashIndex > 0) {
      const preceding = message.slice(0, lastSlashIndex).trim();
      setMessage(preceding ? `${preceding}\n${processedContent}` : processedContent);
    } else if (lastSlashIndex === 0) {
      setMessage(processedContent);
    } else if (message.trim()) {
      setMessage(`${message.trim()}\n${processedContent}`);
    } else {
      setMessage(processedContent);
    }

    setShowQuickReplies(false);
    setShowMobileTools(false);
    if (messageInputRef.current) {
      messageInputRef.current.style.height = "auto";
      messageInputRef.current.style.height =
        Math.min(messageInputRef.current.scrollHeight, 120) + "px";

      if (!isCompactMobile) {
        setTimeout(() => {
          messageInputRef.current?.focus();
        }, 50);
      }
    }
  };

  const handleDirectSendQuickReply = (reply: QuickReply) => {
    const contextVars = getContextVariables(conversation, user);
    const rawText = reply.content || (reply as any).text || "";
    const processedContent = replaceVariables(rawText, contextVars);

    setShowQuickReplies(false);
    setShowMobileTools(false);
    setMessage("");

    if (messageInputRef.current) {
      messageInputRef.current.style.height = "auto";
    }

    if (onSendQuickReply) {
      onSendQuickReply({
        ...reply,
        content: processedContent,
      });
    } else if (handleSendAction) {
      handleSendAction(processedContent);
    }
  };

  const handleEmojiClick = (emojiData: any) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && !uploadingFile) {
      const fileList = Array.from(files);
      if (onSendFiles) {
        onSendFiles(fileList);
      } else if (onSendFile && fileList[0]) {
        onSendFile(fileList[0]);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setShowMobileTools(false);
  };

  return {
    message,
    setMessage,
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
  };
}
