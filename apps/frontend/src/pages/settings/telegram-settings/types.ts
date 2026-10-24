export interface TelegramBot {
  id: string;
  label: string;
  username?: string;
  running?: boolean;
}

export interface TelegramUserbot {
  id: string;
  label?: string;
  apiId?: string;
  clientPhone?: string;
  sessionString?: string;
  inboxEnabled?: boolean;
}

export type TelegramConnectionStep =
  | "INIT"
  | "OTP"
  | "2FA"
  | "RECONNECT_PHONE";

export type TelegramTab = "bots" | "userbots";
