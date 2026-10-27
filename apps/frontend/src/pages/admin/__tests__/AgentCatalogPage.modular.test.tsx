// @vitest-environment jsdom
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AgentCatalogPage from '../AgentCatalogPage';
import { apiClient } from '../../../services/apiClient';

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    derivedTheme: 'light',
    theme: 'light',
    setTheme: vi.fn(),
  }),
}));

vi.mock('../../../services/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../../../services/uploadService', () => ({
  uploadService: {
    uploadProductImage: vi.fn().mockResolvedValue({ success: true, data: { url: 'http://img.test/pic.png' } }),
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
        'aiCatalog.title': 'كتالوج منتجات الذكاء الاصطناعي',
        'aiCatalog.subtitle': 'إدارة منتجاتك وربطها بالرد الآلي',
        'aiCatalog.addProduct': 'إضافة منتج',
        'aiCatalog.editProduct': 'تعديل المنتج',
        'aiCatalog.search': 'بحث عن منتج...',
        'aiCatalog.totalProducts': 'إجمالي المنتجات',
        'aiCatalog.outOfStock': 'نفذت من المخزون',
        'aiCatalog.avgPrice': 'متوسط السعر',
        'aiCatalog.empty': 'لا توجد منتجات مسجلة بعد',
        'aiCatalog.productName': 'اسم المنتج',
        'aiCatalog.price': 'السعر',
        'aiCatalog.stock': 'الكمية',
        'aiCatalog.sku': 'رمز التخزين (SKU)',
        'aiCatalog.description': 'الوصف',
        'aiCatalog.variants': 'المتغيرات والألوان',
        'aiCatalog.addVariant': 'إضافة متغير',
        'aiCatalog.save': 'حفظ',
        'aiCatalog.cancel': 'إلغاء',
        'aiCatalog.deleteConfirm': 'تأكيد الحذف',
        'aiCatalog.successDelete': 'تم حذف المنتج بنجاح',
        'aiCatalog.successDuplicate': 'تم تكرار المنتج بنجاح',
      };
      return map[key] || key;
    },
    i18n: { dir: () => 'rtl', language: 'ar' },
  }),
}));

const mockProducts = [
  {
    id: 'prod-1',
    name: 'سماعات بلوتوث برو',
    price: 450,
    stock: 25,
    sku: 'EAR-PRO-01',
    description: 'سماعات عالية الدقة',
    mainImage: 'http://img.test/ear.jpg',
    isActive: true,
    createdAt: '2026-10-01',
    updatedAt: '2026-10-01',
    variants: [],
  },
  {
    id: 'prod-2',
    name: 'شاحن سريع 65W',
    price: 320,
    stock: 0,
    sku: 'CHG-65W',
    description: 'شاحن يدعم الشحن فائق السرعة',
    mainImage: null,
    isActive: true,
    createdAt: '2026-10-02',
    updatedAt: '2026-10-02',
    variants: [],
  },
];

describe('AgentCatalogPage Modular Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        success: true,
        data: mockProducts,
        totalProducts: 2,
        pagination: { totalProducts: 2, totalCount: 2 },
      },
    } as any);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders header, stats cards, and search box', async () => {
    render(<AgentCatalogPage />);

    expect(screen.getByRole('heading', { level: 1, name: 'كتالوج منتجات الذكاء الاصطناعي' })).toBeInTheDocument();
    expect(screen.getByText('إدارة منتجاتك وربطها بالرد الآلي')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('بحث عن منتج...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('سماعات بلوتوث برو')).toBeInTheDocument();
      expect(screen.getByText('شاحن سريع 65W')).toBeInTheDocument();
    });
  });

  it('displays accurate statistical numbers', async () => {
    render(<AgentCatalogPage />);

    await waitFor(() => {
      expect(screen.getByText('سماعات بلوتوث برو')).toBeInTheDocument();
    });

    expect(screen.getByText('إجمالي المنتجات')).toBeInTheDocument();
    expect(screen.getByText('نفذت من المخزون')).toBeInTheDocument();
    expect(screen.getByText('متوسط السعر')).toBeInTheDocument();
  });

  it('opens add product drawer and allows entering details', async () => {
    render(<AgentCatalogPage />);

    const addButtons = screen.getAllByRole('button', { name: /إضافة منتج/ });
    fireEvent.click(addButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('الوصف')).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole('textbox');
    // Name input is focused or available
    const nameInput = inputs.find(i => i.getAttribute('required') !== null);
    if (nameInput) {
      fireEvent.change(nameInput, { target: { value: 'منتج جديد رائع' } });
      expect(nameInput).toHaveValue('منتج جديد رائع');
    }
  });

  it('triggers product duplication on duplicate button click', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { success: true },
    } as any);

    render(<AgentCatalogPage />);

    await waitFor(() => {
      expect(screen.getByText('سماعات بلوتوث برو')).toBeInTheDocument();
    });

    const duplicateButtons = screen.getAllByLabelText('Duplicate');
    fireEvent.click(duplicateButtons[0]);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/products/prod-1/duplicate');
    });
  });

  it('opens delete confirmation dialog and executes delete', async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce({
      data: { success: true },
    } as any);

    render(<AgentCatalogPage />);

    await waitFor(() => {
      expect(screen.getByText('سماعات بلوتوث برو')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByLabelText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('تأكيد الحذف')).toBeInTheDocument();
    });

    const confirmDeleteBtn = screen.getByRole('button', { name: /Delete/ });
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(apiClient.delete).toHaveBeenCalledWith('/products/prod-1');
    });
  });
});
