import { useEffect, useState } from 'react';
import { apiClient } from '../../../services/api';
import { tToast } from '../../../utils/i18n-toast';
import { DEFAULT_SETTINGS } from './constants';
import type { DuplicateOrderSettingsData } from './types';

export function useDuplicateOrderSettingsController() {
  const [settings, setSettings] = useState<DuplicateOrderSettingsData>(DEFAULT_SETTINGS);
  const [exemptPhonesText, setExemptPhonesText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response =
        (await apiClient.get('/order-settings/duplicates').catch(() => null)) ||
        (await apiClient.get('/order-settings'));

      if (response?.data?.success) {
        const raw = response.data.data?.duplicateSettings || response.data.data || {};
        const merged: DuplicateOrderSettingsData = {
          enabled: raw.enabled !== undefined ? Boolean(raw.enabled) : DEFAULT_SETTINGS.enabled,
          criteria: ['phone', 'phone_amount', 'phone_items'].includes(raw.criteria)
            ? raw.criteria
            : DEFAULT_SETTINGS.criteria,
          activeStatuses:
            Array.isArray(raw.activeStatuses) && raw.activeStatuses.length > 0
              ? raw.activeStatuses
              : DEFAULT_SETTINGS.activeStatuses,
          windowEnabled:
            raw.windowEnabled !== undefined
              ? Boolean(raw.windowEnabled)
              : DEFAULT_SETTINGS.windowEnabled,
          windowMinutes: Number(raw.windowMinutes || DEFAULT_SETTINGS.windowMinutes),
          action: ['record_visible', 'record_hidden', 'block'].includes(raw.action)
            ? raw.action
            : raw.duplicateOrderAction === 'ignore'
              ? 'block'
              : raw.duplicateOrderAction === 'hidden'
                ? 'record_hidden'
                : DEFAULT_SETTINGS.action,
          alertTeam:
            raw.alertTeam !== undefined ? Boolean(raw.alertTeam) : DEFAULT_SETTINGS.alertTeam,
          includeStoreOrders:
            raw.includeStoreOrders !== undefined
              ? Boolean(raw.includeStoreOrders)
              : DEFAULT_SETTINGS.includeStoreOrders,
          reportTreatment:
            raw.reportTreatment === 'cancelled' ? 'cancelled' : DEFAULT_SETTINGS.reportTreatment,
          exemptPhones: Array.isArray(raw.exemptPhones) ? raw.exemptPhones : [],
        };
        setSettings(merged);
        setExemptPhonesText(merged.exemptPhones.join('\n'));
      }
    } catch (error) {
      console.error('Error fetching duplicate order settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSettings();
  }, []);

  const handleStatusToggle = (statusCode: string) => {
    setSettings((prev) => {
      const exists = prev.activeStatuses.includes(statusCode);
      const nextStatuses = exists
        ? prev.activeStatuses.filter((s) => s !== statusCode)
        : [...prev.activeStatuses, statusCode];
      return { ...prev, activeStatuses: nextStatuses.length > 0 ? nextStatuses : [statusCode] };
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const parsedExemptPhones = exemptPhonesText
        .split(/[\n,;]+/)
        .map((p) => p.trim())
        .filter(Boolean);

      const payload: DuplicateOrderSettingsData = {
        ...settings,
        exemptPhones: parsedExemptPhones,
      };

      const res =
        (await apiClient.put('/order-settings/duplicates', payload).catch(() => null)) ||
        (await apiClient.put('/order-settings', {
          duplicateSettings: payload,
          duplicateOrderAction:
            payload.action === 'block'
              ? 'ignore'
              : payload.action === 'record_hidden'
                ? 'hidden'
                : 'filter',
          duplicateOrderWindowMinutes: payload.windowMinutes,
        }));

      if (res?.data?.success) {
        tToast.success('DuplicateOrderSettings.success_save_eed8');
        setSettings(payload);
        setExemptPhonesText(parsedExemptPhones.join('\n'));
      }
    } catch (error) {
      console.error('Error saving duplicate order settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return {
    settings,
    setSettings,
    exemptPhonesText,
    setExemptPhonesText,
    loading,
    saving,
    fetchSettings,
    handleStatusToggle,
    handleSave,
  };
}
