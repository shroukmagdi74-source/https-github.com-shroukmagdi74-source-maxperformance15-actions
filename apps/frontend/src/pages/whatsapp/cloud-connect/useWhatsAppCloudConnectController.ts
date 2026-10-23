import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiClient } from '../../../services/apiClient';
import {
  ConnectionStep,
  FACEBOOK_PERMISSIONS,
  FacebookConfig,
  buildRedirectUri,
  getFacebookOAuthUrl,
} from './types';

export function useWhatsAppCloudConnectController() {
  const [searchParams, setSearchParams] = useSearchParams();
  const processedCode = useRef<Record<string, boolean>>({});

  const [step, setStep] = useState<ConnectionStep>('intro');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionName, setSessionName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fbConfig, setFbConfig] = useState<FacebookConfig | null>(null);
  const [fbSdkReady, setFbSdkReady] = useState(false);

  const embeddedAssetData = useRef<{ wabaId?: string; phoneNumberId?: string; businessId?: string }>({});
  const sessionNameRef = useRef(sessionName);

  useEffect(() => {
    sessionNameRef.current = sessionName;
  }, [sessionName]);

  const loadFbConfig = useCallback(async () => {
    try {
      const response = await apiClient.get('/whatsapp/facebook/config');
      setFbConfig(response.data as FacebookConfig | null);
    } catch {
      setErrorMessage('تعذر تحميل إعدادات Facebook');
    }
  }, []);

  useEffect(() => {
    void loadFbConfig();
  }, [loadFbConfig]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlSessionName = params.get('sessionName');
    if (urlSessionName) {
      setSessionName(urlSessionName);
      sessionStorage.setItem('wa_cloud_session_name', urlSessionName);
    }
  }, []);

  // Facebook JS SDK Injection & Init
  useEffect(() => {
    if (!fbConfig?.appId || !fbConfig?.configId) return;
    if (window.FB) {
      window.FB.init({ appId: fbConfig.appId, version: 'v25.0', autoLogAppEvents: true, xfbml: true });
      setFbSdkReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      window.FB?.init({ appId: fbConfig.appId, version: 'v25.0', autoLogAppEvents: true, xfbml: true });
      setFbSdkReady(true);
    };
    document.body.appendChild(script);
  }, [fbConfig?.appId, fbConfig?.configId]);

  // Window Message Listener for Embedded Sign-up
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (!event.origin.endsWith('facebook.com')) return;
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data?.type === 'WA_EMBEDDED_SIGNUP' && data?.data) {
          embeddedAssetData.current = {
            wabaId: data.data.waba_id || data.data.wabaIds?.[0],
            phoneNumberId: data.data.phone_number_id,
            businessId: data.data.business_id,
          };
        }
      } catch {
        // Ignore non-JSON postmessages
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // Handle OAuth code redirection
  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (!code && !state && !error) return;

    const cleanUrl = () => {
      setSearchParams({}, { replace: true });
    };

    if (error) {
      cleanUrl();
      setErrorMessage('تم إلغاء الاتصال بحساب Facebook');
      setStep('error');
      return;
    }

    if (!code || !state) return;

    const processedRef = processedCode.current;
    if (processedRef[code]) return;
    processedRef[code] = true;

    setStep('connecting');
    const name = sessionStorage.getItem('wa_cloud_session_name') || '';
    setSessionName(name);

    const exchangeCode = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.post('/whatsapp/facebook/connect', {
          code,
          state,
          sessionName: name,
          redirectUri: buildRedirectUri(),
        });
        cleanUrl();
        setSessionId((response as any).data.session.id);
        setStep('success');
      } catch (err: unknown) {
        cleanUrl();
        const apiErr = err as { response?: { data?: { error?: string } } };
        setErrorMessage(
          apiErr.response?.data?.error || 'فشل الاتصال بحساب Facebook',
        );
        setStep('error');
      } finally {
        setIsLoading(false);
      }
    };
    void exchangeCode();
  }, [searchParams, setSearchParams]);

  const handleFBLoginCallback = useCallback((response: { authResponse?: { code: string } }) => {
    if (!response.authResponse) {
      setErrorMessage('تم إلغاء الاتصال بحساب Facebook');
      setStep('error');
      return;
    }

    const code = response.authResponse.code;
    const name = sessionNameRef.current;

    setStep('connecting');

    const exchangeCode = async () => {
      try {
        setIsLoading(true);
        const payload: Record<string, unknown> = {
          code,
          sessionName: name,
          redirectUri: buildRedirectUri(),
        };
        const res = await apiClient.post('/whatsapp/facebook/connect', payload);
        setSessionId((res as any).data.session.id);
        setStep('success');
      } catch (err: unknown) {
        const apiErr = err as { response?: { data?: { error?: string } } };
        setErrorMessage(apiErr.response?.data?.error || 'فشل الاتصال بحساب Facebook');
        setStep('error');
      } finally {
        setIsLoading(false);
      }
    };
    void exchangeCode();
  }, []);

  const handleStartConnect = useCallback(() => {
    if (!fbConfig) {
      setErrorMessage('لم يتم تحميل إعدادات Facebook بعد');
      setStep('error');
      return;
    }

    sessionStorage.setItem('wa_cloud_session_name', sessionName);

    if (window.FB && fbSdkReady) {
      embeddedAssetData.current = {};
      window.FB.login(handleFBLoginCallback, {
        scope: FACEBOOK_PERMISSIONS,
        response_type: 'code',
      });
      return;
    }

    const csrfToken =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('wa_cloud_csrf', csrfToken);

    const oauthUrl = getFacebookOAuthUrl(fbConfig, csrfToken);
    window.location.href = oauthUrl;
  }, [fbConfig, fbSdkReady, sessionName, handleFBLoginCallback]);

  const resetToIntro = useCallback(() => {
    setStep('intro');
    setErrorMessage('');
  }, []);

  return {
    step,
    sessionId,
    sessionName,
    setSessionName,
    errorMessage,
    isLoading,
    fbConfig,
    fbSdkReady,
    handleStartConnect,
    resetToIntro,
  };
}
