import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  TrendingUp,
  Eye,
  RefreshCw,
  Download,
  Megaphone,
  Package,
  Award,
  Share2,
  Cpu,
  History,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import CompetitorStatusBar, { type CompetitorStatus } from './CompetitorStatusBar';
import { updateCompetitorStatus } from './useCompetitorStatus';
import i18n from '../../i18n';

interface Report {
  id: string;
  type: string;
  title: string;
  summary: string;
  insights: any;
  data: any;
  periodStart: string | null;
  periodEnd: string | null;
  generatedAt: string;
  competitor: { id: string; name: string; status: CompetitorStatus };
}

type SectionKey = 'all' | 'ads' | 'products' | 'features' | 'social' | 'tech' | 'priceChanges';

export const Reports: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [isRegeneratingSingle, setIsRegeneratingSingle] = useState(false);
  const [isExporting, setIsExporting] = useState<'csv' | 'pdf' | null>(null);
  const [filter, setFilter] = useState<'all' | 'weekly' | 'comprehensive'>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [activeSection, setActiveSection] = useState<SectionKey>('all');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/competitors/reports/all?limit=100');
      if (res.data?.success) {
        const list = res.data.data || [];
        setReports(list);
        if (list.length > 0 && !selectedReport) {
          setSelectedReport(list[0]);
        } else if (selectedReport) {
          const updated = list.find((r: Report) => r.id === selectedReport.id);
          if (updated) setSelectedReport(updated);
        }
      }
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAll = async () => {
    setIsGeneratingAll(true);
    try {
      await apiClient.post('/competitors/reports/generate-all', { type: 'weekly' });
      await fetchReports();
    } catch {
      // fallback
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const handleRegenerateSingle = async (competitorId?: string) => {
    if (!competitorId) return;
    setIsRegeneratingSingle(true);
    try {
      const res = await apiClient.post(`/competitors/${competitorId}/reports/generate`, { type: 'weekly' });
      if (res.data?.success && res.data?.data) {
        setSelectedReport(res.data.data);
      }
      await fetchReports();
    } catch {
      // fallback
    } finally {
      setIsRegeneratingSingle(false);
    }
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    if (!selectedReport?.competitor?.id) return;
    setIsExporting(format);
    try {
      const endpoint = `/competitors/${selectedReport.competitor.id}/reports/${selectedReport.id}/export?format=${format}`;
      const response = await apiClient.get(endpoint, { responseType: 'blob' });
      const blob = new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : 'text/csv; charset=utf-8',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const compName = selectedReport.competitor.name ? selectedReport.competitor.name.replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '_') : 'competitor';
      link.setAttribute('download', `report-${compName}-${new Date().toISOString().slice(0, 10)}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      // fallback to window.print if pdf fails
      if (format === 'pdf') window.print();
    } finally {
      setIsExporting(null);
    }
  };

  const filteredReports = useMemo(() => {
    if (filter === 'all') return reports;
    return reports.filter(r => r.type === filter);
  }, [filter, reports]);

  const reportTypeLabel = (type?: string) => {
    if (!type) return 'GENERAL';
    switch (type.toLowerCase()) {
      case 'weekly': return t('competitors.weeklyReport') || 'تقرير أسبوعي';
      case 'comprehensive': return t('competitors.comprehensiveReport') || 'تقرير شامل';
      default: return String(type).toUpperCase();
    }
  };

  // Safe parsed data and insights
  const parsedData = useMemo(() => {
    if (!selectedReport?.data) return {};
    if (typeof selectedReport.data === 'string') {
      try { return JSON.parse(selectedReport.data); } catch { return {}; }
    }
    return selectedReport.data;
  }, [selectedReport]);

  const parsedInsights = useMemo(() => {
    if (!selectedReport?.insights) return {};
    if (typeof selectedReport.insights === 'string') {
      try { return JSON.parse(selectedReport.insights); } catch { return {}; }
    }
    return selectedReport.insights;
  }, [selectedReport]);

  const sections = useMemo(() => {
    const rawSec = parsedData?.sections;
    if (rawSec) return rawSec;

    // Fallback extraction
    const adsItems = Array.isArray(parsedData?.ads) ? parsedData.ads : [];
    const prodItems = Array.isArray(parsedData?.products) ? parsedData.products : [];
    const featItems = Array.isArray(parsedData?.features) ? parsedData.features : [];
    const socItems = Array.isArray(parsedData?.social) ? parsedData.social : [];
    const techItems = Array.isArray(parsedData?.tech) ? parsedData.tech : [];
    const priceItems = Array.isArray(parsedData?.priceChanges) ? parsedData.priceChanges : [];

    return {
      ads: { total: adsItems.length, items: adsItems, newCount: 0, activeCount: adsItems.length },
      products: { total: prodItems.length, items: prodItems, packagesCount: prodItems.filter((p: any) => p.category === 'باقة').length, packages: prodItems.filter((p: any) => p.category === 'باقة') },
      features: { total: featItems.length, items: featItems },
      social: { total: socItems.length, items: socItems },
      tech: { total: techItems.length, items: techItems, scannedAt: null },
      priceChanges: { total: priceItems.length, items: priceItems },
    };
  }, [parsedData]);

  const hasAnyData = useMemo(() => {
    return (
      (sections.ads?.total || 0) > 0 ||
      (sections.products?.total || 0) > 0 ||
      (sections.features?.total || 0) > 0 ||
      (sections.social?.total || 0) > 0 ||
      (sections.tech?.total || 0) > 0 ||
      (sections.priceChanges?.total || 0) > 0
    );
  }, [sections]);

  return (
    <div className="w-full min-h-screen bg-background text-foreground space-y-4 p-3 sm:p-5" dir={i18n.dir()}>
      {/* Top Command Bar */}
      <div className="bg-card border border-border/70 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/competitors')}
            className="p-2 rounded-lg border border-border/70 hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title={t('common.back')}
          >
            {i18n.dir() === 'rtl' ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-foreground">{t('competitors.reports')}</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold">
                DOSSIER ARCHIVE
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              أرشيف التقارير الدورية وتحليلات السوق وتغيرات الأسعار المسجلة للمنافسين
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          {/* Filter Pills */}
          <div className="flex items-center bg-muted/30 border border-border/70 rounded-lg p-0.5">
            {(['all', 'weekly', 'comprehensive'] as const).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  filter === f
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f === 'all' ? t('competitors.allReports') : f === 'weekly' ? t('competitors.weekly') : t('competitors.comprehensive')}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleGenerateAll}
            disabled={isGeneratingAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50"
            title="توليد وتحديث تقارير جميع المنافسين الآن"
          >
            <RefreshCw size={13} className={isGeneratingAll ? 'animate-spin' : ''} />
            <span>تحديث كل التقارير</span>
          </button>

          <button
            type="button"
            onClick={fetchReports}
            className="h-8 w-8 rounded-lg border border-border/70 bg-card hover:bg-muted/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title={t('common.refresh')}
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Single-Surface Dossier Chassis */}
      {isLoading ? (
        <div className="py-20 text-center font-mono text-xs text-muted-foreground">
          <RefreshCw size={24} className="animate-spin mx-auto text-primary mb-2" />
          جاري استرجاع تقارير المنافسين...
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border/70 rounded-xl bg-card space-y-3 p-6">
          <FileText size={32} className="mx-auto text-muted-foreground/40 mb-1" />
          <h3 className="text-sm font-bold text-foreground">{t('competitors.noReports')}</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            مفيش تقارير مسجلة حالياً — اضغط على زر التحديث لتوليد التقارير من بيانات الرادار
          </p>
          <button
            type="button"
            onClick={handleGenerateAll}
            disabled={isGeneratingAll}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium cursor-pointer"
          >
            <RefreshCw size={13} className={isGeneratingAll ? 'animate-spin' : ''} />
            <span>توليد تقارير المنافسين الآن</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Master List (4 Cols) */}
          <div className="lg:col-span-4 space-y-2">
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1">
              الملفات المرصودة ({filteredReports.length})
            </div>
            <div className="space-y-2 max-h-[calc(100vh-260px)] overflow-y-auto pr-0.5">
              {filteredReports.map(report => {
                const isSelected = selectedReport?.id === report.id;
                return (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20'
                        : 'border-border/70 bg-card hover:border-primary/40 hover:bg-muted/10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-muted/40 text-muted-foreground border border-border/50 uppercase">
                        {reportTypeLabel(report.type)}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {new Date(report.generatedAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <h3 className="font-semibold text-xs text-foreground line-clamp-1">
                      {report.title}
                    </h3>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40 text-xs">
                      <span className="text-[11px] text-muted-foreground truncate font-medium">
                        {report.competitor?.name || t('competitors.notAvailable')}
                      </span>
                      {report.competitor?.status && (
                        <CompetitorStatusBar
                          currentStatus={report.competitor.status}
                          competitorId={report.competitor.id}
                          onChange={(newStatus) => updateCompetitorStatus(report.competitor.id, newStatus)}
                          size="sm"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Detail Pane (8 Cols) */}
          <div className="lg:col-span-8">
            {selectedReport ? (
              <div className="bg-card border border-border/70 rounded-xl p-4 sm:p-5 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-border/70">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm sm:text-base font-bold text-foreground">{selectedReport.title}</h2>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {String(selectedReport.type || 'GENERAL').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground font-mono">
                      <span>{selectedReport.competitor?.name}</span>
                      <span>•</span>
                      <span>
                        {new Date(selectedReport.generatedAt).toLocaleString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRegenerateSingle(selectedReport.competitor?.id)}
                      disabled={isRegeneratingSingle}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/70 bg-card hover:bg-muted/30 text-xs font-medium text-foreground transition-colors cursor-pointer"
                      title="إعادة فحص وتوليد تقرير اليوم"
                    >
                      <RefreshCw size={13} className={isRegeneratingSingle ? 'animate-spin' : ''} />
                      <span>تحديث</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExport('csv')}
                      disabled={isExporting !== null}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/70 bg-card hover:bg-muted/30 text-xs font-medium text-foreground transition-colors cursor-pointer active:scale-[0.98]"
                      title="تصدير بيانات التقرير بتنسيق CSV (Excel)"
                    >
                      <Download size={13} className={isExporting === 'csv' ? 'animate-spin' : ''} />
                      <span>CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExport('pdf')}
                      disabled={isExporting !== null}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/70 bg-card hover:bg-muted/30 text-xs font-medium text-foreground transition-colors cursor-pointer active:scale-[0.98]"
                      title="تصدير التقرير الرسمي بتنسيق PDF"
                    >
                      <FileText size={13} className={isExporting === 'pdf' ? 'animate-spin' : ''} />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>

                {/* Executive Summary Line */}
                {selectedReport.summary && (
                  <div className="rounded-lg bg-primary/5 border border-primary/20 p-3.5 space-y-1">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
                      {t('competitors.summary')}
                    </div>
                    <p className="text-xs text-foreground font-semibold leading-relaxed">
                      {selectedReport.summary}
                    </p>
                  </div>
                )}

                {/* Metric Insights Grid (Safe against missing/empty insights) */}
                {parsedInsights && Object.keys(parsedInsights).length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <TrendingUp size={13} className="text-primary" />
                      <span>{t('competitors.insights')}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {Object.entries(parsedInsights).map(([key, value]) => (
                        <div key={key} className="bg-muted/15 border border-border/60 rounded-lg p-2.5 sm:p-3">
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono truncate">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                          <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-foreground mt-0.5">
                            {String(value)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Structured Sections View */}
                {!hasAnyData ? (
                  <div className="py-8 text-center border border-dashed border-border/70 rounded-xl bg-card space-y-3 p-6">
                    <AlertCircle className="mx-auto text-amber-500 h-8 w-8" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-foreground">مفيش بيانات كافية — شغّل تحديث</h4>
                      <p className="text-xs text-muted-foreground">لم يتم ربط أو استخراج بيانات إعلانات أو باقات كافية لهذا المنافس</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRegenerateSingle(selectedReport.competitor?.id)}
                      disabled={isRegeneratingSingle}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium cursor-pointer"
                    >
                      <RefreshCw size={12} className={isRegeneratingSingle ? 'animate-spin' : ''} />
                      <span>توليد تقرير محدّث</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2 border-t border-border/60">
                    {/* Section Switcher Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/50 text-xs">
                      <button
                        type="button"
                        onClick={() => setActiveSection('all')}
                        className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap cursor-pointer transition-colors ${
                          activeSection === 'all'
                            ? 'bg-muted text-foreground font-bold'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        كل الأقسام
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSection('ads')}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-medium whitespace-nowrap cursor-pointer transition-colors ${
                          activeSection === 'ads'
                            ? 'bg-muted text-foreground font-bold'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Megaphone size={12} />
                        <span>الإعلانات ({sections.ads?.total || 0})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSection('products')}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-medium whitespace-nowrap cursor-pointer transition-colors ${
                          activeSection === 'products'
                            ? 'bg-muted text-foreground font-bold'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Package size={12} />
                        <span>الباقات والمنتجات ({sections.products?.total || 0})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSection('features')}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-medium whitespace-nowrap cursor-pointer transition-colors ${
                          activeSection === 'features'
                            ? 'bg-muted text-foreground font-bold'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Award size={12} />
                        <span>المزايا ({sections.features?.total || 0})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSection('social')}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-medium whitespace-nowrap cursor-pointer transition-colors ${
                          activeSection === 'social'
                            ? 'bg-muted text-foreground font-bold'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Share2 size={12} />
                        <span>السوشيال ({sections.social?.total || 0})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSection('tech')}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-medium whitespace-nowrap cursor-pointer transition-colors ${
                          activeSection === 'tech'
                            ? 'bg-muted text-foreground font-bold'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Cpu size={12} />
                        <span>التقنيات ({sections.tech?.total || 0})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSection('priceChanges')}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-medium whitespace-nowrap cursor-pointer transition-colors ${
                          activeSection === 'priceChanges'
                            ? 'bg-muted text-foreground font-bold'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <History size={12} />
                        <span>تغيرات الأسعار ({sections.priceChanges?.total || 0})</span>
                      </button>
                    </div>

                    {/* 1. Ads Section */}
                    {(activeSection === 'all' || activeSection === 'ads') && (
                      <div className="space-y-2 p-3 bg-muted/10 rounded-xl border border-border/50">
                        <div className="flex items-center justify-between text-xs font-bold text-foreground">
                          <span className="flex items-center gap-1.5">
                            <Megaphone size={13} className="text-primary" />
                            <span>الإعلانات المرصودة ({sections.ads?.total || 0})</span>
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {sections.ads?.newCount || 0} جديد · {sections.ads?.activeCount || 0} نشط
                          </span>
                        </div>
                        {(!sections.ads?.items || sections.ads.items.length === 0) ? (
                          <p className="text-xs text-muted-foreground py-2 text-center">لا توجد إعلانات مسجلة</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                            {sections.ads.items.map((ad: any, i: number) => (
                              <div key={ad.id || i} className="p-3 bg-card border border-border/60 rounded-lg text-xs space-y-1.5">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                                    {ad.platform || 'facebook'}
                                  </span>
                                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                                    ad.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-muted text-muted-foreground'
                                  }`}>
                                    {ad.status === 'active' ? 'نشط' : 'متوقف'}
                                  </span>
                                </div>
                                <p className="text-xs text-foreground line-clamp-3 leading-relaxed font-sans">
                                  {ad.copy || ad.headline || 'بدون نص إعلاني'}
                                </p>
                                {ad.cta && (
                                  <div className="text-[10px] font-medium text-primary">
                                    زر الإجراء: {ad.cta}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 2. Products & Packages Section */}
                    {(activeSection === 'all' || activeSection === 'products') && (
                      <div className="space-y-2 p-3 bg-muted/10 rounded-xl border border-border/50">
                        <div className="flex items-center justify-between text-xs font-bold text-foreground">
                          <span className="flex items-center gap-1.5">
                            <Package size={13} className="text-primary" />
                            <span>الباقات والمنتجات ({sections.products?.total || 0})</span>
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {sections.products?.packagesCount || 0} باقة
                          </span>
                        </div>
                        {(!sections.products?.items || sections.products.items.length === 0) ? (
                          <p className="text-xs text-muted-foreground py-2 text-center">لا توجد منتجات أو باقات مسجلة</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
                            {sections.products.items.map((prod: any, i: number) => (
                              <div key={prod.id || i} className="p-3 bg-card border border-border/60 rounded-lg text-xs space-y-1">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-semibold text-foreground line-clamp-1">{prod.name}</span>
                                  {prod.category === 'باقة' && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                                      باقة
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm font-bold font-mono text-primary tabular-nums">
                                  {prod.price ? `${prod.price} ${prod.currency || 'EGP'}` : 'غير محدد'}
                                </div>
                                {prod.description && (
                                  <p className="text-[11px] text-muted-foreground line-clamp-2">
                                    {prod.description}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 3. Features Section */}
                    {(activeSection === 'all' || activeSection === 'features') && (
                      <div className="space-y-2 p-3 bg-muted/10 rounded-xl border border-border/50">
                        <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <Award size={13} className="text-primary" />
                          <span>المزايا التنافسية المسجلة ({sections.features?.total || 0})</span>
                        </div>
                        {(!sections.features?.items || sections.features.items.length === 0) ? (
                          <p className="text-xs text-muted-foreground py-2 text-center">لا توجد مزايا مسجلة</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                            {sections.features.items.map((feat: any, i: number) => (
                              <div key={feat.id || i} className="p-2.5 bg-card border border-border/60 rounded-lg text-xs space-y-1">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-semibold text-foreground">{feat.title}</span>
                                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                                    {feat.priority || 'medium'}
                                  </span>
                                </div>
                                {feat.description && (
                                  <p className="text-[11px] text-muted-foreground line-clamp-2">
                                    {feat.description}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 4. Social & Tech Stack Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(activeSection === 'all' || activeSection === 'social') && (
                        <div className="space-y-2 p-3 bg-muted/10 rounded-xl border border-border/50">
                          <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <Share2 size={13} className="text-primary" />
                            <span>بروفايلات السوشيال ({sections.social?.total || 0})</span>
                          </div>
                          {(!sections.social?.items || sections.social.items.length === 0) ? (
                            <p className="text-xs text-muted-foreground py-2 text-center">لا توجد روابط تواصل</p>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {sections.social.items.map((soc: any, i: number) => (
                                <a
                                  key={soc.id || i}
                                  href={soc.profileUrl || '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card border border-border/60 text-xs font-medium text-foreground hover:border-primary transition-colors"
                                >
                                  <span className="capitalize">{soc.platform}</span>
                                  <ExternalLink size={10} className="text-muted-foreground" />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {(activeSection === 'all' || activeSection === 'tech') && (
                        <div className="space-y-2 p-3 bg-muted/10 rounded-xl border border-border/50">
                          <div className="flex items-center justify-between text-xs font-bold text-foreground">
                            <span className="flex items-center gap-1.5">
                              <Cpu size={13} className="text-primary" />
                              <span>التقنيات المرصودة ({sections.tech?.total || 0})</span>
                            </span>
                            {sections.tech?.scannedAt && (
                              <span className="text-[10px] font-mono text-muted-foreground">
                                فحص {sections.tech.scannedAt}
                              </span>
                            )}
                          </div>
                          {(!sections.tech?.items || sections.tech.items.length === 0) ? (
                            <p className="text-xs text-muted-foreground py-2 text-center">لا توجد تقنيات مكتشفة</p>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {sections.tech.items.map((tech: string, i: number) => (
                                <span
                                  key={i}
                                  className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-card border border-border/60 text-foreground"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 5. Price Changes Section */}
                    {(activeSection === 'all' || activeSection === 'priceChanges') && (
                      <div className="space-y-2 p-3 bg-muted/10 rounded-xl border border-border/50">
                        <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <History size={13} className="text-primary" />
                          <span>سجل تغيّر الأسعار ({sections.priceChanges?.total || 0})</span>
                        </div>
                        {(!sections.priceChanges?.items || sections.priceChanges.items.length === 0) ? (
                          <p className="text-xs text-muted-foreground py-2 text-center">لا توجد تغيرات أسعار مسجلة في هذه الفترة</p>
                        ) : (
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {sections.priceChanges.items.map((change: any, i: number) => (
                              <div key={i} className="p-2.5 bg-card border border-border/60 rounded-lg text-xs flex items-center justify-between">
                                <span className="font-semibold text-foreground">{change.productName}</span>
                                <span className="font-mono text-primary font-bold">
                                  {change.currentPrice} {change.currency || 'EGP'} ({change.changeCount} تغييرات)
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex items-center justify-center border border-dashed border-border/70 rounded-xl bg-card text-center p-6">
                <div>
                  <Eye size={32} className="mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-xs text-muted-foreground">{t('competitors.selectReportToView')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
