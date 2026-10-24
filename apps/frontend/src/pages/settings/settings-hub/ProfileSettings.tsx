import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getApiUrl } from '../../../config/environment';
import tokenManager from '../../../utils/tokenManager';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SectionHeader } from './SectionHeader';
import type { ProfileFormState } from './types';

const getAuthHeaders = (additionalHeaders: Record<string, string> = {}) =>
  tokenManager.createAuthHeaders(additionalHeaders);

export const ProfileSettings: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [formData, setFormData] = useState<ProfileFormState>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    timezone: 'Africa/Cairo',
    language: 'ar',
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${getApiUrl()}/hr/employees/me`, {
          headers: getAuthHeaders(),
        });
        const payload = await res.json();
        if (!cancelled && payload?.success && payload?.employee) {
          const e = payload.employee;
          setFormData({
            firstName: e.firstName || '',
            lastName: e.lastName || '',
            email: e.email || '',
            phone: e.phone || '',
            timezone: e.timezone || 'Africa/Cairo',
            language: 'ar',
          });
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleFieldChange =
    (field: keyof ProfileFormState) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback(null);
    setIsSaving(true);

    try {
      const response = await fetch(`${getApiUrl()}/hr/employees/me`, {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          timezone: formData.timezone,
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload?.success) {
        setFeedback({
          type: 'error',
          message: payload?.message || t('settings.errorSaveFailed'),
        });
        return;
      }

      setFeedback({
        type: 'success',
        message: t('settings.successProfileSaved'),
      });
    } catch {
      setFeedback({
        type: 'error',
        message: t('settings.errorSaveSettings'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 px-6 py-6">
      <SectionHeader
        title={t('settings.profileSectionTitle')}
        description={t('settings.profileSectionDescription')}
      />

      {feedback && (
        <Alert variant={feedback.type === 'success' ? 'default' : 'destructive'}>
          <AlertTitle>
            {feedback.type === 'success' ? t('common.success') : t('common.error')}
          </AlertTitle>
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="profile-first-name">{t('settings.firstName')}</Label>
              <Input
                id="profile-first-name"
                name="firstName"
                type="text"
                autoComplete="given-name"
                inputMode="text"
                value={formData.firstName}
                onChange={handleFieldChange('firstName')}
                dir="auto"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="profile-last-name">{t('settings.lastName')}</Label>
              <Input
                id="profile-last-name"
                name="lastName"
                type="text"
                autoComplete="family-name"
                inputMode="text"
                value={formData.lastName}
                onChange={handleFieldChange('lastName')}
                dir="auto"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="profile-email">{t('common.email')}</Label>
              <Input
                id="profile-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={formData.email}
                onChange={handleFieldChange('email')}
                dir="ltr"
                disabled
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="profile-phone">{t('common.phone')}</Label>
              <Input
                id="profile-phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleFieldChange('phone')}
                placeholder="+20 1XX XXX XXXX"
                dir="ltr"
                className="font-mono tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="profile-timezone">{t('settings.timezone')}</Label>
              <Select
                value={formData.timezone}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, timezone: value }))
                }
              >
                <SelectTrigger id="profile-timezone">
                  <SelectValue>
                    {formData.timezone === 'Africa/Cairo'
                      ? t('settings.cairo')
                      : formData.timezone === 'Asia/Riyadh'
                        ? t('settings.riyadh')
                        : formData.timezone === 'Asia/Dubai'
                          ? t('settings.dubai')
                          : formData.timezone}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Africa/Cairo">{t('settings.cairo')}</SelectItem>
                  <SelectItem value="Asia/Riyadh">{t('settings.riyadh')}</SelectItem>
                  <SelectItem value="Asia/Dubai">{t('settings.dubai')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="profile-language">{t('settings.language')}</Label>
              <Select
                value={formData.language}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, language: value }))
                }
              >
                <SelectTrigger id="profile-language">
                  <SelectValue>
                    {formData.language === 'ar'
                      ? t('settings.arabic')
                      : formData.language === 'en'
                        ? 'English'
                        : formData.language}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">{t('settings.arabic')}</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? t('settings.saving') : t('settings.saveChanges')}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
