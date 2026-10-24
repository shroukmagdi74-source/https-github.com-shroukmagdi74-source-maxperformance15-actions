/** @vitest-environment jsdom */

import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import StorePages from '../StorePages';

const mockApiPost = vi.fn();
const mockApiPut = vi.fn();
const mockApiPatch = vi.fn();
const mockApiDelete = vi.fn();

vi.mock('../../../services/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: (...args: unknown[]) => mockApiPost(...args),
    put: (...args: unknown[]) => mockApiPut(...args),
    patch: (...args: unknown[]) => mockApiPatch(...args),
    delete: (...args: unknown[]) => mockApiDelete(...args),
  },
}));

vi.mock('../../../hooks/useAuthSimple', () => ({
  useAuth: () => ({
    user: {
      id: 'user-1',
      companyId: 'company-123',
      company: {
        id: 'company-123',
        slug: 'test-store',
        name: 'Test Store',
      },
    },
  }),
}));

vi.mock('../../../components/RichTextEditor', () => ({
  default: ({
    value,
    onChange,
    placeholder,
  }: {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
  }) => (
    <textarea
      data-testid="mock-rich-text-editor"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

const mockTranslate = (key: string, options?: any) => {
  const translations: Record<string, string> = {
    'storePages.pageTitle': 'صفحات المتجر',
    'storePages.pageSubtitle': 'إدارة صفحات المتجر الثابتة وسياسات الشراء',
    'storePages.generatePolicies': 'إنشاء سياسات افتراضية',
    'storePages.createCustomPage': 'صفحة جديدة',
    'storePages.noPagesTitle': 'لا توجد صفحات منشأة حالياً',
    'storePages.noPagesDesc': 'ابدأ بإنشاء صفحات الشروط والسياسات لمتجرك.',
    'storePages.policyPrivacy': 'سياسة الخصوصية',
    'storePages.policyReturn': 'سياسة الاستبدال والاسترجاع',
    'storePages.policyTerms': 'الشروط والأحكام',
    'storePages.custom': 'صفحة مخصصة',
    'storePages.footerTag': 'فوتر',
    'storePages.deactivateButton': 'تعطيل الصفحة',
    'storePages.activateButton': 'تفعيل الصفحة',
    'storePages.editButton': 'تعديل',
    'storePages.deleteButton': 'حذف',
    'storePages.modalCreateTitle': 'إنشاء صفحة جديدة',
    'storePages.modalEditTitle': 'تعديل الصفحة',
    'storePages.formTitle': 'عنوان الصفحة',
    'storePages.formTitlePlaceholder': 'مثال: سياسة الخصوصية',
    'storePages.formPageType': 'نوع الصفحة',
    'storePages.formSlug': 'رابط الصفحة (Slug)',
    'storePages.formSlugPrefix': '/pages/',
    'storePages.formContent': 'محتوى الصفحة',
    'storePages.formSeoTitle': 'تحسين محركات البحث (SEO)',
    'storePages.formMetaTitle': 'عنوان الميتا (Meta Title)',
    'storePages.formMetaDescription': 'وصف الميتا (Meta Description)',
    'storePages.formPublishStatus': 'حالة النشر',
    'storePages.formPublishDesc': 'ظهور الصفحة لزوار المتجر',
    'storePages.formFooter': 'الظهور في أسفل المتجر (الفوتر)',
    'storePages.formFooterDesc': 'إضافة رابط الصفحة في فوتر الموقع',
    'storePages.formSubmitCreate': 'حفظ ونشر',
    'storePages.formSubmitUpdate': 'تحديث الصفحة',
    'storePages.formCancel': 'إلغاء',
    'storePages.deleteConfirm': 'هل أنت متأكد من حذف هذه الصفحة؟',
  };
  if (key === 'storePages.viewPageWithSlug') {
    return `عرض الصفحة /${options?.slug}`;
  }
  return translations[key] || key;
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockTranslate,
  }),
}));

