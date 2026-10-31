export interface FacebookPage {
  id: string;
  pageId: string;
  pageName: string;
  status: string;
}

export type TabType = "STATUS" | "MEDIA" | "LINK";
export type PostType = "FEED" | "STORY";

export interface MediaPreview {
  url: string;
  type: "image" | "video";
}

export interface PublishResultItem {
  pageName: string;
  success: boolean;
  error?: string;
}

export interface PublishResult {
  success: boolean;
  message?: string;
  results: PublishResultItem[];
}
