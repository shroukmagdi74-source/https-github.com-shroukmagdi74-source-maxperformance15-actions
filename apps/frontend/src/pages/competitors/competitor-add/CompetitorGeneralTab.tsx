import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Info,
  MapPin,
  Globe,
  ImagePlus,
  ChevronDown,
  ChevronUp,
  Smartphone,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  PLATFORMS,
  ACTIVITY_TYPES,
  TARGET_MARKETS,
  SOCIAL_PLATFORMS,
  type CompetitorFormData,
  type SocialProfile,
  type ImageItem,
} from './types';
import { ImageUploadSection } from './ImageUploadSection';

interface CompetitorGeneralTabProps {
  formData: CompetitorFormData;
  formErrors: Record<string, string>;
  handleInputChange: (field: keyof CompetitorFormData, value: string) => void;
  socialProfiles: SocialProfile[];
  handleSocialChange: (index: number, field: keyof SocialProfile, value: string) => void;
  activeSocialIndex: number | null;
  setActiveSocialIndex: React.Dispatch<React.SetStateAction<number | null>>;
  activityImages: ImageItem[];
  featureImages: ImageItem[];
  handleAddImage: (list: 'activity' | 'feature', file: File) => void;
  handleRemoveImage: (list: 'activity' | 'feature', id: string) => void;
  handleMoveImage: (list: 'activity' | 'feature', index: number, direction: 'up' | 'down') => void;
}

export const CompetitorGeneralTab: React.FC<CompetitorGeneralTabProps> = ({
  formData,
  formErrors,
  handleInputChange,
  socialProfiles,
  handleSocialChange,
  activeSocialIndex,
  setActiveSocialIndex,
  activityImages,
  featureImages,
  handleAddImage,
  handleRemoveImage,
  handleMoveImage,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Basic Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info size={18} className="text-blue-500" />
            {t('competitors.basicData') || 'البيانات الأساسية'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t('competitors.competitorName')} *</Label>
              <Input
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                placeholder={t('competitors.competitorNamePlaceholder')}
                aria-invalid={!!formErrors.name}
              />
              {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>{t('competitors.competitorUrl')}</Label>
              <Input
                type="url"
                value={formData.websiteUrl}
                onChange={e => handleInputChange('websiteUrl', e.target.value)}
                placeholder={t('competitors.competitorUrlPlaceholder')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>{t('competitors.platform')}</Label>
              <select
                value={formData.platform}
                onChange={e => handleInputChange('platform', e.target.value)}
                className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm dark:bg-input/30"
              >
                {PLATFORMS.map(p => (
                  <option key={p} value={p}>
                    {t(`competitors.platformOptions.${p === 'easy_orders' ? 'easyOrders' : p}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>{t('competitors.activityType')}</Label>
              <select
                value={formData.activityType}
                onChange={e => handleInputChange('activityType', e.target.value)}
                className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm dark:bg-input/30"
              >
                <option value="">{t('competitors.activityTypePlaceholder')}</option>
                {ACTIVITY_TYPES.map(at => (
                  <option key={at} value={at}>
                    {t(`competitors.activityTypes.${at}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>{t('competitors.targetMarket')}</Label>
              <select
                value={formData.targetMarket}
                onChange={e => handleInputChange('targetMarket', e.target.value)}
                className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm dark:bg-input/30"
              >
                <option value="">{t('competitors.targetMarketPlaceholder')}</option>
                {TARGET_MARKETS.map(tm => (
                  <option key={tm} value={tm}>
                    {t(`competitors.targetMarkets.${tm}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>{t('competitors.foundedYear')}</Label>
              <Input
                type="number"
                value={formData.foundedYear}
                onChange={e => handleInputChange('foundedYear', e.target.value)}
                placeholder={t('competitors.foundedYearPlaceholder')}
                min={1900}
                max={new Date().getFullYear()}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('competitors.founderName') || 'اسم المؤسس'}</Label>
              <Input
                value={formData.founderName}
                onChange={e => handleInputChange('founderName', e.target.value)}
                placeholder={t('competitors.founderNamePlaceholder')}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('competitors.founderLink') || 'رابط المؤسس'}</Label>
              <Input
                type="url"
                value={formData.founderLink}
                onChange={e => handleInputChange('founderLink', e.target.value)}
                placeholder={t('competitors.founderLinkPlaceholder')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin size={18} className="text-green-500" />
            {t('competitors.location')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t('competitors.country') || 'الدولة'}</Label>
              <Input
                value={formData.country}
                onChange={e => handleInputChange('country', e.target.value)}
                placeholder={t('competitors.countryPlaceholder')}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('competitors.city') || 'المدينة'}</Label>
              <Input
                value={formData.city}
                onChange={e => handleInputChange('city', e.target.value)}
                placeholder={t('competitors.cityPlaceholder')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe size={18} className="text-pink-500" />
            {t('competitors.socialLinks')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {socialProfiles.map((sp, i) => (
            <div key={sp.platform} className="border rounded-lg dark:border-gray-700 overflow-hidden">
              <button
                type="button"
                onClick={() => setActiveSocialIndex(activeSocialIndex === i ? null : i)}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                {React.createElement(
                  SOCIAL_PLATFORMS.find(p => p.key === sp.platform)?.icon || Smartphone,
                  { size: 18, className: 'text-gray-500 shrink-0' }
                )}
                <span className="flex-1 text-start">{t(`competitors.social.${sp.platform}`) || sp.platform}</span>
                {activeSocialIndex === i ? (
                  <ChevronUp size={16} className="text-gray-400" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400" />
                )}
              </button>
              {activeSocialIndex === i && (
                <div className="px-4 pb-3 pt-1 border-t dark:border-gray-700 space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('competitors.social.linkUrl') || 'رابط الصفحة'}</Label>
                    <Input
                      value={sp.url}
                      onChange={e => handleSocialChange(i, 'url', e.target.value)}
                      placeholder={t('competitors.socialUrlPlaceholder')}
                      size="sm"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Reference Images */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImagePlus size={18} className="text-purple-500" />
            {t('competitors.referenceImages') || 'الصور المرجعية'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ImageUploadSection
            label={t('competitors.activityTypeImages') || 'صور نوع النشاط'}
            images={activityImages}
            onAdd={file => handleAddImage('activity', file)}
            onRemove={id => handleRemoveImage('activity', id)}
            onMoveUp={i => handleMoveImage('activity', i, 'up')}
            onMoveDown={i => handleMoveImage('activity', i, 'down')}
          />
          <ImageUploadSection
            label={t('competitors.featureReferenceImages') || 'صور مرجعية للمميزات'}
            images={featureImages}
            onAdd={file => handleAddImage('feature', file)}
            onRemove={id => handleRemoveImage('feature', id)}
            onMoveUp={i => handleMoveImage('feature', i, 'up')}
            onMoveDown={i => handleMoveImage('feature', i, 'down')}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CompetitorGeneralTab;
