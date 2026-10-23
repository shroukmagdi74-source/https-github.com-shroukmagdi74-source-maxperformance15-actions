export type ConnectionStep =
  | 'intro'
  | 'connecting'
  | 'success'
  | 'error'
  | 'callback';

export interface FacebookConfig {
  appId: string;
  redirectUri: string;
  configId?: string;
  configured?: boolean;
}

export const FACEBOOK_PERMISSIONS = [
  'business_management',
  'whatsapp_business_messaging',
  'whatsapp_business_management',
].join(',');

export const buildRedirectUri = () =>
  `${window.location.origin}/whatsapp/cloud-connect`;

export const getFacebookOAuthUrl = (config: FacebookConfig, state: string) => {
  const base = 'https://www.facebook.com/v25.0/dialog/oauth';
  const params = new URLSearchParams({
    client_id: config.appId,
    redirect_uri: buildRedirectUri(),
    scope: FACEBOOK_PERMISSIONS,
    state,
    response_type: 'code',
  });
  return `${base}?${params.toString()}`;
};
