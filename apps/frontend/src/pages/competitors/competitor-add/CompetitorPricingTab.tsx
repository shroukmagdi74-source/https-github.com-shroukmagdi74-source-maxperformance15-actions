import React from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CompetitorFormData } from './types';

interface CompetitorPricingTabProps {
  formData: CompetitorFormData;
  handleInputChange: (field: keyof CompetitorFormData, value: string) => void;
}

export const CompetitorPricingTab: React.FC<CompetitorPricingTabProps> = ({
  formData,
  handleInputChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign size={18} className="text-emerald-500" />
            {t('competitors.pricing') || 'الأسعار'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>السعر الأساسي / الباقة</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={e => handleInputChange('price', e.target.value)}
                placeholder="مثال: 500"
                className="tabular-nums"
              />
            </div>
            <div className="space-y-1.5">
              <Label>العملة</Label>
              <select
                value={formData.currency || 'EGP'}
                onChange={e => handleInputChange('currency', e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="EGP">EGP - جنيه مصري</option>
                <option value="USD">USD - دولار أمريكي ($)</option>
                <option value="SAR">SAR - ريال سعودي (ر.س)</option>
                <option value="AED">AED - درهم إماراتي (د.إ)</option>
                <option value="EUR">EUR - يورو (€)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>دورة التسعير</Label>
              <select
                value={formData.cycle || 'monthly'}
                onChange={e => handleInputChange('cycle', e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="monthly">شهرياً (Monthly)</option>
                <option value="yearly">سنوياً (Yearly)</option>
                <option value="one_time">دفعة واحدة (One-Time)</option>
                <option value="usage_based">حسب الاستخدام (Usage-Based)</option>
                <option value="custom">مخصص / تفاوضي</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/60">
            <div className="space-y-1.5">
              <Label>{t('competitors.monthlyPrice') || 'السعر الشهري'}</Label>
              <div className="relative">
                <Input
                  type="number"
                  value={formData.monthlyPrice}
                  onChange={e => handleInputChange('monthlyPrice', e.target.value)}
                  placeholder={t('competitors.pricePlaceholder')}
                  className="ltr:pl-7 rtl:pr-7 tabular-nums"
                />
                <span className="absolute top-1/2 -translate-y-1/2 ltr:left-2.5 rtl:right-2.5 text-xs text-muted-foreground font-mono">
                  {formData.currency || 'EGP'}
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{t('competitors.yearlyPrice') || 'السعر السنوي'}</Label>
              <div className="relative">
                <Input
                  type="number"
                  value={formData.yearlyPrice}
                  onChange={e => handleInputChange('yearlyPrice', e.target.value)}
                  placeholder={t('competitors.pricePlaceholder')}
                  className="ltr:pl-7 rtl:pr-7 tabular-nums"
                />
                <span className="absolute top-1/2 -translate-y-1/2 ltr:left-2.5 rtl:right-2.5 text-xs text-muted-foreground font-mono">
                  {formData.currency || 'EGP'}
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{t('competitors.pricingNotes') || 'ملاحظات الأسعار'}</Label>
            <Textarea
              value={formData.pricingNotes}
              onChange={e => handleInputChange('pricingNotes', e.target.value)}
              rows={4}
              placeholder={t('competitors.pricingNotesPlaceholder') || 'أي تفاصيل عن خطط الأسعار والخصومات...'}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompetitorPricingTab;
