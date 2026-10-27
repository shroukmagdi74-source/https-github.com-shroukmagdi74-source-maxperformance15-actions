import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { apiClient } from '../../../services/apiClient';
import {
  SOCIAL_PLATFORMS,
  type SocialProfile,
  type MediaNoteItem,
  type ComparisonItem,
  type DevIdea,
  type ImageItem,
  type CompetitorFormData,
} from './types';
import { genId, toBase64 } from './competitorAddUtils';

const DEFAULT_FORM_DATA: CompetitorFormData = {
  name: '',
  websiteUrl: '',
  platform: 'manual',
  activityType: '',
  targetMarket: '',
  foundedYear: '',
  founderName: '',
  founderLink: '',
  country: '',
  city: '',
  trafficSource: '',
  strengths: '',
  weaknesses: '',
  price: '',
  currency: 'EGP',
  cycle: 'monthly',
  monthlyPrice: '',
  yearlyPrice: '',
  pricingNotes: '',
  status: '',
};

export const useCompetitorAddForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSocialIndex, setActiveSocialIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState<CompetitorFormData>(DEFAULT_FORM_DATA);
  const [socialProfiles, setSocialProfiles] = useState<SocialProfile[]>(
    SOCIAL_PLATFORMS.map(p => ({ platform: p.key, url: '' }))
  );
  const [activityImages, setActivityImages] = useState<ImageItem[]>([]);
  const [featureImages, setFeatureImages] = useState<ImageItem[]>([]);
  const [mediaNotes, setMediaNotes] = useState<MediaNoteItem[]>([]);
  const [mediaNoteInput, setMediaNoteInput] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [comparisons, setComparisons] = useState<ComparisonItem[]>([]);
  const [devIdeas, setDevIdeas] = useState<DevIdea[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const prefillName = searchParams.get('name');
    const prefillUrl = searchParams.get('url');
    const prefillActivityType = searchParams.get('activityType');
    if (prefillName || prefillUrl || prefillActivityType) {
      setFormData(prev => ({
        ...prev,
        ...(prefillName ? { name: prefillName } : {}),
        ...(prefillUrl ? { websiteUrl: prefillUrl } : {}),
        ...(prefillActivityType ? { activityType: prefillActivityType } : {}),
      }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isEdit || !id) return;
    setIsLoading(true);
    apiClient
      .get(`/competitors/${id}`)
      .then(res => {
        if (res.data?.success) {
          const c = res.data.data;
          const sp = c.structuredPricing || c.metadata?.structuredPricing || {};
          setFormData({
            name: c.name || '',
            websiteUrl: c.url || '',
            platform: c.platform || 'manual',
            activityType: c.activityType || '',
            targetMarket: c.targetMarket || '',
            foundedYear: c.foundedYear?.toString() || '',
            founderName: c.founderName || '',
            founderLink: c.founderLink || '',
            country: c.country || '',
            city: c.city || '',
            trafficSource: c.trafficSource || '',
            strengths: c.strengths || '',
            weaknesses: c.weaknesses || '',
            price: sp.price?.toString() || c.monthlyPrice?.toString() || '',
            currency: sp.currency || 'EGP',
            cycle: sp.cycle || 'monthly',
            monthlyPrice: c.monthlyPrice?.toString() || sp.monthlyPrice?.toString() || '',
            yearlyPrice: c.yearlyPrice?.toString() || sp.yearlyPrice?.toString() || '',
            pricingNotes: c.pricingNotes || sp.notes || '',
            status: c.status || 'NEW',
          });
          if (c.socialProfiles?.length) {
            const merged = SOCIAL_PLATFORMS.map(p => {
              const existing = c.socialProfiles.find((item: Record<string, unknown>) => item.platform === p.key);
              return existing
                ? { platform: p.key, url: (existing.profileUrl as string) || (existing.url as string) || '' }
                : { platform: p.key, url: '' };
            });
            setSocialProfiles(merged);
          }
          if (c.activityImages) {
            setActivityImages(c.activityImages.map((img: { imageUrl: string }) => ({ id: genId(), data: img.imageUrl })));
          }
          if (c.featureImages) {
            setFeatureImages(c.featureImages.map((img: { imageUrl: string }) => ({ id: genId(), data: img.imageUrl })));
          }
          if (c.mediaNotes) {
            setMediaNotes(c.mediaNotes.map((n: { note: string }) => ({ id: genId(), text: n.note })));
          }
          if (c.comparisons) {
            setComparisons(
              c.comparisons.map((cmp: Record<string, unknown>) => ({
                id: genId(),
                featureName: (cmp.featureName as string) || '',
                competitorDesc: (cmp.competitorDescription as string) || (cmp.competitorDesc as string) || '',
                ourDesc: (cmp.ourDescription as string) || (cmp.ourDesc as string) || '',
                easierToUse: (cmp.easiestToUse as string) || (cmp.easierToUse as string) || '',
                stronger: (cmp.stronger as string) || '',
                notes: (cmp.notes as string) || '',
              }))
            );
          }
          if (c.devIdeas) {
            setDevIdeas(
              c.devIdeas.map((idea: Record<string, unknown>) => ({
                id: genId(),
                title: (idea.title as string) || '',
                description: (idea.description as string) || '',
                images: ((idea.images as { imageUrl: string }[]) || []).map(img => img.imageUrl),
              }))
            );
          }
        }
      })
      .catch(() => {
        toast.error(t('common.error'));
        navigate('/competitors');
      })
      .finally(() => setIsLoading(false));
  }, [id, isEdit, navigate, t]);

  const handleInputChange = useCallback((field: keyof CompetitorFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFormErrors(prev => {
      if (!prev[field]) return prev;
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  }, []);

  const handleSocialChange = useCallback((index: number, field: keyof SocialProfile, value: string) => {
    setSocialProfiles(prev => prev.map((sp, i) => (i === index ? { ...sp, [field]: value } : sp)));
  }, []);

  const handleAddImage = useCallback(async (list: 'activity' | 'feature', file: File) => {
    const data = await toBase64(file);
    const item: ImageItem = { id: genId(), data, file };
    if (list === 'activity') setActivityImages(prev => [...prev, item]);
    else setFeatureImages(prev => [...prev, item]);
  }, []);

  const handleRemoveImage = useCallback((list: 'activity' | 'feature', imageId: string) => {
    if (list === 'activity') setActivityImages(prev => prev.filter(img => img.id !== imageId));
    else setFeatureImages(prev => prev.filter(img => img.id !== imageId));
  }, []);

  const handleMoveImage = useCallback((list: 'activity' | 'feature', index: number, direction: 'up' | 'down') => {
    const setter = list === 'activity' ? setActivityImages : setFeatureImages;
    setter(prev => {
      const arr = [...prev];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= arr.length) return arr;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
  }, []);

  const handleAddMediaNote = useCallback(() => {
    const text = mediaNoteInput.trim();
    if (!text) return;
    setMediaNotes(prev => [...prev, { id: genId(), text }]);
    setMediaNoteInput('');
  }, [mediaNoteInput]);

  const handleRemoveMediaNote = useCallback((noteId: string) => {
    setMediaNotes(prev => prev.filter(n => n.id !== noteId));
  }, []);

  const handleStartEditNote = useCallback((noteId: string, text: string) => {
    setEditingNoteId(noteId);
    setEditingNoteText(text);
  }, []);

  const handleSaveEditNote = useCallback((noteId: string) => {
    setMediaNotes(prev => prev.map(n => (n.id === noteId ? { ...n, text: editingNoteText } : n)));
    setEditingNoteId(null);
    setEditingNoteText('');
  }, [editingNoteText]);

  const handleCancelEditNote = useCallback(() => {
    setEditingNoteId(null);
    setEditingNoteText('');
  }, []);

  const handleAddComparison = useCallback(() => {
    setComparisons(prev => [
      ...prev,
      {
        id: genId(),
        featureName: '',
        competitorDesc: '',
        ourDesc: '',
        easierToUse: '',
        stronger: '',
        notes: '',
      },
    ]);
  }, []);

  const handleUpdateComparison = useCallback((comparisonId: string, field: keyof ComparisonItem, value: string) => {
    setComparisons(prev => prev.map(c => (c.id === comparisonId ? { ...c, [field]: value } : c)));
  }, []);

  const handleRemoveComparison = useCallback((comparisonId: string) => {
    setComparisons(prev => prev.filter(c => c.id !== comparisonId));
  }, []);

  const handleMoveComparison = useCallback((index: number, direction: 'up' | 'down') => {
    setComparisons(prev => {
      const arr = [...prev];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= arr.length) return arr;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
  }, []);

  const handleAddDevIdea = useCallback(() => {
    setDevIdeas(prev => [...prev, { id: genId(), title: '', description: '', images: [] }]);
  }, []);

  const handleUpdateDevIdea = useCallback((ideaId: string, field: keyof DevIdea, value: string) => {
    setDevIdeas(prev => prev.map(d => (d.id === ideaId ? { ...d, [field]: value } : d)));
  }, []);

  const handleRemoveDevIdea = useCallback((ideaId: string) => {
    setDevIdeas(prev => prev.filter(d => d.id !== ideaId));
  }, []);

  const handleMoveDevIdea = useCallback((index: number, direction: 'up' | 'down') => {
    setDevIdeas(prev => {
      const arr = [...prev];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= arr.length) return arr;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
  }, []);

  const handleDevIdeaImageAdd = useCallback(async (ideaId: string, file: File) => {
    const data = await toBase64(file);
    setDevIdeas(prev => prev.map(d => (d.id === ideaId ? { ...d, images: [...d.images, data] } : d)));
  }, []);

  const handleDevIdeaImageRemove = useCallback((ideaId: string, index: number) => {
    setDevIdeas(prev =>
      prev.map(d => (d.id === ideaId ? { ...d, images: d.images.filter((_, i) => i !== index) } : d))
    );
  }, []);

  const validate = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = t('competitors.errors.nameRequired') || 'هذا الحقل مطلوب';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData.name, t]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    setIsSaving(true);
    const payload: Record<string, unknown> = {
      ...formData,
      url: formData.websiteUrl,
      socialProfiles: socialProfiles.filter(sp => sp.url),
      activityImages: activityImages.map(img => img.data),
      featureImages: featureImages.map(img => img.data),
      mediaNotes: mediaNotes.map(n => n.text),
      comparisons,
      devIdeas,
    };
    delete payload.websiteUrl;
    try {
      if (isEdit && id) {
        await apiClient.put(`/competitors/${id}`, payload);
        toast.success(t('competitors.updateSuccess'));
        navigate(`/competitors/${id}`);
      } else {
        const res = await apiClient.post('/competitors', payload);
        toast.success(t('competitors.createSuccess'));
        const newId = res.data?.data?.id || res.data?.id;
        navigate(newId ? `/competitors/${newId}` : '/competitors');
      }
    } catch {
      toast.error(t('common.error'));
    } finally {
      setIsSaving(false);
    }
  }, [
    validate,
    formData,
    socialProfiles,
    activityImages,
    featureImages,
    mediaNotes,
    comparisons,
    devIdeas,
    isEdit,
    id,
    t,
    navigate,
  ]);

  return {
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
  };
};

export default useCompetitorAddForm;
