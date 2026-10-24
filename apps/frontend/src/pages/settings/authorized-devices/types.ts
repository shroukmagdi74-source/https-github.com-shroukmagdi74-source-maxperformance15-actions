export interface DeviceUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface UserDevice {
  id: string;
  companyId: string;
  userId: string;
  fingerprint: string;
  deviceName: string;
  deviceType: "OFFICE" | "PERSONAL";
  clientType: "DESKTOP" | "WEB" | "MOBILE";
  osVersion: string | null;
  appVersion: string | null;
  ipAddress: string | null;
  isApproved: boolean;
  lastActiveAt: string;
  createdAt: string;
  user?: DeviceUser;
}

export type DeviceFilterType = "ALL" | "OFFICE" | "PERSONAL";
