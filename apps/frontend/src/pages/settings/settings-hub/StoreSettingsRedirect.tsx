import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const StoreSettingsRedirect: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/settings/store', { replace: true });
  }, [navigate]);

  return (
    <div className="px-6 py-10">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
        <p className="mt-4 text-sm text-muted-foreground">
          {t('settings.redirecting', 'جارٍ التحويل...')}
        </p>
      </div>
    </div>
  );
};
