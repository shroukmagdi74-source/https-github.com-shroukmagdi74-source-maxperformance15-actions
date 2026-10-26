import React from "react";
import { X, Video, File } from "lucide-react";
import { Message } from "./types";

interface TelegramMediaGalleryDrawerProps {
  isRTL: boolean;
  chatSearchQuery: string;
  setChatSearchQuery: (val: string) => void;
  showMediaGallery: boolean;
  mediaMessages: Message[];
}

export const TelegramMediaGalleryDrawer: React.FC<TelegramMediaGalleryDrawerProps> = ({
  isRTL,
  chatSearchQuery,
  setChatSearchQuery,
  showMediaGallery,
  mediaMessages,
}) => {
  return (
    <>
      {/* Chat Search Bar */}
      {chatSearchQuery !== null && chatSearchQuery !== "" && (
        <div className="p-2 business-bg-primary-soft border-b business-border-primary-soft flex items-center gap-2">
          <input
            type="text"
            value={chatSearchQuery}
            onChange={(e) => setChatSearchQuery(e.target.value)}
            placeholder={isRTL ? "بحث في الرسائل..." : "Search messages..."}
            className={`flex-1 ${
              isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
            } py-2 business-bg-panel border business-border-primary-soft business-control-border rounded-lg text-sm business-text-strong focus:ring-2 business-focus-primary`}
            autoFocus
          />
          <button
            onClick={() => setChatSearchQuery("")}
            className="p-2 business-hover-primary-soft business-hover-primary-solid rounded"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Media Gallery */}
      {showMediaGallery && (
        <div className="p-4 business-bg-panel border-b business-border max-h-48 overflow-y-auto">
          <h4 className="font-semibold mb-3 business-text-strong">
            {isRTL ? "الوسائط المشتركة" : "Shared Media"}
          </h4>
          <div className="grid grid-cols-6 gap-2">
            {mediaMessages.slice(0, 12).map((msg, idx) => (
              <div
                key={idx}
                className="aspect-square business-bg-soft-strong rounded-lg overflow-hidden cursor-pointer hover:opacity-80"
              >
                {msg.type === "image" && msg.fileUrl ? (
                  <img
                    src={msg.fileUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {msg.type === "video" && (
                      <Video size={20} className="business-text-subtle" />
                    )}
                    {msg.type === "document" && (
                      <File size={20} className="business-text-subtle" />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
