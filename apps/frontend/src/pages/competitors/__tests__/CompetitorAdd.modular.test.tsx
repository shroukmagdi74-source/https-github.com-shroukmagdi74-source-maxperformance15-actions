/** @vitest-environment jsdom */
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CompetitorAdd from '../CompetitorAdd';
import { apiClient } from '../../../services/apiClient';

vi.mock('../../../services/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'competitors.addCompetitor': 'إضافة منافس',
        'competitors.editCompetitor': 'تعديل منافس',
        'competitors.generalInfo': 'المعلومات العامة',
        'competitors.mediaAnalysis': 'تحليل الميديا',
        'competitors.strengthsWeaknesses': 'القوة والضعف',
        'competitors.pricing': 'الأسعار',
        'competitors.competitorName': 'اسم المنافس',
        'competitors.competitorUrl': 'رابط الموقع',
        'competitors.platform': 'المنصة',
        'competitors.activityType': 'نوع النشاط',
        'competitors.targetMarket': 'السوق المستهدف',
        'competitors.foundedYear': 'سنة التأسيس',
        'competitors.founderName': 'اسم المؤسس',
        'competitors.founderLink': 'رابط المؤسس',
        'competitors.location': 'الموقع الجغرافي',
        'competitors.country': 'الدولة',
        'competitors.city': 'المدينة',
        'competitors.socialLinks': 'روابط التواصل الاجتماعي',
        'competitors.referenceImages': 'الصور المرجعية',
        'competitors.activityTypeImages': 'صور نوع النشاط',
        'competitors.featureReferenceImages': 'صور مرجعية للمميزات',
        'competitors.trafficSource': 'مصدر الزيارات',
        'competitors.mediaNotes': 'ملاحظات تحليل الميديا',
        'competitors.organic': 'أورجانيك',
        'competitors.paid': 'إعلانات ممولة',
        'competitors.both': 'كلاهما',
        'competitors.strengths': 'نقاط القوة',
        'competitors.weaknesses': 'نقاط الضعف',
        'competitors.comparisonSection': 'قسم المقارنات',
        'competitors.featureName': 'اسم الميزة',
        'competitors.devIdeas': 'أفكار ومقترحات تطويرية',
        'competitors.ideaTitle': 'عنوان الفكرة',
        'competitors.monthlyPrice': 'السعر الشهري',
        'competitors.yearlyPrice': 'السعر السنوي',
        'competitors.pricingNotes': 'ملاحظات الأسعار',
        'common.cancel': 'إلغاء',
        'common.save': 'حفظ',
        'common.create': 'إنشاء',
        'common.saving': 'جاري الحفظ...',
        'common.add': 'إضافة',
      };
      return map[key] || '';
    },
    i18n: { dir: () => 'rtl', language: 'ar' },
  }),
}));

vi.mock('../../../i18n', () => ({
  __esModule: true,
  default: { dir: () => 'rtl', language: 'ar' },
}));

const renderWithRouter = (initialRoute = '/competitors/new') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/competitors/new" element={<CompetitorAdd />} />
        <Route path="/competitors/:id/edit" element={<CompetitorAdd />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('CompetitorAdd Modular Component Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders add competitor screen with tabs and basic data fields', () => {
    renderWithRouter();

    expect(screen.getAllByText('إضافة منافس')[0]).toBeInTheDocument();
    expect(screen.getByText('المعلومات العامة')).toBeInTheDocument();
    expect(screen.getByText('تحليل الميديا')).toBeInTheDocument();
    expect(screen.getByText('القوة والضعف')).toBeInTheDocument();
    expect(screen.getByText('الأسعار')).toBeInTheDocument();
    expect(screen.getByText(/اسم المنافس/)).toBeInTheDocument();
  });

  it('validates required fields on submission', async () => {
    renderWithRouter();

    const submitBtn = screen.getByText('إنشاء');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(apiClient.post).not.toHaveBeenCalled();
    });
  });

  it('allows filling general form inputs and switching tabs', async () => {
    renderWithRouter();

    // Type competitor name
    const inputs = screen.getAllByRole('textbox');
    const nameInput = inputs[0]; // first text input is competitor name
    fireEvent.change(nameInput, { target: { value: 'Shopify Store Alpha' } });
    expect(nameInput).toHaveValue('Shopify Store Alpha');

    // Switch to Pricing tab
    const pricingTab = screen.getByText('الأسعار');
    fireEvent.click(pricingTab);

    // Verify pricing inputs appear
    expect(screen.getByText('السعر الأساسي / الباقة')).toBeInTheDocument();
    expect(screen.getByText('دورة التسعير')).toBeInTheDocument();
  });

  it('navigates to media tab and adds a media note', async () => {
    renderWithRouter();

    const mediaTab = screen.getByText('تحليل الميديا');
    fireEvent.click(mediaTab);

    expect(screen.getByText('مصدر الزيارات')).toBeInTheDocument();
    expect(screen.getByText('ملاحظات تحليل الميديا')).toBeInTheDocument();

    const noteTextarea = screen.getByPlaceholderText('أضف ملاحظة...');
    fireEvent.change(noteTextarea, { target: { value: 'Active on TikTok Ads with high conversion' } });

    const addButtons = screen.getAllByRole('button');
    const addNoteBtn = addButtons.find(b => b.getAttribute('aria-label') === 'Add note');
    if (addNoteBtn) {
      fireEvent.click(addNoteBtn);
      expect(screen.getByText('Active on TikTok Ads with high conversion')).toBeInTheDocument();
    }
  });

  it('navigates to features/comparison tab and adds comparison and dev idea', async () => {
    renderWithRouter();

    const featuresTab = screen.getByText('القوة والضعف');
    fireEvent.click(featuresTab);

    expect(screen.getByText('نقاط القوة')).toBeInTheDocument();
    expect(screen.getByText('نقاط الضعف')).toBeInTheDocument();
    expect(screen.getByText('قسم المقارنات')).toBeInTheDocument();
    expect(screen.getByText('أفكار ومقترحات تطويرية')).toBeInTheDocument();

    const addButtons = screen.getAllByRole('button', { name: /إضافة/ });
    expect(addButtons.length).toBeGreaterThanOrEqual(2);
    // Click Add Comparison
    fireEvent.click(addButtons[0]);
    expect(screen.getByText('اسم الميزة')).toBeInTheDocument();

    // Click Add Dev Idea
    fireEvent.click(addButtons[1]);
    expect(screen.getByText('عنوان الفكرة')).toBeInTheDocument();
  });

  it('submits valid competitor payload to api client', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { success: true, data: { id: 'comp_123' } },
    } as any);

    renderWithRouter();

    const inputs = screen.getAllByRole('textbox');
    const nameInput = inputs[0];
    fireEvent.change(nameInput, { target: { value: 'Brand X' } });

    const submitBtn = screen.getByText('إنشاء');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith(
        '/competitors',
        expect.objectContaining({
          name: 'Brand X',
        })
      );
    });
  });
});
