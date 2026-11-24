import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  BarChart2,
  TrendingUp,
  Scale,
  History,
  Settings,
  Instagram,
  Share2,
  Crosshair,
  Lightbulb,
  Plus,
  Pencil,
  X,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  Tag,
  DollarSign,
  Cpu,
  Trash2,
  Globe,
  Package,
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import CompetitorStatusBar, { type CompetitorStatus } from './CompetitorStatusBar';
import { updateCompetitorStatus, useCompetitorStatusSync } from './useCompetitorStatus';
import CompetitorFeatures from './CompetitorFeatures';
import { getLocalizedDateTime } from '../../utils/localization';
import i18n from '../../i18n';

interface CompetitorProduct {
  id: string;
  name: string;
  price: number | null;
  comparePrice: number | null;
  currency: string;
  image: string | null;
  url: string | null;
  sku: string | null;
  isAvailable: boolean;
  category: string | null;
  description: string | null;
  lastSeen: string;
}

interface CompetitorAd {
  id: string;
  platform: string;
  copy: string | null;
  headline: string | null;
  cta: string | null;
  creativeUrl: string | null;
  status: string;
  lastSeen: string;
}

interface CompetitorReport {
  id: string;
  type: string;
  title: string;
  summary: string;
  generatedAt: string;
}

interface DevTask {
  id: string;
  title: string;
  description: string | null;
  status: string;
  targetDate: string | null;
  createdAt: string;
}

interface DevRecommendation {
  id: string;
  tasks: DevTask[];
}

interface SocialProfile {
  id: string;
  platform: string;
  profileUrl: string | null;
  username: string | null;
  followersCount: number;
  updatedAt?: string;
  lastScrapeAt?: string;
}

const CompetitorDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<string>('overview');
  const [competitor, setCompetitor] = useState<any>(null);
  const [products, setProducts] = useState<CompetitorProduct[]>([]);
  const [ads, setAds] = useState<CompetitorAd[]>([]);
  const [reports, setReports] = useState<CompetitorReport[]>([]);
  const [socialProfiles, setSocialProfiles] = useState<SocialProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanningTech, setIsScanningTech] = useState(false);
  const [devRec, setDevRec] = useState<DevRecommendation | null>(null);
  const [newTaskText, setNewTaskText] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<DevTask | null>(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', status: 'not_started', targetDate: '' });
  const [taskError, setTaskError] = useState('');

  // Social Modal State
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [socialForm, setSocialForm] = useState({ platform: 'instagram', profileUrl: '', username: '' });
  const [socialLoading, setSocialLoading] = useState(false);

  // New Package / Product Modal State
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [packageForm, setPackageForm] = useState({ name: '', price: '', currency: 'EGP', category: 'باقة', description: '', cycle: 'monthly' });
  const [packageLoading, setPackageLoading] = useState(false);
  const [productsSubTab, setProductsSubTab] = useState<'packages' | 'all'>('packages');

  const handleStatusChange = useCallback(async (newStatus: string) => {
    if (!id) return;
    const prevStatus = competitor?.status;
    setCompetitor((existing: any) => existing ? { ...existing, status: newStatus } : existing);
    const ok = await updateCompetitorStatus(id, newStatus as any);
    if (!ok && prevStatus) {
      setCompetitor((existing: any) => existing ? { ...existing, status: prevStatus } : existing);
    }
  }, [id, competitor?.status]);

  useCompetitorStatusSync((competitorId, status) => {
    if (competitorId === id && competitor) {
      setCompetitor((existing: any) => existing ? { ...existing, status } : existing);
    }
  });

  const fetchData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await apiClient.get(`/competitors/${id}`);
      if (res.data.success) {
        setCompetitor(res.data.data);
        setProducts(res.data.data.products || []);
        setAds(res.data.data.ads || []);
        setReports(res.data.data.reports || []);
        setSocialProfiles(res.data.data.socialProfiles || []);
      }
    } catch {
      console.error('Failed to fetch competitor');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSocialProfiles = async () => {
    if (!id) return;
    try {
      const res = await apiClient.get(`/competitors/social/profiles/${id}`);
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setSocialProfiles(list);
    } catch {
      // fallback
    }
  };

  const fetchDevRecommendations = async () => {
    if (!id) return;
    try {
      const res = await apiClient.get(`/competitors/${id}/dev-recommendations`);
      if (res.data.success) {
        setDevRec(res.data.data);
      }
    } catch {
      console.error('Failed to fetch dev recommendations');
    }
  };

  useEffect(() => { fetchData(); }, [id]);
  useEffect(() => { if (id) fetchDevRecommendations(); }, [id]);

  // Scan Tech handler
  const handleScanTech = async () => {
    if (!id) return;
    setIsScanningTech(true);
    try {
      const res = await apiClient.post(`/competitors/${id}/scan-tech`);
      if (res.data?.success && res.data?.data) {
        setCompetitor((prev: any) => ({
          ...prev,
          metadata: {
            ...(prev?.metadata || {}),
            tech: res.data.data.tech,
            tech_scanned: res.data.data.tech_scanned,
          },
        }));
      }
    } catch {
      console.error('Failed to scan tech');
    } finally {
      setIsScanningTech(false);
    }
  };

  // Social CRUD handlers
  const handleSaveSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !socialForm.profileUrl) return;
    setSocialLoading(true);
    try {
      const handle = socialForm.username || socialForm.profileUrl.rstrip?.('/')?.split('/')?.pop() || '';
      await apiClient.post(`/competitors/social/profile/${id}/${socialForm.platform}`, {
        profileUrl: socialForm.profileUrl,
        url: socialForm.profileUrl,
        username: handle,
        handle,
      });
      setShowSocialModal(false);
      setSocialForm({ platform: 'instagram', profileUrl: '', username: '' });
      await fetchData();
      await fetchSocialProfiles();
    } catch {
      console.error('Failed to save social profile');
    } finally {
      setSocialLoading(false);
    }
  };

  const handleDeleteSocial = async (platform: string) => {
    if (!id || !window.confirm(`هل أنت متأكد من حذف بروفايل ${platform}؟`)) return;
    try {
      await apiClient.delete(`/competitors/social/profile/${id}/${platform}`);
      setSocialProfiles(prev => prev.filter(p => p.platform !== platform));
      await fetchData();
    } catch {
      console.error('Failed to delete social profile');
    }
  };

  // Add Package / Product handler
  const [isSyncingAds, setIsSyncingAds] = useState(false);
  const handleSyncCreatives = async () => {
    if (!id) return;
    setIsSyncingAds(true);
    try {
      await apiClient.post(`/competitors/${id}/ads/sync-creatives`);
      await fetchData();
    } catch {
      console.error('Failed to sync creatives');
    } finally {
      setIsSyncingAds(false);
    }
  };
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !packageForm.name) return;
    setPackageLoading(true);
    try {
      const payload = {
        name: packageForm.name,
        price: packageForm.price ? parseFloat(packageForm.price) : null,
        currency: packageForm.currency,
        category: packageForm.category,
        description: packageForm.description,
        metadata: { cycle: packageForm.cycle },
      };
      await apiClient.post(`/competitors/${id}/products`, payload);
      setShowPackageModal(false);
      setPackageForm({ name: '', price: '', currency: 'EGP', category: 'باقة', description: '', cycle: 'monthly' });
      await fetchData();
    } catch {
      console.error('Failed to add package');
    } finally {
      setPackageLoading(false);
    }
  };

  // Profile Completion Calculation (0–100%)
  const profileCompletion = useMemo(() => {
    if (!competitor) return { score: 0, missing: [] };
    let score = 0;
    const missing: string[] = [];

    // 1. Basic Info
    if (competitor.name) score += 5;
    if (competitor.url) score += 10;
    else missing.push('رابط الموقع الإلكتروني');

    if (competitor.description || competitor.notes) score += 10;
    else missing.push('الوصف ونبذة النشاط');

    if (competitor.targetMarket || competitor.activityType) score += 10;
    else missing.push('السوق المستهدف ونوع النشاط');

    if (competitor.strengths || competitor.weaknesses) score += 5;

    // 2. Tech stack (20%)
    const meta = competitor.metadata || {};
    const techList = Array.isArray(meta.tech) ? meta.tech : [];
    if (techList.length > 0) score += 20;
    else missing.push('التقنيات المستخدمة (metadata.tech)');

    // 3. Social profiles (15%)
    const socials = socialProfiles.length > 0 ? socialProfiles : (competitor.socialProfiles || []);
    if (socials.length > 0) score += 15;
    else missing.push('حسابات التواصل الاجتماعي');

    // 4. Packages (25% for >=2 packages, 15% for 1 package)
    const pkgs = products.filter(p => p.category === 'باقة');
    if (pkgs.length >= 2) {
      score += 25;
    } else if (pkgs.length === 1) {
      score += 15;
      missing.push('باقة أسعار إضافية (الحد الأدنى باقتان)');
    } else {
      missing.push('باقات الأسعار (الحد الأدنى باقتان)');
    }

    return { score: Math.min(100, score), missing };
  }, [competitor, products, socialProfiles]);

  const handleAddTask = () => {
    const text = newTaskText.trim();
    if (!text || !id) return;
    apiClient.post(`/competitors/${id}/dev-tasks`, { title: text, status: 'not_started' }).then(res => {
      if (res.data.success) {
        setNewTaskText('');
        fetchDevRecommendations();
      }
    }).catch(() => {});
  };

  const handleToggleTask = (task: DevTask) => {
    if (!id) return;
    apiClient.put(`/competitors/${id}/dev-tasks/${task.id}/toggle`).then(res => {
      if (res.data.success) {
        setDevRec(prev => prev ? {
          ...prev,
          tasks: prev.tasks.map(t => t.id === task.id ? { ...t, status: res.data.data.status } : t),
        } : prev);
      }
    }).catch(() => {});
  };

  const openAddTask = () => {
    setEditingTask(null);
    setTaskForm({ title: '', description: '', status: 'not_started', targetDate: '' });
    setTaskError('');
    setShowTaskModal(true);
  };

  const openEditTask = (task: DevTask) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      targetDate: '',
    });
    setTaskError('');
    setShowTaskModal(true);
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) {
      setTaskError(t('competitors.devRecommendations.titleRequired'));
      return;
    }
    try {
      if (editingTask) {
        await apiClient.put(`/competitors/${id}/dev-tasks/${editingTask.id}`, taskForm);
      } else {
        await apiClient.post(`/competitors/${id}/dev-tasks`, taskForm);
      }
      setShowTaskModal(false);
      fetchDevRecommendations();
    } catch {
      setTaskError(editingTask ? t('competitors.errors.updateTaskFailed') : t('competitors.errors.createTaskFailed'));
    }
  };

  const generateReport = async (type: string) => {
    if (!id) return;
    try {
      await apiClient.post(`/competitors/${id}/reports/generate`, { type });
      fetchData();
    } catch {
      console.error('Failed to generate report');
    }
  };

  const getTaskStats = () => {
    if (!devRec?.tasks?.length) return { total: 0, notStarted: 0, inProgress: 0, completed: 0 };
    const tasks = devRec.tasks;
    return {
      total: tasks.length,
      notStarted: tasks.filter(t => t.status === 'not_started').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
    };
  };

  if (isLoading) {
    return <div className="p-6 text-center text-gray-500">{t('common.loading')}</div>;
  }

  if (!competitor) {
    return <div className="p-6 text-center text-gray-500">{t('common.no_data')}</div>;
  }

  const tabs = [
    { key: 'overview', label: t('competitors.overview') },
    { key: 'products', label: t('competitors.productsTab'), icon: <Package size={14} /> },
    { key: 'social', label: t('competitors.social.overview'), icon: <Instagram size={14} /> },
    { key: 'ads', label: t('competitors.ads.overview'), icon: <Share2 size={14} /> },
    { key: 'features', label: t('competitors.features.title'), icon: <Lightbulb size={14} /> },
    { key: 'platforms', label: 'التقنيات والمنصة', icon: <Cpu size={14} /> },
    { key: 'reports', label: t('competitors.reportsTab') },
  ] as const;

  const taskStats = getTaskStats();
  const techList: string[] = competitor?.metadata?.tech || [];
  const packagesList = products.filter(p => p.category === 'باقة');

  return (
    <div className="p-4 sm:p-6 space-y-4" dir={i18n.dir()}>
      {/* Top Header */}
      <div className="flex items-start gap-3">
        <button onClick={() => navigate('/competitors')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 mt-1 cursor-pointer">
          {i18n.dir() === 'rtl' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">{competitor.name}</h1>
            {competitor.url && (
              <a href={competitor.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1 text-sm font-mono">
                <ExternalLink size={14} />
                {competitor.url.replace(/^https?:\/\//, '').slice(0, 40)}
              </a>
            )}
          </div>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Tag size={14} className="shrink-0" />
              <span>{t('competitors.status')}:</span>
            </div>
            <CompetitorStatusBar
              currentStatus={competitor.status}
              competitorId={id}
              onChange={handleStatusChange}
              size="md"
            />
          </div>
          {competitor.createdAt && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <Calendar size={12} className="shrink-0" />
              <span>{t('competitors.createdAtLabel')}: </span>
              <span dir="ltr" className="inline-block whitespace-nowrap">{getLocalizedDateTime(competitor.createdAt)}</span>
            </p>
          )}
        </div>
        <button onClick={() => { fetchData(); fetchDevRecommendations(); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ltr:ml-auto rtl:mr-auto mt-1 shrink-0 cursor-pointer">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Profile Completion Meter (0–100%) */}
      <div className="bg-card border border-border/70 rounded-xl p-3.5 sm:p-4 space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">مؤشر اكتمال البروفايل:</span>
            <span className={`font-mono font-bold text-sm tabular-nums ${profileCompletion.score >= 80 ? 'text-emerald-500' : profileCompletion.score >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
              {profileCompletion.score}%
            </span>
          </div>
          {profileCompletion.score >= 80 ? (
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={13} /> مكتمل وجاهز للتقارير الشاملة
            </span>
          ) : (
            <span className="text-[11px] text-muted-foreground">
              ناقص {profileCompletion.missing.length} حقول رئيسية
            </span>
          )}
        </div>
        <div className="w-full bg-muted/40 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${profileCompletion.score >= 80 ? 'bg-emerald-500' : profileCompletion.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
            style={{ width: `${profileCompletion.score}%` }}
          />
        </div>
        {profileCompletion.missing.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
            <span className="text-muted-foreground font-medium">حقول موصى باستكمالها:</span>
            {profileCompletion.missing.map((m, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-muted/40 border border-border/60 text-muted-foreground font-medium">
                {m}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stat Badges */}
      <div className="flex flex-wrap items-center gap-2">
        {competitor._count && (
          <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-500 flex-wrap">
            <span className="bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-full text-foreground">
              {competitor._count.products} {t('competitors.products')}
            </span>
            <span className="bg-green-50 dark:bg-green-900/30 px-2.5 py-1 rounded-full text-foreground">
              {competitor._count.ads} {t('competitors.adsTab')}
            </span>
            <span className="bg-purple-50 dark:bg-purple-900/30 px-2.5 py-1 rounded-full text-foreground">
              {competitor._count.reports} {t('competitors.reports')}
            </span>
          </div>
        )}
        <div className="flex items-center gap-1.5 flex-wrap ltr:ml-auto rtl:mr-auto">
          <button onClick={() => navigate(`/competitors/${id}/price-compare`)} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs border rounded-lg hover:bg-muted transition-colors cursor-pointer" title={t('competitors.comparison')}>
            <Scale size={13} className="shrink-0" /> <span>{t('competitors.comparison')}</span>
          </button>
          <button onClick={() => navigate('/competitors/reports')} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs border rounded-lg hover:bg-muted transition-colors cursor-pointer" title="أرشيف التقارير">
            <BarChart2 size={13} className="shrink-0" /> <span>التقارير</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex gap-1 border-b overflow-x-auto scrollbar-none">
        {tabs.map(tabItem => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key)}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              tab === tabItem.key
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {tab === 'overview' && (
        <div className="space-y-4">
          {/* Tech Stack Card in Overview */}
          <div className="border border-border/70 rounded-xl p-4 bg-card space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu size={16} className="text-primary" />
                <h3 className="font-semibold text-sm text-foreground">التقنيات المكتشفة (Tech Stack)</h3>
              </div>
              <div className="flex items-center gap-2">
                {competitor.metadata?.tech_scanned && (
                  <span className="text-[10px] font-mono text-muted-foreground">
                    آخر فحص: {competitor.metadata.tech_scanned}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleScanTech}
                  disabled={isScanningTech}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                  title="إعادة فحص تقنيات الموقع الحي الآن"
                >
                  <RefreshCw size={11} className={isScanningTech ? 'animate-spin' : ''} />
                  <span>افحص تاني</span>
                </button>
              </div>
            </div>
            {techList.length === 0 ? (
              <p className="text-xs text-muted-foreground py-1">
                لم يتم رصد تقنيات بعد. اضغط «افحص تاني» لفحص الموقع واكتشاف الأطر والمكتبات البرمجية المستخدمة.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {techList.map((tech, i) => (
                  <span
                    key={i}
                    className="text-xs font-mono font-medium px-2.5 py-1 rounded-lg bg-muted/40 border border-border/60 text-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>

          {competitor.description && (
            <div className="border border-border/70 rounded-xl p-4 bg-card space-y-1">
              <h3 className="font-semibold text-sm mb-1">{t('competitors.description')}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{competitor.description}</p>
            </div>
          )}

          {competitor.notes && (
            <div className="border border-border/70 rounded-xl p-4 bg-card space-y-1">
              <h3 className="font-semibold text-sm mb-1">{t('competitors.notes')}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{competitor.notes}</p>
            </div>
          )}

          {/* Structured Pricing Card */}
          <div className="border border-border/70 rounded-xl p-4 bg-card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <DollarSign size={16} className="text-emerald-500" />
                <span>هيكل الأسعار والباقات (Structured Pricing)</span>
              </h3>
              {competitor?.structuredPricing?.cycle && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-semibold">
                  {competitor.structuredPricing.cycle === 'yearly'
                    ? 'سنوي'
                    : competitor.structuredPricing.cycle === 'one_time'
                    ? 'دفعة واحدة'
                    : 'شهري'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/20 border border-border/60">
                <div className="text-[11px] text-muted-foreground">السعر الأساسي / الباقة</div>
                <div className="text-base font-bold font-mono tabular-nums text-foreground mt-0.5">
                  {competitor?.structuredPricing?.price != null
                    ? `${Number(competitor.structuredPricing.price).toFixed(2)} ${competitor.structuredPricing.currency || 'EGP'}`
                    : competitor?.monthlyPrice
                    ? `${Number(competitor.monthlyPrice).toFixed(2)} EGP`
                    : 'غير محدد'}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/20 border border-border/60">
                <div className="text-[11px] text-muted-foreground">الاشتراك السنوي</div>
                <div className="text-base font-bold font-mono tabular-nums text-foreground mt-0.5">
                  {competitor?.yearlyPrice
                    ? `${Number(competitor.yearlyPrice).toFixed(2)} ${competitor?.structuredPricing?.currency || 'EGP'}`
                    : 'غير محدد'}
                </div>
              </div>
            </div>

            {(competitor?.pricingNotes || competitor?.structuredPricing?.notes) && (
              <div className="text-xs text-muted-foreground leading-relaxed p-2.5 rounded bg-muted/10 border border-border/40">
                <span className="font-semibold text-foreground">ملاحظات التسعير: </span>
                {competitor.pricingNotes || competitor.structuredPricing?.notes}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Products & Packages */}
      {tab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center bg-muted/30 border border-border/70 rounded-lg p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setProductsSubTab('packages')}
                className={`px-3 py-1.5 rounded-md font-medium cursor-pointer transition-all ${
                  productsSubTab === 'packages' ? 'bg-primary text-primary-foreground shadow-xs font-bold' : 'text-muted-foreground'
                }`}
              >
                باقات الأسعار ({packagesList.length})
              </button>
              <button
                type="button"
                onClick={() => setProductsSubTab('all')}
                className={`px-3 py-1.5 rounded-md font-medium cursor-pointer transition-all ${
                  productsSubTab === 'all' ? 'bg-primary text-primary-foreground shadow-xs font-bold' : 'text-muted-foreground'
                }`}
              >
                كافة المنتجات ({products.length})
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowPackageModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium cursor-pointer"
            >
              <Plus size={13} />
              <span>إضافة باقة / منتج</span>
            </button>
          </div>

          {productsSubTab === 'packages' ? (
            packagesList.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-xl bg-card space-y-2 p-6">
                <Package size={32} className="mx-auto text-muted-foreground/40 mb-1" />
                <h4 className="text-sm font-bold text-foreground">لا توجد باقات مسجلة بعد</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  قم بإضافة باقات الاشتراك الخاصة بالمنافس لتدخل في المقارنات وتقارير السوق
                </p>
                <button
                  type="button"
                  onClick={() => setShowPackageModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium mt-2 cursor-pointer"
                >
                  <Plus size={13} />
                  <span>إضافة أول باقة</span>
                </button>
              </div>
            ) : (
              <div className="border border-border/70 rounded-xl overflow-hidden bg-card shadow-xs">
                <table className="w-full text-xs text-start">
                  <thead className="bg-muted/40 border-b border-border/70 text-muted-foreground">
                    <tr>
                      <th className="p-3 text-start font-semibold">اسم الباقة</th>
                      <th className="p-3 text-start font-semibold">السعر</th>
                      <th className="p-3 text-start font-semibold">دورة الدفع</th>
                      <th className="p-3 text-start font-semibold">الوصف / الملاحظات</th>
                      <th className="p-3 text-start font-semibold">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {packagesList.map(p => {
                      const cycle = (p as any).metadata?.cycle || 'شهري';
                      return (
                        <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                          <td className="p-3 font-semibold text-foreground">{p.name}</td>
                          <td className="p-3 font-mono font-bold text-primary tabular-nums">
                            {p.price ? `${Number(p.price).toFixed(2)} ${p.currency || 'EGP'}` : '-'}
                          </td>
                          <td className="p-3">
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-muted border border-border/60">
                              {cycle === 'yearly' ? 'سنوي' : 'شهري'}
                            </span>
                          </td>
                          <td className="p-3 text-muted-foreground line-clamp-2 max-w-xs">{p.description || '-'}</td>
                          <td className="p-3">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${p.isAvailable ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                              {p.isAvailable ? 'متاح' : 'غير متوفر'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {products.map(p => (
                <div key={p.id} className="border border-border/70 rounded-lg p-3 bg-card space-y-2">
                  <div className="flex gap-3">
                    {p.image && <img src={p.image} alt={p.name} className="w-16 h-16 rounded object-cover" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-semibold text-xs truncate text-foreground">{p.name}</h4>
                        {p.category === 'باقة' && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                            باقة
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold font-mono text-primary tabular-nums mt-0.5">
                        {p.price ? `${Number(p.price).toFixed(2)} ${p.currency}` : '-'}
                      </p>
                      {p.description && <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{p.description}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Social Profiles with full CRUD */}
      {tab === 'social' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">حسابات التواصل الاجتماعي ({socialProfiles.length})</h3>
              <p className="text-xs text-muted-foreground">روابط ومنصات التواصل المرصودة لهذا المنافس</p>
            </div>
            <button
              type="button"
              onClick={() => setShowSocialModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium cursor-pointer"
            >
              <Plus size={13} />
              <span>إضافة منصة</span>
            </button>
          </div>

          {socialProfiles.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-xl bg-card space-y-2 p-6">
              <Share2 size={32} className="mx-auto text-muted-foreground/40 mb-1" />
              <h4 className="text-sm font-bold text-foreground">لا توجد حسابات تواصل مسجلة</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                أضف روابط إنستجرام، فيسبوك، لينكدإن أو تيك توك لتتبع نشاط المنافس
              </p>
              <button
                type="button"
                onClick={() => setShowSocialModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium mt-2 cursor-pointer"
              >
                <Plus size={13} />
                <span>إضافة أول منصة</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {socialProfiles.map(sp => (
                <div key={sp.id || sp.platform} className="p-3.5 border border-border/70 rounded-xl bg-card space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold capitalize text-foreground px-2 py-0.5 rounded bg-muted">
                      {sp.platform}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteSocial(sp.platform)}
                      className="p-1 rounded text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="حذف المنصة"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {sp.profileUrl && (
                      <a
                        href={sp.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1 truncate font-mono"
                      >
                        <ExternalLink size={11} className="shrink-0" />
                        <span className="truncate">{sp.profileUrl}</span>
                      </a>
                    )}
                    {sp.username && (
                      <div className="text-[11px] text-muted-foreground font-mono">
                        المعرّف: @{sp.username}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Platforms & Tech Stack */}
      {tab === 'platforms' && (
        <div className="space-y-4">
          <div className="border border-border/70 rounded-xl p-4 bg-card space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                  <Cpu size={16} className="text-primary" />
                  <span>التقنيات والمنصات المستخدمة (metadata.tech)</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  رصد أطر العمل، خوادم الويب، منصات التجارة الإلكترونية، وأدوات التتبع
                </p>
              </div>
              <div className="flex items-center gap-2">
                {competitor.metadata?.tech_scanned && (
                  <span className="text-[10px] font-mono text-muted-foreground">
                    آخر فحص: {competitor.metadata.tech_scanned}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleScanTech}
                  disabled={isScanningTech}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={12} className={isScanningTech ? 'animate-spin' : ''} />
                  <span>افحص تاني</span>
                </button>
              </div>
            </div>

            {techList.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2 text-center border border-dashed rounded-lg p-4">
                لا توجد تقنيات مسجلة بعد. اضغط «افحص تاني» لتحليل موقع المنافس الحي واستخراج التقنيات.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-2">
                {techList.map((t, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted/30 border border-border/60 text-xs font-mono font-medium text-foreground">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Ads */}
      {tab === 'ads' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">الحملات الإعلانية المرصودة ({ads.length})</h3>
              <p className="text-xs text-muted-foreground">الكريتيف والصور الإعلانية المحفوظة محلياً</p>
            </div>
            <button
              type="button"
              onClick={handleSyncCreatives}
              disabled={isSyncingAds}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={12} className={isSyncingAds ? 'animate-spin' : ''} />
              <span>مزامنة صور الكريتف</span>
            </button>
          </div>

          {ads.length === 0 ? (
            <div className="border border-dashed border-border/70 rounded-xl p-6 text-center space-y-4 bg-card">
              <div className="max-w-md mx-auto space-y-2">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto">
                  <Share2 size={20} />
                </div>
                <h3 className="text-sm font-bold text-foreground">رصد إعلانات المنافس عبر Meta Ad Library</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  لم يتم تسجيل إعلانات بعد. يتم فحص الحملات الإعلانية على فيسبوك دورياً عبر رادار MaxP.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ads.map(a => (
                <div key={a.id} className="border border-border/70 rounded-xl p-3 bg-card space-y-2 shadow-xs">
                  {a.creativeUrl ? (
                    <div className="relative group rounded-lg overflow-hidden border border-border/50">
                      <img
                        src={a.creativeUrl}
                        alt={a.headline || 'ad creative'}
                        className="w-full h-44 object-cover rounded-lg bg-slate-900"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <a
                        href={a.creativeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={`creative-${a.id}.svg`}
                        className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-black/75 hover:bg-black text-white text-[10px] font-mono flex items-center gap-1 backdrop-blur-xs transition-opacity opacity-90 group-hover:opacity-100"
                      >
                        <span>تحميل</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  ) : (
                    <div className="w-full h-24 rounded-lg bg-muted/30 border border-dashed border-border/60 flex items-center justify-center text-xs text-muted-foreground font-mono">
                      <span>لا توجد صورة محفوظة</span>
                    </div>
                  )}
                  {a.headline && <h4 className="font-semibold text-xs text-foreground">{a.headline}</h4>}
                  {a.copy && <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{a.copy}</p>}
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono pt-1 border-t border-border/40">
                    <span className="uppercase">{a.platform}</span>
                    <span className={`font-semibold ${a.status === 'active' ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                      {a.status === 'active' ? 'نشط' : 'متوقف'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Features */}
      {tab === 'features' && (
        <div>
          <p className="text-xs text-muted-foreground mb-3">{t('competitors.features.derivedFrom')}</p>
          <CompetitorFeatures competitorId={id || ''} />
        </div>
      )}

      {/* Tab: Reports */}
      {tab === 'reports' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button onClick={() => generateReport('weekly')} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium cursor-pointer">
              {t('competitors.generateReport')} (أسبوعي)
            </button>
            <button onClick={() => generateReport('comprehensive')} className="px-3 py-1.5 border border-border/70 rounded-lg text-xs font-medium hover:bg-muted cursor-pointer">
              {t('competitors.generateReport')} (شامل)
            </button>
          </div>
          {reports.length === 0 ? (
            <div className="border border-dashed border-border/70 rounded-xl p-6 text-center space-y-2 bg-card">
              <p className="text-xs font-semibold text-foreground">لا توجد تقارير مولدة بعد</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {reports.map(r => (
                <div key={r.id} className="border border-border/70 rounded-xl p-3.5 bg-card space-y-1">
                  <h4 className="font-semibold text-xs text-foreground">{r.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{r.summary}</p>
                  <div className="text-[10px] text-muted-foreground font-mono pt-1">
                    {new Date(r.generatedAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Social Modal */}
      {showSocialModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowSocialModal(false)}>
          <div className="bg-card border border-border/70 rounded-xl p-5 w-full max-w-sm space-y-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">إضافة منصة تواصل للمنافس</h3>
              <button onClick={() => setShowSocialModal(false)} className="p-1 rounded hover:bg-muted cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveSocial} className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">المنصة</label>
                <select
                  value={socialForm.platform}
                  onChange={e => setSocialForm(p => ({ ...p, platform: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-border/70 rounded-lg bg-card text-xs"
                >
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="tiktok">TikTok</option>
                  <option value="twitter">Twitter / X</option>
                  <option value="youtube">YouTube</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">رابط البروفايل *</label>
                <input
                  type="url"
                  value={socialForm.profileUrl}
                  onChange={e => setSocialForm(p => ({ ...p, profileUrl: e.target.value }))}
                  placeholder="https://instagram.com/competitor"
                  className="w-full px-3 py-1.5 border border-border/70 rounded-lg bg-card text-xs font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">اسم المعرّف (Handle)</label>
                <input
                  type="text"
                  value={socialForm.username}
                  onChange={e => setSocialForm(p => ({ ...p, username: e.target.value }))}
                  placeholder="competitor_handle"
                  className="w-full px-3 py-1.5 border border-border/70 rounded-lg bg-card text-xs font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                <button type="button" onClick={() => setShowSocialModal(false)} className="px-3 py-1.5 border border-border/70 rounded-lg text-xs cursor-pointer">
                  إلغاء
                </button>
                <button type="submit" disabled={socialLoading} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium cursor-pointer disabled:opacity-50">
                  {socialLoading ? 'جاري الحفظ...' : 'حفظ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Package Modal */}
      {showPackageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPackageModal(false)}>
          <div className="bg-card border border-border/70 rounded-xl p-5 w-full max-w-sm space-y-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">إضافة باقة / منتج جديد</h3>
              <button onClick={() => setShowPackageModal(false)} className="p-1 rounded hover:bg-muted cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSavePackage} className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">النوع</label>
                <select
                  value={packageForm.category}
                  onChange={e => setPackageForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-border/70 rounded-lg bg-card text-xs"
                >
                  <option value="باقة">باقة اشتراك (Package)</option>
                  <option value="منتج">منتج عادي</option>
                  <option value="خدمة">خدمة</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">اسم الباقة / المنتج *</label>
                <input
                  type="text"
                  value={packageForm.name}
                  onChange={e => setPackageForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="مثال: الباقة الاحترافية"
                  className="w-full px-3 py-1.5 border border-border/70 rounded-lg bg-card text-xs"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium mb-1">السعر</label>
                  <input
                    type="number"
                    value={packageForm.price}
                    onChange={e => setPackageForm(p => ({ ...p, price: e.target.value }))}
                    placeholder="1500"
                    className="w-full px-3 py-1.5 border border-border/70 rounded-lg bg-card text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">دورة الدفع</label>
                  <select
                    value={packageForm.cycle}
                    onChange={e => setPackageForm(p => ({ ...p, cycle: e.target.value }))}
                    className="w-full px-3 py-1.5 border border-border/70 rounded-lg bg-card text-xs"
                  >
                    <option value="monthly">شهري</option>
                    <option value="yearly">سنوي</option>
                    <option value="one_time">دفعة واحدة</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">الوصف</label>
                <textarea
                  value={packageForm.description}
                  onChange={e => setPackageForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="تفاصيل ومزايا الباقة..."
                  className="w-full px-3 py-1.5 border border-border/70 rounded-lg bg-card text-xs"
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                <button type="button" onClick={() => setShowPackageModal(false)} className="px-3 py-1.5 border border-border/70 rounded-lg text-xs cursor-pointer">
                  إلغاء
                </button>
                <button type="submit" disabled={packageLoading} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium cursor-pointer disabled:opacity-50">
                  {packageLoading ? 'جاري الحفظ...' : 'حفظ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitorDetail;
