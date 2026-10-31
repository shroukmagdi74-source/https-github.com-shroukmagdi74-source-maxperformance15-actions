import React from "react";
import {
  DocumentTextIcon,
  PhotoIcon,
  LinkIcon,
  VideoCameraIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import type { TabType, PostType, MediaPreview } from "./types";
import {
  headingStyle,
  mutedStyle,
  panelStyle,
  activeTabStyle,
  accentTabStyle,
  inactiveTabStyle,
  pillActiveStyle,
  pillIdleStyle,
  controlInputStyle,
  dropzoneStyle,
  errorBannerStyle,
} from "./styles";

export interface FacebookContentEditorProps {
  postType: PostType;
  onPostTypeChange: (type: PostType) => void;
  activeTab: TabType;
  onActiveTabChange: (tab: TabType) => void;
  message: string;
  onMessageChange: (msg: string) => void;
  linkUrl: string;
  onLinkUrlChange: (url: string) => void;
  mediaPreviews: MediaPreview[];
  onMediaChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveMedia: (index: number) => void;
}

export const FacebookContentEditor: React.FC<FacebookContentEditorProps> = ({
  postType,
  onPostTypeChange,
  activeTab,
  onActiveTabChange,
  message,
  onMessageChange,
  linkUrl,
  onLinkUrlChange,
  mediaPreviews,
  onMediaChange,
  onRemoveMedia,
}) => {
  const { t } = useTranslation();

  return (
    <div className="business-page-panel p-5" style={panelStyle}>
      <div
        className="mb-4 flex items-center justify-between pb-4"
        style={{ borderBottom: "1px solid var(--business-card-border)" }}
      >
        <div className="flex space-x-4 space-x-reverse">
          <button
            onClick={() => onPostTypeChange("FEED")}
            className="border-b-2 px-1 pb-2 text-sm font-semibold transition-colors"
            style={postType === "FEED" ? activeTabStyle : inactiveTabStyle}
          >
            {t("facebookPostCreator.feedTab")}
          </button>
          <button
            onClick={() => {
              onPostTypeChange("STORY");
              onActiveTabChange("MEDIA");
            }}
            className="border-b-2 px-1 pb-2 text-sm font-semibold transition-colors"
            style={postType === "STORY" ? accentTabStyle : inactiveTabStyle}
          >
            {t("facebookPostCreator.storyTab")}
          </button>
        </div>
      </div>

      {/* Tabs for Feed */}
      {postType === "FEED" && (
        <div className="flex space-x-2 space-x-reverse mb-4">
          <button
            onClick={() => onActiveTabChange("STATUS")}
            className="flex items-center rounded-full px-3 py-1.5 text-sm transition-colors"
            style={activeTab === "STATUS" ? pillActiveStyle : pillIdleStyle}
          >
            <DocumentTextIcon className="w-4 h-4 ml-1" />{" "}
            {t("facebookPostCreator.statusTab")}
          </button>
          <button
            onClick={() => onActiveTabChange("MEDIA")}
            className="flex items-center rounded-full px-3 py-1.5 text-sm transition-colors"
            style={activeTab === "MEDIA" ? pillActiveStyle : pillIdleStyle}
          >
            <PhotoIcon className="w-4 h-4 ml-1" />{" "}
            {t("facebookPostCreator.mediaTab")}
          </button>
          <button
            onClick={() => onActiveTabChange("LINK")}
            className="flex items-center rounded-full px-3 py-1.5 text-sm transition-colors"
            style={activeTab === "LINK" ? pillActiveStyle : pillIdleStyle}
          >
            <LinkIcon className="w-4 h-4 ml-1" />{" "}
            {t("facebookPostCreator.linkTab")}
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="space-y-4">
        {/* Text Input */}
        {(activeTab !== "LINK" || postType === "FEED") && (
          <textarea
            className="h-32 w-full resize-none rounded-lg p-3 text-base outline-none focus:ring-1 focus:ring-primary/40"
            style={controlInputStyle}
            placeholder={
              postType === "STORY"
                ? t("facebookPostCreator.storyNote")
                : t("facebookPostCreator.writeSomething")
            }
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
          />
        )}

        {/* Link Input */}
        {activeTab === "LINK" && postType === "FEED" && (
          <div>
            <label
              className="mb-1 block text-sm font-medium"
              style={headingStyle}
            >
              {t("facebookPostCreator.linkLabel")}
            </label>
            <div className="flex">
              <span
                className="inline-flex items-center rounded-r-md border border-l-0 px-3 text-sm"
                style={controlInputStyle}
              >
                https://
              </span>
              <input
                type="text"
                className="block w-full min-w-0 flex-1 rounded-l-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/40"
                style={controlInputStyle}
                placeholder={t("facebookPostCreator.linkPlaceholder")}
                value={linkUrl}
                onChange={(e) => onLinkUrlChange(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Media Uploader */}
        {(activeTab === "MEDIA" || postType === "STORY") && (
          <div
            className="rounded-lg border-2 border-dashed p-6 text-center transition-colors"
            style={dropzoneStyle}
          >
            <input
              type="file"
              id="mediaUpload"
              multiple={postType === "FEED"}
              accept="image/*,video/*"
              className="hidden"
              onChange={onMediaChange}
            />
            <label
              htmlFor="mediaUpload"
              className="cursor-pointer flex flex-col items-center"
            >
              <div
                className="mb-3 rounded-full p-3"
                style={{
                  background:
                    "color-mix(in srgb, var(--color-primary) 12%, transparent)",
                }}
              >
                <VideoCameraIcon
                  className="h-8 w-8"
                  style={{ color: "var(--color-primary)" }}
                />
              </div>
              <span className="font-medium" style={headingStyle}>
                {t("facebookPostCreator.uploadLabel")}
              </span>
              <span className="mt-1 text-xs" style={mutedStyle}>
                {t("facebookPostCreator.uploadHint")}
              </span>
            </label>
          </div>
        )}

        {/* Previews */}
        {mediaPreviews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {mediaPreviews.map((preview, idx) => (
              <div
                key={idx}
                className="group relative aspect-square overflow-hidden rounded-lg border"
                style={panelStyle}
              >
                {preview.type === "video" ? (
                  <video
                    src={preview.url}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={preview.url}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                )}
                <button
                  onClick={() => onRemoveMedia(idx)}
                  className="absolute right-1 top-1 rounded-full p-1 opacity-0 transition-opacity transform group-hover:opacity-100 hover:scale-110"
                  style={errorBannerStyle}
                  aria-label="حذف الوسيط"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
