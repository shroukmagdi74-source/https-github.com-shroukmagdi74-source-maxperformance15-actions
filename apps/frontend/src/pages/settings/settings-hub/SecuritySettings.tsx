import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';
import { getApiUrl } from '../../../config/environment';
import tokenManager from '../../../utils/tokenManager';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { SectionHeader } from './SectionHeader';

const getAuthHeaders = (additionalHeaders: Record<string, string> = {}) =>
  tokenManager.createAuthHeaders(additionalHeaders);

export const SecuritySettings: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const updateField =
    (field: keyof typeof formData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((current) => ({ ...current, [field]: event.target.value }));
    };

  const validatePassword = (value: string) => {
    const errors: string[] = [];

    if (value.length < 6) {
      errors.push(t('settings.validationMinLength', 'يجب أن لا تقل كلمة المرور عن 6 أحرف'));
    }
    if (!/[A-Z]/.test(value)) {
      errors.push(t('settings.validationUppercase', 'يجب أن تحتوي على حرف كبير واحد على الأقل'));
    }
    if (!/[a-z]/.test(value)) {
      errors.push(t('settings.validationLowercase', 'يجب أن تحتوي على حرف صغير واحد على الأقل'));
    }
    if (!/[0-9]/.test(value)) {
      errors.push(t('settings.validationDigit', 'يجب أن تحتوي على رقم واحد على الأقل'));
    }

    return errors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setFeedback({
        type: 'error',
        message: t('settings.validationPasswordMismatch', 'كلمة المرور الجديدة وتأكيدها غير متطابقين'),
      });
      return;
    }

    const passwordErrors = validatePassword(formData.newPassword);
    if (passwordErrors.length > 0) {
      setFeedback({
        type: 'error',
        message: passwordErrors.join(' '),
      });
      return;
    }

    setIsSaving(true);

    try {
      const { currentPassword, newPassword } = formData;

      const response = await fetch(`${getApiUrl()}/auth/change-password`, {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const payload = await response.json();

      if (!response.ok || !payload?.success) {
        setFeedback({
          type: 'error',
          message: payload?.message || t('settings.errorPasswordChangeFailed'),
        });
        return;
      }

      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setFeedback({
        type: 'success',
        message: t('settings.successPasswordUpdated', 'تم تحديث كلمة المرور بنجاح'),
      });
    } catch {
      setFeedback({
        type: 'error',
        message: t('settings.errorPasswordChange'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const passwordChecks = [
    {
      label: t('settings.requirementMinLength', '6 أحرف على الأقل'),
      passed: formData.newPassword.length >= 6,
    },
    {
      label: t('settings.requirementUppercase', 'حرف كبير واحد على الأقل (A-Z)'),
      passed: /[A-Z]/.test(formData.newPassword),
    },
    {
      label: t('settings.requirementLowercase', 'حرف صغير واحد على الأقل (a-z)'),
      passed: /[a-z]/.test(formData.newPassword),
    },
    {
      label: t('settings.requirementDigit', 'رقم واحد على الأقل (0-9)'),
      passed: /[0-9]/.test(formData.newPassword),
    },
  ];

  return (
    <div className="flex flex-col gap-6 px-6 py-6">
      <SectionHeader
        title={t('settings.securitySectionTitle', 'إعدادات الأمان')}
        description={t('settings.securitySectionDescription', 'إدارة كلمة المرور وحماية حسابك')}
      />

      <div className="rounded-xl border border-border bg-muted/50 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 text-muted-foreground shrink-0" />
          <p className="text-sm text-foreground">
            {t('settings.securityTip', 'استخدم كلمة مرور قوية وفريدة لا تستخدمها في منصات أخرى.')}
          </p>
        </div>
      </div>

      {feedback && (
        <Alert variant={feedback.type === 'success' ? 'default' : 'destructive'}>
          <AlertTitle>
            {feedback.type === 'success' ? t('common.success') : t('common.error')}
          </AlertTitle>
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="security-current-password">
            {t('settings.currentPassword', 'كلمة المرور الحالية')}
          </Label>
          <Input
            id="security-current-password"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            value={formData.currentPassword}
            onChange={updateField('currentPassword')}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="security-new-password">
            {t('settings.newPassword', 'كلمة المرور الجديدة')}
          </Label>
          <Input
            id="security-new-password"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            value={formData.newPassword}
            onChange={updateField('newPassword')}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="security-confirm-password">
            {t('settings.confirmNewPassword', 'تأكيد كلمة المرور الجديدة')}
          </Label>
          <Input
            id="security-confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={updateField('confirmPassword')}
          />
        </div>

        <div className="rounded-xl border border-border bg-muted/50 p-4">
          <p className="mb-3 text-sm font-semibold text-foreground">
            {t('settings.passwordRequirements', 'شروط كلمة المرور')}
          </p>
          <div className="flex flex-col gap-2">
            {passwordChecks.map((item) => (
              <div
                key={item.label}
                className={cn(
                  'flex items-center gap-2 text-sm',
                  item.passed ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground',
                )}
              >
                <span
                  className={cn(
                    'size-2.5 rounded-full',
                    item.passed ? 'bg-green-500' : 'bg-muted-foreground/30',
                  )}
                />
                {item.label}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? t('settings.updating', 'جارٍ الحفظ...') : t('settings.updatePassword', 'تحديث كلمة المرور')}
          </Button>
        </div>
      </form>
    </div>
  );
};
