import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Zap,
  AlertTriangle,
  Scale,
  Lightbulb,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CompetitorFormData, ComparisonItem, DevIdea } from './types';

interface CompetitorComparisonTabProps {
  formData: CompetitorFormData;
  handleInputChange: (field: keyof CompetitorFormData, value: string) => void;
  comparisons: ComparisonItem[];
  handleAddComparison: () => void;
  handleUpdateComparison: (id: string, field: keyof ComparisonItem, value: string) => void;
  handleRemoveComparison: (id: string) => void;
  handleMoveComparison: (index: number, direction: 'up' | 'down') => void;
  devIdeas: DevIdea[];
  handleAddDevIdea: () => void;
  handleUpdateDevIdea: (id: string, field: keyof DevIdea, value: string) => void;
  handleRemoveDevIdea: (id: string) => void;
  handleMoveDevIdea: (index: number, direction: 'up' | 'down') => void;
  handleDevIdeaImageAdd: (ideaId: string, file: File) => void;
  handleDevIdeaImageRemove: (ideaId: string, index: number) => void;
}

export const CompetitorComparisonTab: React.FC<CompetitorComparisonTabProps> = ({
  formData,
  handleInputChange,
  comparisons,
  handleAddComparison,
  handleUpdateComparison,
  handleRemoveComparison,
  handleMoveComparison,
  devIdeas,
  handleAddDevIdea,
  handleUpdateDevIdea,
  handleRemoveDevIdea,
  handleMoveDevIdea,
  handleDevIdeaImageAdd,
  handleDevIdeaImageRemove,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Strengths */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap size={18} className="text-emerald-500" />
            {t('competitors.strengths')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.strengths}
            onChange={e => handleInputChange('strengths', e.target.value)}
            placeholder={t('competitors.strengthsPlaceholder')}
            rows={6}
          />
        </CardContent>
      </Card>

      {/* Weaknesses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-500" />
            {t('competitors.weaknesses')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.weaknesses}
            onChange={e => handleInputChange('weaknesses', e.target.value)}
            placeholder={t('competitors.weaknessesPlaceholder')}
            rows={6}
          />
        </CardContent>
      </Card>

      {/* Comparison Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle className="flex items-center gap-2">
              <Scale size={18} className="text-indigo-500" />
              {t('competitors.comparisonSection')}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleAddComparison}>
              <Plus size={14} /> {t('common.add') || 'إضافة'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {comparisons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {t('competitors.noComparisons') || 'لم تضف أي مقارنات بعد. أضف مقارنة جديدة.'}
            </div>
          ) : (
            comparisons.map((comp, i) => (
              <div key={comp.id} className="border rounded-lg p-4 dark:border-gray-700 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleMoveComparison(i, 'up')}
                      disabled={i === 0}
                      aria-label={t('common.moveUp') || 'Move up'}
                    >
                      <ChevronUp size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleMoveComparison(i, 'down')}
                      disabled={i === comparisons.length - 1}
                      aria-label={t('common.moveDown') || 'Move down'}
                    >
                      <ChevronDown size={14} />
                    </Button>
                    <span className="text-xs text-muted-foreground tabular-nums">#{i + 1}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleRemoveComparison(comp.id)}
                    aria-label={t('common.delete') || 'Delete comparison'}
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </Button>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('competitors.featureName') || 'اسم الميزة'}</Label>
                  <Input
                    value={comp.featureName}
                    onChange={e => handleUpdateComparison(comp.id, 'featureName', e.target.value)}
                    placeholder={t('competitors.featureNamePlaceholder') || 'مثال: سرعة التوصيل'}
                    size="sm"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('competitors.competitorDesc') || 'وصف المنافس'}</Label>
                    <Textarea
                      value={comp.competitorDesc}
                      onChange={e => handleUpdateComparison(comp.id, 'competitorDesc', e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('competitors.ourDesc') || 'وصفنا'}</Label>
                    <Textarea
                      value={comp.ourDesc}
                      onChange={e => handleUpdateComparison(comp.id, 'ourDesc', e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('competitors.easierToUse') || 'الأسهل استخداماً؟'}</Label>
                    <div className="flex gap-3">
                      {['competitor', 'us'].map(val => (
                        <label key={val} className="flex items-center gap-1.5 text-sm cursor-pointer">
                          <input
                            type="radio"
                            name={`easier_${comp.id}`}
                            checked={comp.easierToUse === val}
                            onChange={() => handleUpdateComparison(comp.id, 'easierToUse', val)}
                            className="accent-blue-600"
                          />
                          {val === 'competitor' ? t('competitors.competitor') : t('competitors.us')}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('competitors.stronger') || 'الأقوى؟'}</Label>
                    <div className="flex gap-3">
                      {['competitor', 'us'].map(val => (
                        <label key={val} className="flex items-center gap-1.5 text-sm cursor-pointer">
                          <input
                            type="radio"
                            name={`stronger_${comp.id}`}
                            checked={comp.stronger === val}
                            onChange={() => handleUpdateComparison(comp.id, 'stronger', val)}
                            className="accent-blue-600"
                          />
                          {val === 'competitor' ? t('competitors.competitor') : t('competitors.us')}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('competitors.additionalNotes') || 'ملاحظات إضافية'}</Label>
                  <Input
                    value={comp.notes}
                    onChange={e => handleUpdateComparison(comp.id, 'notes', e.target.value)}
                    placeholder={t('competitors.additionalNotesPlaceholder') || 'أي ملاحظات إضافية...'}
                    size="sm"
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Development Ideas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle className="flex items-center gap-2">
              <Lightbulb size={18} className="text-amber-500" />
              {t('competitors.devIdeas') || 'أفكار ومقترحات تطويرية'}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleAddDevIdea}>
              <Plus size={14} /> {t('common.add') || 'إضافة'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {devIdeas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {t('competitors.noDevIdeas') || 'لم تضف أي أفكار تطويرية بعد. أضف فكرة جديدة.'}
            </div>
          ) : (
            devIdeas.map((idea, i) => (
              <div key={idea.id} className="border rounded-lg p-4 dark:border-gray-700 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleMoveDevIdea(i, 'up')}
                      disabled={i === 0}
                      aria-label={t('common.moveUp') || 'Move up'}
                    >
                      <ChevronUp size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleMoveDevIdea(i, 'down')}
                      disabled={i === devIdeas.length - 1}
                      aria-label={t('common.moveDown') || 'Move down'}
                    >
                      <ChevronDown size={14} />
                    </Button>
                    <span className="text-xs text-muted-foreground tabular-nums">#{i + 1}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleRemoveDevIdea(idea.id)}
                    aria-label={t('common.delete') || 'Delete idea'}
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </Button>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('competitors.ideaTitle') || 'عنوان الفكرة'}</Label>
                  <Input
                    value={idea.title}
                    onChange={e => handleUpdateDevIdea(idea.id, 'title', e.target.value)}
                    placeholder={t('competitors.ideaTitlePlaceholder') || 'عنوان الفكرة التطويرية'}
                    size="sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('competitors.ideaDescription') || 'وصف الفكرة'}</Label>
                  <Textarea
                    value={idea.description}
                    onChange={e => handleUpdateDevIdea(idea.id, 'description', e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('competitors.ideaImages') || 'صور توضيحية'}</Label>
                  <div className="flex flex-wrap gap-2">
                    {idea.images.map((imgData, imgIdx) => (
                      <div key={imgIdx} className="relative size-16 rounded-lg overflow-hidden border group">
                        <img src={imgData} alt="" className="size-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleDevIdeaImageRemove(idea.id, imgIdx)}
                          className="absolute top-0.5 right-0.5 size-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={t('common.delete') || 'Delete image'}
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                    <label className="size-16 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                      <Plus size={16} className="text-muted-foreground" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleDevIdeaImageAdd(idea.id, file);
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompetitorComparisonTab;
