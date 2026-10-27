import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Info,
  BarChart3,
  Zap,
  DollarSign,
  RefreshCw,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import CompetitorStatusBar, { type CompetitorStatus } from './CompetitorStatusBar';
import { updateCompetitorStatus } from './useCompetitorStatus';
import i18n from '../../i18n';
import {
  useCompetitorAddForm,
  CompetitorGeneralTab,
  CompetitorMediaTab,
  CompetitorComparisonTab,
  CompetitorPricingTab,
} from './competitor-add';

const CompetitorAdd: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');

  const {
    id,
    isEdit,
    isLoading,
    isSaving,
    formData,
    setFormData,
    formErrors,
    activeSocialIndex,
    setActiveSocialIndex,
    socialProfiles,
    activityImages,
    featureImages,
    mediaNotes,
    mediaNoteInput,
    setMediaNoteInput,
    editingNoteId,
    editingNoteText,
    setEditingNoteText,
    comparisons,
    devIdeas,
    handleInputChange,
    handleSocialChange,
    handleAddImage,
    handleRemoveImage,
    handleMoveImage,
    handleAddMediaNote,
    handleRemoveMediaNote,
    handleStartEditNote,
    handleSaveEditNote,
    handleCancelEditNote,
    handleAddComparison,
    handleUpdateComparison,
    handleRemoveComparison,
    handleMoveComparison,
    handleAddDevIdea,
    handleUpdateDevIdea,
    handleRemoveDevIdea,
    handleMoveDevIdea,
    handleDevIdeaImageAdd,
    handleDevIdeaImageRemove,
    handleSubmit,
  } = useCompetitorAddForm();

  if (isLoading) {
    return (
      <div className="p-6" dir={i18n.dir()}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const dir = i18n.dir();

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto" dir={dir}>
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(isEdit ? `/competitors/${id}` : '/competitors')}
          aria-label={t('common.back') || 'Back'}
        >
          {dir === 'rtl' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">
              {isEdit ? t('competitors.editCompetitor') : t('competitors.addCompetitor')}
            </h1>
            {isEdit && id && formData.status && (
              <CompetitorStatusBar
                currentStatus={formData.status as CompetitorStatus}
                competitorId={id}
                onChange={async newStatus => {
                  const ok = await updateCompetitorStatus(id, newStatus);
                  if (ok) setFormData(prev => ({ ...prev, status: newStatus }));
                }}
                size="md"
              />
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEdit ? t('competitors.editCompetitor') : t('competitors.addCompetitor')}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start mb-6 overflow-x-auto">
          <TabsTrigger value="general" className="gap-2">
            <Info size={16} />
            <span className="hidden sm:inline">{t('competitors.generalInfo') || 'المعلومات العامة'}</span>
          </TabsTrigger>
          <TabsTrigger value="media" className="gap-2">
            <BarChart3 size={16} />
            <span className="hidden sm:inline">{t('competitors.mediaAnalysis') || 'تحليل الميديا'}</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-2">
            <Zap size={16} />
            <span className="hidden sm:inline">{t('competitors.strengthsWeaknesses') || 'القوة والضعف'}</span>
          </TabsTrigger>
          <TabsTrigger value="pricing" className="gap-2">
            <DollarSign size={16} />
            <span className="hidden sm:inline">{t('competitors.pricing') || 'الأسعار'}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <CompetitorGeneralTab
            formData={formData}
            formErrors={formErrors}
            handleInputChange={handleInputChange}
            socialProfiles={socialProfiles}
            handleSocialChange={handleSocialChange}
            activeSocialIndex={activeSocialIndex}
            setActiveSocialIndex={setActiveSocialIndex}
            activityImages={activityImages}
            featureImages={featureImages}
            handleAddImage={handleAddImage}
            handleRemoveImage={handleRemoveImage}
            handleMoveImage={handleMoveImage}
          />
        </TabsContent>

        <TabsContent value="media">
          <CompetitorMediaTab
            dir={dir}
            formData={formData}
            handleInputChange={handleInputChange}
            mediaNotes={mediaNotes}
            mediaNoteInput={mediaNoteInput}
            setMediaNoteInput={setMediaNoteInput}
            editingNoteId={editingNoteId}
            editingNoteText={editingNoteText}
            setEditingNoteText={setEditingNoteText}
            handleAddMediaNote={handleAddMediaNote}
            handleRemoveMediaNote={handleRemoveMediaNote}
            handleStartEditNote={handleStartEditNote}
            handleSaveEditNote={handleSaveEditNote}
            handleCancelEditNote={handleCancelEditNote}
          />
        </TabsContent>

        <TabsContent value="features">
          <CompetitorComparisonTab
            formData={formData}
            handleInputChange={handleInputChange}
            comparisons={comparisons}
            handleAddComparison={handleAddComparison}
            handleUpdateComparison={handleUpdateComparison}
            handleRemoveComparison={handleRemoveComparison}
            handleMoveComparison={handleMoveComparison}
            devIdeas={devIdeas}
            handleAddDevIdea={handleAddDevIdea}
            handleUpdateDevIdea={handleUpdateDevIdea}
            handleRemoveDevIdea={handleRemoveDevIdea}
            handleMoveDevIdea={handleMoveDevIdea}
            handleDevIdeaImageAdd={handleDevIdeaImageAdd}
            handleDevIdeaImageRemove={handleDevIdeaImageRemove}
          />
        </TabsContent>

        <TabsContent value="pricing">
          <CompetitorPricingTab formData={formData} handleInputChange={handleInputChange} />
        </TabsContent>
      </Tabs>

      {/* Bottom actions */}
      <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t">
        <Button variant="outline" onClick={() => navigate(isEdit ? `/competitors/${id}` : '/competitors')}>
          {t('common.cancel')}
        </Button>
        <Button onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
          {isSaving ? t('common.saving') : isEdit ? t('common.save') : t('common.create')}
        </Button>
      </div>
    </div>
  );
};

export default CompetitorAdd;
