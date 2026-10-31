import React from "react";
import EmojiPicker from "emoji-picker-react";

interface FloatingEmojiPickerProps {
  showEmojiPicker: boolean;
  onClose: () => void;
  onEmojiClick: (emojiData: any) => void;
  isCompactMobile: boolean;
}

export const FloatingEmojiPicker: React.FC<FloatingEmojiPickerProps> = ({
  showEmojiPicker,
  onClose,
  onEmojiClick,
  isCompactMobile,
}) => {
  if (!showEmojiPicker) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div className="fixed bottom-16 inset-x-2 sm:inset-x-auto sm:start-4 z-50 flex justify-center sm:block overflow-visible rounded-xl shadow-2xl">
        <EmojiPicker
          onEmojiClick={onEmojiClick}
          width={
            isCompactMobile
              ? Math.min(
                  typeof window !== "undefined"
                    ? window.innerWidth - 24
                    : 320,
                  320
                )
              : 350
          }
          height={isCompactMobile ? 360 : 420}
        />
      </div>
    </>
  );
};