const mockPages = [
  {
    id: 'page-1',
    title: 'سياسة الخصوصية',
    slug: 'privacy-policy',
    content: '<p>نحن نحترم خصوصيتك</p>',
    pageType: 'PRIVACY',
    isActive: true,
    showInFooter: true,
    showInMenu: false,
    order: 1,
    metaTitle: 'سياسة الخصوصية - متجرنا',
    metaDescription: 'تعرف على سياسة الخصوصية الخاصة بمتجرنا',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'page-2',
    title: 'سياسة الاستبدال والاسترجاع',
    slug: 'return-policy',
    content: '<p>يمكنك استرجاع المنتجات خلال 14 يوم</p>',
    pageType: 'RETURN',
    isActive: false,
    showInFooter: true,
    showInMenu: false,
    order: 2,
    metaTitle: 'سياسة الاسترجاع',
    metaDescription: 'شروط واسترجاع البضائع',
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
  },
];

describe('StorePages Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiPost.mockImplementation((url: string) => {
      if (typeof url === 'string' && url.includes('/store-pages/list')) {
        return Promise.resolve({
          data: { success: true, data: mockPages },
        });
      }
      return Promise.resolve({
        data: { success: true, data: [] },
      });
    });
    mockApiPut.mockResolvedValue({ data: { success: true } });
    mockApiPatch.mockResolvedValue({ data: { success: true } });
    mockApiDelete.mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders store pages list, metrics, and cards correctly', async () => {
    render(<StorePages />);

    await waitFor(() => {
      expect(screen.getByText('صفحات المتجر')).toBeInTheDocument();
    });

    expect(screen.getByText('سياسة الخصوصية')).toBeInTheDocument();
    expect(screen.getByText('سياسة الاستبدال والاسترجاع')).toBeInTheDocument();
    expect(screen.getByText('/privacy-policy')).toBeInTheDocument();
    expect(screen.getByText('/return-policy')).toBeInTheDocument();

    // Check metrics
    expect(screen.getByText('إجمالي الصفحات')).toBeInTheDocument();
    expect(screen.getByText('الصفحات النشطة')).toBeInTheDocument();
  });

  it('renders empty state when there are no pages and allows generating policies', async () => {
    mockApiPost.mockImplementation((url: string) => {
      if (typeof url === 'string' && url.includes('/store-pages/list')) {
        return Promise.resolve({
          data: { success: true, data: [] },
        });
      }
      return Promise.resolve({
        data: { success: true },
      });
    });

    render(<StorePages />);

    await waitFor(() => {
      expect(screen.getByText('لا توجد صفحات منشأة حالياً')).toBeInTheDocument();
    });

    const initBtn = screen.getAllByText('إنشاء سياسات افتراضية')[0];
    fireEvent.click(initBtn);

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith(
        '/store-pages/initialize',
        expect.objectContaining({ companyId: 'company-123' }),
      );
    });
  });

  it('opens create modal, fills fields, and submits new page', async () => {
    render(<StorePages />);

    await waitFor(() => {
      expect(screen.getByText('صفحة جديدة')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('صفحة جديدة'));

    expect(screen.getByText('إنشاء صفحة جديدة')).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText('مثال: سياسة الخصوصية');
    fireEvent.change(titleInput, { target: { value: 'من نحن' } });

    const slugInput = screen.getByPlaceholderText('privacy-policy');
    fireEvent.change(slugInput, { target: { value: 'about-us' } });

    const contentInput = screen.getByTestId('mock-rich-text-editor');
    fireEvent.change(contentInput, { target: { value: '<p>قصتنا</p>' } });

    const submitBtn = screen.getByText('حفظ ونشر');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith(
        '/store-pages/',
        expect.objectContaining({
          title: 'من نحن',
          slug: 'about-us',
          companyId: 'company-123',
        }),
      );
    });
  });

  it('toggles page active status', async () => {
    render(<StorePages />);

    await waitFor(() => {
      expect(screen.getByText('سياسة الخصوصية')).toBeInTheDocument();
    });

    const deactivateBtn = screen.getByTitle('تعطيل الصفحة');
    fireEvent.click(deactivateBtn);

    await waitFor(() => {
      expect(mockApiPatch).toHaveBeenCalledWith(
        '/store-pages/page/page-1/toggle',
        expect.objectContaining({ companyId: 'company-123' }),
      );
    });
  });

  it('deletes a page when confirmed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<StorePages />);

    await waitFor(() => {
      expect(screen.getByText('سياسة الخصوصية')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('حذف');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockApiDelete).toHaveBeenCalledWith(
        '/store-pages/page/page-1',
        expect.objectContaining({
          data: { companyId: 'company-123' },
        }),
      );
    });
  });
});
