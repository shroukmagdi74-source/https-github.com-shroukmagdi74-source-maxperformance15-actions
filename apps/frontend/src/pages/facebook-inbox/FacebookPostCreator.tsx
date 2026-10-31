import React from "react";
import { useNavigate } from "react-router-dom";
import {
  useFacebookPostCreator,
  FacebookPostCreatorHeader,
  FacebookPageSelector,
  FacebookContentEditor,
  FacebookScheduleAndPublish,
  FacebookPostPreviewCard,
  FacebookPublishResultCard,
} from "./facebook-post-creator";

export * from "./facebook-post-creator";

const FacebookPostCreator: React.FC = () => {
  const navigate = useNavigate();
  const {
    pages,
    selectedPages,
    activeTab,
    setActiveTab,
    postType,
    setPostType,
    isScheduled,
    setIsScheduled,
    scheduledDate,
    setScheduledDate,
    message,
    setMessage,
    linkUrl,
    setLinkUrl,
    mediaPreviews,
    loading,
    submitting,
    result,
    handleMediaChange,
    removeMedia,
    togglePageSelection,
    handleSelectAll,
    handleSubmit,
  } = useFacebookPostCreator();

  return (
    <div
      className="w-full min-h-screen space-y-6 p-6"
      style={{
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--color-background) 92%, var(--shell-control-bg) 8%) 0%, color-mix(in srgb, var(--shell-control-bg) 84%, var(--color-background) 16%) 100%)",
      }}
    >
      <FacebookPostCreatorHeader
        onCancel={() => navigate("/facebook-inbox")}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Creator */}
        <div className="lg:col-span-2 space-y-6">
          <FacebookPageSelector
            pages={pages}
            selectedPages={selectedPages}
            loading={loading}
            onTogglePageSelection={togglePageSelection}
            onSelectAll={handleSelectAll}
          />

          <FacebookContentEditor
            postType={postType}
            onPostTypeChange={setPostType}
            activeTab={activeTab}
            onActiveTabChange={setActiveTab}
            message={message}
            onMessageChange={setMessage}
            linkUrl={linkUrl}
            onLinkUrlChange={setLinkUrl}
            mediaPreviews={mediaPreviews}
            onMediaChange={handleMediaChange}
            onRemoveMedia={removeMedia}
          />

          <FacebookScheduleAndPublish
            isScheduled={isScheduled}
            onIsScheduledChange={setIsScheduled}
            scheduledDate={scheduledDate}
            onScheduledDateChange={setScheduledDate}
            onSubmit={handleSubmit}
            submitting={submitting}
            disabled={submitting || selectedPages.length === 0}
          />
        </div>

        {/* Right Column: Preview & Results */}
        <div className="space-y-6">
          <FacebookPostPreviewCard
            message={message}
            linkUrl={linkUrl}
            activeTab={activeTab}
            mediaPreviews={mediaPreviews}
          />

          {result && (
            <FacebookPublishResultCard
              result={result}
              isScheduled={isScheduled}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FacebookPostCreator;
