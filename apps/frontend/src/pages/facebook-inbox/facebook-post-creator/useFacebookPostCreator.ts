import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { companyAwareApi } from "../../../services/companyAwareApi";
import { uploadService } from "../../../services/uploadService";
import type {
  FacebookPage,
  TabType,
  PostType,
  MediaPreview,
  PublishResult,
} from "./types";

export function useFacebookPostCreator() {
  const { t } = useTranslation();
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);

  // UI State
  const [activeTab, setActiveTab] = useState<TabType>("STATUS");
  const [postType, setPostType] = useState<PostType>("FEED");
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");

  // Content State
  const [message, setMessage] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<MediaPreview[]>([]);

  // Processing State
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<PublishResult | null>(null);
  const hasFetchedPages = useRef(false);

  const fetchPages = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await companyAwareApi.get(
        "/integrations/facebook/connected",
      );
      if (response.data.success) {
        setPages(response.data.pages || []);
      }
    } catch (error) {
      console.error("Error fetching pages:", error);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    if (!hasFetchedPages.current) {
      hasFetchedPages.current = true;
      fetchPages();
    }
  }, [fetchPages]);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // For Stories, only allow one media
    if (postType === "STORY" && mediaFiles.length + files.length > 1) {
      alert(t("facebookPostCreator.storyMediaLimit"));
      return;
    }

    const newPreviews: MediaPreview[] = files.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
    }));

    setMediaFiles((prev) => [...prev, ...files]);
    setMediaPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaPreviews((prev) => {
      if (prev[index]) {
        try {
          URL.revokeObjectURL(prev[index].url);
        } catch {
          // ignore revoke error
        }
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const togglePageSelection = (pageId: string) => {
    setSelectedPages((prev) =>
      prev.includes(pageId)
        ? prev.filter((id) => id !== pageId)
        : [...prev, pageId],
    );
  };

  const handleSelectAll = () => {
    if (selectedPages.length === pages.length) {
      setSelectedPages([]);
    } else {
      setSelectedPages(pages.map((p) => p.pageId));
    }
  };

  const handleSubmit = async () => {
    if (selectedPages.length === 0) {
      alert(t("facebookPostCreator.selectPageError"));
      return;
    }

    // Validation
    if (postType === "STORY" && mediaFiles.length === 0) {
      alert(t("facebookPostCreator.storyMediaRequired"));
      return;
    }
    if (activeTab === "LINK" && !linkUrl) {
      alert(t("facebookPostCreator.linkRequired"));
      return;
    }
    if (activeTab === "STATUS" && !message && mediaFiles.length === 0) {
      alert(t("facebookPostCreator.contentRequired"));
      return;
    }
    if (isScheduled && !scheduledDate) {
      alert(t("facebookPostCreator.scheduleDateRequired"));
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      // 1. Upload Media if any
      const uploadedMediaUrls: string[] = [];
      if (mediaFiles.length > 0) {
        for (const file of mediaFiles) {
          const uploadRes = await uploadService.uploadMedia(file);
          if (uploadRes.success && uploadRes.data) {
            let finalUrl = uploadRes.data.fullUrl || uploadRes.data.url;
            if (finalUrl && !finalUrl.startsWith("http")) {
              finalUrl = window.location.origin + finalUrl;
            }
            uploadedMediaUrls.push(finalUrl);
          } else {
            throw new Error(
              t("facebookPostCreator.uploadError", { name: file.name }),
            );
          }
        }
      }

      // 2. Determine Media Type
      let mediaType = "NONE";
      if (mediaFiles.length > 0) {
        const hasVideo = mediaFiles.some((f) => f.type.startsWith("video/"));
        if (hasVideo) mediaType = "VIDEO";
        else if (mediaFiles.length > 1) mediaType = "CAROUSEL";
        else mediaType = "IMAGE";
      }

      // 3. Prepare Payload
      const payload = {
        pageIds: selectedPages,
        message: message,
        mediaUrls: uploadedMediaUrls,
        mediaType: mediaType,
        linkUrl: activeTab === "LINK" ? linkUrl : undefined,
        postType: postType,
        scheduledTime: isScheduled ? scheduledDate : undefined,
      };

      const response = await companyAwareApi.post(
        "/integrations/facebook/publish",
        payload,
      );

      if (response.data.success) {
        setResult(response.data);
        // Reset form partially
        setMessage("");
        setMediaFiles([]);
        setMediaPreviews([]);
        setLinkUrl("");
      } else {
        alert(t("facebookPostCreator.publishError"));
      }
    } catch (error: any) {
      console.error("Publishing error:", error);
      alert(
        t("facebookPostCreator.publishFailed", {
          message: error.message || "",
        }),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return {
    pages,
    selectedPages,
    setSelectedPages,
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
    mediaFiles,
    mediaPreviews,
    loading,
    submitting,
    result,
    fetchPages,
    handleMediaChange,
    removeMedia,
    togglePageSelection,
    handleSelectAll,
    handleSubmit,
  };
}
