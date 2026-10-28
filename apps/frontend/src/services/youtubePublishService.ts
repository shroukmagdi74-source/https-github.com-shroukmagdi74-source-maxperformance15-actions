import { apiClient } from "./apiClient";

export type YouTubeVideoStatus =
  | "SCHEDULED"
  | "UPLOADING"
  | "PROCESSING"
  | "PUBLISHED"
  | "FAILED"
  | "CANCELLED";

export type YouTubePrivacyStatus = "private" | "unlisted" | "public";

export interface YouTubeAccountStatus {
  connected: boolean;
  channelId?: string;
  channelTitle?: string | null;
  avatarUrl?: string | null;
  status?: string;
  tokenExpiresAt?: string | null;
}

export interface YouTubeVideo {
  id: string;
  companyId: string;
  accountId: string;
  title: string;
  description?: string | null;
  tags?: string | null;
  categoryId: string;
  privacyStatus: YouTubePrivacyStatus | string;
  madeForKids: boolean;
  mediaUrl: string;
  thumbnailUrl?: string | null;
  status: YouTubeVideoStatus;
  scheduledAt?: string | null;
  startedAt?: string | null;
  publishedAt?: string | null;
  youtubeVideoId?: string | null;
  uploadSessionUri?: string | null;
  errorMessage?: string | null;
  attempts: number;
  metadata?: string | null;
  createdAt: string;
  updatedAt: string;
  account?: {
    id: string;
    channelId: string;
    channelTitle: string | null;
    avatarUrl?: string | null;
  } | null;
}

export interface YouTubePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface YouTubeCreatePayload {
  title: string;
  description?: string;
  tags?: string;
  privacyStatus?: YouTubePrivacyStatus;
  mediaUrl: string;
  scheduledAt?: string;
  madeForKids?: boolean;
  categoryId?: string;
}

export interface YouTubeListParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface YouTubeApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: YouTubePagination;
  error?: string;
  message?: string;
  url?: string;
}

export interface YouTubeListResult {
  data: YouTubeVideo[];
  pagination: YouTubePagination;
}

export const getAccountStatus = async (): Promise<YouTubeAccountStatus> => {
  const res = await apiClient.get<YouTubeApiResponse<YouTubeAccountStatus>>(
    "/youtube/publish/account"
  );
  return res.data.data;
};

export const getLoginUrl = async (): Promise<{ url: string }> => {
  const res = await apiClient.get<YouTubeApiResponse<{ url: string }>>(
    "/youtube/auth/login"
  );
  return { url: res.data.url || (res.data as any).data?.url || "" };
};

export const createVideo = async (
  payload: YouTubeCreatePayload
): Promise<YouTubeVideo> => {
  const res = await apiClient.post<YouTubeApiResponse<YouTubeVideo>>(
    "/youtube/publish",
    payload
  );
  return res.data.data;
};

export const listVideos = async (
  params: YouTubeListParams = {}
): Promise<YouTubeListResult> => {
  const res = await apiClient.get<YouTubeApiResponse<YouTubeVideo[]>>(
    "/youtube/publish",
    { params }
  );
  return {
    data: res.data.data || [],
    pagination: res.data.pagination || {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
    },
  };
};

export const getVideo = async (id: string): Promise<YouTubeVideo> => {
  const res = await apiClient.get<YouTubeApiResponse<YouTubeVideo>>(
    `/youtube/publish/${id}`
  );
  return res.data.data;
};

export const updateVideo = async (
  id: string,
  payload: Partial<YouTubeCreatePayload>
): Promise<YouTubeVideo> => {
  const res = await apiClient.patch<YouTubeApiResponse<YouTubeVideo>>(
    `/youtube/publish/${id}`,
    payload
  );
  return res.data.data;
};

export const retryVideo = async (id: string): Promise<YouTubeVideo> => {
  const res = await apiClient.post<YouTubeApiResponse<YouTubeVideo>>(
    `/youtube/publish/${id}/retry`
  );
  return res.data.data;
};

export const cancelVideo = async (id: string): Promise<YouTubeVideo> => {
  const res = await apiClient.delete<YouTubeApiResponse<YouTubeVideo>>(
    `/youtube/publish/${id}`
  );
  return res.data.data;
};
