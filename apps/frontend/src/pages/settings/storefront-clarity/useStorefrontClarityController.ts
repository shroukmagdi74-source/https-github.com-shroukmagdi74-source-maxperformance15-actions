import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  storefrontSettingsService,
  type StorefrontSettings,
} from '../../../services/storefrontSettingsService';
import { ClarityValidationErrors } from './types';

export function useStorefrontClarityController() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<StorefrontSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ClarityValidationErrors>({});

  const copiedTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const clarityProjectId = settings?.clarityProjectId || '';
  const isConnected = Boolean(clarityProjectId.trim());
  const clarityDashboardUrl = clarityProjectId
    ? `https://clarity.microsoft.com/projects/view/${clarityProjectId}/dashboard`
    : 'https://clarity.microsoft.com';

  useEffect(() => {
    const abortController = new AbortController();

    const fetchSettings = async () => {
      try {
        const response = await storefrontSettingsService.getSettings();
        const settingsData = response.data as StorefrontSettings;
        setSettings(settingsData);
        if (settingsData?.clarityProjectId) setHasSaved(true);
      } catch (error) {
        if (abortController.signal.aborted) return;
        console.error('Failed to fetch storefront settings:', error);
        toast.error(t('settings.fetchError', 'فشل تحميل الإعدادات'));
      } finally {
        if (!abortController.signal.aborted) setLoading(false);
      }
    };

    void fetchSettings();

    return () => abortController.abort();
  }, [t]);

  useEffect(() => {
    if (!copied) return;
    copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(copiedTimerRef.current);
  }, [copied]);

  const validate = (): boolean => {
    const errors: ClarityValidationErrors = {};
    const pid = settings?.clarityProjectId?.trim() || '';
    if (!pid) {
      errors.projectId = t('clarity.validate.projectIdRequired', 'Project ID مطلوب');
    } else if (!/^[a-z0-9]{7,10}$/.test(pid)) {
      errors.projectId = t(
        'clarity.validate.projectIdFormat',
        'الصيغة غير صحيحة. يجب أن يتكون من 7-10 أحرف وأرقام إنجليزية صغيرة'
      );
    }
    const token = settings?.clarityApiToken?.trim() || '';
    if (token && token.length < 10) {
      errors.apiToken = t('clarity.validate.apiTokenIncomplete', 'API Token غير مكتمل');
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!settings) return;
    if (!validate()) return;

    setSaving(true);
    try {
      await storefrontSettingsService.updateSettings({
        clarityProjectId: settings.clarityProjectId,
        clarityApiToken: settings.clarityApiToken,
      });
      setHasSaved(true);
      toast.success(t('clarity.saveSuccess', 'تم حفظ إعدادات Clarity'));
    } catch (error) {
      console.error('Failed to update clarity settings:', error);
      toast.error(t('settings.saveError', 'فشل الحفظ، حاول مرة أخرى'));
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    if (!settings) return;
    if (
      !window.confirm(
        t('clarity.disconnectConfirm', 'هل أنت متأكد من قطع اتصال Clarity؟ سيتم حذف الإعدادات.')
      )
    )
      return;
    setSaving(true);
    try {
      await storefrontSettingsService.updateSettings({
        clarityProjectId: '',
        clarityApiToken: '',
      });
      setSettings({ ...settings, clarityProjectId: '', clarityApiToken: '' });
      setHasSaved(false);
      setValidationErrors({});
      toast.success(t('clarity.disconnectSuccess', 'تم قطع اتصال Clarity'));
    } catch (error) {
      console.error('Failed to disconnect clarity:', error);
      toast.error(t('settings.saveError', 'فشل قطع الاتصال، حاول مرة أخرى'));
    } finally {
      setSaving(false);
    }
  };

  const handleCopyId = async () => {
    if (!clarityProjectId) return;
    try {
      await navigator.clipboard.writeText(clarityProjectId);
      setCopied(true);
      toast.success(t('clarity.copySuccess', 'تم نسخ الـ ID'));
    } catch {
      toast.error(t('clarity.copyError', 'تعذر نسخ الـ ID'));
    }
  };

  return {
    t,
    settings,
    setSettings,
    loading,
    saving,
    copied,
    hasSaved,
    validationErrors,
    setValidationErrors,
    clarityProjectId,
    isConnected,
    clarityDashboardUrl,
    handleSave,
    handleDisconnect,
    handleCopyId,
  };
}
