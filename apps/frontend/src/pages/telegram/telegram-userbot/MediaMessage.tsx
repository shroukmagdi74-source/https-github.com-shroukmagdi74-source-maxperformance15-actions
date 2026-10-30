import React, { useState, useEffect, useMemo, useCallback } from "react";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { apiClient } from "../../../services/apiClient";
import type { Chat, Message } from "./types";
import {
  mediaCache,
  CACHE_MAX_AGE,
  buildChatReferenceQuery,
  getMediaType,
} from "./helpers";

export interface MediaMessageProps {
  msg: Message;
  userbotId: string;
  chat?: Chat | null;
}

export const MediaMessage: React.FC<MediaMessageProps> = ({
  msg,
  userbotId,
  chat,
}) => {
  // Create cache key
  const cacheKey = useMemo(
    () => `${userbotId}-${chat?.id || ""}-${msg.id}`,
    [userbotId, chat?.id, msg.id],
  );

  // Check cache first
  const cachedMedia = useMemo(() => {
    const cached = mediaCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_MAX_AGE) {
      return cached;
    }
    return null;
  }, [cacheKey]);

  const [mediaUrl, setMediaUrl] = useState<string | null>(
    cachedMedia?.blobUrl || null,
  );
  const [loading, setLoading] = useState(!cachedMedia);
  const [error, setError] = useState(false);
  const [mimeType, setMimeType] = useState<string | null>(
    cachedMedia?.mimeType || null,
  );

  const mediaType = getMediaType(msg.media);
  const isWebPage = mediaType === "webpage";

  const loadMedia = useCallback(async () => {
    // Check cache first
    const cached = mediaCache.get(cacheKey);
    const hasValidCache =
      cached && Date.now() - cached.timestamp < CACHE_MAX_AGE;

    // Don't auto-load WebPage previews
    if (isWebPage) {
      setLoading(false);
      return;
    }

    // Use cached media if available
    if (hasValidCache) {
      setMediaUrl(cached.blobUrl);
      setMimeType(cached.mimeType);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);
    try {
      const response = await apiClient.get<Blob>("/userbot/message/media", {
        params: {
          userbotConfigId: userbotId,
          ...buildChatReferenceQuery(chat),
          messageId: msg.id,
        },
        responseType: "blob",
      });

      const url = URL.createObjectURL(response.data);
      const detectedMimeType =
        response.data.type ||
        response.headers?.["content-type"] ||
        "application/octet-stream";

      // Cache the media
      mediaCache.set(cacheKey, {
        blobUrl: url,
        mimeType: detectedMimeType,
        timestamp: Date.now(),
      });

      setMediaUrl(url);
      setMimeType(detectedMimeType);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load media", err);
      setError(true);
      setLoading(false);
    }
  }, [cacheKey, isWebPage, msg.id, userbotId, chat]);

  useEffect(() => {
    const cached = mediaCache.get(cacheKey);
    const hasValidCache =
      cached && Date.now() - cached.timestamp < CACHE_MAX_AGE;

    if (isWebPage) {
      setLoading(false);
    } else if (hasValidCache) {
      setMediaUrl(cached.blobUrl);
      setMimeType(cached.mimeType);
      setLoading(false);
    } else {
      loadMedia();
    }
  }, [msg.id, userbotId, chat, isWebPage, cacheKey, loadMedia]);

  const isImage = mimeType
    ? mimeType.startsWith("image/")
    : mediaType === "image";
  const isVideo = mimeType
    ? mimeType.startsWith("video/")
    : mediaType === "video";
  const isAudio = mimeType
    ? mimeType.startsWith("audio/")
    : mediaType === "audio";

  const isDocumentAsImage =
    mediaType === "document" && mimeType?.startsWith("image/");
  const isDocumentAsVideo =
    mediaType === "document" && mimeType?.startsWith("video/");
  const isDocumentAsAudio =
    mediaType === "document" && mimeType?.startsWith("audio/");

  const finalIsImage = isImage || isDocumentAsImage;
  const finalIsVideo = isVideo || isDocumentAsVideo;
  const finalIsAudio = isAudio || isDocumentAsAudio;

  if (isWebPage) return null;

  if (loading) {
    return (
      <div className="h-40 w-40 bg-gray-200 dark:bg-gray-700 animate-pulse rounded flex items-center justify-center">
        <PhotoIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-2 border border-red-200 dark:border-red-800 rounded bg-red-50 dark:bg-red-900/20 mb-2">
        <div className="text-xs text-red-500 dark:text-red-400 mb-1">
          Failed to load media
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            loadMedia();
          }}
          className="text-[10px] bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!mediaUrl) return null;

  if (finalIsImage) {
    return (
      <div className="mb-2 -mx-3 -mt-3 first:mt-0">
        <img
          src={mediaUrl}
          alt="Media"
          className="w-full rounded-t-lg max-h-96 object-contain cursor-pointer"
          style={{ maxWidth: "400px", display: "block" }}
          onClick={() => window.open(mediaUrl, "_blank")}
          onError={() => {
            setError(true);
          }}
        />
      </div>
    );
  }

  if (finalIsVideo) {
    return (
      <div className="mb-2 -mx-3 -mt-3 first:mt-0">
        <video
          src={mediaUrl}
          controls
          className="w-full rounded-t-lg max-h-96 cursor-pointer"
          style={{ maxWidth: "400px", display: "block" }}
          onClick={(e) => e.stopPropagation()}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  if (finalIsAudio) {
    return (
      <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <audio src={mediaUrl} controls className="w-full">
          Your browser does not support the audio tag.
        </audio>
      </div>
    );
  }

  return (
    <div className="mb-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
      <div className="flex items-center gap-2">
        <PhotoIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <span className="text-sm text-gray-700 dark:text-gray-200">
          Media file
        </span>
        <a
          href={mediaUrl}
          download
          className="ml-auto text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
          onClick={(e) => e.stopPropagation()}
        >
          Download
        </a>
      </div>
      {mimeType && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {mimeType}
        </div>
      )}
    </div>
  );
};
