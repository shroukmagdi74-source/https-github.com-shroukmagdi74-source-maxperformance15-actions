import { apiClient } from "./apiClient";

export interface MetaApp {
  id: string;
  key: "primary" | "growth";
  appId: string;
  configId?: string | null;
  appSecretRef: string;
  webhookVerifyTokenRef?: string | null;
  isActive: boolean;
  hasSecretConfigured: boolean;
  hasVerifyTokenConfigured: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface UpsertMetaAppPayload {
  key: "primary" | "growth";
  appId: string;
  configId?: string | null;
  appSecretRef: string;
  webhookVerifyTokenRef?: string | null;
  isActive?: boolean;
}

export const metaAppsService = {
  async getApps(): Promise<MetaApp[]> {
    const response = await apiClient.get("/super-admin/platform/meta-apps");
    const resData = response?.data as any;
    const data = resData?.data || resData || [];
    return Array.isArray(data) ? data : [];
  },

  async upsertApp(payload: UpsertMetaAppPayload): Promise<MetaApp> {
    const response = await apiClient.post("/super-admin/platform/meta-apps", payload);
    const resData = response?.data as any;
    return resData?.data || resData;
  },

  async toggleStatus(key: string, isActive: boolean): Promise<MetaApp> {
    const response = await apiClient.patch(`/super-admin/platform/meta-apps/${key}/toggle`, {
      isActive,
    });
    const resData = response?.data as any;
    return resData?.data || resData;
  },
};

export default metaAppsService;
